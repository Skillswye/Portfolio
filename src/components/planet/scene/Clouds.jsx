import React, { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Color, MathUtils } from 'three'
import { noiseGLSL } from '../lib/noise.glsl.js'
import { probit } from '../lib/noise.js'
import { SCENE } from '../palette.js'

// Cloud fbm is 5 octaves: σ ≈ 0.19 × 1.155 → normalise by 0.22 so the
// Clouds slider maps to coverage the same way Ocean does (30% → ~31% measured).
const CLOUD_NORM = 0.22
const CLOUD_OCTAVES = 5
const CLOUD_SCALE = 3.3
// Clouds drift a little faster than the ground, plus a slow base drift.
const CLOUD_SPIN_RATIO = 1.25
const CLOUD_BASE_SPIN = 0.6 // °/s

const vertexShader = /* glsl */ `
varying vec3 vObj;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
void main() {
  vObj = normalize(position);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */ `
${noiseGLSL}
uniform float uThreshold;
uniform vec3 uColor;
varying vec3 vObj;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
void main() {
  // Slight latitude stretch gives the clouds a banded, wind-blown read.
  vec3 p = vObj * vec3(${CLOUD_SCALE.toFixed(2)}, ${(CLOUD_SCALE * 1.5).toFixed(2)}, ${CLOUD_SCALE.toFixed(2)});
  float m = fbm(p, ${CLOUD_OCTAVES}, 500u) /${CLOUD_NORM.toFixed(3)} - uThreshold;
  if (m < 0.0) discard; // alpha-test cut-out

  // Evenly lit like the surface: no night side, just a soft falloff toward
  // the limb (same headlight idea) and slightly darker thin edges.
  float ndv = clamp(dot(normalize(vWorldNormal), normalize(cameraPosition - vWorldPos)), 0.0, 1.0);
  float lit = 0.72 + 0.28 * ndv;
  float edge = 0.86 + 0.14 * smoothstep(0.0, 0.5, m);
  gl_FragColor = vec4(uColor * lit * edge, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

export default function Clouds({ seed, coverage, relief, spin, animate }) {
  const ref = useRef()
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uSeed: { value: 0 },
          uThreshold: { value: 0 },
          uColor: { value: new Color(SCENE.cloud) },
        },
      }),
    []
  )
  useEffect(() => () => material.dispose(), [material])

  material.uniforms.uSeed.value = seed >>> 0
  material.uniforms.uThreshold.value = probit(1 - coverage)

  useFrame((_, dt) => {
    if (animate && ref.current) {
      ref.current.rotation.y +=
        MathUtils.degToRad(spin * CLOUD_SPIN_RATIO + CLOUD_BASE_SPIN) * Math.min(dt, 0.1)
    }
  })

  const radius = 1 + relief * 1.3 + 0.04
  if (coverage <= 0) return null

  return (
    <mesh ref={ref} scale={radius} material={material}>
      <sphereGeometry args={[1, 96, 64]} />
    </mesh>
  )
}

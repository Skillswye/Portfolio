import React, { useEffect, useMemo } from 'react'
import { ShaderMaterial, Color, BackSide, AdditiveBlending } from 'three'
import { SCENE } from '../palette.js'

const vertexShader = /* glsl */ `
varying vec3 vViewNormal;
varying vec3 vViewPos;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewPos = mv.xyz;
  vViewNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mv;
}
`

// Rendered on the back faces of the shell. Seen from outside, a back-face
// normal's dot with the view ray runs from -k (just past the planet's limb)
// to 0 (outer edge of the shell), where k = sqrt(1 - (1/R)^2) for shell
// radius R. Remap that to 1 → 0 so the glow hugs the limb and fades out.
const fragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uLimb;
uniform float uStrength;
varying vec3 vViewNormal;
varying vec3 vViewPos;
void main() {
  vec3 viewDir = normalize(-vViewPos);
  float d = dot(normalize(vViewNormal), viewDir);
  float t = clamp(-d / uLimb, 0.0, 1.0);
  float glow = t * t * (3.0 - 2.0 * t);
  glow *= glow;
  // Even rim all the way round — the planet has no day / night side.
  gl_FragColor = vec4(uColor * glow * uStrength, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

export default function Atmosphere({ relief }) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: BackSide,
        blending: AdditiveBlending,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uColor: { value: new Color(SCENE.atmosphere) },
          uLimb: { value: 0.5 },
          uStrength: { value: 0.85 },
        },
      }),
    []
  )
  useEffect(() => () => material.dispose(), [material])

  const radius = 1 + relief * 1.3 + 0.13
  material.uniforms.uLimb.value = Math.sqrt(1 - 1 / (radius * radius))

  return (
    <mesh scale={radius} material={material} renderOrder={2}>
      <sphereGeometry args={[1, 96, 64]} />
    </mesh>
  )
}

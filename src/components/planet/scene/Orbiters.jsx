import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { IcosahedronGeometry, BufferAttribute, Color } from 'three'
import { createNoise } from '../lib/noise.js'
import { SCENE } from '../palette.js'

const TAU = Math.PI * 2

/**
 * Circular orbit around the planet's centre. The child sits at +Z and moves
 * toward +X, so models are built nose-along-X, up-along-Z (radial).
 * Angular speed is 2π / period per second × real delta — frame-rate independent.
 */
function Orbit({ radius, period, tilt, phase = 0, animate, children }) {
  const spin = useRef()
  useLayoutEffect(() => {
    spin.current.rotation.y = phase
  }, [phase])
  useFrame((_, dt) => {
    if (animate) spin.current.rotation.y += (TAU / period) * Math.min(dt, 0.1)
  })
  return (
    <group rotation={[tilt[0], 0, tilt[1]]}>
      <group ref={spin}>
        <group position={[0, 0, radius]}>{children}</group>
      </group>
    </group>
  )
}

// ---------- Moon: low-poly, flat-shaded, noise-banded greys ----------

function useMoonGeometry(seed) {
  const geometry = useMemo(() => {
    const g = new IcosahedronGeometry(0.17, 2) // non-indexed: 3 verts per face
    const { gn, fbm } = createNoise(seed ^ 0x5bd1e995)
    const pos = g.getAttribute('position')
    const colors = new Float32Array(pos.count * 3)
    const shades = SCENE.moonShades.map((h) => new Color(h))
    for (let f = 0; f < pos.count; f += 3) {
      let cx = 0
      let cy = 0
      let cz = 0
      for (let k = 0; k < 3; k++) {
        cx += pos.getX(f + k)
        cy += pos.getY(f + k)
        cz += pos.getZ(f + k)
      }
      const l = Math.hypot(cx, cy, cz)
      cx /= l
      cy /= l
      cz /= l
      const v = fbm(cx * 3, cy * 3, cz * 3, 3, 600) / 0.215 + gn(cx * 9, cy * 9, cz * 9, 640) * 1.5
      // base · light highlands · dark maria · bright ejecta
      const s = v < -0.7 ? shades[2] : v < 0.25 ? shades[0] : v < 1.1 ? shades[1] : shades[3]
      for (let k = 0; k < 3; k++) {
        colors[(f + k) * 3] = s.r
        colors[(f + k) * 3 + 1] = s.g
        colors[(f + k) * 3 + 2] = s.b
      }
    }
    g.setAttribute('color', new BufferAttribute(colors, 3))
    return g
  }, [seed])
  useEffect(() => () => geometry.dispose(), [geometry])
  return geometry
}

export function Moon({ seed, animate }) {
  const geometry = useMoonGeometry(seed)
  return (
    <Orbit radius={2.5} period={60} tilt={[0.22, -0.12]} phase={2.2} animate={animate}>
      <mesh geometry={geometry}>
        <meshStandardMaterial vertexColors flatShading roughness={0.95} metalness={0} />
      </mesh>
    </Orbit>
  )
}

// ---------- Satellite: gold bus + two navy solar panels ----------

export function Satellite({ animate }) {
  return (
    <Orbit radius={1.4} period={20} tilt={[1.05, 0.4]} phase={0.6} animate={animate}>
      <mesh>
        <boxGeometry args={[0.03, 0.03, 0.03]} />
        <meshStandardMaterial color={SCENE.satelliteBody} metalness={0.7} roughness={0.35} />
      </mesh>
      {[1, -1].map((side) => (
        <mesh key={side} position={[0, side * 0.054, 0]}>
          <boxGeometry args={[0.028, 0.07, 0.002]} />
          <meshStandardMaterial color={SCENE.satellitePanel} metalness={0.35} roughness={0.4} />
        </mesh>
      ))}
    </Orbit>
  )
}

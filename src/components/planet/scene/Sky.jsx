import React, { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, BufferAttribute, Color, Vector3 } from 'three'
import { SCENE } from '../palette.js'

const STAR_COUNT = 2600
const STAR_RADIUS = 80

/** Fixed starfield — deterministic so it never reshuffles between visits. */
export function Starfield() {
  const geometry = useMemo(() => {
    let s = 0x9e3779b9
    const rnd = () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0
      return s / 4294967296
    }
    const tints = [SCENE.star, SCENE.starWarm, SCENE.starCool].map((h) => new Color(h))
    const pos = new Float32Array(STAR_COUNT * 3)
    const col = new Float32Array(STAR_COUNT * 3)
    for (let i = 0; i < STAR_COUNT; i++) {
      // Uniform direction on the sphere.
      const z = rnd() * 2 - 1
      const a = rnd() * Math.PI * 2
      const r = Math.sqrt(1 - z * z)
      pos[i * 3] = Math.cos(a) * r * STAR_RADIUS
      pos[i * 3 + 1] = z * STAR_RADIUS
      pos[i * 3 + 2] = Math.sin(a) * r * STAR_RADIUS
      const t = tints[rnd() < 0.7 ? 0 : rnd() < 0.5 ? 1 : 2]
      // Mostly faint, a few bright: cube of a uniform skews toward dim.
      const b = 0.15 + 0.85 * Math.pow(rnd(), 3)
      col[i * 3] = t.r * b
      col[i * 3 + 1] = t.g * b
      col[i * 3 + 2] = t.b * b
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(pos, 3))
    g.setAttribute('color', new BufferAttribute(col, 3))
    return g
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <points geometry={geometry}>
      <pointsMaterial vertexColors size={1.6} sizeAttenuation={false} toneMapped={false} depthWrite={false} />
    </points>
  )
}

// three's Lambert term divides by π, so (AMBIENT + HEAD·N·L) / π is the
// multiplier on a biome colour: ~1.0 facing the camera, ~0.6 at the limb.
// Rendered without tone mapping (Canvas `flat`) so the UE hex values show true.
const AMBIENT = 0.56 * Math.PI
const HEAD = 0.5 * Math.PI
// Headlight sits up-and-left of the lens (~30°): dead-on light flattens the
// relief, a slight offset lets slopes read while nothing ever goes dark.
const HEAD_UP = 0.45
const HEAD_LEFT = 0.3

const _right = new Vector3()
const _up = new Vector3()

/**
 * Evenly lit planet — no day / night side. Strong ambient carries the biome
 * colours; a soft headlight that follows the camera keeps relief readable
 * from whichever side you orbit to.
 */
export function Lights() {
  const head = useRef()
  useFrame(({ camera }) => {
    const d = camera.position.length()
    _right.setFromMatrixColumn(camera.matrixWorld, 0)
    _up.setFromMatrixColumn(camera.matrixWorld, 1)
    head.current.position
      .copy(camera.position)
      .addScaledVector(_up, HEAD_UP * d)
      .addScaledVector(_right, -HEAD_LEFT * d)
  })
  return (
    <>
      <ambientLight color={SCENE.light} intensity={AMBIENT} />
      <directionalLight ref={head} color={SCENE.light} intensity={HEAD} />
    </>
  )
}

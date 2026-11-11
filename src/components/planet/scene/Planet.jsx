import React, { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshStandardMaterial, MathUtils } from 'three'
import { terrainGLSL, createTerrainUniforms, updateTerrainUniforms } from '../lib/terrain.glsl.js'

const LAND_ROUGHNESS = 0.9
// Soft sheen only: with the light riding on the camera, a glossier sea would
// put a permanent hotspot in the middle of the planet.
const WATER_ROUGHNESS = 0.6

/**
 * Surface mesh. Geometry (relief, silhouette) comes from the CPU worker;
 * biome colour is evaluated per fragment by terrainGLSL, so coastlines and
 * biome edges stay crisp at any zoom — vertex colours always blur up close.
 * The same per-pixel sea/land test drives roughness for a faint water sheen.
 */
function makeMaterial(uniforms) {
  const m = new MeshStandardMaterial({ roughness: LAND_ROUGHNESS, metalness: 0 })
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms) // shared refs: later updates propagate
    shader.uniforms.uWaterRoughness = { value: WATER_ROUGHNESS }
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vPgDir;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPgDir = position;')
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>\nuniform float uWaterRoughness;\nvarying vec3 vPgDir;\n${terrainGLSL}`
      )
      .replace(
        '#include <color_fragment>',
        'float pgWater;\ndiffuseColor.rgb = terrainColor(normalize(vPgDir), pgWater);'
      )
      .replace(
        '#include <roughnessmap_fragment>',
        'float roughnessFactor = mix(roughness, uWaterRoughness, pgWater);'
      )
  }
  m.customProgramCacheKey = () => 'pg-terrain'
  return m
}

export default function Planet({ geometry, spin, animate }) {
  const ref = useRef()
  const invalidate = useThree((s) => s.invalidate)
  const uniforms = useMemo(() => createTerrainUniforms(), [])
  const material = useMemo(() => makeMaterial(uniforms), [uniforms])
  useEffect(() => () => material.dispose(), [material])

  // Colour uniforms follow the params that built the *displayed* mesh, so the
  // per-pixel biomes never run ahead of the relief while the worker catches up.
  const built = geometry?.userData.params
  useEffect(() => {
    if (!built) return
    updateTerrainUniforms(uniforms, built)
    invalidate()
  }, [built, uniforms, invalidate])

  // Spin is °/s scaled by real delta — frame-rate independent (319 Hz safe).
  useFrame((_, dt) => {
    if (animate && ref.current) ref.current.rotation.y += MathUtils.degToRad(spin) * Math.min(dt, 0.1)
  })

  return (
    <group ref={ref}>
      {geometry && <mesh geometry={geometry} material={material} name="PlanetSurface" />}
    </group>
  )
}

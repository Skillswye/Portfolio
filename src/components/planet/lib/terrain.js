// ============================================
// Planet terrain — height + biome colour per vertex.
// Straight port of the UE5 height / colour graph. All maths runs on the CPU
// so the rendered mesh and the exported OBJ are the same data.
// ============================================

import { createNoise, probit, smoothstep, clamp01 } from './noise.js'
import { BIOME } from '../palette.js'

// sRGB hex → linear RGB triple (three.js vertex colours are linear).
function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}
function hexToLinear(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [
    srgbToLinear(((n >> 16) & 255) / 255),
    srgbToLinear(((n >> 8) & 255) / 255),
    srgbToLinear((n & 255) / 255),
  ]
}
const C = Object.fromEntries(Object.entries(BIOME).map(([k, v]) => [k, hexToLinear(v)]))

/**
 * Prepares one terrain build. Call run(start, end) over vertex ranges — the
 * worker does it in chunks so a newer request can cancel a slow high-res pass.
 *
 * On screen, biome colour is evaluated per pixel (terrain.glsl.js), so display
 * builds pass { colors: false } and skip the colour half; only the OBJ export
 * needs vertex colours.
 *
 * @param {Float32Array} dirs  unit directions, xyz interleaved
 * @param {object} params      seed, ocean, mountains, hills, lakes, forest,
 *                             desert, snow (0–1), relief, detail
 * @param {{ colors?: boolean }} [opts]
 */
export function createTerrainBuild(dirs, params, { colors: withColors = true } = {}) {
  const { seed, ocean, mountains, hills, lakes, forest, desert, snow, relief, detail } = params
  const { gn, fbm, ridged } = createNoise(seed)

  const count = dirs.length / 3
  const positions = new Float32Array(count * 3)
  const colors = withColors ? new Float32Array(count * 3) : null

  // Thresholds are constant across the sphere — hoist them.
  const oceanTh = probit(ocean)
  const mountTh = probit(1 - mountains)
  const hillTh = probit(1 - hills)
  const lakeTh = probit(1 - lakes)
  const dth = probit(desert)
  const fth = probit(1 - forest)

  function run(start, end) {
    for (let i = start; i < end; i++) {
      const dx = dirs[i * 3]
      const dy = dirs[i * 3 + 1]
      const dz = dirs[i * 3 + 2]
      const px = dx * detail
      const py = dy * detail
      const pz = dz * detail

      // ---- Height --------------------------------------------------------
      const c = fbm(px, py, pz, 5, 1) / 0.235
      const land = c - oceanTh

      let H
      let M = 0
      let hl = 0
      let lk = 0
      if (land < 0) {
        // Every land feature below is multiplied by lf (= 0 here) or
        // overwritten, so skip ~16 noise evaluations per ocean vertex.
        H = land * 0.3
      } else {
        const lf = smoothstep(0, 0.4, land)

        let mMask = 0
        if (mountains > 0) {
          const mm = fbm(px * 1.7, py * 1.7, pz * 1.7, 3, 40) / 0.225
          mMask = smoothstep(-0.35, 0.35, mm - mountTh)
        }
        if (mMask > 0) {
          M = mMask * (0.3 + 0.85 * ridged(px * 2.2, py * 2.2, pz * 2.2, 3, 80)) * lf
        }

        if (hills > 0 && mMask < 1) {
          const hm = fbm(px * 2.3, py * 2.3, pz * 2.3, 2, 120) / 0.22
          const hMask = smoothstep(-0.3, 0.3, hm - hillTh)
          if (hMask > 0) {
            hl = hMask * clamp01(0.5 + fbm(px * 5, py * 5, pz * 5, 2, 160) * 2.2) * lf * (1 - mMask)
          }
        }

        H = (1 - Math.exp(-land * 1.2)) * 0.12 + M + hl * 0.22

        if (lakes > 0 && mMask < 1 && land > 0.2) {
          const ln = fbm(px * 2.9, py * 2.9, pz * 2.9, 3, 200) / 0.225
          lk = smoothstep(-0.15, 0.15, ln - lakeTh) * smoothstep(0.2, 0.55, land) * (1 - mMask)
        }
        H = H + (-0.08 - H) * lk
      }

      // Water stays exactly on radius 1 — a flat sea.
      const r = 1 + Math.max(H, 0) * relief
      positions[i * 3] = dx * r
      positions[i * 3 + 1] = dy * r
      positions[i * 3 + 2] = dz * r
      if (!withColors) continue

      // ---- Colour --------------------------------------------------------
      const Hn = Math.max(H, 0)
      const dn = gn(px * 13, py * 13, pz * 13, 300)
      const T = 1 - Math.abs(dy) + gn(px * 3, py * 3, pz * 3, 320) * 0.22 + dn * 0.05 - Hn * 0.3

      let col
      if (H < 0) {
        if (land > 0) {
          col = C.lake
        } else {
          const dp = land + dn * 0.12
          col = dp < -1.3 ? C.deepOcean : dp < -0.6 ? C.ocean : dp < -0.15 ? C.shelf : C.shallows
        }
        if (snow > 0 && T < snow * 0.75) col = C.seaIce
      } else {
        const mo = fbm(px * 1.9, py * 1.9, pz * 1.9, 3, 340) / 0.225 + dn * 0.35

        col = mo < dth + 0.5 && T > 0.4 ? C.savanna : C.grassland
        if (T < snow + 0.1) col = C.tundra
        if (hl > 0.3 + dn * 0.2) col = C.hills
        if (forest > 0 && mo > fth) {
          col = mo > fth + 0.9 ? C.deepForest : C.forest
          if (T < snow + 0.22) col = C.taiga
        }
        if (desert > 0 && mo < dth && T > 0.38) col = dn > 0.05 ? C.desertDark : C.desert
        if (land < 0.09 + dn * 0.06 && lk < 0.02) col = C.beach
        if (M > 0.2 + dn * 0.12) col = C.rock
        if (M > 0.62 + dn * 0.12) col = C.darkRock
        if (M > 0.8 + dn * 0.1) col = C.snow
        if (snow > 0 && T < snow) col = C.snow
      }
      colors[i * 3] = col[0]
      colors[i * 3 + 1] = col[1]
      colors[i * 3 + 2] = col[2]
    }
  }

  return { count, positions, colors, run }
}

/** Whole sphere in one go (tests, small meshes). */
export function buildTerrain(dirs, params) {
  const build = createTerrainBuild(dirs, params)
  build.run(0, build.count)
  return build
}

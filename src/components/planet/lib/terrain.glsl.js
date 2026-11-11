// ============================================
// GLSL twin of terrain.js — biome colour evaluated per pixel.
//
// Vertex colours are interpolated across each triangle, so no mesh density
// stays sharp once you zoom in far enough. On desktop the surface shader runs
// this function per fragment instead: biome edges stay crisp at any zoom.
// The mesh (relief, silhouette) and the OBJ export still come from terrain.js.
// Keep the two files in step: same formula, same order of rules.
// ============================================

import { noiseGLSL } from './noise.glsl.js'
import { probit } from './noise.js'
import { BIOME } from '../palette.js'

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}
function vec3Of(hex) {
  const n = parseInt(hex.slice(1), 16)
  const ch = (s) => srgbToLinear(((n >> s) & 255) / 255).toFixed(5)
  return `vec3(${ch(16)}, ${ch(8)}, ${ch(0)})`
}
const palette = Object.entries(BIOME)
  .map(([k, hex]) => `const vec3 B_${k} = ${vec3Of(hex)};`)
  .join('\n')

export const terrainGLSL = /* glsl */ `
${noiseGLSL}
${palette}

uniform float uDetail;
uniform float uOceanTh, uMountTh, uHillTh, uLakeTh, uDth, uFth;
uniform float uMountains, uHills, uLakes, uForest, uDesert, uSnow;

vec3 terrainColor(vec3 d, out float water) {
  vec3 p = d * uDetail;

  // ---- Height ----
  float c = fbm(p, 5, 1u) / 0.235;
  float land = c - uOceanTh;
  float H;
  float M = 0.0;
  float hl = 0.0;
  float lk = 0.0;
  if (land < 0.0) {
    H = land * 0.3;
  } else {
    float lf = smoothstep(0.0, 0.4, land);
    float mMask = 0.0;
    if (uMountains > 0.0) {
      float mm = fbm(p * 1.7, 3, 40u) / 0.225;
      mMask = smoothstep(-0.35, 0.35, mm - uMountTh);
    }
    if (mMask > 0.0) M = mMask * (0.3 + 0.85 * ridged(p * 2.2, 3, 80u)) * lf;
    if (uHills > 0.0 && mMask < 1.0) {
      float hm = fbm(p * 2.3, 2, 120u) / 0.22;
      float hMask = smoothstep(-0.3, 0.3, hm - uHillTh);
      if (hMask > 0.0) hl = hMask * clamp(0.5 + fbm(p * 5.0, 2, 160u) * 2.2, 0.0, 1.0) * lf * (1.0 - mMask);
    }
    H = (1.0 - exp(-land * 1.2)) * 0.12 + M + hl * 0.22;
    if (uLakes > 0.0 && mMask < 1.0 && land > 0.2) {
      float ln = fbm(p * 2.9, 3, 200u) / 0.225;
      lk = smoothstep(-0.15, 0.15, ln - uLakeTh) * smoothstep(0.2, 0.55, land) * (1.0 - mMask);
    }
    H = mix(H, -0.08, lk);
  }

  // ---- Colour ----
  float Hn = max(H, 0.0);
  float dn = gn(p * 13.0, 300u);
  float T = 1.0 - abs(d.y) + gn(p * 3.0, 320u) * 0.22 + dn * 0.05 - Hn * 0.3;

  vec3 col;
  water = 0.0;
  if (H < 0.0) {
    water = 1.0;
    if (land > 0.0) {
      col = B_lake;
    } else {
      float dp = land + dn * 0.12;
      col = dp < -1.3 ? B_deepOcean : dp < -0.6 ? B_ocean : dp < -0.15 ? B_shelf : B_shallows;
    }
    if (uSnow > 0.0 && T < uSnow * 0.75) col = B_seaIce;
  } else {
    float mo = fbm(p * 1.9, 3, 340u) / 0.225 + dn * 0.35;
    col = (mo < uDth + 0.5 && T > 0.4) ? B_savanna : B_grassland;
    if (T < uSnow + 0.1) col = B_tundra;
    if (hl > 0.3 + dn * 0.2) col = B_hills;
    if (uForest > 0.0 && mo > uFth) {
      col = mo > uFth + 0.9 ? B_deepForest : B_forest;
      if (T < uSnow + 0.22) col = B_taiga;
    }
    if (uDesert > 0.0 && mo < uDth && T > 0.38) col = dn > 0.05 ? B_desertDark : B_desert;
    if (land < 0.09 + dn * 0.06 && lk < 0.02) col = B_beach;
    if (M > 0.2 + dn * 0.12) col = B_rock;
    if (M > 0.62 + dn * 0.12) col = B_darkRock;
    if (M > 0.8 + dn * 0.1) col = B_snow;
    if (uSnow > 0.0 && T < uSnow) col = B_snow;
  }
  return col;
}
`

/** Uniform objects for terrainGLSL; share them into the compiled shader. */
export function createTerrainUniforms() {
  const u = {}
  for (const k of [
    'uDetail', 'uOceanTh', 'uMountTh', 'uHillTh', 'uLakeTh', 'uDth', 'uFth',
    'uMountains', 'uHills', 'uLakes', 'uForest', 'uDesert', 'uSnow',
  ]) u[k] = { value: 0 }
  u.uSeed = { value: 0 }
  return u
}

/** Same thresholds terrain.js hoists, computed once per parameter set. */
export function updateTerrainUniforms(u, params) {
  const { seed, ocean, mountains, hills, lakes, forest, desert, snow, detail } = params
  u.uSeed.value = seed >>> 0
  u.uDetail.value = detail
  u.uOceanTh.value = probit(ocean)
  u.uMountTh.value = probit(1 - mountains)
  u.uHillTh.value = probit(1 - hills)
  u.uLakeTh.value = probit(1 - lakes)
  u.uDth.value = probit(desert)
  u.uFth.value = probit(1 - forest)
  u.uMountains.value = mountains
  u.uHills.value = hills
  u.uLakes.value = lakes
  u.uForest.value = forest
  u.uDesert.value = desert
  u.uSnow.value = snow
}

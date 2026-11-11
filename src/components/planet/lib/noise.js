// ============================================
// Planet noise — port of the UE5 material functions.
// Pure functions, no three.js: shared by the mesh worker and the moon.
// The GLSL twin used by the cloud shell lives in noise.glsl.js and must
// stay bit-for-bit compatible with hashLattice / grad below.
// ============================================

const imul = Math.imul

/** PCG-style 32-bit integer hash (Jarzynski & Olano, 2020). */
export function pcg(v) {
  const state = (imul(v >>> 0, 747796405) + 2891336453) >>> 0
  const word = imul(((state >>> ((state >>> 28) + 4)) ^ state) >>> 0, 277803737) >>> 0
  return ((word >>> 22) ^ word) >>> 0
}

/**
 * Per-(seed, salt) base hash. Mixing salt into the lattice hash keeps every
 * noise layer (continents, mountains, lakes…) uncorrelated with the others.
 */
export function noiseBase(seed, salt) {
  return pcg((pcg(salt >>> 0) + (seed >>> 0)) >>> 0)
}

// Large odd primes to spread the lattice coordinates before hashing.
const PX = 0x8da6b343
const PY = 0xd8163841
const PZ = 0xcb1ab31f

function hashLattice(ix, iy, iz, base) {
  return pcg((imul(ix, PX) ^ imul(iy, PY) ^ imul(iz, PZ) ^ base) >>> 0)
}

// 12 cube-edge gradients (Perlin 2002), scaled to unit length so σ(gn) ≈ 0.19,
// which is what the UE normalisation constants (0.235 / 0.225 / 0.22) assume.
const GX = [1, -1, 1, -1, 1, -1, 1, -1, 0, 0, 0, 0]
const GY = [1, 1, -1, -1, 0, 0, 0, 0, 1, -1, 1, -1]
const GZ = [0, 0, 0, 0, 1, 1, -1, -1, 1, 1, -1, -1]

function grad(h, x, y, z) {
  const i = h % 12
  return (GX[i] * x + GY[i] * y + GZ[i] * z) * Math.SQRT1_2
}

const fade = (f) => f * f * f * (f * (f * 6 - 15) + 10)
const lerp = (a, b, t) => a + (b - a) * t

/**
 * 3D gradient noise, roughly in [-1, 1] (σ ≈ 0.2).
 * `base` comes from noiseBase(seed, salt) — callers that evaluate many points
 * with the same salt should hoist it; gn() below does it for you.
 */
export function gradientNoise(x, y, z, base) {
  const fx = Math.floor(x)
  const fy = Math.floor(y)
  const fz = Math.floor(z)
  const ix = fx | 0
  const iy = fy | 0
  const iz = fz | 0
  const x0 = x - fx
  const y0 = y - fy
  const z0 = z - fz
  const x1 = x0 - 1
  const y1 = y0 - 1
  const z1 = z0 - 1
  const u = fade(x0)
  const v = fade(y0)
  const w = fade(z0)

  const n000 = grad(hashLattice(ix, iy, iz, base), x0, y0, z0)
  const n100 = grad(hashLattice(ix + 1, iy, iz, base), x1, y0, z0)
  const n010 = grad(hashLattice(ix, iy + 1, iz, base), x0, y1, z0)
  const n110 = grad(hashLattice(ix + 1, iy + 1, iz, base), x1, y1, z0)
  const n001 = grad(hashLattice(ix, iy, iz + 1, base), x0, y0, z1)
  const n101 = grad(hashLattice(ix + 1, iy, iz + 1, base), x1, y0, z1)
  const n011 = grad(hashLattice(ix, iy + 1, iz + 1, base), x0, y1, z1)
  const n111 = grad(hashLattice(ix + 1, iy + 1, iz + 1, base), x1, y1, z1)

  return lerp(
    lerp(lerp(n000, n100, u), lerp(n010, n110, u), v),
    lerp(lerp(n001, n101, u), lerp(n011, n111, u), v),
    w
  )
}

/**
 * Factory bound to one seed. Base hashes are cached per salt, so the hot loop
 * in terrain.js does one Map lookup per octave instead of two extra pcg calls.
 */
export function createNoise(seed) {
  const bases = new Map()
  const baseFor = (salt) => {
    let b = bases.get(salt)
    if (b === undefined) {
      b = noiseBase(seed, salt)
      bases.set(salt, b)
    }
    return b
  }

  const gn = (x, y, z, salt) => gradientNoise(x, y, z, baseFor(salt))

  function fbm(x, y, z, n, salt) {
    let s = 0
    let a = 1
    let f = 1
    for (let k = 0; k < n; k++) {
      s += a * gn(x * f, y * f, z * f, salt + k * 17)
      f *= 2.03
      a *= 0.5
    }
    return s
  }

  function ridged(x, y, z, n, salt) {
    let s = 0
    let a = 0.5
    let f = 1
    let w = 1
    for (let k = 0; k < n; k++) {
      let v = 1 - Math.abs(gn(x * f, y * f, z * f, salt + k * 17)) * 3.2
      v = v < 0 ? 0 : v > 1 ? 1 : v
      v *= v
      s += v * a * w
      w = v * 1.5 + 0.25
      w = w < 0 ? 0 : w > 1 ? 1 : w
      f *= 2.07
      a *= 0.5
    }
    return s
  }

  return { gn, fbm, ridged }
}

/**
 * Percentage → noise threshold. Tukey-lambda approximation of the standard
 * normal quantile; the fbm layers are divided by their σ so that, e.g.,
 * c > probit(0.6) covers ~40% of the sphere.
 */
export function probit(p) {
  const q = p < 0.0005 ? 0.0005 : p > 0.9995 ? 0.9995 : p
  return 4.91 * (Math.pow(q, 0.14) - Math.pow(1 - q, 0.14))
}

export const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x)

export function smoothstep(e0, e1, x) {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}

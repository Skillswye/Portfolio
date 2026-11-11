// ============================================
// GLSL ES 3.0 twin of noise.js (WebGL2 — uint maths wraps mod 2^32 exactly
// like Math.imul). Keep hash constants and gradient table in sync with JS.
// ============================================

export const noiseGLSL = /* glsl */ `
uniform uint uSeed;

uint pcg(uint v) {
  uint state = v * 747796405u + 2891336453u;
  uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
  return (word >> 22u) ^ word;
}

uint noiseBase(uint salt) {
  return pcg(pcg(salt) + uSeed);
}

uint hashLattice(ivec3 i, uint base) {
  uvec3 u = uvec3(i);
  return pcg((u.x * 0x8da6b343u) ^ (u.y * 0xd8163841u) ^ (u.z * 0xcb1ab31fu) ^ base);
}

float gradDot(uint h, vec3 p) {
  uint i = h % 12u;
  vec3 g;
  if (i < 4u)      g = vec3((i & 1u) == 0u ? 1.0 : -1.0, (i & 2u) == 0u ? 1.0 : -1.0, 0.0);
  else if (i < 8u) g = vec3((i & 1u) == 0u ? 1.0 : -1.0, 0.0, i < 6u ? 1.0 : -1.0);
  else             g = vec3(0.0, (i & 1u) == 0u ? 1.0 : -1.0, i < 10u ? 1.0 : -1.0);
  return dot(g, p) * 0.70710678;
}

float gn(vec3 p, uint salt) {
  uint base = noiseBase(salt);
  vec3 fl = floor(p);
  ivec3 i = ivec3(fl);
  vec3 f = p - fl;
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

  float n000 = gradDot(hashLattice(i,                base), f);
  float n100 = gradDot(hashLattice(i + ivec3(1,0,0), base), f - vec3(1,0,0));
  float n010 = gradDot(hashLattice(i + ivec3(0,1,0), base), f - vec3(0,1,0));
  float n110 = gradDot(hashLattice(i + ivec3(1,1,0), base), f - vec3(1,1,0));
  float n001 = gradDot(hashLattice(i + ivec3(0,0,1), base), f - vec3(0,0,1));
  float n101 = gradDot(hashLattice(i + ivec3(1,0,1), base), f - vec3(1,0,1));
  float n011 = gradDot(hashLattice(i + ivec3(0,1,1), base), f - vec3(0,1,1));
  float n111 = gradDot(hashLattice(i + ivec3(1,1,1), base), f - vec3(1,1,1));

  return mix(
    mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),
    mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y),
    u.z
  );
}

float fbm(vec3 p, int n, uint salt) {
  float s = 0.0, a = 1.0, f = 1.0;
  for (int k = 0; k < 8; k++) {
    if (k >= n) break;
    s += a * gn(p * f, salt + uint(k) * 17u);
    f *= 2.03;
    a *= 0.5;
  }
  return s;
}

float ridged(vec3 p, int n, uint salt) {
  float s = 0.0, a = 0.5, f = 1.0, w = 1.0;
  for (int k = 0; k < 8; k++) {
    if (k >= n) break;
    float v = clamp(1.0 - abs(gn(p * f, salt + uint(k) * 17u)) * 3.2, 0.0, 1.0);
    v *= v;
    s += v * a * w;
    w = clamp(v * 1.5 + 0.25, 0.0, 1.0);
    f *= 2.07;
    a *= 0.5;
  }
  return s;
}
`

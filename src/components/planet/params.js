// ============================================
// Planet generator controls — ranges, defaults, labels.
// `rebuild: true` means the slider changes the mesh (goes to the worker);
// the rest are cheap scene uniforms / transforms applied every frame.
// Percentages are stored as 0–1 and displayed ×100.
// ============================================

export const SLIDERS = [
  { key: 'size', label: 'Size', min: 0.5, max: 2, step: 0.01, def: 1, unit: '%' },
  { key: 'ocean', label: 'Ocean', min: 0, max: 1, step: 0.01, def: 0.6, unit: '%', rebuild: true },
  { key: 'mountains', label: 'Mountains', min: 0, max: 1, step: 0.01, def: 0.3, unit: '%', rebuild: true },
  { key: 'hills', label: 'Hills', min: 0, max: 1, step: 0.01, def: 0.3, unit: '%', rebuild: true },
  { key: 'lakes', label: 'Lakes', min: 0, max: 1, step: 0.01, def: 0.08, unit: '%', rebuild: true },
  { key: 'forest', label: 'Forest', min: 0, max: 1, step: 0.01, def: 0.35, unit: '%', rebuild: true },
  { key: 'desert', label: 'Desert', min: 0, max: 1, step: 0.01, def: 0.2, unit: '%', rebuild: true },
  { key: 'snow', label: 'Snow', min: 0, max: 1, step: 0.01, def: 0.14, unit: '%', rebuild: true },
  { key: 'clouds', label: 'Clouds', min: 0, max: 1, step: 0.01, def: 0.3, unit: '%' },
  { key: 'relief', label: 'Relief', min: 0, max: 0.14, step: 0.001, def: 0.08, rebuild: true },
  { key: 'detail', label: 'Detail', min: 0.6, max: 4, step: 0.01, def: 1.6, rebuild: true },
  { key: 'spin', label: 'Spin', min: 0, max: 30, step: 0.5, def: 4, unit: '°/s' },
]

export const TOGGLES = [
  { key: 'showClouds', label: 'Clouds', def: true },
  { key: 'showAtmosphere', label: 'Atmosphere', def: true },
  { key: 'showMoon', label: 'Moon', def: true },
  { key: 'showSatellite', label: 'Satellite', def: true },
  { key: 'showStars', label: 'Stars', def: true },
  // Not in the UE version: a single switch for every autonomous motion
  // (spin, orbits). Defaults off under prefers-reduced-motion.
  { key: 'animate', label: 'Motion', def: true },
]

export const REBUILD_KEYS = SLIDERS.filter((s) => s.rebuild).map((s) => s.key)

export const DEFAULT_SEED = 1337

export function defaultParams(reducedMotion) {
  const p = { seed: DEFAULT_SEED }
  for (const s of SLIDERS) p[s.key] = s.def
  for (const t of TOGGLES) p[t.key] = t.def
  if (reducedMotion) p.animate = false
  return p
}

export function formatValue(slider, v) {
  if (slider.unit === '%') return `${Math.round(v * 100)}%`
  if (slider.unit) return `${Math.round(v * 10) / 10}${slider.unit}`
  return v.toFixed(slider.step < 0.01 ? 3 : 2)
}

export function randomSeed() {
  return Math.floor(Math.random() * 0x7fffffff)
}

// Segments per cube face for each build pass: a fast preview, then full res.
// Biome colour is computed per pixel (terrain.glsl.js) on every device, so the
// mesh only carries relief and silhouette; 256 keeps ridgelines clean up close
// on desktop, 128 is plenty on a phone. 256 → 393k verts in the worker.
export const PASSES_DESKTOP = [64, 256]
export const PASSES_MOBILE = [128]

// OBJ export is built separately at a lighter resolution:
// 128 → ~98k verts, ~14 MB (the 256 display mesh would be ~60 MB).
export const EXPORT_SEGMENTS = 128

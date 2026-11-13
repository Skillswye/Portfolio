// ============================================
// Hero orrery — the solar system drawn as an engraved astronomical plate.
//
// References it borrows from:
// - Trouvelot's 1881 astronomical drawings: planets as portraits — Jupiter's
//   belts and oversized Red Spot, Saturn's rings as many fine lines with gaps.
// - Eleanor Lutz's "Atlas of Space" orbit map: asteroids as short orbit arcs.
//
// Planets are stippled globes: dots fixed to a sphere that turns about a
// tilted axis, so each one visibly rotates (Venus backwards). Hairline orbits,
// mono annotations and the site palette keep it in the figures' language.
//
// Plain canvas 2D, no React. createOrrery(canvas) starts it and returns a
// cleanup function.
//
// Motion is tuned in "60fps frames": `dt` is how many of those elapsed, so
// speeds match on 60Hz, 144Hz and 300Hz+ screens. Multiply anything that
// moves by dt. Rendering stops while the hero is scrolled off-screen.
//
// prefers-reduced-motion: the orbits, dust and meteors keep running — they are
// the piece itself, slow and ambient, and always ran before this redesign
// (Jason's own Windows has animation effects off and he wants it moving).
// Only the add-ons are skipped: the draw-in intro and the pointer parallax.
// ============================================

import { createNoise } from '../planet/lib/noise.js'

const TAU = Math.PI * 2
const FRAME_MS = 1000 / 60

// The orbital plane, seen from above-and-to-the-side.
const SQUASH = 0.46 // minor / major axis
const REF_SCALE = 1098 // layout scale at which the planet sizes are 1:1
const TILT = -0.2 // radians; the whole plane leans up to the right

const FONT = '"JetBrains Mono", "Courier New", monospace'
const BEACON = [255, 80, 80] // ship easter egg — the one colour off-palette

// orbit: radius in layout units · size: px at REF_SCALE · period: relative year
//
// Spacing rule: where the squashed orbits run closest (straight above and
// below the sun) neighbours are only SQUASH × their orbit gap apart, so the
// gaps are sized to the bodies — no two planets, Saturn's rings and the Moon's
// orbit included, may overlap when they line up. Saturn needs the most room:
// its rings are an ellipse 2.2 radii wide, and Jupiter's axis pin must clear
// them too. If you change a size or an orbit, re-check that; body sizes scale
// with the layout (see `unit`) so the guarantee holds at every window size.
// spin: self-rotation, radians per 60fps frame (Venus turns backwards)
// obliquity: axial tilt in radians, leaning the axis off the orbit normal
const PLANETS = [
  { name: 'Mercury', data: '0.39 AU · 0.24 y', orbit: 0.071, size: 4.4, tone: 'mercury', period: 0.24, angle: 0.9, spin: 0.0025, obliquity: 0 },
  { name: 'Venus', data: '0.72 AU · 0.62 y', orbit: 0.113, size: 7.9, tone: 'venus', period: 0.62, angle: 2.7, spin: -0.0018, obliquity: 0.05 },
  {
    name: 'Earth', data: '1.00 AU · 1.00 y', orbit: 0.175, size: 8.8, tone: 'earth', period: 1, angle: 5.5, spin: 0.007, obliquity: 0.41,
    moon: { orbit: 0.026, size: 1.5, period: 0.5, angle: 1 },
  },
  { name: 'Mars', data: '1.52 AU · 1.88 y', orbit: 0.233, size: 6.6, tone: 'mars', period: 1.88, angle: 0.35, spin: 0.0068, obliquity: 0.44 },
  // Outer periods are visually compressed so they still read as moving.
  { name: 'Jupiter', data: '5.20 AU · 11.86 y', orbit: 0.325, size: 21, tone: 'jupiter', period: 5.5, angle: 2.25, spin: 0.013, obliquity: 0.055 },
  { name: 'Saturn', data: '9.58 AU · 29.5 y', orbit: 0.48, size: 16.7, tone: 'saturn', period: 9, angle: 4.2, spin: 0.012, obliquity: 0.47, rings: true },
]
const BELT = [0.26, 0.288] // asteroid belt, between Mars and Jupiter

// Every globe is seen from the same elevation as the orbital plane:
// north poles tip toward the viewer by this much.
const POLE_TIP = 0.48
const SIN_TIP = Math.sin(POLE_TIP)
const COS_TIP = Math.cos(POLE_TIP)
const INK_LEVELS = [0.2, 0.42, 0.7, 1] // stipple alpha buckets (batched fills)

// Saturn's rings — [radius in planet radii, alpha, line width]; the jump
// between 1.86 and 2.02 is the Cassini division.
const RINGS = [
  [1.28, 0.3, 0.5], [1.38, 0.5, 0.6], [1.5, 0.75, 0.8], [1.62, 0.9, 1], [1.74, 0.8, 0.9],
  [1.86, 0.55, 0.7], [2.02, 0.7, 0.8], [2.12, 0.5, 0.6], [2.22, 0.3, 0.5],
]

const hexToRgb = (hex) => {
  const n = parseInt(hex.trim().replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x)
const easeOut = (t) => 1 - Math.pow(1 - clamp01(t), 3)
const smooth = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}

/**
 * Surface "ink" for each planet at a point on the unit sphere (y = spin axis).
 * Returns [density 0–1, tone] — tone 0 is the planet's own colour, 1 its accent
 * (Earth's land and ice, Mars' polar caps, Jupiter's Red Spot).
 */
const SURFACE = {
  mercury: (n, x, y, z) => [0.3 + 0.6 * smooth(-0.6, 0.9, n.fbm(x * 2.4, y * 2.4, z * 2.4, 3, 11) / 0.21), 0],
  venus: (n, x, y, z) => {
    // Sideways-V cloud bands
    const swirl = Math.sin(Math.asin(y) * 6.5 - Math.abs(Math.atan2(x, z)) * 1.3 + n.fbm(x * 1.6, y * 1.6, z * 1.6, 2, 21) * 5)
    return [0.22 + 0.62 * smooth(-0.3, 0.7, swirl), 0]
  },
  earth: (n, x, y, z) => {
    if (Math.abs(y) > 0.9) return [1, 1] // ice
    return n.fbm(x * 1.7, y * 1.7, z * 1.7, 4, 31) / 0.225 > 0.3 ? [0.95, 1] : [0.2, 0]
  },
  mars: (n, x, y, z) => {
    if (Math.abs(y) > 0.9) return [1, 1] // polar caps
    const v = n.fbm(x * 2.1, y * 2.1, z * 2.1, 3, 41) / 0.215
    return v < -0.2 ? [0.2, 0] : [0.45 + 0.45 * smooth(-0.2, 0.8, v), 0]
  },
  jupiter: (n, x, y, z) => {
    const lat = Math.asin(y)
    let dl = Math.atan2(x, z) - 0.4
    dl = Math.atan2(Math.sin(dl), Math.cos(dl))
    const spot = (dl / 0.36) ** 2 + ((lat + 0.36) / 0.15) ** 2
    if (spot < 1) return [1, 1] // Great Red Spot, oversized as Trouvelot drew it
    if (spot < 1.7) return [0.06, 0]
    // Belts and zones: crisp edges, lightly ruffled by turbulence
    const band = Math.sin(lat * 8.5 + n.fbm(x * 3, y * 9, z * 3, 2, 51) * 1.6)
    return [0.07 + 0.9 * smooth(-0.12, 0.2, band), 0]
  },
  saturn: (n, x, y, z) => {
    const band = Math.sin(Math.asin(y) * 7 + n.fbm(x * 2, y * 6, z * 2, 2, 61) * 1.2)
    return [0.22 + 0.62 * smooth(-0.25, 0.35, band), 0]
  },
}

/**
 * Stipple a sphere: an evenly spread, slightly jittered lattice of candidate
 * dots, each kept with probability equal to the surface ink there.
 * Returns [x, y, z, weight, tone] × count, plus per-frame scratch buffers.
 */
function makeGlobe(kind, radiusPx, seed) {
  const noise = createNoise(seed)
  let state = seed >>> 0
  const rand = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
  const total = Math.round(Math.min(3000, Math.max(140, radiusPx * radiusPx * 4.5)))
  const golden = Math.PI * (3 - Math.sqrt(5))
  const jitter = Math.sqrt((4 * Math.PI) / total) * 0.9
  const kept = []
  for (let i = 0; i < total; i++) {
    let y = 1 - ((i + 0.5) / total) * 2
    const r = Math.sqrt(1 - y * y)
    let x = Math.cos(i * golden) * r + (rand() - 0.5) * jitter
    let z = Math.sin(i * golden) * r + (rand() - 0.5) * jitter
    y += (rand() - 0.5) * jitter
    const l = Math.hypot(x, y, z)
    x /= l
    y /= l
    z /= l
    const [ink, tone] = SURFACE[kind](noise, x, y, z)
    if (rand() < ink) kept.push(x, y, z, 0.55 + 0.45 * ink, tone)
  }
  const count = kept.length / 5
  return {
    count,
    pts: new Float32Array(kept),
    screen: new Float32Array(count * 2),
    bucket: new Int8Array(count),
  }
}

export function createOrrery(canvas) {
  const ctx = canvas.getContext('2d')
  const host = canvas.parentElement

  // Palette comes from the site's CSS variables — a duotone chart: amber and
  // bone, with the cold accent reserved for Earth.
  const css = getComputedStyle(document.documentElement)
  const tok = (name) => hexToRgb(css.getPropertyValue(name))
  const C = {
    void: tok('--void'),
    bone: tok('--bone'),
    pale: tok('--pale'),
    light: tok('--light'),
    ember: tok('--ember'),
    emberBright: tok('--ember-bright'),
    emberDeep: tok('--ember-deep'),
    signal: tok('--signal'),
  }
  const TONES = {
    mercury: C.bone,
    venus: mix(C.pale, C.emberBright, 0.4),
    earth: mix(C.signal, C.light, 0.42),
    mars: mix(C.emberDeep, C.ember, 0.75),
    jupiter: mix(C.ember, C.pale, 0.15),
    saturn: mix(C.emberBright, C.light, 0.45),
  }

  // Second ink per planet, for the features that should stand apart.
  const ACCENTS = {
    earth: C.pale, // land and ice against the blue
    mars: C.light, // polar caps
    jupiter: mix(C.emberDeep, C.void, 0.15), // the Red Spot, darker than the belts
  }

  const planets = PLANETS.map((p, i) => {
    // Axis roll on screen: the orbit normal leans with the plane (−TILT),
    // then each planet's own obliquity leans it back the other way.
    const roll = -TILT - p.obliquity
    const cr = Math.cos(roll)
    const sr = Math.sin(roll)
    return {
      ...p,
      index: String(i + 1).padStart(2, '0'),
      lit: TONES[p.tone],
      accent: ACCENTS[p.tone] || TONES[p.tone],
      night: mix(C.void, TONES[p.tone], 0.14),
      moon: p.moon ? { ...p.moon } : null,
      globe: makeGlobe(p.tone, p.size, 7919 * (i + 1)),
      spinAngle: i * 1.7,
      roll,
      // Rz(roll) · Rx(pole tip): sphere space (y-up) → screen space (y-up)
      m: [cr, -sr * COS_TIP, sr * SIN_TIP, sr, cr * COS_TIP, -cr * SIN_TIP, 0, SIN_TIP, COS_TIP],
      x: 0, y: 0, s: p.size, depth: 0, labelK: 0,
    }
  })

  const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)')
  let calm = motionMq.matches // skip intro + parallax only; see header
  const onMotionChange = () => { calm = motionMq.matches }
  motionMq.addEventListener('change', onMotionChange)

  // ----- Layout -----
  let W = 0
  let H = 0
  let cx0 = 0
  let cy0 = 0
  let scale = 1
  let unit = 1 // body-size multiplier, tied to the layout scale
  let cx = 0
  let cy = 0
  const cosT = Math.cos(TILT)
  const sinT = Math.sin(TILT)

  const layout = () => {
    W = host.clientWidth
    H = host.clientHeight
    // Hairlines need real device pixels; cap at 2× to keep fill cost sane.
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (W / H < 0.8) {
      // Portrait: tuck the chart into the empty corner above the name.
      cx0 = W * 0.78
      cy0 = Math.min(H * 0.156, 132)
      scale = W * 0.92
    } else {
      // Landscape: right of the name, outer ring bleeding off the edge.
      cx0 = W * 0.7
      cy0 = H * 0.52
      scale = Math.min(W, H) * 1.14
    }
    // Bodies grow and shrink with the orbits, so spacing never collapses.
    unit = Math.min(1.2, Math.max(0.4, scale / REF_SCALE))
  }
  layout()
  const resizeObserver = new ResizeObserver(layout)
  resizeObserver.observe(host)

  /** Point on the orbital plane → screen. `a` is the orbit angle, `r` px. */
  const project = (a, r) => {
    const ex = Math.cos(a) * r
    const ey = Math.sin(a) * r * SQUASH
    return [cx + ex * cosT - ey * sinT, cy + ex * sinT + ey * cosT]
  }
  const orbitPath = (r, a0, a1) => ctx.ellipse(cx, cy, r, r * SQUASH, TILT, a0, a1)

  // ----- Scenery -----
  const dust = Array.from({ length: 90 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.1,
    vy: (Math.random() - 0.5) * 0.1,
    r: Math.random() * 0.9 + 0.3,
    opacity: Math.random() * 0.4 + 0.08,
    pulse: Math.random() * TAU,
    warm: Math.random() < 0.7,
  }))

  // Asteroids as short orbit arcs (after Lutz's orbit map), a few with a head.
  const belt = Array.from({ length: 300 }, () => {
    // Two randoms averaged: denser toward the middle of the belt.
    const t = (Math.random() + Math.random()) / 2
    return {
      orbit: BELT[0] + (BELT[1] - BELT[0]) * t,
      angle: Math.random() * TAU,
      speed: 0.003 / (2.9 + t * 1.2),
      len: 0.04 + Math.random() ** 2 * 0.3,
      level: (Math.random() * 3) | 0,
      head: Math.random() < 0.18,
    }
  })

  // Engraver's stars: small crosses that slowly twinkle.
  const sparkles = Array.from({ length: 18 }, () => ({
    fx: Math.random(),
    fy: Math.random(),
    len: 2 + Math.random() ** 2 * 5,
    base: 0.18 + Math.random() * 0.36,
    phase: Math.random() * TAU,
  }))

  const sunspots = [
    { lat: 0.28, lon: 0.2 },
    { lat: -0.32, lon: 2.3 },
    { lat: 0.08, lon: 4.1 },
  ]
  let sunRotation = 0

  // ----- State -----
  const mouse = { x: -1000, y: -1000, active: false }
  const parallax = { x: 0, y: 0 }
  let hovered = null // planet object, 'sun' or null
  let sunLabelK = 0 // sun label fade, like each planet's labelK
  let bursts = []
  let solarBoost = 0 // sun double-click: everything speeds up, then settles
  let meteors = []
  let nextMeteorTime = 200 + Math.random() * 400
  let ships = []
  let shipSummonTimer = 0
  let time = 0
  let dt = 1
  let lastFrame = 0
  let intro = calm ? 1 : 0 // 0 → 1 while the chart draws itself in
  let raf = 0

  // Record trail points at a fixed 60fps cadence so trail length doesn't
  // shrink on high-refresh screens.
  const recordTrail = (o, maxLen) => {
    o.trailAcc = (o.trailAcc || 0) + dt
    while (o.trailAcc >= 1) {
      o.trail.push({ x: o.x, y: o.y })
      o.trailAcc -= 1
    }
    while (o.trail.length > maxLen) o.trail.shift()
  }

  // ----- Input -----
  const onMove = (e) => {
    mouse.x = e.offsetX
    mouse.y = e.offsetY
    mouse.active = true
  }
  const onLeave = () => {
    mouse.active = false
    mouse.x = -1000
    mouse.y = -1000
  }
  const hitTest = (x, y, pad) => {
    if (Math.hypot(x - cx, y - cy) < 22 * unit) return 'sun'
    for (const p of planets) {
      if (Math.hypot(x - p.x, y - p.y) < p.s + pad) return p
    }
    return null
  }
  const onDblClick = (e) => {
    const hit = hitTest(e.offsetX, e.offsetY, 8)
    if (hit === 'sun') {
      // Sun easter egg: flare + orbital boost (and, a few seconds later, a ship)
      bursts.push({ x: cx, y: cy, age: 0, max: 90, big: true })
      solarBoost = 1
    } else if (hit) {
      bursts.push({ x: hit.x, y: hit.y, age: 0, max: 60, big: false })
      dust.forEach((d) => {
        const dx = d.x - hit.x
        const dy = d.y - hit.y
        const dist = Math.hypot(dx, dy)
        if (dist < 200 && dist > 0) {
          const force = ((200 - dist) / 200) * 6
          d.vx += (dx / dist) * force
          d.vy += (dy / dist) * force
        }
      })
    }
  }
  canvas.addEventListener('mousemove', onMove)
  canvas.addEventListener('mouseleave', onLeave)
  canvas.addEventListener('dblclick', onDblClick)

  // ----- Drawing -----
  const setFont = (px, spacing) => {
    ctx.font = `500 ${px}px ${FONT}`
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`
  }

  const drawDust = () => {
    dust.forEach((d) => {
      if (mouse.active) {
        const dx = d.x - mouse.x
        const dy = d.y - mouse.y
        const dist = Math.hypot(dx, dy)
        if (dist < 100 && dist > 0) {
          const force = ((100 - dist) / 100) * 0.06 * dt
          d.vx += (dx / dist) * force
          d.vy += (dy / dist) * force
        }
      }
      const damping = Math.pow(0.97, dt)
      d.vx *= damping
      d.vy *= damping
      if (Math.hypot(d.vx, d.vy) < 0.04) {
        d.vx += (Math.random() - 0.5) * 0.02 * dt
        d.vy += (Math.random() - 0.5) * 0.02 * dt
      }
      d.x += d.vx * dt
      d.y += d.vy * dt
      d.pulse += 0.01 * dt
      if (d.x < 0) d.x = W
      if (d.x > W) d.x = 0
      if (d.y < 0) d.y = H
      if (d.y > H) d.y = 0
      const op = d.opacity * (0.6 + Math.sin(d.pulse) * 0.4)
      ctx.beginPath()
      ctx.arc(d.x, d.y, d.r, 0, TAU)
      ctx.fillStyle = rgba(d.warm ? C.ember : C.bone, op)
      ctx.fill()
    })
  }

  const drawSparkles = () => {
    ctx.lineWidth = 0.5
    sparkles.forEach((sp) => {
      const a = sp.base * (0.55 + 0.45 * Math.sin(time * 0.018 + sp.phase))
      const x = sp.fx * W
      const y = sp.fy * H
      ctx.beginPath()
      ctx.moveTo(x - sp.len, y)
      ctx.lineTo(x + sp.len, y)
      ctx.moveTo(x, y - sp.len)
      ctx.lineTo(x, y + sp.len)
      ctx.strokeStyle = rgba(C.pale, a)
      ctx.stroke()
      ctx.fillStyle = rgba(C.light, Math.min(1, a * 1.8))
      ctx.fillRect(x - 0.5, y - 0.5, 1, 1)
    })
  }

  /** Two faint axes through the sun, reaching just past Saturn's orbit. */
  const drawFrame = (k) => {
    const R = scale * 0.48 * 1.08
    ctx.lineWidth = 0.6
    ctx.beginPath()
    ctx.moveTo(...project(Math.PI, R * k))
    ctx.lineTo(...project(0, R * k))
    ctx.strokeStyle = rgba(C.bone, 0.09 * k)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(...project(Math.PI / 2, R * k))
    ctx.lineTo(...project(-Math.PI / 2, R * k))
    ctx.strokeStyle = rgba(C.bone, 0.06 * k)
    ctx.stroke()
  }

  /** Hairline orbit plus a bright arc trailing behind the planet. */
  const drawOrbit = (p, k) => {
    const r = p.orbit * scale
    const hot = hovered === p
    ctx.lineWidth = 0.6
    ctx.beginPath()
    orbitPath(r, p.angle, p.angle + TAU * k)
    ctx.strokeStyle = hot ? rgba(C.ember, 0.42) : rgba(C.bone, 0.13)
    ctx.stroke()

    // Trail: short segments fading out — canvas can't gradient along a path.
    const SEG = 28
    const span = 1.25
    ctx.lineWidth = 0.9
    for (let i = 0; i < SEG; i++) {
      const fade = Math.pow(1 - i / SEG, 1.7)
      ctx.beginPath()
      orbitPath(r, p.angle - (span * (i + 1)) / SEG, p.angle - (span * i) / SEG)
      ctx.strokeStyle = rgba(C.emberBright, 0.62 * fade * k)
      ctx.stroke()
    }
  }

  const drawBelt = (k) => {
    const boost = 1 + solarBoost * 4
    belt.forEach((b) => { b.angle += b.speed * boost * dt })
    ctx.lineWidth = 0.5
    for (let level = 0; level < 3; level++) {
      ctx.beginPath()
      for (const b of belt) {
        if (b.level !== level) continue
        const r = b.orbit * scale
        ctx.moveTo(...project(b.angle - b.len, r))
        orbitPath(r, b.angle - b.len, b.angle)
      }
      ctx.strokeStyle = rgba(C.bone, [0.1, 0.2, 0.34][level] * k)
      ctx.stroke()
    }
    ctx.fillStyle = rgba(C.pale, 0.75 * k)
    for (const b of belt) {
      if (!b.head) continue
      const [x, y] = project(b.angle, b.orbit * scale)
      ctx.fillRect(x - 0.55, y - 0.55, 1.1, 1.1)
    }
  }

  /** Saturn's rings lie in its equator: half behind the globe, half in front. */
  const drawRings = (p, front) => {
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(-p.roll)
    const a0 = front ? 0 : Math.PI
    for (const [radius, alpha, width] of RINGS) {
      ctx.beginPath()
      ctx.ellipse(0, 0, p.s * radius, p.s * radius * SIN_TIP, 0, a0, a0 + Math.PI)
      ctx.strokeStyle = rgba(p.lit, alpha)
      ctx.lineWidth = width
      ctx.stroke()
    }
    ctx.restore()
  }

  /**
   * A stippled globe. The dots live on a sphere that turns about the planet's
   * axis (p.spinAngle), so the surface visibly rotates; each dot's ink follows
   * the sunlight, which is what gives the disc its volume.
   */
  const drawPlanet = (p) => {
    const { x, y, s, m, globe } = p
    if (p.rings) drawRings(p, false)

    // Light arrives from the sun, nudged toward the viewer so a little more
    // than half the globe is lit. Screen-space vector, y-up.
    let lx = cx - x
    let ly = y - cy
    const ll = Math.hypot(lx, ly) || 1
    lx = (lx / ll) * 0.93
    ly = (ly / ll) * 0.93
    const lz = 0.37

    // Axis pin behind the globe (south end)
    const ax = m[1] / COS_TIP
    const ay = -m[4] / COS_TIP
    ctx.lineWidth = 0.6
    ctx.strokeStyle = rgba(p.lit, 0.45)
    ctx.beginPath()
    ctx.moveTo(x - ax * s, y - ay * s)
    ctx.lineTo(x - ax * s * 1.45, y - ay * s * 1.45)
    ctx.stroke()

    // Disc: hides the orbits behind it, with a soft wash of daylight
    ctx.beginPath()
    ctx.arc(x, y, s, 0, TAU)
    ctx.fillStyle = rgba(p.night, 1)
    ctx.fill()
    const wash = ctx.createRadialGradient(x + lx * s * 0.55, y - ly * s * 0.55, 0, x + lx * s * 0.2, y - ly * s * 0.2, s * 1.25)
    wash.addColorStop(0, rgba(p.lit, 0.3))
    wash.addColorStop(1, rgba(p.lit, 0))
    ctx.fillStyle = wash
    ctx.fill()

    // Stipples: spin about the axis, tip toward the viewer, shade, bucket
    const cs = Math.cos(p.spinAngle)
    const sn = Math.sin(p.spinAngle)
    const dot = 1
    const half = dot / 2
    const { count, pts, screen, bucket } = globe
    for (let i = 0; i < count; i++) {
      const o = i * 5
      const x1 = pts[o] * cs + pts[o + 2] * sn
      const y1 = pts[o + 1]
      const z1 = -pts[o] * sn + pts[o + 2] * cs
      const Z = m[7] * y1 + m[8] * z1
      if (Z < 0.04) {
        bucket[i] = -1
        continue
      }
      const X = m[0] * x1 + m[1] * y1 + m[2] * z1
      const Y = m[3] * x1 + m[4] * y1 + m[5] * z1
      const ink = pts[o + 3] * (0.07 + 0.93 * smooth(-0.22, 0.5, X * lx + Y * ly + Z * lz))
      bucket[i] = pts[o + 4] * 4 + Math.min(3, (ink * 4) | 0)
      screen[i * 2] = x + X * s - half
      screen[i * 2 + 1] = y - Y * s - half
    }
    for (let b = 0; b < 8; b++) {
      let any = false
      ctx.beginPath()
      for (let i = 0; i < count; i++) {
        if (bucket[i] !== b) continue
        ctx.rect(screen[i * 2], screen[i * 2 + 1], dot, dot)
        any = true
      }
      if (!any) continue
      ctx.fillStyle = rgba(b < 4 ? p.lit : p.accent, INK_LEVELS[b & 3])
      ctx.fill()
    }

    // Limb: a faint full outline, a firmer arc on the sunward side
    ctx.beginPath()
    ctx.arc(x, y, s, 0, TAU)
    ctx.strokeStyle = rgba(p.lit, 0.25)
    ctx.lineWidth = 0.5
    ctx.stroke()
    const sunward = Math.atan2(-ly, lx)
    ctx.beginPath()
    ctx.arc(x, y, s, sunward - 1.25, sunward + 1.25)
    ctx.strokeStyle = rgba(p.lit, 0.8)
    ctx.lineWidth = 0.7
    ctx.stroke()

    // Axis pin in front (north end, from the visible pole outward)
    ctx.lineWidth = 0.6
    ctx.strokeStyle = rgba(p.lit, 0.55)
    ctx.beginPath()
    ctx.moveTo(x + ax * s * COS_TIP, y + ay * s * COS_TIP)
    ctx.lineTo(x + ax * s * 1.45, y + ay * s * 1.45)
    ctx.stroke()

    if (p.rings) drawRings(p, true)

    if (p.moon) {
      const mn = p.moon
      const mr = mn.orbit * scale
      ctx.beginPath()
      ctx.ellipse(x, y, mr, mr * SQUASH, TILT, 0, TAU)
      ctx.strokeStyle = rgba(C.bone, 0.16)
      ctx.lineWidth = 0.5
      ctx.stroke()
      const ex = Math.cos(mn.angle) * mr
      const ey = Math.sin(mn.angle) * mr * SQUASH
      ctx.beginPath()
      ctx.arc(x + ex * cosT - ey * sinT, y + ex * sinT + ey * cosT, mn.size * unit, 0, TAU)
      ctx.fillStyle = rgba(C.pale, 0.9)
      ctx.fill()
    }
  }

  /** The sun: a disc with sunspots inside a regular engraved sunburst. */
  const drawSun = (k) => {
    const boost = 1 + solarBoost * 0.8
    const R = 11 * unit
    sunRotation += 0.004 * (1 + solarBoost * 4) * dt

    const glowR = 110 * unit * boost * (1 + Math.sin(time * 0.02) * 0.05)
    const glow = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, glowR)
    glow.addColorStop(0, rgba(C.emberBright, 0.3 * k))
    glow.addColorStop(0.35, rgba(C.ember, 0.09 * k))
    glow.addColorStop(1, rgba(C.ember, 0))
    ctx.beginPath()
    ctx.arc(cx, cy, glowR, 0, TAU)
    ctx.fillStyle = glow
    ctx.fill()

    // Sunburst: evenly spaced hairline rays in a fixed long / short rhythm.
    // The whole wheel turns slowly and every ray breathes together, so the
    // outline stays a clean circle — it never warps. One radial gradient as
    // the stroke fades each ray out with distance.
    const breathe = 1 + Math.sin(time * 0.015) * 0.035
    const reach = R * 4.6 * boost
    const fade = ctx.createRadialGradient(cx, cy, R, cx, cy, reach)
    fade.addColorStop(0, rgba(C.emberBright, 0.95 * k))
    fade.addColorStop(0.45, rgba(C.ember, 0.4 * k))
    fade.addColorStop(1, rgba(C.ember, 0))
    const RAYS = 96
    const turn = time * 0.0012
    const inner = R + 3.4 * unit
    ctx.beginPath()
    for (let i = 0; i < RAYS; i++) {
      const a = turn + (i / RAYS) * TAU
      // Rhythm of 8: one long, one medium, the rest short
      const tier = i % 8 === 0 ? 1 : i % 4 === 0 ? 0.74 : i % 2 === 0 ? 0.52 : 0.38
      const len = (inner + (reach - inner) * tier) * breathe
      const c = Math.cos(a)
      const sn = Math.sin(a)
      ctx.moveTo(cx + c * inner, cy + sn * inner)
      ctx.lineTo(cx + c * len, cy + sn * len)
    }
    ctx.strokeStyle = fade
    ctx.lineWidth = 0.5
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx, cy, R + 1.8 * unit, 0, TAU)
    ctx.strokeStyle = rgba(C.emberBright, (hovered === 'sun' ? 1 : 0.6) * k)
    ctx.lineWidth = 0.6
    ctx.stroke()

    const body = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.25, 0, cx, cy, R)
    body.addColorStop(0, rgba(C.light, k))
    body.addColorStop(1, rgba(C.emberBright, k))
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, TAU)
    ctx.fillStyle = body
    ctx.fill()

    // Sunspots crossing the disc: the sun rotates too
    ctx.fillStyle = rgba(C.emberDeep, 0.8 * k)
    sunspots.forEach((spot) => {
      const lon = spot.lon + sunRotation
      const depth = Math.cos(spot.lat) * Math.cos(lon)
      if (depth < 0.15) return
      ctx.beginPath()
      ctx.ellipse(
        cx + Math.cos(spot.lat) * Math.sin(lon) * R,
        cy - Math.sin(spot.lat) * R,
        1.5 * unit * depth,
        1.5 * unit,
        0,
        0,
        TAU
      )
      ctx.fill()
    })
  }

  /** `01 EARTH` + data line on a short leader; only drawn while hovered. */
  const drawLabel = (x, y, s, index, name, data, hot, alpha) => {
    const x1 = x + s * 0.72 + 2
    const y1 = y - s * 0.72 - 2
    const x2 = x1 + 9
    const y2 = y1 - 9
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x2 + 10, y2)
    ctx.strokeStyle = hot ? rgba(C.emberBright, 0.85 * alpha) : rgba(C.bone, 0.4 * alpha)
    ctx.lineWidth = 0.6
    ctx.stroke()

    setFont(9, 1.6)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    let tx = x2 + 15
    if (index) {
      ctx.fillStyle = rgba(C.ember, (hot ? 1 : 0.8) * alpha)
      ctx.fillText(index, tx, y2)
      tx += ctx.measureText(index).width + 5
    }
    ctx.fillStyle = hot ? rgba(C.light, alpha) : rgba(C.pale, 0.68 * alpha)
    ctx.fillText(name.toUpperCase(), tx, y2)
    if (hot && data) {
      setFont(8, 1.2)
      ctx.fillStyle = rgba(C.bone, alpha)
      ctx.fillText(data, x2 + 15, y2 + 13)
    }
  }

  /** Hover: a broken reticle round the body and a dashed radius to the sun. */
  const drawReticle = (p) => {
    ctx.save()
    ctx.setLineDash([2, 4])
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(p.x, p.y)
    ctx.strokeStyle = rgba(C.ember, 0.4)
    ctx.lineWidth = 0.6
    ctx.stroke()
    ctx.restore()
    const r = p.rings ? p.s * 2.45 : p.s + 7
    ctx.strokeStyle = rgba(C.emberBright, 0.85)
    ctx.lineWidth = 0.7
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + Math.PI / 4
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, a - 0.42, a + 0.42)
      ctx.stroke()
    }
  }

  const drawMeteors = () => {
    if (time > nextMeteorTime) {
      // Meteors only enter from the top corners and fly diagonally downward.
      const fromLeft = Math.random() > 0.5
      const mx = fromLeft ? -20 + Math.random() * W * 0.3 : W * 0.7 + Math.random() * W * 0.3 + 20
      const my = -20 + Math.random() * H * 0.2
      const slope = Math.PI / 6 + Math.random() * (Math.PI / 6)
      const angle = fromLeft ? slope : Math.PI - slope
      const speed = 11 + Math.random() * 4
      const big = Math.random() < 0.04
      meteors.push({
        x: mx,
        y: my,
        vx: Math.cos(angle) * speed * (big ? 0.7 : 1),
        vy: Math.sin(angle) * speed * (big ? 0.7 : 1),
        life: 0,
        maxLife: big ? 90 : 55,
        trail: [],
        big,
      })
      // Next one 8–15 seconds out (time is in 60fps frames)
      nextMeteorTime = time + 480 + Math.random() * 420
    }

    meteors = meteors.filter((m) => {
      recordTrail(m, m.big ? 18 : 12)
      m.x += m.vx * dt
      m.y += m.vy * dt
      m.life += dt
      for (let i = 0; i < m.trail.length - 1; i++) {
        const t = i / m.trail.length
        ctx.beginPath()
        ctx.moveTo(m.trail[i].x, m.trail[i].y)
        ctx.lineTo(m.trail[i + 1].x, m.trail[i + 1].y)
        ctx.strokeStyle = rgba(C.ember, t * (m.big ? 0.7 : 0.55))
        ctx.lineWidth = (m.big ? 1.6 : 1) * t + 0.2
        ctx.stroke()
      }
      const headR = m.big ? 5 : 3.2
      const head = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, headR)
      head.addColorStop(0, rgba(C.light, 1))
      head.addColorStop(0.4, rgba(C.emberBright, 0.6))
      head.addColorStop(1, rgba(C.emberBright, 0))
      ctx.beginPath()
      ctx.arc(m.x, m.y, headR, 0, TAU)
      ctx.fillStyle = head
      ctx.fill()
      return !(m.life > m.maxLife || m.x < -50 || m.x > W + 50 || m.y < -50 || m.y > H + 50)
    })
  }

  const drawShips = () => {
    // Summoned a few seconds after a sun double-click.
    if (solarBoost > 0.4 && shipSummonTimer === 0) {
      shipSummonTimer = time + 280 + Math.random() * 120
    }
    if (shipSummonTimer > 0 && time >= shipSummonTimer) {
      const fromLeft = Math.random() > 0.5
      ships.push({
        x: fromLeft ? -40 : W + 40,
        y: H * (0.2 + Math.random() * 0.6),
        vx: fromLeft ? 0.6 : -0.6,
        blink: 0,
        trail: [],
      })
      shipSummonTimer = 0
    }

    const hull = mix(C.void, C.signal, 0.35)
    const hullLine = mix(C.signal, C.light, 0.45)
    ships = ships.filter((s) => {
      s.x += s.vx * dt
      s.blink += 0.08 * dt
      recordTrail(s, 60)
      for (let i = 0; i < s.trail.length - 1; i++) {
        const t = i / s.trail.length
        ctx.beginPath()
        ctx.moveTo(s.trail[i].x, s.trail[i].y)
        ctx.lineTo(s.trail[i + 1].x, s.trail[i + 1].y)
        ctx.strokeStyle = rgba(hullLine, t * 0.18)
        ctx.lineWidth = t * 0.8 + 0.1
        ctx.stroke()
      }
      // Small horizontal sliver with one red beacon
      const w = 9
      const h = 1.6
      ctx.save()
      ctx.translate(s.x, s.y)
      if (s.vx < 0) ctx.scale(-1, 1)
      ctx.beginPath()
      ctx.moveTo(-w, 0)
      ctx.lineTo(w * 0.6, -h)
      ctx.lineTo(w, 0)
      ctx.lineTo(w * 0.6, h)
      ctx.closePath()
      ctx.fillStyle = rgba(hull, 1)
      ctx.fill()
      ctx.strokeStyle = rgba(hullLine, 0.8)
      ctx.lineWidth = 0.5
      ctx.stroke()
      if (Math.sin(s.blink) > 0.3) {
        ctx.beginPath()
        ctx.arc(-w + 1, 0, 1.2, 0, TAU)
        ctx.fillStyle = rgba(BEACON, 1)
        ctx.fill()
        const beacon = ctx.createRadialGradient(-w + 1, 0, 0, -w + 1, 0, 6)
        beacon.addColorStop(0, rgba(BEACON, 0.5))
        beacon.addColorStop(1, rgba(BEACON, 0))
        ctx.beginPath()
        ctx.arc(-w + 1, 0, 6, 0, TAU)
        ctx.fillStyle = beacon
        ctx.fill()
      }
      ctx.restore()
      return !(s.x < -100 || s.x > W + 100)
    })
  }

  /** Double-click ripples, spreading in the orbital plane. */
  const drawBursts = (raw) => {
    bursts = bursts.filter((b) => {
      b.age += raw
      const progress = b.age / b.max
      if (progress >= 1) return false
      const radius = progress * (b.big ? 380 : 190)
      const opacity = (1 - progress) * (b.big ? 0.7 : 0.5)
      ctx.beginPath()
      ctx.ellipse(b.x, b.y, radius, radius * SQUASH, TILT, 0, TAU)
      ctx.strokeStyle = rgba(C.emberBright, opacity)
      ctx.lineWidth = 1.4 * (1 - progress) + 0.3
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(b.x, b.y, radius * 0.6, radius * 0.6 * SQUASH, TILT, 0, TAU)
      ctx.strokeStyle = rgba(C.emberBright, opacity * 0.5)
      ctx.lineWidth = 0.5
      ctx.stroke()
      return true
    })
  }

  // ----- Frame -----
  const frame = (now) => {
    // Clamp so a backgrounded tab doesn't jump everything forward on return.
    const raw = lastFrame ? Math.min((now - lastFrame) / FRAME_MS, 3) : 1
    lastFrame = now
    dt = raw
    time += dt
    intro = calm ? 1 : Math.min(1, intro + raw / 200)
    solarBoost *= Math.pow(0.96, dt)
    const speed = 1 + solarBoost * 4

    // Gentle parallax: the chart leans a few pixels away from the pointer.
    const targetX = mouse.active && !calm ? (mouse.x / W - 0.5) * -16 : 0
    const targetY = mouse.active && !calm ? (mouse.y / H - 0.5) * -10 : 0
    const ease = 1 - Math.pow(0.94, raw)
    parallax.x += (targetX - parallax.x) * ease
    parallax.y += (targetY - parallax.y) * ease
    cx = cx0 + parallax.x
    cy = cy0 + parallax.y

    ctx.clearRect(0, 0, W, H)
    drawDust()
    drawSparkles()
    drawFrame(easeOut(intro * 1.15))

    // Advance, project, and stagger each planet's entrance from the sun out.
    planets.forEach((p, i) => {
      p.angle += (0.003 / p.period) * speed * dt
      p.spinAngle += p.spin * speed * dt
      if (p.moon) p.moon.angle += (0.01 / p.moon.period) * speed * dt
      p.depth = Math.sin(p.angle) // +1 nearest the viewer, -1 behind the sun
      ;[p.x, p.y] = project(p.angle, p.orbit * scale)
      p.s = p.size * unit * (1 + 0.1 * p.depth)
      p.k = easeOut(intro * 1.7 - i * 0.11)
    })
    hovered = mouse.active ? hitTest(mouse.x, mouse.y, 8) : null

    planets.forEach((p) => drawOrbit(p, p.k))
    drawBelt(easeOut(intro * 1.5 - 0.3))

    const byDepth = [...planets].sort((a, b) => a.depth - b.depth)
    const paint = (p) => {
      ctx.globalAlpha = p.k * (0.84 + 0.16 * p.depth)
      drawPlanet(p)
      ctx.globalAlpha = 1
    }
    byDepth.filter((p) => p.depth < 0).forEach(paint)
    drawSun(easeOut(intro * 2.2))
    byDepth.filter((p) => p.depth >= 0).forEach(paint)

    if (hovered && hovered !== 'sun') drawReticle(hovered)
    // Labels stay out of the picture until a body is pointed at, then fade in
    // (and back out) over a few frames.
    const labelEase = 1 - Math.pow(0.8, raw)
    planets.forEach((p) => {
      p.labelK += ((hovered === p ? 1 : 0) - p.labelK) * labelEase
      if (p.labelK > 0.02) {
        drawLabel(p.x, p.y, p.rings ? p.s * 1.75 : p.s, p.index, p.name, p.data, true, p.labelK)
      }
    })
    sunLabelK += ((hovered === 'sun' ? 1 : 0) - sunLabelK) * labelEase
    if (sunLabelK > 0.02) drawLabel(cx, cy, 24 * unit, '', 'Sol', 'Center of system', true, sunLabelK)

    drawMeteors()
    drawShips()
    drawBursts(raw)

    raf = requestAnimationFrame(frame)
  }

  // Only run while the hero is on screen.
  const visibility = new IntersectionObserver(([entry]) => {
    cancelAnimationFrame(raf)
    if (entry.isIntersecting) {
      lastFrame = 0
      raf = requestAnimationFrame(frame)
    }
  })
  visibility.observe(canvas)

  return () => {
    cancelAnimationFrame(raf)
    visibility.disconnect()
    resizeObserver.disconnect()
    motionMq.removeEventListener('change', onMotionChange)
    canvas.removeEventListener('mousemove', onMove)
    canvas.removeEventListener('mouseleave', onLeave)
    canvas.removeEventListener('dblclick', onDblClick)
  }
}

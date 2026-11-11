import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import ControlPanel from './ControlPanel.jsx'
import Planet from './scene/Planet.jsx'
import Clouds from './scene/Clouds.jsx'
import Atmosphere from './scene/Atmosphere.jsx'
import { Moon, Satellite } from './scene/Orbiters.jsx'
import { Starfield, Lights } from './scene/Sky.jsx'
import { usePlanetGeometry } from './lib/usePlanetGeometry.js'
import {
  defaultParams,
  randomSeed,
  REBUILD_KEYS,
  PASSES_DESKTOP,
  PASSES_MOBILE,
  EXPORT_SEGMENTS,
} from './params.js'
import { SCENE } from './palette.js'
import './PlanetGenerator.css'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Must match .pg-panel width and the 720px breakpoint in PlanetGenerator.css.
const PANEL_WIDTH = 300
const NARROW_QUERY = '(max-width: 720px)'

const isLowPower = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768)

/**
 * Framing that doesn't touch the orbit pivot:
 * - shift the projection centre right so the planet sits in the space the
 *   overlay panel leaves free;
 * - on portrait stages, widen the view so the planet fits horizontally
 *   (the camera's fov is vertical).
 */
function CameraRig({ shiftPx }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  useLayoutEffect(() => {
    const aspect = size.width / size.height
    camera.zoom = Math.min(1, aspect * 1.05)
    if (shiftPx) camera.setViewOffset(size.width, size.height, -shiftPx, 0, size.width, size.height)
    else camera.clearViewOffset()
    camera.updateProjectionMatrix()
  }, [camera, size, shiftPx])
  return null
}

/** In demand mode, redraw once whenever anything that affects the image changes. */
function Invalidate({ deps }) {
  const invalidate = useThree((s) => s.invalidate)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => invalidate(), deps)
  return null
}

function Scene({ params, geometry, zoomEnabled }) {
  const { size, spin, animate, relief, seed } = params
  return (
    <>
      <color attach="background" args={[SCENE.background]} />
      <Lights />
      {params.showStars && <Starfield />}

      {/* Size scales the whole system: surface, clouds, air and orbits. */}
      <group scale={size}>
        <Planet geometry={geometry} spin={spin} animate={animate} />
        {params.showClouds && (
          <Clouds
            seed={seed}
            coverage={params.clouds}
            relief={relief}
            spin={spin}
            animate={animate}
          />
        )}
        {params.showAtmosphere && <Atmosphere relief={relief} />}
        {params.showMoon && <Moon seed={seed} animate={animate} />}
        {params.showSatellite && <Satellite animate={animate} />}
      </group>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={zoomEnabled}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        zoomSpeed={0.7}
        minDistance={1.45 * size + 0.35}
        maxDistance={10}
      />
    </>
  )
}

/**
 * Interactive port of the UE5 planet generator.
 * Heights and colours are computed on the CPU (in a worker) and written into
 * the vertices, so what you see is exactly what the OBJ export contains.
 * Loaded lazily from ProjectFeature — three.js never ships with other pages.
 */
export default function PlanetGenerator() {
  const rootRef = useRef(null)
  const [params, setParams] = useState(() => defaultParams(prefersReducedMotion()))
  const [passes] = useState(() => (isLowPower() ? PASSES_MOBILE : PASSES_DESKTOP))
  const [panelOpen, setPanelOpen] = useState(() => !isLowPower())
  const [visible, setVisible] = useState(false)
  const [engaged, setEngaged] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [exporting, setExporting] = useState(false)
  // Below 720px the panel stacks under the canvas instead of overlaying it.
  const [narrow, setNarrow] = useState(() => window.matchMedia(NARROW_QUERY).matches)
  const [coarse] = useState(() => window.matchMedia('(pointer: coarse)').matches)

  useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY)
    const update = () => setNarrow(mq.matches)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Only the mesh-affecting values go to the worker.
  const buildParams = useMemo(() => {
    const p = { seed: params.seed }
    for (const k of REBUILD_KEYS) p[k] = params[k]
    return p
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.seed, ...REBUILD_KEYS.map((k) => params[k])])
  const { geometry, ms, refining, buildForExport } = usePlanetGeometry(buildParams, passes)

  // Stop rendering entirely while scrolled off-screen.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: '100px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === rootRef.current)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const onChange = useCallback((key, value) => setParams((p) => ({ ...p, [key]: value })), [])
  const onRandomize = useCallback(() => setParams((p) => ({ ...p, seed: randomSeed() })), [])

  const onExport = useCallback(async () => {
    if (!geometry) return
    setExporting(true)
    try {
      const [{ exportPlanetOBJ }, mesh] = await Promise.all([
        import('./lib/exportPlanet.js'),
        buildForExport(buildParams, EXPORT_SEGMENTS),
      ])
      exportPlanetOBJ(mesh, params.seed)
      mesh.dispose()
    } finally {
      setExporting(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry, buildParams, params.seed])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else rootRef.current?.requestFullscreen?.()
  }

  const frameloop = !visible ? 'never' : params.animate ? 'always' : 'demand'
  // Wheel-zoom only after the visitor clicks into the canvas, so scrolling the
  // case study past the planet never gets hijacked. Always on in fullscreen,
  // and always on for touch (pinch can't hijack page scroll).
  const zoomEnabled = engaged || fullscreen || coarse

  return (
    <div ref={rootRef} className={`pg ${fullscreen ? 'pg--fullscreen' : ''}`}>
      <div
        className="pg__stage"
        onPointerDown={() => setEngaged(true)}
        onPointerLeave={() => setEngaged(false)}
      >
        <Canvas
          className="pg__canvas"
          frameloop={frameloop}
          // Per-pixel terrain is fragment-heavy: phones cap at 1.5× density.
          dpr={[1, coarse ? 1.5 : 2]}
          flat
          camera={{ position: [0, 0.4, 4.6], fov: 38, near: 0.05, far: 300 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          role="img"
          aria-label="Procedurally generated planet. Drag to rotate; click, then scroll to zoom."
        >
          <Scene params={params} geometry={geometry} zoomEnabled={zoomEnabled} />
          <CameraRig shiftPx={panelOpen && !narrow ? PANEL_WIDTH / 2 : 0} />
          <Invalidate deps={[params, geometry, zoomEnabled, panelOpen, narrow]} />
        </Canvas>

        {!geometry && <p className="pg__status mono">Generating…</p>}

        <p className="pg__hint mono" aria-hidden="true">
          Drag · Rotate <span className="pg__hint-sep">/</span>
          {coarse ? 'Pinch · Zoom' : zoomEnabled ? 'Scroll · Zoom' : 'Click, then scroll · Zoom'}
        </p>

        <button
          type="button"
          className="pg__fs mono"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            {fullscreen ? (
              <path d="M4 1 V4 H1 M8 1 V4 H11 M4 11 V8 H1 M8 11 V8 H11" stroke="currentColor" />
            ) : (
              <path d="M1 4 V1 H4 M8 1 H11 V4 M1 8 V11 H4 M11 8 V11 H8" stroke="currentColor" />
            )}
          </svg>
        </button>
      </div>

      <ControlPanel
        params={params}
        onChange={onChange}
        onRandomize={onRandomize}
        onExport={onExport}
        exporting={exporting}
        canExport={!!geometry}
        stats={geometry ? { verts: geometry.getAttribute('position').count, ms, refining } : null}
        open={panelOpen}
        onToggleOpen={() => setPanelOpen((o) => !o)}
      />
    </div>
  )
}

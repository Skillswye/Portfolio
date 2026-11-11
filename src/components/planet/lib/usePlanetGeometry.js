import { useEffect, useRef, useState } from 'react'
import { BufferGeometry, BufferAttribute } from 'three'

const DEBOUNCE_MS = 150

/**
 * Owns the mesh worker. Returns the current surface geometry.
 * - Requests are debounced (150 ms) so a slider drag triggers one rebuild.
 * - `passes` is e.g. [64, 256]: a fast preview, then the full-res mesh.
 *   The worker cancels an in-flight high-res pass when a newer request lands,
 *   and replies from superseded requests are ignored here.
 * - The previous geometry is disposed after React has swapped in the new one.
 */
export function usePlanetGeometry(buildParams, passes) {
  const [result, setResult] = useState({ geometry: null, ms: 0, refining: true })
  const workerRef = useRef(null)
  const idRef = useRef(0)
  const pendingRef = useRef(null)
  const firstRef = useRef(true)
  const paramsById = useRef(new Map())
  const exportJobs = useRef(new Map())

  useEffect(() => {
    const worker = new Worker(new URL('./planet.worker.js', import.meta.url), { type: 'module' })
    workerRef.current = worker

    worker.onmessage = (e) => {
      if (e.data.type === 'export') {
        const job = exportJobs.current.get(e.data.id)
        exportJobs.current.delete(e.data.id)
        job?.resolve(toGeometry(e.data))
        return
      }
      const { id, final, ms } = e.data
      if (id !== idRef.current) return // superseded
      const g = toGeometry(e.data)
      // Tag the mesh with the params that built it (drives per-pixel colour).
      g.userData.params = paramsById.current.get(id)
      if (final) paramsById.current.delete(id)
      setResult({ geometry: g, ms, refining: !final })
    }

    // A request issued before the worker existed (StrictMode remount).
    if (pendingRef.current) {
      worker.postMessage(pendingRef.current)
      pendingRef.current = null
    }

    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  // Stable key: only rebuild-relevant values trigger work.
  const key = JSON.stringify([passes, buildParams])
  useEffect(() => {
    // First build goes out immediately; later ones wait for the slider to settle.
    const delay = firstRef.current ? 0 : DEBOUNCE_MS
    firstRef.current = false
    const t = setTimeout(() => {
      const msg = { id: ++idRef.current, passes, params: buildParams }
      paramsById.current.clear()
      paramsById.current.set(msg.id, buildParams)
      setResult((r) => (r.refining ? r : { ...r, refining: true }))
      if (workerRef.current) workerRef.current.postMessage(msg)
      else pendingRef.current = msg
    }, delay)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Dispose each geometry once it has been replaced (or on unmount).
  const { geometry } = result
  useEffect(() => () => geometry?.dispose(), [geometry])

  /**
   * One-off build for export at its own (lighter) resolution. Does not touch
   * the displayed mesh or cancel its refinement.
   */
  function buildForExport(params, segments) {
    const worker = workerRef.current
    if (!worker) return Promise.reject(new Error('worker not ready'))
    const id = 'export-' + Date.now()
    return new Promise((resolve) => {
      exportJobs.current.set(id, { resolve })
      worker.postMessage({ type: 'export', id, segments, params })
    })
  }

  return { ...result, buildForExport }
}

function toGeometry({ positions, normals, colors, index }) {
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(positions, 3))
  g.setAttribute('normal', new BufferAttribute(normals, 3))
  // Vertex colours only on export builds; the screen uses per-pixel colour.
  if (colors) g.setAttribute('color', new BufferAttribute(colors, 3))
  g.setIndex(new BufferAttribute(index, 1))
  g.computeBoundingSphere()
  return g
}

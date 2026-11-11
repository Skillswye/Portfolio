// ============================================
// Planet mesh worker — builds the cube-sphere off the main thread.
//
// Each request carries a list of passes, e.g. [64, 256]: a quick preview
// first, then the full-resolution mesh. The high-res pass runs in chunks and
// yields between them, so a newer request (slider moved again) cancels it
// instead of queueing behind ~0.5 s of stale work.
// ============================================

import { BoxGeometry, BufferGeometry, BufferAttribute } from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { createTerrainBuild } from './terrain.js'

const CHUNK = 24576 // vertices per slice between cancellation checks

// Unit-sphere directions + index, cached per segment count.
const baseCache = new Map()

function getBaseSphere(segments) {
  let base = baseCache.get(segments)
  if (base) return base

  const box = new BoxGeometry(2, 2, 2, segments, segments, segments)
  // Seam vertices on adjacent faces share a position but not a normal / uv.
  // Strip those attributes first or mergeVertices won't weld the seams.
  box.deleteAttribute('normal')
  box.deleteAttribute('uv')
  const merged = mergeVertices(box)
  box.dispose()

  // Weld on the cube, then project: seams are welded before displacement,
  // so every unique vertex gets its noise evaluated exactly once.
  const pos = merged.getAttribute('position')
  const dirs = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const l = Math.hypot(x, y, z)
    dirs[i * 3] = x / l
    dirs[i * 3 + 1] = y / l
    dirs[i * 3 + 2] = z / l
  }
  base = { dirs, index: merged.getIndex().array }
  merged.dispose()
  baseCache.set(segments, base)
  return base
}

const yieldToEvents = () => new Promise((r) => setTimeout(r, 0))

let latestId = 0

async function buildPass(id, segments, params, final) {
  const t0 = performance.now()
  const { dirs, index } = getBaseSphere(segments)
  const build = createTerrainBuild(dirs, params, { colors: false })

  for (let start = 0; start < build.count; start += CHUNK) {
    build.run(start, Math.min(start + CHUNK, build.count))
    if (final) {
      await yieldToEvents()
      if (id !== latestId) return false // superseded — drop it
    }
  }

  postMesh({ id, segments, final, ms: performance.now() - t0 }, build, index)
  return true
}

/** Normals from the displaced, welded mesh (no seams), then transfer. */
function postMesh(header, build, index) {
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(build.positions, 3))
  g.setIndex(new BufferAttribute(index, 1))
  g.computeVertexNormals()
  const normals = g.getAttribute('normal').array

  const { positions, colors } = build
  const indexCopy = index.slice()
  const transfer = [positions.buffer, normals.buffer, indexCopy.buffer]
  if (colors) transfer.push(colors.buffer)
  self.postMessage({ ...header, positions, normals, colors, index: indexCopy }, transfer)
}

self.onmessage = async (e) => {
  // Export: one synchronous build at its own resolution. Leaves latestId
  // alone so it never cancels the on-screen refinement.
  if (e.data.type === 'export') {
    const { id, segments, params } = e.data
    const { dirs, index } = getBaseSphere(segments)
    const build = createTerrainBuild(dirs, params)
    build.run(0, build.count)
    postMesh({ type: 'export', id }, build, index)
    return
  }

  const { id, passes, params } = e.data
  latestId = id
  for (let i = 0; i < passes.length; i++) {
    if (id !== latestId) return
    const ok = await buildPass(id, passes[i], params, i === passes.length - 1)
    if (!ok) return
    // Let a pending request in before starting the expensive pass.
    await yieldToEvents()
  }
}

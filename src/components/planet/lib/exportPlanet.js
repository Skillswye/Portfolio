// OBJ export of the planet surface only (positions, normals, vertex colours).
// three's OBJExporter writes vertex colours for Points but not for Meshes, so
// this is a small purpose-built writer. Colours use the de-facto
// `v x y z r g b` extension in sRGB 0–1 — Blender 3.6+, MeshLab and
// ZBrush read it; importers that don't simply ignore the extra columns.

const linearToSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055)
const f5 = (n) => n.toFixed(5)
const f3 = (n) => n.toFixed(3) // colours & normals: 3 dp is finer than 8-bit

export function planetToOBJ(geometry, name) {
  const pos = geometry.getAttribute('position')
  const nor = geometry.getAttribute('normal')
  const col = geometry.getAttribute('color')
  const idx = geometry.getIndex().array

  const lines = [`# Procedural planet — ${pos.count} vertices, ${idx.length / 3} triangles`, `o ${name}`]
  for (let i = 0; i < pos.count; i++) {
    lines.push(
      `v ${f5(pos.getX(i))} ${f5(pos.getY(i))} ${f5(pos.getZ(i))} ` +
        `${f3(linearToSrgb(col.getX(i)))} ${f3(linearToSrgb(col.getY(i)))} ${f3(linearToSrgb(col.getZ(i)))}`
    )
  }
  for (let i = 0; i < nor.count; i++) {
    lines.push(`vn ${f3(nor.getX(i))} ${f3(nor.getY(i))} ${f3(nor.getZ(i))}`)
  }
  // OBJ indices are 1-based; position and normal share an index.
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i] + 1
    const b = idx[i + 1] + 1
    const c = idx[i + 2] + 1
    lines.push(`f ${a}//${a} ${b}//${b} ${c}//${c}`)
  }
  return lines.join('\n') + '\n'
}

export function exportPlanetOBJ(geometry, seed) {
  const text = planetToOBJ(geometry, `planet_${seed}`)
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `planet-${seed}.obj`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

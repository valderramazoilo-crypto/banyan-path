import * as THREE from 'three'

// Builds ONE merged tapered-tube mesh geometry from the procedural branches.
// Each branch poly-line is swept with parallel-transport frames (no twisting)
// into a smooth tube; per-vertex attributes carry growth + depth so the shader
// can grow, light and fade the whole canopy in a single draw call.
export function buildTreeGeometry(branches, radialSegments = 6) {
  const positions = []
  const normals = []
  const growth = []
  const depth = []
  const indices = []
  let vertOffset = 0

  const up = new THREE.Vector3(0, 1, 0)
  const altUp = new THREE.Vector3(1, 0, 0)

  for (const b of branches) {
    const pts = b.pts
    const n = pts.length
    if (n < 2) continue

    // --- tangents ---
    const tangents = []
    for (let i = 0; i < n; i++) {
      const t = new THREE.Vector3()
      if (i < n - 1) t.subVectors(pts[i + 1], pts[i])
      else t.subVectors(pts[i], pts[i - 1])
      t.normalize()
      tangents.push(t)
    }

    // --- parallel-transport frames ---
    const normalsF = []
    const binormals = []
    let normal = new THREE.Vector3()
      .crossVectors(Math.abs(tangents[0].y) > 0.99 ? altUp : up, tangents[0])
      .normalize()
    for (let i = 0; i < n; i++) {
      if (i > 0) {
        // rotate previous normal by the rotation from tangent[i-1] to tangent[i]
        const axis = new THREE.Vector3().crossVectors(tangents[i - 1], tangents[i])
        const len = axis.length()
        if (len > 1e-5) {
          axis.divideScalar(len)
          const angle = Math.acos(
            THREE.MathUtils.clamp(tangents[i - 1].dot(tangents[i]), -1, 1)
          )
          normal.applyAxisAngle(axis, angle)
        }
      }
      // re-orthogonalise
      const bin = new THREE.Vector3().crossVectors(tangents[i], normal).normalize()
      normal = new THREE.Vector3().crossVectors(bin, tangents[i]).normalize()
      normalsF.push(normal.clone())
      binormals.push(bin)
    }

    // --- emit rings ---
    for (let i = 0; i < n; i++) {
      const r = THREE.MathUtils.lerp(b.r0, b.r1, i / (n - 1))
      const c = pts[i]
      const N = normalsF[i]
      const B = binormals[i]
      for (let j = 0; j < radialSegments; j++) {
        const a = (j / radialSegments) * Math.PI * 2
        const cos = Math.cos(a)
        const sin = Math.sin(a)
        const dir = new THREE.Vector3(
          cos * N.x + sin * B.x,
          cos * N.y + sin * B.y,
          cos * N.z + sin * B.z
        )
        positions.push(c.x + dir.x * r, c.y + dir.y * r, c.z + dir.z * r)
        normals.push(dir.x, dir.y, dir.z)
        growth.push(b.g[i])
        depth.push(b.depthN)
      }
    }

    // --- stitch ---
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < radialSegments; j++) {
        const jn = (j + 1) % radialSegments
        const a = vertOffset + i * radialSegments + j
        const bb = vertOffset + i * radialSegments + jn
        const c = vertOffset + (i + 1) * radialSegments + j
        const d = vertOffset + (i + 1) * radialSegments + jn
        indices.push(a, c, bb, bb, c, d)
      }
    }
    vertOffset += n * radialSegments
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geo.setAttribute('aGrowth', new THREE.Float32BufferAttribute(growth, 1))
  geo.setAttribute('aDepth', new THREE.Float32BufferAttribute(depth, 1))
  geo.setIndex(indices)
  return geo
}

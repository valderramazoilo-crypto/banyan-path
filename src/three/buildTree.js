import * as THREE from 'three'

// Turns the procedural branches into ONE LineSegments geometry — clean, modern,
// minimalist lines (not heavy tubes). Each vertex carries growth + depth so the
// shader can grow, glow and react to the cursor in a single draw call.
export function buildLineGeometry(branches) {
  const positions = []
  const growth = []
  const depth = []

  for (const b of branches) {
    const pts = b.pts
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i]
      const c = pts[i + 1]
      positions.push(a.x, a.y, a.z, c.x, c.y, c.z)
      growth.push(b.g[i], b.g[i + 1])
      depth.push(b.depthN, b.depthN)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('aGrowth', new THREE.Float32BufferAttribute(growth, 1))
  geo.setAttribute('aDepth', new THREE.Float32BufferAttribute(depth, 1))
  return geo
}

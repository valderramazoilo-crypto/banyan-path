import * as THREE from 'three'

// Main silhouette → one LineSegments geometry (clean glowing lines).
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

// Latent twigs → LineSegments. Each vertex stores its filament's `aBase` so the
// shader can sprout it OUT from the base only when the cursor is near.
export function buildFilamentGeometry(filaments) {
  const positions = []
  const bases = []
  const growth = []
  for (const f of filaments) {
    const pts = f.pts
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i]
      const c = pts[i + 1]
      positions.push(a.x, a.y, a.z, c.x, c.y, c.z)
      bases.push(f.base.x, f.base.y, f.base.z, f.base.x, f.base.y, f.base.z)
      growth.push(f.growthN, f.growthN)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('aBase', new THREE.Float32BufferAttribute(bases, 3))
  geo.setAttribute('aGrowth', new THREE.Float32BufferAttribute(growth, 1))
  return geo
}

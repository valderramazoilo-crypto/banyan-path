import * as THREE from 'three'

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Minimalist organic ROOTS that descend and branch. Each vertex carries `g` =
 * its vertical progress (0 at the top seed → 1 at the deepest tip) so a glow
 * band can travel DOWN the roots as the page is scrolled.
 */
export function generateRoots({ seed = 5, maxDepth = 5, topY = 3.2, floorY = -4.2 } = {}) {
  const rand = mulberry32(seed)
  const branches = []
  const span = topY - floorY

  function grow(pos, ang, length, depth) {
    const steps = Math.max(5, Math.round(length * 5))
    const stepLen = length / steps
    const curve = 0.45 * Math.sign(ang || rand() - 0.5) // splay outward as it descends
    const swayF = 1.0 + rand() * 0.6
    const swayP = rand() * 6.28
    let p = pos.clone()
    let a = ang
    const pts = [p.clone()]
    const gs = [THREE.MathUtils.clamp((topY - p.y) / span, 0, 1)]

    for (let i = 0; i < steps; i++) {
      const f = i / steps
      a += (curve / steps) * (0.4 + depth * 0.1)
      const sway = Math.sin(f * Math.PI * swayF * 2 + swayP) * 0.05
      const dir = new THREE.Vector3(Math.sin(a) + sway, -Math.cos(a) * 0.9 - 0.1, Math.sin(swayP + f) * 0.12).normalize()
      p = p.clone().addScaledVector(dir, stepLen)
      pts.push(p.clone())
      gs.push(THREE.MathUtils.clamp((topY - p.y) / span, 0, 1))
    }
    branches.push({ pts, g: gs, depthN: Math.min(depth / maxDepth, 1) })

    if (depth >= maxDepth || p.y <= floorY) return
    const spread = 0.32 + depth * 0.04
    grow(p.clone(), a - spread + (rand() - 0.5) * 0.1, length * (0.8 - depth * 0.04), depth + 1)
    grow(p.clone(), a + spread + (rand() - 0.5) * 0.1, length * (0.8 - depth * 0.04), depth + 1)
  }

  // a short central trunk that splits into a few descending roots
  const start = new THREE.Vector3(0, topY, 0)
  grow(start.clone(), -0.18, 1.5, 0)
  grow(start.clone(), 0.0, 1.6, 0)
  grow(start.clone(), 0.18, 1.5, 0)

  return { branches }
}

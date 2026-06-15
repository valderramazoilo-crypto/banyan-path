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

// rotate a vector in the XY plane by `ang`
function rotZ(v, ang) {
  const c = Math.cos(ang)
  const s = Math.sin(ang)
  const x = v.x * c - v.y * s
  const y = v.x * s + v.y * c
  v.x = x
  v.y = y
}

/**
 * Minimalist but ORGANIC roots: each strand meanders with layered curvature
 * (multiple sine frequencies) while a gentle gravity keeps it descending, so
 * the lines feel sinuous and natural. `g` = vertical progress (0 top → 1 deep)
 * so a glow band can sweep down on scroll.
 */
export function generateRoots({ seed = 5, maxDepth = 5, topY = 3.2, floorY = -4.2 } = {}) {
  const rand = mulberry32(seed)
  const branches = []
  const span = topY - floorY

  function grow(pos, dir, length, depth) {
    const steps = Math.max(10, Math.round(length * 8))
    const stepLen = length / steps
    let p = pos.clone()
    const d = dir.clone().normalize()

    // per-strand wander signature
    const f1 = 1.4 + rand() * 1.4
    const f2 = 3.2 + rand() * 2.4
    const amp = 0.85 + depth * 0.18 + rand() * 0.5
    const ph = rand() * 6.28
    const curl = rand() < 0.5 ? -1 : 1

    const pts = [p.clone()]
    const gs = [THREE.MathUtils.clamp((topY - p.y) / span, 0, 1)]

    for (let i = 0; i < steps; i++) {
      const f = i / steps
      // meandering turn (sinuous), stronger toward the tips
      const turn =
        (Math.sin(f * Math.PI * 2 * f1 + ph) * 0.9 + Math.sin(f * Math.PI * 2 * f2 + ph * 1.7) * 0.4) *
        amp *
        curl *
        (0.4 + f * 0.8) *
        (1 / steps) *
        length
      rotZ(d, turn)
      d.z += Math.sin(f * Math.PI * 2 * 1.3 + ph) * 0.03 // gentle depth wander
      d.lerp(new THREE.Vector3(0, -1, 0), 0.035) // soft gravity keeps it descending
      d.normalize()
      p = p.clone().addScaledVector(d, stepLen)
      pts.push(p.clone())
      gs.push(THREE.MathUtils.clamp((topY - p.y) / span, 0, 1))
    }
    branches.push({ pts, g: gs, depthN: Math.min(depth / maxDepth, 1) })

    if (depth >= maxDepth || p.y <= floorY) return
    const spread = 0.5 + depth * 0.05
    const left = d.clone()
    rotZ(left, spread + (rand() - 0.5) * 0.25)
    const right = d.clone()
    rotZ(right, -spread + (rand() - 0.5) * 0.25)
    grow(p.clone(), left, length * (0.82 - depth * 0.04), depth + 1)
    grow(p.clone(), right, length * (0.82 - depth * 0.04), depth + 1)
    // occasional third offshoot for a fuller, more organic spread
    if (depth >= 1 && rand() < 0.4) {
      const mid = d.clone()
      rotZ(mid, (rand() - 0.5) * 0.6)
      grow(p.clone(), mid, length * 0.6, depth + 2)
    }
  }

  const start = new THREE.Vector3(0, topY, 0)
  grow(start.clone(), new THREE.Vector3(-0.2, -1, 0), 1.7, 0)
  grow(start.clone(), new THREE.Vector3(0.05, -1, 0), 1.8, 0)
  grow(start.clone(), new THREE.Vector3(0.25, -1, 0), 1.7, 0)

  return { branches }
}

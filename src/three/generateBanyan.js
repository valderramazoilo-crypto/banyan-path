import * as THREE from 'three'

// Deterministic PRNG so the tree is identical on every reload
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
 * Procedurally grows a banyan-like tree.
 *
 * Returns flat typed-array buffers ready for a single LineSegments draw call,
 * plus node positions (branch junctions / tips) for the glowing connection
 * points. Every vertex carries an `aGrowth` value in [0,1] describing WHEN it
 * appears as the scroll-driven `uProgress` sweeps from 0 → 1, so the whole
 * tree literally grows out of the ground from trunk to aerial roots.
 */
export function generateBanyan({
  seed = 7,
  trunkHeight = 5.2,
  maxDepth = 6,
  branchSplit = 2,
} = {}) {
  const rand = mulberry32(seed)

  const segments = [] // { a:Vec3, b:Vec3, g0, g1 }
  const nodes = [] // { pos:Vec3, growth, size, kind }

  let maxPath = 0

  // --- main recursive branch growth -------------------------------------
  function grow(origin, dir, length, radius, depth, pathLen) {
    const steps = Math.max(3, Math.round(length * 4))
    const stepLen = length / steps

    let prev = origin.clone()
    let curDir = dir.clone().normalize()
    let path = pathLen

    for (let i = 0; i < steps; i++) {
      // gentle curving + upward bias so branches arc naturally
      curDir.x += (rand() - 0.5) * 0.18
      curDir.y += (rand() - 0.5) * 0.08 + (depth === 0 ? 0.04 : -0.01)
      curDir.z += (rand() - 0.5) * 0.18
      curDir.normalize()

      const next = prev.clone().addScaledVector(curDir, stepLen)
      const g0 = path
      const g1 = path + stepLen
      segments.push({ a: prev.clone(), b: next.clone(), g0, g1, depth })

      prev = next
      path = g1
    }
    maxPath = Math.max(maxPath, path)

    // a glowing node at the tip of this branch
    nodes.push({
      pos: prev.clone(),
      growth: path,
      size: THREE.MathUtils.lerp(0.5, 0.16, depth / maxDepth),
      kind: depth >= maxDepth - 1 ? 'leaf' : 'joint',
    })

    if (depth >= maxDepth) {
      // canopy crown: a small burst of leaf nodes
      for (let k = 0; k < 3; k++) {
        nodes.push({
          pos: prev
            .clone()
            .add(
              new THREE.Vector3(
                (rand() - 0.5) * 0.6,
                (rand() - 0.5) * 0.6,
                (rand() - 0.5) * 0.6
              )
            ),
          growth: path + rand() * 0.4,
          size: 0.1 + rand() * 0.08,
          kind: 'leaf',
        })
      }
      return
    }

    // spawn children
    const children = branchSplit + (rand() < 0.5 ? 1 : 0)
    for (let c = 0; c < children; c++) {
      const spread = 0.5 + depth * 0.12
      const childDir = curDir
        .clone()
        .add(
          new THREE.Vector3(
            (rand() - 0.5) * spread,
            (rand() - 0.2) * spread * 0.8,
            (rand() - 0.5) * spread
          )
        )
        .normalize()
      const childLen = length * (0.62 + rand() * 0.18)
      grow(prev.clone(), childDir, childLen, radius * 0.7, depth + 1, path)

      // --- banyan aerial roots: drop from upper branches straight down ---
      if (depth >= 2 && depth <= 4 && rand() < 0.55) {
        dropRoot(prev.clone(), path)
      }
    }
  }

  // --- aerial roots reaching for the ground -----------------------------
  function dropRoot(origin, pathLen) {
    const targetY = -0.2 - rand() * 0.4
    const drop = origin.y - targetY
    const steps = Math.max(4, Math.round(drop * 4))
    const stepLen = drop / steps
    let prev = origin.clone()
    let path = pathLen + 0.6 // roots appear a little later than their branch
    let sway = new THREE.Vector3((rand() - 0.5) * 0.05, 0, (rand() - 0.5) * 0.05)

    for (let i = 0; i < steps; i++) {
      sway.x += (rand() - 0.5) * 0.04
      sway.z += (rand() - 0.5) * 0.04
      const next = prev
        .clone()
        .add(new THREE.Vector3(sway.x, -stepLen, sway.z))
      const g0 = path
      const g1 = path + stepLen
      segments.push({ a: prev.clone(), b: next.clone(), g0, g1, depth: 99 })
      prev = next
      path = g1
    }
    maxPath = Math.max(maxPath, path)
    nodes.push({
      pos: prev.clone(),
      growth: path,
      size: 0.12,
      kind: 'root',
    })
  }

  // --- launch growth: 3 main trunks splaying out (banyan multi-trunk) ---
  const base = new THREE.Vector3(0, -2.2, 0)
  grow(base, new THREE.Vector3(0, 1, 0), trunkHeight, 0.5, 0, 0)
  grow(
    base.clone().add(new THREE.Vector3(0.4, 0, 0.2)),
    new THREE.Vector3(0.18, 1, 0.05).normalize(),
    trunkHeight * 0.9,
    0.42,
    0,
    0.2
  )
  grow(
    base.clone().add(new THREE.Vector3(-0.35, 0, -0.25)),
    new THREE.Vector3(-0.16, 1, -0.08).normalize(),
    trunkHeight * 0.85,
    0.4,
    0,
    0.25
  )

  // --- normalise growth values into [0,1] -------------------------------
  const inv = 1 / maxPath
  const positions = new Float32Array(segments.length * 2 * 3)
  const growth = new Float32Array(segments.length * 2)
  const depthAttr = new Float32Array(segments.length * 2)

  segments.forEach((s, i) => {
    const o = i * 6
    positions[o + 0] = s.a.x
    positions[o + 1] = s.a.y
    positions[o + 2] = s.a.z
    positions[o + 3] = s.b.x
    positions[o + 4] = s.b.y
    positions[o + 5] = s.b.z
    growth[i * 2 + 0] = s.g0 * inv
    growth[i * 2 + 1] = s.g1 * inv
    const d = s.depth === 99 ? 1 : Math.min(s.depth / maxDepth, 1)
    depthAttr[i * 2 + 0] = d
    depthAttr[i * 2 + 1] = d
  })

  const nodePositions = new Float32Array(nodes.length * 3)
  const nodeGrowth = new Float32Array(nodes.length)
  const nodeSize = new Float32Array(nodes.length)
  const nodeKind = new Float32Array(nodes.length) // 0 joint, 1 leaf, 2 root
  nodes.forEach((n, i) => {
    nodePositions[i * 3 + 0] = n.pos.x
    nodePositions[i * 3 + 1] = n.pos.y
    nodePositions[i * 3 + 2] = n.pos.z
    nodeGrowth[i] = n.growth * inv
    nodeSize[i] = n.size
    nodeKind[i] = n.kind === 'leaf' ? 1 : n.kind === 'root' ? 2 : 0
  })

  return {
    positions,
    growth,
    depth: depthAttr,
    segmentCount: segments.length,
    nodePositions,
    nodeGrowth,
    nodeSize,
    nodeKind,
    nodeCount: nodes.length,
  }
}

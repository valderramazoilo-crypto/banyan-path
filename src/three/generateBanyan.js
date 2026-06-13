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
 * Procedurally grows a banyan-like tree as a set of poly-line BRANCHES that a
 * downstream builder turns into tapered 3D tubes. Every point along a branch
 * carries a `g` value (cumulative path length, later normalised to 0..1) that
 * says WHEN it appears as the scroll-driven `uProgress` sweeps 0 → 1, so the
 * whole tree literally grows out of the ground from trunk to aerial roots.
 */
export function generateBanyan({
  seed = 11,
  trunkHeight = 5.4,
  maxDepth = 6,
  branchSplit = 2,
} = {}) {
  const rand = mulberry32(seed)

  const branches = [] // { pts:Vec3[], g:number[], depth, r0, r1 }
  const nodes = [] // { pos:Vec3, growth, size, kind }
  let maxPath = 0

  const radiusFor = (d) =>
    d >= 99 ? 0.03 : THREE.MathUtils.lerp(0.2, 0.018, Math.min(d / maxDepth, 1))

  function grow(origin, dir, length, depth, pathLen) {
    const steps = Math.max(5, Math.round(length * 5))
    const stepLen = length / steps
    let prev = origin.clone()
    let curDir = dir.clone().normalize()
    let path = pathLen

    const pts = [prev.clone()]
    const gs = [path]

    for (let i = 0; i < steps; i++) {
      curDir.x += (rand() - 0.5) * 0.18
      curDir.y += (rand() - 0.5) * 0.08 + (depth === 0 ? 0.05 : -0.015)
      curDir.z += (rand() - 0.5) * 0.18
      curDir.normalize()
      const next = prev.clone().addScaledVector(curDir, stepLen)
      path += stepLen
      pts.push(next.clone())
      gs.push(path)
      prev = next
    }
    maxPath = Math.max(maxPath, path)

    branches.push({
      pts,
      g: gs,
      depth,
      r0: radiusFor(depth),
      r1: radiusFor(depth + 1),
    })

    nodes.push({
      pos: prev.clone(),
      growth: path,
      size: THREE.MathUtils.lerp(0.55, 0.16, depth / maxDepth),
      kind: depth >= maxDepth - 1 ? 'leaf' : 'joint',
    })

    if (depth >= maxDepth) {
      for (let k = 0; k < 4; k++) {
        nodes.push({
          pos: prev
            .clone()
            .add(
              new THREE.Vector3(
                (rand() - 0.5) * 0.7,
                (rand() - 0.5) * 0.7,
                (rand() - 0.5) * 0.7
              )
            ),
          growth: path + rand() * 0.4,
          size: 0.1 + rand() * 0.09,
          kind: 'leaf',
        })
      }
      return
    }

    const children = branchSplit + (rand() < 0.5 ? 1 : 0)
    for (let c = 0; c < children; c++) {
      const spread = 0.55 + depth * 0.12
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
      grow(prev.clone(), childDir, childLen, depth + 1, path)

      // banyan aerial roots: drop from upper branches toward the ground
      if (depth >= 2 && depth <= 4 && rand() < 0.55) {
        dropRoot(prev.clone(), path)
      }
    }
  }

  function dropRoot(origin, pathLen) {
    const targetY = -0.2 - rand() * 0.4
    const drop = origin.y - targetY
    if (drop < 0.5) return
    const steps = Math.max(5, Math.round(drop * 5))
    const stepLen = drop / steps
    let prev = origin.clone()
    let path = pathLen + 0.6
    const sway = new THREE.Vector3((rand() - 0.5) * 0.05, 0, (rand() - 0.5) * 0.05)

    const pts = [prev.clone()]
    const gs = [path]
    for (let i = 0; i < steps; i++) {
      sway.x += (rand() - 0.5) * 0.045
      sway.z += (rand() - 0.5) * 0.045
      const next = prev.clone().add(new THREE.Vector3(sway.x, -stepLen, sway.z))
      path += stepLen
      pts.push(next.clone())
      gs.push(path)
      prev = next
    }
    maxPath = Math.max(maxPath, path)
    branches.push({ pts, g: gs, depth: 99, r0: 0.032, r1: 0.02 })
    nodes.push({ pos: prev.clone(), growth: path, size: 0.12, kind: 'root' })
  }

  // launch: 3 splaying trunks (banyan multi-trunk)
  const base = new THREE.Vector3(0, -2.4, 0)
  grow(base, new THREE.Vector3(0, 1, 0), trunkHeight, 0, 0)
  grow(
    base.clone().add(new THREE.Vector3(0.45, 0, 0.22)),
    new THREE.Vector3(0.2, 1, 0.06).normalize(),
    trunkHeight * 0.9,
    0,
    0.2
  )
  grow(
    base.clone().add(new THREE.Vector3(-0.4, 0, -0.28)),
    new THREE.Vector3(-0.18, 1, -0.09).normalize(),
    trunkHeight * 0.85,
    0,
    0.25
  )

  // normalise growth into [0,1]
  const inv = 1 / maxPath
  branches.forEach((b) => {
    b.g = b.g.map((v) => v * inv)
    b.depthN = b.depth >= 99 ? 1 : Math.min(b.depth / maxDepth, 1)
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
    branches,
    nodePositions,
    nodeGrowth,
    nodeSize,
    nodeKind,
    nodeCount: nodes.length,
  }
}

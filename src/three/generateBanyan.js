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

const lerp = THREE.MathUtils.lerp
const GOLDEN = Math.PI * (3 - Math.sqrt(5)) // 2.399… even 3D distribution

function frame(dir) {
  const t = dir.clone().normalize()
  const up = Math.abs(t.y) > 0.95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
  const side = new THREE.Vector3().crossVectors(up, t).normalize()
  const n = new THREE.Vector3().crossVectors(t, side).normalize()
  return { side, n }
}

/**
 * Clean, ORGANISED banyan. Returns main branches, latent cursor filaments,
 * glowing nodes, a cross-link "connection network" between branch tips (the
 * brand's living web), plus a per-node → branch map so clicks can select and
 * focus a branch.
 */
export function generateBanyan({ seed = 11, trunkHeight = 5.4, maxDepth = 5 } = {}) {
  const rand = mulberry32(seed)
  const branches = [] // { pts, g, depth, depthN }
  const filaments = []
  const nodes = [] // { pos, growth, size, kind, branch }
  const tips = [] // one per branch: { pos, growth, branch }
  let maxPath = 0

  function spawnFilaments(base, dir, side, n, depth, gAt) {
    const len = 0.5 * (1 - depth * 0.1)
    for (let k = 0; k < 2; k++) {
      const ang = rand() * Math.PI * 2
      const out = side
        .clone()
        .multiplyScalar(Math.cos(ang))
        .add(n.clone().multiplyScalar(Math.sin(ang)))
        .addScaledVector(dir, 0.35)
        .normalize()
      const p1 = base.clone().addScaledVector(out, len * 0.55)
      const bend = side
        .clone()
        .multiplyScalar(Math.sin(ang * 1.7))
        .add(n.clone().multiplyScalar(Math.cos(ang * 1.7)))
        .multiplyScalar(len * 0.18)
      const p2 = base.clone().addScaledVector(out, len).add(bend)
      filaments.push({ base: base.clone(), pts: [base.clone(), p1, p2], growth: gAt })
    }
  }

  function grow(origin, dir, length, depth, pathLen, roll) {
    const steps = Math.max(6, Math.round(length * 5))
    const stepLen = length / steps
    let pos = origin.clone()
    let d = dir.clone().normalize()
    const { side, n } = frame(d)

    const swayAmp = 0.05 + depth * 0.012
    const swayFreq = 1.1 + rand() * 0.5
    const swayPhase = rand() * 6.28

    let path = pathLen
    const pts = [pos.clone()]
    const gs = [path]

    for (let i = 0; i < steps; i++) {
      const f = i / steps
      const s = Math.sin(f * Math.PI * swayFreq * 2 + swayPhase) * swayAmp
      const cc = Math.cos(f * Math.PI * swayFreq * 2 + swayPhase) * swayAmp * 0.5
      d.addScaledVector(side, s).addScaledVector(n, cc)
      d.y += depth === 0 ? 0.02 : 0.006
      d.normalize()
      pos = pos.clone().addScaledVector(d, stepLen)
      path += stepLen
      pts.push(pos.clone())
      gs.push(path)
      if (depth >= 1 && i > 1 && i % 2 === 0) {
        spawnFilaments(pos.clone(), d.clone(), side, n, depth, path)
      }
    }
    maxPath = Math.max(maxPath, path)

    const bi = branches.length
    branches.push({ pts, g: gs, depth })

    nodes.push({
      pos: pos.clone(),
      growth: path,
      size: lerp(0.5, 0.16, depth / maxDepth),
      kind: depth >= maxDepth - 1 ? 'leaf' : 'joint',
      branch: bi,
    })
    tips.push({ pos: pos.clone(), growth: path, branch: bi })

    if (depth >= maxDepth) {
      for (let k = 0; k < 3; k++) {
        nodes.push({
          pos: pos
            .clone()
            .add(new THREE.Vector3((rand() - 0.5) * 0.5, (rand() - 0.5) * 0.5, (rand() - 0.5) * 0.5)),
          growth: path + rand() * 0.3,
          size: 0.09 + rand() * 0.07,
          kind: 'leaf',
          branch: bi,
        })
      }
      return
    }

    const open = 0.52 + depth * 0.04
    const ef = frame(d)
    for (let c = 0; c < 2; c++) {
      const ang = roll + c * Math.PI + (rand() - 0.5) * 0.15
      const axis = ef.side
        .clone()
        .multiplyScalar(Math.cos(ang))
        .add(ef.n.clone().multiplyScalar(Math.sin(ang)))
        .normalize()
      const childDir = d.clone().applyAxisAngle(axis, open)
      childDir.y += 0.06
      childDir.normalize()
      grow(pos.clone(), childDir, length * (0.72 - depth * 0.03), depth + 1, path, roll + GOLDEN)
    }

    if (depth >= 2 && depth <= 3 && rand() < 0.4) dropRoot(pos.clone(), path)
  }

  function dropRoot(origin, pathLen) {
    const targetY = -0.3 - rand() * 0.3
    const drop = origin.y - targetY
    if (drop < 0.6) return
    const steps = Math.max(5, Math.round(drop * 5))
    const stepLen = drop / steps
    let pos = origin.clone()
    let path = pathLen + 0.5
    const pts = [pos.clone()]
    const gs = [path]
    const phase = rand() * 6.28
    for (let i = 0; i < steps; i++) {
      const f = i / steps
      const sway = Math.sin(f * Math.PI * 2 + phase) * 0.04
      pos = pos.clone().add(new THREE.Vector3(sway, -stepLen, sway * 0.6))
      path += stepLen
      pts.push(pos.clone())
      gs.push(path)
    }
    maxPath = Math.max(maxPath, path)
    const bi = branches.length
    branches.push({ pts, g: gs, depth: 99 })
    nodes.push({ pos: pos.clone(), growth: path, size: 0.1, kind: 'root', branch: bi })
  }

  const base = new THREE.Vector3(0, -2.4, 0)
  grow(base, new THREE.Vector3(0, 1, 0), trunkHeight, 0, 0, 0)
  grow(base.clone().add(new THREE.Vector3(0.4, 0, 0.2)), new THREE.Vector3(0.16, 1, 0.05).normalize(), trunkHeight * 0.9, 0, 0.2, GOLDEN)
  grow(base.clone().add(new THREE.Vector3(-0.36, 0, -0.24)), new THREE.Vector3(-0.14, 1, -0.07).normalize(), trunkHeight * 0.86, 0, 0.25, GOLDEN * 2)

  // --- connection network between nearby branch tips (the living web) ----
  const connections = []
  const linked = new Set()
  for (let a = 0; a < tips.length; a++) {
    let bestJ = -1
    let bestD = Infinity
    for (let b = 0; b < tips.length; b++) {
      if (b === a || tips[b].branch === tips[a].branch) continue
      const dist = tips[a].pos.distanceTo(tips[b].pos)
      if (dist > 0.5 && dist < 1.5 && dist < bestD) {
        bestD = dist
        bestJ = b
      }
    }
    if (bestJ >= 0) {
      const key = a < bestJ ? `${a}_${bestJ}` : `${bestJ}_${a}`
      if (!linked.has(key)) {
        linked.add(key)
        connections.push({
          a: tips[a].pos,
          b: tips[bestJ].pos,
          growth: Math.max(tips[a].growth, tips[bestJ].growth),
        })
      }
    }
  }

  // --- normalise + pack ---------------------------------------------------
  const inv = 1 / maxPath
  branches.forEach((b) => {
    b.g = b.g.map((v) => v * inv)
    b.depthN = b.depth >= 99 ? 1 : Math.min(b.depth / maxDepth, 1)
  })
  filaments.forEach((f) => (f.growthN = f.growth * inv))

  const nodePositions = new Float32Array(nodes.length * 3)
  const nodeGrowth = new Float32Array(nodes.length)
  const nodeSize = new Float32Array(nodes.length)
  const nodeKind = new Float32Array(nodes.length)
  const nodeBranch = new Int32Array(nodes.length)
  nodes.forEach((nd, i) => {
    nodePositions[i * 3 + 0] = nd.pos.x
    nodePositions[i * 3 + 1] = nd.pos.y
    nodePositions[i * 3 + 2] = nd.pos.z
    nodeGrowth[i] = nd.growth * inv
    nodeSize[i] = nd.size
    nodeKind[i] = nd.kind === 'leaf' ? 1 : nd.kind === 'root' ? 2 : 0
    nodeBranch[i] = nd.branch
  })

  const connPositions = new Float32Array(connections.length * 2 * 3)
  const connGrowth = new Float32Array(connections.length * 2)
  connections.forEach((c, i) => {
    const o = i * 6
    connPositions[o + 0] = c.a.x
    connPositions[o + 1] = c.a.y
    connPositions[o + 2] = c.a.z
    connPositions[o + 3] = c.b.x
    connPositions[o + 4] = c.b.y
    connPositions[o + 5] = c.b.z
    connGrowth[i * 2 + 0] = c.growth * inv
    connGrowth[i * 2 + 1] = c.growth * inv
  })

  return {
    branches,
    filaments,
    nodePositions,
    nodeGrowth,
    nodeSize,
    nodeKind,
    nodeBranch,
    nodeCount: nodes.length,
    connPositions,
    connGrowth,
    connCount: connections.length,
  }
}

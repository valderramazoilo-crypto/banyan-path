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

const lerp = THREE.MathUtils.lerp

/**
 * "Network tree": a clean, symmetric banyan made of glowing strands with dots
 * along them, a triangulated canopy web up top and roots that fan out radially
 * across the floor. Returns line strands, node points (junctions + dots),
 * canopy/ground connection web, cursor filaments and a per-node branch map.
 */
export function generateBanyan({ seed = 7, maxDepth = 5, floorY = -2.6 } = {}) {
  const rand = mulberry32(seed)
  const branches = []
  const nodes = [] // { pos, growth, size, kind }  kind: tip|dot|root
  const structural = [] // bright junction/tip nodes used for the web
  const filaments = []
  let maxPath = 0

  function addDots(pts, gs, depth) {
    for (let i = 1; i < pts.length - 1; i++) {
      if (i % 2 !== 0) continue
      nodes.push({
        pos: pts[i].clone(),
        growth: gs[i],
        size: lerp(0.07, 0.045, depth / maxDepth),
        kind: 'dot',
      })
    }
  }

  function spawnFilaments(base, dir, depth, gAt) {
    const len = 0.45 * (1 - depth * 0.1)
    const up = Math.abs(dir.y) > 0.95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
    const side = new THREE.Vector3().crossVectors(up, dir).normalize()
    const n = new THREE.Vector3().crossVectors(dir, side).normalize()
    for (let k = 0; k < 2; k++) {
      const ang = rand() * Math.PI * 2
      const out = side
        .clone()
        .multiplyScalar(Math.cos(ang))
        .add(n.clone().multiplyScalar(Math.sin(ang)))
        .addScaledVector(dir, 0.3)
        .normalize()
      const p1 = base.clone().addScaledVector(out, len * 0.55)
      const p2 = base.clone().addScaledVector(out, len)
      filaments.push({ base: base.clone(), pts: [base.clone(), p1, p2], growth: gAt })
    }
  }

  // --- canopy: symmetric planar fan with a gentle outward arc -------------
  function growCanopy(pos, ang, angZ, length, depth, pathLen) {
    const steps = Math.max(5, Math.round(length * 5))
    const stepLen = length / steps
    const curve = depth === 0 ? 0 : 0.5 * Math.sign(ang || (rand() - 0.5))
    let p = pos.clone()
    let a = ang
    let path = pathLen
    const pts = [p.clone()]
    const gs = [path]

    for (let i = 0; i < steps; i++) {
      a += (curve / steps) * (0.4 + depth * 0.12) // arc outward more as it climbs
      const dir = new THREE.Vector3(
        Math.sin(a) * Math.cos(angZ),
        Math.cos(a),
        Math.sin(angZ)
      ).normalize()
      p = p.clone().addScaledVector(dir, stepLen)
      path += stepLen
      pts.push(p.clone())
      gs.push(path)
    }
    maxPath = Math.max(maxPath, path)
    const bi = branches.length
    branches.push({ pts, g: gs, depth })
    addDots(pts, gs, depth)

    const endDir = pts[pts.length - 1].clone().sub(pts[pts.length - 2]).normalize()
    if (depth >= 2) spawnFilaments(pts[Math.floor(pts.length / 2)].clone(), endDir, depth, gs[Math.floor(pts.length / 2)])

    const tip = {
      pos: p.clone(),
      growth: path,
      size: lerp(0.16, 0.09, depth / maxDepth),
      kind: depth >= maxDepth ? 'tip' : 'tip',
      branch: bi,
      canopy: true,
    }
    nodes.push(tip)
    structural.push(tip)

    if (depth >= maxDepth) return

    const spread = depth <= 1 ? 0.16 : 0.3 - depth * 0.015
    const dz = 0.12
    growCanopy(p.clone(), a - spread + (rand() - 0.5) * 0.06, angZ + (rand() - 0.5) * dz, length * 0.74, depth + 1, path)
    growCanopy(p.clone(), a + spread + (rand() - 0.5) * 0.06, angZ - (rand() - 0.5) * dz, length * 0.74, depth + 1, path)
  }

  // --- roots: radial fan flattening onto the floor ------------------------
  function growRoot(az) {
    const start = new THREE.Vector3(0, -0.6, 0)
    const steps = 16
    const totalLen = 3.6 + rand() * 1.6
    const stepLen = totalLen / steps
    let p = start.clone()
    let path = 0.2
    const pts = [p.clone()]
    const gs = [path]
    for (let i = 0; i < steps; i++) {
      const f = i / steps
      const down = Math.cos(f * Math.PI * 0.5)
      const out = Math.sin(f * Math.PI * 0.5)
      const dir = new THREE.Vector3(Math.cos(az) * out, -down * 0.7 - 0.04, Math.sin(az) * out).normalize()
      p = p.clone().addScaledVector(dir, stepLen)
      if (p.y < floorY) p.y = floorY + 0.02 * Math.sin(f * 8)
      path += stepLen
      pts.push(p.clone())
      gs.push(path)
    }
    maxPath = Math.max(maxPath, path)
    const bi = branches.length
    branches.push({ pts, g: gs, depth: 99 })
    addDots(pts, gs, 4)
    const tip = { pos: p.clone(), growth: path, size: 0.08, kind: 'root', branch: bi, canopy: false }
    nodes.push(tip)
    structural.push(tip)
  }

  // bundled trunk → fuller, symmetric canopy
  const base = new THREE.Vector3(0, -0.6, 0)
  const trunkH = 2.0
  for (const off of [-0.07, 0, 0.07]) {
    growCanopy(base.clone().add(new THREE.Vector3(off, 0, off * 0.5)), off * 0.6, off * 2, trunkH, 0, 0.1)
  }
  const ROOTS = 16
  for (let k = 0; k < ROOTS; k++) growRoot((k / ROOTS) * Math.PI * 2 + rand() * 0.1)

  // --- connection web -----------------------------------------------------
  const connections = []
  const linked = new Set()
  const addLink = (a, b) => {
    const key = a.idx < b.idx ? `${a.idx}_${b.idx}` : `${b.idx}_${a.idx}`
    if (linked.has(key)) return
    linked.add(key)
    connections.push({ a: a.pos, b: b.pos, growth: Math.max(a.growth, b.growth) })
  }
  structural.forEach((s, i) => (s.idx = i))
  const canopyNodes = structural.filter((s) => s.canopy && s.pos.y > 0.2)
  const rootNodes = structural.filter((s) => !s.canopy)
  // triangulated dome: each canopy node → 3 nearest neighbours
  for (const a of canopyNodes) {
    const near = canopyNodes
      .filter((b) => b !== a)
      .map((b) => ({ b, d: a.pos.distanceTo(b.pos) }))
      .filter((x) => x.d > 0.15 && x.d < 1.2)
      .sort((x, y) => x.d - y.d)
      .slice(0, 3)
    near.forEach((x) => addLink(a, x.b))
  }
  // ground web: each root tip → nearest root tip
  for (const a of rootNodes) {
    let best = null
    let bd = Infinity
    for (const b of rootNodes) {
      if (b === a) continue
      const d = a.pos.distanceTo(b.pos)
      if (d > 0.3 && d < 1.6 && d < bd) {
        bd = d
        best = b
      }
    }
    if (best) addLink(a, best)
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
    nodeKind[i] = nd.kind === 'tip' ? 1 : nd.kind === 'root' ? 2 : 0
    nodeBranch[i] = nd.branch ?? 0
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
    floorY,
  }
}

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
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

/**
 * A FULL banyan as a glowing network: a wide triangulated dome canopy, a broad
 * curtain of trunk/aerial-root strands, ground roots flaring out, dots strung
 * along every strand. Growth values (0..1) drive the grow-in animation. All
 * returned arrays are ready for the line / point / connection draw calls.
 */
export function generateBanyan({ seed = 7, floorY = -2.6 } = {}) {
  const rand = mulberry32(seed)
  const branches = [] // { pts, g, depthN }
  const nodes = [] // { pos, growth, size, kind }
  const filaments = []
  const webPts = [] // canopy points that get triangulated

  // smooth polyline a→b with an arc (curveVec) and optional waviness
  function strandPath(a, b, steps, curveVec, wave) {
    const pts = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const p = a.clone().lerp(b, t)
      if (curveVec) p.addScaledVector(curveVec, Math.sin(t * Math.PI))
      if (wave) {
        p.x += Math.sin(t * wave.f + wave.p) * wave.a
        p.z += Math.cos(t * wave.f + wave.p) * wave.a
      }
      pts.push(p)
    }
    return pts
  }

  function addStrand(pts, gStart, gEnd, o = {}) {
    const g = pts.map((_, i) => lerp(gStart, gEnd, i / (pts.length - 1)))
    branches.push({ pts, g, depthN: o.depthN ?? 0.5 })
    const every = o.dotEvery ?? 2
    for (let i = 1; i < pts.length - 1; i += every) {
      nodes.push({ pos: pts[i].clone(), growth: g[i], size: o.dotSize ?? 0.05, kind: 'dot' })
    }
    if (o.tip !== false) {
      const pos = pts[pts.length - 1].clone()
      nodes.push({ pos, growth: gEnd, size: o.tipSize ?? 0.1, kind: o.tipKind ?? 'leaf' })
      if (o.web) webPts.push({ pos, growth: gEnd })
    }
  }

  function spawnFilaments(base, dir, growth) {
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
      const len = 0.5
      const p1 = base.clone().addScaledVector(out, len * 0.55)
      const p2 = base.clone().addScaledVector(out, len)
      filaments.push({ base: base.clone(), pts: [base.clone(), p1, p2], growthN: growth })
    }
  }

  // ---- DOME CANOPY (wide, dense, triangulated) --------------------------
  const domeC = new THREE.Vector3(0, 1.4, 0)
  const Rx = 4.7,
    Ry = 2.1,
    Rz = 3.1
  const Nd = 320
  for (let i = 0; i < Nd; i++) {
    const t = i / Nd
    const phi = i * GOLDEN
    const sy = lerp(1.0, -0.2, t) // top → slightly drooping edge
    const rr = Math.sqrt(Math.max(0, 1 - sy * sy))
    const rn = 0.86 + rand() * 0.2
    const p = new THREE.Vector3(
      domeC.x + Math.cos(phi) * rr * Rx * rn,
      domeC.y + sy * Ry * rn,
      domeC.z + Math.sin(phi) * rr * Rz * rn
    )
    const growth = lerp(0.6, 0.97, 1 - (sy * 0.5 + 0.5)) + (rand() - 0.5) * 0.05
    nodes.push({ pos: p.clone(), growth, size: 0.045 + rand() * 0.05, kind: 'leaf' })
    webPts.push({ pos: p, growth })
    if (rand() < 0.6) {
      nodes.push({
        pos: p.clone().add(new THREE.Vector3((rand() - 0.5) * 0.45, (rand() - 0.5) * 0.45, (rand() - 0.5) * 0.45)),
        growth: growth + 0.02,
        size: 0.03 + rand() * 0.025,
        kind: 'dot',
      })
    }
  }

  // ---- BRANCHES: trunk band → dome anchors ------------------------------
  const trunkTopY = -0.1
  const nBranch = 26
  for (let i = 0; i < nBranch; i++) {
    const ang = (i / nBranch) * Math.PI * 2 + rand() * 0.15
    const start = new THREE.Vector3((rand() * 2 - 1) * 1.1, trunkTopY + rand() * 0.3, (rand() * 2 - 1) * 0.8)
    const target = domeC
      .clone()
      .add(new THREE.Vector3(Math.cos(ang) * Rx * 0.72, -0.3 + rand() * 1.1, Math.sin(ang) * Rz * 0.72))
    const curve = new THREE.Vector3((rand() - 0.5) * 0.8, 0.7 + rand() * 0.6, (rand() - 0.5) * 0.8)
    const pts = strandPath(start, target, 9, curve, { f: 6, a: 0.05, p: rand() * 6 })
    addStrand(pts, 0.24, 0.62, { dotSize: 0.06, tipSize: 0.085, tipKind: 'tip', web: true, dotEvery: 1, depthN: 0.6 })
    const mid = pts[Math.floor(pts.length * 0.6)]
    const tgt2 = target.clone().add(new THREE.Vector3((rand() - 0.5) * 1.8, 0.4 + rand() * 0.9, (rand() - 0.5) * 1.8))
    const pts2 = strandPath(mid.clone(), tgt2, 6, new THREE.Vector3((rand() - 0.5) * 0.5, 0.4, (rand() - 0.5) * 0.5), null)
    addStrand(pts2, 0.46, 0.72, { dotSize: 0.05, tipKind: 'tip', web: true, depthN: 0.72 })
    spawnFilaments(pts[Math.floor(pts.length * 0.5)].clone(), new THREE.Vector3(0, 1, 0), 0.5)
  }

  // ---- TRUNK CURTAIN: wide bundle of vertical aerial-root strands --------
  const nTrunk = 52
  for (let i = 0; i < nTrunk; i++) {
    const u = rand() * 2 - 1
    const xTop = u * 1.5
    const zTop = (rand() * 2 - 1) * 1.0
    const top = new THREE.Vector3(xTop, trunkTopY + 0.25, zTop)
    const bottom = new THREE.Vector3(xTop * 1.45 + (rand() - 0.5) * 0.3, floorY + 0.05, zTop * 1.45 + (rand() - 0.5) * 0.3)
    const wave = { f: 3 + rand() * 3, a: 0.05 + rand() * 0.09, p: rand() * 6 }
    const pts = strandPath(top, bottom, 11, new THREE.Vector3((rand() - 0.5) * 0.2, 0, (rand() - 0.5) * 0.2), wave)
    addStrand(pts, 0.0, 0.26, { dotSize: 0.05, tipSize: 0.06, tipKind: 'root', dotEvery: 2, depthN: 0.18 })
  }

  // ---- GROUND ROOTS: radial flare on the floor --------------------------
  const nRoot = 20
  for (let i = 0; i < nRoot; i++) {
    const az = (i / nRoot) * Math.PI * 2 + rand() * 0.12
    const start = new THREE.Vector3(Math.cos(az) * 1.2, floorY + 0.05, Math.sin(az) * 1.2)
    const end = new THREE.Vector3(Math.cos(az) * (3.4 + rand() * 2.2), floorY + 0.02, Math.sin(az) * (3.4 + rand() * 2.2))
    const pts = strandPath(start, end, 8, null, { f: 4, a: 0.12, p: rand() * 6 })
    addStrand(pts, 0.14, 0.42, { dotSize: 0.045, tipSize: 0.065, tipKind: 'root', depthN: 0.95 })
  }

  // ---- WEB: triangulate canopy points + branch tips ---------------------
  const connections = []
  const linked = new Set()
  webPts.forEach((s, i) => (s.idx = i))
  const addLink = (a, b) => {
    const key = a.idx < b.idx ? `${a.idx}_${b.idx}` : `${b.idx}_${a.idx}`
    if (linked.has(key)) return
    linked.add(key)
    connections.push({ a: a.pos, b: b.pos, growth: Math.max(a.growth, b.growth) })
  }
  for (const a of webPts) {
    const near = webPts
      .filter((b) => b !== a)
      .map((b) => ({ b, d: a.pos.distanceTo(b.pos) }))
      .filter((x) => x.d > 0.18 && x.d < 1.25)
      .sort((x, y) => x.d - y.d)
      .slice(0, 3)
    near.forEach((x) => addLink(a, x.b))
  }

  // ---- pack --------------------------------------------------------------
  const nodePositions = new Float32Array(nodes.length * 3)
  const nodeGrowth = new Float32Array(nodes.length)
  const nodeSize = new Float32Array(nodes.length)
  const nodeKind = new Float32Array(nodes.length)
  nodes.forEach((nd, i) => {
    nodePositions[i * 3 + 0] = nd.pos.x
    nodePositions[i * 3 + 1] = nd.pos.y
    nodePositions[i * 3 + 2] = nd.pos.z
    nodeGrowth[i] = THREE.MathUtils.clamp(nd.growth, 0, 1)
    nodeSize[i] = nd.size
    nodeKind[i] = nd.kind === 'tip' || nd.kind === 'leaf' ? 1 : nd.kind === 'root' ? 2 : 0
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
    connGrowth[i * 2 + 0] = c.growth
    connGrowth[i * 2 + 1] = c.growth
  })

  return {
    branches,
    filaments,
    nodePositions,
    nodeGrowth,
    nodeSize,
    nodeKind,
    nodeCount: nodes.length,
    connPositions,
    connGrowth,
    connCount: connections.length,
    floorY,
  }
}

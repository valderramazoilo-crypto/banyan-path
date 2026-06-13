import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { generateBanyan } from './generateBanyan'
import {
  buildLineGeometry,
  buildFilamentGeometry,
  buildConnectionGeometry,
} from './buildTree'
import { banyan } from './progressStore'
import './materials'

const lerp = THREE.MathUtils.lerp
const easeOut = (t) => 1 - Math.pow(1 - t, 3)

function BanyanTree({ data, onSelect }) {
  const lineMat = useRef()
  const filMat = useRef()
  const connMat = useRef()
  const nodeMat = useRef()
  const { camera } = useThree()

  const lineGeo = useMemo(() => buildLineGeometry(data.branches), [data])
  const filGeo = useMemo(() => buildFilamentGeometry(data.filaments), [data])
  const connGeo = useMemo(
    () => buildConnectionGeometry(data.connPositions, data.connGrowth),
    [data]
  )
  const nodeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(data.nodePositions, 3))
    g.setAttribute('aGrowth', new THREE.BufferAttribute(data.nodeGrowth, 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(data.nodeSize, 1))
    g.setAttribute('aKind', new THREE.BufferAttribute(data.nodeKind, 1))
    return g
  }, [data])

  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const cursorWorld = useRef(new THREE.Vector3(999, 999, 999))
  const hit = useRef(new THREE.Vector3())
  const intro = useRef(0)

  useFrame((state, delta) => {
    intro.current = Math.min(1, intro.current + delta / 1.6)
    banyan.scrollCurrent = lerp(banyan.scrollCurrent, banyan.scrollTarget, Math.min(1, delta * 4))
    const s = banyan.scrollCurrent
    const growth = Math.max(easeOut(intro.current) * 0.42, Math.min(s / 0.55, 1))
    const fade = 1 - THREE.MathUtils.smoothstep(s, 0.8, 0.96)
    const t = state.clock.elapsedTime

    ndc.set(banyan.pointerX, -banyan.pointerY)
    raycaster.setFromCamera(ndc, camera)
    if (raycaster.ray.intersectPlane(plane, hit.current)) {
      cursorWorld.current.lerp(hit.current, 0.2)
    }

    for (const m of [lineMat, filMat, connMat, nodeMat]) {
      if (m.current) {
        m.current.uProgress = growth
        m.current.uTime = t
        m.current.uFade = fade
        m.current.uCursor.copy(cursorWorld.current)
      }
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    if (e.index == null) return
    onSelect(data.nodeBranch[e.index])
  }

  return (
    <group>
      <lineSegments geometry={lineGeo}>
        <banyanLineMaterial ref={lineMat} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <lineSegments geometry={connGeo}>
        <banyanConnectionMaterial ref={connMat} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <lineSegments geometry={filGeo}>
        <banyanFilamentMaterial ref={filMat} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <points geometry={nodeGeo} onClick={handleClick}>
        <banyanNodeMaterial
          ref={nodeMat}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uPixelRatio={Math.min(window.devicePixelRatio, 2)}
        />
      </points>
    </group>
  )
}

// thick glowing highlight tube for the selected branch
function Highlight({ branch }) {
  const ref = useRef()
  const grow = useRef(0)

  const geo = useMemo(() => {
    if (!branch) return null
    const curve = new THREE.CatmullRomCurve3(branch.pts)
    return new THREE.TubeGeometry(curve, Math.max(8, branch.pts.length * 2), 0.06, 8, false)
  }, [branch])

  useFrame((_, delta) => {
    const target = branch ? 1 : 0
    grow.current = lerp(grow.current, target, Math.min(1, delta * 6))
    if (ref.current) {
      const sc = 0.6 + grow.current * 0.4
      ref.current.scale.setScalar(sc)
      ref.current.material.opacity = grow.current
    }
  })

  if (!geo) return null
  return (
    <mesh ref={ref} geometry={geo}>
      <meshBasicMaterial
        color="#FF9E30"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

function Motes({ count = 90 }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      a[i * 3 + 0] = (Math.random() - 0.5) * 18
      a[i * 3 + 1] = Math.random() * 14 - 3
      a[i * 3 + 2] = (Math.random() - 0.5) * 10 - 1
    }
    return a
  }, [count])
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.018
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#EBE0C2" transparent opacity={0.28} depthWrite={false} sizeAttenuation />
    </points>
  )
}

function CameraRig() {
  const { camera } = useThree()
  const target = useRef(new THREE.Vector3(0, 0, 0))
  const focus = useRef(new THREE.Vector3())

  useFrame(() => {
    if (banyan.focusActive) {
      // fly toward the selected branch
      focus.current.set(banyan.focusX, banyan.focusY, banyan.focusZ)
      const desired = focus.current
        .clone()
        .add(new THREE.Vector3(focus.current.x * 0.25, 0.6, 4.0))
      camera.position.lerp(desired, 0.08)
      target.current.lerp(focus.current, 0.1)
      camera.lookAt(target.current)
      return
    }
    const s = banyan.scrollCurrent
    const camX = Math.sin(s * Math.PI) * 1.8 + banyan.pointerX * 1.1
    const camY = lerp(-1.2, 4.6, s) + banyan.pointerY * 0.5
    const camZ = lerp(9.0, 13.5, s)
    camera.position.x = lerp(camera.position.x, camX, 0.05)
    camera.position.y = lerp(camera.position.y, camY, 0.05)
    camera.position.z = lerp(camera.position.z, camZ, 0.05)
    target.current.y = lerp(target.current.y, lerp(0.6, 4.4, s), 0.05)
    target.current.x = lerp(target.current.x, 0, 0.05)
    target.current.z = lerp(target.current.z, 0, 0.05)
    camera.lookAt(target.current)
  })
  return null
}

export default function BanyanScene() {
  const data = useMemo(() => generateBanyan({ seed: 11 }), [])
  const [selected, setSelected] = useState(null)

  const onSelect = (bi) => {
    const branch = data.branches[bi]
    if (!branch) return
    const tip = branch.pts[branch.pts.length - 1]
    const mid = branch.pts[Math.floor(branch.pts.length * 0.6)]
    banyan.focusX = mid.x
    banyan.focusY = mid.y
    banyan.focusZ = mid.z
    banyan.focusActive = true
    setSelected(bi)
  }

  const onClear = () => {
    banyan.focusActive = false
    setSelected(null)
  }

  return (
    <>
      <div className="banyan-canvas">
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, -1.2, 9.0], fov: 42, near: 0.1, far: 100 }}
          raycaster={{ params: { Points: { threshold: 0.45 } } }}
          onPointerMissed={onClear}
        >
          <color attach="background" args={['#0e140a']} />
          <fog attach="fog" args={['#0e140a', 12, 30]} />
          <BanyanTree data={data} onSelect={onSelect} />
          <Highlight branch={selected != null ? data.branches[selected] : null} />
          <Motes />
          <CameraRig />
          <EffectComposer>
            <Bloom intensity={1.0} luminanceThreshold={0.12} luminanceSmoothing={0.9} mipmapBlur />
            <Vignette eskil={false} offset={0.22} darkness={0.9} />
          </EffectComposer>
        </Canvas>
      </div>

      {selected != null && (
        <div className="pointer-events-none fixed inset-0 z-40">
          <button
            onClick={onClear}
            className="pointer-events-auto absolute bottom-8 right-8 inline-flex items-center gap-2 rounded-full border border-sand/20 bg-forest-deep/80 px-5 py-2.5 font-body text-sm text-sand backdrop-blur-md transition-colors hover:border-ember hover:text-ember"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Cerrar vista
          </button>
        </div>
      )}
    </>
  )
}

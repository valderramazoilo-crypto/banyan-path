import { useMemo, useRef } from 'react'
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

function BanyanTree({ data }) {
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
    intro.current = Math.min(1, intro.current + delta / 1.8)
    banyan.scrollCurrent = lerp(banyan.scrollCurrent, banyan.scrollTarget, Math.min(1, delta * 4))
    const s = banyan.scrollCurrent
    const growth = Math.max(easeOut(intro.current) * 0.6, Math.min(s / 0.5, 1))
    const fade = 1 - THREE.MathUtils.smoothstep(s, 0.82, 0.97)
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

  return (
    <group>
      <lineSegments geometry={connGeo}>
        <banyanConnectionMaterial ref={connMat} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <lineSegments geometry={lineGeo}>
        <banyanLineMaterial ref={lineMat} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <lineSegments geometry={filGeo}>
        <banyanFilamentMaterial ref={filMat} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <points geometry={nodeGeo}>
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

// concentric ring floor with faint spokes + dotted rings
function Floor({ y = -2.6 }) {
  const mat = useRef()
  const dotMat = useRef()
  const radii = [0.9, 1.7, 2.6, 3.6, 4.7, 5.9]

  const lineGeo = useMemo(() => {
    const pos = []
    const SEG = 100
    for (const r of radii) {
      for (let i = 0; i < SEG; i++) {
        const a0 = (i / SEG) * Math.PI * 2
        const a1 = ((i + 1) / SEG) * Math.PI * 2
        pos.push(Math.cos(a0) * r, y, Math.sin(a0) * r, Math.cos(a1) * r, y, Math.sin(a1) * r)
      }
    }
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2
      pos.push(Math.cos(a) * 0.9, y, Math.sin(a) * 0.9, Math.cos(a) * 5.9, y, Math.sin(a) * 5.9)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    return g
  }, [y])

  const dotGeo = useMemo(() => {
    const pos = []
    const SEG = 60
    for (const r of radii) {
      for (let i = 0; i < SEG; i++) {
        const a = (i / SEG) * Math.PI * 2
        pos.push(Math.cos(a) * r, y, Math.sin(a) * r)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    return g
  }, [y])

  useFrame(() => {
    const fade = 1 - THREE.MathUtils.smoothstep(banyan.scrollCurrent, 0.82, 0.97)
    const intro = THREE.MathUtils.clamp(banyan.scrollCurrent * 4 + 0.3, 0, 1)
    if (mat.current) mat.current.opacity = 0.13 * fade * intro
    if (dotMat.current) dotMat.current.opacity = 0.4 * fade * intro
  })

  return (
    <group>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial ref={mat} color="#5f8a35" transparent opacity={0.13} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <points geometry={dotGeo}>
        <pointsMaterial ref={dotMat} color="#9fc15a" size={0.03} transparent opacity={0.4} depthWrite={false} sizeAttenuation />
      </points>
    </group>
  )
}

function Motes({ count = 70 }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      a[i * 3 + 0] = (Math.random() - 0.5) * 16
      a[i * 3 + 1] = Math.random() * 8 - 2
      a[i * 3 + 2] = (Math.random() - 0.5) * 10 - 1
    }
    return a
  }, [count])
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.015
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#cfe0a8" transparent opacity={0.25} depthWrite={false} sizeAttenuation />
    </points>
  )
}

function CameraRig() {
  const { camera } = useThree()
  const target = useRef(new THREE.Vector3(0, -0.4, 0))
  useFrame(() => {
    const s = banyan.scrollCurrent
    const camX = banyan.pointerX * 1.0
    const camY = lerp(1.0, 3.2, s) + banyan.pointerY * 0.5
    const camZ = lerp(11.0, 14.5, s)
    camera.position.x = lerp(camera.position.x, camX, 0.05)
    camera.position.y = lerp(camera.position.y, camY, 0.05)
    camera.position.z = lerp(camera.position.z, camZ, 0.05)
    target.current.y = lerp(target.current.y, lerp(-0.4, 1.2, s), 0.05)
    camera.lookAt(target.current)
  })
  return null
}

export default function BanyanScene() {
  const data = useMemo(() => generateBanyan({ seed: 7 }), [])
  return (
    <div className="banyan-canvas">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 1.0, 11.0], fov: 42, near: 0.1, far: 100 }}
      >
        <color attach="background" args={['#05070a']} />
        <fog attach="fog" args={['#05070a', 13, 32]} />
        <BanyanTree data={data} />
        <Floor y={data.floorY} />
        <Motes />
        <CameraRig />
        <EffectComposer>
          <Bloom intensity={1.1} luminanceThreshold={0.1} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.92} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

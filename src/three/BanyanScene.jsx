import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { generateBanyan } from './generateBanyan'
import { buildLineGeometry, buildFilamentGeometry } from './buildTree'
import { banyan } from './progressStore'
import './materials'

const lerp = THREE.MathUtils.lerp
const easeOut = (t) => 1 - Math.pow(1 - t, 3)

function BanyanTree() {
  const lineMat = useRef()
  const filMat = useRef()
  const nodeMat = useRef()
  const { camera } = useThree()

  const data = useMemo(() => generateBanyan({ seed: 11 }), [])
  const lineGeo = useMemo(() => buildLineGeometry(data.branches), [data])
  const filGeo = useMemo(() => buildFilamentGeometry(data.filaments), [data])
  const nodeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(data.nodePositions, 3))
    g.setAttribute('aGrowth', new THREE.BufferAttribute(data.nodeGrowth, 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(data.nodeSize, 1))
    g.setAttribute('aKind', new THREE.BufferAttribute(data.nodeKind, 1))
    return g
  }, [data])

  // cursor → world-space raycast helpers
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const cursorWorld = useRef(new THREE.Vector3(999, 999, 999))
  const hit = useRef(new THREE.Vector3())
  const intro = useRef(0)

  useFrame((state, delta) => {
    intro.current = Math.min(1, intro.current + delta / 1.6)
    banyan.scrollCurrent = lerp(
      banyan.scrollCurrent,
      banyan.scrollTarget,
      Math.min(1, delta * 4)
    )
    const s = banyan.scrollCurrent
    // tree auto-grows in on load, then scroll keeps growing it
    const growth = Math.max(easeOut(intro.current) * 0.42, Math.min(s / 0.55, 1))
    const fade = 1 - THREE.MathUtils.smoothstep(s, 0.8, 0.96)
    const t = state.clock.elapsedTime

    // project the cursor onto the tree plane (z = 0)
    ndc.set(banyan.pointerX, -banyan.pointerY)
    raycaster.setFromCamera(ndc, camera)
    if (raycaster.ray.intersectPlane(plane, hit.current)) {
      cursorWorld.current.lerp(hit.current, 0.2)
    }

    if (lineMat.current) {
      lineMat.current.uProgress = growth
      lineMat.current.uTime = t
      lineMat.current.uFade = fade
      lineMat.current.uCursor.copy(cursorWorld.current)
    }
    if (filMat.current) {
      filMat.current.uProgress = growth
      filMat.current.uTime = t
      filMat.current.uFade = fade
      filMat.current.uCursor.copy(cursorWorld.current)
    }
    if (nodeMat.current) {
      nodeMat.current.uProgress = growth
      nodeMat.current.uTime = t
      nodeMat.current.uFade = fade
      nodeMat.current.uCursor.copy(cursorWorld.current)
    }
  })

  return (
    <group>
      <lineSegments geometry={lineGeo}>
        <banyanLineMaterial
          ref={lineMat}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <lineSegments geometry={filGeo}>
        <banyanFilamentMaterial
          ref={filMat}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
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

// drifting atmospheric motes
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
      <pointsMaterial
        size={0.04}
        color="#EBE0C2"
        transparent
        opacity={0.28}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

function CameraRig() {
  const { camera } = useThree()
  const target = useRef(new THREE.Vector3(0, 0, 0))
  useFrame(() => {
    const s = banyan.scrollCurrent
    const camX = Math.sin(s * Math.PI) * 1.8 + banyan.pointerX * 1.1
    const camY = lerp(-1.2, 4.6, s) + banyan.pointerY * 0.5
    const camZ = lerp(9.0, 13.5, s)
    camera.position.x = lerp(camera.position.x, camX, 0.05)
    camera.position.y = lerp(camera.position.y, camY, 0.05)
    camera.position.z = lerp(camera.position.z, camZ, 0.05)
    target.current.y = lerp(target.current.y, lerp(0.6, 4.4, s), 0.05)
    camera.lookAt(target.current)
  })
  return null
}

export default function BanyanScene() {
  return (
    <div className="banyan-canvas">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, -1.2, 9.0], fov: 42, near: 0.1, far: 100 }}
      >
        <color attach="background" args={['#0e140a']} />
        <fog attach="fog" args={['#0e140a', 12, 30]} />
        <BanyanTree />
        <Motes />
        <CameraRig />
        <EffectComposer>
          <Bloom
            intensity={1.0}
            luminanceThreshold={0.12}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.22} darkness={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { generateRoots } from './generateRoots'
import { buildLineGeometry } from './buildTree'
import { banyan } from './progressStore'
import './materials'

const lerp = THREE.MathUtils.lerp
const easeOut = (t) => 1 - Math.pow(1 - t, 3)

function Roots() {
  const mat = useRef()
  const group = useRef()
  const { camera } = useThree()

  const data = useMemo(() => generateRoots({ seed: 5 }), [])
  const geo = useMemo(() => buildLineGeometry(data.branches), [data])

  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const cursorWorld = useRef(new THREE.Vector3(999, 999, 999))
  const hit = useRef(new THREE.Vector3())
  const draw = useRef(0)
  const sweep = useRef(0)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    draw.current = Math.min(1, draw.current + delta / 1.7) // draw-in on load

    // scroll within the first viewport drives the glow band downward
    const hs = THREE.MathUtils.clamp(window.scrollY / window.innerHeight, 0, 1)
    sweep.current = lerp(sweep.current, hs, 0.08)

    ndc.set(banyan.pointerX, -banyan.pointerY)
    raycaster.setFromCamera(ndc, camera)
    if (raycaster.ray.intersectPlane(plane, hit.current)) {
      cursorWorld.current.lerp(hit.current, 0.2)
    }

    if (mat.current) {
      mat.current.uDraw = easeOut(draw.current)
      mat.current.uSweep = sweep.current
      mat.current.uTime = t
      mat.current.uCursor.copy(cursorWorld.current)
    }
    if (group.current) {
      group.current.rotation.y = lerp(group.current.rotation.y, banyan.pointerX * 0.15, 0.05)
      group.current.rotation.x = lerp(group.current.rotation.x, banyan.pointerY * 0.08, 0.05)
    }
  })

  return (
    <group ref={group}>
      <lineSegments geometry={geo}>
        <banyanRootMaterial ref={mat} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  )
}

function Motes({ count = 60 }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      a[i * 3 + 0] = (Math.random() - 0.5) * 14
      a[i * 3 + 1] = (Math.random() - 0.5) * 10
      a[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1
    }
    return a
  }, [count])
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.012
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#cdd6a8" transparent opacity={0.3} depthWrite={false} sizeAttenuation />
    </points>
  )
}

export default function RootsScene() {
  return (
    <div className="hero-canvas">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, -0.3, 9.5], fov: 45, near: 0.1, far: 100 }}
      >
        <fog attach="fog" args={['#06080a', 10, 26]} />
        <Roots />
        <Motes />
        <EffectComposer>
          <Bloom intensity={1.1} radius={0.7} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

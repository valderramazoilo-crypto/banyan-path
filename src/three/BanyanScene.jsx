import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { generateBanyan } from './generateBanyan'
import { buildTreeGeometry } from './buildTree'
import { banyan } from './progressStore'
import './materials'

const lerp = THREE.MathUtils.lerp

function BanyanTree() {
  const tubeMat = useRef()
  const nodeMat = useRef()
  const group = useRef()

  const data = useMemo(() => generateBanyan({ seed: 11 }), [])
  const tubeGeo = useMemo(() => buildTreeGeometry(data.branches, 6), [data])
  const nodeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(data.nodePositions, 3))
    g.setAttribute('aGrowth', new THREE.BufferAttribute(data.nodeGrowth, 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(data.nodeSize, 1))
    g.setAttribute('aKind', new THREE.BufferAttribute(data.nodeKind, 1))
    return g
  }, [data])

  useFrame((state, delta) => {
    banyan.scrollCurrent = lerp(
      banyan.scrollCurrent,
      banyan.scrollTarget,
      Math.min(1, delta * 4)
    )
    const s = banyan.scrollCurrent
    const growth = Math.min(s / 0.62, 1) // fully grown by ~62% of the page
    // melt the tree away over the last stretch so the closing reads clean
    const fade = 1 - THREE.MathUtils.smoothstep(s, 0.8, 0.96)
    const t = state.clock.elapsedTime

    if (tubeMat.current) {
      tubeMat.current.uProgress = growth
      tubeMat.current.uTime = t
      tubeMat.current.uFade = fade
    }
    if (nodeMat.current) {
      nodeMat.current.uProgress = growth
      nodeMat.current.uTime = t
      nodeMat.current.uFade = fade
    }

    if (group.current) {
      const targetRotY = banyan.pointerX * 0.32 + t * 0.035
      const targetRotX = -banyan.pointerY * 0.16
      group.current.rotation.y = lerp(group.current.rotation.y, targetRotY, 0.05)
      group.current.rotation.x = lerp(group.current.rotation.x, targetRotX, 0.05)
    }
  })

  return (
    <group ref={group}>
      <mesh geometry={tubeGeo}>
        <banyanTubeMaterial ref={tubeMat} transparent depthWrite />
      </mesh>
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
function Motes({ count = 120 }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      a[i * 3 + 0] = (Math.random() - 0.5) * 18
      a[i * 3 + 1] = Math.random() * 14 - 3
      a[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2
    }
    return a
  }, [count])

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.02
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#EBE0C2"
        transparent
        opacity={0.35}
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
    const camX = Math.sin(s * Math.PI) * 2.4 + banyan.pointerX * 1.4
    const camY = lerp(-1.6, 4.8, s) + banyan.pointerY * 0.7
    const camZ = lerp(8.4, 13.5, s)

    camera.position.x = lerp(camera.position.x, camX, 0.06)
    camera.position.y = lerp(camera.position.y, camY, 0.06)
    camera.position.z = lerp(camera.position.z, camZ, 0.06)

    target.current.y = lerp(target.current.y, lerp(0.2, 4.4, s), 0.06)
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
        camera={{ position: [0, -1.6, 8.4], fov: 42, near: 0.1, far: 100 }}
      >
        <color attach="background" args={['#10160c']} />
        <fog attach="fog" args={['#10160c', 11, 28]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 8, 5]} intensity={0.8} color="#fff4e0" />
        <pointLight position={[-3, 2, 4]} intensity={20} color="#FF9E30" distance={18} />
        <BanyanTree />
        <Motes />
        <CameraRig />
        <EffectComposer>
          <Bloom
            intensity={0.9}
            luminanceThreshold={0.18}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.25} darkness={0.88} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

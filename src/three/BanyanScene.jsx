import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { generateBanyan } from './generateBanyan'
import { banyan } from './progressStore'
import './materials'

const lerp = THREE.MathUtils.lerp

function BanyanTree() {
  const lineMat = useRef()
  const nodeMat = useRef()
  const group = useRef()

  const data = useMemo(() => generateBanyan({ seed: 11 }), [])

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(data.positions, 3))
    g.setAttribute('aGrowth', new THREE.BufferAttribute(data.growth, 1))
    g.setAttribute('aDepth', new THREE.BufferAttribute(data.depth, 1))
    return g
  }, [data])

  const nodeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(data.nodePositions, 3))
    g.setAttribute('aGrowth', new THREE.BufferAttribute(data.nodeGrowth, 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(data.nodeSize, 1))
    g.setAttribute('aKind', new THREE.BufferAttribute(data.nodeKind, 1))
    return g
  }, [data])

  useFrame((state, delta) => {
    // smooth the scroll value → growth
    banyan.scrollCurrent = lerp(
      banyan.scrollCurrent,
      banyan.scrollTarget,
      Math.min(1, delta * 4)
    )
    const s = banyan.scrollCurrent
    const growth = Math.min(s / 0.7, 1) // fully grown by ~70% of the page
    const t = state.clock.elapsedTime

    if (lineMat.current) {
      lineMat.current.uProgress = growth
      lineMat.current.uTime = t
    }
    if (nodeMat.current) {
      nodeMat.current.uProgress = growth
      nodeMat.current.uTime = t
    }

    // cursor reactivity: the whole tree leans toward the pointer + idle drift
    if (group.current) {
      const targetRotY = banyan.pointerX * 0.35 + t * 0.04
      const targetRotX = -banyan.pointerY * 0.18
      group.current.rotation.y = lerp(group.current.rotation.y, targetRotY, 0.05)
      group.current.rotation.x = lerp(group.current.rotation.x, targetRotX, 0.05)
    }
  })

  return (
    <group ref={group}>
      <lineSegments geometry={lineGeo}>
        <banyanLineMaterial
          ref={lineMat}
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

function CameraRig() {
  const { camera } = useThree()
  const target = useRef(new THREE.Vector3(0, 0, 0))

  useFrame(() => {
    const s = banyan.scrollCurrent
    // travel: start low at the base, rise and pull back to reveal the canopy
    const camX = Math.sin(s * Math.PI) * 2.2 + banyan.pointerX * 1.4
    const camY = lerp(-1.4, 4.6, s) + banyan.pointerY * 0.7
    const camZ = lerp(8.6, 13.0, s)

    camera.position.x = lerp(camera.position.x, camX, 0.06)
    camera.position.y = lerp(camera.position.y, camY, 0.06)
    camera.position.z = lerp(camera.position.z, camZ, 0.06)

    target.current.y = lerp(target.current.y, lerp(0.2, 4.2, s), 0.06)
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
        camera={{ position: [0, -1.4, 8.6], fov: 42, near: 0.1, far: 100 }}
      >
        <color attach="background" args={['#10160c']} />
        <fog attach="fog" args={['#10160c', 10, 26]} />
        <ambientLight intensity={0.4} />
        <BanyanTree />
        <CameraRig />
        <EffectComposer>
          <Bloom
            intensity={1.15}
            luminanceThreshold={0.08}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.25} darkness={0.85} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

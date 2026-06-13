import { useMemo, useRef, useLayoutEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { banyan } from './progressStore'

const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const lerp = THREE.MathUtils.lerp
const R = 2.05
const hash = (n) => {
  const s = Math.sin(n * 127.1) * 43758.5453
  return s - Math.floor(s)
}

function OrbSphere() {
  const spin = useRef()
  const mesh = useRef()
  const { camera } = useThree()

  // even full-sphere distribution + per-orb size, twinkle phase & amplitude
  const orbs = useMemo(() => {
    const N = 760
    const dirs = []
    const scales = []
    const phase = []
    const amp = []
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const phi = i * GOLDEN
      dirs.push(new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r))
      scales.push(0.09 + hash(i + 0.5) * 0.065) // varied, smaller → glowing gaps
      phase.push(hash(i * 2.3))
      amp.push(0.55 + hash(i * 4.7) * 0.45)
    }
    return { dirs, scales, phase, amp }
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const baseCol = useMemo(() => new THREE.Color('#0d1410'), [])
  const hotCol = useMemo(() => new THREE.Color('#FFB347'), [])
  const tmpCol = useMemo(() => new THREE.Color(), [])

  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const sphere = useMemo(() => new THREE.Sphere(new THREE.Vector3(0, 0, 0), R), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const localCursor = useRef(new THREE.Vector3(0, 999, 0))
  const hitPt = useRef(new THREE.Vector3())
  const toCam = useRef(new THREE.Vector3())

  useLayoutEffect(() => {
    const { dirs, scales } = orbs
    dirs.forEach((d, i) => {
      dummy.position.copy(d).multiplyScalar(R)
      dummy.scale.setScalar(scales[i])
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
      mesh.current.setColorAt(i, baseCol)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  }, [orbs, dummy, baseCol])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const { dirs, scales, phase, amp } = orbs
    if (spin.current) {
      spin.current.rotation.y += delta * 0.1
      spin.current.rotation.x = lerp(spin.current.rotation.x, -banyan.pointerY * 0.22, 0.04)
      spin.current.rotation.z = lerp(spin.current.rotation.z, banyan.pointerX * 0.16, 0.04)
    }

    ndc.set(banyan.pointerX, -banyan.pointerY)
    raycaster.setFromCamera(ndc, camera)
    if (raycaster.ray.intersectSphere(sphere, hitPt.current)) {
      toCam.current.copy(camera.position).sub(hitPt.current).normalize()
      banyan.lightX = hitPt.current.x + toCam.current.x * 1.8
      banyan.lightY = hitPt.current.y + toCam.current.y * 1.8
      banyan.lightZ = hitPt.current.z + toCam.current.z * 1.8
      spin.current.worldToLocal(localCursor.current.copy(hitPt.current))
      localCursor.current.normalize()
    }

    const cdir = localCursor.current
    for (let i = 0; i < dirs.length; i++) {
      const d = dirs[i]
      const prox = THREE.MathUtils.smoothstep(d.dot(cdir), 0.86, 1.0)
      // random self-lighting twinkle — only a sparse few peak at any moment
      const tw = Math.sin(t * 0.7 + phase[i] * Math.PI * 2)
      const twinkle = THREE.MathUtils.smoothstep(0.965, 1.0, tw) * amp[i]
      const heat = Math.max(prox * 0.8, twinkle)
      const pop = prox * 0.16 + twinkle * 0.05 + Math.sin(t * 1.1 + i) * 0.004
      dummy.position.copy(d).multiplyScalar(R + pop)
      dummy.scale.setScalar(scales[i] + prox * 0.06 + twinkle * 0.03)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
      tmpCol.copy(baseCol).lerp(hotCol, heat)
      mesh.current.setColorAt(i, tmpCol)
    }
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  })

  return (
    <group ref={spin}>
      <instancedMesh ref={mesh} args={[undefined, undefined, orbs.dirs.length]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial
          color="#0a0b0e"
          metalness={0.6}
          roughness={0.34}
          envMapIntensity={0.5}
        />
      </instancedMesh>
      {/* bright core — its light shows BETWEEN the dark orbs (glowing seams) */}
      <mesh>
        <sphereGeometry args={[R - 0.24, 64, 64]} />
        <meshBasicMaterial color="#FF9E30" toneMapped={false} />
      </mesh>
      {/* faint rim halo only */}
      <mesh>
        <sphereGeometry args={[R * 1.18, 48, 48]} />
        <meshBasicMaterial color="#FF9E30" transparent opacity={0.025} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* core light rims the orbs from within */}
      <pointLight position={[0, 0, 0]} intensity={9} color="#FFB35a" distance={R * 2.0} decay={2} />
    </group>
  )
}

function CursorLight() {
  const ref = useRef()
  const target = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    if (ref.current) {
      target.set(banyan.lightX, banyan.lightY, banyan.lightZ)
      ref.current.position.lerp(target, 0.18)
    }
  })
  return <pointLight ref={ref} intensity={55} color="#fff0d6" distance={15} decay={1.7} />
}

function MicroParticles({ count = 1100 }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 5 + Math.random() * 9
      const u = Math.random() * 2 - 1
      const th = Math.random() * Math.PI * 2
      const s = Math.sqrt(1 - u * u)
      a[i * 3 + 0] = Math.cos(th) * s * r
      a[i * 3 + 1] = u * r * 0.7
      a[i * 3 + 2] = Math.sin(th) * s * r - 2
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
      <pointsMaterial size={0.018} color="#cdd6a8" transparent opacity={0.35} depthWrite={false} sizeAttenuation />
    </points>
  )
}

function CameraRig() {
  const { camera } = useThree()
  useFrame(() => {
    camera.position.x = lerp(camera.position.x, banyan.pointerX * 0.6, 0.05)
    camera.position.y = lerp(camera.position.y, 0.2 + banyan.pointerY * 0.4, 0.05)
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function DomeScene() {
  return (
    <div
      className="hero-canvas"
      style={{
        background:
          'radial-gradient(115% 95% at 50% 42%, #14110a 0%, #0a0905 45%, #040402 75%, #020201 100%)',
      }}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.92,
        }}
        camera={{ position: [0, 0.2, 7.8], fov: 42, near: 0.1, far: 100 }}
      >
        <fog attach="fog" args={['#050603', 9, 22]} />
        <ambientLight intensity={0.05} />
        <CursorLight />

        <Environment resolution={256}>
          <Lightformer form="circle" intensity={2.2} color="#fff1da" position={[0, 6, -3]} scale={7} />
          <Lightformer form="circle" intensity={1.6} color="#FF9E30" position={[-6, 1, 2]} scale={5} />
          <Lightformer form="rect" intensity={1.0} color="#c9d68a" position={[6, -1, 3]} scale={6} />
          <Lightformer form="rect" intensity={1.2} color="#ffffff" position={[0, -5, -4]} scale={9} />
        </Environment>

        <OrbSphere />
        <MicroParticles />
        <CameraRig />
        <EffectComposer>
          <Bloom intensity={0.8} radius={0.6} luminanceThreshold={0.5} luminanceSmoothing={0.85} mipmapBlur />
          <Vignette eskil={false} offset={0.16} darkness={0.96} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

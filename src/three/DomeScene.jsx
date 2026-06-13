import { useMemo, useRef, useLayoutEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { banyan } from './progressStore'

const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const lerp = THREE.MathUtils.lerp
const R = 2.7 // sphere radius

// A full sphere fully clad in dark glossy orbs, lit from within and by a studio
// environment, slowly spinning and lighting up where the cursor passes.
function OrbSphere() {
  const spin = useRef()
  const mesh = useRef()
  const { camera } = useThree()

  // even full-sphere distribution (fibonacci) + a touch of size variation
  const { dirs, scales } = useMemo(() => {
    const N = 820
    const dirs = []
    const scales = []
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2 // full sphere: +1 → -1
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const phi = i * GOLDEN
      dirs.push(new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r))
      scales.push(0.15 + (Math.sin(i * 12.9898) * 0.5 + 0.5) * 0.03)
    }
    return { dirs, scales }
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const baseCol = useMemo(() => new THREE.Color('#0d1410'), [])
  const hotCol = useMemo(() => new THREE.Color('#FF9E30'), [])
  const tmpCol = useMemo(() => new THREE.Color(), [])

  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const sphere = useMemo(() => new THREE.Sphere(new THREE.Vector3(0, 0, 0), R), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const localCursor = useRef(new THREE.Vector3(0, 999, 0))
  const hitPt = useRef(new THREE.Vector3())

  useLayoutEffect(() => {
    dirs.forEach((d, i) => {
      dummy.position.copy(d).multiplyScalar(R)
      dummy.scale.setScalar(scales[i])
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
      mesh.current.setColorAt(i, baseCol)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  }, [dirs, scales, dummy, baseCol])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (spin.current) {
      spin.current.rotation.y += delta * 0.1
      spin.current.rotation.x = lerp(spin.current.rotation.x, -banyan.pointerY * 0.25, 0.04)
      spin.current.rotation.z = lerp(spin.current.rotation.z, banyan.pointerX * 0.18, 0.04)
    }

    ndc.set(banyan.pointerX, -banyan.pointerY)
    raycaster.setFromCamera(ndc, camera)
    if (raycaster.ray.intersectSphere(sphere, hitPt.current)) {
      spin.current.worldToLocal(localCursor.current.copy(hitPt.current))
      localCursor.current.normalize()
    }

    const cdir = localCursor.current
    for (let i = 0; i < dirs.length; i++) {
      const d = dirs[i]
      const prox = THREE.MathUtils.smoothstep(d.dot(cdir), 0.86, 1.0)
      const wave = 0.5 + 0.5 * Math.sin(t * 1.3 + (d.x + d.y + d.z) * 2.5)
      const pop = prox * 0.18 + wave * 0.012
      dummy.position.copy(d).multiplyScalar(R + pop)
      dummy.scale.setScalar(scales[i] + prox * 0.07)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
      tmpCol.copy(baseCol).lerp(hotCol, prox)
      mesh.current.setColorAt(i, tmpCol)
    }
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  })

  return (
    <group ref={spin}>
      <instancedMesh ref={mesh} args={[undefined, undefined, dirs.length]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.18} envMapIntensity={1.1} />
      </instancedMesh>
      {/* inner glow leaking between the orbs */}
      <mesh>
        <sphereGeometry args={[R - 0.22, 64, 64]} />
        <meshBasicMaterial color="#FF9E30" toneMapped={false} />
      </mesh>
    </group>
  )
}

function CameraRig() {
  const { camera } = useThree()
  useFrame(() => {
    camera.position.x = lerp(camera.position.x, banyan.pointerX * 0.6, 0.05)
    camera.position.y = lerp(camera.position.y, 0.3 + banyan.pointerY * 0.4, 0.05)
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
          'radial-gradient(125% 90% at 50% 12%, #2b2f1d 0%, #14180e 38%, #080a06 68%, #040503 100%)',
      }}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        camera={{ position: [0, 0.3, 7.6], fov: 42, near: 0.1, far: 100 }}
      >
        <fog attach="fog" args={['#080a06', 9, 22]} />
        <ambientLight intensity={0.15} />
        <pointLight position={[-5, 2, 4]} intensity={20} color="#FF9E30" distance={26} />
        <pointLight position={[0, -3, 5]} intensity={12} color="#9aa84f" distance={24} />

        {/* premium studio reflections on the glossy orbs */}
        <Environment resolution={256}>
          <Lightformer form="circle" intensity={5} color="#fff1da" position={[0, 6, -3]} scale={7} />
          <Lightformer form="circle" intensity={3} color="#FF9E30" position={[-6, 1, 2]} scale={5} />
          <Lightformer form="rect" intensity={2} color="#c9d68a" position={[6, -1, 3]} scale={6} />
          <Lightformer form="rect" intensity={2.5} color="#ffffff" position={[0, -5, -4]} scale={9} />
        </Environment>

        <OrbSphere />
        <CameraRig />
        <EffectComposer>
          <Bloom intensity={1.25} luminanceThreshold={0.22} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.16} darkness={0.95} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

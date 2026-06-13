import { useMemo, useRef, useLayoutEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { banyan } from './progressStore'

const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const lerp = THREE.MathUtils.lerp
const R = 2.7 // dome radius

// dark glossy orbs arranged on a dome, lit from within, slowly spinning and
// lighting up where the cursor passes.
function Dome() {
  const tilt = useRef()
  const spin = useRef()
  const mesh = useRef()
  const { camera } = useThree()

  // even hemisphere distribution (fibonacci)
  const dirs = useMemo(() => {
    const N = 360
    const arr = []
    for (let i = 0; i < N; i++) {
      const y = lerp(0.04, 1.0, i / (N - 1)) // upper hemisphere
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const phi = i * GOLDEN
      arr.push(new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r))
    }
    return arr
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const baseCol = useMemo(() => new THREE.Color('#0e1712'), [])
  const hotCol = useMemo(() => new THREE.Color('#FF9E30'), [])
  const tmpCol = useMemo(() => new THREE.Color(), [])

  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const sphere = useMemo(() => new THREE.Sphere(new THREE.Vector3(0, 0, 0), R), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const localCursor = useRef(new THREE.Vector3(0, 999, 0))
  const hitPt = useRef(new THREE.Vector3())

  // init instance transforms + colors
  useLayoutEffect(() => {
    dirs.forEach((d, i) => {
      dummy.position.copy(d).multiplyScalar(R)
      dummy.scale.setScalar(0.17)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
      mesh.current.setColorAt(i, baseCol)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  }, [dirs, dummy, baseCol])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (spin.current) spin.current.rotation.y += delta * 0.12
    if (tilt.current) {
      // gentle lean toward the cursor on top of the fixed tilt
      tilt.current.rotation.x = lerp(tilt.current.rotation.x, -0.5 - banyan.pointerY * 0.18, 0.05)
      tilt.current.rotation.z = lerp(tilt.current.rotation.z, banyan.pointerX * 0.12, 0.05)
    }

    // cursor → point on the dome sphere → local space of the spinning group
    ndc.set(banyan.pointerX, -banyan.pointerY)
    raycaster.setFromCamera(ndc, camera)
    if (raycaster.ray.intersectSphere(sphere, hitPt.current)) {
      spin.current.worldToLocal(localCursor.current.copy(hitPt.current))
      localCursor.current.normalize()
    }

    const cdir = localCursor.current
    for (let i = 0; i < dirs.length; i++) {
      const d = dirs[i]
      const prox = THREE.MathUtils.smoothstep(d.dot(cdir), 0.84, 1.0)
      const wave = 0.5 + 0.5 * Math.sin(t * 1.4 + (d.x + d.z) * 3.0)
      const pop = prox * 0.16 + wave * 0.015
      dummy.position.copy(d).multiplyScalar(R + pop)
      dummy.scale.setScalar(0.17 + prox * 0.07)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
      tmpCol.copy(baseCol).lerp(hotCol, prox)
      mesh.current.setColorAt(i, tmpCol)
    }
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  })

  return (
    <group ref={tilt} rotation={[-0.5, 0, 0]}>
      <group ref={spin}>
        <instancedMesh ref={mesh} args={[undefined, undefined, dirs.length]}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial color="#ffffff" metalness={0.55} roughness={0.32} />
        </instancedMesh>
        {/* inner glow that leaks between the orbs */}
        <mesh>
          <sphereGeometry args={[R - 0.2, 48, 48]} />
          <meshBasicMaterial color="#FF9E30" toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

function CameraRig() {
  const { camera } = useThree()
  useFrame(() => {
    camera.position.x = lerp(camera.position.x, banyan.pointerX * 0.5, 0.05)
    camera.position.y = lerp(camera.position.y, 0.6 + banyan.pointerY * 0.3, 0.05)
    camera.lookAt(0, 0.1, 0)
  })
  return null
}

export default function DomeScene() {
  return (
    <div className="hero-canvas">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0.6, 6.6], fov: 45, near: 0.1, far: 100 }}
      >
        <color attach="background" args={['#06070a']} />
        <fog attach="fog" args={['#06070a', 8, 20]} />
        <ambientLight intensity={0.25} />
        <pointLight position={[4, 5, 5]} intensity={40} color="#fff1da" distance={25} />
        <pointLight position={[-5, 1, 3]} intensity={28} color="#FF9E30" distance={25} />
        <pointLight position={[0, -2, 4]} intensity={18} color="#9aa84f" distance={22} />
        <Dome />
        <CameraRig />
        <EffectComposer>
          <Bloom intensity={1.3} luminanceThreshold={0.25} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.18} darkness={0.95} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'
import { banyan } from './progressStore'

const lerp = THREE.MathUtils.lerp

// --- Reactive orb material ----------------------------------------------
// An organic blob: 3D simplex noise displaces the sphere; it bulges toward the
// cursor and flares ember on the rim (fresnel). Brand palette only.
const OrbMaterial = shaderMaterial(
  {
    uTime: 0,
    uAmp: 0.32,
    uFreq: 1.25,
    uCursorDir: new THREE.Vector3(0, 0, 1),
    uCursorPush: 0.0,
    uFade: 1,
    uForest: new THREE.Color('#26331b'),
    uMoss: new THREE.Color('#9aa84f'),
    uEmber: new THREE.Color('#FF9E30'),
    uSand: new THREE.Color('#EBE0C2'),
  },
  /* glsl vertex */ `
    uniform float uTime;
    uniform float uAmp;
    uniform float uFreq;
    uniform vec3 uCursorDir;
    uniform float uCursorPush;
    varying float vDisp;
    varying float vCursor;
    varying vec3 vNormalW;
    varying vec3 vWorld;

    // Ashima simplex noise 3D
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    float snoise(vec3 v){
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + 1.0 * C.xxx;
      vec3 x2 = x0 - i2 + 2.0 * C.xxx;
      vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
      i = mod(i, 289.0);
      vec4 p = permute(permute(permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 1.0/7.0;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vec3 dir = normalize(position);
      float n1 = snoise(position * uFreq + uTime * 0.25);
      float n2 = snoise(position * (uFreq * 2.1) - uTime * 0.18);
      float disp = (n1 * 0.65 + n2 * 0.35) * uAmp;

      // bulge toward the cursor
      float toward = max(dot(dir, uCursorDir), 0.0);
      float cursor = pow(toward, 3.0);
      disp += cursor * uCursorPush;

      vDisp = disp;
      vCursor = cursor;

      vec3 newPos = position + normal * disp;
      vec4 world = modelMatrix * vec4(newPos, 1.0);
      vWorld = world.xyz;
      vNormalW = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * world;
    }
  `,
  /* glsl fragment */ `
    uniform float uTime;
    uniform float uFade;
    uniform vec3 uForest;
    uniform vec3 uMoss;
    uniform vec3 uEmber;
    uniform vec3 uSand;
    varying float vDisp;
    varying float vCursor;
    varying vec3 vNormalW;
    varying vec3 vWorld;

    void main() {
      vec3 N = normalize(vNormalW);
      vec3 V = normalize(cameraPosition - vWorld);
      float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);

      vec3 base = mix(uForest, uMoss, clamp(vDisp * 2.2 + 0.5, 0.0, 1.0));
      vec3 col = base;
      col += uEmber * fres * 1.15;            // warm rim
      col = mix(col, uSand, fres * 0.22);      // pearly sheen
      col += uEmber * vCursor * 1.6;           // cursor heat
      col += uSand * 0.05 * sin(uTime * 1.2 + vDisp * 22.0); // shimmer

      gl_FragColor = vec4(col, uFade);
    }
  `
)

extend({ OrbMaterial })

function Orb() {
  const mat = useRef()
  const group = useRef()
  const { camera } = useThree()

  const geo = useMemo(() => new THREE.IcosahedronGeometry(1.55, 24), [])

  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const cursorWorld = useRef(new THREE.Vector3(0, 0, 3))
  const hit = useRef(new THREE.Vector3())
  const cursorDir = useRef(new THREE.Vector3(0, 0, 1))
  const push = useRef(0)

  useFrame((state, delta) => {
    banyan.scrollCurrent = lerp(banyan.scrollCurrent, banyan.scrollTarget, Math.min(1, delta * 4))
    const s = banyan.scrollCurrent
    const t = state.clock.elapsedTime

    // cursor → world, then direction from the orb centre
    ndc.set(banyan.pointerX, -banyan.pointerY)
    raycaster.setFromCamera(ndc, camera)
    if (raycaster.ray.intersectPlane(plane, hit.current)) {
      cursorWorld.current.lerp(hit.current, 0.15)
    }
    cursorDir.current.lerp(cursorWorld.current.clone().normalize(), 0.15)
    // bulge grows while the cursor is active (near the orb)
    const dist = cursorWorld.current.length()
    push.current = lerp(push.current, THREE.MathUtils.clamp(1.6 - dist * 0.4, 0, 0.6), 0.08)

    const fade = 1 - THREE.MathUtils.smoothstep(s, 0.82, 0.97)

    if (mat.current) {
      mat.current.uTime = t
      mat.current.uCursorDir.copy(cursorDir.current)
      mat.current.uCursorPush = push.current
      mat.current.uFade = fade
    }
    if (group.current) {
      group.current.rotation.y = lerp(group.current.rotation.y, banyan.pointerX * 0.5 + t * 0.06, 0.05)
      group.current.rotation.x = lerp(group.current.rotation.x, -banyan.pointerY * 0.35, 0.05)
      const sc = 1 - s * 0.12
      group.current.scale.setScalar(sc)
    }
  })

  return (
    <group ref={group}>
      <mesh geometry={geo}>
        <orbMaterial ref={mat} transparent depthWrite />
      </mesh>
    </group>
  )
}

function Motes({ count = 80 }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      a[i * 3 + 0] = (Math.random() - 0.5) * 14
      a[i * 3 + 1] = (Math.random() - 0.5) * 10
      a[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1
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
      <pointsMaterial size={0.035} color="#EBE0C2" transparent opacity={0.3} depthWrite={false} sizeAttenuation />
    </points>
  )
}

function CameraRig() {
  const { camera } = useThree()
  useFrame(() => {
    const camX = banyan.pointerX * 0.6
    const camY = banyan.pointerY * 0.4
    const camZ = lerp(4.6, 6.2, banyan.scrollCurrent)
    camera.position.x = lerp(camera.position.x, camX, 0.05)
    camera.position.y = lerp(camera.position.y, camY, 0.05)
    camera.position.z = lerp(camera.position.z, camZ, 0.05)
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function OrbScene() {
  return (
    <div className="banyan-canvas">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 4.6], fov: 45, near: 0.1, far: 100 }}
      >
        <color attach="background" args={['#0e140a']} />
        <fog attach="fog" args={['#0e140a', 6, 16]} />
        <ambientLight intensity={0.6} />
        <pointLight position={[3, 2, 4]} intensity={30} color="#FF9E30" distance={20} />
        <pointLight position={[-4, -2, 2]} intensity={18} color="#9aa84f" distance={20} />
        <Orb />
        <Motes />
        <CameraRig />
        <EffectComposer>
          <Bloom intensity={0.95} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

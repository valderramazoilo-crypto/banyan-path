import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

// --- Tapered branch / root tubes ----------------------------------------
// Lit, dimensional tubes. Each vertex knows WHEN it appears (aGrowth); the
// fragment discards anything past uProgress, so branches grow mid-stroke. A
// bright ember glow rides the growing edge. `uFade` melts the whole tree away
// at the end of the page so the closing section reads clean.
const BanyanTubeMaterial = shaderMaterial(
  {
    uProgress: 0,
    uTime: 0,
    uFade: 1,
    uMoss: new THREE.Color('#9aa84f'),
    uForest: new THREE.Color('#2c3a1d'),
    uEmber: new THREE.Color('#FF9E30'),
    uSand: new THREE.Color('#EBE0C2'),
    uLightDir: new THREE.Vector3(0.4, 0.8, 0.5).normalize(),
  },
  /* glsl vertex */ `
    attribute float aGrowth;
    attribute float aDepth;
    varying float vGrowth;
    varying float vDepth;
    varying vec3 vNormalW;
    varying vec3 vViewDir;
    void main() {
      vGrowth = aGrowth;
      vDepth = aDepth;
      vNormalW = normalize(mat3(modelMatrix) * normal);
      vec4 world = modelMatrix * vec4(position, 1.0);
      vViewDir = normalize(cameraPosition - world.xyz);
      gl_Position = projectionMatrix * viewMatrix * world;
    }
  `,
  /* glsl fragment */ `
    uniform float uProgress;
    uniform float uTime;
    uniform float uFade;
    uniform vec3 uMoss;
    uniform vec3 uForest;
    uniform vec3 uEmber;
    uniform vec3 uSand;
    uniform vec3 uLightDir;
    varying float vGrowth;
    varying float vDepth;
    varying vec3 vNormalW;
    varying vec3 vViewDir;
    void main() {
      if (vGrowth > uProgress) discard;

      vec3 N = normalize(vNormalW);
      float diff = max(dot(N, uLightDir), 0.0);
      float rim = pow(1.0 - max(dot(N, vViewDir), 0.0), 2.5);

      // base: deep forest at the trunk → mossy green at the canopy
      vec3 base = mix(uForest, uMoss, vDepth);
      vec3 col = base * (0.35 + 0.75 * diff);
      col += uEmber * rim * 0.5; // warm rim light

      // ember glow rides the freshly-grown edge
      float tip = smoothstep(uProgress - 0.04, uProgress, vGrowth);
      col = mix(col, uEmber * 1.6, tip);

      // faint living shimmer
      col += uSand * 0.04 * sin(uTime * 1.4 + vGrowth * 30.0);

      gl_FragColor = vec4(col, uFade);
    }
  `
)

// --- Glowing connection nodes -------------------------------------------
const BanyanNodeMaterial = shaderMaterial(
  {
    uProgress: 0,
    uTime: 0,
    uFade: 1,
    uPixelRatio: 1,
    uMoss: new THREE.Color('#9aa84f'),
    uEmber: new THREE.Color('#FF9E30'),
    uSand: new THREE.Color('#EBE0C2'),
  },
  /* glsl vertex */ `
    attribute float aGrowth;
    attribute float aSize;
    attribute float aKind;
    uniform float uProgress;
    uniform float uTime;
    uniform float uPixelRatio;
    varying float vAppear;
    varying float vKind;
    void main() {
      vKind = aKind;
      vAppear = smoothstep(aGrowth, aGrowth + 0.04, uProgress);
      float pulse = 1.0 + 0.2 * sin(uTime * 2.0 + aGrowth * 30.0);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = aSize * 80.0 * vAppear * pulse * uPixelRatio / -mv.z;
    }
  `,
  /* glsl fragment */ `
    uniform float uFade;
    uniform vec3 uMoss;
    uniform vec3 uEmber;
    uniform vec3 uSand;
    varying float vAppear;
    varying float vKind;
    void main() {
      if (vAppear <= 0.001) discard;
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      if (d > 0.5) discard;
      float glow = smoothstep(0.5, 0.0, d);
      vec3 col = uMoss;
      col = mix(col, uEmber, step(0.5, vKind) * step(vKind, 1.5));
      col = mix(col, uSand, step(1.5, vKind));
      gl_FragColor = vec4(col, glow * vAppear * uFade);
    }
  `
)

extend({ BanyanTubeMaterial, BanyanNodeMaterial })

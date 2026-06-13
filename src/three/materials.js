import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

// --- Branch / root lines -------------------------------------------------
// Each vertex knows WHEN it should appear (aGrowth). The fragment discards
// anything beyond uProgress, so segments are revealed mid-stroke = growth.
const BanyanLineMaterial = shaderMaterial(
  {
    uProgress: 0,
    uTime: 0,
    uMoss: new THREE.Color('#909c4a'),
    uForest: new THREE.Color('#3a4a26'),
    uEmber: new THREE.Color('#FF9E30'),
    uSand: new THREE.Color('#EBE0C2'),
  },
  // vertex
  /* glsl */ `
    attribute float aGrowth;
    attribute float aDepth;
    varying float vGrowth;
    varying float vDepth;
    void main() {
      vGrowth = aGrowth;
      vDepth = aDepth;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment
  /* glsl */ `
    uniform float uProgress;
    uniform float uTime;
    uniform vec3 uMoss;
    uniform vec3 uForest;
    uniform vec3 uEmber;
    uniform vec3 uSand;
    varying float vGrowth;
    varying float vDepth;
    void main() {
      if (vGrowth > uProgress) discard;

      // base colour fades from deep forest (trunk) to mossy green (canopy)
      vec3 base = mix(uForest, uMoss, vDepth);

      // bright ember glow rides the leading growth edge
      float tip = smoothstep(uProgress - 0.05, uProgress, vGrowth);
      vec3 col = mix(base, uEmber, tip);

      // subtle living shimmer
      col += uSand * 0.06 * sin(uTime * 1.5 + vGrowth * 40.0);

      float alpha = 0.35 + vDepth * 0.35 + tip * 0.5;
      gl_FragColor = vec4(col, alpha);
    }
  `
)

// --- Glowing connection nodes -------------------------------------------
const BanyanNodeMaterial = shaderMaterial(
  {
    uProgress: 0,
    uTime: 0,
    uPixelRatio: 1,
    uMoss: new THREE.Color('#909c4a'),
    uEmber: new THREE.Color('#FF9E30'),
    uSand: new THREE.Color('#EBE0C2'),
  },
  // vertex
  /* glsl */ `
    attribute float aGrowth;
    attribute float aSize;
    attribute float aKind; // 0 joint, 1 leaf, 2 root
    uniform float uProgress;
    uniform float uTime;
    uniform float uPixelRatio;
    varying float vAppear;
    varying float vKind;
    void main() {
      vKind = aKind;
      // pop-in over a short window after the node's growth threshold
      vAppear = smoothstep(aGrowth, aGrowth + 0.04, uProgress);

      float pulse = 1.0 + 0.18 * sin(uTime * 2.0 + aGrowth * 30.0);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = aSize * 70.0 * vAppear * pulse * uPixelRatio / -mv.z;
    }
  `,
  // fragment
  /* glsl */ `
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
      col = mix(col, uEmber, step(0.5, vKind) * step(vKind, 1.5)); // leaf
      col = mix(col, uSand, step(1.5, vKind)); // root

      gl_FragColor = vec4(col, glow * vAppear);
    }
  `
)

extend({ BanyanLineMaterial, BanyanNodeMaterial })

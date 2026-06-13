import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

// --- Reactive branch lines ----------------------------------------------
// Clean glowing lines. Each vertex appears when uProgress passes its aGrowth
// (scroll-driven growth). Branches near the world-space cursor (uCursor) REACH
// toward it and flare ember — the signature interaction. uFade melts the tree
// at the end of the page.
const BanyanLineMaterial = shaderMaterial(
  {
    uProgress: 0,
    uTime: 0,
    uFade: 1,
    uCursor: new THREE.Vector3(999, 999, 999),
    uCursorR: 2.6,
    uReach: 0.45,
    uMoss: new THREE.Color('#9aa84f'),
    uSand: new THREE.Color('#EBE0C2'),
    uEmber: new THREE.Color('#FF9E30'),
  },
  /* glsl vertex */ `
    attribute float aGrowth;
    attribute float aDepth;
    uniform float uProgress;
    uniform vec3 uCursor;
    uniform float uCursorR;
    uniform float uReach;
    varying float vGrowth;
    varying float vDepth;
    varying float vNear;
    void main() {
      vGrowth = aGrowth;
      vDepth = aDepth;
      vec4 world = modelMatrix * vec4(position, 1.0);
      float d = distance(world.xyz, uCursor);
      float near = smoothstep(uCursorR, 0.0, d);
      // only already-grown branch reacts
      vNear = near * step(aGrowth, uProgress);
      // reach toward the cursor
      vec3 toCursor = normalize(uCursor - world.xyz);
      world.xyz += toCursor * vNear * uReach;
      gl_Position = projectionMatrix * viewMatrix * world;
    }
  `,
  /* glsl fragment */ `
    uniform float uProgress;
    uniform float uTime;
    uniform float uFade;
    uniform vec3 uMoss;
    uniform vec3 uSand;
    uniform vec3 uEmber;
    varying float vGrowth;
    varying float vDepth;
    varying float vNear;
    void main() {
      if (vGrowth > uProgress) discard;

      // calm minimalist base: moss → soft sand toward the canopy
      vec3 base = mix(uMoss, uSand, vDepth * 0.55);

      // ember rides the freshly-grown edge…
      float tip = smoothstep(uProgress - 0.05, uProgress, vGrowth);
      // …and flares wherever the cursor passes
      float heat = max(tip, vNear);
      vec3 col = mix(base, uEmber, heat) + uEmber * vNear * 0.6;

      col += uSand * 0.04 * sin(uTime * 1.3 + vGrowth * 30.0);

      float alpha = (0.24 + vDepth * 0.28 + tip * 0.6 + vNear * 0.85) * uFade;
      gl_FragColor = vec4(col, alpha);
    }
  `
)

// --- Reactive glowing nodes ---------------------------------------------
const BanyanNodeMaterial = shaderMaterial(
  {
    uProgress: 0,
    uTime: 0,
    uFade: 1,
    uPixelRatio: 1,
    uCursor: new THREE.Vector3(999, 999, 999),
    uCursorR: 2.6,
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
    uniform vec3 uCursor;
    uniform float uCursorR;
    varying float vAppear;
    varying float vKind;
    varying float vNear;
    void main() {
      vKind = aKind;
      vAppear = smoothstep(aGrowth, aGrowth + 0.04, uProgress);
      vec4 world = modelMatrix * vec4(position, 1.0);
      vNear = smoothstep(uCursorR, 0.0, distance(world.xyz, uCursor)) * vAppear;
      float pulse = 1.0 + 0.2 * sin(uTime * 2.0 + aGrowth * 30.0);
      vec4 mv = viewMatrix * world;
      gl_Position = projectionMatrix * mv;
      gl_PointSize = aSize * 80.0 * vAppear * (pulse + vNear * 1.4) * uPixelRatio / -mv.z;
    }
  `,
  /* glsl fragment */ `
    uniform float uFade;
    uniform vec3 uMoss;
    uniform vec3 uEmber;
    uniform vec3 uSand;
    varying float vAppear;
    varying float vKind;
    varying float vNear;
    void main() {
      if (vAppear <= 0.001) discard;
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      if (d > 0.5) discard;
      float glow = smoothstep(0.5, 0.0, d);
      vec3 col = uMoss;
      col = mix(col, uEmber, step(0.5, vKind) * step(vKind, 1.5));
      col = mix(col, uSand, step(1.5, vKind));
      col = mix(col, uEmber, vNear); // flare near the cursor
      gl_FragColor = vec4(col, glow * vAppear * uFade);
    }
  `
)

extend({ BanyanLineMaterial, BanyanNodeMaterial })

import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

// --- Main branch lines --------------------------------------------------
// Clean glowing lines. Appear as uProgress passes aGrowth (scroll growth).
// A subtle ember warmth where the cursor passes; uFade melts the tree at the
// end of the page. No displacement — the "expansion" is the filaments below.
const BanyanLineMaterial = shaderMaterial(
  {
    uProgress: 0,
    uTime: 0,
    uFade: 1,
    uCursor: new THREE.Vector3(999, 999, 999),
    uCursorR: 2.8,
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
    varying float vGrowth;
    varying float vDepth;
    varying float vNear;
    void main() {
      vGrowth = aGrowth;
      vDepth = aDepth;
      vec4 world = modelMatrix * vec4(position, 1.0);
      vNear = smoothstep(uCursorR, 0.0, distance(world.xyz, uCursor)) * step(aGrowth, uProgress);
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
      vec3 base = mix(uMoss, uSand, vDepth * 0.55);
      float tip = smoothstep(uProgress - 0.05, uProgress, vGrowth);
      vec3 col = mix(base, uEmber, max(tip, vNear * 0.6));
      col += uSand * 0.04 * sin(uTime * 1.3 + vGrowth * 30.0);
      float alpha = (0.24 + vDepth * 0.28 + tip * 0.55 + vNear * 0.35) * uFade;
      gl_FragColor = vec4(col, alpha);
    }
  `
)

// --- Latent filaments (cursor sprouts more lines) -----------------------
// Hidden until the cursor nears the filament's base, then it extends out from
// that base and glows ember — the tree "expands into more lines".
const BanyanFilamentMaterial = shaderMaterial(
  {
    uProgress: 0,
    uTime: 0,
    uFade: 1,
    uCursor: new THREE.Vector3(999, 999, 999),
    uCursorR: 3.0,
    uEmber: new THREE.Color('#FF9E30'),
    uSand: new THREE.Color('#EBE0C2'),
  },
  /* glsl vertex */ `
    attribute vec3 aBase;
    attribute float aGrowth;
    uniform float uProgress;
    uniform vec3 uCursor;
    uniform float uCursorR;
    varying float vNear;
    void main() {
      vec3 baseW = (modelMatrix * vec4(aBase, 1.0)).xyz;
      float grown = step(aGrowth, uProgress);
      float near = smoothstep(uCursorR, 0.0, distance(baseW, uCursor)) * grown;
      vNear = near;
      vec3 fullW = (modelMatrix * vec4(position, 1.0)).xyz;
      // sprout: interpolate from the base out to the full twig by proximity
      vec3 pos = mix(baseW, fullW, near);
      gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
    }
  `,
  /* glsl fragment */ `
    uniform float uFade;
    uniform vec3 uEmber;
    uniform vec3 uSand;
    varying float vNear;
    void main() {
      if (vNear <= 0.02) discard;
      vec3 col = mix(uSand, uEmber, 0.75);
      gl_FragColor = vec4(col, vNear * 0.85 * uFade);
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
    uCursorR: 2.8,
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
      gl_PointSize = aSize * 80.0 * vAppear * (pulse + vNear * 1.2) * uPixelRatio / -mv.z;
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
      float dd = length(uv);
      if (dd > 0.5) discard;
      float glow = smoothstep(0.5, 0.0, dd);
      vec3 col = uMoss;
      col = mix(col, uEmber, step(0.5, vKind) * step(vKind, 1.5));
      col = mix(col, uSand, step(1.5, vKind));
      col = mix(col, uEmber, vNear);
      gl_FragColor = vec4(col, glow * vAppear * uFade);
    }
  `
)

extend({ BanyanLineMaterial, BanyanFilamentMaterial, BanyanNodeMaterial })

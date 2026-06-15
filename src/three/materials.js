import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'

// Shared palette — green strands, white-green glow (matches the reference).
const MOSS = '#7fa83e'
const SAND = '#eaf3d6'
const EMBER = '#FF9E30'

// --- Main strands -------------------------------------------------------
const BanyanLineMaterial = shaderMaterial(
  {
    uProgress: 0,
    uTime: 0,
    uFade: 1,
    uCursor: new THREE.Vector3(999, 999, 999),
    uCursorR: 2.6,
    uMoss: new THREE.Color(MOSS),
    uSand: new THREE.Color(SAND),
    uEmber: new THREE.Color(EMBER),
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
    varying float vGrowth;
    varying float vDepth;
    varying float vNear;
    void main() {
      if (vGrowth > uProgress) discard;
      vec3 base = mix(uMoss, uSand, vDepth * 0.4);
      float tip = smoothstep(uProgress - 0.05, uProgress, vGrowth);
      vec3 col = mix(base, uSand, max(tip, vNear));
      col += uSand * 0.04 * sin(uTime * 1.3 + vGrowth * 30.0);
      float alpha = (0.3 + vDepth * 0.25 + tip * 0.5 + vNear * 0.6) * uFade;
      gl_FragColor = vec4(col, alpha);
    }
  `
)

// --- Latent filaments (cursor sprouts more lines) -----------------------
const BanyanFilamentMaterial = shaderMaterial(
  {
    uProgress: 0,
    uTime: 0,
    uFade: 1,
    uCursor: new THREE.Vector3(999, 999, 999),
    uCursorR: 3.0,
    uSand: new THREE.Color(SAND),
    uMoss: new THREE.Color(MOSS),
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
      gl_Position = projectionMatrix * viewMatrix * vec4(mix(baseW, fullW, near), 1.0);
    }
  `,
  /* glsl fragment */ `
    uniform float uFade;
    uniform vec3 uSand;
    uniform vec3 uMoss;
    varying float vNear;
    void main() {
      if (vNear <= 0.02) discard;
      gl_FragColor = vec4(mix(uMoss, uSand, 0.7), vNear * 0.85 * uFade);
    }
  `
)

// --- Connection web -----------------------------------------------------
const BanyanConnectionMaterial = shaderMaterial(
  {
    uProgress: 0,
    uTime: 0,
    uFade: 1,
    uCursor: new THREE.Vector3(999, 999, 999),
    uCursorR: 3.0,
    uSand: new THREE.Color(SAND),
    uMoss: new THREE.Color(MOSS),
  },
  /* glsl vertex */ `
    attribute float aGrowth;
    uniform float uProgress;
    uniform vec3 uCursor;
    uniform float uCursorR;
    varying float vGrowth;
    varying float vNear;
    void main() {
      vGrowth = aGrowth;
      vec4 world = modelMatrix * vec4(position, 1.0);
      vNear = smoothstep(uCursorR, 0.0, distance(world.xyz, uCursor)) * step(aGrowth, uProgress);
      gl_Position = projectionMatrix * viewMatrix * world;
    }
  `,
  /* glsl fragment */ `
    uniform float uProgress;
    uniform float uTime;
    uniform float uFade;
    uniform vec3 uSand;
    uniform vec3 uMoss;
    varying float vGrowth;
    varying float vNear;
    void main() {
      if (vGrowth > uProgress) discard;
      float pulse = 0.5 + 0.5 * sin(uTime * 1.6 + vGrowth * 18.0);
      vec3 col = mix(uMoss, uSand, vNear);
      float alpha = (0.06 + 0.07 * pulse + vNear * 0.5) * uFade;
      gl_FragColor = vec4(col, alpha);
    }
  `
)

// --- Glowing nodes / dots -----------------------------------------------
const BanyanNodeMaterial = shaderMaterial(
  {
    uProgress: 0,
    uTime: 0,
    uFade: 1,
    uPixelRatio: 1,
    uCursor: new THREE.Vector3(999, 999, 999),
    uCursorR: 2.6,
    uMoss: new THREE.Color(MOSS),
    uSand: new THREE.Color(SAND),
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
      float pulse = 1.0 + 0.18 * sin(uTime * 2.0 + aGrowth * 30.0);
      vec4 mv = viewMatrix * world;
      gl_Position = projectionMatrix * mv;
      gl_PointSize = aSize * 90.0 * vAppear * (pulse + vNear * 1.2) * uPixelRatio / -mv.z;
    }
  `,
  /* glsl fragment */ `
    uniform float uFade;
    uniform vec3 uMoss;
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
      // tips bright white-green, dots mossy; flare to white near cursor
      vec3 col = mix(uMoss, uSand, step(0.5, vKind));
      col = mix(col, uSand, vNear);
      gl_FragColor = vec4(col, glow * vAppear * uFade);
    }
  `
)

// --- Roots: draw-in + a glow band that travels down on scroll -----------
const BanyanRootMaterial = shaderMaterial(
  {
    uDraw: 1,
    uSweep: 0,
    uTime: 0,
    uFade: 1,
    uCursor: new THREE.Vector3(999, 999, 999),
    uCursorR: 2.4,
    uMoss: new THREE.Color('#7fa83e'),
    uSand: new THREE.Color('#eaf3d6'),
    uEmber: new THREE.Color('#FF9E30'),
  },
  /* glsl vertex */ `
    attribute float aGrowth;
    attribute float aDepth;
    uniform vec3 uCursor;
    uniform float uCursorR;
    varying float vGrowth;
    varying float vDepth;
    varying float vNear;
    void main() {
      vGrowth = aGrowth;
      vDepth = aDepth;
      vec4 world = modelMatrix * vec4(position, 1.0);
      vNear = smoothstep(uCursorR, 0.0, distance(world.xyz, uCursor));
      gl_Position = projectionMatrix * viewMatrix * world;
    }
  `,
  /* glsl fragment */ `
    uniform float uDraw;
    uniform float uSweep;
    uniform float uTime;
    uniform float uFade;
    uniform vec3 uMoss;
    uniform vec3 uSand;
    uniform vec3 uEmber;
    varying float vGrowth;
    varying float vDepth;
    varying float vNear;
    void main() {
      if (vGrowth > uDraw) discard;
      vec3 base = mix(uMoss, uSand, vDepth * 0.35);
      // a soft glow band riding the scroll position, sweeping down the roots
      float band = smoothstep(0.16, 0.0, abs(vGrowth - uSweep));
      float glow = max(band, vNear);
      vec3 col = mix(base, uEmber, glow);
      col += uEmber * band * 0.7 + uSand * 0.03 * sin(uTime + vGrowth * 24.0);
      float alpha = (0.16 + band * 0.7 + vNear * 0.5) * uFade;
      gl_FragColor = vec4(col, alpha);
    }
  `
)

extend({
  BanyanLineMaterial,
  BanyanFilamentMaterial,
  BanyanConnectionMaterial,
  BanyanNodeMaterial,
  BanyanRootMaterial,
})

import { useEffect, useRef, useState } from 'react'

// Image card with a physically-inspired water surface (raw WebGL, no three.js).
// Dragging the cursor seeds droplets along its path; each droplet radiates an
// expanding, decaying wave packet (rings that travel outward, interfere and
// dissipate — real ripple behaviour). The image is refracted by the surface
// gradient and crests catch a specular glint. Click = big splash. Ripples keep
// expanding after the cursor leaves. Falls back to a plain <img> without WebGL
// or with prefers-reduced-motion.

const MAX_RIPPLES = 12
const LIFE = 2.8 // seconds a ripple stays alive

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uImgRes;
uniform vec4 uRipples[${MAX_RIPPLES}]; // x, y (aspect space), birth time, amplitude

const float SPEED = 0.42;  // wavefront speed (uv/s)
const float K = 70.0;      // ring density
const float LIFE = ${LIFE.toFixed(1)};

vec2 coverUv(vec2 uv){
  float ca = uRes.x / uRes.y;
  float ia = uImgRes.x / uImgRes.y;
  vec2 s = (ca > ia) ? vec2(1.0, ia / ca) : vec2(ca / ia, 1.0);
  return (uv - 0.5) * s + 0.5;
}

// surface height: sum of expanding, damped wave packets
float heightAt(vec2 p){
  float h = 0.0;
  for (int i = 0; i < ${MAX_RIPPLES}; i++){
    vec4 rp = uRipples[i];
    if (rp.w <= 0.0) continue;
    float age = uTime - rp.z;
    if (age <= 0.0 || age >= LIFE) continue;
    vec2 d = p - rp.xy;
    float dist = length(d);
    float trail = dist - age * SPEED;      // 0 at the wavefront
    // sharp leading edge, longer trailing rings behind the front
    float fall = mix(55.0, 480.0, step(0.0, trail));
    float packet = exp(-trail * trail * fall);
    float spread = 1.0 / (1.0 + dist * 16.0); // energy spreads with radius
    float decay = 1.0 - age / LIFE;
    decay *= decay;                          // ease-out dissipation
    h += rp.w * sin(K * trail) * packet * spread * decay;
  }
  return h;
}

void main(){
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(vUv.x * aspect, vUv.y);

  // surface gradient -> refraction normal (finite differences)
  float e = 1.6 / uRes.y;
  float hC = heightAt(p);
  float hX = heightAt(p + vec2(e, 0.0));
  float hY = heightAt(p + vec2(0.0, e));
  vec2 grad = vec2(hX - hC, hY - hC) / e;

  // refract the image through the surface
  vec2 off = -grad * 0.010;
  vec2 cuv = coverUv(vUv + off);

  // faint chromatic split only where the surface is disturbed
  float mag = length(grad) * 0.006;
  vec3 col;
  col.r = texture2D(uTex, cuv + off * 0.35).r;
  col.g = texture2D(uTex, cuv).g;
  col.b = texture2D(uTex, cuv - off * 0.35).b;

  // lighting: crests catch a soft specular glint, troughs darken slightly
  vec3 n = normalize(vec3(-grad * 0.55, 1.0));
  vec3 L = normalize(vec3(-0.4, 0.65, 0.7));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(n, H), 0.0), 90.0);
  col += spec * vec3(1.0, 0.94, 0.8) * 0.55;
  col *= 1.0 + hC * 1.6;

  gl_FragColor = vec4(col, 1.0);
}`

export default function WaterCard({ src, alt = '', className = '' }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap || reduce) {
      setFallback(true)
      return
    }
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
    if (!gl) {
      setFallback(true)
      return
    }

    // --- program ----------------------------------------------------------
    const compile = (type, srcCode) => {
      const sh = gl.createShader(type)
      gl.shaderSource(sh, srcCode)
      gl.compileShader(sh)
      return sh
    }
    const prog = gl.createProgram()
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFallback(true)
      return
    }
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const U = (n) => gl.getUniformLocation(prog, n)
    const uTime = U('uTime')
    const uRes = U('uRes')
    const uImgRes = U('uImgRes')
    const uRipples = U('uRipples')

    // --- texture ------------------------------------------------------------
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([14, 20, 16]))

    let imgW = 1
    let imgH = 1
    const img = new Image()
    img.onload = () => {
      imgW = img.naturalWidth
      imgH = img.naturalHeight
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
      kick()
    }
    img.src = src

    // --- sizing ---------------------------------------------------------------
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      if (!w || !h) return
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
      kick()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    // --- ripple pool ------------------------------------------------------------
    const ripples = new Float32Array(MAX_RIPPLES * 4) // x, y, birth, amp
    let head = 0
    let lastBirth = -1e9
    const t0 = performance.now()
    const now = () => (performance.now() - t0) / 1000

    const spawn = (u, v, amp) => {
      const aspect = wrap.clientWidth / Math.max(1, wrap.clientHeight)
      const o = head * 4
      ripples[o + 0] = u * aspect
      ripples[o + 1] = v
      ripples[o + 2] = now()
      ripples[o + 3] = amp
      head = (head + 1) % MAX_RIPPLES
      lastBirth = ripples[o + 2]
      kick()
    }

    // --- render loop ----------------------------------------------------------
    let raf = 0
    let running = false
    const frame = () => {
      const t = now()
      gl.uniform1f(uTime, t)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform2f(uImgRes, imgW, imgH)
      gl.uniform4fv(uRipples, ripples)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      // idle out once every ripple has fully dissipated
      if (t - lastBirth > LIFE + 0.1) {
        running = false
        return
      }
      raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!running) {
        running = true
        raf = requestAnimationFrame(frame)
      }
    }

    // --- interaction: seed droplets along the pointer path ---------------------
    let lastU = -1
    let lastV = -1
    const uvOf = (e) => {
      const r = wrap.getBoundingClientRect()
      return [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height]
    }
    const onEnter = (e) => {
      const [u, v] = uvOf(e)
      lastU = u
      lastV = v
      spawn(u, v, 0.9)
    }
    const onMove = (e) => {
      const [u, v] = uvOf(e)
      const t = now()
      const dx = u - lastU
      const dy = v - lastV
      const moved = Math.hypot(dx, dy)
      // drop a new ripple roughly every few % of travel (throttled in time)
      if (moved > 0.055 && t - lastBirth > 0.045) {
        const amp = Math.min(1.15, 0.5 + moved * 5.0) // faster strokes → bigger waves
        spawn(u, v, amp)
        lastU = u
        lastV = v
      }
    }
    const onDown = (e) => {
      const [u, v] = uvOf(e)
      spawn(u, v, 1.9) // splash
    }
    wrap.addEventListener('pointerenter', onEnter)
    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerdown', onDown)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      wrap.removeEventListener('pointerenter', onEnter)
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerdown', onDown)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [src])

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      {fallback ? (
        <img src={src} alt={alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label={alt} role="img" />
      )}
    </div>
  )
}

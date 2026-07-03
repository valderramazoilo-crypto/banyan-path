import { useEffect, useRef, useState } from 'react'

// Image card with a WebGL water-ripple distortion that follows the cursor.
// Raw WebGL (no three.js) to keep the bundle light. Falls back to a plain
// <img> when WebGL is unavailable or reduced motion is requested.

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
uniform vec2 uMouse;   // uv space
uniform float uTime;
uniform float uHover;  // 0..1 eased
uniform vec2 uRes;
uniform vec2 uImgRes;

vec2 coverUv(vec2 uv){
  float ca = uRes.x / uRes.y;
  float ia = uImgRes.x / uImgRes.y;
  vec2 s = (ca > ia) ? vec2(1.0, ia / ca) : vec2(ca / ia, 1.0);
  return (uv - 0.5) * s + 0.5;
}

void main(){
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  vec2 d = uv - uMouse;
  d.x *= aspect;
  float dist = length(d);
  vec2 dir = d / max(dist, 1e-4);

  // concentric water ripples radiating from the cursor, fading with distance
  float ripple = sin(dist * 42.0 - uTime * 5.5) * exp(-dist * 4.2) * 0.028 * uHover;
  vec2 off = dir * ripple;

  vec2 cuv = coverUv(uv + off);
  float ca = ripple * 0.55; // slight refraction split
  vec3 col;
  col.r = texture2D(uTex, cuv + dir * ca).r;
  col.g = texture2D(uTex, cuv).g;
  col.b = texture2D(uTex, cuv - dir * ca).b;

  // soft specular glint on the ripple crests
  col += clamp(ripple * 9.0, 0.0, 1.0) * vec3(0.95, 0.88, 0.72) * 0.22;

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
    const compile = (type, src) => {
      const sh = gl.createShader(type)
      gl.shaderSource(sh, src)
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
    const uMouse = U('uMouse')
    const uTime = U('uTime')
    const uHover = U('uHover')
    const uRes = U('uRes')
    const uImgRes = U('uImgRes')

    // --- texture ------------------------------------------------------------
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    // placeholder pixel until the image loads
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

    // --- interaction + loop ----------------------------------------------------
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    let hover = 0
    let hoverTarget = 0
    let time = 0
    let raf = 0
    let running = false
    let last = 0

    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016)
      last = now
      time += dt
      mouse.x += (mouse.tx - mouse.x) * 0.14
      mouse.y += (mouse.ty - mouse.y) * 0.14
      hover += (hoverTarget - hover) * 0.07

      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.uniform1f(uTime, time)
      gl.uniform1f(uHover, hover)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform2f(uImgRes, imgW, imgH)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      // idle out: stop the loop once the ripple has fully settled
      if (hoverTarget === 0 && hover < 0.004) {
        running = false
        return
      }
      raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!running) {
        running = true
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }

    const onMove = (e) => {
      const r = wrap.getBoundingClientRect()
      mouse.tx = (e.clientX - r.left) / r.width
      mouse.ty = 1 - (e.clientY - r.top) / r.height
      hoverTarget = 1
      kick()
    }
    const onLeave = () => {
      hoverTarget = 0
      kick()
    }
    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerleave', onLeave)
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

import { useEffect, useRef } from 'react'

// Lightweight 2D particle network (no WebGL). Particles drift and connect with
// lines; scrolling speeds the flow and brightens the links, so the "living
// network" reacts to scroll. Sits behind the content as a subtle backdrop.
export default function ParticleField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf = 0
    let w = 0
    let h = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let particles = []

    const COUNT = () => Math.min(120, Math.floor((w * h) / 16000))
    const MAX_DIST = 130

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = COUNT()
      particles = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() < 0.12 ? 1.8 : 1.0,
        ember: Math.random() < 0.12,
      }))
    }

    // scroll → flow energy (decays); brightens links + speeds particles
    let lastScroll = window.scrollY
    let flow = 0
    const onScroll = () => {
      const y = window.scrollY
      flow = Math.min(1, flow + Math.abs(y - lastScroll) * 0.01)
      lastScroll = y
    }

    function frame() {
      ctx.clearRect(0, 0, w, h)
      flow *= 0.94
      const speed = 1 + flow * 2.2

      for (const p of particles) {
        p.x += p.vx * speed
        p.y += p.vy * speed
        if (p.x < -20) p.x = w + 20
        if (p.x > w + 20) p.x = -20
        if (p.y < -20) p.y = h + 20
        if (p.y > h + 20) p.y = -20
      }

      // links
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < MAX_DIST * MAX_DIST) {
            const d = Math.sqrt(d2)
            const t = 1 - d / MAX_DIST
            const alpha = t * (0.05 + flow * 0.22)
            ctx.strokeStyle = `rgba(${flow > 0.3 ? '255,158,48' : '154,168,79'},${alpha})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      // nodes
      for (const p of particles) {
        ctx.fillStyle = p.ember
          ? `rgba(255,158,48,${0.35 + flow * 0.4})`
          : `rgba(234,224,194,${0.28 + flow * 0.3})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(frame)
    }

    resize()
    if (reduce) {
      // draw a single static frame, no animation
      frame()
      cancelAnimationFrame(raf)
    } else {
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', resize)
      raf = requestAnimationFrame(frame)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />
}

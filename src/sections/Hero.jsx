import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

// Cursor-alive hero: a cinematic flashlight opens the darkness around the
// pointer, the video parallaxes in depth, and the headline letters are
// MAGNETIC — they spring away from the cursor and settle back elastically.
// Falls back to a calm static grade on touch devices / reduced motion.

export default function Hero() {
  const secRef = useRef(null)
  const videoRef = useRef(null)
  const spotRef = useRef(null)
  const glowRef = useRef(null)
  const charsRef = useRef([])
  charsRef.current = [] // reset collector each render

  const collect = (el) => {
    if (el) charsRef.current.push(el)
  }
  const chars = (text) =>
    [...text].map((ch, i) =>
      ch === ' ' ? (
        ' '
      ) : (
        <span key={i} ref={collect} className="magnet-char">
          {ch}
        </span>
      )
    )

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const sec = secRef.current
    if (!sec || !fine || reduce) return

    const letters = charsRef.current
    const states = letters.map(() => ({ x: 0, y: 0, r: 0 }))
    let bases = []

    // cache untransformed letter centres (relative to the section)
    const measure = () => {
      const r = sec.getBoundingClientRect()
      letters.forEach((el) => (el.style.transform = ''))
      bases = letters.map((el) => {
        const b = el.getBoundingClientRect()
        return { x: b.left + b.width / 2 - r.left, y: b.top + b.height / 2 - r.top }
      })
    }
    measure()
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)

    const target = { x: 0.5, y: 0.45 }
    const cur = { x: 0.5, y: 0.45 }
    let raf = 0
    let hasCursor = false // effects stay dormant until the pointer really moves

    const loop = () => {
      if (!hasCursor) {
        raf = requestAnimationFrame(loop)
        return
      }
      cur.x += (target.x - cur.x) * 0.09
      cur.y += (target.y - cur.y) * 0.09
      const r = sec.getBoundingClientRect()
      const px = cur.x * r.width
      const py = cur.y * r.height

      // flashlight: the dark grade opens around the cursor
      if (spotRef.current) {
        spotRef.current.style.background = `radial-gradient(circle 400px at ${px}px ${py}px, rgba(5,7,10,0) 0%, rgba(5,7,10,0.32) 48%, rgba(5,7,10,0.6) 100%)`
      }
      // warm ember halo riding with it
      if (glowRef.current) {
        glowRef.current.style.background = `radial-gradient(circle 260px at ${px}px ${py}px, rgba(255,158,48,0.13), transparent 70%)`
      }
      // depth parallax on the video
      if (videoRef.current) {
        videoRef.current.style.transform = `translate(${(0.5 - cur.x) * 26}px, ${(0.5 - cur.y) * 16}px) scale(1.08)`
      }
      // magnetic letters: repel + tilt near the cursor, spring back
      for (let i = 0; i < letters.length; i++) {
        const b = bases[i]
        if (!b) continue
        const dx = b.x - px
        const dy = b.y - py
        const d = Math.hypot(dx, dy) || 1
        const R = 200
        let tx = 0
        let ty = 0
        let rot = 0
        if (d < R) {
          const f = (1 - d / R) * 26
          tx = (dx / d) * f
          ty = (dy / d) * f
          rot = (dx / d) * (1 - d / R) * 6
        }
        const s = states[i]
        s.x += (tx - s.x) * 0.16
        s.y += (ty - s.y) * 0.16
        s.r += (rot - s.r) * 0.16
        letters[i].style.transform = `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px) rotate(${s.r.toFixed(2)}deg)`
      }
      raf = requestAnimationFrame(loop)
    }

    const onMove = (e) => {
      const r = sec.getBoundingClientRect()
      target.x = (e.clientX - r.left) / r.width
      target.y = (e.clientY - r.top) / r.height
      if (!hasCursor) {
        hasCursor = true
        cur.x = target.x
        cur.y = target.y
      }
    }
    const onLeave = () => {
      target.x = 0.5
      target.y = 0.45
    }
    sec.addEventListener('pointermove', onMove)
    sec.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      sec.removeEventListener('pointermove', onMove)
      sec.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <section
      id="top"
      ref={secRef}
      className="relative flex min-h-screen items-center overflow-hidden px-6 md:px-10"
    >
      {/* video banner (parallax layer) */}
      <video
        ref={videoRef}
        className="pointer-events-none absolute inset-0 h-full w-full scale-[1.08] object-cover will-change-transform"
        autoPlay
        loop
        muted
        playsInline
        poster="/video/hero-poster.jpg"
      >
        <source src="/video/hero.mp4" type="video/mp4" />
      </video>

      {/* legibility gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#05070a] via-[#05070a]/70 to-[#05070a]/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080c08] via-transparent to-[#05070a]/50" />

      {/* cursor flashlight + ember halo */}
      <div
        ref={spotRef}
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle 420px at 50% 45%, rgba(5,7,10,0) 0%, rgba(5,7,10,0.3) 50%, rgba(5,7,10,0.55) 100%)',
        }}
      />
      <div ref={glowRef} className="absolute inset-0 mix-blend-screen" />

      {/* content */}
      <div className="relative z-[2] mx-auto w-full max-w-7xl">
        <div className="max-w-3xl">
          <p className="eyebrow reveal mb-7">
            Hospitality &amp; Restaurant Staffing · Florida
          </p>

          <h1 className="hero-title display-xl text-left text-[clamp(2.9rem,9vw,7.5rem)] text-sand">
            <span className="line-mask">
              <span className="line-inner">{chars('ALL WE DO')}</span>
            </span>
            <span className="line-mask">
              <span className="line-inner">
                {chars('IS ')}
                <span className="title-accent text-ember">{chars('STAFFING')}</span>
              </span>
            </span>
          </h1>

          <p className="reveal mt-8 max-w-xl font-body text-lg leading-relaxed text-sand/80 md:text-xl">
            Reliable, fully compliant workforce solutions for hotels, resorts and
            restaurants across Florida — qualified professionals, ready when you
            need them.
          </p>

          <div className="reveal mt-10 flex flex-wrap items-center gap-4">
            <Link to="/contact" className="btn-ember">
              Request talent
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <a href="#services" className="btn-ghost">
              Our services
            </a>
          </div>
        </div>
      </div>

      {/* bottom meta + scroll cue */}
      <div className="absolute inset-x-0 bottom-7 z-[2] mx-auto flex max-w-7xl items-end justify-between px-6 md:px-10">
        <span className="hidden font-body text-xs uppercase tracking-widest2 text-sand/45 sm:block">
          Recruited · Screened · Fully compliant
        </span>
        <div className="flex items-center gap-2 text-sand/45">
          <span className="font-body text-xs uppercase tracking-widest2">Scroll</span>
          <span className="h-8 w-px animate-pulse bg-gradient-to-b from-ember to-transparent" />
        </div>
      </div>
    </section>
  )
}

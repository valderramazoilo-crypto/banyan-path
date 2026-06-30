import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useScrollAndPointer } from './hooks/useScrollAndPointer'
import Nav from './components/Nav'
import Hero from './sections/Hero'
import Essence from './sections/Essence'
import Roles from './sections/Roles'
import Companies from './sections/Companies'
import Stats from './sections/Stats'
import Services from './sections/Services'
import Process from './sections/Process'
import Contact from './sections/Contact'

gsap.registerPlugin(ScrollTrigger)

export default function Landing() {
  const root = useRef(null)
  useScrollAndPointer()

  useLayoutEffect(() => {
    // --- premium smooth scroll (Lenis) wired into GSAP/ScrollTrigger ---
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenis.on('scroll', ScrollTrigger.update)
    const onTick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    // in-page anchor links scroll smoothly via Lenis (offset for the fixed nav)
    const onAnchorClick = (e) => {
      const a = e.target.closest('a[href^="#"]')
      if (!a) return
      const href = a.getAttribute('href')
      if (href.length > 1) {
        e.preventDefault()
        lenis.scrollTo(href, { offset: -80 })
      }
    }
    document.addEventListener('click', onAnchorClick)

    const ctx = gsap.context(() => {
      // --- hero title: cascading mask reveal on load -------------------
      const titleLines = gsap.utils.toArray('.hero-title .line-inner')
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (titleLines.length && !reduce) {
        gsap.from(titleLines, {
          yPercent: 115,
          duration: 1.15,
          ease: 'power4.out',
          stagger: 0.12,
          delay: 0.2,
        })
      }

      // --- staggered reveals -------------------------------------------
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      })

      // --- pinned horizontal process track -----------------------------
      const track = document.querySelector('.process-track')
      const pin = document.querySelector('.process-pin')
      if (track && pin) {
        const distance = () => track.scrollWidth - window.innerWidth + 80
        gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: () => '+=' + distance(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        })
      }
    }, root)

    return () => {
      ctx.revert()
      document.removeEventListener('click', onAnchorClick)
      gsap.ticker.remove(onTick)
      lenis.destroy()
    }
  }, [])

  return (
    <div ref={root} className="content-layer">
      <Nav />
      <main>
        <Hero />
        <Essence />
        <Roles />
        <Stats />
        <Services />
        <Companies />
        <Process />
        <Contact />
      </main>
    </div>
  )
}

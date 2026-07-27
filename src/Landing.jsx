import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Nav from './components/Nav'
import Hero from './sections/Hero'
import Essence from './sections/Essence'
import Roles from './sections/Roles'
import Companies from './sections/Companies'
import Stats from './sections/Stats'
import Services from './sections/Services'
import Gallery from './sections/Gallery'
import Process from './sections/Process'
import PathBand from './sections/PathBand'
import Contact from './sections/Contact'

gsap.registerPlugin(ScrollTrigger)

export default function Landing() {
  const root = useRef(null)

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

    // --- reveal-on-scroll via native IntersectionObserver ---------------
    // (CSS-driven; immune to the GSAP-ticker freeze that could strand every
    // reveal hidden when navigating back to this page in the SPA)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.04 }
    )
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))

    const ctx = gsap.context(() => {
      // --- pinned horizontal process track (scrub — scroll-driven) -------
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

    // SPA route changes don't fire window 'load', so ScrollTrigger start/end
    // positions can be measured before the video/images/fonts settle and every
    // below-the-fold reveal gets stuck hidden. Refresh once layout is ready.
    const refresh = () => ScrollTrigger.refresh()
    const raf = requestAnimationFrame(refresh)
    const t = setTimeout(refresh, 400)
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
      window.removeEventListener('load', refresh)
      io.disconnect()
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
        <Gallery />
        <Process />
        <PathBand />
        <Contact />
      </main>
    </div>
  )
}

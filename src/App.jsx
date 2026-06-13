import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BanyanScene from './three/BanyanScene'
import { useScrollAndPointer } from './hooks/useScrollAndPointer'
import Nav from './components/Nav'
import Hero from './sections/Hero'
import Essence from './sections/Essence'
import Stats from './sections/Stats'
import Services from './sections/Services'
import Process from './sections/Process'
import Contact from './sections/Contact'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const root = useRef(null)
  useScrollAndPointer()

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
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

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root}>
      <BanyanScene />
      <div className="content-layer">
        <Nav />
        <main>
          <Hero />
          <Essence />
          <Stats />
          <Services />
          <Process />
          <Contact />
        </main>
      </div>
    </div>
  )
}

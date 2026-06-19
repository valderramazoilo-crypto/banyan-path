import { useEffect, useState } from 'react'
import Logo from './Logo'

const links = [
  ['About', '#about'],
  ['Talent', '#talent'],
  ['Services', '#services'],
  ['Process', '#process'],
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed left-0 top-0 z-30 w-full transition-all duration-500 ${
        scrolled
          ? 'border-b border-sand/10 bg-forest-deep/70 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-500 md:px-10 ${
          scrolled ? 'py-3.5' : 'py-5'
        }`}
      >
        <a href="#top" className="transition-opacity hover:opacity-80">
          <Logo className="h-7" />
        </a>

        <nav className="hidden items-center gap-1 rounded-full border border-sand/12 bg-forest-deep/40 p-1.5 backdrop-blur-md md:flex">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="group relative rounded-full px-4 py-2 font-display text-sm font-medium uppercase tracking-widest text-sand/80 transition-all duration-300 hover:bg-ember/10 hover:text-ember"
            >
              {label}
              <span className="absolute bottom-1 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-ember transition-all duration-300 group-hover:w-1/2" />
            </a>
          ))}
        </nav>

        <a href="#contact" className="btn-ember text-sm">
          Contact us
        </a>
      </div>
    </header>
  )
}

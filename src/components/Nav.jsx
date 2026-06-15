import { useEffect, useState } from 'react'
import Logo from './Logo'

const links = [
  ['Esencia', '#esencia'],
  ['Talento', '#talento'],
  ['Servicios', '#servicios'],
  ['Proceso', '#proceso'],
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
        <a href="#top" className="text-[1.4rem] transition-opacity hover:opacity-80">
          <Logo />
        </a>

        <nav className="hidden items-center gap-9 md:flex">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="group relative font-body text-sm uppercase tracking-widest text-sand/70 transition-colors hover:text-sand"
            >
              {label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-ember transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <a href="#contacto" className="btn-ember text-sm">
          Contáctanos
        </a>
      </div>
    </header>
  )
}

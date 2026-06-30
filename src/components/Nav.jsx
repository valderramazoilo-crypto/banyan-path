import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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

        <nav className="hidden items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.05] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_10px_30px_-14px_rgba(0,0,0,0.7)] backdrop-blur-2xl md:flex">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-full px-4 py-1.5 font-body text-[13px] uppercase tracking-[0.14em] text-sand/65 transition-colors duration-300 hover:bg-white/[0.07] hover:text-sand"
            >
              {label}
            </a>
          ))}
        </nav>

        <Link to="/contact" className="btn-ember text-sm">
          Contact us
        </Link>
      </div>
    </header>
  )
}

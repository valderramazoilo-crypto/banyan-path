import { useEffect, useState } from 'react'
import { Link } from '../router'
import Logo from './Logo'

const links = [
  ['About', '#about'],
  ['Talent', '#talent'],
  ['Services', '#services'],
  ['Process', '#process'],
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // lock page scroll while the mobile menu is open
  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

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

        <div className="flex items-center gap-3">
          <Link to="/contact" className="btn-ember hidden text-sm sm:inline-flex">
            Contact us
          </Link>

          {/* mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="grid h-11 w-11 place-items-center rounded-full border border-sand/20 bg-forest-deep/50 text-sand backdrop-blur-md transition-colors hover:border-ember hover:text-ember md:hidden"
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* mobile menu overlay */}
      {open && (
        <div className="fixed inset-0 top-[64px] z-40 flex flex-col bg-forest-deep/95 backdrop-blur-xl md:hidden">
          <nav className="flex flex-1 flex-col items-center justify-center gap-2 px-8">
            {links.map(([label, href], i) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="w-full rounded-2xl px-6 py-4 text-center font-display text-2xl font-semibold text-sand transition-colors hover:bg-white/[0.06] hover:text-ember"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                {label}
              </a>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="btn-ember mt-6 w-full justify-center text-base"
            >
              Contact us
            </Link>
          </nav>
          <p className="pb-10 text-center font-body text-xs uppercase tracking-widest2 text-sand/40">
            All we do is staffing · Florida
          </p>
        </div>
      )}
    </header>
  )
}

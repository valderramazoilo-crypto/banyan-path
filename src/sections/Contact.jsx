import { Link } from '../router'
import Logo from '../components/Logo'

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-32 text-center md:px-10"
    >
      <div className="pointer-events-none absolute left-1/2 top-[38%] h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,158,48,0.16),transparent_70%)] blur-2xl" />

      <div className="relative mx-auto w-full max-w-3xl">
        <p className="eyebrow reveal mb-6">Let's build your team</p>
        <h2 className="reveal font-display text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold leading-[0.95] tracking-tightest text-sand">
          The right person,
          <br />
          the <span className="text-ember">right role</span>.
        </h2>
        <p className="reveal mx-auto mt-8 max-w-xl font-body text-lg leading-relaxed text-sand/70">
          Tell us the talent you need and let Banyan Path handle the rest — from
          recruitment and screening to payroll, compliance and placement.
        </p>

        <div className="reveal mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/contact" className="btn-ember">
            Request talent
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <a href="mailto:operations@banyanpath.com" className="btn-ghost">
            operations@banyanpath.com
          </a>
        </div>
      </div>

      <footer className="relative mt-28 w-full max-w-7xl pt-8">
        <div className="hairline absolute left-0 top-0" />
        <div className="flex flex-col items-center justify-between gap-4 text-sand/50 sm:flex-row">
          <a href="#top">
            <Logo className="h-6" />
          </a>
          <span className="font-body text-xs uppercase tracking-widest2">
            All we do is staffing · Florida · 2026
          </span>
        </div>
      </footer>
    </section>
  )
}

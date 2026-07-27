import { useEffect } from 'react'
import { Link } from '../router'
import Logo from '../components/Logo'

const iconCls = 'grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ember/15 text-ember'

export default function ContactPage() {
  useEffect(() => window.scrollTo(0, 0), [])

  return (
    <div className="content-layer flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 md:px-10">
        <Link to="/" aria-label="Back to home" className="transition-opacity hover:opacity-80">
          <Logo className="h-7" />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-body text-sm uppercase tracking-widest text-sand/65 transition-colors hover:text-ember"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Link>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 md:px-10 md:py-20">
        {/* intro */}
        <p className="eyebrow mb-6">Get in touch</p>
        <h1 className="max-w-3xl font-display text-[clamp(2.4rem,6vw,4.5rem)] font-extrabold leading-[0.95] tracking-tightest text-sand">
          Let's build your <span className="text-ember">team</span>.
        </h1>
        <p className="mt-7 max-w-xl font-body text-lg leading-relaxed text-sand/70">
          Reach out and our team will get back to you shortly with the right
          people for your property.
        </p>

        {/* info grid */}
        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-sand/10 bg-sand/10 md:grid-cols-3">
          {/* contacts */}
          <div className="bg-forest-deep/80 p-9 backdrop-blur-sm">
            <div className="mb-6 flex items-center gap-3">
              <span className={iconCls}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h4l2 5-3 2a12 12 0 006 6l2-3 5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-sand">
                Contact us
              </h2>
            </div>
            <ul className="space-y-3 font-body text-sand/80">
              <li>
                <a href="tel:+17868625610" className="transition-colors hover:text-ember">
                  (786) 862-5610
                </a>
              </li>
              <li>
                <a href="tel:+13053709442" className="transition-colors hover:text-ember">
                  (305) 370-9442
                </a>
              </li>
              <li>
                <a href="mailto:operations@banyanpath.com" className="break-all transition-colors hover:text-ember">
                  operations@banyanpath.com
                </a>
              </li>
            </ul>
          </div>

          {/* work hours */}
          <div className="bg-forest-deep/80 p-9 backdrop-blur-sm">
            <div className="mb-6 flex items-center gap-3">
              <span className={iconCls}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-sand">
                Work hours
              </h2>
            </div>
            <ul className="space-y-3 font-body text-sand/80">
              <li className="flex justify-between gap-4"><span>Monday – Friday</span><span className="text-sand/55">9am – 5pm</span></li>
              <li className="flex justify-between gap-4"><span>Saturday</span><span className="text-sand/55">9am – 1pm</span></li>
              <li className="flex justify-between gap-4"><span>Sunday &amp; Holidays</span><span className="text-sand/55">Closed</span></li>
            </ul>
          </div>

          {/* office */}
          <div className="bg-forest-deep/80 p-9 backdrop-blur-sm">
            <div className="mb-6 flex items-center gap-3">
              <span className={iconCls}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
                </svg>
              </span>
              <h2 className="font-display text-sm font-bold uppercase tracking-widest text-sand">
                Corporate office
              </h2>
            </div>
            <address className="font-body not-italic leading-relaxed text-sand/80">
              3750 NW 87th Ave,
              <br />
              Suite 700, Doral,
              <br />
              FL 33178
            </address>
            <a
              href="https://maps.google.com/?q=3750+NW+87th+Ave+Suite+700+Doral+FL+33178"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 font-body text-sm font-medium text-ember/90 transition-colors hover:text-ember"
            >
              View on map
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 pb-10 md:px-10">
        <p className="font-body text-xs uppercase tracking-widest2 text-sand/40">
          All we do is staffing · Florida
        </p>
      </footer>
    </div>
  )
}

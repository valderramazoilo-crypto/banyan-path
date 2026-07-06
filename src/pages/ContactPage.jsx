import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

const field =
  'w-full rounded-xl border border-sand/15 bg-forest-deep/50 px-4 py-3 font-body text-sand placeholder-sand/35 outline-none transition-colors focus:border-ember focus:bg-forest-deep/70'
const labelCls = 'mb-2 block font-body text-xs uppercase tracking-widest text-sand/55'

// Set VITE_FORM_ENDPOINT (e.g. a Formspree URL like https://formspree.io/f/xxxx)
// to capture submissions server-side; without it the form falls back to opening
// the visitor's mail client.
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT

export default function ContactPage() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | mailto | error
  const sent = status === 'sent' || status === 'mailto'
  useEffect(() => window.scrollTo(0, 0), [])

  const onSubmit = async (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const get = (k) => (f.get(k) || '').toString().trim()

    if (ENDPOINT) {
      setStatus('sending')
      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: f,
        })
        setStatus(res.ok ? 'sent' : 'error')
      } catch {
        setStatus('error')
      }
      return
    }

    const subject = `Talent request — ${get('name') || 'Banyan Path'}`
    const body = [
      `Name: ${get('name')}`,
      `Company / property: ${get('company')}`,
      `Email: ${get('email')}`,
      `Phone: ${get('phone')}`,
      `Role(s) needed: ${get('roles')}`,
      `Headcount: ${get('headcount')}`,
      '',
      get('message'),
    ].join('\n')
    window.location.href = `mailto:operations@banyanpath.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`
    setStatus('mailto')
  }

  return (
    <div className="content-layer min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-10">
        <Link to="/" className="transition-opacity hover:opacity-80">
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

      <main className="mx-auto grid max-w-6xl gap-12 px-6 py-12 md:grid-cols-2 md:gap-16 md:px-10 md:py-20">
        {/* intro */}
        <div>
          <p className="eyebrow mb-6">Request talent</p>
          <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] font-extrabold leading-[0.95] tracking-tightest text-sand">
            Let's build
            <br />
            your <span className="text-ember">team</span>.
          </h1>
          <p className="mt-7 max-w-md font-body text-lg leading-relaxed text-sand/70">
            Tell us the roles you need and a few details about your property. Our
            team will get back to you shortly.
          </p>

          <div className="mt-10 space-y-4">
            <a
              href="mailto:operations@banyanpath.com"
              className="flex items-center gap-3 font-body text-sand/80 transition-colors hover:text-ember"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ember/15 text-ember">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 7l9 6 9-6M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              operations@banyanpath.com
            </a>
            <p className="font-body text-sm text-sand/45">
              Hospitality &amp; restaurant workforce solutions · Florida
            </p>
          </div>
        </div>

        {/* form */}
        <div className="glass rounded-3xl p-7 md:p-9">
          {sent ? (
            <div className="flex h-full min-h-[20rem] flex-col items-center justify-center text-center">
              <span className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-ember/15 text-ember">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h2 className="font-display text-2xl font-bold text-sand">
                {status === 'sent' ? 'Request sent' : 'Almost there'}
              </h2>
              <p className="mt-3 max-w-xs font-body text-sand/65">
                {status === 'sent'
                  ? "Thank you — our team will be in touch shortly."
                  : 'Your email app should have opened with the request ready to send. If not, write us at operations@banyanpath.com.'}
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="btn-ghost mt-7"
                type="button"
              >
                Back to form
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className={labelCls}>Full name *</label>
                  <input id="name" name="name" required className={field} placeholder="Jane Doe" />
                </div>
                <div>
                  <label htmlFor="company" className={labelCls}>Company / property *</label>
                  <input id="company" name="company" required className={field} placeholder="Your property name" />
                </div>
                <div>
                  <label htmlFor="email" className={labelCls}>Email *</label>
                  <input id="email" name="email" type="email" required className={field} placeholder="you@company.com" />
                </div>
                <div>
                  <label htmlFor="phone" className={labelCls}>Phone</label>
                  <input id="phone" name="phone" type="tel" className={field} placeholder="+1 (305) 000-0000" />
                </div>
                <div>
                  <label htmlFor="roles" className={labelCls}>Role(s) needed</label>
                  <input id="roles" name="roles" className={field} placeholder="Housekeeping, Front Desk…" />
                </div>
                <div>
                  <label htmlFor="headcount" className={labelCls}>Headcount</label>
                  <input id="headcount" name="headcount" className={field} placeholder="e.g. 8" />
                </div>
              </div>
              <div>
                <label htmlFor="message" className={labelCls}>Anything else?</label>
                <textarea id="message" name="message" rows="4" className={`${field} resize-none`} placeholder="Dates, location, requirements…" />
              </div>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn-ember w-full justify-center disabled:pointer-events-none disabled:opacity-60"
              >
                {status === 'sending' ? 'Sending…' : 'Send request'}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {status === 'error' && (
                <p role="alert" className="text-center font-body text-sm text-ember">
                  Something went wrong — please retry or email operations@banyanpath.com.
                </p>
              )}
              <p className="text-center font-body text-xs text-sand/40">
                We'll never share your information.
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}

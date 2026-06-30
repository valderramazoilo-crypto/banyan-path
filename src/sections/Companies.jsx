import { Link } from 'react-router-dom'
import Picture from '../components/Picture'
import TiltCard from '../components/TiltCard'

const points = [
  'Recruitment and screening',
  'Payroll and workforce management',
  "Workers' Compensation coverage",
  'Full labor law compliance',
]

export default function Companies() {
  return (
    <section className="relative px-6 py-24 md:px-10">
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-[2.5rem] border border-sand/12">
        <div className="grid md:grid-cols-2">
          <TiltCard max={0} lift={22} className="relative min-h-[18rem] overflow-hidden">
            <Picture
              slug="recruitment"
              alt="Banyan Path recruitment team"
              sizes="(max-width: 768px) 100vw, 50vw"
              className="tilt-img absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/40 to-forest-deep" />
            <div className="tilt-glow" />
          </TiltCard>
          <div className="bg-forest-deep/80 p-10 backdrop-blur-sm md:p-14">
            <p className="eyebrow reveal mb-5">Fully compliant &amp; workforce ready</p>
            <h2 className="reveal font-display text-3xl font-extrabold leading-tight tracking-tightest text-sand md:text-4xl">
              You define the role.
              <br />
              We handle the rest.
            </h2>
            <ul className="reveal mt-8 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex items-center gap-3 font-body text-sand/80">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ember/15 text-ember">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <Link to="/contact" className="btn-ember reveal mt-10">
              Request talent
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

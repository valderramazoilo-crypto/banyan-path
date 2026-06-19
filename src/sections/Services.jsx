const services = [
  ['Contract', 'Temporary coverage with talent ready to operate.'],
  ['Contract-to-Hire', 'Evaluate on the job before committing to a permanent hire.'],
  ['Full-Time Contract', 'Complete teams committed for the long term.'],
  ['Part-Time Contract', 'Flexibility for demand peaks and seasonal coverage.'],
  ['Permanent', 'Direct placement of key and leadership roles.'],
  ['Peak-Season', 'Rapid coverage for openings and busy periods.'],
]

export default function Services() {
  return (
    <section
      id="services"
      className="relative px-6 py-32 md:px-10"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-16 max-w-2xl">
          <p className="eyebrow reveal mb-6">Engagement models</p>
          <h2 className="reveal font-display text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-tight tracking-tightest text-sand">
            A model for every{' '}
            <span className="text-ember">need</span>.
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(([title, desc], i) => (
            <article
              key={title}
              className="reveal group relative overflow-hidden rounded-2xl border border-sand/10 bg-forest/30 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-ember/40"
            >
              <div className="absolute inset-0 -z-10 bg-banyan-gradient opacity-0 transition-opacity duration-500 group-hover:opacity-10" />
              <span className="font-display text-sm font-semibold text-ember/70">
                0{i + 1}
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold text-sand">
                {title}
              </h3>
              <p className="mt-3 font-body leading-relaxed text-sand/60">
                {desc}
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 font-body text-sm font-medium text-sand/40 transition-colors group-hover:text-ember">
                Request
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

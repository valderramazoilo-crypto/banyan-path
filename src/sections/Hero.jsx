import Picture from '../components/Picture'

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center px-6 py-28 md:px-10"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* copy */}
        <div>
          <p className="eyebrow reveal mb-6">
            Reclutamiento de housekeeping · Hospitality
          </p>

          <h1 className="display-xl reveal text-[clamp(2.8rem,9vw,7.5rem)] text-sand">
            ALL WE DO
            <br />
            IS <span className="text-ember">STAFFING</span>
          </h1>

          <p className="reveal mt-8 max-w-xl font-body text-lg leading-relaxed text-sand/75 md:text-xl">
            Conectamos hoteles con talento de housekeeping de{' '}
            <span className="text-sand">gran nivel</span>. Una red viva de
            conexiones profesionales que crece contigo — como el árbol banyan.
          </p>

          <div className="reveal mt-10 flex flex-wrap items-center gap-4">
            <a href="#contacto" className="btn-ember">
              Encuentra tu talento
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a href="#talento" className="btn-ghost">
              Ver especialidades
            </a>
          </div>
        </div>

        {/* portrait */}
        <div className="reveal relative hidden lg:block">
          <div className="relative mx-auto max-w-sm overflow-hidden rounded-[2rem] border border-sand/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
            <Picture
              slug="housekeeper-portrait"
              alt="Especialista de housekeeping de Banyan Path"
              eager
              sizes="420px"
              className="aspect-[3/4] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl border border-sand/15 bg-forest-deep/50 px-4 py-3 backdrop-blur-md">
              <span className="font-display text-sm font-semibold text-sand">
                Talento verificado
              </span>
              <span className="flex items-center gap-1.5 font-body text-xs text-ember">
                <span className="h-1.5 w-1.5 rounded-full bg-ember" />
                Disponible
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-sand/50">
          <span className="font-body text-xs uppercase tracking-widest2">
            Scroll
          </span>
          <span className="h-10 w-px animate-pulse bg-gradient-to-b from-ember to-transparent" />
        </div>
      </div>
    </section>
  )
}

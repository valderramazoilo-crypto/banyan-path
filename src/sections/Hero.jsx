export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center overflow-hidden px-6 md:px-10"
    >
      {/* video banner */}
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster="/video/hero-poster.jpg"
      >
        <source src="/video/hero.mp4" type="video/mp4" />
      </video>

      {/* legibility + cinematic grading overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#05070a] via-[#05070a]/75 to-[#05070a]/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080c08] via-transparent to-[#05070a]/50" />
      <div className="absolute inset-0 bg-[#05070a]/20" />

      {/* content */}
      <div className="relative z-[2] mx-auto w-full max-w-7xl">
        <div className="max-w-3xl">
          <p className="eyebrow reveal mb-7">
            Reclutamiento de housekeeping · Hospitality
          </p>

          <h1 className="hero-title display-xl text-left text-[clamp(2.9rem,9vw,7.5rem)] text-sand">
            <span className="line-mask">
              <span className="line-inner">ALL WE DO</span>
            </span>
            <span className="line-mask">
              <span className="line-inner">
                IS <span className="title-accent text-ember">STAFFING</span>
              </span>
            </span>
          </h1>

          <p className="reveal mt-8 max-w-xl font-body text-lg leading-relaxed text-sand/80 md:text-xl">
            Conectamos hoteles con talento de housekeeping de gran nivel. Una red
            viva de conexiones profesionales — como el árbol banyan.
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
      </div>

      {/* bottom meta + scroll cue */}
      <div className="absolute inset-x-0 bottom-7 z-[2] mx-auto flex max-w-7xl items-end justify-between px-6 md:px-10">
        <span className="hidden font-body text-xs uppercase tracking-widest2 text-sand/45 sm:block">
          Talento verificado · Coincidencia perfecta
        </span>
        <div className="flex items-center gap-2 text-sand/45">
          <span className="font-body text-xs uppercase tracking-widest2">Scroll</span>
          <span className="h-8 w-px animate-pulse bg-gradient-to-b from-ember to-transparent" />
        </div>
      </div>
    </section>
  )
}

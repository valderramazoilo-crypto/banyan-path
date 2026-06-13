export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center md:px-10"
    >
      {/* soft radial just behind the text for legibility over the live tree */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(14,20,10,0.72)_0%,rgba(14,20,10,0.25)_45%,transparent_70%)]" />

      <div className="relative mx-auto w-full max-w-4xl">
        <p className="eyebrow reveal mb-7">
          Reclutamiento de housekeeping · Hospitality
        </p>

        <h1 className="display-xl reveal text-[clamp(2.9rem,10vw,8rem)] text-sand">
          ALL WE DO
          <br />
          IS <span className="text-ember">STAFFING</span>
        </h1>

        <p className="reveal mx-auto mt-8 max-w-xl font-body text-lg leading-relaxed text-sand/75 md:text-xl">
          Conectamos hoteles con talento de housekeeping de gran nivel. Una red
          viva de conexiones profesionales — como el árbol banyan.
        </p>

        <div className="reveal mt-10 flex flex-wrap items-center justify-center gap-4">
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

        <p className="reveal mt-12 inline-flex items-center gap-2 font-body text-xs uppercase tracking-widest2 text-sand/45">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ember" />
          </span>
          Mueve el cursor sobre la red
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-sand/45">
          <span className="font-body text-xs uppercase tracking-widest2">Scroll</span>
          <span className="h-10 w-px animate-pulse bg-gradient-to-b from-ember to-transparent" />
        </div>
      </div>
    </section>
  )
}

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col justify-center px-6 md:px-10"
    >
      <div className="mx-auto w-full max-w-7xl">
        <p className="eyebrow reveal mb-6">Reclutamiento · Industria hotelera</p>

        <h1 className="display-xl reveal text-[clamp(3rem,11vw,9.5rem)] text-sand">
          ALL WE DO
          <br />
          IS <span className="text-ember">STAFFING</span>
        </h1>

        <p className="reveal mt-8 max-w-xl font-body text-lg leading-relaxed text-sand/75 md:text-xl">
          Conectamos a la persona correcta con el trabajo ideal. Una red viva de
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
          <a href="#esencia" className="btn-ghost">
            Conoce la marca
          </a>
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

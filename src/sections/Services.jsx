const services = [
  ['Contract', 'Cobertura temporal con talento listo para operar.'],
  ['Contract-to-Hire', 'Evalúa en el puesto antes de contratar de forma fija.'],
  ['Full-Time Contract', 'Equipos completos comprometidos a largo plazo.'],
  ['Part-Time Contract', 'Flexibilidad para picos de demanda y temporadas.'],
  ['Permanent', 'Colocación directa de perfiles clave y de liderazgo.'],
  ['Remote', 'Talento distribuido coordinado y verificado.'],
]

export default function Services() {
  return (
    <section
      id="servicios"
      className="relative px-6 py-32 md:px-10"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-16 max-w-2xl">
          <p className="eyebrow reveal mb-6">Modalidades de staffing</p>
          <h2 className="reveal font-display text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-tight tracking-tightest text-sand">
            Una raíz para cada{' '}
            <span className="text-ember">necesidad</span>.
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
                Solicitar
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

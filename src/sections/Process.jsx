const steps = [
  [
    '01',
    'Filtro inicial',
    'Definimos el perfil y rastreamos nuestra red para preseleccionar candidatos con las habilidades y cualificaciones exactas.',
  ],
  [
    '02',
    'Entrevistas',
    'Evaluamos experiencia, actitud y encaje cultural. Tú solo ves a quienes ya cumplen tus criterios.',
  ],
  [
    '03',
    'Verificación',
    'Validamos antecedentes y referencias para que la colocación sea segura desde el primer día.',
  ],
  [
    '04',
    'Colocación',
    'Conectamos a la persona correcta con el trabajo ideal y acompañamos la incorporación.',
  ],
]

export default function Process() {
  return (
    <section id="proceso" className="process-pin relative h-screen overflow-hidden">
      <div className="flex h-full items-center px-6 md:px-10">
        <div className="absolute left-6 top-24 z-10 md:left-10">
          <p className="eyebrow mb-3">Cómo trabajamos</p>
          <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-tightest text-sand">
            Del perfil a la <span className="text-ember">colocación</span>.
          </h2>
        </div>

        <div className="process-track flex gap-6 pl-2 will-change-transform">
          {steps.map(([n, title, desc]) => (
            <div
              key={n}
              className="relative flex h-[60vh] w-[80vw] shrink-0 flex-col justify-end rounded-3xl border border-sand/10 bg-forest/40 p-10 backdrop-blur-sm sm:w-[55vw] lg:w-[38vw]"
            >
              <span className="font-display text-[7rem] font-extrabold leading-none text-ember/15">
                {n}
              </span>
              <h3 className="mt-2 font-display text-3xl font-bold text-sand">
                {title}
              </h3>
              <p className="mt-4 max-w-md font-body text-lg leading-relaxed text-sand/65">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

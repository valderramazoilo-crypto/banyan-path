export default function Essence() {
  return (
    <section
      id="esencia"
      className="relative flex min-h-screen items-center px-6 py-32 md:px-10"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-16 md:grid-cols-2 md:items-center">
        <div>
          <p className="eyebrow reveal mb-6">Nuestra esencia</p>
          <h2 className="reveal font-display text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-tight tracking-tightest text-sand">
            Crecemos creando{' '}
            <span className="text-ember">vínculos sólidos</span>.
          </h2>
          <p className="reveal mt-8 font-body text-lg leading-relaxed text-sand/70">
            Inspirados en el árbol banyan, representamos una red viva de
            conexiones profesionales. Igual que el banyan se expande soltando
            raíces que se convierten en nuevos troncos, nosotros unimos el
            potencial humano con las necesidades corporativas.
          </p>
          <p className="reveal mt-5 font-body text-lg leading-relaxed text-sand/70">
            Ahorramos tiempo y recursos gestionando el filtro inicial,
            entrevistas y verificación de antecedentes — para que ambas partes
            encuentren la coincidencia perfecta.
          </p>
        </div>

        <div className="reveal grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            ['Cercano', 'Conexión humana, confianza y acompañamiento.'],
            ['Expertos', 'Conocimiento y criterio profesional.'],
            ['Eficientes', 'Rapidez, coordinación y resultados.'],
          ].map(([t, d]) => (
            <div
              key={t}
              className="group rounded-2xl border border-sand/10 bg-forest/40 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-ember/50 hover:bg-forest-mid/50"
            >
              <div className="mb-4 h-1 w-8 rounded-full bg-ember transition-all duration-300 group-hover:w-14" />
              <h3 className="font-display text-xl font-bold text-sand">{t}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-sand/60">
                {d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

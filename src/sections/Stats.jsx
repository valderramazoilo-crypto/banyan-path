const stats = [
  ['48h', 'Para presentar candidatos preseleccionados'],
  ['100%', 'Filtro inicial, entrevistas y verificación'],
  ['1', 'Coincidencia perfecta entre persona y puesto'],
]

export default function Stats() {
  return (
    <section className="relative px-6 py-24 md:px-10">
      <div className="mx-auto grid w-full max-w-7xl gap-px overflow-hidden rounded-3xl border border-sand/10 bg-sand/10 md:grid-cols-3">
        {stats.map(([n, d]) => (
          <div
            key={d}
            className="reveal bg-forest-deep/80 p-10 backdrop-blur-sm"
          >
            <div className="font-display text-6xl font-extrabold tracking-tightest text-ember md:text-7xl">
              {n}
            </div>
            <p className="mt-3 font-body text-sm leading-relaxed text-sand/65">
              {d}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

const stats = [
  ['48h', 'To present pre-screened candidates'],
  ['100%', 'Screening, interviews & background checks'],
  ['1:1', 'The right person matched to the right role'],
]

export default function Stats() {
  return (
    <section className="relative px-6 py-28 md:px-10">
      <div className="mx-auto grid w-full max-w-7xl gap-px overflow-hidden rounded-[1.75rem] border border-sand/10 bg-sand/10 md:grid-cols-3">
        {stats.map(([n, d]) => (
          <div
            key={d}
            className="group reveal relative bg-forest-deep/80 p-10 backdrop-blur-sm transition-colors duration-500 hover:bg-forest-mid/50 md:p-12"
          >
            <div className="font-display text-6xl font-extrabold tracking-tightest text-ember md:text-7xl">
              {n}
            </div>
            <div className="mt-5 h-px w-10 bg-ember/40 transition-all duration-300 group-hover:w-20" />
            <p className="mt-5 max-w-[16rem] font-body text-sm leading-relaxed text-sand/65">
              {d}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

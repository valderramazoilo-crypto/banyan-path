// "Your Path to Operational Excellence" — straight from the company summary:
// openings, daily operations, administrative assistance, peak-season coverage.
const moments = [
  ['Openings', 'Hotel & restaurant openings staffed and ready from day one.'],
  ['Daily operations', 'Dependable coverage for every shift, every day.'],
  ['Administrative support', 'Back-of-house and administrative assistance.'],
  ['Peak season', 'Rapid coverage when demand spikes.'],
]

export default function PathBand() {
  return (
    <section className="relative px-6 py-28 md:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-14 max-w-2xl">
          <p className="eyebrow reveal mb-6">Your path to operational excellence</p>
          <h2 className="reveal font-display text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-tight tracking-tightest text-sand">
            Wherever you are on the path,{' '}
            <span className="text-ember">we staff it</span>.
          </h2>
          <p className="reveal mt-6 font-body text-lg leading-relaxed text-sand/70">
            Whether you're opening a property, running daily operations or heading
            into high season, Banyan Path is ready to support you every step of the
            way.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {moments.map(([t, d], i) => (
            <div
              key={t}
              className="group reveal relative rounded-2xl border border-sand/10 bg-forest/40 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-ember/50 hover:bg-forest-mid/50"
            >
              <span className="font-display text-sm font-semibold text-ember/70">
                0{i + 1}
              </span>
              <h3 className="mt-3 font-display text-xl font-bold text-sand">{t}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-sand/60">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

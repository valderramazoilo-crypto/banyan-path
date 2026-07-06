import Picture from '../components/Picture'
import TiltCard from '../components/TiltCard'

const values = [
  ['Fast & flexible', 'Responsive service models that scale with your needs.'],
  ['Trained & reliable', 'Professional, dependable personnel you can trust.'],
  ['Dedicated support', 'Personalized service and a partner who stays close.'],
  ['Accountable', 'Committed to quality, accountability and performance.'],
]

export default function Essence() {
  return (
    <section id="about" className="relative px-6 py-32 md:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-14 md:grid-cols-2 md:items-center">
          {/* image */}
          <div className="reveal relative order-2 md:order-1">
            <TiltCard className="relative overflow-hidden rounded-[2rem] border border-sand/12 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
              <Picture
                slug="housekeeping"
                alt="Hospitality professional at a luxury hotel"
                sizes="(max-width: 768px) 100vw, 50vw"
                className="tilt-img aspect-[4/3] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-forest-deep/70 via-transparent to-ember/10" />
              <div className="tilt-glow" />
            </TiltCard>
            <div className="absolute -bottom-6 -right-4 rounded-2xl border border-sand/15 bg-forest-deep/70 px-6 py-4 backdrop-blur-md sm:-right-6">
              <div className="font-display text-3xl font-extrabold text-ember">360°</div>
              <div className="font-body text-xs uppercase tracking-widest text-sand/60">
                Recruitment to payroll
              </div>
            </div>
          </div>

          {/* copy */}
          <div className="order-1 md:order-2">
            <p className="eyebrow reveal mb-6">Who we are</p>
            <h2 className="reveal font-display text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-tight tracking-tightest text-sand">
              A trusted <span className="text-ember">workforce partner</span>.
            </h2>
            <p className="reveal mt-8 font-body text-lg leading-relaxed text-sand/70">
              At Banyan Path, we specialize in reliable, flexible workforce
              solutions for the hospitality and restaurant industry. We proudly
              support hotels, resorts, restaurants, condominiums and vacation
              rental properties throughout Florida with qualified, dependable
              professionals.
            </p>
            <p className="reveal mt-5 font-body text-lg leading-relaxed text-sand/70">
              Our mission is to be the workforce partner you can count on —
              helping you deliver exceptional guest experiences, every shift.
            </p>
          </div>
        </div>

        <div className="reveal mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(([t, d]) => (
            <div
              key={t}
              className="group rounded-2xl border border-sand/10 bg-forest/40 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-ember/50 hover:bg-forest-mid/50"
            >
              <div className="mb-4 h-1 w-8 rounded-full bg-ember transition-all duration-300 group-hover:w-14" />
              <h3 className="font-display text-xl font-bold text-sand">{t}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-sand/60">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

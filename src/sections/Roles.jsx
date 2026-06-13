import Picture from '../components/Picture'
import TiltCard from '../components/TiltCard'

const roles = [
  {
    slug: 'housekeeping',
    label: 'Housekeeping',
    desc: 'Camaristas y supervisores que cuidan cada detalle de la habitación.',
    span: 'md:col-span-2 md:row-span-2',
    h: 'h-[34rem]',
  },
  {
    slug: 'front-desk',
    label: 'Recepción',
    desc: 'Front desk y concierge que dan la primera impresión.',
    span: '',
    h: 'h-64',
  },
  {
    slug: 'culinary',
    label: 'Cocina',
    desc: 'Chefs y equipos culinarios de alto estándar.',
    span: '',
    h: 'h-64',
  },
  {
    slug: 'bar',
    label: 'Bar & F&B',
    desc: 'Bartenders y servicio que elevan la experiencia.',
    span: 'md:col-span-2',
    h: 'h-64',
  },
]

export default function Roles() {
  return (
    <section id="talento" className="relative px-6 py-32 md:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-16 max-w-2xl">
          <p className="eyebrow reveal mb-6">El talento que colocamos</p>
          <h2 className="reveal font-display text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-tight tracking-tightest text-sand">
            Especialistas en{' '}
            <span className="text-ember">housekeeping</span> y hospitality.
          </h2>
          <p className="reveal mt-6 font-body text-lg leading-relaxed text-sand/70">
            Reclutamos, filtramos y verificamos el talento que mantiene un hotel
            funcionando — desde la habitación hasta el restaurante.
          </p>
        </div>

        <div className="grid auto-rows-min grid-cols-1 gap-5 md:grid-cols-3">
          {roles.map((r) => (
            <TiltCard
              key={r.slug}
              className={`reveal group relative overflow-hidden rounded-3xl border border-sand/10 ${r.span} ${r.h}`}
            >
              <Picture
                slug={r.slug}
                alt={r.label}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="tilt-img absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/20 to-transparent" />
              <div className="tilt-glow" />
              <div className="absolute inset-x-0 bottom-0 p-7 tilt-pop">
                <div className="mb-3 h-1 w-8 rounded-full bg-ember transition-all duration-300 group-hover:w-14" />
                <h3 className="font-display text-2xl font-bold text-sand">
                  {r.label}
                </h3>
                <p className="mt-1.5 max-w-sm font-body text-sm leading-relaxed text-sand/70">
                  {r.desc}
                </p>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}

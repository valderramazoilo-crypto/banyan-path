import WaterCard from '../components/WaterCard'

const shots = [
  { src: '/img/housekeeper-portrait.webp', alt: 'Housekeeping specialist', span: 'md:col-span-2 md:row-span-2', h: 'h-[30rem] md:h-full' },
  { src: '/img/front-desk.webp', alt: 'Front desk service', span: '', h: 'h-60' },
  { src: '/img/culinary.webp', alt: 'Culinary team at work', span: '', h: 'h-60' },
  { src: '/img/bar.webp', alt: 'Bar & F&B service', span: '', h: 'h-60' },
  { src: '/img/workplace.webp', alt: 'Coordination team', span: '', h: 'h-60' },
]

export default function Gallery() {
  return (
    <section id="gallery" className="relative px-6 py-32 md:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow reveal mb-6">Gallery</p>
            <h2 className="reveal font-display text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-tight tracking-tightest text-sand">
              Hospitality in <span className="text-ember">motion</span>.
            </h2>
          </div>
          <p className="reveal max-w-xs font-body text-sm leading-relaxed text-sand/50">
            Move your cursor across the images — the surface ripples like water.
          </p>
        </div>

        <div className="grid auto-rows-min grid-cols-1 gap-5 md:grid-cols-3">
          {shots.map((s) => (
            <div key={s.src} className={`reveal ${s.span}`}>
              <WaterCard
                src={s.src}
                alt={s.alt}
                className={`w-full rounded-3xl border border-sand/10 ${s.h}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

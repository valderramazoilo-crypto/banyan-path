import Picture from '../components/Picture'

const steps = [
  [
    '01',
    'Profile',
    'process-profile',
    'We capture the role and review candidate profiles, experience and credentials.',
  ],
  [
    '02',
    'Screening',
    'process-interview',
    'We interview and assess skills, attitude and culture fit — you only meet qualified people.',
  ],
  [
    '03',
    'Verification',
    'process-match',
    'Background and reference checks ensure a safe, on-brand match.',
  ],
  [
    '04',
    'Placement',
    'process-placement',
    'We place the right person and support onboarding every step of the way.',
  ],
]

export default function Process() {
  return (
    <section id="process" className="process-pin relative h-screen overflow-hidden">
      <div className="flex h-full items-center px-6 md:px-10">
        <div className="absolute left-6 top-24 z-10 md:left-10">
          <p className="eyebrow mb-3">How we work</p>
          <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-extrabold tracking-tightest text-sand">
            From profile to <span className="text-ember">placement</span>.
          </h2>
        </div>

        <div className="process-track flex gap-6 pl-2 will-change-transform">
          {steps.map(([n, title, slug, desc]) => (
            <article
              key={n}
              className="relative flex h-[60vh] w-[80vw] shrink-0 flex-col justify-end overflow-hidden rounded-3xl border border-sand/10 sm:w-[58vw] lg:w-[40vw]"
            >
              <Picture
                slug={slug}
                alt={title}
                sizes="(max-width: 1024px) 80vw, 40vw"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/45 to-transparent" />
              <div className="relative p-9">
                <span className="font-display text-[5.5rem] font-extrabold leading-none text-ember/25">
                  {n}
                </span>
                <h3 className="mt-1 font-display text-3xl font-bold text-sand">{title}</h3>
                <p className="mt-3 max-w-md font-body text-base leading-relaxed text-sand/75">
                  {desc}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

import Logo from '../components/Logo'

export default function Contact() {
  return (
    <section
      id="contacto"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-32 text-center md:px-10"
    >
      {/* soft ember glow behind the closing headline */}
      <div className="pointer-events-none absolute left-1/2 top-[38%] h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,158,48,0.16),transparent_70%)] blur-2xl" />

      <div className="relative mx-auto w-full max-w-3xl">
        <p className="eyebrow reveal mb-6">Hagamos match</p>
        <h2 className="reveal font-display text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold leading-[0.95] tracking-tightest text-sand">
          La persona correcta,
          <br />
          el <span className="text-ember">trabajo ideal</span>.
        </h2>
        <p className="reveal mx-auto mt-8 max-w-xl font-body text-lg leading-relaxed text-sand/70">
          Cuéntanos qué talento necesitas y deja que la red de Banyan Path haga
          el resto. Nosotros nos encargamos del filtro, las entrevistas y la
          verificación.
        </p>

        <div className="reveal mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="mailto:hola@banyanpath.com" className="btn-ember">
            hola@banyanpath.com
          </a>
          <a href="#top" className="btn-ghost">
            Volver arriba
          </a>
        </div>
      </div>

      <footer className="relative mt-28 w-full max-w-7xl pt-8">
        <div className="hairline absolute left-0 top-0" />
        <div className="flex flex-col items-center justify-between gap-4 text-sand/50 sm:flex-row">
          <a href="#top" className="text-[1.1rem]">
            <Logo />
          </a>
          <span className="font-body text-xs uppercase tracking-widest2">
            All we do is staffing · 2026
          </span>
        </div>
      </footer>
    </section>
  )
}

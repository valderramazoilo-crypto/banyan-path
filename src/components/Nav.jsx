import Logo from './Logo'

export default function Nav() {
  return (
    <header className="fixed top-0 left-0 z-30 w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <a href="#top" className="text-[1.4rem]">
          <Logo />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {[
            ['Esencia', '#esencia'],
            ['Talento', '#talento'],
            ['Servicios', '#servicios'],
            ['Proceso', '#proceso'],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="font-body text-sm uppercase tracking-widest text-sand/70 transition-colors hover:text-ember"
            >
              {label}
            </a>
          ))}
        </nav>

        <a href="#contacto" className="btn-ember text-sm">
          Contáctanos
        </a>
      </div>
    </header>
  )
}

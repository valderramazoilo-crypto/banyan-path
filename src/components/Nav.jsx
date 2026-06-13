export default function Nav() {
  return (
    <header className="fixed top-0 left-0 z-30 w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ember text-forest-deep">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2v20M12 7c0-2 2-3 4-3M12 10c0-2-2-3-4-3M12 14c0-2 3-3 5-2M12 16c0-2-3-3-5-2M7 22c0-3 2-5 5-5s5 2 5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-sand">
            BANYAN<span className="text-ember"> PATH</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {[
            ['Esencia', '#esencia'],
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

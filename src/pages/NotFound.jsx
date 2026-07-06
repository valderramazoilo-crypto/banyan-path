import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

export default function NotFound() {
  return (
    <div className="content-layer flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo className="h-8" />
      <p className="eyebrow mt-12">404</p>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,6vw,4rem)] font-extrabold leading-tight tracking-tightest text-sand">
        This path doesn't <span className="text-ember">exist</span>.
      </h1>
      <p className="mt-5 max-w-sm font-body text-lg leading-relaxed text-sand/65">
        The page you're looking for was moved or never grew here.
      </p>
      <Link to="/" className="btn-ember mt-9">
        Back to home
      </Link>
    </div>
  )
}

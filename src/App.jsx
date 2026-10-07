import { usePath } from './router'
import ParticleField from './components/ParticleField'
import ErrorBoundary from './components/ErrorBoundary'
import Landing from './Landing'
import ContactPage from './pages/ContactPage'
import NotFound from './pages/NotFound'

export default function App() {
  const path = usePath()
  const page =
    path === '/' ? <Landing /> : path === '/contact' ? <ContactPage /> : <NotFound />

  return (
    <>
      <ParticleField />
      {/* keyed by path so a crash on one page resets when navigating away */}
      <ErrorBoundary key={path}>{page}</ErrorBoundary>
      <div className="grain" />
    </>
  )
}

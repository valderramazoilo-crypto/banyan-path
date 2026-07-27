import { usePath } from './router'
import ParticleField from './components/ParticleField'
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
      {page}
      <div className="grain" />
    </>
  )
}

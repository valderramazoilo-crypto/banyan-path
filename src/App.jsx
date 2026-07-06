import { Routes, Route } from 'react-router-dom'
import ParticleField from './components/ParticleField'
import Landing from './Landing'
import ContactPage from './pages/ContactPage'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <>
      <ParticleField />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <div className="grain" />
    </>
  )
}

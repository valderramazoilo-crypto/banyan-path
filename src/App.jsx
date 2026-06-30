import { Routes, Route } from 'react-router-dom'
import ParticleField from './components/ParticleField'
import Landing from './Landing'
import ContactPage from './pages/ContactPage'

export default function App() {
  return (
    <>
      <ParticleField />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <div className="grain" />
    </>
  )
}

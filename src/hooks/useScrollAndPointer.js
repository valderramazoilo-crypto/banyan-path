import { useEffect } from 'react'
import { banyan } from '../three/progressStore'

// Feeds the 3D store with normalised scroll position and pointer offset.
export function useScrollAndPointer() {
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      banyan.scrollTarget = max > 0 ? window.scrollY / max : 0
    }
    const onMove = (e) => {
      banyan.pointerX = (e.clientX / window.innerWidth) * 2 - 1
      banyan.pointerY = (e.clientY / window.innerHeight) * 2 - 1
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])
}

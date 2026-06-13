import { useRef } from 'react'

// Cursor-reactive 3D tilt + spotlight + inner parallax. Wrap any media card;
// give the inner image the `tilt-img` class and add a `tilt-glow` overlay for
// the spotlight. Children can use `translateZ` (preserve-3d) to pop forward.
export default function TiltCard({ children, className = '', max = 9, lift = 14 }) {
  const ref = useRef(null)
  const raf = useRef(0)

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`)
      el.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`)
      el.style.setProperty('--mx', `${px * 100}%`)
      el.style.setProperty('--my', `${py * 100}%`)
      el.style.setProperty('--tx', `${(px - 0.5) * -lift}px`)
      el.style.setProperty('--ty', `${(py - 0.5) * -lift}px`)
      el.style.setProperty('--glow', '1')
    })
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    cancelAnimationFrame(raf.current)
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--tx', '0px')
    el.style.setProperty('--ty', '0px')
    el.style.setProperty('--glow', '0')
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`tilt ${className}`}
    >
      {children}
    </div>
  )
}

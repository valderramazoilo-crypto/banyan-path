import { useEffect, useState } from 'react'

// Tiny dependency-free client router (only 3 routes). Replaces react-router-dom
// to avoid its recurring advisories and shrink the bundle.

const listeners = new Set()

export function navigate(to) {
  if (to === window.location.pathname) return
  window.history.pushState({}, '', to)
  window.scrollTo(0, 0)
  listeners.forEach((l) => l(to))
}

export function usePath() {
  const [path, setPath] = useState(() => window.location.pathname)
  useEffect(() => {
    const update = () => setPath(window.location.pathname)
    listeners.add(update)
    window.addEventListener('popstate', update)
    return () => {
      listeners.delete(update)
      window.removeEventListener('popstate', update)
    }
  }, [])
  return path
}

export function Link({ to, onClick, children, ...rest }) {
  const handle = (e) => {
    // let modified clicks (new tab, etc.) and non-primary buttons behave normally
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return
    }
    e.preventDefault()
    navigate(to)
    if (onClick) onClick(e)
  }
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  )
}

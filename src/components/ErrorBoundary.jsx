import { Component } from 'react'

// Last line of defence: a render/commit error anywhere in a page would
// otherwise unmount the whole app and leave a blank background.
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    // keep a trace for debugging without breaking the page
    console.error('[Banyan Path] page error:', error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="content-layer flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <img src="/logo.svg" alt="Banyan Path" className="h-8 w-auto" />
        <h1 className="mt-10 font-display text-3xl font-extrabold text-sand">
          Something went wrong.
        </h1>
        <p className="mt-4 max-w-sm font-body text-sand/70">
          Please reload the page — or reach us at operations@banyanpath.com.
        </p>
        <a href="/" className="btn-ember mt-8">
          Back to home
        </a>
      </div>
    )
  }
}

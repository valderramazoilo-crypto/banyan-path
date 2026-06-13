// Banyan Path wordmark, rebuilt as scalable markup so it recolours cleanly for
// dark (negative) backgrounds. The "Y" is replaced by the brand's orange
// banyan-trunk mark. Size is driven by the root font-size (`em` based), so set
// a text size on the parent to scale the whole lockup.
function TreeMark({ className = '' }) {
  return (
    <svg
      viewBox="0 0 48 80"
      className={className}
      style={{ height: '0.96em', width: '0.6em' }}
      fill="none"
      aria-hidden="true"
    >
      {/* single stem rising, then forking into two curling arms — a banyan */}
      <path
        d="M24 80 L24 44"
        stroke="#FF9E30"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M24 46 C 22 32 12 30 12 16 C 12 8 18 5 23 12"
        stroke="#FF9E30"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 46 C 26 32 36 30 36 16 C 36 8 30 5 25 12"
        stroke="#FF9E30"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Logo({ className = '', wordClass = 'text-sand', pathClass = 'text-sand/55' }) {
  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <span
        className={`flex items-end font-display font-bold tracking-[0.015em] ${wordClass}`}
      >
        <span>BAN</span>
        <TreeMark className="mx-[-0.02em]" />
        <span>AN</span>
      </span>
      <span
        className={`mt-[0.22em] font-display text-[0.3em] font-medium uppercase tracking-[0.62em] ${pathClass}`}
        style={{ marginRight: '-0.62em' }}
      >
        Path
      </span>
    </span>
  )
}

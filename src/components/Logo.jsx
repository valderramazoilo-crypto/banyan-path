// Official Banyan Path wordmark (negative version for dark backgrounds).
export default function Logo({ className = 'h-7' }) {
  return (
    <img
      src="/logo.svg"
      alt="Banyan Path"
      className={`w-auto ${className}`}
      draggable="false"
    />
  )
}

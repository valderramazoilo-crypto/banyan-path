// Responsive WebP with an 800w + 1400w srcset (optimized in public/img).
export default function Picture({ slug, alt, className = '', sizes = '100vw', eager = false }) {
  return (
    <img
      src={`/img/${slug}.webp`}
      srcSet={`/img/${slug}-800.webp 800w, /img/${slug}.webp 1400w`}
      sizes={sizes}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
    />
  )
}

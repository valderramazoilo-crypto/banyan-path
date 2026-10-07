# Banyan Path — Landing

Web de **Banyan Path**: soluciones de personal para hotelería y restaurantes en
Florida ("All we do is staffing"). SPA de dos páginas: landing (`/`) y
contacto (`/contact`). Copy en inglés.

## Stack

- **Vite 7 + React 18** — SPA
- **Tailwind CSS 4** (`@tailwindcss/vite`) — tokens de marca en `tailwind.config.js`,
  cargados desde `src/index.css` con `@config`
- **GSAP + Lenis** — smooth scroll y la sección *Process* pineada
- **Router propio** (`src/router.jsx`, sin dependencias) — `Link`, `navigate`, `usePath`
- Sin backend: el contacto es solo informativo (teléfonos, horario, oficina, email)

## Lo interactivo

- **Hero con video** (`public/video/hero.mp4`, 1080p, con `hero-poster.jpg`) y parallax suave.
- **Galería "agua"** — `WaterCard` distorsiona la imagen con WebGL al pasar el cursor.
- **Tarjetas con tilt 3D** (`TiltCard`) y campo de partículas de fondo (`ParticleField`).
- **Reveals** con `IntersectionObserver` + transiciones CSS (`.reveal` → `.in`).
- Respeta `prefers-reduced-motion`.
- `ErrorBoundary` por página: si algo falla, se muestra un mensaje con enlace a
  inicio en lugar de una pantalla vacía.

## Identidad

| Token | Color | Uso |
|-------|-------|-----|
| `forest` / `forest-deep` | `#1E2818` / `#141d0f` | Fondos |
| `sand` | `#EBE0C2` | Texto |
| `ember` | `#FF9E30` | Acentos / CTAs |

Tipografía: **Jost** (Google Fonts) + **Exo 2** (self-hosted en `public/fonts`).

## Scripts

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # salida en dist/
npm run preview
node scripts/optimize-images.mjs   # regenera los .webp de public/img (sharp)
```

## Deploy

Cualquier hosting estático. Al ser SPA, todas las rutas deben servir
`index.html` — ya incluido para Netlify en `public/_redirects`
(en Vercel/otros, configurar el rewrite equivalente).

SEO incluido en `index.html`: meta description, Open Graph, canonical,
theme-color y datos estructurados (`EmploymentAgency` con dirección, teléfonos
y horario). `public/robots.txt` y `public/sitemap.xml` apuntan a
`https://banyanpath.com` — **cambiar si el dominio final es otro.**

## Mantenimiento

- `npm audit` → 0 vulnerabilidades (oct 2026).
- Si cambian teléfonos/horario/dirección, actualizar **ambos**:
  `src/pages/ContactPage.jsx` y el JSON-LD de `index.html`.

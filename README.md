# Banyan Path — Interactive 3D Landing

Web premium e interactiva para **Banyan Path** (staffing / reclutamiento para la
industria hotelera). El concepto visual nace del árbol banyan: una *red viva de
conexiones profesionales* que crece soltando raíces.

## Stack

- **Vite + React** — SPA rápida
- **React Three Fiber + three.js** — escena 3D
- **@react-three/postprocessing** — bloom + vignette
- **GSAP + ScrollTrigger** — reveals y sección de proceso pineada
- **Tailwind CSS** — tokens de marca

## Lo interactivo

- **Árbol banyan generativo** que *crece con el scroll* (shaders custom: cada
  segmento aparece según un valor `aGrowth`; un glow naranja recorre el borde
  que crece).
- **Reactivo al cursor** — el árbol se inclina hacia el puntero y la cámara hace
  parallax.
- **Cámara cinematográfica** — viaja desde la base hasta la copa al hacer scroll.
- **Sección "Proceso" pineada** con scroll horizontal (GSAP).
- **Reveals escalonados** en cada sección.

## Identidad (de la guía de marca)

| Token | Color | Uso |
|-------|-------|-----|
| `forest` | `#1E2818` | Texto / contraste |
| `sand` | `#EBE0C2` | Fondos / calma |
| `ember` | `#FF9E30` | Acentos / CTAs |

Tipografía: **Exo 2** (secundaria de la marca, vía Google Fonts) + **Montserrat**
como sustituto libre de *All Round Gothic* (fuente comercial — ver nota abajo).

## Scripts

```bash
npm install
npm run dev      # http://localhost:5174
npm run build
npm run preview
```

## Pendiente / notas

- **All Round Gothic** es una fuente de pago. Para producción, licénciala y
  reemplaza `Montserrat` en `tailwind.config.js` (`fontFamily.display`).
- Logo: por ahora un isotipo SVG inspirado en la marca. Sustituir por el logo
  oficial cuando esté disponible en vectorial.
- El bundle incluye three.js (~330 kB gzip); se puede *code-split* si hace falta.

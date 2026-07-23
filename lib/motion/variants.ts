import type { Variants } from 'motion/react'

// Easing de marca — mismo cubic-bezier que .transition-brand (app/globals.css), ya en
// uso real (Header, botones). No inventar otra curva sin justificar (skill motion-tu-lugar-en-galicia).
export const BRAND_EASE = [0.4, 0, 0.2, 1] as const

// Entradas de contenido: 400ms máximo (skill motion-tu-lugar-en-galicia).
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: BRAND_EASE },
  },
}

// Contenedor para reveals escalonados de grids/listas de tarjetas.
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
}

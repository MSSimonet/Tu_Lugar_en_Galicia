'use client'

import { motion } from 'motion/react'
import { fadeUp } from '@/lib/motion/variants'

// app/ciudades/page.tsx es un Server Component (exporta `metadata`), así que el
// título animado se extrae acá — mismo fadeUp de marca que el resto de los H1
// del sitio (lib/motion/variants.ts).
export function CiudadesHeroTitulo() {
  return (
    <motion.h1
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="font-normal"
      style={{
        fontFamily: 'var(--font-dz-display)',
        fontWeight: 'var(--dz-weight-h1)',
        fontSize: 'var(--dz-text-h1-compact)',
        lineHeight: 'var(--dz-leading-h1)',
        letterSpacing: '-0.01em',
        color: 'var(--dz-ink)',
        margin: '1cm 0',
      }}
    >
      Elige tu ciudad
    </motion.h1>
  )
}

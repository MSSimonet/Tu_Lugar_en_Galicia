'use client'

import { motion } from 'motion/react'
import { fadeUp } from '@/lib/motion/variants'

// Entrada suave por sección al hacer scroll — stagger nulo a propósito (no queremos que el
// texto legal "salte" párrafo por párrafo, solo un fade discreto por bloque de sección).
export function LegalSection({
  children,
  ariaLabelledby,
}: {
  children: React.ReactNode
  ariaLabelledby?: string
}) {
  return (
    <motion.section
      aria-labelledby={ariaLabelledby}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {children}
    </motion.section>
  )
}

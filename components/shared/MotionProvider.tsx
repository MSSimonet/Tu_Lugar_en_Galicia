'use client'

import { MotionConfig } from 'motion/react'

// reducedMotion="user": toda animación de `motion` en el árbol respeta
// prefers-reduced-motion automáticamente, sin chequearlo a mano en cada componente.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

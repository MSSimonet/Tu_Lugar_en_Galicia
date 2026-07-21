'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

// Fuerza scroll al inicio en cada cambio de ruta. `html { scroll-behavior: smooth }`
// (globals.css) hace que el scroll-to-top nativo de Next.js sea una animación, no un
// salto — si algo interrumpe esa animación (layout shift por imágenes/fuentes
// cargando), la página queda a mitad de scroll en vez de arriba del todo (reportado en
// varias páginas, sesión 2026-07-19). Se desactiva el smooth-scroll solo para este salto.
export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.location.hash) return // deja que el navegador resuelva el ancla (ej. /#testimonios)
    const html = document.documentElement
    const previousScrollBehavior = html.style.scrollBehavior
    html.style.scrollBehavior = 'auto'
    window.scrollTo(0, 0)
    html.style.scrollBehavior = previousScrollBehavior
  }, [pathname])

  return null
}

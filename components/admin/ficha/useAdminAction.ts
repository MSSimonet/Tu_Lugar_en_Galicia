'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hook compartido para las mutaciones chicas de la ficha 360° (completar tarea,
 * agregar nota/tarea): dispara un fetch, maneja loading/error, y en éxito refresca
 * la ruta con router.refresh() en vez de duplicar estado local — la página vuelve
 * a pedir los datos server-side y React reconcilia lo que cambió.
 */
export function useAdminAction() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(fetcher: () => Promise<Response>, errorMensaje: string): Promise<boolean> {
    setLoading(true)
    setError(null)
    try {
      const res = await fetcher()
      if (!res.ok) {
        setError(errorMensaje)
        setLoading(false)
        return false
      }
      router.refresh()
      return true
    } catch {
      setError('Error de conexión. Reintentá.')
      setLoading(false)
      return false
    }
  }

  return { run, loading, error }
}

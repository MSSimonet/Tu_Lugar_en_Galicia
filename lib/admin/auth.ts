import { timingSafeEqual } from 'crypto'
import { type NextRequest } from 'next/server'

/**
 * Verifica Authorization: Bearer <token> contra INTERNAL_API_SECRET (llamadas manuales)
 * o CRON_SECRET (Vercel Cron). Usa comparación en tiempo constante.
 */
export function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization') ?? ''
  if (!auth.startsWith('Bearer ')) return false
  const provided = auth.slice(7)

  function matches(expected: string): boolean {
    try {
      const a = Buffer.from(expected)
      const b = Buffer.from(provided)
      return a.length === b.length && timingSafeEqual(a, b)
    } catch {
      return false
    }
  }

  const secret     = process.env.INTERNAL_API_SECRET
  const cronSecret = process.env.CRON_SECRET
  return (!!secret && matches(secret)) || (!!cronSecret && matches(cronSecret))
}

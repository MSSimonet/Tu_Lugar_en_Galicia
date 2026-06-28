import { randomBytes } from 'crypto'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

/**
 * Código de agenda: 8 caracteres alfanuméricos en mayúsculas.
 * Criptográficamente aleatorios (no Math.random).
 * Ejemplo: X7KP2QNR
 */
export function generateAgendaCode(): string {
  const bytes = randomBytes(8)
  return Array.from(bytes)
    .map(b => CHARS[b % CHARS.length])
    .join('')
}

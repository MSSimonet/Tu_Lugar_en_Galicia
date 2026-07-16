import { randomInt } from 'crypto'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

/**
 * Código de agenda: 8 caracteres alfanuméricos en mayúsculas.
 * Criptográficamente aleatorios (no Math.random). randomInt(0, 36) en vez de
 * randomBytes(8) % 36 — este último tenía sesgo de módulo hacia 'A'-'D' (256/36 no es entero).
 * Ejemplo: X7KP2QNR
 */
export function generateAgendaCode(): string {
  return Array.from({ length: 8 }, () => CHARS[randomInt(0, CHARS.length)]).join('')
}

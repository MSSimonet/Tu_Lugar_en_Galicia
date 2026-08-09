/**
 * Sesiones de gestión de perfil de Comunidad — el "self-service" que cierra PII-01.
 *
 * QUÉ RESUELVE:
 * hasta ahora, cambiar la visibilidad del teléfono o darse de baja del mapa exigía
 * escribirle a Silvana. Este módulo permite hacerlo sin intervención humana, sin abrir el
 * agujero que cerró §5.6: quien quiere gestionar su perfil pide un enlace, y el enlace llega
 * a la casilla que ya está registrada. Recibirlo es la prueba de que el perfil es suyo.
 *
 * EN QUÉ SE PARECE Y EN QUÉ NO A lib/comunidad/pendientes.ts:
 *
 *   igual  — mismo HMAC (lib/admin/tokens.ts), mismo patrón de uuid opaco en la URL con el
 *            dato real guardado aparte, misma separación de dominio por prefijo.
 *
 *   distinto (1) — la sesión NO se consume al leerla. El pendiente se consume porque su
 *            único acto es crear la fila; acá la persona carga la página, mira lo que tiene,
 *            y recién después decide. Con `getdel` el enlace moriría antes de servir.
 *
 *   distinto (2) — TTL de 1 HORA, no 24. `verifyAdminToken` tiene su ventana fija en 24 h y
 *            no se toca (la usan admin y Gina); el control real es el TTL de Redis. Es una
 *            página desde la que se puede publicar un teléfono o borrar una cuenta: cuanto
 *            menos viva el enlace, mejor.
 */

import { randomUUID } from 'crypto'
import { Redis } from '@upstash/redis'
import { generateAdminToken, verifyAdminToken } from '@/lib/admin/tokens'

/** Una hora. Ver el bloque de arriba: es deliberadamente más corto que el token que lo firma. */
const TTL_SEGUNDOS = 60 * 60

function claveDe(id: string): string {
  return `comunidad:gestion:${id}`
}

/**
 * Prefijo propio, distinto del de `pendientes.ts` y del de los tokens de admin. Sin esto, un
 * token de alta serviría para gestionar un perfil y viceversa: los tres flujos firman con el
 * mismo INTERNAL_API_SECRET sobre uuids.
 */
function sujetoDe(id: string): string {
  return `comunidad-gestion:${id}`
}

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  return Redis.fromEnv()
}

export type ResultadoSesion =
  | { ok: true; email: string }
  /** Firma que no valida o token malformado. */
  | { ok: false; motivo: 'invalido' }
  /** Firma vencida, o sesión ya no presente en Redis (TTL de 1 h). Para la persona es lo mismo. */
  | { ok: false; motivo: 'expirado' }

/**
 * Abre una sesión de gestión para un email YA REGISTRADO. El llamador es responsable de haber
 * comprobado que existe — y de responder igual si no existe, para no convertir el endpoint en
 * un oráculo de quién está en el mapa.
 */
export async function crearSesionGestion(
  email: string,
): Promise<{ id: string; token: string } | null> {
  const redis = getRedis()
  if (!redis) return null

  const id = randomUUID()
  // Se guarda el email, no el id del perfil: es la llave real de la tabla, y así la sesión no
  // se rompe si el perfil se borra y se vuelve a crear.
  await redis.set(claveDe(id), { email }, { ex: TTL_SEGUNDOS })

  return { id, token: generateAdminToken(sujetoDe(id)) }
}

/**
 * Verifica la firma y devuelve el email de la sesión SIN consumirla.
 *
 * El orden es el mismo que en pendientes.ts y por el mismo motivo: primero la firma, después
 * Redis. Un id suelto sin token no sirve ni para averiguar si esa sesión existe.
 */
export async function leerSesionGestion(id: string, token: string): Promise<ResultadoSesion> {
  try {
    verifyAdminToken(sujetoDe(id), token)
  } catch (err) {
    const expirado = err instanceof Error && err.message.includes('expiró')
    return { ok: false, motivo: expirado ? 'expirado' : 'invalido' }
  }

  const redis = getRedis()
  if (!redis) return { ok: false, motivo: 'invalido' }

  const sesion = await redis.get<{ email: string }>(claveDe(id))
  if (!sesion?.email) return { ok: false, motivo: 'expirado' }

  return { ok: true, email: sesion.email }
}

/**
 * Cierra la sesión antes de tiempo. Se llama al borrar el perfil: dejar viva una sesión que
 * apunta a un email que ya no existe no es peligroso, pero sí confuso — la página volvería a
 * cargar y no encontraría nada.
 */
export async function cerrarSesionGestion(id: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  await redis.del(claveDe(id))
}

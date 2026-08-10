/**
 * Sobres firmados — el primitivo detrás de todos los flujos de "te mando un enlace por mail".
 *
 * QUÉ ES UN SOBRE:
 * un payload guardado en Redis bajo un uuid opaco, más un token HMAC que prueba que ese uuid
 * lo emitió este servidor. El uuid viaja en la URL del mail; el contenido nunca. Quien abre el
 * enlace demuestra que recibió el correo, y eso es la autenticación.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO:
 * el patrón apareció tres veces —alta de perfil (§5.6), gestión de perfil (Toggle B) y
 * confirmación de mensaje privado (§5.12)— y las tres implementaciones diferían en exactamente
 * tres cosas: el dominio, el TTL, y si leer consume o no. Con dos instancias la duplicación era
 * discutible; con tres es real, que es el umbral que fija coding-style.md para abstraer.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────
 * COMPATIBILIDAD — LEER ANTES DE TOCAR LOS NOMBRES
 *
 * Las claves de Redis y los sujetos firmados que arma este módulo son BYTE A BYTE los que
 * usaban las implementaciones anteriores:
 *
 *     clave   `comunidad:<dominio>:<uuid>`     (dos puntos)
 *     sujeto  `comunidad-<dominio>:<uuid>`     (guion — así estaba, y así se queda)
 *
 * La asimetría guion/dos-puntos es fea y es a propósito. En producción hay sobres vivos: un
 * pendiente de alta dura 24 h y una sesión de gestión 1 h. Cambiar el formato de la clave
 * dejaría esos sobres huérfanos —enlaces ya enviados que dejan de funcionar sin explicación—
 * y cambiar el del sujeto invalidaría los tokens ya firmados. No se normaliza.
 * ─────────────────────────────────────────────────────────────────────────────────────────
 *
 * SEPARACIÓN DE DOMINIO: el sujeto lleva el dominio adentro, así que un token de un flujo no
 * vale en otro. Los tres firman uuids con el mismo INTERNAL_API_SECRET, y sin el prefijo serían
 * intercambiables — y los ids de leads en Supabase también son uuid, así que la colisión
 * alcanzaría también a los tokens de admin.
 */

import { randomUUID } from 'crypto'
import { Redis } from '@upstash/redis'
import { generateAdminToken, verifyAdminToken } from '@/lib/admin/tokens'

/** Los flujos que usan sobres. Agregar uno acá es agregar un dominio, no un módulo. */
export type DominioSobre = 'pendiente' | 'gestion' | 'mensaje'

export type ResultadoSobre<T> =
  | { ok: true; payload: T }
  /** Firma que no valida, o token malformado. */
  | { ok: false; motivo: 'invalido' }
  /** Firma correcta pero emitida hace más de 24 h (el TTL fijo de verifyAdminToken). */
  | { ok: false; motivo: 'expirado' }
  /** Firma válida y vigente, pero el payload ya no está: se consumió, o venció en Redis. */
  | { ok: false; motivo: 'usado' }

function claveDe(dominio: DominioSobre, id: string): string {
  return `comunidad:${dominio}:${id}`
}

function sujetoDe(dominio: DominioSobre, id: string): string {
  return `comunidad-${dominio}:${id}`
}

/** Igual que el resto del proyecto: sin Upstash configurado, no se opera. */
function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  return Redis.fromEnv()
}

/**
 * Guarda un payload y devuelve el par (id, token) con el que se arma el enlace del mail.
 * Devuelve null si falta la config de Upstash — el llamador decide qué status responder.
 *
 * Sobre el TTL: lo elige cada flujo, pero nunca conviene que supere las 24 h de
 * `verifyAdminToken`. Si el payload viviera más que la firma quedarían sobres imposibles de
 * abrir ocupando lugar; más corto sí es válido, y es lo que hacen los flujos sensibles.
 */
export async function crearSobre<T>(
  dominio: DominioSobre,
  payload: T,
  ttlSegundos: number,
): Promise<{ id: string; token: string } | null> {
  const redis = getRedis()
  if (!redis) return null

  const id = randomUUID()
  await redis.set(claveDe(dominio, id), payload, { ex: ttlSegundos })

  return { id, token: generateAdminToken(sujetoDe(dominio, id)) }
}

/**
 * Verifica la firma y devuelve el payload.
 *
 * `consumir: true` lee y borra en una sola operación (`getdel`, atómico) — para sobres de un
 * solo uso, donde dos clics simultáneos no pueden disparar dos acciones. `consumir: false`
 * deja el sobre vivo hasta que venza, para páginas que se cargan, se miran y recién después
 * se usan.
 *
 * EL ORDEN NO ES CASUAL: primero la firma, después Redis. Al revés, un id suelto sin token
 * serviría para averiguar si ese sobre existe.
 */
export async function abrirSobre<T>(
  dominio: DominioSobre,
  id: string,
  token: string,
  opciones: { consumir: boolean },
): Promise<ResultadoSobre<T>> {
  try {
    verifyAdminToken(sujetoDe(dominio, id), token)
  } catch (err) {
    const expirado = err instanceof Error && err.message.includes('expiró')
    return { ok: false, motivo: expirado ? 'expirado' : 'invalido' }
  }

  const redis = getRedis()
  if (!redis) return { ok: false, motivo: 'invalido' }

  const clave = claveDe(dominio, id)
  const payload = opciones.consumir
    ? await redis.getdel<T>(clave)
    : await redis.get<T>(clave)

  if (payload === null || payload === undefined) return { ok: false, motivo: 'usado' }

  return { ok: true, payload }
}

/** Invalida un sobre antes de tiempo, sin necesidad de su token. */
export async function cerrarSobre(dominio: DominioSobre, id: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  await redis.del(claveDe(dominio, id))
}

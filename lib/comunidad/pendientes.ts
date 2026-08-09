/**
 * Registros de Comunidad a la espera de que su dueño confirme el email (§5.6 de
 * docs/arranque.md).
 *
 * POR QUÉ EXISTE ESTE MÓDULO — el agujero que cierra:
 * `upsertPerfilComunidad()` hace upsert con `onConflict: 'email'` y el email es la PK de
 * la tabla. Hasta acá, `POST /api/comunidad/registro` validaba formato, origen y rate limit,
 * pero NUNCA que quien mandaba el POST fuera dueño de ese email. Sabiendo el email de una
 * persona registrada se le podía pisar la fila entera —nombre, foto y su ubicación en el
 * mapa— y el teléfono se conservaba solo, sin necesidad de conocerlo. Mover el pin de una
 * familia inmigrante a una dirección elegida por un tercero no es vandalismo cosmético: el
 * mapa es, literalmente, "dónde vive esta persona".
 *
 * CÓMO LO CIERRA:
 * el registro deja de escribir en `comunidad`. Guarda el perfil acá, en un buffer temporal
 * fuera de la base, y manda un mail con un link firmado. Solo el clic en ese link dispara el
 * upsert. La prueba de posesión es haber recibido el mail.
 *
 * Con esto, lo peor que consigue quien usa el email ajeno es que a esa persona le llegue un
 * correo: la fila no se toca.
 *
 * POR QUÉ UPSTASH Y NO UNA TABLA:
 * `@upstash/redis` ya es dependencia dura del proyecto (7 endpoints fail-closed dependen de
 * ella). Una tabla nueva pediría una migración, y acá las migraciones se ejecutan a mano
 * pegándolas en el SQL Editor de Supabase (ver el encabezado de 0001 y 0010) — un paso manual
 * más, y otra tabla con datos personales para vaciar. El TTL de Redis limpia solo.
 */

import { randomUUID } from 'crypto'
import { Redis } from '@upstash/redis'
import { generateAdminToken, verifyAdminToken } from '@/lib/admin/tokens'
import type { UpsertPerfilInput } from './perfil'

/**
 * Igualado al TTL de `verifyAdminToken` (24 h, lib/admin/tokens.ts:3) a propósito: si el
 * payload viviera más que la firma, quedarían registros pendientes imposibles de confirmar
 * ocupando lugar; si viviera menos, un link todavía válido fallaría sin explicación. Que
 * expiren juntos deja un solo estado final posible.
 */
const TTL_SEGUNDOS = 24 * 60 * 60

function claveDe(id: string): string {
  return `comunidad:pendiente:${id}`
}

/**
 * Sujeto que se firma. El prefijo es SEPARACIÓN DE DOMINIO, no decoración: el mismo
 * `INTERNAL_API_SECRET` firma los tokens de admin (`/admin/lead/[recordId]`), y los leads
 * viven en Supabase, así que sus ids también son uuid. Sin prefijo, un token emitido por
 * este flujo público tendría exactamente la forma de uno de admin. Hoy no es explotable
 * —el uuid lo genera el servidor, no el atacante— pero cuesta cero cerrarlo antes de que
 * alguien agregue el endpoint que lo vuelva explotable.
 */
function sujetoDe(id: string): string {
  return `comunidad-pendiente:${id}`
}

/** Igual que el resto de los endpoints del proyecto: sin Upstash configurado, no se opera. */
function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  return Redis.fromEnv()
}

export type ResultadoPendiente =
  | { ok: true; perfil: UpsertPerfilInput }
  /** Firma que no valida, token malformado, o id que no es uuid. */
  | { ok: false; motivo: 'invalido' }
  /** Firma válida pero emitida hace más de 24 h. */
  | { ok: false; motivo: 'expirado' }
  /** Firma válida y vigente, pero el payload ya no está: se consumió o venció en Redis. */
  | { ok: false; motivo: 'usado' }

/**
 * Guarda el perfil pendiente y devuelve el par (id, token) que arma el link del mail.
 * Devuelve null si falta la config de Upstash — el llamador decide el status.
 */
export async function crearPendiente(
  perfil: UpsertPerfilInput,
): Promise<{ id: string; token: string } | null> {
  const redis = getRedis()
  if (!redis) return null

  const id = randomUUID()
  await redis.set(claveDe(id), perfil, { ex: TTL_SEGUNDOS })

  return { id, token: generateAdminToken(sujetoDe(id)) }
}

/**
 * Verifica la firma y consume el pendiente: lo lee y lo borra en una sola operación
 * (`getdel`). Atómico a propósito — dos clics simultáneos en el mismo link del mail no
 * pueden disparar dos altas.
 *
 * El orden importa: primero se valida la firma y recién después se toca Redis, así un id
 * suelto sin token no sirve ni para averiguar si existe.
 */
export async function consumirPendiente(id: string, token: string): Promise<ResultadoPendiente> {
  try {
    verifyAdminToken(sujetoDe(id), token)
  } catch (err) {
    const expirado = err instanceof Error && err.message.includes('expiró')
    return { ok: false, motivo: expirado ? 'expirado' : 'invalido' }
  }

  const redis = getRedis()
  if (!redis) return { ok: false, motivo: 'invalido' }

  const perfil = await redis.getdel<UpsertPerfilInput>(claveDe(id))
  if (!perfil) return { ok: false, motivo: 'usado' }

  return { ok: true, perfil }
}

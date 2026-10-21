/**
 * Registros de Comunidad a la espera de que su dueño confirme el email (§5.6 de
 * docs/arranque.md).
 *
 * POR QUÉ EXISTE ESTE MÓDULO — el agujero que cierra:
 * `upsertPerfilComunidad()` hace upsert con `onConflict: 'email'` y el email es la PK de
 * la tabla. Hasta §5.6, `POST /api/comunidad/registro` validaba formato, origen y rate limit,
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
 * La mecánica (uuid opaco + HMAC + payload en Redis) vive en `sobreFirmado.ts`, compartida con
 * los otros dos flujos de enlace por mail. Acá queda solo lo propio del alta.
 */

import { crearSobre, abrirSobre } from './sobreFirmado'
import type { UpsertPerfilInput } from './perfil'

/**
 * Igualado al TTL de los tokens (24 h, lib/admin/tokens.ts:3) a propósito: si el
 * payload viviera más que la firma, quedarían registros pendientes imposibles de confirmar
 * ocupando lugar; si viviera menos, un link todavía válido fallaría sin explicación. Que
 * expiren juntos deja un solo estado final posible.
 */
const TTL_SEGUNDOS = 24 * 60 * 60

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
  return crearSobre('pendiente', perfil, TTL_SEGUNDOS)
}

/**
 * Verifica la firma y consume el pendiente: lo lee y lo borra en una sola operación.
 * Atómico a propósito — dos clics simultáneos en el mismo link del mail no pueden disparar
 * dos altas.
 */
export async function consumirPendiente(id: string, token: string): Promise<ResultadoPendiente> {
  const sobre = await abrirSobre<UpsertPerfilInput>('pendiente', id, token, { consumir: true })
  return sobre.ok ? { ok: true, perfil: sobre.payload } : sobre
}

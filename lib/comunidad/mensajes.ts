/**
 * Mensajes privados a la espera de que su remitente confirme el email (§5.12 de
 * docs/arranque.md).
 *
 * EL AGUJERO QUE CIERRA — es más grave de lo que decía la nota original:
 * `POST /api/comunidad/mensaje` ponía `remitenteEmail` —declarado por quien envía, sin
 * verificar— en el `replyTo` del correo que le llega al destinatario. Y el cuerpo del mail
 * invita a responder directamente.
 *
 * Eso no es solo suplantación. Es una vía de cosecha del dato que las migraciones 0002 y 0010
 * trabajaron para proteger:
 *
 *   1. el atacante elige un perfil del mapa, que es público;
 *   2. manda un mensaje creíble con `replyTo: atacante@…`;
 *   3. la persona responde de buena fe, y su cliente de correo manda la respuesta a esa casilla;
 *   4. el atacante ya tiene su email personal.
 *
 * El email de los miembros es justamente lo que 0002 sacó del alcance de la anon key. Este
 * endpoint lo devolvía por la puerta de atrás, con la víctima colaborando sin saberlo.
 *
 * CÓMO LO CIERRA:
 * el mensaje ya no se entrega al escribirlo. Se guarda acá y se manda un enlace firmado a la
 * dirección que el remitente declaró. Solo al abrirlo se entrega al destinatario — de modo que
 * el `replyTo` es siempre una casilla demostradamente controlada por quien escribe.
 *
 * Efecto lateral bueno: mata el spam. Hoy se pueden disparar mensajes sin controlar ningún
 * buzón. Y si alguien pone el email de un tercero, ese tercero recibe un "confirma tu mensaje"
 * que puede ignorar: al destinatario no le llega nada.
 */

import { crearSobre, abrirSobre } from './sobreFirmado'

/**
 * Una hora, no 24. Un mensaje sin confirmar en una hora casi seguro se abandonó, y mientras
 * tanto es texto personal esperando en Redis. Cuanto menos viva, mejor.
 */
const TTL_SEGUNDOS = 60 * 60

/** Lo que se guarda mientras el mensaje espera confirmación. */
export interface MensajePendiente {
  destinatarioId: string
  remitenteNombre: string
  remitenteEmail: string
  mensaje: string
}

export type ResultadoMensaje =
  | { ok: true; mensaje: MensajePendiente }
  | { ok: false; motivo: 'invalido' }
  | { ok: false; motivo: 'expirado' }
  | { ok: false; motivo: 'usado' }

export async function crearMensajePendiente(
  mensaje: MensajePendiente,
): Promise<{ id: string; token: string } | null> {
  return crearSobre('mensaje', mensaje, TTL_SEGUNDOS)
}

/**
 * Consume el mensaje pendiente. Atómico: dos clics en el mismo enlace no pueden entregar el
 * mensaje dos veces.
 */
export async function consumirMensajePendiente(
  id: string,
  token: string,
): Promise<ResultadoMensaje> {
  const sobre = await abrirSobre<MensajePendiente>('mensaje', id, token, { consumir: true })
  return sobre.ok ? { ok: true, mensaje: sobre.payload } : sobre
}

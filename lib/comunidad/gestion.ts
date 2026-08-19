/**
 * Sesiones de gestión de perfil de Comunidad — el "self-service" que cierra PII-01.
 *
 * QUÉ RESUELVE:
 * cambiar la visibilidad del teléfono o darse de baja del mapa exigía escribirle a Silvana.
 * Este módulo permite hacerlo sin intervención humana, sin abrir el agujero que cerró §5.6:
 * quien quiere gestionar su perfil pide un enlace, y el enlace llega a la casilla que ya está
 * registrada. Recibirlo es la prueba de que el perfil es suyo.
 *
 * DOS DIFERENCIAS CON EL SOBRE DEL ALTA, y las dos importan:
 *
 *   (1) La sesión NO se consume al leerla. El pendiente de alta se consume porque su único
 *       acto es crear la fila; acá la persona carga la página, mira lo que tiene, y recién
 *       después decide. Con `consumir: true` el enlace moriría antes de servir.
 *
 *   (2) TTL de 1 HORA, no 24. Los tokens de lib/admin/tokens tienen su ventana fija en 24 h y no se toca
 *       (la usan admin y Gina); el control real es el TTL de Redis. Es una página desde la que
 *       se puede publicar un teléfono o borrar una cuenta: cuanto menos viva el enlace, mejor.
 *
 * La mecánica común vive en `sobreFirmado.ts`.
 */

import { crearSobre, abrirSobre, cerrarSobre } from './sobreFirmado'

/** Una hora. Ver el bloque de arriba: deliberadamente más corto que el token que lo firma. */
const TTL_SEGUNDOS = 60 * 60

/** Lo que se guarda dentro del sobre. El email, no el id del perfil: es la llave real de la
 *  tabla, y así la sesión no se rompe si el perfil se borra y se vuelve a crear. */
interface PayloadSesion {
  email: string
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
  return crearSobre<PayloadSesion>('gestion', { email }, TTL_SEGUNDOS)
}

/** Verifica la firma y devuelve el email de la sesión SIN consumirla. */
export async function leerSesionGestion(id: string, token: string): Promise<ResultadoSesion> {
  const sobre = await abrirSobre<PayloadSesion>('gestion', id, token, { consumir: false })

  if (sobre.ok) {
    // Defensivo: un sobre presente pero sin email es un estado que no debería existir. Se
    // trata como vencido en vez de devolver ok con un email vacío.
    return sobre.payload?.email
      ? { ok: true, email: sobre.payload.email }
      : { ok: false, motivo: 'expirado' }
  }

  // El primitivo distingue 'usado' (no está en Redis) de 'expirado' (firma vieja). Acá los
  // dos significan lo mismo de cara a la persona —"este enlace ya no sirve"— y la sesión no
  // se consume nunca, así que 'usado' solo puede venir del TTL de 1 h.
  return { ok: false, motivo: sobre.motivo === 'invalido' ? 'invalido' : 'expirado' }
}

/**
 * Cierra la sesión antes de tiempo. Se llama al borrar el perfil: dejar viva una sesión que
 * apunta a un email que ya no existe no es peligroso, pero sí confuso — la página volvería a
 * cargar y no encontraría nada.
 */
export async function cerrarSesionGestion(id: string): Promise<void> {
  return cerrarSobre('gestion', id)
}

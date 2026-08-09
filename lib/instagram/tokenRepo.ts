/**
 * lib/instagram/tokenRepo.ts — persistencia de la conexión de Instagram (vía Facebook Login)
 * en la tabla `instagram_tokens` (supabase/migrations/0008 + 0009).
 *
 * `accessToken` es el Page Access Token de la Página de Facebook vinculada — es lo que de
 * verdad usa lib/instagram/posts.ts para leer /media. `userAccessToken` es el long-lived user
 * token (~60 días) que el cron de refresco extiende y del que vuelve a derivar el Page Access
 * Token (Meta no expone un refresh directo de este último).
 *
 * Se espera una sola fila (una cuenta conectada); `saveInstagramToken` upsertea por
 * `ig_user_id` para que reconectar la misma cuenta actualice el token existente en vez de
 * duplicar filas.
 *
 * CUENTA ESPERADA (auditoría 2026-08-08, IG-01): el upsert por `ig_user_id` significa que una
 * cuenta distinta NO pisa la fila existente — inserta una nueva. Cuando la lectura era
 * "la fila con `updated_at` más reciente", cualquier fila que entrara después ganaba y el
 * carrusel público del Home pasaba a servir los posts de esa otra cuenta. Cerrar el endpoint
 * de autorización no alcanzaba: bastaba un clic con la cuenta equivocada o una cuenta de
 * prueba vía /conectar para cambiar el feed en silencio.
 *
 * Fix: `INSTAGRAM_EXPECTED_IG_USER_ID` fija cuál es la única cuenta que este sitio publica.
 * Si está definida, la lectura filtra por ella (deja de depender del orden) y la escritura
 * rechaza cualquier otra. Si NO está definida, se permite la primera conexión y se lee la
 * más reciente — es el estado de arranque, antes de conocer el `ig_user_id`, que solo existe
 * después de conectar por primera vez. Una vez conectada, fijar la variable con el
 * `igUserId` que devuelve el endpoint y redeployar.
 */

import { getSupabaseServerClient } from '@/lib/supabase/serverClient'

/** Mensaje del rechazo por cuenta ajena — el callback lo distingue para explicarlo bien. */
export const ERROR_CUENTA_NO_AUTORIZADA = 'Cuenta de Instagram no autorizada para este sitio'

/** `ig_user_id` de la única cuenta autorizada a alimentar el feed público, o null si no se fijó. */
export function cuentaEsperada(): string | null {
  return process.env.INSTAGRAM_EXPECTED_IG_USER_ID?.trim() || null
}

export interface InstagramToken {
  igUserId: string
  pageId: string
  accessToken: string // Page Access Token
  userAccessToken: string // long-lived user token
  expiresAt: string // ISO 8601 — expiración de userAccessToken
}

/**
 * Devuelve el token de la cuenta esperada, o null si no hay ninguna conectada todavía.
 * Sin `INSTAGRAM_EXPECTED_IG_USER_ID` fijada cae al comportamiento de arranque (la fila más
 * reciente) — ver la nota de CUENTA ESPERADA arriba.
 */
export async function getInstagramToken(): Promise<InstagramToken | null> {
  try {
    const supabase = getSupabaseServerClient()
    const esperada = cuentaEsperada()

    const base = supabase
      .from('instagram_tokens')
      .select('ig_user_id, page_id, access_token, user_access_token, expires_at')

    const { data, error } = await (esperada ? base.eq('ig_user_id', esperada) : base)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return null
    return {
      igUserId: data.ig_user_id as string,
      pageId: data.page_id as string,
      accessToken: data.access_token as string,
      userAccessToken: data.user_access_token as string,
      expiresAt: data.expires_at as string,
    }
  } catch (err) {
    console.error('[instagram] tokenRepo.getInstagramToken error:', err instanceof Error ? err.message : 'unknown')
    return null
  }
}

export async function saveInstagramToken(token: InstagramToken): Promise<void> {
  // Defensa en profundidad: aunque el endpoint de autorización ya exige sesión, ninguna cuenta
  // distinta de la esperada debe llegar a persistirse — es lo que en su momento permitía
  // desviar el feed público insertando una fila nueva (IG-01).
  const esperada = cuentaEsperada()
  if (esperada && token.igUserId !== esperada) {
    throw new Error(ERROR_CUENTA_NO_AUTORIZADA)
  }

  const supabase = getSupabaseServerClient()
  const { error } = await supabase
    .from('instagram_tokens')
    .upsert(
      {
        ig_user_id: token.igUserId,
        page_id: token.pageId,
        access_token: token.accessToken,
        user_access_token: token.userAccessToken,
        expires_at: token.expiresAt,
      },
      { onConflict: 'ig_user_id' },
    )
  if (error) throw new Error(`Supabase saveInstagramToken: ${error.message}`)
}

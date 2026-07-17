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
 */

import { getSupabaseServerClient } from '@/lib/supabase/serverClient'

export interface InstagramToken {
  igUserId: string
  pageId: string
  accessToken: string // Page Access Token
  userAccessToken: string // long-lived user token
  expiresAt: string // ISO 8601 — expiración de userAccessToken
}

/** Devuelve el token guardado más reciente, o null si no hay ninguna cuenta conectada todavía. */
export async function getInstagramToken(): Promise<InstagramToken | null> {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('instagram_tokens')
      .select('ig_user_id, page_id, access_token, user_access_token, expires_at')
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

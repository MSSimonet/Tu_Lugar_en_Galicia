/**
 * lib/instagram/tokenRepo.ts — persistencia del access token de larga duración de Instagram
 * en la tabla `instagram_tokens` (supabase/migrations/0008_instagram_tokens.sql).
 *
 * Se espera una sola fila (una cuenta de Instagram conectada); `saveInstagramToken` upsertea
 * por `ig_user_id` para que reconectar la misma cuenta actualice el token existente en vez de
 * duplicar filas.
 */

import { getSupabaseServerClient } from '@/lib/supabase/serverClient'

export interface InstagramToken {
  igUserId: string
  accessToken: string
  expiresAt: string // ISO 8601
}

/** Devuelve el token guardado más reciente, o null si no hay ninguna cuenta conectada todavía. */
export async function getInstagramToken(): Promise<InstagramToken | null> {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('instagram_tokens')
      .select('ig_user_id, access_token, expires_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return null
    return {
      igUserId: data.ig_user_id as string,
      accessToken: data.access_token as string,
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
      { ig_user_id: token.igUserId, access_token: token.accessToken, expires_at: token.expiresAt },
      { onConflict: 'ig_user_id' },
    )
  if (error) throw new Error(`Supabase saveInstagramToken: ${error.message}`)
}

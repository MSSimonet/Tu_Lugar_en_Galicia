/**
 * lib/instagram/graph.ts — cliente de la "Instagram API with Instagram Login"
 * (graph.instagram.com), la vía vigente de Meta para leer el feed de una cuenta profesional
 * sin depender de una Página de Facebook vinculada. Los tres endpoints que usa este archivo:
 *
 *   - GET /access_token (grant_type=ig_exchange_token) — canjea el short-lived token que se
 *     genera a mano en developers.facebook.com por uno de larga duración (~60 días).
 *   - GET /refresh_access_token (grant_type=ig_refresh_token) — extiende un long-lived token
 *     ya emitido otros ~60 días. Requiere que el token tenga al menos 24 h de antigüedad.
 *   - GET /{version}/me/media — últimos posts de la cuenta.
 *
 * Ninguna de estas llamadas se ejecuta todavía en producción: falta el short-lived token real
 * (se genera manualmente en el dashboard de Meta) para completar la primera conexión vía
 * app/api/admin/instagram/conectar.
 */

const GRAPH_VERSION = 'v22.0'

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number // segundos
}

function appSecret(): string {
  const s = process.env.INSTAGRAM_APP_SECRET
  if (!s) throw new Error('INSTAGRAM_APP_SECRET no configurado')
  return s
}

function expiresAtFrom(expiresInSeconds: number): string {
  return new Date(Date.now() + expiresInSeconds * 1000).toISOString()
}

export async function exchangeLongLivedToken(
  shortLivedToken: string,
): Promise<{ accessToken: string; expiresAt: string }> {
  const url = new URL('https://graph.instagram.com/access_token')
  url.searchParams.set('grant_type', 'ig_exchange_token')
  url.searchParams.set('client_secret', appSecret())
  url.searchParams.set('access_token', shortLivedToken)

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Instagram exchange_token error — status: ${res.status}`)
  const json = (await res.json()) as TokenResponse
  return { accessToken: json.access_token, expiresAt: expiresAtFrom(json.expires_in) }
}

export async function refreshLongLivedToken(
  accessToken: string,
): Promise<{ accessToken: string; expiresAt: string }> {
  const url = new URL('https://graph.instagram.com/refresh_access_token')
  url.searchParams.set('grant_type', 'ig_refresh_token')
  url.searchParams.set('access_token', accessToken)

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Instagram refresh_access_token error — status: ${res.status}`)
  const json = (await res.json()) as TokenResponse
  return { accessToken: json.access_token, expiresAt: expiresAtFrom(json.expires_in) }
}

export async function fetchInstagramUserId(accessToken: string): Promise<string> {
  const url = new URL(`https://graph.instagram.com/${GRAPH_VERSION}/me`)
  url.searchParams.set('fields', 'id')
  url.searchParams.set('access_token', accessToken)

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Instagram /me error — status: ${res.status}`)
  const json = (await res.json()) as { id: string }
  return json.id
}

export interface RawInstagramMedia {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url?: string
  thumbnail_url?: string
  permalink: string
  timestamp: string
}

/** Últimos `limit` posts de la cuenta conectada. `next.revalidate` los cachea 10 min (ver lib/instagram/posts.ts). */
export async function fetchUltimosMedia(accessToken: string, limit: number): Promise<RawInstagramMedia[]> {
  const url = new URL(`https://graph.instagram.com/${GRAPH_VERSION}/me/media`)
  url.searchParams.set('fields', 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp')
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('access_token', accessToken)

  const res = await fetch(url, { next: { revalidate: 600 } })
  if (!res.ok) throw new Error(`Instagram /me/media error — status: ${res.status}`)
  const json = (await res.json()) as { data?: RawInstagramMedia[] }
  return json.data ?? []
}

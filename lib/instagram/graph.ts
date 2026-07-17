/**
 * lib/instagram/graph.ts — cliente de la Instagram Graph API vía "Inicio de sesión con
 * Facebook" (graph.facebook.com), que es el producto real configurado en la app de Meta
 * (caso de uso "Administrar mensajes y contenido en Instagram", ver Configuración → Casos de
 * uso). La cuenta de Instagram se lee a través de la Página de Facebook vinculada — no hay
 * conexión directa a Instagram sin pasar por ahí.
 *
 * Cadena completa: code (OAuth) → short-lived user token → long-lived user token (~60 días)
 * → lista de Páginas del usuario (/me/accounts, cada una con su propio Page Access Token) →
 * Página con instagram_business_account → ese Page Access Token es el que se usa para leer
 * /{ig-user-id}/media. El refresco periódico extiende el long-lived user token
 * (grant_type=fb_exchange_token reusando el propio token) y vuelve a derivar el Page Access
 * Token — Meta no expone un refresh directo del Page token.
 */

const GRAPH_VERSION = 'v22.0'
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number // segundos
}

function appId(): string {
  const s = process.env.INSTAGRAM_APP_ID
  if (!s) throw new Error('INSTAGRAM_APP_ID no configurado')
  return s
}

function appSecret(): string {
  const s = process.env.INSTAGRAM_APP_SECRET
  if (!s) throw new Error('INSTAGRAM_APP_SECRET no configurado')
  return s
}

function expiresAtFrom(expiresInSeconds: number): string {
  return new Date(Date.now() + expiresInSeconds * 1000).toISOString()
}

/**
 * URL de autorización de Facebook Login — el link que abre Silvana para conectar la cuenta
 * ella misma: inicia sesión con SU propia contraseña directamente en Facebook (nunca la ve ni
 * el desarrollador ni esta app) y aprueba los permisos. Facebook la redirige a `redirectUri`
 * con ?code=...&state=... para app/api/admin/instagram/callback.
 */
export function buildAuthorizeUrl(redirectUri: string, state: string): string {
  const url = new URL(`https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`)
  url.searchParams.set('client_id', appId())
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'pages_show_list,pages_read_engagement,instagram_basic')
  url.searchParams.set('state', state)
  return url.toString()
}

/** Canjea el `code` de un solo uso (recibido en el callback) por el short-lived user token inicial. */
export async function exchangeCodeForShortLivedToken(
  code: string,
  redirectUri: string,
): Promise<{ accessToken: string; expiresAt: string }> {
  const url = new URL(`${GRAPH_BASE}/oauth/access_token`)
  url.searchParams.set('client_id', appId())
  url.searchParams.set('client_secret', appSecret())
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('code', code)

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Facebook oauth/access_token (code) error — status: ${res.status}`)
  const json = (await res.json()) as TokenResponse
  return { accessToken: json.access_token, expiresAt: expiresAtFrom(json.expires_in) }
}

/** Canjea un short-lived (o el propio long-lived vigente, para refrescarlo) user token por uno long-lived (~60 días). */
export async function exchangeLongLivedUserToken(
  userToken: string,
): Promise<{ accessToken: string; expiresAt: string }> {
  const url = new URL(`${GRAPH_BASE}/oauth/access_token`)
  url.searchParams.set('grant_type', 'fb_exchange_token')
  url.searchParams.set('client_id', appId())
  url.searchParams.set('client_secret', appSecret())
  url.searchParams.set('fb_exchange_token', userToken)

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Facebook oauth/access_token (fb_exchange_token) error — status: ${res.status}`)
  const json = (await res.json()) as TokenResponse
  return { accessToken: json.access_token, expiresAt: expiresAtFrom(json.expires_in) }
}

export interface CuentaInstagramConectada {
  pageId: string
  pageAccessToken: string
  igUserId: string
}

interface PageConIg {
  id: string
  access_token: string
  instagram_business_account?: { id: string }
}

/**
 * Recorre las Páginas de Facebook que administra el usuario y devuelve la primera que tenga
 * una cuenta de Instagram profesional vinculada — es lo que necesitamos para leer /media.
 * Lanza si el usuario no administra ninguna Página con Instagram vinculado.
 */
export async function fetchPaginaConInstagram(longLivedUserToken: string): Promise<CuentaInstagramConectada> {
  const url = new URL(`${GRAPH_BASE}/me/accounts`)
  url.searchParams.set('fields', 'id,access_token,instagram_business_account')
  url.searchParams.set('access_token', longLivedUserToken)

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Facebook /me/accounts error — status: ${res.status}`)
  const json = (await res.json()) as { data?: PageConIg[] }
  const pagina = (json.data ?? []).find((p) => p.instagram_business_account?.id)

  if (!pagina?.instagram_business_account) {
    throw new Error('Ninguna Página de Facebook administrada tiene una cuenta de Instagram vinculada')
  }

  return { pageId: pagina.id, pageAccessToken: pagina.access_token, igUserId: pagina.instagram_business_account.id }
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
export async function fetchUltimosMedia(
  igUserId: string,
  pageAccessToken: string,
  limit: number,
): Promise<RawInstagramMedia[]> {
  const url = new URL(`${GRAPH_BASE}/${igUserId}/media`)
  url.searchParams.set('fields', 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp')
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('access_token', pageAccessToken)

  const res = await fetch(url, { next: { revalidate: 600 } })
  if (!res.ok) throw new Error(`Instagram /media error — status: ${res.status}`)
  const json = (await res.json()) as { data?: RawInstagramMedia[] }
  return json.data ?? []
}

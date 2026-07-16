/**
 * lib/instagram/posts.ts — capa de lectura pública del feed, consumida por el componente
 * (components/home/FeedInstagram.tsx) y por app/api/instagram/posts/route.ts. El cacheo real
 * (10 min) vive en fetchUltimosMedia (lib/instagram/graph.ts) vía `next.revalidate`; acá solo
 * se normaliza la respuesta de Instagram al shape que necesita la UI.
 */

import { getInstagramToken } from './tokenRepo'
import { fetchUltimosMedia } from './graph'

export interface InstagramPost {
  id: string
  caption: string | null
  imageUrl: string
  permalink: string
  isVideo: boolean
  timestamp: string
}

/** Devuelve [] si todavía no hay cuenta conectada o si Instagram falla — nunca lanza (fail-soft: el feed es decorativo). */
export async function getUltimosPosts(limit = 10): Promise<InstagramPost[]> {
  const token = await getInstagramToken()
  if (!token) return []

  try {
    const media = await fetchUltimosMedia(token.accessToken, limit)
    return media
      .map((m) => ({
        id: m.id,
        caption: m.caption ?? null,
        imageUrl: (m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url) ?? '',
        permalink: m.permalink,
        isVideo: m.media_type === 'VIDEO',
        timestamp: m.timestamp,
      }))
      .filter((p): p is InstagramPost => p.imageUrl.length > 0)
  } catch (err) {
    console.error('[instagram] getUltimosPosts error:', err instanceof Error ? err.message : 'unknown')
    return []
  }
}

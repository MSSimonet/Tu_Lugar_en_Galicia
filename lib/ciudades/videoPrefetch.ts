export const videoSrcPorSlug: Record<string, string> = {
  vigo: '/videos/Vigo.mp4',
  'a-coruna': '/videos/coruna.mp4',
  'santiago-de-compostela': '/videos/Santiago.mp4',
  pontevedra: '/videos/Pontevedra.mp4',
  lugo: '/videos/Lugo.mp4',
}

const prefetched = new Set<string>()

export function prefetchCiudadVideo(slug: string): void {
  const src = videoSrcPorSlug[slug]
  if (!src || prefetched.has(src)) return
  prefetched.add(src)
  fetch(src, { keepalive: true }).catch(() => {})
}

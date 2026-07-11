import type { Metadata } from 'next'
import { PAGE_METADATA } from './metadata'
import { SITE_URL } from '@/lib/config/site'

export function buildOpenGraph(
  page: keyof typeof PAGE_METADATA
): Metadata['openGraph'] {
  const meta = PAGE_METADATA[page]
  return {
    title: meta.title,
    description: meta.description,
    url: meta.canonical,
    siteName: 'Tu Lugar en Galicia',
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: 'Tu Lugar en Galicia — Relocation para familias latinoamericanas',
      },
    ],
  }
}

/**
 * GET /api/instagram/posts — últimos posts públicos de la cuenta, para el carrusel del Home
 * (components/home/FeedInstagram.tsx llama a getUltimosPosts() directamente en vez de pegarle
 * a este route por HTTP; este endpoint queda para consumo externo/cliente si hiciera falta).
 * Sin auth: son los mismos posts que ya son públicos en Instagram.
 */

import { NextResponse } from 'next/server'
import { getUltimosPosts } from '@/lib/instagram/posts'

export const revalidate = 600

export async function GET(): Promise<NextResponse> {
  const posts = await getUltimosPosts(10)
  return NextResponse.json({ posts })
}

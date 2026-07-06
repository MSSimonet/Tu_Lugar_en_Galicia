import { NextRequest, NextResponse } from 'next/server'

// Hashes SHA-256 de los <script> inline (tema anti-flash + JSON-LD estático).
// Todos son contenido fijo/determinístico (sin datos por request) — permiten
// eliminar 'unsafe-inline' de script-src sin usar nonce (un nonce por request
// forzaría renderizado dinámico en estas páginas, hoy estáticas).
// Si se edita el texto de alguno de estos scripts (ej. copy de FAQ de una
// ciudad, o el script de tema), hay que recalcular su hash o el navegador
// bloqueará el script silenciosamente (se ve como violación de CSP en consola).
const INLINE_SCRIPT_HASHES = [
  "'sha256-PMdR7RFpYsftOnJgaAsT7Oor3sSpSyqJ6X/d1hV6sZg='", // app/layout.tsx — script de tema
  "'sha256-D6OU0n76o3oia0DoRGnz4iTMPdRK/g6+BrT3Hgt0ckM='", // app/page.tsx — localBusinessSchema
  "'sha256-6h87612lImx4Fr21J9FjdmL2CAW9sx7nW11lyuFOLsg='", // app/como-funciona/page.tsx — serviceSchema
  "'sha256-1ufvVU5bMgI8WxxGfjT0d6fy4F+nOdBtDMvLySZU3nA='", // app/faq/page.tsx — faqSchema
  "'sha256-cF0u/u2vllNGxdaGy96XQAjVlJMZy/HlI1bQG1D3enE='", // ciudades/vigo — faqSchema
  "'sha256-Fs2V+FE6G5LNnzevO3JSBT/bglL99gLK+3z45PVcCa4='", // ciudades/a-coruna — faqSchema
  "'sha256-9SDn+KQYgJq68dFduZgm2XKxAYgTeJm7SIUN2EfI0J4='", // ciudades/lugo — faqSchema
  "'sha256-0Dtu2XL9B+FtdogvyZoRycaW7o5mrViTbH2laqjbhk8='", // ciudades/pontevedra — faqSchema
  "'sha256-vKxaNcvBUyM57hJDfsI6keY5bWEfU28mdT21jXGvlhE='", // ciudades/santiago-de-compostela — faqSchema
].join(' ')

export function middleware(req: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = req.nextUrl

  const csp = [
    "default-src 'self'",
    `script-src 'self' ${INLINE_SCRIPT_HASHES} https://app.cal.com`,
    // style-src mantiene 'unsafe-inline': el proyecto usa atributos style={{}}
    // de forma masiva (cientos de usos); los hashes/nonces de CSP no cubren
    // atributos style="", solo <style> como elemento — migrarlo requeriría
    // reescribir el enfoque de estilos del proyecto, no solo agregar CSP.
    // (fonts.googleapis.com ya no hace falta acá: next/font/google descarga
    // las fuentes en build time y las sirve desde /_next/static/media — no
    // hay ningún request en runtime a Google Fonts, verificado en preview.)
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https://placehold.co",
    "media-src 'self'",
    "frame-src https://app.cal.com https://cal.com",
    "connect-src 'self' https://app.cal.com https://cal.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ')

  const isSensitiveRoute =
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/api/admin/') ||
    pathname.startsWith('/api/webhooks/')

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')

  // Cache-Control por defecto para API dinámicas/sensibles (ZAP: "Missing Cache-Control
  // Header"). Se excluyen /api/clima y /api/marcador porque ya declaran su propio
  // Cache-Control público (s-maxage) a propósito para CDN — un header puesto acá
  // pisaría el suyo, ya que el que se setea en middleware.ts gana sobre el que
  // devuelve el route handler (verificado empíricamente: mismo orden de ejecución
  // que CSP/X-Frame-Options más arriba).
  const isCacheableApiRoute =
    pathname.startsWith('/api/clima/') || pathname === '/api/marcador'
  if (pathname.startsWith('/api/') && !isCacheableApiRoute) {
    response.headers.set('Cache-Control', 'no-store')
  }

  // Referrer-Policy vive únicamente acá (no en vercel.json) — vercel.json aplica
  // sus reglas al final, en el edge, y pisaría este valor por rutas para todas
  // las rutas incluidas las admin, anulando el no-referrer que protege los
  // links con token en query string (A09).
  response.headers.set(
    'Referrer-Policy',
    isSensitiveRoute ? 'no-referrer' : 'strict-origin-when-cross-origin',
  )
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

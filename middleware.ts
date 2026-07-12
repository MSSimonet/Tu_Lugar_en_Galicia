import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Hashes SHA-256 de los <script> inline estáticos (JSON-LD + script de tema).
// El script de tema también recibe el nonce dinámico desde layout.tsx — los hashes
// quedan como fallback para navegadores sin soporte de nonce (CSP nivel 1).
// Si se edita el texto de alguno de estos scripts, recalcular su hash o el
// navegador lo bloqueará silenciosamente (violación CSP en consola).
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

export async function middleware(req: NextRequest) {
  // Un nonce criptográfico por request. Next.js App Router lee 'x-nonce' de los
  // headers del request y estampa ese valor en todos los inline scripts que genera
  // durante el streaming RSC (__next_f.push(...)), habilitando la hidratación de React.
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const { pathname } = req.nextUrl

  // Pasar el nonce al layout: headers() en app/layout.tsx lo lee y lo pone en
  // el script anti-flash. Next.js también lo aplica a sus propios inline scripts.
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  const csp = [
    "default-src 'self'",
    // 'nonce-{nonce}': cubre el script anti-flash (layout.tsx) y todos los
    // __next_f.push(...) de hidratación RSC que Next.js genera por request.
    // Los hashes quedan como fallback para browsers sin soporte de nonce (CSP1).
    // 'unsafe-eval' solo en dev: React usa eval() en desarrollo para reconstruir
    // call stacks. En producción React nunca usa eval() — Vercel deploy es seguro.
    `script-src 'self' 'nonce-${nonce}' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval' " : ''}${INLINE_SCRIPT_HASHES} https://app.cal.com`,
    // style-src mantiene 'unsafe-inline': el proyecto usa atributos style={{}}
    // de forma masiva (cientos de usos); los hashes/nonces de CSP no cubren
    // atributos style="", solo <style> como elemento — migrarlo requeriría
    // reescribir el enfoque de estilos del proyecto, no solo agregar CSP.
    // (fonts.googleapis.com ya no hace falta acá: next/font/google descarga
    // las fuentes en build time y las sirve desde /_next/static/media — no
    // hay ningún request en runtime a Google Fonts, verificado en preview.)
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    // https://*.tile.openstreetmap.org: tiles del mapa de Comunidad de Acogida (Leaflet.js).
    "img-src 'self' data: blob: https://placehold.co https://*.tile.openstreetmap.org",
    "media-src 'self'",
    "frame-src https://app.cal.com https://cal.com",
    // https://*.supabase.co: el mapa de Comunidad de Acogida consume Supabase directo desde
    // el cliente (docs/comunidad-de-acogida.md §4) — necesita connect-src, no solo server-side.
    "connect-src 'self' https://app.cal.com https://cal.com https://*.supabase.co",
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

  // Gate de sesión NextAuth para /admin/* (páginas HTML que abre Silvana en el
  // navegador). NO cubre /api/admin/ ni /api/webhooks/ — esos siguen con su
  // propio Bearer secret (lib/admin/auth.ts), pensado para llamadas de cron o
  // servidor a servidor, no para un login humano.
  const isAdminPage = pathname.startsWith('/admin/') && pathname !== '/admin/login'
  if (isAdminPage) {
    // secureCookie debe coincidir con el mismo cálculo que usa Auth.js al fijar
    // la cookie (protocolo https → nombre con prefijo "__Secure-"); si no,
    // getToken busca el nombre de cookie equivocado y nunca encuentra la sesión
    // en producción, aunque el login haya sido exitoso.
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: req.nextUrl.protocol === 'https:',
    })
    if (!token) {
      const loginUrl = new URL('/admin/login', req.nextUrl)
      loginUrl.searchParams.set('callbackUrl', pathname + req.nextUrl.search)
      const redirectResponse = NextResponse.redirect(loginUrl)
      redirectResponse.headers.set('Content-Security-Policy', csp)
      redirectResponse.headers.set('X-Content-Type-Options', 'nosniff')
      redirectResponse.headers.set('X-Frame-Options', 'DENY')
      redirectResponse.headers.set('Referrer-Policy', 'no-referrer')
      redirectResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
      return redirectResponse
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

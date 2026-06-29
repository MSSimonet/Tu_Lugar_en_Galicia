import { NextResponse } from 'next/server'

export function middleware() {
  const response = NextResponse.next()

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://app.cal.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://placehold.co",
    "media-src 'self'",
    "frame-src https://app.cal.com https://cal.com",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

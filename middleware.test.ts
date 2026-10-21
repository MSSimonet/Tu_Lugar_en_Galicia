import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'

/**
 * Canonicalización de rutas de admin percent-encoded en middleware.ts (hallazgo F1).
 *
 * QUE AISLA Y POR QUE NO MOCKEA SESIÓN. La rama de canonicalización retorna ANTES del gate de
 * sesión (getToken), así que se puede ejercer sin sesión: se prueba solo el reconocimiento del
 * path codificado y el redirect a la forma canónica. Ese es exactamente el agujero de F1 —que
 * `/%61dmin/inbox` esquivaba el `startsWith('/admin/')` del gate— y su cierre.
 *
 * QUE NO CUBRE. El gate en sí (getToken → redirect a login o render) necesita estado de sesión y
 * vive de ese lado; no se toca acá. Lo que este test blinda es que una URL de admin codificada
 * nunca llegue al render, que es lo que causaba el 500 en Vercel.
 */

function req(pathAndQuery: string): NextRequest {
  return new NextRequest(new URL(pathAndQuery, 'http://localhost:3000'))
}

describe('middleware — canonicalización de rutas de admin percent-encoded', () => {
  it('redirige /%61dmin/inbox (307) a la forma canónica /admin/inbox', async () => {
    // Act
    const res = await middleware(req('/%61dmin/inbox'))

    // Assert
    expect(res.status).toBe(307)
    const location = res.headers.get('location') ?? ''
    expect(location.endsWith('/admin/inbox')).toBe(true)
    expect(location).not.toContain('%61')
  })

  it('preserva la query string al canonicalizar', async () => {
    // Act
    const res = await middleware(req('/%61dmin/inbox?x=1'))

    // Assert
    expect(res.status).toBe(307)
    expect((res.headers.get('location') ?? '').endsWith('/admin/inbox?x=1')).toBe(true)
  })

  it('conserva los headers de seguridad en el redirect canónico', async () => {
    // Act
    const res = await middleware(req('/%61dmin/inbox'))

    // Assert
    expect(res.headers.get('content-security-policy')).toContain("default-src 'self'")
    expect(res.headers.get('x-frame-options')).toBe('DENY')
    expect(res.headers.get('referrer-policy')).toBe('no-referrer')
  })

  it('canonicaliza /%61dmin/login a /admin/login sin romper (ni loop ni 500)', async () => {
    // Act
    const res = await middleware(req('/%61dmin/login'))

    // Assert
    expect(res.status).toBe(307)
    expect((res.headers.get('location') ?? '').endsWith('/admin/login')).toBe(true)
  })

  it('fail-safe: encoding malformado no lanza ni se canonicaliza como admin', async () => {
    // Act — %ZZ hace lanzar a decodeURIComponent; el catch lo trata como no-admin
    const res = await middleware(req('/%61dmin/inbo%ZZ'))

    // Assert — sin redirect canónico y sin excepción
    expect(res.status).not.toBe(307)
    expect(res.headers.get('location')).toBeNull()
  })

  it('no toca rutas públicas: /contacto no se redirige', async () => {
    // Act
    const res = await middleware(req('/contacto'))

    // Assert
    expect(res.headers.get('location')).toBeNull()
    expect(res.status).not.toBe(307)
  })
})

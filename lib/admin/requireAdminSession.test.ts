/**
 * Tests del segundo control del gate de /admin (hallazgo F1).
 *
 * QUE PROTEGE. `requireAdminSession()` es lo que cierra el bypass del gate por URL
 * percent-encoded: como lee la cookie de sesión y no el path, tiene que redirigir cuando no
 * hay sesión y dejar pasar cuando la hay, sin importar cómo se escribió la URL. Si alguien
 * afloja esa lógica, la única defensa real de las páginas de PII se cae en silencio.
 *
 * QUE SE MOCKEA. `@/auth` (la sesión), `next/navigation` (redirect, que en producción tira
 * NEXT_REDIRECT y corta el render — acá lo simulamos con un throw para poder afirmarlo), y
 * `react`.cache, que fuera de un render real se neutraliza a identidad. `server-only` se
 * mockea a vacío porque en un test de node no hay bundle de cliente que proteger.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Session } from 'next-auth'

const authMock = vi.hoisted(() => vi.fn())
const redirectMock = vi.hoisted(() =>
  vi.fn((url: string) => {
    // Reproduce el corte de flujo real de next: redirect() nunca retorna.
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
)

vi.mock('server-only', () => ({}))
vi.mock('react', async (importActual) => {
  const actual = await importActual<typeof import('react')>()
  return { ...actual, cache: <T,>(fn: T): T => fn }
})
vi.mock('next/navigation', () => ({ redirect: redirectMock }))
vi.mock('@/auth', () => ({ auth: authMock }))

import { requireAdminSession } from './requireAdminSession'

const sesionValida: Session = {
  user: { email: 'admin@ejemplo.test' },
  expires: '2999-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('requireAdminSession', () => {
  it('redirige a /admin/login cuando no hay sesión', async () => {
    // Arrange
    authMock.mockResolvedValue(null)

    // Act + Assert
    await expect(requireAdminSession()).rejects.toThrow('NEXT_REDIRECT:/admin/login')
    expect(redirectMock).toHaveBeenCalledWith('/admin/login')
  })

  it('devuelve la sesión y no redirige cuando la sesión es válida', async () => {
    // Arrange
    authMock.mockResolvedValue(sesionValida)

    // Act
    const resultado = await requireAdminSession()

    // Assert
    expect(resultado).toEqual(sesionValida)
    expect(redirectMock).not.toHaveBeenCalled()
  })
})

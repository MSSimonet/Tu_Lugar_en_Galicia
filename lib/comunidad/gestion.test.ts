/**
 * Tests de las sesiones de gestión de perfil (Toggle B / PII-01).
 *
 * Mismo criterio que pendientes.test.ts: se mockea Redis, NO se mockean los tokens. El HMAC
 * corre de verdad, porque lo que se quiere blindar es que la firma real rechace lo que tiene
 * que rechazar.
 *
 * Lo que este archivo cuida y el otro no: que una sesión de gestión y un pendiente de alta
 * NO sean intercambiables. Los dos flujos firman uuids con el mismo INTERNAL_API_SECRET, y
 * los separa unicamente el prefijo del sujeto.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const almacen = vi.hoisted(() => ({
  datos: new Map<string, unknown>(),
  llamadas: [] as string[],
}))

vi.mock('@upstash/redis', () => ({
  Redis: class FakeRedis {
    static fromEnv() {
      return new FakeRedis()
    }
    async set(clave: string, valor: unknown) {
      almacen.llamadas.push(`set:${clave}`)
      almacen.datos.set(clave, valor)
      return 'OK'
    }
    async get(clave: string) {
      almacen.llamadas.push(`get:${clave}`)
      return almacen.datos.get(clave) ?? null
    }
    async del(clave: string) {
      almacen.llamadas.push(`del:${clave}`)
      almacen.datos.delete(clave)
      return 1
    }
  },
}))

import { crearSesionGestion, leerSesionGestion, cerrarSesionGestion } from './gestion'
import { crearPendiente } from './pendientes'
import { generateAdminToken } from '@/lib/admin/tokens'

const EMAIL = 'vecina@ejemplo.test'

beforeEach(() => {
  almacen.datos.clear()
  almacen.llamadas.length = 0
  process.env.INTERNAL_API_SECRET = 'secreto-de-prueba-no-real'
  process.env.UPSTASH_REDIS_REST_URL = 'https://fake.upstash.io'
  process.env.UPSTASH_REDIS_REST_TOKEN = 'fake-token'
})

afterEach(() => {
  vi.useRealTimers()
})

describe('crearSesionGestion', () => {
  it('guarda el email bajo la clave de gestión y devuelve id + token', async () => {
    const sesion = await crearSesionGestion(EMAIL)

    expect(sesion).not.toBeNull()
    expect(almacen.datos.get(`comunidad:gestion:${sesion!.id}`)).toEqual({ email: EMAIL })
  })

  it('devuelve null sin config de Upstash y no escribe nada (fail-closed)', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN

    expect(await crearSesionGestion(EMAIL)).toBeNull()
    expect(almacen.llamadas).toEqual([])
  })
})

describe('leerSesionGestion', () => {
  it('con el token legítimo devuelve el email', async () => {
    const sesion = await crearSesionGestion(EMAIL)

    expect(await leerSesionGestion(sesion!.id, sesion!.token)).toEqual({ ok: true, email: EMAIL })
  })

  it('NO consume la sesión: se puede leer varias veces', async () => {
    const sesion = await crearSesionGestion(EMAIL)

    const primera = await leerSesionGestion(sesion!.id, sesion!.token)
    const segunda = await leerSesionGestion(sesion!.id, sesion!.token)

    // A diferencia del pendiente de alta, acá la persona carga la página, mira, y recién
    // después actúa. Si esto consumiera, el enlace moriría antes de servir para algo.
    expect(primera).toEqual({ ok: true, email: EMAIL })
    expect(segunda).toEqual({ ok: true, email: EMAIL })
  })

  it('rechaza un token manipulado', async () => {
    const sesion = await crearSesionGestion(EMAIL)
    const manipulado = sesion!.token.slice(0, -4) + 'AAAA'

    expect(await leerSesionGestion(sesion!.id, manipulado)).toEqual({ ok: false, motivo: 'invalido' })
  })

  it('con firma inválida NO toca Redis', async () => {
    const sesion = await crearSesionGestion(EMAIL)
    almacen.llamadas.length = 0

    await leerSesionGestion(sesion!.id, 'token-invalido')

    expect(almacen.llamadas).toEqual([])
  })

  it('devuelve "expirado" si la sesión ya no está en Redis (TTL de 1 h)', async () => {
    const sesion = await crearSesionGestion(EMAIL)
    almacen.datos.clear()

    expect(await leerSesionGestion(sesion!.id, sesion!.token)).toEqual({
      ok: false,
      motivo: 'expirado',
    })
  })

  it('devuelve "expirado" con un token de hace más de 24 h', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const sesion = await crearSesionGestion(EMAIL)

    vi.setSystemTime(new Date('2026-01-02T00:01:00Z'))

    expect(await leerSesionGestion(sesion!.id, sesion!.token)).toEqual({
      ok: false,
      motivo: 'expirado',
    })
  })
})

describe('separación de dominio entre flujos', () => {
  it('un token de ALTA no sirve para abrir una sesión de GESTIÓN', async () => {
    // El escenario real: alguien que recibió un mail de confirmación legítimo intenta usar
    // ese token contra la página de gestión. Los dos son uuid firmados con el mismo secreto;
    // lo único que los separa es el prefijo del sujeto.
    const pendiente = await crearPendiente({
      email: EMAIL,
      nombre: 'Vecina',
      lat: 42.2,
      lng: -8.7,
      disponibilidad: ['caminata'],
    })

    expect(await leerSesionGestion(pendiente!.id, pendiente!.token)).toEqual({
      ok: false,
      motivo: 'invalido',
    })
  })

  it('un token firmado sobre el uuid pelado (forma de admin) tampoco sirve', async () => {
    const sesion = await crearSesionGestion(EMAIL)
    const tokenDeAdmin = generateAdminToken(sesion!.id)

    expect(await leerSesionGestion(sesion!.id, tokenDeAdmin)).toEqual({
      ok: false,
      motivo: 'invalido',
    })
  })
})

describe('cerrarSesionGestion', () => {
  it('deja el enlace inutilizable de inmediato', async () => {
    const sesion = await crearSesionGestion(EMAIL)

    await cerrarSesionGestion(sesion!.id)

    // Se llama tras borrar el perfil: la sesión sobreviviente apuntaría a un email que ya no
    // existe y la página volvería a cargar sin nada que mostrar.
    expect(await leerSesionGestion(sesion!.id, sesion!.token)).toEqual({
      ok: false,
      motivo: 'expirado',
    })
  })
})

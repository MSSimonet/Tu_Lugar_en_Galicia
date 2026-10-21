/**
 * Tests del sobre de mensaje privado (§5.12).
 *
 * Mismo criterio que los otros dos: se mockea Redis, NO se mockean los tokens. El HMAC corre
 * de verdad.
 *
 * Lo que este archivo cuida y los otros no: que un token de mensaje no valga en los otros dos
 * flujos ni al revés. Con tres dominios sobre el mismo primitivo y el mismo secreto, la
 * separación dejó de ser una comparación entre dos y pasó a ser una matriz.
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
    async getdel(clave: string) {
      almacen.llamadas.push(`getdel:${clave}`)
      const v = almacen.datos.get(clave) ?? null
      almacen.datos.delete(clave)
      return v
    }
  },
}))

import { crearMensajePendiente, consumirMensajePendiente, type MensajePendiente } from './mensajes'
import { crearPendiente } from './pendientes'
import { crearSesionGestion, leerSesionGestion } from './gestion'

const MENSAJE: MensajePendiente = {
  destinatarioId: '3f2a91c7-5b8e-4d1a-9f60-7c2e4a8b1d33',
  remitenteNombre: 'Quien Escribe',
  remitenteEmail: 'quien.escribe@ejemplo.test',
  mensaje: 'Hola, acabo de llegar a Vigo y me encantaría tomar un café.',
}

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

describe('crearMensajePendiente', () => {
  it('guarda el mensaje bajo la clave de su dominio', async () => {
    const creado = await crearMensajePendiente(MENSAJE)

    expect(creado).not.toBeNull()
    expect(almacen.datos.get(`comunidad:mensaje:${creado!.id}`)).toEqual(MENSAJE)
  })

  it('devuelve null sin config de Upstash y no escribe nada', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN

    expect(await crearMensajePendiente(MENSAJE)).toBeNull()
    expect(almacen.llamadas).toEqual([])
  })
})

describe('consumirMensajePendiente', () => {
  it('devuelve el mensaje intacto, incluido el email del remitente', async () => {
    const creado = await crearMensajePendiente(MENSAJE)
    const r = await consumirMensajePendiente(creado!.id, creado!.token)

    // El remitenteEmail es lo que va a terminar en el replyTo. Que llegue sin alterarse es
    // la razón de ser de todo el flujo.
    expect(r).toEqual({ ok: true, mensaje: MENSAJE })
  })

  it('no se puede entregar dos veces el mismo mensaje', async () => {
    const creado = await crearMensajePendiente(MENSAJE)

    expect((await consumirMensajePendiente(creado!.id, creado!.token)).ok).toBe(true)
    expect(await consumirMensajePendiente(creado!.id, creado!.token)).toEqual({
      ok: false,
      motivo: 'usado',
    })
  })

  it('rechaza un token manipulado y NO consume el sobre', async () => {
    const creado = await crearMensajePendiente(MENSAJE)
    const manipulado = creado!.token.slice(0, -4) + 'AAAA'

    expect(await consumirMensajePendiente(creado!.id, manipulado)).toEqual({
      ok: false,
      motivo: 'invalido',
    })
    // El intento fallido no puede costarle el mensaje a quien lo escribió.
    expect(almacen.datos.has(`comunidad:mensaje:${creado!.id}`)).toBe(true)
  })

  it('devuelve "expirado" pasadas las 24 h de la firma', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const creado = await crearMensajePendiente(MENSAJE)

    vi.setSystemTime(new Date('2026-01-02T00:01:00Z'))

    expect(await consumirMensajePendiente(creado!.id, creado!.token)).toEqual({
      ok: false,
      motivo: 'expirado',
    })
  })

  it('con firma inválida NO toca Redis', async () => {
    const creado = await crearMensajePendiente(MENSAJE)
    almacen.llamadas.length = 0

    await consumirMensajePendiente(creado!.id, 'token-invalido')

    expect(almacen.llamadas).toEqual([])
  })
})

describe('separación de dominio — la matriz completa', () => {
  it('un token de ALTA no entrega un mensaje', async () => {
    const alta = await crearPendiente({
      email: 'x@ejemplo.test',
      nombre: 'X',
      lat: 42.2,
      lng: -8.7,
      disponibilidad: ['caminata'],
    })

    expect(await consumirMensajePendiente(alta!.id, alta!.token)).toEqual({
      ok: false,
      motivo: 'invalido',
    })
  })

  it('un token de GESTIÓN no entrega un mensaje', async () => {
    const sesion = await crearSesionGestion('x@ejemplo.test')

    expect(await consumirMensajePendiente(sesion!.id, sesion!.token)).toEqual({
      ok: false,
      motivo: 'invalido',
    })
  })

  it('un token de MENSAJE no abre una sesión de gestión', async () => {
    const creado = await crearMensajePendiente(MENSAJE)

    expect(await leerSesionGestion(creado!.id, creado!.token)).toEqual({
      ok: false,
      motivo: 'invalido',
    })
  })
})

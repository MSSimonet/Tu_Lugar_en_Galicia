/**
 * Primer test automatizado del proyecto.
 *
 * QUE PROTEGE Y POR QUE ESTE ARCHIVO PRIMERO:
 * `pendientes.ts` es la pieza que sostiene el fix de seguridad de §5.6 (docs/arranque.md) — el
 * agujero por el que cualquiera podia sobrescribir el perfil de comunidad de otra persona
 * sabiendo su email. Ese fix se verifico a mano el 2026-08-09, contra infraestructura real, y
 * funciono. Pero esa verificacion no era repetible: si alguien toca este modulo, nada avisa que
 * rompio la separacion de dominio o la atomicidad del consumo. Estos tests son esa alarma.
 *
 * QUE SE MOCKEA Y QUE NO — la decision que le da valor al archivo:
 *   - `@upstash/redis` se mockea (un Map en memoria). No queremos red en un test unitario.
 *   - `lib/admin/tokens` NO se mockea. Corre el HMAC-SHA256 de verdad, con un secreto de
 *     prueba. Mockearlo vaciaria el ejercicio: lo que se quiere blindar es justamente que la
 *     firma real rechace lo que tiene que rechazar.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { UpsertPerfilInput } from './perfil'

// El almacen se declara con vi.hoisted porque vi.mock se eleva por encima de los imports:
// sin esto, la fabrica del mock se ejecutaria antes de que exista la constante.
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
    async getdel(clave: string) {
      almacen.llamadas.push(`getdel:${clave}`)
      const valor = almacen.datos.get(clave) ?? null
      almacen.datos.delete(clave)
      return valor
    }
  },
}))

// Importado despues del mock a proposito (vi.mock se eleva igual, pero deja explicito el orden).
import { crearPendiente, consumirPendiente } from './pendientes'
import { generateAdminToken } from '@/lib/admin/tokens'

const PERFIL: UpsertPerfilInput = {
  email: 'alguien@ejemplo.test',
  nombre: 'Alguien',
  lat: 42.2406,
  lng: -8.7207,
  disponibilidad: ['caminata'],
  contacto: '+34 600 000 000',
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

describe('crearPendiente', () => {
  it('devuelve un id uuid y un token, y guarda el perfil bajo la clave del pendiente', async () => {
    const creado = await crearPendiente(PERFIL)

    expect(creado).not.toBeNull()
    expect(creado!.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    expect(creado!.token.length).toBeGreaterThan(0)
    expect(almacen.datos.get(`comunidad:pendiente:${creado!.id}`)).toEqual(PERFIL)
  })

  it('devuelve null si falta la config de Upstash (fail-closed, no escribe nada)', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN

    expect(await crearPendiente(PERFIL)).toBeNull()
    expect(almacen.llamadas).toEqual([])
  })
})

describe('consumirPendiente — camino feliz', () => {
  it('con el token legitimo devuelve el perfil intacto', async () => {
    const creado = await crearPendiente(PERFIL)
    const resultado = await consumirPendiente(creado!.id, creado!.token)

    expect(resultado).toEqual({ ok: true, perfil: PERFIL })
  })

  it.each([true, false, undefined])(
    'transporta mostrarContacto=%s sin alterarlo (opt-in de PII-01)',
    async valor => {
      const creado = await crearPendiente({ ...PERFIL, mostrarContacto: valor })
      const resultado = await consumirPendiente(creado!.id, creado!.token)

      // Este flag decide si el teléfono de una persona se entrega o no. Que llegue al otro
      // lado exactamente como salió es la razón por la que puede viajar desde el cliente: el
      // pendiente solo se aplica tras confirmar el email (§5.6).
      expect(resultado.ok).toBe(true)
      expect(resultado.ok && resultado.perfil.mostrarContacto).toBe(valor)
    },
  )

  it('consume de verdad: el segundo uso del mismo link devuelve "usado"', async () => {
    const creado = await crearPendiente(PERFIL)

    const primero = await consumirPendiente(creado!.id, creado!.token)
    const segundo = await consumirPendiente(creado!.id, creado!.token)

    expect(primero.ok).toBe(true)
    // Si getdel dejara de borrar, este segundo tambien daria ok y dos clics simultaneos en el
    // mismo link del mail dispararian dos altas.
    expect(segundo).toEqual({ ok: false, motivo: 'usado' })
    expect(almacen.datos.size).toBe(0)
  })
})

describe('consumirPendiente — firmas que deben rechazarse', () => {
  it('rechaza un token que no es un token', async () => {
    const creado = await crearPendiente(PERFIL)
    const resultado = await consumirPendiente(creado!.id, 'esto-no-es-un-token')

    expect(resultado).toEqual({ ok: false, motivo: 'invalido' })
  })

  it('rechaza un token legitimo al que se le cambiaron los ultimos caracteres', async () => {
    const creado = await crearPendiente(PERFIL)
    const manipulado = creado!.token.slice(0, -4) + 'AAAA'

    expect(await consumirPendiente(creado!.id, manipulado)).toEqual({
      ok: false,
      motivo: 'invalido',
    })
  })

  it('SEPARACION DE DOMINIO: rechaza un token firmado sobre el uuid pelado', async () => {
    const creado = await crearPendiente(PERFIL)

    // Este es exactamente el token que emitiria el flujo de admin para un recordId igual a
    // este uuid: mismo INTERNAL_API_SECRET, misma funcion, pero sin el prefijo de dominio.
    // Los leads viven en Supabase, asi que sus ids TAMBIEN son uuid — sin el prefijo, los dos
    // universos de tokens serian intercambiables. Si este test se pone verde con `ok: true`,
    // se rompio la separacion.
    const tokenDeOtroDominio = generateAdminToken(creado!.id)

    expect(await consumirPendiente(creado!.id, tokenDeOtroDominio)).toEqual({
      ok: false,
      motivo: 'invalido',
    })
  })

  it('rechaza el token de un pendiente usandolo contra el id de OTRO pendiente', async () => {
    const unoA = await crearPendiente(PERFIL)
    const unoB = await crearPendiente({ ...PERFIL, email: 'otro@ejemplo.test' })

    expect(await consumirPendiente(unoB!.id, unoA!.token)).toEqual({
      ok: false,
      motivo: 'invalido',
    })
    // Y el pendiente de B sigue entero: un intento fallido no consume nada.
    expect(almacen.datos.has(`comunidad:pendiente:${unoB!.id}`)).toBe(true)
  })
})

describe('consumirPendiente — expiracion', () => {
  it('distingue "expirado" de "invalido" pasadas las 24 h', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const creado = await crearPendiente(PERFIL)

    vi.setSystemTime(new Date('2026-01-02T00:01:00Z')) // 24 h + 1 min

    // Importa que sea 'expirado' y no 'invalido': el endpoint muestra mensajes distintos, y
    // "este enlace caduco, pedi otro" es accionable mientras que "no es valido" alarma sin
    // motivo a quien simplemente tardo un dia en abrir el mail.
    expect(await consumirPendiente(creado!.id, creado!.token)).toEqual({
      ok: false,
      motivo: 'expirado',
    })
  })

  it('sigue siendo valido justo antes de las 24 h', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const creado = await crearPendiente(PERFIL)

    vi.setSystemTime(new Date('2026-01-01T23:59:00Z'))

    expect((await consumirPendiente(creado!.id, creado!.token)).ok).toBe(true)
  })
})

describe('consumirPendiente — garantias de orden', () => {
  it('con firma invalida NO toca Redis', async () => {
    const creado = await crearPendiente(PERFIL)
    almacen.llamadas.length = 0

    await consumirPendiente(creado!.id, 'token-invalido')

    // El modulo verifica la firma ANTES de consultar Redis. Si el orden se invirtiera, un id
    // suelto sin token serviria para averiguar si ese pendiente existe.
    expect(almacen.llamadas).toEqual([])
  })

  it('con firma valida pero payload ausente devuelve "usado", no "ok"', async () => {
    const creado = await crearPendiente(PERFIL)
    // Simula que Redis dejo vencer la clave: la firma sigue siendo buena, el dato ya no esta.
    almacen.datos.clear()

    expect(await consumirPendiente(creado!.id, creado!.token)).toEqual({
      ok: false,
      motivo: 'usado',
    })
  })
})

/**
 * Tests del contador de intentos fallidos del login de admin (hallazgo F2).
 *
 * QUE PROTEGE. El contador es el único control de fuerza bruta que NO depende del origen del
 * request, así que es el que sigue en pie ante un ataque distribuido. Si alguien lo toca y
 * rompe la escalada, el techo o el reseteo, nada más avisa.
 *
 * QUE SE MOCKEA. Solo `@upstash/redis`, con un Map en memoria que además modela el TTL, porque
 * la demora escalonada SE EXPRESA como TTL: verificar la escalada es verificar qué `ex` se
 * guardó. El hash de la clave no se mockea — corre el SHA-256 real, que es lo que garantiza
 * que el email no quede escrito en Redis.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

const almacen = vi.hoisted(() => ({
  datos: new Map<string, { valor: unknown; ex?: number }>(),
}))

vi.mock('@upstash/redis', () => ({
  Redis: class FakeRedis {
    static fromEnv() {
      return new FakeRedis()
    }
    async incr(clave: string) {
      const previo = almacen.datos.get(clave)
      const actual = Number(previo?.valor ?? 0) + 1
      almacen.datos.set(clave, { valor: actual, ex: previo?.ex })
      return actual
    }
    async expire(clave: string, segundos: number) {
      const previo = almacen.datos.get(clave)
      if (!previo) return 0
      almacen.datos.set(clave, { ...previo, ex: segundos })
      return 1
    }
    async set(clave: string, valor: unknown, opciones?: { ex?: number }) {
      almacen.datos.set(clave, { valor, ex: opciones?.ex })
      return 'OK'
    }
    async ttl(clave: string) {
      const entrada = almacen.datos.get(clave)
      if (!entrada) return -2
      return entrada.ex ?? -1
    }
    async del(...claves: string[]) {
      let borradas = 0
      for (const clave of claves) if (almacen.datos.delete(clave)) borradas += 1
      return borradas
    }
  },
}))

import {
  segundosDeBloqueo,
  registrarFalloDeLogin,
  limpiarFallosDeLogin,
} from './loginAttempts'

const EMAIL = 'silvana@ejemplo.test'

function clavesGuardadas(): string[] {
  return [...almacen.datos.keys()]
}

async function fallar(veces: number): Promise<void> {
  for (let i = 0; i < veces; i += 1) await registrarFalloDeLogin(EMAIL)
}

beforeEach(() => {
  almacen.datos.clear()
  process.env.UPSTASH_REDIS_REST_URL = 'https://fake.upstash.io'
  process.env.UPSTASH_REDIS_REST_TOKEN = 'token-de-prueba'
})

describe('contador de intentos fallidos del login', () => {
  it('no bloquea mientras los fallos estén por debajo del umbral', async () => {
    // Arrange
    await fallar(4)

    // Act
    const espera = await segundosDeBloqueo(EMAIL)

    // Assert
    expect(espera).toBe(0)
  })

  it('bloquea un minuto al alcanzar el quinto fallo', async () => {
    // Arrange
    await fallar(5)

    // Act
    const espera = await segundosDeBloqueo(EMAIL)

    // Assert
    expect(espera).toBe(60)
  })

  it('duplica la demora con cada fallo posterior', async () => {
    // Arrange
    await fallar(6)

    // Act
    const espera = await segundosDeBloqueo(EMAIL)

    // Assert
    expect(espera).toBe(120)
  })

  it('topea la demora en quince minutos para no dejar la cuenta inutilizable', async () => {
    // Arrange
    await fallar(12)

    // Act
    const espera = await segundosDeBloqueo(EMAIL)

    // Assert
    expect(espera).toBe(15 * 60)
  })

  it('le pone TTL al contador para que un error de tipeo se olvide solo', async () => {
    // Arrange
    await fallar(1)

    // Act
    const contador = [...almacen.datos.entries()].find(([clave]) =>
      clave.startsWith('login-fallos:'),
    )

    // Assert
    expect(contador?.[1].ex).toBe(15 * 60)
  })

  it('limpia contador y bloqueo tras un login exitoso', async () => {
    // Arrange
    await fallar(6)
    expect(await segundosDeBloqueo(EMAIL)).toBeGreaterThan(0)

    // Act
    await limpiarFallosDeLogin(EMAIL)

    // Assert
    expect(await segundosDeBloqueo(EMAIL)).toBe(0)
    expect(clavesGuardadas()).toHaveLength(0)
  })

  it('nunca escribe el email en Redis: la clave es un hash', async () => {
    // Arrange
    await fallar(5)

    // Act
    const claves = clavesGuardadas()

    // Assert
    expect(claves.length).toBeGreaterThan(0)
    for (const clave of claves) {
      expect(clave).not.toContain(EMAIL)
      expect(clave).not.toContain('silvana')
    }
  })

  it('falla cerrado si Upstash no está configurado', async () => {
    // Arrange
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN

    // Act + Assert
    await expect(segundosDeBloqueo(EMAIL)).rejects.toThrow()
    await expect(registrarFalloDeLogin(EMAIL)).rejects.toThrow()
  })
})

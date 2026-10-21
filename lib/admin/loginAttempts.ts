import { createHash } from 'crypto'
import { Redis } from '@upstash/redis'

/**
 * Límite de intentos fallidos propio del login de admin (hallazgo F2, auditoría 2026-08-17).
 *
 * QUE AGREGA SOBRE EL RATE LIMITER QUE YA HABIA. El de `app/api/auth/[...nextauth]/route.ts`
 * es genérico y se apoya en el IP del request. Aunque esa clave ahora sea confiable en Vercel
 * (ver `lib/utils/ip.ts`), sigue siendo un límite POR ORIGEN: un atacante con muchas IPs lo
 * diluye. Este contador es POR CUENTA y no depende de nada derivado de la red, así que un
 * ataque distribuido igual choca contra él. Son dos controles distintos a propósito, no una
 * duplicación.
 *
 * DEMORA ESCALONADA, NO BLOQUEO DURO. El panel tiene una sola cuenta: un bloqueo permanente
 * le regalaría a cualquiera una denegación de servicio trivial contra la propia Silvana. Por
 * eso el bloqueo vence solo, empieza en 1 minuto y se duplica con cada fallo extra hasta un
 * techo de 15. Además el contador de fallos tiene su propio TTL, así que quien se equivocó
 * tipeando vuelve a cero al rato sin que nadie intervenga.
 *
 * MIENTRAS ESTA BLOQUEADO NO SE INCREMENTA NADA. Si martillar el login extendiera el bloqueo,
 * un atacante podría dejar a la operadora afuera para siempre. Estando bloqueado se rechaza y
 * se sale, sin tocar el contador.
 *
 * NO SE GUARDA EL EMAIL. La clave es un hash del email, no el email: la regla del proyecto es
 * que ningún dato personal termine en logs ni en almacenes auxiliares.
 *
 * FAIL-CLOSED. Si Upstash no está configurado, estas funciones lanzan y `authorize` no
 * autentica a nadie. Es el mismo trade-off ya elegido en el route handler (A03): antes una
 * caída del panel interno que perder el límite justo cuando un atacante pudo haberla causado.
 */

/** Fallos tolerados antes de que empiece a haber demora. */
const MAX_FALLOS = 5
/** Si no hay fallos nuevos en esta ventana, el contador se olvida solo. */
const VENTANA_FALLOS_SEGUNDOS = 15 * 60
/** Primera demora, una vez superados los MAX_FALLOS. Se duplica con cada fallo extra. */
const BLOQUEO_BASE_SEGUNDOS = 60
/** Techo de la demora, para que un ataque no deje la cuenta inutilizable. */
const BLOQUEO_MAX_SEGUNDOS = 15 * 60

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  return Redis.fromEnv()
}

function redisObligatorio(): Redis {
  const redis = getRedis()
  if (!redis) throw new Error('UPSTASH_REDIS_REST_URL/TOKEN no configurados')
  return redis
}

function claves(email: string): { fallos: string; bloqueo: string } {
  const id = createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 32)
  return { fallos: `login-fallos:${id}`, bloqueo: `login-bloqueo:${id}` }
}

/**
 * Segundos que faltan para que se levante el bloqueo de esta cuenta.
 * Devuelve 0 si no está bloqueada. Lanza si Upstash no está disponible (fail-closed).
 */
export async function segundosDeBloqueo(email: string): Promise<number> {
  const redis = redisObligatorio()
  const ttl = await redis.ttl(claves(email).bloqueo)
  return typeof ttl === 'number' && ttl > 0 ? ttl : 0
}

/**
 * Registra un intento fallido y, si ya se pasó el umbral, abre o extiende la demora.
 * Lanza si Upstash no está disponible (fail-closed).
 */
export async function registrarFalloDeLogin(email: string): Promise<void> {
  const redis = redisObligatorio()
  const { fallos, bloqueo } = claves(email)

  const total = await redis.incr(fallos)
  if (total === 1) {
    await redis.expire(fallos, VENTANA_FALLOS_SEGUNDOS)
  }

  if (total >= MAX_FALLOS) {
    const excedente = total - MAX_FALLOS
    const espera = Math.min(BLOQUEO_BASE_SEGUNDOS * 2 ** excedente, BLOQUEO_MAX_SEGUNDOS)
    await redis.set(bloqueo, '1', { ex: espera })
  }
}

/** Borra contador y bloqueo tras un login exitoso. */
export async function limpiarFallosDeLogin(email: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  const { fallos, bloqueo } = claves(email)
  await redis.del(fallos, bloqueo)
}

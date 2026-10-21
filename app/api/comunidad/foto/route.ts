import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { randomUUID } from 'crypto'
import { getRealIp } from '@/lib/utils/ip'
import { getSupabaseServerClient } from '@/lib/supabase/serverClient'
import { sanearImagen } from '@/lib/comunidad/imagenSegura'

/**
 * Subida de la foto de perfil de Comunidad (B2).
 *
 * El formulario llama a este endpoint cuando la persona elige un archivo, y con la URL que
 * devuelve arma el `fotoUrl` del alta. Está separado de /api/comunidad/registro a propósito:
 * son dos operaciones de coste muy distinto (una escribe unos bytes en Redis, la otra sube
 * megabytes a Storage) y necesitan límites distintos.
 *
 * ORDEN DE LAS COMPROBACIONES — importa: primero origen, después rate limit, después TAMAÑO, y
 * recién al final se leen los bytes. Leer el archivo entero en memoria antes de saber si el
 * envío está permitido convierte este endpoint en la forma más barata de consumirle la RAM al
 * servidor a cualquiera.
 */

export const runtime = 'nodejs'

const MAX_BYTES = 4 * 1024 * 1024 // 4 MiB — una foto de móvil sin recortar entra cómoda.
const BUCKET = 'comunidad-fotos'

const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        // Más estricto que el alta (5 cada 10 min): subir es caro y nadie necesita más de un
        // puñado de intentos para elegir una foto.
        limiter: Ratelimit.slidingWindow(6, '10 m'),
        analytics: false,
        prefix: 'ratelimit:comunidad-foto',
      })
    : null

export async function POST(req: NextRequest) {
  // 1. Verificación de origen — mismo patrón fail-closed que el resto de los endpoints.
  const origin = req.headers.get('origin')
  const allowedOrigins = [
    'https://tu-lugar-en-galicia.vercel.app',
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
    process.env.NODE_ENV === 'development' && 'http://localhost:3000',
  ].filter((x): x is string => Boolean(x))

  if (!origin || !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 })
  }

  // 2. Rate limiting (fail-closed).
  if (!ratelimit) {
    console.error('[comunidad/foto] ratelimit no configurado — faltan variables de Upstash')
    return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 })
  }
  const { success } = await ratelimit.limit(getRealIp(req))
  if (!success) {
    return NextResponse.json({ error: 'Demasiadas subidas. Inténtalo más tarde.' }, { status: 429 })
  }

  // 3. Tamaño declarado, antes de tocar el cuerpo. Es un filtro barato contra el caso obvio;
  //    el de verdad es el del paso 5, que mide los bytes que llegaron.
  const declarado = Number(req.headers.get('content-length') ?? '0')
  if (declarado > MAX_BYTES * 1.1) {
    return NextResponse.json({ error: 'La imagen supera los 4 MB.' }, { status: 413 })
  }

  // 4. Extraer el archivo del multipart.
  let archivo: File | null = null
  try {
    const form = await req.formData()
    const valor = form.get('foto')
    archivo = valor instanceof File ? valor : null
  } catch {
    return NextResponse.json({ error: 'No pudimos leer el archivo.' }, { status: 400 })
  }
  if (!archivo) {
    return NextResponse.json({ error: 'No llegó ninguna imagen.' }, { status: 400 })
  }

  const bytes = new Uint8Array(await archivo.arrayBuffer())
  if (bytes.length === 0) {
    return NextResponse.json({ error: 'El archivo está vacío.' }, { status: 400 })
  }
  // 5. El tamaño real. No se confía en el content-length del paso 3, que lo escribe el cliente.
  if (bytes.length > MAX_BYTES) {
    return NextResponse.json({ error: 'La imagen supera los 4 MB.' }, { status: 413 })
  }

  // 6. Qué es y qué trae adentro. Ni `archivo.type` ni `archivo.name` participan de esta
  //    decisión: los dos los elige el cliente. Ver lib/comunidad/imagenSegura.ts.
  const saneada = sanearImagen(bytes)
  if (!saneada.ok) {
    return NextResponse.json(
      {
        error:
          saneada.motivo === 'formato'
            ? 'Solo aceptamos imágenes JPG, PNG o WebP.'
            : 'No pudimos leer esa imagen. Prueba con otra.',
      },
      { status: 415 },
    )
  }

  // 7. Guardar. El nombre lo pone el servidor y es un UUID: el del cliente podría traer rutas
  //    ("../"), caracteres de control o el nombre real de la persona, y ninguna de las tres
  //    cosas tiene por qué terminar en una URL pública.
  const ruta = `${randomUUID()}.${saneada.extension}`
  try {
    const supabase = getSupabaseServerClient()
    const { error } = await supabase.storage.from(BUCKET).upload(ruta, saneada.bytes, {
      contentType: saneada.formato,
      // Sin upsert: cada subida es un objeto nuevo. Con un UUID por nombre no hay colisión
      // posible, así que un upsert solo podría servir para pisar algo por accidente.
      upsert: false,
      cacheControl: '31536000',
    })
    if (error) throw new Error(error.message)

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(ruta)
    return NextResponse.json({ url: data.publicUrl })
  } catch (err) {
    // Sin volcar el error crudo: los mensajes de Storage pueden arrastrar la ruta y la
    // configuración del proyecto (regla A02 de CLAUDE.md).
    console.error(
      `[comunidad/foto] Storage falló — ts: ${new Date().toISOString()}, motivo: ${
        err instanceof Error ? err.message.slice(0, 120) : 'desconocido'
      }`,
    )
    return NextResponse.json({ error: 'No pudimos guardar la imagen. Intenta de nuevo.' }, { status: 500 })
  }
}

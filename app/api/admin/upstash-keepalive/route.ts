/**
 * app/api/admin/upstash-keepalive/route.ts
 *
 * Escribe una clave efimera en Upstash Redis para evitar que la base de datos
 * sea eliminada por inactividad (free tier: 30 dias sin actividad → auto-delete).
 * Llamado semanalmente por .github/workflows/upstash-keepalive.yml.
 *
 * Auth: Bearer INTERNAL_API_SECRET (mismo patron que recordatorio-silvana).
 * No requiere secretos nuevos.
 */

import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { isAuthorized } from '@/lib/admin/auth'

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const url  = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    return NextResponse.json({ error: 'Upstash no configurado' }, { status: 503 })
  }

  const redis = new Redis({ url, token })
  await redis.set('keepalive:ping', new Date().toISOString(), { ex: 7 * 24 * 60 * 60 })

  return NextResponse.json({ ok: true, ts: new Date().toISOString() })
}

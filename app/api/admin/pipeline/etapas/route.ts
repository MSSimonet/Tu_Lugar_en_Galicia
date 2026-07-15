/**
 * app/api/admin/pipeline/etapas/route.ts — Crea una etapa nueva del Kanban de pipeline.
 *
 * Auth: sesión de NextAuth (auth() de @/auth), mismo patrón exacto que
 * app/api/admin/leads/[id]/notas/route.ts. Sin rate limiting de Upstash a propósito:
 * panel interno de un solo usuario autenticado.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { crearEtapa } from '@/lib/admin/pipelineRepo'
import { ValidationError } from '@/lib/admin/errors'

const NOMBRE_MAX_LENGTH = 60

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la petición inválido' }, { status: 400 })
  }

  const { nombre, color } = body

  if (typeof nombre !== 'string' || nombre.trim() === '') {
    return NextResponse.json({ error: 'Campo requerido: nombre' }, { status: 400 })
  }
  if (nombre.length > NOMBRE_MAX_LENGTH) {
    return NextResponse.json(
      { error: `nombre supera el máximo de ${NOMBRE_MAX_LENGTH} caracteres` },
      { status: 400 },
    )
  }
  if (color !== undefined && typeof color !== 'string') {
    return NextResponse.json({ error: 'Campo inválido: color' }, { status: 400 })
  }

  try {
    const etapa = await crearEtapa(nombre, color)
    return NextResponse.json({ data: etapa }, { status: 201 })
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error(
      '[api/admin/pipeline/etapas] Error al crear etapa —',
      new Date().toISOString(),
      err instanceof Error ? err.name : 'unknown',
    )
    return NextResponse.json({ error: 'Error al crear la etapa' }, { status: 500 })
  }
}

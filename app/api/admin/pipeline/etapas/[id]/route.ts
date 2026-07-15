/**
 * app/api/admin/pipeline/etapas/[id]/route.ts — Renombra una etapa existente del Kanban de
 * pipeline. Mismo criterio de auth que app/api/admin/leads/[id]/notas/route.ts: sesión de
 * NextAuth, sin rate limiting (panel interno de un solo usuario autenticado).
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { renombrarEtapa } from '@/lib/admin/pipelineRepo'
import { ValidationError } from '@/lib/admin/errors'
import { isValidUuid } from '@/lib/utils/validation'

const NOMBRE_MAX_LENGTH = 60

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id: etapaId } = await params
  if (!etapaId || !isValidUuid(etapaId)) {
    return NextResponse.json({ error: 'ID de etapa inválido' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la petición inválido' }, { status: 400 })
  }

  const { nombre } = body

  if (typeof nombre !== 'string' || nombre.trim() === '') {
    return NextResponse.json({ error: 'Campo requerido: nombre' }, { status: 400 })
  }
  if (nombre.length > NOMBRE_MAX_LENGTH) {
    return NextResponse.json(
      { error: `nombre supera el máximo de ${NOMBRE_MAX_LENGTH} caracteres` },
      { status: 400 },
    )
  }

  try {
    await renombrarEtapa(etapaId, nombre)
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error(
      '[api/admin/pipeline/etapas/id] Error al renombrar etapa —',
      new Date().toISOString(),
      err instanceof Error ? err.name : 'unknown',
    )
    return NextResponse.json({ error: 'Error al renombrar la etapa' }, { status: 500 })
  }
}

/**
 * app/api/admin/leads/[id]/etapa/route.ts — Mueve un lead a otra etapa del Kanban
 * (drag-and-drop). Mismo criterio de auth que app/api/admin/leads/[id]/notas/route.ts:
 * sesión de NextAuth, sin rate limiting (panel interno de un solo usuario autenticado).
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { moverLeadDeEtapa } from '@/lib/admin/pipelineRepo'
import { ValidationError } from '@/lib/admin/errors'
import { isValidUuid } from '@/lib/utils/validation'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id: leadId } = await params
  if (!leadId || !isValidUuid(leadId)) {
    return NextResponse.json({ error: 'ID de lead inválido' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la petición inválido' }, { status: 400 })
  }

  const { etapaId } = body

  if (typeof etapaId !== 'string' || !isValidUuid(etapaId)) {
    return NextResponse.json({ error: 'Campo inválido: etapaId' }, { status: 400 })
  }

  try {
    await moverLeadDeEtapa(leadId, etapaId, session.user?.email ?? 'admin')
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error(
      '[api/admin/leads/etapa] Error al mover lead de etapa —',
      new Date().toISOString(),
      err instanceof Error ? err.name : 'unknown',
    )
    return NextResponse.json({ error: 'Error al mover el lead de etapa' }, { status: 500 })
  }
}

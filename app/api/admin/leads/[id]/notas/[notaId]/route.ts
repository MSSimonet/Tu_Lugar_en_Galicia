/**
 * app/api/admin/leads/[id]/notas/[notaId]/route.ts — Marca una nota/tarea existente como
 * completada. Mismo criterio de auth que app/api/admin/leads/[id]/notas/route.ts: sesión
 * de NextAuth, sin rate limiting (panel interno de un solo usuario autenticado).
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { marcarCompletada } from '@/lib/admin/notasTareasRepo'
import { isValidUuid } from '@/lib/utils/validation'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; notaId: string }> },
): Promise<NextResponse> {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id: leadId, notaId } = await params
  if (!leadId || !isValidUuid(leadId)) {
    return NextResponse.json({ error: 'ID de lead inválido' }, { status: 400 })
  }
  if (!notaId || !isValidUuid(notaId)) {
    return NextResponse.json({ error: 'ID de nota inválido' }, { status: 400 })
  }

  try {
    await marcarCompletada(notaId)
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('[api/admin/leads/notas/notaId] Error al completar nota —', new Date().toISOString(), err instanceof Error ? err.name : 'unknown')
    return NextResponse.json({ error: 'Error al actualizar la nota' }, { status: 500 })
  }
}

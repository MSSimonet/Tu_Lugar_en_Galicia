/**
 * app/api/admin/leads/[id]/route.ts — Borrado de un lead (derecho al olvido RGPD).
 * Mismo criterio de auth que etapa/route.ts y notas/route.ts: sesión de NextAuth,
 * sin rate limiting (panel interno de un solo usuario autenticado).
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { deleteRecord } from '@/lib/admin/leadsRepo'
import { isValidUuid } from '@/lib/utils/validation'

export async function DELETE(
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

  try {
    await deleteRecord(leadId)
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error(
      '[api/admin/leads/[id]] Error al borrar lead —',
      new Date().toISOString(),
      err instanceof Error ? err.name : 'unknown',
    )
    return NextResponse.json({ error: 'Error al borrar el lead' }, { status: 500 })
  }
}

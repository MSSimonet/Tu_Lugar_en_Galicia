import { NextRequest, NextResponse } from 'next/server'
import { isAuthorized } from '@/lib/admin/auth'
import { getLeadsConCodigoActivo, patchRecord } from '@/lib/admin/airtable'

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let vencidos
  try {
    vencidos = await getLeadsConCodigoActivo()
  } catch (err) {
    console.error('[expirar-codigos] Airtable error:', err)
    return NextResponse.json({ error: 'Error consultando Airtable' }, { status: 500 })
  }

  const resultados = await Promise.allSettled(
    vencidos.map(r => patchRecord(r.id, { codigoAgenda: 'expirado' }))
  )

  const fallidos = resultados.filter(r => r.status === 'rejected')
  if (fallidos.length > 0) {
    fallidos.forEach((r, i) =>
      console.error(`[expirar-codigos] PATCH fallido ${vencidos[i]?.id}:`, (r as PromiseRejectedResult).reason)
    )
  }

  const expirados = resultados.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ ok: true, expirados })
}

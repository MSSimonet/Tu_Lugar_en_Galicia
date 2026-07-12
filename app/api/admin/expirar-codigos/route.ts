import { NextRequest, NextResponse } from 'next/server'
import { isAuthorized } from '@/lib/admin/auth'
import { getLeadsConCodigoActivo, patchRecord } from '@/lib/admin/leadsRepo'

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let vencidos
  try {
    vencidos = await getLeadsConCodigoActivo()
  } catch (err) {
    console.error(`[expirar-codigos] Supabase error — ts: ${new Date().toISOString()}`, err instanceof Error ? err.name : 'unknown')
    return NextResponse.json({ error: 'Error consultando la base de datos' }, { status: 500 })
  }

  const resultados = await Promise.allSettled(
    vencidos.map(r => patchRecord(r.id, { codigoAgenda: 'expirado' }))
  )

  const fallidos = resultados.filter(r => r.status === 'rejected')
  if (fallidos.length > 0) {
    fallidos.forEach((r, i) => {
      const reason = (r as PromiseRejectedResult).reason
      console.error(`[expirar-codigos] update fallido — recordId: ${vencidos[i]?.id}, ts: ${new Date().toISOString()}`, reason instanceof Error ? reason.name : 'unknown')
    })
  }

  const expirados = resultados.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ ok: true, expirados })
}

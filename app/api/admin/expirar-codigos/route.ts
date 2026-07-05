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
    const status = err instanceof Error ? err.message.match(/Airtable list (\d+)/)?.[1] : undefined
    console.error(`[expirar-codigos] Airtable error — status: ${status ?? 'desconocido'}, ts: ${new Date().toISOString()}`)
    return NextResponse.json({ error: 'Error consultando Airtable' }, { status: 500 })
  }

  const resultados = await Promise.allSettled(
    vencidos.map(r => patchRecord(r.id, { codigoAgenda: 'expirado' }))
  )

  const fallidos = resultados.filter(r => r.status === 'rejected')
  if (fallidos.length > 0) {
    fallidos.forEach((r, i) => {
      const reason = (r as PromiseRejectedResult).reason
      const status = reason instanceof Error ? reason.message.match(/^Airtable PATCH (\d+)/)?.[1] : undefined
      console.error(`[expirar-codigos] PATCH fallido — recordId: ${vencidos[i]?.id}, status: ${status ?? 'desconocido'}, ts: ${new Date().toISOString()}`)
    })
  }

  const expirados = resultados.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ ok: true, expirados })
}

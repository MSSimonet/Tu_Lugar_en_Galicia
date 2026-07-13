/**
 * app/api/admin/leads/[id]/notas/route.ts — Crea una nota o tarea manual en la ficha 360°
 * de un lead.
 *
 * Auth: sesión de NextAuth (auth() de @/auth) — este endpoint lo llama el panel /admin
 * desde el navegador de Silvana, ya autenticado por middleware.ts en /admin/*. NO usa el
 * patrón Bearer de lib/admin/auth.ts (ese es para cron/servidor-a-servidor). Sin rate
 * limiting de Upstash a propósito: está detrás de sesión de un único usuario interno, no
 * es un endpoint público.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { crearNota } from '@/lib/admin/notasTareasRepo'
import { isValidUuid } from '@/lib/utils/validation'

const CONTENIDO_MAX_LENGTH = 2000
const TIPOS_VALIDOS = ['nota', 'tarea'] as const

export async function POST(
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

  const { tipo, contenido, fechaVencimiento } = body

  if (typeof tipo !== 'string' || !TIPOS_VALIDOS.includes(tipo as (typeof TIPOS_VALIDOS)[number])) {
    return NextResponse.json({ error: "Campo inválido: tipo debe ser 'nota' o 'tarea'" }, { status: 400 })
  }

  if (typeof contenido !== 'string' || contenido.trim() === '') {
    return NextResponse.json({ error: 'Campo requerido: contenido' }, { status: 400 })
  }
  if (contenido.length > CONTENIDO_MAX_LENGTH) {
    return NextResponse.json(
      { error: `contenido supera el máximo de ${CONTENIDO_MAX_LENGTH} caracteres` },
      { status: 400 },
    )
  }

  if (fechaVencimiento !== undefined && typeof fechaVencimiento !== 'string') {
    return NextResponse.json({ error: 'Campo inválido: fechaVencimiento' }, { status: 400 })
  }
  if (typeof fechaVencimiento === 'string' && isNaN(new Date(fechaVencimiento).getTime())) {
    return NextResponse.json({ error: 'Campo inválido: fechaVencimiento no es una fecha válida' }, { status: 400 })
  }

  try {
    const nota = await crearNota(leadId, {
      tipo: tipo as 'nota' | 'tarea',
      contenido: contenido.trim(),
      autor: session.user?.email ?? undefined,
      fechaVencimiento,
    })
    return NextResponse.json({ data: nota }, { status: 201 })
  } catch (err) {
    console.error('[api/admin/leads/notas] Error al crear nota —', new Date().toISOString(), err instanceof Error ? err.name : 'unknown')
    return NextResponse.json({ error: 'Error al guardar la nota' }, { status: 500 })
  }
}

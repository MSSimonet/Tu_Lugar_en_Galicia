/**
 * app/api/admin/campos-custom/route.ts — Crea una nueva definición de campo custom
 * (metadata que gobierna qué claves son válidas en leads.campos_custom). Mismo criterio de
 * auth que app/api/admin/leads/[id]/notas/route.ts: sesión de NextAuth, sin rate limiting
 * (panel interno de un solo usuario autenticado).
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { crearDefinicionCampoCustom, type TipoCampoCustom } from '@/lib/admin/camposCustomRepo'
import { ValidationError } from '@/lib/admin/errors'

const TIPOS_VALIDOS = ['text', 'number', 'boolean', 'date', 'select', 'multiselect'] as const

function esArrayDeStrings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

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

  const { clave, etiqueta, tipo, opciones } = body

  if (typeof clave !== 'string' || clave.trim() === '') {
    return NextResponse.json({ error: 'Campo requerido: clave' }, { status: 400 })
  }
  if (typeof etiqueta !== 'string' || etiqueta.trim() === '') {
    return NextResponse.json({ error: 'Campo requerido: etiqueta' }, { status: 400 })
  }
  if (typeof tipo !== 'string' || !TIPOS_VALIDOS.includes(tipo as (typeof TIPOS_VALIDOS)[number])) {
    return NextResponse.json(
      { error: `Campo inválido: tipo debe ser uno de ${TIPOS_VALIDOS.join(', ')}` },
      { status: 400 },
    )
  }
  if (opciones !== undefined && !esArrayDeStrings(opciones)) {
    return NextResponse.json({ error: 'Campo inválido: opciones debe ser un array de strings' }, { status: 400 })
  }

  try {
    const definicion = await crearDefinicionCampoCustom({
      clave,
      etiqueta,
      tipo: tipo as TipoCampoCustom,
      opciones,
    })
    return NextResponse.json({ data: definicion }, { status: 201 })
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error(
      '[api/admin/campos-custom] Error al crear definición —',
      new Date().toISOString(),
      err instanceof Error ? err.name : 'unknown',
    )
    return NextResponse.json({ error: 'Error al crear el campo custom' }, { status: 500 })
  }
}

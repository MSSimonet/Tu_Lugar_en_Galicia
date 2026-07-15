/**
 * app/api/admin/leads/[id]/campos-custom/route.ts — Escribe el valor de un campo custom de
 * un lead (leads.campos_custom, jsonb). Mismo criterio de auth que
 * app/api/admin/leads/[id]/notas/route.ts: sesión de NextAuth, sin rate limiting (panel
 * interno de un solo usuario autenticado).
 *
 * `clave` debe matchear una definición ACTIVA de campos_custom_definiciones — no se
 * aceptan claves arbitrarias, para que el jsonb no se llene de datos no gobernados (ver
 * comentario de lib/leads.ts sobre campos_custom). También se valida que `valor` tenga el
 * tipo esperado según la definición (mismo principio de "validar en el borde del sistema").
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { listarDefinicionesCamposCustom, type CampoCustomDefinicion } from '@/lib/admin/camposCustomRepo'
import { patchRecord } from '@/lib/admin/leadsRepo'
import { isValidUuid } from '@/lib/utils/validation'

/** Valida que `valor` tenga la forma esperada para el `tipo` de la definición. */
function valorValidoParaTipo(valor: unknown, definicion: CampoCustomDefinicion): boolean {
  switch (definicion.tipo) {
    case 'text':
    case 'date':
      return typeof valor === 'string'
    case 'number':
      return typeof valor === 'number' && !Number.isNaN(valor)
    case 'boolean':
      return typeof valor === 'boolean'
    case 'select':
      // '' es el valor de la opción "— Sin definir —" del <select> (CampoCustomEditor.tsx) —
      // válido como forma de "vaciar" el campo, no una opción real a validar contra `opciones`.
      return typeof valor === 'string' && (valor === '' || (definicion.opciones ?? []).includes(valor))
    case 'multiselect':
      return (
        Array.isArray(valor) &&
        valor.every((item) => typeof item === 'string' && (definicion.opciones ?? []).includes(item))
      )
    default:
      return false
  }
}

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

  const { clave, valor } = body

  if (typeof clave !== 'string' || clave.trim() === '') {
    return NextResponse.json({ error: 'Campo requerido: clave' }, { status: 400 })
  }
  if (valor === undefined) {
    return NextResponse.json({ error: 'Campo requerido: valor' }, { status: 400 })
  }

  try {
    const definiciones = await listarDefinicionesCamposCustom(true)
    const definicion = definiciones.find((def) => def.clave === clave)
    if (!definicion) {
      return NextResponse.json(
        { error: `clave "${clave}" no corresponde a ningún campo custom activo` },
        { status: 400 },
      )
    }
    if (!valorValidoParaTipo(valor, definicion)) {
      return NextResponse.json(
        { error: `valor inválido para el campo "${clave}" (tipo esperado: ${definicion.tipo})` },
        { status: 400 },
      )
    }

    await patchRecord(leadId, { [clave]: valor })
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error(
      '[api/admin/leads/campos-custom] Error al guardar campo custom —',
      new Date().toISOString(),
      err instanceof Error ? err.name : 'unknown',
    )
    return NextResponse.json({ error: 'Error al guardar el campo custom' }, { status: 500 })
  }
}

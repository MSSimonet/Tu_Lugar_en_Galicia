import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/admin/tokens'
import { generateAgendaCode } from '@/lib/admin/codes'
import { getRecord, patchRecord } from '@/lib/admin/airtable'
import { sendEmail, buildAgendaEmail } from '@/lib/admin/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ recordId: string }> },
): Promise<NextResponse> {
  const { recordId } = await params

  if (!recordId || !/^rec[a-zA-Z0-9]{14}$/.test(recordId)) {
    return NextResponse.json({ error: 'ID de registro inválido' }, { status: 400 })
  }

  // Auth — token en query string (email link) o en body (botón del perfil)
  let token = request.nextUrl.searchParams.get('token')
  if (!token) {
    try {
      const body = (await request.json()) as { token?: unknown }
      token = typeof body?.token === 'string' ? body.token : null
    } catch {
      // body vacío o no JSON — token queda null
    }
  }

  if (!token) {
    return NextResponse.json({ error: 'Token requerido' }, { status: 401 })
  }

  try {
    verifyAdminToken(recordId, token)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Token inválido' },
      { status: 401 },
    )
  }

  // Leer el registro en Airtable
  let fields: Record<string, unknown>
  try {
    fields = await getRecord(recordId)
  } catch {
    return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
  }

  const nombre = typeof fields.nombreCompleto === 'string' ? fields.nombreCompleto : ''
  const email  = typeof fields.email === 'string' ? fields.email : ''

  if (!email) {
    return NextResponse.json({ error: 'El lead no tiene email registrado' }, { status: 422 })
  }

  // Verificar que no tenga ya un código activo
  const codigoExistente = fields.codigoAgenda as string | undefined
  if (codigoExistente && codigoExistente !== 'expirado') {
    return NextResponse.json(
      { error: 'Este lead ya tiene un código de agenda activo' },
      { status: 409 },
    )
  }

  // Generar código + guardar en Airtable
  const codigo = generateAgendaCode()
  const fechaHabilitacion = new Date().toISOString()

  try {
    await patchRecord(recordId, { codigoAgenda: codigo, fechaHabilitacion })
  } catch (err) {
    console.error('[habilitar-agenda] Airtable PATCH fallido —', new Date().toISOString(), err)
    return NextResponse.json({ error: 'Error al guardar el código en Airtable' }, { status: 500 })
  }

  // Enviar mail cálido al cliente
  const silvanaEmail = process.env.SILVANA_EMAIL
  try {
    await sendEmail({
      to: email,
      subject: `Tu cita con Tu Lugar en Galicia está lista, ${nombre.split(' ')[0]}`,
      html: buildAgendaEmail(nombre, codigo),
      replyTo: silvanaEmail || undefined,
    })
  } catch (err) {
    // El código ya está guardado — no revertimos; avisamos para reenvío manual
    console.error('[habilitar-agenda] Resend fallido —', new Date().toISOString(), err)
    return NextResponse.json(
      { ok: true, warning: 'Código generado pero el mail no pudo enviarse. Reenviar manualmente.' },
      { status: 200 },
    )
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}

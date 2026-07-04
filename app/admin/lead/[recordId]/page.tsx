import type { Metadata } from 'next'
import { verifyAdminToken } from '@/lib/admin/tokens'
import { getRecord } from '@/lib/admin/airtable'
import { HabilitarAgendaButton } from '@/components/admin/HabilitarAgendaButton'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

// ── Etiquetas legibles para cada campo de Airtable ──────────────────────────
const LABELS: Record<string, string> = {
  paisResidencia:      'País de residencia',
  ciudadActual:        'Ciudad actual',
  ciudadDestino:       'Ciudad de destino',
  telefono:            'Teléfono',
  adultos:             'Adultos',
  ninos:               'Niños',
  adolescentes:        'Adolescentes',
  mascotas:            'Mascotas',
  mascotaTipo:         'Tipo de mascota',
  documentacion:       'Documentación',
  situacionLaboral:    'Situación laboral',
  ingresosMensuales:   'Ingresos mensuales',
  garantias:           'Garantías',
  cuentaBancaria:      'Cuenta bancaria en España',
  comprendeHonorarios: 'Comprende honorarios',
  tipoLicencia:        'Tipo de licencia',
  nivelEstudios:       'Nivel de estudios',
  profesion:           'Profesión',
  tipoInmueble:        'Tipo de inmueble',
  habitacionesMinimas: 'Habitaciones mínimas',
  presupuestoMensual:  'Presupuesto mensual',
  amueblado:           'Amueblado',
  comodidades:         'Comodidades deseadas',
  imprescindibles:     'Imprescindibles',
  fechaLlegada:        'Fecha de llegada prevista',
  tiempoEnEspana:      'Tiempo en España',
  objetivoBusqueda:    'Objetivo de búsqueda',
  modalidad:           'Modalidad',
  necesidadesEspeciales: 'Necesidades especiales',
  comoNosConociste:    'Cómo nos conoció',
  comprendeServicio:   'Comprende el servicio',
  consentimientoRGPD:  'Consentimiento RGPD',
}

const SECTIONS: { title: string; fields: string[] }[] = [
  {
    title: 'Datos personales',
    fields: ['paisResidencia', 'ciudadActual', 'ciudadDestino', 'telefono'],
  },
  {
    title: 'Familia',
    fields: ['adultos', 'ninos', 'adolescentes', 'mascotas', 'mascotaTipo'],
  },
  {
    title: 'Legal y laboral',
    fields: [
      'documentacion', 'situacionLaboral', 'ingresosMensuales',
      'garantias', 'cuentaBancaria', 'comprendeHonorarios',
      'tipoLicencia', 'nivelEstudios', 'profesion',
    ],
  },
  {
    title: 'Vivienda buscada',
    fields: [
      'tipoInmueble', 'habitacionesMinimas', 'presupuestoMensual',
      'amueblado', 'comodidades', 'imprescindibles',
    ],
  },
  {
    title: 'Contexto y plazos',
    fields: [
      'fechaLlegada', 'tiempoEnEspana', 'objetivoBusqueda',
      'modalidad', 'necesidadesEspeciales', 'comoNosConociste',
      'comprendeServicio', 'consentimientoRGPD',
    ],
  },
]

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—'
  return String(value)
}

function diasDesde(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000)
}

function formatFecha(isoDate: string): string {
  return new Date(isoDate).toLocaleString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid',
  })
}

// ── Colores por calificación ─────────────────────────────────────────────────
const CALIFICACION_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  potencial:        { bg: 'var(--color-estado-ok-bg)', color: 'var(--color-estado-ok)', label: 'Potencial alto' },
  'potencial-alto': { bg: 'var(--color-estado-ok-bg)', color: 'var(--color-estado-ok)', label: 'Potencial alto' },
  'en-desarrollo':  { bg: 'var(--color-estado-alerta-bg)', color: 'var(--color-laton-text)', label: 'En desarrollo' },
  bajo:             { bg: 'var(--color-estado-error-bg)', color: 'var(--color-estado-error)', label: 'Bajo' },
  'no-califica':    { bg: 'var(--color-estado-error-bg)', color: 'var(--color-estado-error)', label: 'No califica' },
}

// ── Componentes de UI internos ───────────────────────────────────────────────
function Badge({ text, bg, color }: { text: string; bg: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '4px',
      fontSize: '12px', fontWeight: 500, letterSpacing: '0.04em',
      background: bg, color,
      fontFamily: 'var(--font-ui)',
    }}>
      {text}
    </span>
  )
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '200px 1fr', gap: '8px',
      padding: '8px 0', borderBottom: '1px solid var(--color-arena)',
    }}>
      <span style={{ fontSize: '13px', color: '#696560', fontFamily: 'var(--font-ui)' }}>
        {label}
      </span>
      <span style={{ fontSize: '14px', color: 'var(--color-granito)', fontFamily: 'var(--font-ui)', fontWeight: value === '—' ? 400 : 500 }}>
        {value}
      </span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--color-blanco)', border: '1px solid var(--color-arena)',
      borderRadius: '8px', overflow: 'hidden', marginBottom: '16px',
    }}>
      <div style={{
        background: 'var(--color-niebla)', padding: '10px 20px',
        borderBottom: '1px solid var(--color-arena)',
      }}>
        <p style={{
          margin: 0, fontSize: '11px', fontWeight: 500,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'var(--color-laton-text)', fontFamily: 'var(--font-ui)',
        }}>
          {title}
        </p>
      </div>
      <div style={{ padding: '0 20px' }}>
        {children}
      </div>
    </div>
  )
}

function ErrorPage({ mensaje }: { mensaje: string }) {
  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--color-niebla)',
    }}>
      <div style={{
        background: 'var(--color-blanco)', borderRadius: '8px', padding: '48px 40px',
        maxWidth: '440px', textAlign: 'center', border: '1px solid var(--color-arena)',
      }}>
        <p style={{
          fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--color-laton-text)',
          fontFamily: 'var(--font-ui)', marginBottom: '16px',
        }}>
          Tu Lugar en Galicia — Admin
        </p>
        <h1 style={{
          fontSize: '22px', color: 'var(--color-granito)', fontFamily: 'var(--font-titular)',
          fontWeight: 400, marginBottom: '12px',
        }}>
          Acceso no disponible
        </h1>
        <p style={{ fontSize: '14px', color: '#696560', fontFamily: 'var(--font-ui)', margin: 0 }}>
          {mensaje}
        </p>
      </div>
    </main>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────
interface PageProps {
  params:       Promise<{ recordId: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function AdminLeadPage({ params, searchParams }: PageProps) {
  const { recordId }  = await params
  const { token }     = await searchParams

  if (!/^rec[a-zA-Z0-9]{14}$/.test(recordId)) {
    return <ErrorPage mensaje="El enlace no es válido." />
  }

  if (!token) {
    return <ErrorPage mensaje="Falta el token de acceso. Usá el enlace del mail." />
  }

  try {
    verifyAdminToken(recordId, token)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Token inválido'
    return <ErrorPage mensaje={msg === 'El enlace expiró (24 h)' ? 'El enlace expiró. Generá uno nuevo desde el resumen diario.' : 'Token inválido o malformado.'} />
  }

  let fields: Record<string, unknown>
  try {
    fields = await getRecord(recordId)
  } catch {
    return <ErrorPage mensaje="No se encontró el lead en Airtable." />
  }

  const nombre         = String(fields.nombreCompleto ?? '—')
  const email          = String(fields.email ?? '—')
  const calificacion   = String(fields.calificacion ?? '')
  const etiqueta       = String(fields.etiqueta ?? '')
  const codigoAgenda   = fields.codigoAgenda ? String(fields.codigoAgenda) : undefined
  const createdTime    = typeof fields._createdTime === 'string' ? fields._createdTime : null
  const calStyle       = CALIFICACION_STYLE[calificacion] ?? { bg: 'var(--color-niebla)', color: '#696560', label: calificacion || 'Sin calificar' }
  const dias           = createdTime ? diasDesde(createdTime) : null

  return (
    <main style={{ background: 'var(--color-niebla)', minHeight: '100vh', paddingBottom: '60px' }}>

      {/* ── Cabecera ────────────────────────────────────────────────────────── */}
      <header style={{ background: 'var(--color-granito)', padding: '0' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px 28px' }}>
          <p style={{
            fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--color-laton-claro)', fontFamily: 'var(--font-ui)', marginBottom: '20px',
          }}>
            Tu Lugar en Galicia — Admin
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{
                fontSize: '28px', color: 'var(--color-blanco)', fontFamily: 'var(--font-titular)',
                fontWeight: 400, marginBottom: '6px', lineHeight: 1.2,
              }}>
                {nombre}
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--color-laton-claro)', fontFamily: 'var(--font-ui)', margin: 0 }}>
                {email}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
              <Badge text={calStyle.label} bg={calStyle.bg} color={calStyle.color} />
              {etiqueta && (
                <Badge text={etiqueta} bg="#2a2826" color="var(--color-laton-claro)" />
              )}
            </div>
          </div>

          {createdTime && (
            <p style={{
              fontSize: '12px', color: '#888480', fontFamily: 'var(--font-ui)',
              marginTop: '16px',
            }}>
              Cuestionario completado el {formatFecha(createdTime)}
              {dias !== null && (
                <span style={{
                  marginLeft: '10px', fontWeight: 500,
                  color: dias > 7 ? '#e57373' : dias > 3 ? '#ffb74d' : '#81c784',
                }}>
                  · hace {dias} día{dias !== 1 ? 's' : ''}
                  {dias > 7 ? ' ⚠ urgente' : dias > 3 ? ' · seguimiento recomendado' : ''}
                </span>
              )}
            </p>
          )}
        </div>
      </header>

      {/* ── Botón habilitar ─────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--color-blanco)', borderBottom: '1px solid var(--color-arena)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '20px 24px' }}>
          <HabilitarAgendaButton
            recordId={recordId}
            token={token}
            codigoExistente={codigoAgenda}
          />
          <a
            href={`/api/plan/${recordId}/pdf?token=${encodeURIComponent(token)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', marginTop: '12px',
              fontSize: '13px', color: 'var(--color-laton-text)',
              fontFamily: 'var(--font-ui)', textDecoration: 'underline',
            }}
          >
            Ver/descargar plan (PDF)
          </a>
        </div>
      </div>

      {/* ── Secciones de campos ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '24px' }}>
        {SECTIONS.map(section => {
          const rows = section.fields
            .map(key => ({ key, label: LABELS[key] ?? key, value: formatValue(fields[key]) }))
            .filter(r => r.value !== '—')
          if (!rows.length) return null
          return (
            <Section key={section.title} title={section.title}>
              {rows.map(r => (
                <FieldRow key={r.key} label={r.label} value={r.value} />
              ))}
            </Section>
          )
        })}

        {/* ID interno */}
        <p style={{
          textAlign: 'center', fontSize: '11px', color: '#B0ADA8',
          fontFamily: 'var(--font-ui)', marginTop: '8px',
        }}>
          ID Airtable: {recordId}
        </p>
      </div>
    </main>
  )
}

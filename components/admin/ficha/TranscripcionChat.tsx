import { EmptyState } from '@/components/admin/ui/AdminPrimitives'

interface TranscripcionEntry {
  id: number
  rol: 'gina' | 'usuario'
  mensaje: string
  pasoId: string
  createdAt: string
}

interface Props {
  transcripcion: TranscripcionEntry[]
}

/** Vista tipo chat del cuestionario de Gina — orden cronológico, burbujas alternadas. */
export function TranscripcionChat({ transcripcion }: Props) {
  if (!transcripcion.length) {
    return <EmptyState mensaje="No hay transcript disponible para este lead." />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {transcripcion.map(entry => {
        const esGina = entry.rol === 'gina'
        return (
          <div
            key={entry.id}
            style={{ display: 'flex', justifyContent: esGina ? 'flex-start' : 'flex-end' }}
          >
            <div style={{
              maxWidth: '75%',
              background: esGina ? 'var(--color-niebla)' : 'var(--color-acordeon-bg)',
              color: esGina ? 'var(--color-granito)' : 'var(--color-blanco)',
              borderRadius: '10px',
              padding: '10px 14px',
            }}>
              <p style={{
                margin: '0 0 4px', fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase',
                fontFamily: 'var(--font-ui)', fontWeight: 500,
                color: esGina ? 'var(--color-laton-text)' : 'var(--color-laton-claro)',
              }}>
                {esGina ? 'Gina' : 'Usuario'} · {entry.pasoId}
              </p>
              <p style={{ margin: 0, fontSize: '14px', fontFamily: 'var(--font-ui)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {entry.mensaje}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

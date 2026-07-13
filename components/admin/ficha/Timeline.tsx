import { formatFecha, EmptyState } from '@/components/admin/ui/AdminPrimitives'
import { CompletarTareaButton } from '@/components/admin/ficha/CompletarTareaButton'

const COLOR_EVENTO_SISTEMA = 'var(--color-pizarra)'

interface NotaTarea {
  id: string
  leadId: string
  tipo: 'nota' | 'tarea'
  contenido: string
  estado: 'pendiente' | 'completada'
  fechaVencimiento: string | null
  autor: string | null
  createdAt: string
}

interface ActividadEntry {
  id: number
  tipoEvento: string
  descripcion: string | null
  payload: unknown
  actor: string | null
  createdAt: string
}

interface Props {
  leadId: string
  notasTareas: NotaTarea[]
  actividad: ActividadEntry[]
}

type TimelineItem =
  | { kind: 'notaTarea'; createdAt: string; data: NotaTarea }
  | { kind: 'actividad'; createdAt: string; data: ActividadEntry }

function TimelineEntry({ item, leadId }: { item: TimelineItem; leadId: string }) {
  if (item.kind === 'actividad') {
    return (
      <div style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--color-arena)' }}>
        <span style={{
          fontSize: '10px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: COLOR_EVENTO_SISTEMA, fontFamily: 'var(--font-ui)', flexShrink: 0, minWidth: '70px',
        }}>
          Evento
        </span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-granito)', fontFamily: 'var(--font-ui)' }}>
            {item.data.descripcion ?? item.data.tipoEvento}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-pizarra)', fontFamily: 'var(--font-ui)' }}>
            {formatFecha(item.data.createdAt)}{item.data.actor ? ` · ${item.data.actor}` : ''}
          </p>
        </div>
      </div>
    )
  }

  const nota = item.data
  const esTarea = nota.tipo === 'tarea'
  const pendiente = nota.estado === 'pendiente'

  return (
    <div style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--color-arena)' }}>
      <span style={{
        fontSize: '10px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
        color: esTarea ? 'var(--color-laton-text)' : 'var(--color-pizarra)',
        fontFamily: 'var(--font-ui)', flexShrink: 0, minWidth: '70px',
      }}>
        {esTarea ? 'Tarea' : 'Nota'}
      </span>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <p style={{
            margin: 0, fontSize: '14px', fontFamily: 'var(--font-ui)',
            color: 'var(--color-granito)',
            textDecoration: esTarea && !pendiente ? 'line-through' : 'none',
            opacity: esTarea && !pendiente ? 0.6 : 1,
          }}>
            {nota.contenido}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-pizarra)', fontFamily: 'var(--font-ui)' }}>
            {formatFecha(nota.createdAt)}
            {nota.autor ? ` · ${nota.autor}` : ''}
            {nota.fechaVencimiento ? ` · vence ${new Date(nota.fechaVencimiento).toLocaleDateString('es-ES')}` : ''}
          </p>
        </div>
        {esTarea && pendiente && (
          <CompletarTareaButton leadId={leadId} notaId={nota.id} />
        )}
      </div>
    </div>
  )
}

export function Timeline({ leadId, notasTareas, actividad }: Props) {
  // Decorate-sort-undecorate: cada createdAt se parsea a timestamp una sola vez,
  // en vez de re-parsear ambos lados en cada comparación de sort().
  const items: TimelineItem[] = [
    ...notasTareas.map((data): TimelineItem => ({ kind: 'notaTarea', createdAt: data.createdAt, data })),
    ...actividad.map((data): TimelineItem => ({ kind: 'actividad', createdAt: data.createdAt, data })),
  ]
    .map(item => ({ item, ts: new Date(item.createdAt).getTime() }))
    .sort((a, b) => b.ts - a.ts)
    .map(({ item }) => item)

  if (!items.length) {
    return <EmptyState mensaje="Sin notas, tareas ni actividad todavía." />
  }

  return (
    <div>
      {items.map(item => (
        <TimelineEntry
          key={`${item.kind}-${item.data.id}`}
          item={item}
          leadId={leadId}
        />
      ))}
    </div>
  )
}

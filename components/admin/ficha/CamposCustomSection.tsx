import { CampoCustomEditor } from '@/components/admin/ficha/CampoCustomEditor'
import { NuevoCampoCustomForm } from '@/components/admin/ficha/NuevoCampoCustomForm'
import { EmptyState } from '@/components/admin/ui/AdminPrimitives'
import type { CampoCustomDefinicion } from '@/components/admin/ficha/camposCustomTypes'

interface Props {
  leadId: string
  definiciones: CampoCustomDefinicion[]
  valores: Record<string, unknown>
}

/**
 * Sección "Campos personalizados" de la Ficha 360°. Server Component contenedor (no
 * necesita estado propio): delega la edición de cada valor a CampoCustomEditor y el alta
 * de definiciones nuevas a NuevoCampoCustomForm, ambos Client Components chicos que ya
 * manejan su propio fetch/loading/error vía useAdminAction — mismo criterio que
 * NuevaNotaForm/CompletarTareaButton en esta misma ficha.
 */
export function CamposCustomSection({ leadId, definiciones, valores }: Props) {
  return (
    <div>
      {definiciones.length === 0 ? (
        <EmptyState mensaje="Todavía no hay campos personalizados definidos." />
      ) : (
        <div>
          {definiciones
            .slice()
            .sort((a, b) => a.orden - b.orden)
            .map(definicion => (
              <CampoCustomEditor
                key={definicion.id}
                leadId={leadId}
                definicion={definicion}
                valorActual={valores[definicion.clave] ?? null}
              />
            ))}
        </div>
      )}
      <NuevoCampoCustomForm />
    </div>
  )
}

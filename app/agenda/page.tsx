import { getNextMetadata } from '@/lib/seo/metadata'
import { AgendaPublica } from '@/components/agenda/AgendaPublica'
import { AgendaConCodigo } from '@/components/agenda/AgendaConCodigo'

import { validateCodigoAgenda } from '@/lib/admin/leadsRepo'

export const metadata = getNextMetadata('agenda')

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AgendaPage({ searchParams }: PageProps) {
  const params = await searchParams
  const rawCode = typeof params.code === 'string' ? params.code : (params.code?.[0] ?? '')

  let isValid = false
  try {
    isValid = rawCode ? await validateCodigoAgenda(rawCode) : false
  } catch {
    // Supabase no disponible — fail closed (mostrar página pública)
    isValid = false
  }

  if (!isValid) {
    return <AgendaPublica />
  }

  return <AgendaConCodigo />
}

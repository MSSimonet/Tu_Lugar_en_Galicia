import { getNextMetadata } from '@/lib/seo/metadata'
import { AppsUtilesPagina } from '@/components/apps/AppsUtilesPagina'

export const metadata = getNextMetadata('appsUtiles')

export default function AppsUtilesPage() {
  return <AppsUtilesPagina />
}

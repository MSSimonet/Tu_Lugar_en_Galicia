import { getNextMetadata } from '@/lib/seo/metadata'
import { AppsUtilesExplorer } from '@/components/apps/AppsUtilesExplorer'

export const metadata = getNextMetadata('appsUtiles')

export default function AppsUtilesPage() {
  return (
    <div style={{ backgroundColor: 'var(--au-bg)', minHeight: '100vh' }}>
      {/* Franja superior — separador visual, coherente con el header del diseño de referencia */}
      <div className="h-1" style={{ backgroundColor: 'var(--au-header-bg)' }} aria-hidden="true" />

      {/* Hero */}
      <div className="mx-auto max-w-[900px] px-6 pb-8 pt-12 md:pt-14">
        <div className="mb-4 flex items-center gap-2">
          <span className="block h-px w-4" style={{ backgroundColor: 'var(--au-accent)' }} aria-hidden="true" />
          <span
            className="text-[11px] font-semibold tracking-[0.14em]"
            style={{ fontFamily: 'var(--font-au-ui)', color: 'var(--au-accent)' }}
          >
            GUÍA DE LLEGADA
          </span>
        </div>
        <h1
          className="text-[32px] font-bold leading-[1.18] md:text-[38px]"
          style={{ fontFamily: 'var(--font-au-display)', color: 'var(--au-hero-heading)' }}
        >
          Elige tu ciudad y descubre tu kit de apps
        </h1>
        <p
          className="mt-3.5 max-w-[560px] text-[14.5px] leading-[1.6]"
          style={{ fontFamily: 'var(--font-au-ui)', color: 'var(--au-hero-body)' }}
        >
          Las herramientas locales de tu ciudad, más las apps nacionales que vas a necesitar en
          cualquier parte de España.
        </p>
      </div>

      <div style={{ fontFamily: 'var(--font-au-ui)', color: 'var(--au-text)' }}>
        <AppsUtilesExplorer />
      </div>
    </div>
  )
}

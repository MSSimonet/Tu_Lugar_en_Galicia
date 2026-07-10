import type { AppUtil } from '@/lib/config/appsUtiles'

const PLAT_LABEL: Record<keyof AppUtil['plataformas'], string> = {
  ios: 'iOS',
  android: 'Android',
  web: 'Web',
}

const PLAT_ORDEN: (keyof AppUtil['plataformas'])[] = ['ios', 'android', 'web']

type Props = { app: AppUtil }

export function FilaApp({ app }: Props) {
  const plataformas = PLAT_ORDEN.filter((plat) => app.plataformas[plat])

  return (
    <div
      className="flex items-center gap-3 py-2.5"
      style={{ borderBottom: '1px solid rgba(226,213,196,0.08)' }}
    >
      <span
        aria-hidden="true"
        className="h-3.5 w-3.5 shrink-0 rounded"
        style={{ border: '1.5px solid var(--au-accent)' }}
      />
      <div className="min-w-0 flex-1">
        <span
          className="text-[13px] font-semibold"
          style={{ fontFamily: 'var(--font-au-display)', color: 'var(--au-accent)' }}
        >
          {app.nombre}
        </span>
        <span className="text-xs" style={{ color: 'var(--au-muted)' }}>
          {' '}— {app.descripcion}
        </span>
      </div>
      {plataformas.length > 0 && (
        <span className="shrink-0 whitespace-nowrap text-[10px]" style={{ color: 'var(--au-faint)' }}>
          {plataformas.map((plat, i) => (
            <span key={plat}>
              {i > 0 && ' · '}
              <a
                href={app.plataformas[plat]}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ outlineColor: 'var(--au-accent)' }}
              >
                {PLAT_LABEL[plat]}
                <span className="sr-only"> (abre en nueva pestaña)</span>
              </a>
            </span>
          ))}
        </span>
      )}
    </div>
  )
}

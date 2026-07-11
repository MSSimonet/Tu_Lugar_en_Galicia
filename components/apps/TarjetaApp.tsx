import type { AppUtil } from '@/lib/config/appsUtiles'

type Props = { app: AppUtil }

export function TarjetaApp({ app }: Props) {
  return (
    <a
      href={app.link}
      target="_blank"
      rel="noopener noreferrer"
      className="au-app-card flex items-start gap-3 rounded-xl p-3 transition-colors"
      style={{ backgroundColor: 'var(--au-app-card-bg)', border: '1px solid var(--au-row-border)' }}
    >
      <span
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] text-2xl leading-none"
        style={{ backgroundColor: 'var(--au-logo-bg)', border: '1px solid var(--au-border)' }}
      >
        {app.icono}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block text-[13.5px] font-semibold"
          style={{ fontFamily: 'var(--font-au-display)', color: 'var(--au-accent-text)' }}
        >
          {app.nombre}
          <span className="sr-only"> (abre en nueva pestaña)</span>
        </span>
        <span className="mt-1 block text-xs leading-snug" style={{ color: 'var(--au-muted)' }}>
          {app.descripcion}
        </span>
        <span className="mt-1.5 block text-[10px]" style={{ color: 'var(--au-faint)' }}>
          {app.plataformas}
        </span>
      </span>
    </a>
  )
}

import type { AppUtil } from '@/lib/config/appsUtiles'
import { TarjetaApp } from './TarjetaApp'

type Props = {
  label: string
  apps: AppUtil[]
  abiertaPorDefecto?: boolean
}

export function SeccionAcordeon({ label, apps, abiertaPorDefecto = false }: Props) {
  return (
    <details
      className="group overflow-hidden rounded-[10px]"
      style={{ border: '1px solid var(--au-border-strong)', backgroundColor: 'var(--au-card)' }}
      open={abiertaPorDefecto}
    >
      <summary
        // hover: el encabezado era clicable pero no lo parecía — no cambiaba nada al pasar el
        // mouse. `transition-brand` es la transición estándar del proyecto (app/globals.css).
        className="transition-brand flex cursor-pointer list-none items-center justify-between gap-3 px-[18px] py-3.5 hover:[background-color:var(--au-header-bg)] focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: 'var(--au-accent)' }}
      >
        <span className="flex items-center gap-2.5">
          <h2
            className="text-[15.5px] font-semibold"
            style={{ fontFamily: 'var(--font-au-display)', color: 'var(--au-heading)' }}
          >
            {label}
          </h2>
          <span className="text-[10.5px] font-semibold tracking-[0.06em]" style={{ color: 'var(--au-accent-text)' }}>
            {apps.length}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 text-[13px] transition-transform duration-150 group-open:rotate-180"
          style={{ color: 'var(--au-accent-text)' }}
        >
          ▾
        </span>
      </summary>
      <div
        className="grid gap-3 px-[18px] pb-4 pt-3"
        style={{ borderTop: '1px solid var(--au-border)', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}
      >
        {apps.map((app) => (
          <TarjetaApp key={app.nombre} app={app} />
        ))}
      </div>
    </details>
  )
}

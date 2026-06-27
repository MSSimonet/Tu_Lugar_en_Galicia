import type { App } from '@/lib/config/apps'

// ── Iconos de categoría (SVG inline) ─────────────────────────────────────────

function IconIdentidad() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function IconSalud() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

function IconTransporte() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <path d="M16 8h4l3 5v3h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function IconHogar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function IconBurocracia() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

// ── Iconos de plataforma ──────────────────────────────────────────────────────

function IconApple() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  )
}

function IconAndroid() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.523 15.341c-.3 0-.545-.245-.545-.545V9.795c0-.3.244-.545.545-.545.3 0 .545.244.545.545v4.998c0 .305-.245.548-.545.548zm-11.048 0c-.3 0-.545-.245-.545-.545V9.795c0-.3.244-.545.545-.545.3 0 .545.244.545.545v4.998c-.001.305-.245.548-.545.548zm1.634-9.093l.947-1.65c.056-.1.019-.227-.082-.284-.102-.055-.228-.018-.284.083l-.96 1.672C7.07 5.762 6.434 5.61 5.755 5.61c-.677 0-1.313.153-1.973.459l-.961-1.672c-.056-.101-.182-.138-.284-.083-.1.057-.138.184-.082.284l.947 1.65C2.265 7.08 1.5 8.436 1.5 9.97h21c0-1.534-.765-2.89-2.391-3.722zM8.998 8.25c-.359 0-.647-.288-.647-.646s.288-.646.647-.646.647.288.647.646-.287.646-.647.646zm6.007 0c-.359 0-.647-.288-.647-.646s.288-.646.647-.646.647.288.647.646-.288.646-.647.646zm-7.17 8.518c0 .633.514 1.148 1.148 1.148h.677v2.391c0 .3.244.545.545.545.3 0 .545-.245.545-.545v-2.391h1.501v2.391c0 .3.244.545.545.545.3 0 .545-.245.545-.545v-2.391h.677c.634 0 1.148-.515 1.148-1.148V10.65H7.835v6.118z"/>
    </svg>
  )
}

function IconGlobe() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

// ── Configuración de categoría ────────────────────────────────────────────────

const CATEGORIA_CONFIG: Record<
  App['categoria'],
  { icon: React.ReactNode; color: string; bgColor: string }
> = {
  identidad:  { icon: <IconIdentidad />,  color: 'var(--color-laton)',      bgColor: 'color-mix(in srgb, var(--color-laton) 12%, transparent)'      },
  salud:      { icon: <IconSalud />,      color: 'var(--color-atlantico)',   bgColor: 'color-mix(in srgb, var(--color-atlantico) 12%, transparent)'   },
  transporte: { icon: <IconTransporte />, color: 'var(--color-mar)',         bgColor: 'color-mix(in srgb, var(--color-mar) 12%, transparent)'         },
  hogar:      { icon: <IconHogar />,      color: 'var(--color-atlantico-claro)', bgColor: 'color-mix(in srgb, var(--color-atlantico-claro) 12%, transparent)' },
  burocracia: { icon: <IconBurocracia />, color: 'var(--color-pizarra)',     bgColor: 'color-mix(in srgb, var(--color-pizarra) 12%, transparent)'     },
}

// ── Componente ────────────────────────────────────────────────────────────────

type Props = { app: App }

export function AppCard({ app }: Props) {
  const cfg = CATEGORIA_CONFIG[app.categoria]

  return (
    <article
      className="flex flex-col gap-3 rounded-[var(--radius-card)] border p-5 transition-brand hover:shadow-md"
      style={{
        borderColor: 'var(--color-arena)',
        backgroundColor: 'var(--color-niebla)',
      }}
    >
      {/* Cabecera: icono + nombre */}
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: cfg.bgColor, color: cfg.color }}
        >
          {cfg.icon}
        </div>
        <h3
          className="font-[family-name:var(--font-ui)] text-base font-semibold leading-snug"
          style={{ color: 'var(--color-granito)' }}
        >
          {app.nombre}
        </h3>
      </div>

      {/* Descripción */}
      <p
        className="font-[family-name:var(--font-ui)] text-sm leading-relaxed"
        style={{ color: 'var(--color-pizarra)' }}
      >
        {app.descripcion}
      </p>

      {/* Para qué la necesitás HOY */}
      <div
        className="flex items-start gap-2 rounded-md px-3 py-2 text-sm"
        style={{
          backgroundColor: cfg.bgColor,
          color: cfg.color,
        }}
      >
        <span className="mt-px shrink-0 font-bold" aria-hidden="true">▸</span>
        <p className="font-[family-name:var(--font-ui)] leading-snug">{app.paraQue}</p>
      </div>

      {/* Links de descarga */}
      {(app.links.ios ?? app.links.android ?? app.links.web) && (
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {app.links.ios && (
            <a
              href={app.links.ios}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-[family-name:var(--font-ui)] text-xs font-medium transition-brand hover:opacity-80"
              style={{
                borderColor: 'var(--color-arena)',
                color: 'var(--color-granito)',
                backgroundColor: 'var(--color-blanco)',
              }}
            >
              <IconApple />
              iOS
            </a>
          )}
          {app.links.android && (
            <a
              href={app.links.android}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-[family-name:var(--font-ui)] text-xs font-medium transition-brand hover:opacity-80"
              style={{
                borderColor: 'var(--color-arena)',
                color: 'var(--color-granito)',
                backgroundColor: 'var(--color-blanco)',
              }}
            >
              <IconAndroid />
              Android
            </a>
          )}
          {app.links.web && (
            <a
              href={app.links.web}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-[family-name:var(--font-ui)] text-xs font-medium transition-brand hover:opacity-80"
              style={{
                borderColor: 'var(--color-arena)',
                color: 'var(--color-granito)',
                backgroundColor: 'var(--color-blanco)',
              }}
            >
              <IconGlobe />
              Web
            </a>
          )}
        </div>
      )}
    </article>
  )
}

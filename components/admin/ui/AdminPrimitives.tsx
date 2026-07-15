/**
 * components/admin/ui/AdminPrimitives.tsx — Primitivas visuales compartidas por el
 * panel /admin (Fase 2: dashboard, inbox, ficha 360). Estilo utilitario, inline con
 * variables CSS `var(--color-*)` / `var(--font-*)`, igual criterio que
 * app/admin/lead/[recordId]/page.tsx y app/admin/login/page.tsx (ese archivo no se
 * toca — estas primitivas son una copia local, no un import de esa página).
 *
 * Sin voz de marca ni design system público: esto es 100% interno, para Silvana.
 */

import type { ReactNode, CSSProperties } from 'react'
import Link from 'next/link'

// ── Colores por calificación de lead (mismo criterio que admin/lead) ────────
export const CALIFICACION_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  potencial:        { bg: 'var(--color-estado-ok-bg)', color: 'var(--color-estado-ok)', label: 'Potencial alto' },
  'potencial-alto': { bg: 'var(--color-estado-ok-bg)', color: 'var(--color-estado-ok)', label: 'Potencial alto' },
  'en-desarrollo':  { bg: 'var(--color-estado-alerta-bg)', color: 'var(--color-laton-text)', label: 'En desarrollo' },
  bajo:             { bg: 'var(--color-estado-error-bg)', color: 'var(--color-estado-error)', label: 'Bajo' },
  'no-califica':    { bg: 'var(--color-estado-error-bg)', color: 'var(--color-estado-error)', label: 'No califica' },
}

export function getCalificacionStyle(calificacion: string | null | undefined): { bg: string; color: string; label: string } {
  if (!calificacion) return { bg: 'var(--color-niebla)', color: 'var(--color-pizarra)', label: 'Sin calificar' }
  return CALIFICACION_STYLE[calificacion] ?? { bg: 'var(--color-niebla)', color: 'var(--color-pizarra)', label: calificacion }
}

/** Franja lateral de color por calificación — usada en las tarjetas del inbox. */
export function getCalificacionBarra(calificacion: string | null | undefined): string {
  return getCalificacionStyle(calificacion).color
}

export function Badge({ text, bg, color }: { text: string; bg: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '4px',
      fontSize: '12px', fontWeight: 500, letterSpacing: '0.04em',
      background: bg, color,
      fontFamily: 'var(--font-ui)',
    }}>
      {text}
    </span>
  )
}

export function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '200px 1fr', gap: '8px',
      padding: '8px 0', borderBottom: '1px solid var(--color-arena)',
    }}>
      <span style={{ fontSize: '13px', color: 'var(--color-pizarra)', fontFamily: 'var(--font-ui)' }}>
        {label}
      </span>
      <span style={{ fontSize: '14px', color: 'var(--color-granito)', fontFamily: 'var(--font-ui)', fontWeight: value === '—' ? 400 : 500 }}>
        {value}
      </span>
    </div>
  )
}

/** Tarjeta con encabezado tipo "Section" — usada para secciones de campos y gráficos. */
export function Card({ title, children, style }: { title: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: 'var(--color-blanco)', border: '1px solid var(--color-arena)',
      borderRadius: '8px', overflow: 'hidden', ...style,
    }}>
      <div style={{
        background: 'var(--color-niebla)', padding: '10px 20px',
        borderBottom: '1px solid var(--color-arena)',
      }}>
        <p style={{
          margin: 0, fontSize: '11px', fontWeight: 500,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'var(--color-laton-text)', fontFamily: 'var(--font-ui)',
        }}>
          {title}
        </p>
      </div>
      <div style={{ padding: '16px 20px' }}>
        {children}
      </div>
    </div>
  )
}

export function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: 'var(--color-blanco)', border: '1px solid var(--color-arena)',
      borderRadius: '8px', padding: '20px 24px',
    }}>
      <p style={{
        margin: '0 0 8px', fontSize: '11px', fontWeight: 500,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: 'var(--color-pizarra)', fontFamily: 'var(--font-ui)',
      }}>
        {label}
      </p>
      <p style={{
        margin: 0, fontSize: '32px', fontWeight: 400,
        color: 'var(--color-granito)', fontFamily: 'var(--font-titular)',
      }}>
        {value}
      </p>
    </div>
  )
}

const NAV_LINKS: { href: string; label: string; seccion: SeccionAdmin }[] = [
  { href: '/admin/dashboard', label: 'Dashboard', seccion: 'dashboard' },
  { href: '/admin/inbox', label: 'Inbox', seccion: 'inbox' },
  { href: '/admin/kanban', label: 'Kanban', seccion: 'kanban' },
]

export type SeccionAdmin = 'dashboard' | 'inbox' | 'kanban'

/** Navegación cruzada chica entre las 3 secciones del panel — usada en AdminHeader. */
function AdminNav({ activo }: { activo: SeccionAdmin }) {
  return (
    <nav style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
      {NAV_LINKS.map(link => (
        <Link
          key={link.seccion}
          href={link.href}
          style={{
            fontSize: '13px', fontFamily: 'var(--font-ui)', fontWeight: 500,
            textDecoration: 'none',
            color: link.seccion === activo ? 'var(--color-blanco)' : 'var(--color-laton-claro)',
            borderBottom: link.seccion === activo ? '2px solid var(--color-laton-claro)' : '2px solid transparent',
            paddingBottom: '4px',
          }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}

/** Cabecera oscura, igual look que admin/lead pero sin datos de un lead puntual. */
export function AdminHeader({ title, subtitle, activo }: { title: string; subtitle?: string; activo?: SeccionAdmin }) {
  return (
    <header style={{ background: 'var(--color-granito)', padding: '0' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 28px' }}>
        <p style={{
          fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--color-laton-claro)', fontFamily: 'var(--font-ui)', marginBottom: '20px',
        }}>
          Tu Lugar en Galicia — Admin
        </p>
        <h1 style={{
          fontSize: '28px', color: 'var(--color-blanco)', fontFamily: 'var(--font-titular)',
          fontWeight: 400, marginBottom: subtitle ? '6px' : 0, lineHeight: 1.2,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '14px', color: 'var(--color-laton-claro)', fontFamily: 'var(--font-ui)', margin: 0 }}>
            {subtitle}
          </p>
        )}
        {activo && <AdminNav activo={activo} />}
      </div>
    </header>
  )
}

export function ErrorPage({ mensaje }: { mensaje: string }) {
  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--color-niebla)',
    }}>
      <div style={{
        background: 'var(--color-blanco)', borderRadius: '8px', padding: '48px 40px',
        maxWidth: '440px', textAlign: 'center', border: '1px solid var(--color-arena)',
      }}>
        <p style={{
          fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--color-laton-text)',
          fontFamily: 'var(--font-ui)', marginBottom: '16px',
        }}>
          Tu Lugar en Galicia — Admin
        </p>
        <h1 style={{
          fontSize: '22px', color: 'var(--color-granito)', fontFamily: 'var(--font-titular)',
          fontWeight: 400, marginBottom: '12px',
        }}>
          Acceso no disponible
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-pizarra)', fontFamily: 'var(--font-ui)', margin: 0 }}>
          {mensaje}
        </p>
      </div>
    </main>
  )
}

/** Mensaje neutro compartido — "todavía no hay datos" en gráficos, transcript o timeline vacíos. */
export function EmptyState({ mensaje }: { mensaje: string }) {
  return (
    <p style={{ fontSize: '13px', color: 'var(--color-pizarra)', fontFamily: 'var(--font-ui)' }}>
      {mensaje}
    </p>
  )
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—'
  return String(value)
}

export function formatFecha(isoDate: string): string {
  return new Date(isoDate).toLocaleString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid',
  })
}

/**
 * Paleta cualitativa para gráficos de Recharts — 4 tonos con identidad propia
 * dentro de la paleta Pedra e Ouro, más un neutro para "sin clasificar"/"otros".
 * Se pasan como strings `var(--color-*)`: los componentes de Recharts los usan
 * como atributo `fill`/`stroke` en SVG, que sí resuelve custom properties (y por
 * lo tanto responde solo al toggle de `.dark` en <html>, sin JS adicional).
 */
export const CHART_COLORS = {
  dorado: 'var(--color-laton-text)',
  verde:  'var(--color-atlantico-claro)',
  azul:   'var(--color-mar)',
  coral:  'var(--color-coral)',
  neutro: 'var(--color-pizarra)',
}

export const CHART_GRID_COLOR = 'var(--color-arena)'
export const CHART_TEXT_COLOR = 'var(--color-pizarra)'
export const CHART_TOOLTIP_STYLE: CSSProperties = {
  background: 'var(--color-blanco)',
  border: '1px solid var(--color-arena)',
  borderRadius: '6px',
  fontFamily: 'var(--font-ui)',
  fontSize: '13px',
  color: 'var(--color-granito)',
}

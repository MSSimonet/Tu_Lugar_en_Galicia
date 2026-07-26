// TODO — Placeholder estático ("Próximamente"), sin embed de terceros activo.
// Pendiente decisión de producto sobre la cámara real a mostrar: cámaras de
// ayuntamientos/Turespaña, o acuerdo propio con un proveedor. Cualquier embed
// de terceros que se agregue acá debe revisarse legalmente antes de activarlo.

'use client'

type VistaEnVivoProps = {
  lat: number
  lon: number
  nombreCiudad: string
  descripcionUbicacion?: string
}

export function VistaEnVivo({ descripcionUbicacion }: VistaEnVivoProps) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '220px',
      borderRadius: '1rem',
      overflow: 'hidden',
      background: 'var(--color-header-bg)', // fijo, no invierte en dark (a diferencia de --dz-ink) — necesario para que el texto blanco siga contrastando en ambos modos
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    }}>
      {/* Ícono de cámara */}
      <svg
        width={32}
        height={32}
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2" />
        <circle cx="12" cy="13" r="3" />
      </svg>

      {/* Texto principal */}
      <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
        Cámara en vivo
      </span>

      {/* Subtexto */}
      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
        Próximamente
      </span>

      {/* El badge "EN VIVO" (punto rojo + texto) se retiró en la auditoría
          2026-07-25 (I9): estaba sobre un placeholder sin ninguna emisión real,
          así que le prometía al usuario una cámara en directo que no existe.
          Cuando se conecte una cámara de verdad, se vuelve a agregar junto al
          embed — nunca antes. */}

      {/* Label ubicación */}
      {descripcionUbicacion && (
        <div style={{
          position: 'absolute', bottom: 10, left: 10, right: 10,
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 1 }}>Vista desde</div>
          <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: 500 }}>{descripcionUbicacion}</div>
        </div>
      )}
    </div>
  )
}

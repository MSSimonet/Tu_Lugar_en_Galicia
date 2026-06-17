// TODO PRE-DEPLOY — PENDIENTE LEGAL
// El widget de Windy embed se usa actualmente como solución provisional de desarrollo.
// ANTES del deploy a producción hay que resolver una de estas opciones:
//   a) Obtener autorización formal de MeteoGalicia para embeber sus cámaras (email enviado)
//   b) Conseguir cámaras turísticas de los ayuntamientos o Turespaña para cada ciudad
//   c) Reemplazar por imágenes estáticas propias si no se consigue autorización
// El uso del embed de Windy sin autorización explícita puede ser problemático en producción.
// Contacto MeteoGalicia: meteogalicia@meteogalicia.es

'use client'

type VistaEnVivoProps = {
  lat: number
  lon: number
  nombreCiudad: string
  descripcionUbicacion?: string
}

export function VistaEnVivo({ nombreCiudad, descripcionUbicacion }: VistaEnVivoProps) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '220px',
      borderRadius: '1rem',
      overflow: 'hidden',
      background: '#0D1F1A',
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
      <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
        Cámara en vivo
      </span>

      {/* Subtexto */}
      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
        Próximamente
      </span>

      {/* Badge EN VIVO (inactivo) */}
      <div style={{
        position: 'absolute', top: 10, left: 10,
        display: 'flex', alignItems: 'center', gap: 5,
        background: 'rgba(0,0,0,0.55)',
        border: '0.5px solid rgba(255,255,255,0.2)',
        borderRadius: 20, padding: '3px 10px',
        opacity: 0.4,
        pointerEvents: 'none',
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E55' }} />
        <span style={{ fontSize: 10, color: 'white', fontWeight: 500, letterSpacing: '0.06em' }}>EN VIVO</span>
      </div>

      {/* Label ubicación */}
      {descripcionUbicacion && (
        <div style={{
          position: 'absolute', bottom: 10, left: 10, right: 10,
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 1 }}>Vista desde</div>
          <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: 500 }}>{descripcionUbicacion}</div>
        </div>
      )}
    </div>
  )
}

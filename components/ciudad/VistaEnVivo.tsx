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

export function VistaEnVivo({ lat, lon, nombreCiudad, descripcionUbicacion }: VistaEnVivoProps) {
  const src = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&width=650&height=450&zoom=11&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '220px', borderRadius: '1rem', overflow: 'hidden', background: '#0D1F1A' }}>
      <iframe
        src={src}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        title={`Vista en tiempo real de ${nombreCiudad}`}
        loading="lazy"
      />
      {/* Badge EN VIVO */}
      <div style={{
        position: 'absolute', top: 10, left: 10,
        display: 'flex', alignItems: 'center', gap: 5,
        background: 'rgba(0,0,0,0.55)',
        border: '0.5px solid rgba(255,255,255,0.2)',
        borderRadius: 20, padding: '3px 10px',
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

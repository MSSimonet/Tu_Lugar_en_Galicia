'use client'

import { useState } from 'react'
import { ACTIVIDADES, type ComunidadPerfilPublico } from '@/lib/comunidad/types'
import { FormMensajePrivado } from './FormMensajePrivado'

interface TarjetaPerfilProps {
  perfil: ComunidadPerfilPublico
}

function iniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('')
}

function urlWhatsapp(contacto: string): string {
  const soloDigitos = contacto.replace(/\D/g, '')
  return `https://wa.me/${soloDigitos}`
}

/** Estado de la petición del teléfono a /api/comunidad/[id]/contacto. */
type EstadoContacto = 'oculto' | 'cargando' | 'visible' | 'error'

const botonBase =
  'inline-flex items-center justify-center px-3 py-2 font-bold [font-size:var(--text-xs)] uppercase tracking-[0.08em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2'

export function TarjetaPerfil({ perfil }: TarjetaPerfilProps) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [estadoContacto, setEstadoContacto] = useState<EstadoContacto>('oculto')
  const [contacto, setContacto] = useState<string | null>(null)

  // El teléfono se pide con un clic explícito, NUNCA al montar. No es una preferencia de UX:
  // MapaComunidad monta una TarjetaPerfil por pin durante la carga del mapa (hace
  // raiz.render(...) para todos, mucho antes de que se abra ningún popup), así que un fetch
  // en useEffect dispararía una petición por cada perfil con el flag activo en el instante en
  // que alguien entra a /comunidad/mapa. Eso reconstruiría el volcado masivo que la migración
  // 0010 vino a cerrar, y de paso reventaría el rate limit del endpoint en la primera visita.
  async function revelarContacto() {
    setEstadoContacto('cargando')
    try {
      const res = await fetch(`/api/comunidad/${perfil.id}/contacto`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: unknown = await res.json()
      const numero =
        typeof data === 'object' && data !== null && typeof (data as { contacto?: unknown }).contacto === 'string'
          ? (data as { contacto: string }).contacto
          : null
      if (!numero) throw new Error('respuesta sin contacto')
      setContacto(numero)
      setEstadoContacto('visible')
    } catch {
      // Cae al mensaje privado, que funciona siempre. Da igual el motivo del fallo (red, 404
      // porque el perfil dejó de estar disponible, 429): desde la tarjeta la salida es la misma.
      setEstadoContacto('error')
    }
  }

  return (
    <div className="flex flex-col gap-3 p-3" style={{ maxWidth: '260px' }}>
      <div className="flex items-center gap-3">
        {perfil.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- popup de Leaflet, fuera del árbol de <Image> de Next.
          <img
            src={perfil.foto_url}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-full object-cover"
            style={{ border: '1px solid var(--dz-borde)' }}
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--dz-papel)', border: '1px solid var(--dz-borde)' }}
          >
            <span style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 700, color: 'var(--dz-accent-text)' }}>
              {iniciales(perfil.nombre)}
            </span>
          </div>
        )}
        <p
          className="[font-size:var(--text-sm)] leading-tight"
          style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 700, color: 'var(--dz-ink)' }}
        >
          {perfil.nombre}
        </p>
      </div>

      {perfil.disponibilidad.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {perfil.disponibilidad.map((actividad) => (
            <span
              key={actividad}
              className="[font-size:var(--text-xs)] px-2 py-0.5"
              style={{
                fontFamily: 'var(--font-dz-ui)',
                color: 'var(--dz-muted)',
                backgroundColor: 'var(--dz-papel)',
                border: '1px solid var(--dz-borde)',
                borderRadius: '8px',
              }}
            >
              {ACTIVIDADES.find((a) => a.id === actividad)?.label ?? actividad}
            </span>
          ))}
        </div>
      )}

      {/* Desde la migración 0010 (PII-01) el teléfono no viaja en la carga del mapa: la tarjeta
          solo sabe, por `mostrar_contacto`, si hay uno que se pueda pedir. Si el flag está en
          false —el caso por defecto de todo el mundo— ni siquiera se ofrece, y la salida es el
          mensaje privado de siempre. Si algo falla al pedirlo, se cae a esa misma rama. */}
      {perfil.mostrar_contacto && estadoContacto !== 'error' ? (
        estadoContacto === 'visible' && contacto ? (
          <div className="flex flex-col gap-2" aria-live="polite">
            <p
              className="[font-size:var(--text-sm)]"
              style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-ink)' }}
            >
              {contacto}
            </p>
            <a
              href={urlWhatsapp(contacto)}
              target="_blank"
              rel="noopener noreferrer"
              className={botonBase}
              style={{
                fontFamily: 'var(--font-dz-ui)',
                borderRadius: '8px',
                backgroundColor: 'var(--dz-accent)',
                color: '#1A1410',
                outlineColor: 'var(--dz-accent)',
              }}
            >
              Escribir por WhatsApp
            </a>
          </div>
        ) : (
          <button
            type="button"
            onClick={revelarContacto}
            disabled={estadoContacto === 'cargando'}
            aria-busy={estadoContacto === 'cargando'}
            className={botonBase}
            style={{
              fontFamily: 'var(--font-dz-ui)',
              borderRadius: '8px',
              backgroundColor: 'var(--dz-accent)',
              color: '#1A1410',
              outlineColor: 'var(--dz-accent)',
              cursor: estadoContacto === 'cargando' ? 'default' : 'pointer',
              opacity: estadoContacto === 'cargando' ? 0.7 : 1,
            }}
          >
            {estadoContacto === 'cargando' ? 'Buscando…' : 'Ver teléfono'}
          </button>
        )
      ) : mostrarForm ? (
        <FormMensajePrivado destinatarioId={perfil.id} />
      ) : (
        <button
          type="button"
          onClick={() => setMostrarForm(true)}
          aria-expanded={mostrarForm}
          className={botonBase}
          style={{
            fontFamily: 'var(--font-dz-ui)',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            border: '1px solid var(--dz-borde)',
            color: 'var(--dz-ink)',
            outlineColor: 'var(--dz-accent)',
          }}
        >
          Enviar mensaje privado
        </button>
      )}
    </div>
  )
}

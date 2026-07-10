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

export function TarjetaPerfil({ perfil }: TarjetaPerfilProps) {
  const [mostrarForm, setMostrarForm] = useState(false)

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
            style={{ border: '1px solid var(--po-borde)' }}
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--po-areia)', border: '1px solid var(--po-borde)' }}
          >
            <span style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--po-ouro-text)' }}>
              {iniciales(perfil.nombre)}
            </span>
          </div>
        )}
        <p
          className="[font-size:var(--text-sm)] leading-tight"
          style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--po-pedra)' }}
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
                fontFamily: 'var(--font-lato)',
                color: 'var(--po-muted)',
                backgroundColor: 'var(--po-areia)',
                border: '1px solid var(--po-borde)',
                borderRadius: '4px',
              }}
            >
              {ACTIVIDADES.find((a) => a.id === actividad)?.label ?? actividad}
            </span>
          ))}
        </div>
      )}

      {perfil.contacto ? (
        <a
          href={urlWhatsapp(perfil.contacto)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-3 py-2 font-bold [font-size:var(--text-xs)] uppercase tracking-[0.08em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            fontFamily: 'var(--font-lato)',
            borderRadius: '4px',
            backgroundColor: 'var(--po-ouro)',
            color: '#1A1410',
            outlineColor: 'var(--po-ouro)',
          }}
        >
          Escribir por WhatsApp
        </a>
      ) : mostrarForm ? (
        <FormMensajePrivado destinatarioId={perfil.id} />
      ) : (
        <button
          type="button"
          onClick={() => setMostrarForm(true)}
          aria-expanded={mostrarForm}
          className="inline-flex items-center justify-center px-3 py-2 font-bold [font-size:var(--text-xs)] uppercase tracking-[0.08em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            fontFamily: 'var(--font-lato)',
            borderRadius: '4px',
            backgroundColor: 'transparent',
            border: '1px solid var(--po-borde)',
            color: 'var(--po-pedra)',
            outlineColor: 'var(--po-ouro)',
          }}
        >
          Enviar mensaje privado
        </button>
      )}
    </div>
  )
}

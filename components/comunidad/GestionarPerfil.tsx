'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import type { PerfilParaGestion } from '@/lib/comunidad/perfil'

interface GestionarPerfilProps {
  id: string
  token: string
  perfil: PerfilParaGestion
}

const helperStyle: React.CSSProperties = {
  fontFamily: 'var(--font-dz-ui)',
  fontSize: 'var(--text-xs)',
  color: 'var(--dz-muted)',
}

const textoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-dz-ui)',
  fontSize: 'var(--text-sm)',
  color: 'var(--dz-ink)',
}

const tarjetaStyle: React.CSSProperties = {
  borderRadius: 'var(--dz-radius-card)',
  backgroundColor: 'var(--dz-papel)',
  border: '1px solid var(--dz-borde)',
  boxShadow: 'var(--dz-shadow-sm)',
}

export function GestionarPerfil({ id, token, perfil }: GestionarPerfilProps) {
  const [mostrarContacto, setMostrarContacto] = useState(perfil.mostrarContacto)
  const [guardando, setGuardando] = useState(false)
  const [confirmandoBaja, setConfirmandoBaja] = useState(false)
  const [borrado, setBorrado] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [aviso, setAviso] = useState('')

  async function aplicar(cuerpo: Record<string, unknown>) {
    const res = await fetch('/api/comunidad/gestionar/aplicar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, token, ...cuerpo }),
    })
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    if (!res.ok) throw new Error(data.error ?? 'No se pudo completar la acción.')
  }

  async function handleToggle(nuevoValor: boolean) {
    setErrorMsg('')
    setAviso('')
    setGuardando(true)
    // Optimista: el switch se mueve al instante y se revierte si el servidor dice que no.
    setMostrarContacto(nuevoValor)
    try {
      await aplicar({ accion: 'visibilidad', valor: nuevoValor })
      setAviso(nuevoValor ? 'Listo, tu teléfono ya se ve.' : 'Listo, tu teléfono ya no se ve.')
    } catch (e) {
      setMostrarContacto(!nuevoValor)
      setErrorMsg(e instanceof Error ? e.message : 'No se pudo guardar el cambio.')
    } finally {
      setGuardando(false)
    }
  }

  async function handleBorrar() {
    setErrorMsg('')
    setAviso('')
    setGuardando(true)
    try {
      await aplicar({ accion: 'borrar' })
      setBorrado(true)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'No se pudo dar de baja el perfil.')
    } finally {
      setGuardando(false)
    }
  }

  if (borrado) {
    return (
      <div className="flex flex-col gap-3 p-6" style={tarjetaStyle} role="status">
        <h2
          style={{
            fontFamily: 'var(--font-dz-display)',
            fontWeight: 700,
            fontSize: 'var(--text-lg)',
            color: 'var(--dz-ink)',
          }}
        >
          Tu perfil ya no está en el mapa
        </h2>
        <p className="leading-[var(--leading-cuerpo)]" style={textoStyle}>
          Borramos tus datos. No guardamos ninguna copia.
        </p>
        <p className="leading-[var(--leading-cuerpo)]" style={helperStyle}>
          Si algún día quieres volver, puedes{' '}
          <Link
            href="/comunidad"
            className="underline underline-offset-2"
            style={{ color: 'var(--dz-accent-text)' }}
          >
            registrarte de nuevo
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <p style={textoStyle}>
        Hola {perfil.nombre}. Desde aquí decides qué se ve de tu perfil.
      </p>

      {errorMsg && (
        <p
          className="p-4 [font-size:var(--text-sm)]"
          style={{
            borderRadius: '8px',
            border: '1px solid var(--color-coral)',
            backgroundColor: 'var(--dz-luz)',
            color: 'var(--color-coral)',
            fontFamily: 'var(--font-dz-ui)',
          }}
          role="alert"
        >
          {errorMsg}
        </p>
      )}

      {/* Visibilidad del teléfono */}
      <div className="flex flex-col gap-3 p-6" style={tarjetaStyle}>
        <label htmlFor="toggle-contacto" className="flex items-center gap-3 cursor-pointer">
          <input
            id="toggle-contacto"
            type="checkbox"
            checked={mostrarContacto}
            disabled={guardando}
            onChange={e => handleToggle(e.target.checked)}
            className="h-4 w-4 shrink-0 cursor-pointer"
            style={{ accentColor: 'var(--dz-accent)' }}
          />
          <span style={textoStyle}>Mostrar mi teléfono en mi perfil del mapa</span>
        </label>

        {/* El caso raro pero real: activar la casilla sin tener número guardado. Sin este
            aviso, la persona cree que publicó su teléfono y no publicó nada. */}
        {!perfil.tieneContacto && (
          <p className="leading-[var(--leading-cuerpo)]" style={helperStyle}>
            No tienes ningún número guardado, así que por ahora no hay nada que mostrar. Para
            añadirlo,{' '}
            <Link
              href="/comunidad"
              className="underline underline-offset-2"
              style={{ color: 'var(--dz-accent-text)' }}
            >
              vuelve a registrarte
            </Link>{' '}
            con los mismos datos y tu teléfono.
          </p>
        )}

        {aviso && (
          <p className="leading-[var(--leading-cuerpo)]" style={helperStyle} role="status">
            {aviso}
          </p>
        )}
      </div>

      {/* Baja */}
      <div className="flex flex-col gap-3 p-6" style={tarjetaStyle}>
        <h2
          style={{
            fontFamily: 'var(--font-dz-display)',
            fontWeight: 700,
            fontSize: 'var(--text-md)',
            color: 'var(--dz-ink)',
          }}
        >
          Darme de baja
        </h2>

        {!confirmandoBaja ? (
          <>
            <p className="leading-[var(--leading-cuerpo)]" style={helperStyle}>
              Quitamos tu perfil del mapa y borramos tus datos.
            </p>
            <Button
              type="button"
              variant="fantasma"
              onClick={() => setConfirmandoBaja(true)}
              disabled={guardando}
              className="self-start"
            >
              Darme de baja
            </Button>
          </>
        ) : (
          <>
            <p className="leading-[var(--leading-cuerpo)]" style={textoStyle}>
              Esto no se puede deshacer. Tu perfil desaparece del mapa y no guardamos ninguna
              copia de tus datos.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={handleBorrar} disabled={guardando} className="self-start">
                {guardando ? 'Borrando…' : 'Sí, borrar mi perfil'}
              </Button>
              <Button
                type="button"
                variant="fantasma"
                onClick={() => setConfirmandoBaja(false)}
                disabled={guardando}
                className="self-start"
              >
                Mejor no
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

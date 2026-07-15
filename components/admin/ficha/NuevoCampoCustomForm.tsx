'use client'

import { useState, type FormEvent } from 'react'
import { useAdminAction } from '@/components/admin/ficha/useAdminAction'
import type { TipoCampoCustom } from '@/components/admin/ficha/camposCustomTypes'

const TIPOS: { value: TipoCampoCustom; label: string }[] = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'boolean', label: 'Sí / No' },
  { value: 'date', label: 'Fecha' },
  { value: 'select', label: 'Selección única' },
  { value: 'multiselect', label: 'Selección múltiple' },
]

const inputStyle: React.CSSProperties = {
  padding: '8px 10px', border: '1px solid var(--color-arena)', borderRadius: '4px',
  fontSize: '13px', fontFamily: 'var(--font-ui)', color: 'var(--color-granito)',
  background: 'var(--color-blanco)', width: '100%',
}

/**
 * Form para dar de alta una definición de campo personalizado nueva. La clave se deriva
 * de la etiqueta (slug simple) — no se pide por separado para no duplicar el dato que el
 * usuario ya escribe en "Nombre del campo".
 */
export function NuevoCampoCustomForm() {
  const { run, loading, error } = useAdminAction()
  const [abierto, setAbierto] = useState(false)
  const [etiqueta, setEtiqueta] = useState('')
  const [tipo, setTipo] = useState<TipoCampoCustom>('text')
  const [opcionesTexto, setOpcionesTexto] = useState('')

  const requiereOpciones = tipo === 'select' || tipo === 'multiselect'

  // normalize('NFD') separa cada letra acentuada en base + marca diacrítica (ej. "é" →
  // "e" + acento combinante); como esa marca no es a-z0-9, el replace de abajo ya la
  // descarta sola — no hace falta un paso extra para "quitar acentos".
  function slugify(texto: string): string {
    return texto
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const etiquetaLimpia = etiqueta.trim()
    const clave = slugify(etiquetaLimpia)
    if (!etiquetaLimpia || !clave) return

    const opciones = requiereOpciones
      ? opcionesTexto.split(',').map(o => o.trim()).filter(Boolean)
      : undefined
    if (requiereOpciones && (!opciones || opciones.length === 0)) return

    const ok = await run(
      () => fetch('/api/admin/campos-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave, etiqueta: etiquetaLimpia, tipo, ...(opciones ? { opciones } : {}) }),
      }),
      'No se pudo crear el campo. Reintentá.',
    )
    if (ok) {
      setEtiqueta('')
      setTipo('text')
      setOpcionesTexto('')
      setAbierto(false)
    }
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        style={{
          fontSize: '13px', color: 'var(--color-laton-text)', background: 'none',
          border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 500,
          padding: '8px 0',
        }}
      >
        + Agregar campo nuevo
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px',
        padding: '14px', background: 'var(--color-niebla)', borderRadius: '6px',
      }}
    >
      <input
        autoFocus
        value={etiqueta}
        onChange={e => setEtiqueta(e.target.value)}
        placeholder="Nombre del campo (ej. Presupuesto máximo negociado)"
        disabled={loading}
        style={inputStyle}
      />
      <select value={tipo} onChange={e => setTipo(e.target.value as TipoCampoCustom)} disabled={loading} style={inputStyle}>
        {TIPOS.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
      {requiereOpciones && (
        <input
          value={opcionesTexto}
          onChange={e => setOpcionesTexto(e.target.value)}
          placeholder="Opciones separadas por coma (ej. Alta, Media, Baja)"
          disabled={loading}
          style={inputStyle}
        />
      )}

      {error && (
        <span style={{ fontSize: '11px', color: 'var(--color-estado-error)', fontFamily: 'var(--font-ui)' }}>
          {error}
        </span>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="submit"
          disabled={loading || !etiqueta.trim()}
          style={{
            padding: '6px 16px', borderRadius: '4px', border: 'none',
            background: 'var(--color-granito)', color: 'var(--color-blanco)',
            fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 500,
            cursor: loading ? 'default' : 'pointer', opacity: loading || !etiqueta.trim() ? 0.6 : 1,
          }}
        >
          {loading ? 'Creando…' : 'Crear campo'}
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          disabled={loading}
          style={{
            padding: '6px 16px', borderRadius: '4px', border: '1px solid var(--color-arena)',
            background: 'var(--color-blanco)', color: 'var(--color-pizarra)',
            fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

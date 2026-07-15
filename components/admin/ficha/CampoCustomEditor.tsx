'use client'

import { useState } from 'react'
import { useAdminAction } from '@/components/admin/ficha/useAdminAction'
import { formatValue } from '@/components/admin/ui/AdminPrimitives'
import type { CampoCustomDefinicion } from '@/components/admin/ficha/camposCustomTypes'

interface Props {
  leadId: string
  definicion: CampoCustomDefinicion
  valorActual: unknown
}

const inputStyle: React.CSSProperties = {
  padding: '6px 8px', border: '1px solid var(--color-arena)', borderRadius: '4px',
  fontSize: '13px', fontFamily: 'var(--font-ui)', color: 'var(--color-granito)',
  background: 'var(--color-blanco)',
}

function valorInicialTexto(tipo: CampoCustomDefinicion['tipo'], valorActual: unknown): string {
  if (tipo === 'multiselect') return ''
  if (tipo === 'boolean') return ''
  if (valorActual === null || valorActual === undefined) return ''
  return String(valorActual)
}

function valorInicialMulti(valorActual: unknown): string[] {
  return Array.isArray(valorActual) ? (valorActual as string[]) : []
}

/** Un campo personalizado dentro de la Ficha 360°: valor en modo lectura, con edición inline según `tipo`. */
export function CampoCustomEditor({ leadId, definicion, valorActual }: Props) {
  const { run, loading, error } = useAdminAction()
  const [editando, setEditando] = useState(false)
  const [valorTexto, setValorTexto] = useState(() => valorInicialTexto(definicion.tipo, valorActual))
  const [valorBool, setValorBool] = useState(() => valorActual === true)
  const [valorMulti, setValorMulti] = useState<string[]>(() => valorInicialMulti(valorActual))

  // El PATCH de /api/admin/leads/[id]/campos-custom valida `valor` con typeof estricto
  // contra definicion.tipo (ver valorValidoParaTipo en esa route) y rechaza `null` para
  // cualquier tipo — no hay semántica de "vaciar el campo" en el contrato actual. Por eso
  // text/date/select mandan '' (sigue siendo string, pasa la validación) y number exige un
  // valor numérico real: el botón Guardar se deshabilita si el input está vacío o no es un
  // número válido, en vez de intentar mandar null.
  const numeroInvalido = definicion.tipo === 'number' && (valorTexto.trim() === '' || Number.isNaN(Number(valorTexto)))

  async function guardar() {
    let valor: string | number | boolean | string[]
    switch (definicion.tipo) {
      case 'number':
        valor = Number(valorTexto)
        break
      case 'boolean':
        valor = valorBool
        break
      case 'multiselect':
        valor = valorMulti
        break
      default:
        valor = valorTexto
    }

    const ok = await run(
      () => fetch(`/api/admin/leads/${leadId}/campos-custom`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave: definicion.clave, valor }),
      }),
      'No se pudo guardar. Reintentá.',
    )
    if (ok) setEditando(false)
  }

  function cancelar() {
    setEditando(false)
    setValorTexto(valorInicialTexto(definicion.tipo, valorActual))
    setValorBool(valorActual === true)
    setValorMulti(valorInicialMulti(valorActual))
  }

  function toggleOpcionMulti(opcion: string) {
    setValorMulti(prev => (prev.includes(opcion) ? prev.filter(o => o !== opcion) : [...prev, opcion]))
  }

  if (!editando) {
    return (
      <div style={{
        display: 'grid', gridTemplateColumns: '200px 1fr auto', gap: '8px', alignItems: 'center',
        padding: '8px 0', borderBottom: '1px solid var(--color-arena)',
      }}>
        <span style={{ fontSize: '13px', color: 'var(--color-pizarra)', fontFamily: 'var(--font-ui)' }}>
          {definicion.etiqueta}
        </span>
        <span style={{ fontSize: '14px', color: 'var(--color-granito)', fontFamily: 'var(--font-ui)' }}>
          {formatValue(valorActual)}
        </span>
        <button
          onClick={() => setEditando(true)}
          style={{
            fontSize: '12px', color: 'var(--color-laton-text)', background: 'none',
            border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 500,
          }}
        >
          Editar
        </button>
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '200px 1fr', gap: '8px',
      padding: '10px 0', borderBottom: '1px solid var(--color-arena)',
    }}>
      <span style={{ fontSize: '13px', color: 'var(--color-pizarra)', fontFamily: 'var(--font-ui)', paddingTop: '6px' }}>
        {definicion.etiqueta}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {definicion.tipo === 'text' && (
          <input style={inputStyle} value={valorTexto} onChange={e => setValorTexto(e.target.value)} disabled={loading} />
        )}
        {definicion.tipo === 'number' && (
          <input style={inputStyle} type="number" value={valorTexto} onChange={e => setValorTexto(e.target.value)} disabled={loading} />
        )}
        {definicion.tipo === 'date' && (
          <input style={inputStyle} type="date" value={valorTexto} onChange={e => setValorTexto(e.target.value)} disabled={loading} />
        )}
        {definicion.tipo === 'boolean' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontFamily: 'var(--font-ui)', color: 'var(--color-granito)' }}>
            <input type="checkbox" checked={valorBool} onChange={e => setValorBool(e.target.checked)} disabled={loading} />
            {valorBool ? 'Sí' : 'No'}
          </label>
        )}
        {definicion.tipo === 'select' && (
          <select style={inputStyle} value={valorTexto} onChange={e => setValorTexto(e.target.value)} disabled={loading}>
            <option value="">— Sin definir —</option>
            {(definicion.opciones ?? []).map(op => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        )}
        {definicion.tipo === 'multiselect' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {(definicion.opciones ?? []).map(op => (
              <label key={op} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontFamily: 'var(--font-ui)', color: 'var(--color-granito)' }}>
                <input type="checkbox" checked={valorMulti.includes(op)} onChange={() => toggleOpcionMulti(op)} disabled={loading} />
                {op}
              </label>
            ))}
          </div>
        )}

        {error && (
          <span style={{ fontSize: '11px', color: 'var(--color-estado-error)', fontFamily: 'var(--font-ui)' }}>
            {error}
          </span>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => void guardar()}
            disabled={loading || numeroInvalido}
            style={{
              padding: '5px 14px', borderRadius: '4px', border: 'none',
              background: 'var(--color-granito)', color: 'var(--color-blanco)',
              fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 500,
              cursor: loading || numeroInvalido ? 'default' : 'pointer', opacity: loading || numeroInvalido ? 0.6 : 1,
            }}
          >
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
          <button
            onClick={cancelar}
            disabled={loading}
            style={{
              padding: '5px 14px', borderRadius: '4px', border: '1px solid var(--color-arena)',
              background: 'var(--color-blanco)', color: 'var(--color-pizarra)',
              fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

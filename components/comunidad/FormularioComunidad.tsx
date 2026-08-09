'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { ACTIVIDADES, type Actividad, type ComunidadRegistroInput } from '@/lib/comunidad/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

const CIUDADES = ['Vigo', 'A Coruña', 'Santiago de Compostela', 'Pontevedra', 'Lugo']

const inputBase =
  'w-full rounded border px-4 py-3 [font-size:var(--text-sm)] placeholder:opacity-50 focus:outline-none focus:ring-1 transition-colors'

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-dz-ui)',
  borderRadius: 'var(--dz-radius-input)',
  borderColor: 'var(--dz-borde)',
  backgroundColor: 'var(--dz-luz)',
  color: 'var(--dz-ink)',
}

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: 'var(--color-coral)',
}

const labelClass = '[font-size:var(--text-sm)] font-medium'
const labelStyle: React.CSSProperties = { fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-ink)' }
const helperStyle: React.CSSProperties = {
  fontFamily: 'var(--font-dz-ui)',
  fontSize: 'var(--text-xs)',
  color: 'var(--dz-muted)',
}
const errorClass = 'mt-1 [font-size:var(--text-xs)]'
const errorStyle: React.CSSProperties = { fontFamily: 'var(--font-dz-ui)', color: 'var(--color-coral)' }
const requiredMark = (
  <span aria-hidden="true" style={{ color: 'var(--color-coral)' }}>
    {' '}*
  </span>
)

interface FormErrors {
  email?: string
  nombre?: string
  calle1?: string
  calle2?: string
  ciudad?: string
  disponibilidad?: string
  rgpd?: string
}

export function FormularioComunidad() {
  const [email, setEmail] = useState('')
  const [calle1, setCalle1] = useState('')
  const [calle2, setCalle2] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [nombre, setNombre] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [disponibilidad, setDisponibilidad] = useState<Actividad[]>([])
  const [contacto, setContacto] = useState('')
  const [rgpd, setRgpd] = useState(false)

  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<FormErrors>({})
  const [errorUbicacion, setErrorUbicacion] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  function toggleActividad(id: Actividad) {
    setDisponibilidad(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  function handleCalle1Change(value: string) {
    setCalle1(value)
    if (errorUbicacion) setErrorUbicacion('')
  }

  function handleCalle2Change(value: string) {
    setCalle2(value)
    if (errorUbicacion) setErrorUbicacion('')
  }

  function validate(): FormErrors {
    const next: FormErrors = {}
    if (!email.trim()) next.email = 'Indica tu email.'
    if (!nombre.trim()) next.nombre = 'Indica tu nombre o alias.'
    if (!calle1.trim()) next.calle1 = 'Indica la primera calle.'
    if (!calle2.trim()) next.calle2 = 'Indica la segunda calle.'
    if (!ciudad) next.ciudad = 'Selecciona una ciudad.'
    if (disponibilidad.length === 0) next.disponibilidad = 'Selecciona al menos una opción.'
    if (!rgpd) next.rgpd = 'Debes aceptar la política de privacidad para continuar.'
    return next
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorUbicacion('')
    setErrorMsg('')

    const validation = validate()
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }
    setErrors({})
    setStatus('loading')

    const body: ComunidadRegistroInput = {
      email,
      nombre,
      fotoUrl: fotoUrl.trim() || undefined,
      calle1,
      calle2,
      ciudad,
      disponibilidad,
      contacto: contacto.trim() || undefined,
      rgpd,
    }

    try {
      const res = await fetch('/api/comunidad/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        // Ya no se redirige al mapa: el perfil todavía no existe. El alta se completa
        // recién cuando la persona abre el enlace del correo (§5.6 de docs/arranque.md).
        setStatus('success')
        return
      }

      const data = (await res.json().catch(() => ({}))) as { error?: string }

      if (res.status === 422) {
        setErrorUbicacion(
          data.error ?? 'No pudimos ubicar esa intersección. Revisa las dos calles e inténtalo de nuevo.'
        )
      } else {
        setErrorMsg(data.error ?? 'Error al enviar. Intenta de nuevo.')
      }
      setStatus('error')
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.')
      setStatus('error')
    }
  }

  // El formulario se reemplaza entero: dejarlo visible invitaría a reenviarlo pensando que
  // no funcionó, y cada reenvío es otro correo. Lo único que falta ahora está en la casilla.
  if (status === 'success') {
    return (
      <div
        className="flex flex-col gap-4 p-6"
        style={{
          borderRadius: 'var(--dz-radius-card)',
          backgroundColor: 'var(--dz-papel)',
          border: '1px solid var(--dz-borde)',
          boxShadow: 'var(--dz-shadow-sm)',
        }}
        role="status"
      >
        <h2
          style={{
            fontFamily: 'var(--font-dz-display)',
            fontWeight: 700,
            fontSize: 'var(--text-lg)',
            color: 'var(--dz-ink)',
          }}
        >
          Revisa tu correo
        </h2>
        <p className="leading-[var(--leading-cuerpo)]" style={{ ...helperStyle, fontSize: 'var(--text-sm)' }}>
          Te enviamos un enlace a <strong style={{ color: 'var(--dz-ink)' }}>{email.trim()}</strong>.
          Ábrelo y tu perfil aparece en el mapa.
        </p>
        <p className="leading-[var(--leading-cuerpo)]" style={helperStyle}>
          El enlace vale 24 horas. Si no lo ves, mira en la carpeta de spam.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10">

      {status === 'error' && errorMsg && (
        <div
          className="p-4 [font-size:var(--text-sm)]"
          style={{ borderRadius: '8px', border: '1px solid var(--color-coral)', backgroundColor: 'var(--dz-luz)', color: 'var(--color-coral)' }}
          role="alert"
        >
          {errorMsg}
        </div>
      )}

      {/* Bloque 1: Email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={labelClass} style={labelStyle}>
          Email{requiredMark}
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={inputBase}
          style={errors.email ? inputErrorStyle : inputStyle}
          placeholder="maria@ejemplo.com"
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className={errorClass} style={errorStyle} role="alert">{errors.email}</p>
        )}
      </div>

      {/* Bloque 2: Ubicación con privacidad */}
      <div
        className="flex flex-col gap-4 p-6"
        style={{ borderRadius: 'var(--dz-radius-card)', backgroundColor: 'var(--dz-papel)', border: '1px solid var(--dz-borde)', boxShadow: 'var(--dz-shadow-sm)' }}
      >
        <div className="flex flex-col gap-1">
          <h2
            style={{ fontFamily: 'var(--font-dz-display)', fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--dz-ink)' }}
          >
            Tu ubicación, con privacidad
          </h2>
          <p className="leading-[var(--leading-cuerpo)]" style={helperStyle}>
            No te pedimos tu dirección exacta ni el número de tu casa. Con el cruce de estas dos
            calles creamos un círculo de privacidad de unos 200 metros alrededor de tu zona —
            así apareces en el mapa sin revelar dónde vives exactamente.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="calle1" className={labelClass} style={labelStyle}>
              Primera calle{requiredMark}
            </label>
            <input
              id="calle1"
              type="text"
              required
              value={calle1}
              onChange={e => handleCalle1Change(e.target.value)}
              className={inputBase}
              style={errors.calle1 || errorUbicacion ? inputErrorStyle : inputStyle}
              placeholder="Rúa do Príncipe"
              aria-describedby={errors.calle1 ? 'calle1-error' : undefined}
            />
            {errors.calle1 && (
              <p id="calle1-error" className={errorClass} style={errorStyle} role="alert">{errors.calle1}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="calle2" className={labelClass} style={labelStyle}>
              Segunda calle{requiredMark}
            </label>
            <input
              id="calle2"
              type="text"
              required
              value={calle2}
              onChange={e => handleCalle2Change(e.target.value)}
              className={inputBase}
              style={errors.calle2 || errorUbicacion ? inputErrorStyle : inputStyle}
              placeholder="Rúa Urzáiz"
              aria-describedby={errors.calle2 ? 'calle2-error' : undefined}
            />
            {errors.calle2 && (
              <p id="calle2-error" className={errorClass} style={errorStyle} role="alert">{errors.calle2}</p>
            )}
          </div>
        </div>

        {errorUbicacion && (
          <p className={errorClass} style={errorStyle} role="alert">{errorUbicacion}</p>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="ciudad" className={labelClass} style={labelStyle}>
            Ciudad{requiredMark}
          </label>
          <select
            id="ciudad"
            required
            value={ciudad}
            onChange={e => setCiudad(e.target.value)}
            className={inputBase}
            style={errors.ciudad ? inputErrorStyle : inputStyle}
            aria-describedby={errors.ciudad ? 'ciudad-error' : undefined}
          >
            <option value="" disabled>Selecciona una ciudad</option>
            {CIUDADES.map(nombreCiudad => (
              <option key={nombreCiudad} value={nombreCiudad}>{nombreCiudad}</option>
            ))}
          </select>
          {errors.ciudad && (
            <p id="ciudad-error" className={errorClass} style={errorStyle} role="alert">{errors.ciudad}</p>
          )}
        </div>
      </div>

      {/* Bloque 3: Perfil y disponibilidad */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="nombre" className={labelClass} style={labelStyle}>
            Nombre o alias{requiredMark}
          </label>
          <input
            id="nombre"
            type="text"
            required
            autoComplete="name"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className={inputBase}
            style={errors.nombre ? inputErrorStyle : inputStyle}
            placeholder="Marta"
            aria-describedby={errors.nombre ? 'nombre-error' : undefined}
          />
          {errors.nombre && (
            <p id="nombre-error" className={errorClass} style={errorStyle} role="alert">{errors.nombre}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="fotoUrl" className={labelClass} style={labelStyle}>
            Foto <span className="font-normal opacity-60">(opcional)</span>
          </label>
          <input
            id="fotoUrl"
            type="url"
            value={fotoUrl}
            onChange={e => setFotoUrl(e.target.value)}
            className={inputBase}
            style={inputStyle}
            placeholder="https://..."
          />
          <p className="leading-[var(--leading-cuerpo)]" style={helperStyle}>
            Pega el enlace a una foto tuya que ya esté publicada en internet (por ejemplo, tu
            foto de perfil en redes sociales). Todavía no tenemos un sistema para subir
            archivos directamente.
          </p>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className={labelClass} style={labelStyle}>
            ¿Cómo te gustaría ayudar?{requiredMark}
          </legend>
          <div className="flex flex-col gap-2 mt-1">
            {ACTIVIDADES.map(actividad => (
              <label
                key={actividad.id}
                htmlFor={`actividad-${actividad.id}`}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  id={`actividad-${actividad.id}`}
                  type="checkbox"
                  checked={disponibilidad.includes(actividad.id)}
                  onChange={() => toggleActividad(actividad.id)}
                  className="h-4 w-4 shrink-0 cursor-pointer"
                  style={{ accentColor: 'var(--dz-accent)' }}
                />
                <span style={{ fontFamily: 'var(--font-dz-ui)', fontSize: 'var(--text-sm)', color: 'var(--dz-ink)' }}>
                  {actividad.label}
                </span>
              </label>
            ))}
          </div>
          {errors.disponibilidad && (
            <p className={errorClass} style={errorStyle} role="alert">{errors.disponibilidad}</p>
          )}
        </fieldset>
      </div>

      {/* Bloque 4: Contacto */}
      <div className="flex flex-col gap-2">
        <label htmlFor="contacto" className={labelClass} style={labelStyle}>
          Teléfono / WhatsApp <span className="font-normal opacity-60">(opcional)</span>
        </label>
        <input
          id="contacto"
          type="tel"
          autoComplete="tel"
          value={contacto}
          onChange={e => setContacto(e.target.value)}
          className={inputBase}
          style={inputStyle}
          placeholder="+34 600 123 456"
        />
        {/* El texto anterior decía que dejar el campo vacío era lo que evitaba exponer el
            número. Dejó de ser cierto con la migración 0010 (PII-01): ahora el teléfono no se
            muestra nunca por defecto, lo llenes o no, y la visibilidad depende de
            `mostrar_contacto` —hoy se activa a pedido— y no de si el campo tiene algo. */}
        <p className="leading-[var(--leading-cuerpo)]" style={helperStyle}>
          Tu número no se muestra en el mapa. Quien te vea podrá escribirte igual: verá un botón
          para enviarte un mensaje privado, que te llega por email. Si prefieres que se muestre,
          escríbenos y lo activamos.
        </p>
      </div>

      {/* RGPD */}
      <div className="flex items-start gap-2">
        {/* El input mide 16x16, por debajo del minimo de 24x24 de WCAG 2.2 AA
            (criterio 2.5.8), y a diferencia del resto de los checkboxes del sitio
            no esta envuelto por su label, asi que ese cuadradito era el unico
            objetivo compacto (auditoria responsive 2026-07-26). Este label
            envolvente le da 24x24 de area clickeable sin agrandar el visual.
            Va vacio a proposito: el nombre accesible lo sigue aportando el label
            de texto de abajo, asociado al mismo id. */}
        <label
          htmlFor="rgpd"
          className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center"
        >
          <input
            id="rgpd"
            type="checkbox"
            required
            checked={rgpd}
            onChange={e => setRgpd(e.target.checked)}
            className="h-4 w-4 cursor-pointer"
            style={{ accentColor: 'var(--dz-accent)' }}
            aria-describedby={errors.rgpd ? 'rgpd-error' : undefined}
          />
        </label>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="rgpd"
            className="[font-size:var(--text-xs)] leading-[var(--leading-cuerpo)] cursor-pointer"
            style={{ fontFamily: 'var(--font-dz-ui)', color: 'var(--dz-muted)' }}
          >
            He leído y acepto la{' '}
            <Link
              href="/politica-de-privacidad"
              className="underline underline-offset-2 transition-colors"
              style={{ color: 'var(--dz-accent-text)' }}
              target="_blank"
            >
              política de privacidad
            </Link>
            . Mis datos, incluida mi ubicación aproximada, serán tratados únicamente para
            conectarme con la comunidad.
          </label>
          {errors.rgpd && (
            <p id="rgpd-error" className={errorClass} style={errorStyle} role="alert">{errors.rgpd}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="self-start inline-flex items-center justify-center px-8 py-4 font-bold [font-size:var(--text-sm)] tracking-[0.10em] uppercase disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          fontFamily: 'var(--font-dz-ui)',
          borderRadius: '999px',
          backgroundColor: 'var(--dz-accent)',
          color: '#1A1410',
          outlineColor: 'var(--dz-accent)',
          boxShadow: 'var(--dz-shadow-md)',
        }}
      >
        {status === 'loading' ? 'Enviando…' : 'Unirme al mapa de la comunidad'}
      </button>
    </form>
  )
}

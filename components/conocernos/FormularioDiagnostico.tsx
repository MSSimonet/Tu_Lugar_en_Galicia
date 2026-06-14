'use client'

import { useState, FormEvent, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '@/lib/config/site'
import type { LeadData } from '@/lib/leads'

// ─── Types ────────────────────────────────────────────────────────────────────

type FormStatus = 'idle' | 'loading' | 'success' | 'partial' | 'error'

type FormState = {
  // Contacto
  nombreCompleto: string
  email: string
  telefono: string
  paisResidencia: string
  // Familia
  adultos: '1' | '2' | '3' | '4+' | ''
  hayMenores: 'si' | 'no' | ''
  ninos: '0' | '1' | '2' | '3+' | ''
  adolescentes: '0' | '1' | '2' | '3+' | ''
  mascotas: 'si' | 'no' | ''
  mascotaTipo: ('perro' | 'gato' | 'otro')[]
  mascotaPeso: '0-5 kg' | '5-10 kg' | '+10 kg' | ''
  // Legal y económica
  documentacion: LeadData['documentacion'] | ''
  situacionLaboral: LeadData['situacionLaboral'] | ''
  ingresosMensuales: string
  garantias: ('garantia-adicional' | 'aval-bancario' | 'avalista' | 'seguro-impago' | 'ninguna')[]
  // Vivienda
  ciudadDestino: LeadData['ciudadDestino'] | ''
  tipoInmueble: 'habitacion' | 'estudio' | 'piso' | 'casa' | 'co-living' | ''
  presupuestoMensual: 'menos-700' | '700-1000' | '1000-1400' | 'mas-1400' | ''
  habitacionesMinimas: '1' | '2' | '3' | '4+' | ''
  amueblado: LeadData['amueblado'] | ''
  imprescindibles: ('ascensor' | 'garaje' | 'calefaccion' | 'terraza' | 'no')[]
  comodidades: ('transporte' | 'zona-tranquila' | 'cerca-colegios' | 'internet' | 'ninguna')[]
  // Perfil y plazos
  necesidadesEspeciales: 'si' | 'no' | ''
  profesion: string
  fechaLlegada: string
  // Para terminar
  comoNosConociste: 'instagram' | 'facebook' | 'tiktok' | 'google' | 'recomendacion' | 'otro' | ''
  comprendeServicio: boolean
  consentimientoRGPD: boolean
}

type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL_STATE: FormState = {
  nombreCompleto: '',
  email: '',
  telefono: '',
  paisResidencia: '',
  adultos: '',
  hayMenores: '',
  ninos: '',
  adolescentes: '',
  mascotas: '',
  mascotaTipo: [],
  mascotaPeso: '',
  documentacion: '',
  situacionLaboral: '',
  ingresosMensuales: '',
  garantias: [],
  ciudadDestino: '',
  tipoInmueble: '',
  presupuestoMensual: '',
  habitacionesMinimas: '',
  amueblado: '',
  imprescindibles: [],
  comodidades: [],
  necesidadesEspeciales: '',
  profesion: '',
  fechaLlegada: '',
  comoNosConociste: '',
  comprendeServicio: false,
  consentimientoRGPD: false,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}

  if (!form.nombreCompleto.trim())
    errors.nombreCompleto = 'Necesitamos tu nombre para poder dirigirnos a ti'
  if (!form.email.trim())
    errors.email = 'Necesitamos tu email para poder contactarte'
  else if (!isValidEmail(form.email))
    errors.email = 'Ese email no parece tener el formato correcto (ej: nombre@correo.com)'
  if (!form.telefono.trim())
    errors.telefono = 'Incluí tu teléfono con el código de país'
  if (!form.paisResidencia.trim())
    errors.paisResidencia = 'Cuéntanos desde qué país nos escribes'
  if (!form.adultos)
    errors.adultos = 'Indícanos cuántos adultos se mudan'
  if (!form.hayMenores)
    errors.hayMenores = 'Indícanos si viajan menores de edad'
  if (form.hayMenores === 'si' && !form.ninos)
    errors.ninos = 'Indícanos cuántos niños de 0 a 12 años'
  if (form.hayMenores === 'si' && !form.adolescentes)
    errors.adolescentes = 'Indícanos cuántos adolescentes de 13 a 17 años'
  if (!form.mascotas)
    errors.mascotas = 'Indícanos si viajan con mascotas'
  if (form.mascotas === 'si' && form.mascotaTipo.length === 0)
    errors.mascotaTipo = 'Indícanos qué tipo de mascota traes'
  if (form.mascotas === 'si' && form.mascotaTipo.includes('perro') && !form.mascotaPeso)
    errors.mascotaPeso = 'Indícanos el peso aproximado de tu perro'
  if (!form.documentacion)
    errors.documentacion = 'Selecciona tu situación de documentación'
  if (!form.situacionLaboral)
    errors.situacionLaboral = 'Selecciona tu situación laboral al llegar'
  if (!form.ingresosMensuales)
    errors.ingresosMensuales = 'Indícanos tu rango de ingresos mensuales'
  if (form.garantias.length === 0)
    errors.garantias = 'Selecciona al menos una opción de garantía (aunque sea ninguna)'
  if (!form.ciudadDestino)
    errors.ciudadDestino = 'Elige una ciudad de destino'
  if (!form.tipoInmueble)
    errors.tipoInmueble = 'Selecciona el tipo de vivienda que buscas'
  if (!form.presupuestoMensual)
    errors.presupuestoMensual = 'Indícanos tu presupuesto mensual de alquiler'
  if (form.tipoInmueble !== 'estudio' && !form.habitacionesMinimas)
    errors.habitacionesMinimas = 'Indícanos cuántas habitaciones necesitas'
  if (!form.amueblado)
    errors.amueblado = 'Indícanos si necesitas la vivienda amueblada'
  if (!form.fechaLlegada)
    errors.fechaLlegada = 'Indícanos en qué plazo necesitas resolver tu vivienda'
  if (!form.comprendeServicio)
    errors.comprendeServicio = 'Es importante que entiendas cómo funciona el servicio antes de continuar'
  if (!form.consentimientoRGPD)
    errors.consentimientoRGPD = 'Necesitamos tu consentimiento para tratar tus datos'

  return errors
}

// Toggle multiselect con opción excluyente — replica lógica de GinaButtons
function toggleExclusivo<T extends string>(
  current: T[],
  value: T,
  exclusivaValue: T | null,
): T[] {
  if (exclusivaValue && value === exclusivaValue) {
    return current.includes(value) ? [] : [value]
  }
  const sinExclusiva = exclusivaValue ? current.filter((v) => v !== exclusivaValue) : current
  return sinExclusiva.includes(value)
    ? sinExclusiva.filter((v) => v !== value)
    : [...sinExclusiva, value]
}

// ─── Shared field styles ───────────────────────────────────────────────────────

const inputBase =
  'w-full border border-[var(--color-arena)] bg-[var(--color-blanco)] ' +
  'rounded-[var(--radius-card)] px-[var(--space-4)] py-[var(--space-3)] ' +
  'font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-granito)] ' +
  'outline-none focus:ring-2 focus:ring-[var(--color-laton)] focus:border-transparent ' +
  'transition-all duration-150 placeholder:text-[var(--color-arena)]'

const inputError = 'border-[var(--color-coral)] focus:ring-[var(--color-coral)]'

const labelClass =
  'block font-[family-name:var(--font-ui)] font-medium text-[var(--text-sm)] ' +
  'text-[var(--color-granito)] mb-1.5'

const errorClass = 'mt-[var(--space-1)] text-[var(--text-xs)] text-[#922B21]'

const sectionTitleClass =
  'font-[family-name:var(--font-titular)] text-[var(--text-lg)] ' +
  'text-[var(--color-granito)] font-semibold mb-[var(--space-6)]'

const sectionClass = 'flex flex-col gap-[var(--space-6)]'

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldWrapper({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className={errorClass} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function RadioGroup({
  name,
  options,
  value,
  onChange,
  error,
  labelId,
}: {
  name: string
  options: { value: string; label: string }[]
  value: string
  onChange: (val: string) => void
  error?: string
  labelId?: string
}) {
  return (
    <div>
      <div className="flex flex-col gap-[var(--space-2)]" role="radiogroup" aria-labelledby={labelId}>
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-[var(--space-3)] cursor-pointer font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)]"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="accent-[var(--color-laton)] w-4 h-4 cursor-pointer"
            />
            {opt.label}
          </label>
        ))}
      </div>
      {error && <p className={errorClass} role="alert">{error}</p>}
    </div>
  )
}

function CheckboxGroup<T extends string>({
  options,
  selected,
  onToggle,
  exclusivaValue,
  error,
  labelId,
}: {
  options: { value: T; label: string }[]
  selected: T[]
  onToggle: (val: T) => void
  exclusivaValue?: T
  error?: string
  labelId?: string
}) {
  const exclusivaActiva = !!exclusivaValue && selected.includes(exclusivaValue)
  const hayNoExclusiva = !!exclusivaValue && selected.some((v) => v !== exclusivaValue)

  return (
    <div>
      <div className="flex flex-col gap-[var(--space-2)]" role="group" aria-labelledby={labelId}>
        {options.map((opt) => {
          const bloqueado =
            (exclusivaActiva && opt.value !== exclusivaValue) ||
            (hayNoExclusiva && opt.value === exclusivaValue)
          return (
            <label
              key={opt.value}
              className={`flex items-center gap-[var(--space-3)] font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] ${bloqueado ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <input
                type="checkbox"
                value={opt.value}
                checked={selected.includes(opt.value)}
                onChange={() => !bloqueado && onToggle(opt.value)}
                disabled={bloqueado}
                className="accent-[var(--color-laton)] w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
              />
              {opt.label}
            </label>
          )
        })}
      </div>
      {error && <p className={errorClass} role="alert">{error}</p>}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function FormularioDiagnostico() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<FormStatus>('idle')
  const formRef = useRef<HTMLFormElement>(null)

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function toggleGarantia(val: LeadData['garantias'][number]) {
    const next = toggleExclusivo(form.garantias, val, 'ninguna' as LeadData['garantias'][number])
    setForm((prev) => ({ ...prev, garantias: next }))
    if (errors.garantias) setErrors((prev) => ({ ...prev, garantias: undefined }))
  }

  function toggleMascotaTipo(val: 'perro' | 'gato' | 'otro') {
    const next = form.mascotaTipo.includes(val)
      ? form.mascotaTipo.filter((v) => v !== val)
      : [...form.mascotaTipo, val]
    setForm((prev) => ({
      ...prev,
      mascotaTipo: next,
      // Limpiar peso si se deselecciona perro
      mascotaPeso: val === 'perro' && prev.mascotaTipo.includes(val) ? '' : prev.mascotaPeso,
    }))
    if (errors.mascotaTipo) setErrors((prev) => ({ ...prev, mascotaTipo: undefined }))
  }

  function toggleImprescindible(val: FormState['imprescindibles'][number]) {
    const next = toggleExclusivo(form.imprescindibles, val, 'no' as typeof val)
    setForm((prev) => ({ ...prev, imprescindibles: next }))
  }

  function toggleComodidad(val: FormState['comodidades'][number]) {
    const next = toggleExclusivo(form.comodidades, val, 'ninguna' as typeof val)
    setForm((prev) => ({ ...prev, comodidades: next }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const firstKey = Object.keys(validationErrors)[0]
      const el = document.getElementById(firstKey) ?? document.getElementById(`${firstKey}-error`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setStatus('loading')

    const hayEstudio = form.tipoInmueble === 'estudio'

    try {
      const payload: LeadData = {
        // Contacto
        nombreCompleto: form.nombreCompleto,
        email: form.email,
        telefono: form.telefono,
        paisResidencia: form.paisResidencia,
        // Familia
        adultos: form.adultos as LeadData['adultos'],
        ...(form.hayMenores === 'si' && form.ninos
          ? { ninos: form.ninos as LeadData['ninos'] }
          : {}),
        ...(form.hayMenores === 'si' && form.adolescentes
          ? { adolescentes: form.adolescentes as LeadData['adolescentes'] }
          : {}),
        mascotas: form.mascotas as 'si' | 'no',
        ...(form.mascotas === 'si' && form.mascotaTipo.length > 0
          ? { mascotaTipo: form.mascotaTipo }
          : {}),
        ...(form.mascotas === 'si' && form.mascotaTipo.includes('perro') && form.mascotaPeso
          ? { mascotaPeso: form.mascotaPeso as LeadData['mascotaPeso'] }
          : {}),
        // Legal y económica
        documentacion: form.documentacion as LeadData['documentacion'],
        situacionLaboral: form.situacionLaboral as LeadData['situacionLaboral'],
        ingresosMensuales: form.ingresosMensuales,
        garantias: form.garantias,
        // Vivienda
        ciudadDestino: form.ciudadDestino as LeadData['ciudadDestino'],
        tipoInmueble: form.tipoInmueble as LeadData['tipoInmueble'],
        presupuestoMensual: form.presupuestoMensual as LeadData['presupuestoMensual'],
        ...(!hayEstudio && form.habitacionesMinimas
          ? { habitacionesMinimas: form.habitacionesMinimas as LeadData['habitacionesMinimas'] }
          : {}),
        amueblado: form.amueblado as LeadData['amueblado'],
        ...(form.imprescindibles.length > 0
          ? { imprescindibles: form.imprescindibles as LeadData['imprescindibles'] }
          : {}),
        ...(form.comodidades.length > 0
          ? { comodidades: form.comodidades as LeadData['comodidades'] }
          : {}),
        // Perfil y plazos — opcionales
        ...(form.necesidadesEspeciales
          ? { necesidadesEspeciales: form.necesidadesEspeciales }
          : {}),
        ...(form.profesion.trim() ? { profesion: form.profesion.trim() } : {}),
        fechaLlegada: form.fechaLlegada,
        // Para terminar — opcional
        ...(form.comoNosConociste
          ? { comoNosConociste: form.comoNosConociste as LeadData['comoNosConociste'] }
          : {}),
        comprendeServicio: form.comprendeServicio,
        consentimientoRGPD: form.consentimientoRGPD,
      }

      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setStatus('success')
      } else if (res.status === 503) {
        setStatus('partial')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  // ── Success ────────────────────────────────────────────────────────────────

  if (status === 'success') {
    return (
      <div
        className="rounded-[var(--radius-card)] bg-[var(--color-niebla)] border border-[var(--color-arena)] p-[var(--space-12)] text-center flex flex-col items-center gap-[var(--space-6)]"
        role="status"
        aria-live="polite"
      >
        <div className="text-4xl" aria-hidden="true">🏡</div>
        <h2 className="font-[family-name:var(--font-titular)] text-[var(--text-xl)] text-[var(--color-granito)] font-semibold">
          ¡Recibimos tu consulta!
        </h2>
        <p className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] max-w-md leading-[var(--leading-cuerpo)]">
          Te respondemos en <strong>48 horas hábiles</strong>. Pronto tendrás noticias nuestras.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center font-[family-name:var(--font-ui)] font-medium rounded-[var(--radius-pill)] transition-all duration-150 bg-[var(--color-laton)] text-white hover:bg-[var(--color-laton-oscuro)] tracking-[var(--tracking-ui)] uppercase px-[var(--space-6)] py-[var(--space-3)] text-[var(--text-sm)]"
        >
          Volver al inicio
        </Link>
      </div>
    )
  }

  // ── Partial (503) ──────────────────────────────────────────────────────────

  if (status === 'partial') {
    return (
      <div
        className="rounded-[var(--radius-card)] bg-[var(--color-niebla)] border border-[var(--color-arena)] p-[var(--space-12)] text-center flex flex-col items-center gap-[var(--space-6)]"
        role="status"
        aria-live="polite"
      >
        <div className="text-4xl" aria-hidden="true">🙏</div>
        <h2 className="font-[family-name:var(--font-titular)] text-[var(--text-xl)] text-[var(--color-granito)] font-semibold">
          Recibimos tu consulta
        </h2>
        <p className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] max-w-md leading-[var(--leading-cuerpo)]">
          Anotamos tus datos y Silvana se va a comunicar contigo a la brevedad.
          Si no recibes noticias en <strong>48 horas hábiles</strong>, escríbenos
          directamente por WhatsApp.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center font-[family-name:var(--font-ui)] font-medium rounded-[var(--radius-pill)] transition-all duration-150 bg-[var(--color-laton)] text-white hover:bg-[var(--color-laton-oscuro)] tracking-[var(--tracking-ui)] uppercase px-[var(--space-6)] py-[var(--space-3)] text-[var(--text-sm)]"
        >
          Escríbenos por WhatsApp
        </a>
        <Link
          href="/"
          className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-mar)] underline-offset-4 hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-[var(--space-12)]"
      aria-label="Formulario de diagnóstico"
      aria-busy={status === 'loading'}
    >
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {status === 'loading' && 'Enviando tu consulta...'}
        {status === 'error' && 'Hubo un error al enviar. Por favor intenta de nuevo.'}
      </div>

      {status === 'error' && (
        <div
          className="rounded-[var(--radius-card)] border border-[var(--color-coral)] bg-[#FDF3F1] p-[var(--space-4)] text-[var(--text-sm)] text-[var(--color-coral)]"
          role="alert"
          aria-live="assertive"
        >
          <strong>Algo salió mal al enviar tu consulta.</strong> Por favor intenta de nuevo o{' '}
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
            escríbenos por WhatsApp
          </a>.
        </div>
      )}

      {/* ── Sección 1: Tu contacto ────────────────────────────────────────── */}
      <section aria-labelledby="seccion-contacto">
        <h2 id="seccion-contacto" className={sectionTitleClass}>Tu contacto</h2>
        <div className={sectionClass}>

          <FieldWrapper id="nombreCompleto" label="Nombre completo" required error={errors.nombreCompleto}>
            <input
              id="nombreCompleto"
              type="text"
              value={form.nombreCompleto}
              onChange={(e) => set('nombreCompleto', e.target.value)}
              className={`${inputBase} ${errors.nombreCompleto ? inputError : ''}`}
              autoComplete="name"
              aria-describedby={errors.nombreCompleto ? 'nombreCompleto-error' : undefined}
            />
          </FieldWrapper>

          <FieldWrapper id="email" label="Email" required error={errors.email}>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className={`${inputBase} ${errors.email ? inputError : ''}`}
              autoComplete="email"
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </FieldWrapper>

          <FieldWrapper id="telefono" label="Teléfono con código internacional" required error={errors.telefono}>
            <input
              id="telefono"
              type="tel"
              value={form.telefono}
              onChange={(e) => set('telefono', e.target.value)}
              placeholder="+54 9 11 1234-5678"
              className={`${inputBase} ${errors.telefono ? inputError : ''}`}
              autoComplete="tel"
              aria-describedby={errors.telefono ? 'telefono-error' : undefined}
            />
          </FieldWrapper>

          <FieldWrapper id="paisResidencia" label="País de residencia actual" required error={errors.paisResidencia}>
            <input
              id="paisResidencia"
              type="text"
              value={form.paisResidencia}
              onChange={(e) => set('paisResidencia', e.target.value)}
              className={`${inputBase} ${errors.paisResidencia ? inputError : ''}`}
              autoComplete="country-name"
              aria-describedby={errors.paisResidencia ? 'paisResidencia-error' : undefined}
            />
          </FieldWrapper>

        </div>
      </section>

      <hr className="border-[var(--color-arena)]" />

      {/* ── Sección 2: Tu familia ─────────────────────────────────────────── */}
      <section aria-labelledby="seccion-familia">
        <h2 id="seccion-familia" className={sectionTitleClass}>Tu familia</h2>
        <div className={sectionClass}>

          {/* Adultos */}
          <div>
            <fieldset>
              <legend id="rg-adultos" className={`${labelClass} mb-[var(--space-2)]`}>
                ¿Cuántos adultos se mudan? (incluyéndote)
                <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
              </legend>
              <RadioGroup
                name="adultos"
                options={[
                  { value: '1', label: '1' },
                  { value: '2', label: '2' },
                  { value: '3', label: '3' },
                  { value: '4+', label: '4 o más' },
                ]}
                value={form.adultos}
                onChange={(v) => set('adultos', v as '1' | '2' | '3' | '4+')}
                error={errors.adultos}
                labelId="rg-adultos"
              />
            </fieldset>
          </div>

          {/* ¿Hay menores? */}
          <div>
            <fieldset>
              <legend id="rg-hayMenores" className={`${labelClass} mb-[var(--space-2)]`}>
                ¿Viajan menores de edad contigo?
                <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
              </legend>
              <RadioGroup
                name="hayMenores"
                options={[
                  { value: 'no', label: 'No' },
                  { value: 'si', label: 'Sí' },
                ]}
                value={form.hayMenores}
                onChange={(v) => {
                  set('hayMenores', v as 'si' | 'no')
                  if (v === 'no') {
                    setForm((prev) => ({ ...prev, hayMenores: 'no', ninos: '', adolescentes: '' }))
                  }
                }}
                error={errors.hayMenores}
                labelId="rg-hayMenores"
              />
            </fieldset>

            {form.hayMenores === 'si' && (
              <div className="mt-[var(--space-4)] flex flex-col gap-[var(--space-4)]">
                <div>
                  <fieldset>
                    <legend id="rg-ninos" className={`${labelClass} mb-[var(--space-2)]`}>
                      Niños de 0 a 12 años
                      <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
                    </legend>
                    <RadioGroup
                      name="ninos"
                      options={[
                        { value: '0', label: '0' },
                        { value: '1', label: '1' },
                        { value: '2', label: '2' },
                        { value: '3+', label: '3 o más' },
                      ]}
                      value={form.ninos}
                      onChange={(v) => set('ninos', v as '0' | '1' | '2' | '3+')}
                      error={errors.ninos}
                      labelId="rg-ninos"
                    />
                  </fieldset>
                </div>
                <div>
                  <fieldset>
                    <legend id="rg-adolescentes" className={`${labelClass} mb-[var(--space-2)]`}>
                      Adolescentes de 13 a 17 años
                      <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
                    </legend>
                    <RadioGroup
                      name="adolescentes"
                      options={[
                        { value: '0', label: '0' },
                        { value: '1', label: '1' },
                        { value: '2', label: '2' },
                        { value: '3+', label: '3 o más' },
                      ]}
                      value={form.adolescentes}
                      onChange={(v) => set('adolescentes', v as '0' | '1' | '2' | '3+')}
                      error={errors.adolescentes}
                      labelId="rg-adolescentes"
                    />
                  </fieldset>
                </div>
              </div>
            )}
          </div>

          {/* Mascotas */}
          <div>
            <fieldset>
              <legend id="rg-mascotas" className={`${labelClass} mb-[var(--space-2)]`}>
                ¿Viajan con mascotas? (cerca del 80% de propietarios no las admite)
                <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
              </legend>
              <RadioGroup
                name="mascotas"
                options={[
                  { value: 'no', label: 'No' },
                  { value: 'si', label: 'Sí' },
                ]}
                value={form.mascotas}
                onChange={(v) => {
                  if (v === 'no') {
                    setForm((prev) => ({ ...prev, mascotas: 'no', mascotaTipo: [], mascotaPeso: '' }))
                  } else {
                    set('mascotas', 'si')
                  }
                }}
                error={errors.mascotas}
                labelId="rg-mascotas"
              />
            </fieldset>

            {form.mascotas === 'si' && (
              <div className="mt-[var(--space-4)] flex flex-col gap-[var(--space-4)]">
                <div>
                  <fieldset>
                    <legend id="rg-mascotaTipo" className={`${labelClass} mb-[var(--space-2)]`}>
                      Tipo de mascota (puedes marcar varias)
                      <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
                    </legend>
                    <CheckboxGroup
                      options={[
                        { value: 'perro' as const, label: 'Perro' },
                        { value: 'gato' as const, label: 'Gato' },
                        { value: 'otro' as const, label: 'Otro' },
                      ]}
                      selected={form.mascotaTipo}
                      onToggle={toggleMascotaTipo}
                      labelId="rg-mascotaTipo"
                    />
                    {errors.mascotaTipo && <p className={errorClass} role="alert">{errors.mascotaTipo}</p>}
                  </fieldset>
                </div>

                {form.mascotaTipo.includes('perro') && (
                  <div>
                    <fieldset>
                      <legend id="rg-mascotaPeso" className={`${labelClass} mb-[var(--space-2)]`}>
                        Peso aproximado de tu perro
                        <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
                      </legend>
                      <RadioGroup
                        name="mascotaPeso"
                        options={[
                          { value: '0-5 kg', label: 'Menos de 5 kg' },
                          { value: '5-10 kg', label: 'Entre 5 y 10 kg' },
                          { value: '+10 kg', label: 'Más de 10 kg' },
                        ]}
                        value={form.mascotaPeso}
                        onChange={(v) => set('mascotaPeso', v as '0-5 kg' | '5-10 kg' | '+10 kg')}
                        error={errors.mascotaPeso}
                        labelId="rg-mascotaPeso"
                      />
                    </fieldset>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </section>

      <hr className="border-[var(--color-arena)]" />

      {/* ── Sección 3: Situación legal y económica ────────────────────────── */}
      <section aria-labelledby="seccion-legal">
        <h2 id="seccion-legal" className={sectionTitleClass}>Tu situación legal y económica</h2>
        <div className={sectionClass}>

          {/* Documentación */}
          <div>
            <label htmlFor="documentacion" className={labelClass}>
              Documentación para residir legalmente en España
              <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
            </label>
            <select
              id="documentacion"
              value={form.documentacion}
              onChange={(e) => set('documentacion', e.target.value as LeadData['documentacion'])}
              className={`${inputBase} ${errors.documentacion ? inputError : ''}`}
              aria-describedby={errors.documentacion ? 'documentacion-error' : undefined}
            >
              <option value="" disabled>Selecciona una opción</option>
              <option value="espanol">Soy español/a (pasaporte o DNI español)</option>
              <option value="ue-otro">Soy ciudadano/a de la UE, EEE o Suiza</option>
              <option value="residencia-aprobada">Tengo residencia, TIE o NIE aprobado</option>
              <option value="en-tramite">Mi visado o residencia está en trámite</option>
              <option value="nacionalidad-en-tramite">Tengo o estoy tramitando la nacionalidad española</option>
              <option value="turista">Viajaría como turista</option>
            </select>
            {errors.documentacion && (
              <p id="documentacion-error" className={errorClass} role="alert">{errors.documentacion}</p>
            )}
          </div>

          {/* Situación laboral */}
          <div>
            <label htmlFor="situacionLaboral" className={labelClass}>
              Situación laboral al llegar
              <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
            </label>
            <select
              id="situacionLaboral"
              value={form.situacionLaboral}
              onChange={(e) => set('situacionLaboral', e.target.value as LeadData['situacionLaboral'])}
              className={`${inputBase} ${errors.situacionLaboral ? inputError : ''}`}
              aria-describedby={errors.situacionLaboral ? 'situacionLaboral-error' : undefined}
            >
              <option value="" disabled>Selecciona una opción</option>
              <option value="cuenta-ajena">Trabajo por cuenta ajena con nómina en España</option>
              <option value="teletrabajo-extranjero">Teletrabajo para empresa extranjera</option>
              <option value="autonomo">Trabajo por cuenta propia / autónomo</option>
              <option value="rentista">Rentista / fondos propios</option>
              <option value="jubilado">Jubilado/a</option>
              <option value="estudiante">Estudiante</option>
              <option value="busca-empleo">Otra / por el momento sin empleo</option>
            </select>
            {errors.situacionLaboral && (
              <p id="situacionLaboral-error" className={errorClass} role="alert">{errors.situacionLaboral}</p>
            )}
          </div>

          {/* Ingresos mensuales — select con mismos valores que Gina */}
          <div>
            <label htmlFor="ingresosMensuales" className={labelClass}>
              Ingresos netos mensuales del hogar
              <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
            </label>
            <select
              id="ingresosMensuales"
              value={form.ingresosMensuales}
              onChange={(e) => set('ingresosMensuales', e.target.value)}
              className={`${inputBase} ${errors.ingresosMensuales ? inputError : ''}`}
              aria-describedby={errors.ingresosMensuales ? 'ingresosMensuales-error' : undefined}
            >
              <option value="" disabled>Selecciona una opción</option>
              <option value="menos-1500">Menos de 1.500 €</option>
              <option value="1500-2500">1.500 – 2.500 €</option>
              <option value="2500-4000">2.500 – 4.000 €</option>
              <option value="mas-4000">Más de 4.000 €</option>
              <option value="sin-ingresos">No tengo ingresos en España aún</option>
            </select>
            {errors.ingresosMensuales && (
              <p id="ingresosMensuales-error" className={errorClass} role="alert">{errors.ingresosMensuales}</p>
            )}
          </div>

          {/* Garantías — con excluyente "ninguna" */}
          <div>
            <fieldset>
              <legend id="rg-garantias" className={`${labelClass} mb-[var(--space-2)]`}>
                Garantías que puedes ofrecer
                <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
              </legend>
              <CheckboxGroup
                options={[
                  { value: 'garantia-adicional' as const, label: 'Aportes de meses de garantía adicional (6–12)' },
                  { value: 'aval-bancario' as const, label: 'Aval bancario' },
                  { value: 'avalista' as const, label: 'Avalista con ingresos en España' },
                  { value: 'seguro-impago' as const, label: 'Contratar un seguro de impago' },
                  { value: 'ninguna' as const, label: 'Ninguna de las anteriores' },
                ]}
                selected={form.garantias}
                onToggle={toggleGarantia}
                exclusivaValue="ninguna"
                error={errors.garantias}
                labelId="rg-garantias"
              />
            </fieldset>
          </div>

        </div>
      </section>

      <hr className="border-[var(--color-arena)]" />

      {/* ── Sección 4: La vivienda que buscas ────────────────────────────── */}
      <section aria-labelledby="seccion-vivienda">
        <h2 id="seccion-vivienda" className={sectionTitleClass}>La vivienda que buscas</h2>
        <div className={sectionClass}>

          {/* Ciudad destino */}
          <div>
            <label htmlFor="ciudadDestino" className={labelClass}>
              Ciudad de destino
              <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
            </label>
            <select
              id="ciudadDestino"
              value={form.ciudadDestino}
              onChange={(e) => set('ciudadDestino', e.target.value as LeadData['ciudadDestino'])}
              className={`${inputBase} ${errors.ciudadDestino ? inputError : ''}`}
              aria-describedby={errors.ciudadDestino ? 'ciudadDestino-error' : undefined}
            >
              <option value="" disabled>Selecciona una ciudad</option>
              <option value="vigo">Vigo</option>
              <option value="a-coruna">A Coruña</option>
              <option value="santiago">Santiago de Compostela</option>
              <option value="pontevedra">Pontevedra</option>
              <option value="lugo">Lugo</option>
              <option value="indiferente">Me es indiferente</option>
            </select>
            {errors.ciudadDestino && (
              <p id="ciudadDestino-error" className={errorClass} role="alert">{errors.ciudadDestino}</p>
            )}
          </div>

          {/* Tipo de inmueble */}
          <div>
            <label htmlFor="tipoInmueble" className={labelClass}>
              Tipo de vivienda
              <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
            </label>
            <select
              id="tipoInmueble"
              value={form.tipoInmueble}
              onChange={(e) => {
                const v = e.target.value as 'habitacion' | 'estudio' | 'piso' | 'casa' | 'co-living'
                setForm((prev) => ({
                  ...prev,
                  tipoInmueble: v,
                  habitacionesMinimas: v === 'estudio' ? '' : prev.habitacionesMinimas,
                }))
                if (errors.tipoInmueble) setErrors((prev) => ({ ...prev, tipoInmueble: undefined }))
              }}
              className={`${inputBase} ${errors.tipoInmueble ? inputError : ''}`}
              aria-describedby={errors.tipoInmueble ? 'tipoInmueble-error' : undefined}
            >
              <option value="" disabled>Selecciona una opción</option>
              <option value="habitacion">Habitación en piso compartido</option>
              <option value="estudio">Estudio / Loft</option>
              <option value="piso">Piso / Apartamento</option>
              <option value="casa">Casa</option>
              <option value="co-living">Co-living</option>
            </select>
            {errors.tipoInmueble && (
              <p id="tipoInmueble-error" className={errorClass} role="alert">{errors.tipoInmueble}</p>
            )}
          </div>

          {/* Habitaciones — oculto para estudio */}
          {form.tipoInmueble !== 'estudio' && (
            <div>
              <fieldset>
                <legend id="rg-habitacionesMinimas" className={`${labelClass} mb-[var(--space-2)]`}>
                  Habitaciones mínimas
                  {form.tipoInmueble !== '' && <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>}
                </legend>
                <RadioGroup
                  name="habitacionesMinimas"
                  options={[
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                    { value: '3', label: '3' },
                    { value: '4+', label: '4 o más' },
                  ]}
                  value={form.habitacionesMinimas}
                  onChange={(v) => set('habitacionesMinimas', v as '1' | '2' | '3' | '4+')}
                  error={errors.habitacionesMinimas}
                  labelId="rg-habitacionesMinimas"
                />
              </fieldset>
            </div>
          )}

          {/* Presupuesto mensual */}
          <div>
            <fieldset>
              <legend id="rg-presupuestoMensual" className={`${labelClass} mb-[var(--space-2)]`}>
                Presupuesto mensual de alquiler
                <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
              </legend>
              <RadioGroup
                name="presupuestoMensual"
                options={[
                  { value: 'menos-700', label: 'Menos de 700 €' },
                  { value: '700-1000', label: '700 € a 1.000 €' },
                  { value: '1000-1400', label: '1.000 € a 1.400 €' },
                  { value: 'mas-1400', label: 'Más de 1.400 €' },
                ]}
                value={form.presupuestoMensual}
                onChange={(v) => set('presupuestoMensual', v as LeadData['presupuestoMensual'])}
                error={errors.presupuestoMensual}
                labelId="rg-presupuestoMensual"
              />
            </fieldset>
          </div>

          {/* Amueblado */}
          <div>
            <fieldset>
              <legend id="rg-amueblado" className={`${labelClass} mb-[var(--space-2)]`}>
                ¿Prefieres la vivienda amueblada?
                <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
              </legend>
              <RadioGroup
                name="amueblado"
                options={[
                  { value: 'si', label: 'Sí, completamente amueblada' },
                  { value: 'no', label: 'Sin muebles' },
                  { value: 'indiferente', label: 'Indiferente' },
                ]}
                value={form.amueblado}
                onChange={(v) => set('amueblado', v as LeadData['amueblado'])}
                error={errors.amueblado}
                labelId="rg-amueblado"
              />
            </fieldset>
          </div>

          {/* Imprescindibles — "Ninguno" excluyente */}
          <div>
            <fieldset>
              <legend id="rg-imprescindibles" className={`${labelClass} mb-[var(--space-2)]`}>
                ¿Hay algo imprescindible para la vivienda? (opcional)
              </legend>
              <CheckboxGroup
                options={[
                  { value: 'ascensor' as const, label: 'Ascensor' },
                  { value: 'garaje' as const, label: 'Plaza de garaje' },
                  { value: 'calefaccion' as const, label: 'Calefacción central o gas' },
                  { value: 'terraza' as const, label: 'Terraza / exterior' },
                  { value: 'no' as const, label: 'Ninguno en particular' },
                ]}
                selected={form.imprescindibles}
                onToggle={toggleImprescindible}
                exclusivaValue="no"
                labelId="rg-imprescindibles"
              />
            </fieldset>
          </div>

          {/* Comodidades — "Ninguna" excluyente */}
          <div>
            <fieldset>
              <legend id="rg-comodidades" className={`${labelClass} mb-[var(--space-2)]`}>
                ¿Alguna comodidad del entorno es importante para ti? (opcional)
              </legend>
              <CheckboxGroup
                options={[
                  { value: 'transporte' as const, label: 'Cerca del transporte público' },
                  { value: 'zona-tranquila' as const, label: 'Zona tranquila / residencial' },
                  { value: 'cerca-colegios' as const, label: 'Cerca de colegios' },
                  { value: 'internet' as const, label: 'Fibra óptica / buen internet' },
                  { value: 'ninguna' as const, label: 'Ninguna en particular' },
                ]}
                selected={form.comodidades}
                onToggle={toggleComodidad}
                exclusivaValue="ninguna"
                labelId="rg-comodidades"
              />
            </fieldset>
          </div>

        </div>
      </section>

      <hr className="border-[var(--color-arena)]" />

      {/* ── Sección 5: Tu perfil y plazos ─────────────────────────────────── */}
      <section aria-labelledby="seccion-perfil">
        <h2 id="seccion-perfil" className={sectionTitleClass}>Tu perfil y plazos</h2>
        <div className={sectionClass}>

          {/* Necesidades especiales — opcional */}
          <div>
            <fieldset>
              <legend id="rg-necesidadesEspeciales" className={`${labelClass} mb-[var(--space-2)]`}>
                ¿Algún miembro del hogar tiene necesidades especiales o discapacidad? (opcional)
              </legend>
              <RadioGroup
                name="necesidadesEspeciales"
                options={[
                  { value: 'no', label: 'No' },
                  { value: 'si', label: 'Sí' },
                ]}
                value={form.necesidadesEspeciales}
                onChange={(v) => set('necesidadesEspeciales', v as 'si' | 'no')}
                labelId="rg-necesidadesEspeciales"
              />
            </fieldset>
          </div>

          {/* Profesión — opcional */}
          <FieldWrapper id="profesion" label="Profesión u ocupación (opcional)" error={errors.profesion}>
            <input
              id="profesion"
              type="text"
              value={form.profesion}
              onChange={(e) => set('profesion', e.target.value)}
              placeholder="Ej: Ingeniera, docente, enfermero..."
              className={`${inputBase} ${errors.profesion ? inputError : ''}`}
              aria-describedby={errors.profesion ? 'profesion-error' : undefined}
            />
          </FieldWrapper>

          {/* Fecha de llegada — select con mismos valores que Gina */}
          <div>
            <label htmlFor="fechaLlegada" className={labelClass}>
              ¿En qué plazo necesitas tener resuelta tu vivienda?
              <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
            </label>
            <select
              id="fechaLlegada"
              value={form.fechaLlegada}
              onChange={(e) => set('fechaLlegada', e.target.value)}
              className={`${inputBase} ${errors.fechaLlegada ? inputError : ''}`}
              aria-describedby={errors.fechaLlegada ? 'fechaLlegada-error' : undefined}
            >
              <option value="" disabled>Selecciona una opción</option>
              <option value="menos-1-mes">En menos de 1 mes</option>
              <option value="1-3-meses">En 1 a 3 meses</option>
              <option value="3-6-meses">En 3 a 6 meses</option>
              <option value="mas-6-meses">En más de 6 meses</option>
              <option value="sin-fecha">Aún no tengo fecha</option>
            </select>
            {errors.fechaLlegada && (
              <p id="fechaLlegada-error" className={errorClass} role="alert">{errors.fechaLlegada}</p>
            )}
          </div>

        </div>
      </section>

      <hr className="border-[var(--color-arena)]" />

      {/* ── Sección 6: Para terminar ──────────────────────────────────────── */}
      <section aria-labelledby="seccion-final">
        <h2 id="seccion-final" className={sectionTitleClass}>Para terminar</h2>
        <div className={sectionClass}>

          {/* ¿Cómo nos conociste? — opcional */}
          <div>
            <label htmlFor="comoNosConociste" className={labelClass}>
              ¿Cómo nos conociste? (opcional)
            </label>
            <select
              id="comoNosConociste"
              value={form.comoNosConociste}
              onChange={(e) => set('comoNosConociste', e.target.value as 'instagram' | 'facebook' | 'tiktok' | 'google' | 'recomendacion' | 'otro' | '')}
              className={inputBase}
            >
              <option value="">Selecciona una opción</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
              <option value="google">Google</option>
              <option value="recomendacion">Recomendación</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Comprensión del servicio */}
          <div>
            <label className="flex items-start gap-[var(--space-3)] cursor-pointer">
              <input
                id="comprendeServicio"
                type="checkbox"
                required
                aria-required="true"
                checked={form.comprendeServicio}
                onChange={(e) => set('comprendeServicio', e.target.checked)}
                className="accent-[var(--color-laton)] w-4 h-4 mt-[2px] cursor-pointer flex-shrink-0"
                aria-describedby={errors.comprendeServicio ? 'comprendeServicio-error' : undefined}
              />
              <span className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] leading-[var(--leading-cuerpo)]">
                Entiendo que Tu Lugar en Galicia es un servicio de consultoría y búsqueda personalizada, con honorarios propios aparte del alquiler y la fianza. Silvana actúa en nombre de mi familia, no del propietario.
                <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
              </span>
            </label>
            {errors.comprendeServicio && (
              <p id="comprendeServicio-error" className={`${errorClass} mt-[var(--space-2)]`} role="alert">
                {errors.comprendeServicio}
              </p>
            )}
          </div>

          {/* Consentimiento RGPD */}
          <div>
            <label className="flex items-start gap-[var(--space-3)] cursor-pointer">
              <input
                id="consentimientoRGPD"
                type="checkbox"
                required
                aria-required="true"
                checked={form.consentimientoRGPD}
                onChange={(e) => set('consentimientoRGPD', e.target.checked)}
                className="accent-[var(--color-laton)] w-4 h-4 mt-[2px] cursor-pointer flex-shrink-0"
                aria-describedby={errors.consentimientoRGPD ? 'consentimientoRGPD-error' : undefined}
              />
              <span className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] leading-[var(--leading-cuerpo)]">
                Acepto el tratamiento de mis datos personales según la{' '}
                <Link
                  href="/politica-de-privacidad"
                  className="text-[var(--color-mar)] underline hover:no-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  política de privacidad
                </Link>.
                <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
              </span>
            </label>
            {errors.consentimientoRGPD && (
              <p id="consentimientoRGPD-error" className={`${errorClass} mt-[var(--space-2)]`} role="alert">
                {errors.consentimientoRGPD}
              </p>
            )}
          </div>

        </div>
      </section>

      {/* Submit */}
      <div className="pt-[var(--space-4)]">
        <Button
          type="submit"
          size="lg"
          variant="primario"
          disabled={status === 'loading'}
          className="w-full sm:w-auto"
        >
          {status === 'loading' ? (
            <span className="flex items-center gap-[var(--space-2)]">
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Enviando...
            </span>
          ) : (
            'Enviar mi consulta'
          )}
        </Button>
        <p className="mt-[var(--space-3)] text-[var(--text-xs)] text-[var(--color-pizarra)] font-[family-name:var(--font-ui)]">
          Los campos marcados con <span className="text-[var(--color-coral)]">*</span> son obligatorios.
        </p>
      </div>
    </form>
  )
}

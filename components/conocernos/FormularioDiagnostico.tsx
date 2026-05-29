'use client'

import { useState, FormEvent, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '@/lib/config/site'
import type { LeadData } from '@/lib/leads'

// ─── Types ────────────────────────────────────────────────────────────────────

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

type FormState = {
  nombreCompleto: string
  email: string
  telefono: string
  paisResidencia: string
  personas: string
  mascotas: 'si' | 'no' | ''
  detalleMascotas: string
  documentacion: LeadData['documentacion'] | ''
  situacionLaboral: LeadData['situacionLaboral'] | ''
  ingresosMensuales: string
  garantias: LeadData['garantias']
  ciudadDestino: LeadData['ciudadDestino'] | ''
  presupuestoMensual: LeadData['presupuestoMensual'] | ''
  habitacionesMinimas: LeadData['habitacionesMinimas'] | ''
  amueblado: LeadData['amueblado'] | ''
  estacionamiento: LeadData['estacionamiento'] | ''
  fechaLlegada: string
  inicioContrato: string
  modalidad: LeadData['modalidad'] | ''
  comprendeServicio: boolean
  consentimientoRGPD: boolean
}

type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL_STATE: FormState = {
  nombreCompleto: '',
  email: '',
  telefono: '',
  paisResidencia: '',
  personas: '',
  mascotas: '',
  detalleMascotas: '',
  documentacion: '',
  situacionLaboral: '',
  ingresosMensuales: '',
  garantias: [],
  ciudadDestino: '',
  presupuestoMensual: '',
  habitacionesMinimas: '',
  amueblado: '',
  estacionamiento: '',
  fechaLlegada: '',
  inicioContrato: '',
  modalidad: '',
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
    errors.nombreCompleto = 'Necesitamos tu nombre para poder dirigirnos a vos'
  if (!form.email.trim())
    errors.email = 'Necesitamos tu email para poder contactarte'
  else if (!isValidEmail(form.email))
    errors.email = 'Ese email no parece tener el formato correcto (ej: nombre@correo.com)'
  if (!form.telefono.trim())
    errors.telefono = 'Incluí tu teléfono con el código de país para poder llamarte'
  if (!form.paisResidencia.trim())
    errors.paisResidencia = 'Contanos desde qué país nos escribís'
  if (!form.personas.trim())
    errors.personas = 'Contanos quiénes van a vivir en la vivienda'
  if (!form.mascotas)
    errors.mascotas = 'Indicanos si van a viajar con mascotas'
  if (form.mascotas === 'si' && !form.detalleMascotas.trim())
    errors.detalleMascotas = 'Contanos un poco más sobre tus mascotas'
  if (!form.documentacion)
    errors.documentacion = 'Seleccioná cuál es tu situación de documentación'
  if (!form.situacionLaboral)
    errors.situacionLaboral = 'Seleccioná cuál será tu situación laboral al llegar'
  if (!form.ingresosMensuales.trim())
    errors.ingresosMensuales = 'Indicanos tus ingresos aproximados para evaluar tu viabilidad'
  if (form.garantias.length === 0)
    errors.garantias = 'Seleccioná al menos una opción de garantía (aunque sea ninguna)'
  if (!form.ciudadDestino)
    errors.ciudadDestino = 'Elegí una ciudad de destino'
  if (!form.presupuestoMensual)
    errors.presupuestoMensual = 'Indicanos tu presupuesto mensual de alquiler'
  if (!form.habitacionesMinimas)
    errors.habitacionesMinimas = 'Indicanos cuántas habitaciones necesitás'
  if (!form.amueblado)
    errors.amueblado = 'Indicanos si necesitás la vivienda amueblada'
  if (!form.estacionamiento)
    errors.estacionamiento = 'Indicanos si necesitás estacionamiento'
  if (!form.fechaLlegada)
    errors.fechaLlegada = 'Indicanos cuándo estimás llegar a Galicia'
  if (!form.inicioContrato)
    errors.inicioContrato = 'Indicanos cuándo querés empezar el contrato'
  if (!form.modalidad)
    errors.modalidad = 'Contanos cómo preferís organizar la búsqueda'
  if (!form.comprendeServicio)
    errors.comprendeServicio = 'Es importante que entiendas cómo funciona el servicio antes de continuar'
  if (!form.consentimientoRGPD)
    errors.consentimientoRGPD = 'Necesitamos tu consentimiento para tratar tus datos'

  return errors
}

// ─── Shared field styles ───────────────────────────────────────────────────────

const inputBase =
  'w-full border border-[var(--color-arena)] bg-[var(--color-blanco)] ' +
  'rounded-[var(--radius-card)] px-[var(--space-4)] py-[var(--space-3)] ' +
  'font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-granito)] ' +
  'outline-none focus:ring-2 focus:ring-[var(--color-laton)] focus:border-transparent ' +
  'transition-all duration-150 placeholder:text-[var(--color-arena)]'

const inputError =
  'border-[var(--color-coral)] focus:ring-[var(--color-coral)]'

const labelClass =
  'block font-[family-name:var(--font-ui)] font-medium text-[var(--text-sm)] ' +
  'text-[var(--color-granito)] mb-1.5'

const errorClass =
  'mt-[var(--space-1)] text-[var(--text-xs)] text-[var(--color-coral)]'

const sectionTitleClass =
  'font-[family-name:var(--font-titular)] text-[var(--text-lg)] ' +
  'text-[var(--color-granito)] font-semibold mb-[var(--space-6)]'

const sectionClass =
  'flex flex-col gap-[var(--space-6)]'

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
      {error && (
        <p className={errorClass} role="alert">
          {error}
        </p>
      )}
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
    // Clear error on change
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  function toggleGarantia(val: LeadData['garantias'][number]) {
    setForm((prev) => {
      const already = prev.garantias.includes(val)
      const next = already
        ? prev.garantias.filter((g) => g !== val)
        : [...prev.garantias, val]
      return { ...prev, garantias: next }
    })
    if (errors.garantias) {
      setErrors((prev) => ({ ...prev, garantias: undefined }))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      // Scroll to first error
      const firstErrorKey = Object.keys(validationErrors)[0]
      const el = document.getElementById(firstErrorKey) ?? document.getElementById(`${firstErrorKey}-error`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setStatus('loading')

    try {
      const payload: LeadData = {
        nombreCompleto: form.nombreCompleto,
        email: form.email,
        telefono: form.telefono,
        paisResidencia: form.paisResidencia,
        personas: form.personas,
        mascotas: form.mascotas as 'si' | 'no',
        detalleMascotas: form.mascotas === 'si' ? form.detalleMascotas : undefined,
        documentacion: form.documentacion as LeadData['documentacion'],
        situacionLaboral: form.situacionLaboral as LeadData['situacionLaboral'],
        ingresosMensuales: form.ingresosMensuales,
        garantias: form.garantias,
        ciudadDestino: form.ciudadDestino as LeadData['ciudadDestino'],
        presupuestoMensual: form.presupuestoMensual as LeadData['presupuestoMensual'],
        habitacionesMinimas: form.habitacionesMinimas as LeadData['habitacionesMinimas'],
        amueblado: form.amueblado as LeadData['amueblado'],
        estacionamiento: form.estacionamiento as LeadData['estacionamiento'],
        fechaLlegada: form.fechaLlegada,
        inicioContrato: form.inicioContrato,
        modalidad: form.modalidad as LeadData['modalidad'],
        comprendeServicio: form.comprendeServicio,
        consentimientoRGPD: form.consentimientoRGPD,
      }

      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok || res.status === 503) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────

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
          Te respondemos en <strong>48 horas hábiles</strong>. Pronto vas a tener noticias nuestras.
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

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-[var(--space-12)]"
      aria-label="Vamos a conocernos"
      aria-busy={status === 'loading'}
    >
      {/* Región aria-live para anuncios de estado a lectores de pantalla */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {status === 'loading' && 'Enviando tu consulta...'}
        {status === 'error' && 'Hubo un error al enviar. Por favor intentá de nuevo.'}
      </div>

      {/* Error banner */}
      {status === 'error' && (
        <div
          className="rounded-[var(--radius-card)] border border-[var(--color-coral)] bg-[#FDF3F1] p-[var(--space-4)] text-[var(--text-sm)] text-[var(--color-coral)]"
          role="alert"
          aria-live="assertive"
        >
          <strong>Algo salió mal al enviar tu consulta.</strong> Por favor intentá de nuevo o{' '}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            escribinos por WhatsApp
          </a>
          .
        </div>
      )}

      {/* ── Sección 1: Tu familia ─────────────────────────────────────────── */}
      <section aria-labelledby="seccion-familia">
        <h2 id="seccion-familia" className={sectionTitleClass}>Tu familia</h2>
        <div className={sectionClass}>

          {/* 1. Nombre completo */}
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

          {/* 2. Email */}
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

          {/* 3. Teléfono */}
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

          {/* 4. País de residencia */}
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

          {/* 5. Personas que vivirán */}
          <FieldWrapper id="personas" label="Personas que van a vivir en la vivienda" required error={errors.personas}>
            <textarea
              id="personas"
              value={form.personas}
              onChange={(e) => set('personas', e.target.value)}
              placeholder="Ej: 2 adultos, 1 niño de 8 años, 1 niña de 5 años"
              rows={3}
              className={`${inputBase} resize-y ${errors.personas ? inputError : ''}`}
              aria-describedby={errors.personas ? 'personas-error' : undefined}
            />
          </FieldWrapper>

          {/* 6. Mascotas */}
          <div>
            <fieldset>
              <legend id="rg-mascotas" className={`${labelClass} mb-[var(--space-2)]`}>
                ¿Viajan con mascotas?
                <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
              </legend>
              <RadioGroup
                name="mascotas"
                options={[
                  { value: 'si', label: 'Sí' },
                  { value: 'no', label: 'No' },
                ]}
                value={form.mascotas}
                onChange={(v) => set('mascotas', v as 'si' | 'no')}
                error={errors.mascotas}
                labelId="rg-mascotas"
              />
            </fieldset>

            {/* 6b. Detalle mascotas (condicional) */}
            {form.mascotas === 'si' && (
              <div className="mt-[var(--space-4)]">
                <FieldWrapper id="detalleMascotas" label="Contanos sobre tus mascotas" required error={errors.detalleMascotas}>
                  <textarea
                    id="detalleMascotas"
                    value={form.detalleMascotas}
                    onChange={(e) => set('detalleMascotas', e.target.value)}
                    placeholder="Cantidad, especie, raza y peso aproximado"
                    rows={3}
                    className={`${inputBase} resize-y ${errors.detalleMascotas ? inputError : ''}`}
                    aria-describedby={errors.detalleMascotas ? 'detalleMascotas-error' : undefined}
                  />
                </FieldWrapper>
              </div>
            )}
          </div>

        </div>
      </section>

      <hr className="border-[var(--color-arena)] my-[var(--space-4)]" />

      {/* ── Sección 2: Situación legal y económica ────────────────────────── */}
      <section aria-labelledby="seccion-legal">
        <h2 id="seccion-legal" className={sectionTitleClass}>Tu situación legal y económica</h2>
        <div className={sectionClass}>

          {/* 7. Documentación */}
          <div>
            <fieldset>
              <legend className={`${labelClass} mb-[var(--space-2)]`}>
                Documentación para residir legalmente en España
                <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
              </legend>
              <select
                id="documentacion"
                value={form.documentacion}
                onChange={(e) => set('documentacion', e.target.value as LeadData['documentacion'])}
                className={`${inputBase} ${errors.documentacion ? inputError : ''}`}
                aria-describedby={errors.documentacion ? 'documentacion-error' : undefined}
              >
                <option value="" disabled>Seleccioná una opción</option>
                <option value="pasaporte-ue">Pasaporte o ciudadanía de la UE</option>
                <option value="visado-tie-nie">Tengo visado, TIE o NIE</option>
                <option value="en-tramite">Trámite en proceso</option>
                <option value="turista">Viajaría como turista</option>
              </select>
              {errors.documentacion && (
                <p id="documentacion-error" className={errorClass} role="alert">{errors.documentacion}</p>
              )}
            </fieldset>
          </div>

          {/* 8. Situación laboral */}
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
              <option value="" disabled>Seleccioná una opción</option>
              <option value="empleado-remoto">Trabajo remoto / ya tengo empleo</option>
              <option value="busca-empleo">Busco empleo en Galicia</option>
              <option value="autonomo">Trabajo por cuenta propia / autónomo</option>
              <option value="jubilado">Jubilado / pensionado</option>
              <option value="estudiante">Estudiante</option>
              <option value="otro">Otra situación</option>
            </select>
            {errors.situacionLaboral && (
              <p id="situacionLaboral-error" className={errorClass} role="alert">{errors.situacionLaboral}</p>
            )}
          </div>

          {/* 9. Ingresos mensuales */}
          <FieldWrapper id="ingresosMensuales" label="Ingresos netos mensuales demostrables (€)" required error={errors.ingresosMensuales}>
            <input
              id="ingresosMensuales"
              type="text"
              value={form.ingresosMensuales}
              onChange={(e) => set('ingresosMensuales', e.target.value)}
              placeholder="Ej: 2.500 €"
              className={`${inputBase} ${errors.ingresosMensuales ? inputError : ''}`}
              aria-describedby={errors.ingresosMensuales ? 'ingresosMensuales-error' : undefined}
            />
          </FieldWrapper>

          {/* 10. Garantías */}
          <div>
            <fieldset>
              <legend className={`${labelClass} mb-[var(--space-2)]`}>
                Garantías que pueden ofrecer
                <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
              </legend>
              <div className="flex flex-col gap-[var(--space-2)]">
                {(
                  [
                    { value: 'adelanto-6-12', label: 'Adelanto de 6 a 12 meses' },
                    { value: 'aval', label: 'Aval bancario o personal' },
                    { value: 'seguro-impago', label: 'Seguro de impago de alquiler' },
                    { value: 'ninguna', label: 'Ninguna por el momento' },
                  ] as const
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-[var(--space-3)] cursor-pointer font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)]"
                  >
                    <input
                      type="checkbox"
                      value={opt.value}
                      checked={form.garantias.includes(opt.value)}
                      onChange={() => toggleGarantia(opt.value)}
                      className="accent-[var(--color-laton)] w-4 h-4 cursor-pointer"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              {errors.garantias && (
                <p className={errorClass} role="alert">{errors.garantias}</p>
              )}
            </fieldset>
          </div>

        </div>
      </section>

      <hr className="border-[var(--color-arena)] my-[var(--space-4)]" />

      {/* ── Sección 3: La vivienda que buscás ────────────────────────────── */}
      <section aria-labelledby="seccion-vivienda">
        <h2 id="seccion-vivienda" className={sectionTitleClass}>La vivienda que buscás</h2>
        <div className={sectionClass}>

          {/* 11. Ciudad destino */}
          <div>
            <label htmlFor="ciudadDestino" className={labelClass}>
              Ciudad de destino preferida
              <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
            </label>
            <select
              id="ciudadDestino"
              value={form.ciudadDestino}
              onChange={(e) => set('ciudadDestino', e.target.value as LeadData['ciudadDestino'])}
              className={`${inputBase} ${errors.ciudadDestino ? inputError : ''}`}
              aria-describedby={errors.ciudadDestino ? 'ciudadDestino-error' : undefined}
            >
              <option value="" disabled>Seleccioná una ciudad</option>
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

          {/* 12. Presupuesto mensual */}
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

          {/* 13. Habitaciones mínimas */}
          <div>
            <fieldset>
              <legend id="rg-habitacionesMinimas" className={`${labelClass} mb-[var(--space-2)]`}>
                Habitaciones mínimas
                <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
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
                onChange={(v) => set('habitacionesMinimas', v as LeadData['habitacionesMinimas'])}
                error={errors.habitacionesMinimas}
                labelId="rg-habitacionesMinimas"
              />
            </fieldset>
          </div>

          {/* 14. Amueblado */}
          <div>
            <fieldset>
              <legend id="rg-amueblado" className={`${labelClass} mb-[var(--space-2)]`}>
                ¿Necesitás la vivienda amueblada?
                <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
              </legend>
              <RadioGroup
                name="amueblado"
                options={[
                  { value: 'si', label: 'Sí' },
                  { value: 'no', label: 'No' },
                  { value: 'indiferente', label: 'Indiferente' },
                ]}
                value={form.amueblado}
                onChange={(v) => set('amueblado', v as LeadData['amueblado'])}
                error={errors.amueblado}
                labelId="rg-amueblado"
              />
            </fieldset>
          </div>

          {/* 15. Estacionamiento */}
          <div>
            <fieldset>
              <legend id="rg-estacionamiento" className={`${labelClass} mb-[var(--space-2)]`}>
                ¿Necesitás estacionamiento?
                <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
              </legend>
              <RadioGroup
                name="estacionamiento"
                options={[
                  { value: 'indispensable', label: 'Indispensable' },
                  { value: 'deseable', label: 'Deseable' },
                  { value: 'no', label: 'No necesito' },
                ]}
                value={form.estacionamiento}
                onChange={(v) => set('estacionamiento', v as LeadData['estacionamiento'])}
                error={errors.estacionamiento}
                labelId="rg-estacionamiento"
              />
            </fieldset>
          </div>

        </div>
      </section>

      <hr className="border-[var(--color-arena)] my-[var(--space-4)]" />

      {/* ── Sección 4: Fechas y modalidad ─────────────────────────────────── */}
      <section aria-labelledby="seccion-fechas">
        <h2 id="seccion-fechas" className={sectionTitleClass}>Fechas y modalidad</h2>
        <div className={sectionClass}>

          {/* 16. Fecha de llegada */}
          <FieldWrapper id="fechaLlegada" label="Fecha estimada de llegada a Galicia" required error={errors.fechaLlegada}>
            <input
              id="fechaLlegada"
              type="date"
              value={form.fechaLlegada}
              onChange={(e) => set('fechaLlegada', e.target.value)}
              className={`${inputBase} ${errors.fechaLlegada ? inputError : ''}`}
              aria-describedby={errors.fechaLlegada ? 'fechaLlegada-error' : undefined}
            />
          </FieldWrapper>

          {/* 17. Inicio de contrato */}
          <FieldWrapper id="inicioContrato" label="Fecha de inicio de contrato deseada" required error={errors.inicioContrato}>
            <input
              id="inicioContrato"
              type="date"
              value={form.inicioContrato}
              onChange={(e) => set('inicioContrato', e.target.value)}
              className={`${inputBase} ${errors.inicioContrato ? inputError : ''}`}
              aria-describedby={errors.inicioContrato ? 'inicioContrato-error' : undefined}
            />
          </FieldWrapper>

          {/* 18. Modalidad */}
          <div>
            <fieldset>
              <legend id="rg-modalidad" className={`${labelClass} mb-[var(--space-2)]`}>
                Modalidad de búsqueda
                <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
              </legend>
              <RadioGroup
                name="modalidad"
                options={[
                  { value: 'antes-de-viajar', label: 'Quiero alquilar antes de viajar' },
                  { value: 'ya-estando', label: 'Buscaré estando en Galicia' },
                ]}
                value={form.modalidad}
                onChange={(v) => set('modalidad', v as LeadData['modalidad'])}
                error={errors.modalidad}
                labelId="rg-modalidad"
              />
            </fieldset>
          </div>

        </div>
      </section>

      <hr className="border-[var(--color-arena)] my-[var(--space-4)]" />

      {/* ── Sección 5: Para terminar ──────────────────────────────────────── */}
      <section aria-labelledby="seccion-final">
        <h2 id="seccion-final" className={sectionTitleClass}>Para terminar</h2>
        <div className={sectionClass}>

          {/* 19. Comprensión del servicio */}
          <div>
            <label className="flex items-start gap-[var(--space-3)] cursor-pointer">
              <input
                id="comprendeServicio"
                type="checkbox"
                checked={form.comprendeServicio}
                onChange={(e) => set('comprendeServicio', e.target.checked)}
                className="accent-[var(--color-laton)] w-4 h-4 mt-[2px] cursor-pointer flex-shrink-0"
                aria-describedby={errors.comprendeServicio ? 'comprendeServicio-error' : undefined}
              />
              <span className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] leading-[var(--leading-cuerpo)]">
                Entiendo que Tu Lugar en Galicia es un servicio de personal shopper de vivienda, no una inmobiliaria. Silvana actúa en nombre de mi familia, no del propietario.
                <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
              </span>
            </label>
            {errors.comprendeServicio && (
              <p id="comprendeServicio-error" className={`${errorClass} mt-[var(--space-2)]`} role="alert">
                {errors.comprendeServicio}
              </p>
            )}
          </div>

          {/* 20. Consentimiento RGPD */}
          <div>
            <label className="flex items-start gap-[var(--space-3)] cursor-pointer">
              <input
                id="consentimientoRGPD"
                type="checkbox"
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
                </Link>
                .
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
              <svg
                className="animate-spin w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
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

'use client'

import { useState, useRef, type FormEvent } from 'react'
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '@/lib/config/site'
import type { LeadData } from '@/lib/leads'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FormStatus = 'idle' | 'loading' | 'success' | 'partial' | 'error'

export type FormState = {
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

export type FormErrors = Partial<Record<keyof FormState, string>>

export const INITIAL_STATE: FormState = {
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

export function toggleExclusivo<T extends string>(
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFormulario() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<FormStatus>('idle')
  const formRef = useRef<HTMLFormElement>(null)

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function setHayMenores(v: 'si' | 'no') {
    if (v === 'no') {
      setForm((prev) => ({ ...prev, hayMenores: 'no', ninos: '' as FormState['ninos'], adolescentes: '' as FormState['adolescentes'] }))
    } else {
      setForm((prev) => ({ ...prev, hayMenores: 'si' }))
    }
    if (errors.hayMenores) setErrors((prev) => ({ ...prev, hayMenores: undefined }))
  }

  function setMascotas(v: 'si' | 'no') {
    if (v === 'no') {
      setForm((prev) => ({ ...prev, mascotas: 'no', mascotaTipo: [], mascotaPeso: '' as FormState['mascotaPeso'] }))
    } else {
      setForm((prev) => ({ ...prev, mascotas: 'si' }))
    }
    if (errors.mascotas) setErrors((prev) => ({ ...prev, mascotas: undefined }))
  }

  function setTipoInmueble(v: 'habitacion' | 'estudio' | 'piso' | 'casa' | 'co-living') {
    setForm((prev) => ({
      ...prev,
      tipoInmueble: v,
      habitacionesMinimas: v === 'estudio' ? '' as FormState['habitacionesMinimas'] : prev.habitacionesMinimas,
    }))
    if (errors.tipoInmueble) setErrors((prev) => ({ ...prev, tipoInmueble: undefined }))
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
      mascotaPeso: val === 'perro' && prev.mascotaTipo.includes(val) ? '' as FormState['mascotaPeso'] : prev.mascotaPeso,
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

  return {
    form,
    errors,
    status,
    set,
    setHayMenores,
    setMascotas,
    setTipoInmueble,
    toggleGarantia,
    toggleMascotaTipo,
    toggleImprescindible,
    toggleComodidad,
    handleSubmit,
    whatsappUrl,
    formRef,
  }
}

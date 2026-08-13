'use client'

import { useState, useRef, useEffect, type FormEvent } from 'react'

import type { LeadData } from '@/lib/leads'
import { useValidacionHibrida } from '@/lib/forms/useValidacionHibrida'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FormStatus = 'idle' | 'loading' | 'success' | 'partial' | 'error'

export type FormState = {
  // Contacto
  nombreCompleto: string
  email: string
  telefono: string
  origenResidencia: 'en_espana' | 'fuera' | ''
  paisResidencia: string
  // Familia
  adultos: '1' | '2' | '3' | '4+' | ''
  hayMenores: 'si' | 'no' | ''
  ninos: '0' | '1' | '2' | '3+' | ''
  adolescentes: '0' | '1' | '2' | '3+' | ''
  mascotas: 'si' | 'no' | ''
  mascotaTipo: ('perro' | 'gato' | 'otro')[]
  cantidadPerros: '1' | '2' | '3+' | ''
  cantidadGatos: '1' | '2' | '3+' | ''
  mascotaPeso: '0-5 kg' | '5-10 kg' | '+10 kg' | ''
  // Legal y económica
  documentacion: LeadData['documentacion'] | ''
  situacionLaboral: LeadData['situacionLaboral'] | ''
  ingresosMensuales: string
  garantias: ('garantia-adicional' | 'aval-bancario' | 'avalista' | 'seguro-impago' | 'ninguna')[]
  cuentaBancaria: 'si' | 'no' | ''
  comprendeHonorarios: 'entiende' | 'pide-explicacion' | ''
  // Vivienda
  ciudadDestino: LeadData['ciudadDestino'] | ''
  presupuestoMensual: 'menos-700' | '700-1000' | '1000-1400' | 'mas-1400' | ''
  tipoInmueble: 'habitacion' | 'estudio' | 'piso' | 'casa' | 'co-living' | ''
  habitacionesMinimas: '1' | '2' | '3' | '4+' | ''
  amueblado: LeadData['amueblado'] | ''
  imprescindibles: ('ascensor' | 'garaje' | 'calefaccion' | 'terraza' | 'no')[]
  comodidades: ('transporte' | 'zona-tranquila' | 'cerca-colegios' | 'internet' | 'ninguna')[]
  // Perfil y plazos
  necesidadesEspeciales: 'si' | 'no' | ''
  tipoLicencia: 'espanola' | 'europea' | 'origen' | 'no-tiene' | ''
  // Solo si origenResidencia === 'en_espana' (rama "ya vivo en España" de Gina)
  ciudadActual: string
  tiempoEnEspana: 'menos-1-ano' | '1-5-anos' | 'mas-5-anos' | ''
  objetivoBusqueda: 'busca-vivienda' | 'integrarse' | ''
  profesion: string
  nivelEstudios: 'sin-estudios' | 'bachillerato' | 'tecnico' | 'universitario' | 'posgrado' | ''
  fechaLlegada: string
  // Para terminar
  comoNosConociste: 'instagram' | 'facebook' | 'tiktok' | 'google' | 'recomendacion' | 'otro' | ''
  comprendeServicio: boolean
  consentimientoRGPD: boolean
}

/** true cuando, igual que en Gina (p20a_objetivo → "integrarse"), se omite toda la búsqueda de vivienda */
export function omiteBusquedaVivienda(form: Pick<FormState, 'origenResidencia' | 'objetivoBusqueda'>): boolean {
  return form.origenResidencia === 'en_espana' && form.objetivoBusqueda === 'integrarse'
}

export type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL_STATE: FormState = {
  nombreCompleto: '',
  email: '',
  telefono: '',
  origenResidencia: '',
  paisResidencia: '',
  adultos: '',
  hayMenores: '',
  ninos: '',
  adolescentes: '',
  mascotas: '',
  mascotaTipo: [],
  cantidadPerros: '',
  cantidadGatos: '',
  mascotaPeso: '',
  documentacion: '',
  situacionLaboral: '',
  ingresosMensuales: '',
  garantias: [],
  cuentaBancaria: '',
  comprendeHonorarios: '',
  ciudadDestino: '',
  presupuestoMensual: '',
  tipoInmueble: '',
  habitacionesMinimas: '',
  amueblado: '',
  imprescindibles: [],
  comodidades: [],
  necesidadesEspeciales: '',
  tipoLicencia: '',
  ciudadActual: '',
  tiempoEnEspana: '',
  objetivoBusqueda: '',
  profesion: '',
  nivelEstudios: '',
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
  if (!form.origenResidencia)
    errors.origenResidencia = 'Indícanos si ya vives en España o vienes de fuera'
  if (form.origenResidencia === 'fuera' && !form.paisResidencia.trim())
    errors.paisResidencia = 'Cuéntanos desde qué país nos escribes'
  if (form.origenResidencia === 'en_espana' && !form.ciudadActual.trim())
    errors.ciudadActual = 'Cuéntanos en qué ciudad o provincia vives actualmente'
  if (form.origenResidencia === 'en_espana' && !form.tiempoEnEspana)
    errors.tiempoEnEspana = 'Indícanos cuánto tiempo llevas viviendo en España'
  if (form.origenResidencia === 'en_espana' && !form.objetivoBusqueda)
    errors.objetivoBusqueda = 'Indícanos si buscas vivienda o ya tienes dónde vivir'
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
  if (form.mascotas === 'si' && form.mascotaTipo.includes('perro') && !form.cantidadPerros)
    errors.cantidadPerros = 'Indícanos cuántos perros tienes'
  if (form.mascotas === 'si' && form.mascotaTipo.includes('gato') && !form.cantidadGatos)
    errors.cantidadGatos = 'Indícanos cuántos gatos tienes'
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
  if (!form.cuentaBancaria)
    errors.cuentaBancaria = 'Indícanos si ya tienes cuenta bancaria en España'
  if (!form.comprendeHonorarios)
    errors.comprendeHonorarios = 'Indícanos si entiendes cómo funcionan nuestros honorarios'
  if (!form.ciudadDestino)
    errors.ciudadDestino = 'Elige una ciudad de destino'
  if (!form.presupuestoMensual)
    errors.presupuestoMensual = 'Indícanos tu presupuesto mensual de alquiler'
  if (!omiteBusquedaVivienda(form)) {
    if (!form.tipoInmueble)
      errors.tipoInmueble = 'Selecciona el tipo de vivienda que buscas'
    if (form.tipoInmueble !== 'estudio' && !form.habitacionesMinimas)
      errors.habitacionesMinimas = 'Indícanos cuántas habitaciones necesitas'
    if (!form.amueblado)
      errors.amueblado = 'Indícanos si necesitas la vivienda amueblada'
  }
  if (!form.tipoLicencia)
    errors.tipoLicencia = 'Indícanos si tienes licencia de conducir'
  if (!form.nivelEstudios)
    errors.nivelEstudios = 'Selecciona tu nivel de estudios'
  if (!form.fechaLlegada)
    errors.fechaLlegada = 'Indícanos en qué plazo necesitas resolver tu vivienda'
  if (!form.comprendeServicio)
    errors.comprendeServicio = 'Es importante que entiendas cómo funciona el servicio antes de continuar'
  if (!form.consentimientoRGPD)
    errors.consentimientoRGPD = 'Necesitamos tu consentimiento para tratar tus datos'

  return errors
}

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

// ─── Borrador en localStorage ─────────────────────────────────────────────────
// El formulario tiene ~41 preguntas repartidas en 6 pantallas de scroll y no
// guardaba nada: una recarga, un corte de conexión o salir a buscar un dato
// borraba todo lo escrito (auditoría 2026-07-25, I10).

const BORRADOR_KEY = 'tlg-conocernos-borrador'
/** El borrador caduca a los 7 días para no dejar datos personales indefinidamente. */
const BORRADOR_TTL_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Los dos consentimientos NO se persisten ni se restauran: el usuario tiene que
 * volver a marcarlos de forma activa. Un consentimiento RGPD pre-marcado por un
 * borrador viejo no es un consentimiento válido.
 */
const CAMPOS_SIN_PERSISTIR = ['comprendeServicio', 'consentimientoRGPD'] as const

function leerBorrador(): Partial<FormState> | null {
  try {
    const crudo = window.localStorage.getItem(BORRADOR_KEY)
    if (!crudo) return null
    const { guardadoEn, datos } = JSON.parse(crudo) as { guardadoEn?: number; datos?: Record<string, unknown> }
    if (!guardadoEn || !datos || Date.now() - guardadoEn > BORRADOR_TTL_MS) {
      window.localStorage.removeItem(BORRADOR_KEY)
      return null
    }
    // Solo se aceptan claves que existen hoy en el formulario: si el esquema
    // cambió o el contenido está corrupto, lo desconocido se descarta en vez de
    // entrar al estado.
    const limpio: Record<string, unknown> = {}
    for (const clave of Object.keys(INITIAL_STATE)) {
      if (clave in datos && !CAMPOS_SIN_PERSISTIR.includes(clave as (typeof CAMPOS_SIN_PERSISTIR)[number])) {
        limpio[clave] = datos[clave]
      }
    }
    return limpio as Partial<FormState>
  } catch {
    return null // JSON inválido, localStorage bloqueado (modo privado), cuota, etc.
  }
}

function borrarBorrador() {
  try {
    window.localStorage.removeItem(BORRADOR_KEY)
  } catch {
    /* sin localStorage disponible no hay nada que limpiar */
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFormulario() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  // Validación híbrida: callada hasta el primer envío, reactiva onBlur después. Ver
  // lib/forms/useValidacionHibrida.ts. `validate` cierra sobre `form`, así que se le pasa
  // envuelto para que el hook siempre valide contra el estado del render actual.
  const {
    errores: errors,
    huboIntentoFallido,
    validarParaEnviar,
    validarCampo,
    limpiarError,
    limpiarTodo,
  } = useValidacionHibrida<FormErrors>(() => validate(form))
  const [status, setStatus] = useState<FormStatus>('idle')
  const formRef = useRef<HTMLFormElement>(null)
  // Hasta que no se restauró el borrador no se guarda nada, para que el estado
  // inicial vacío del primer render no pise un borrador existente.
  const puedeGuardar = useRef(false)

  // La restauración va en un efecto y no en el inicializador de useState a
  // propósito: el inicializador también corre en el servidor, donde no existe
  // localStorage, y devolver ahí un valor distinto al del cliente rompería la
  // hidratación de todos los campos.
  //
  // react-hooks/set-state-in-effect se desactiva sólo en esta línea: la regla
  // apunta a los efectos que encadenan renders a partir de estado que ya vive en
  // React, y este es el caso contrario — leer una vez, al montar, de un sistema
  // externo (localStorage) que por definición no se puede consultar durante el
  // render del servidor. Corre una sola vez y no depende de ningún estado.
  useEffect(() => {
    const borrador = leerBorrador()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de localStorage al montar; ver nota de arriba
    if (borrador) setForm((prev) => ({ ...prev, ...borrador }))
    puedeGuardar.current = true
  }, [])

  // Guarda en cada cambio del formulario. No toca validación ni envío: solo
  // vuelca el estado. Los campos condicionalmente ocultos ya vienen limpiados
  // por sus propios setters, así que el borrador refleja lo mismo que la UI.
  useEffect(() => {
    if (!puedeGuardar.current) return
    try {
      const datos: Record<string, unknown> = { ...form }
      for (const clave of CAMPOS_SIN_PERSISTIR) delete datos[clave]
      window.localStorage.setItem(BORRADOR_KEY, JSON.stringify({ guardadoEn: Date.now(), datos }))
    } catch {
      /* cuota llena o modo privado: el formulario sigue funcionando sin borrador */
    }
  }, [form])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    limpiarError(key)
  }

  function setHayMenores(v: 'si' | 'no') {
    if (v === 'no') {
      setForm((prev) => ({ ...prev, hayMenores: 'no', ninos: '' as FormState['ninos'], adolescentes: '' as FormState['adolescentes'] }))
    } else {
      setForm((prev) => ({ ...prev, hayMenores: 'si' }))
    }
    limpiarError('hayMenores')
  }

  function setMascotas(v: 'si' | 'no') {
    if (v === 'no') {
      setForm((prev) => ({
        ...prev,
        mascotas: 'no',
        mascotaTipo: [],
        cantidadPerros: '' as FormState['cantidadPerros'],
        cantidadGatos: '' as FormState['cantidadGatos'],
        mascotaPeso: '' as FormState['mascotaPeso'],
      }))
    } else {
      setForm((prev) => ({ ...prev, mascotas: 'si' }))
    }
    limpiarError('mascotas')
  }

  function setOrigenResidencia(v: 'en_espana' | 'fuera') {
    setForm((prev) => ({
      ...prev,
      origenResidencia: v,
      // Limpia los campos exclusivos de la rama contraria (mismo criterio que flow.json)
      ...(v === 'en_espana'
        ? { paisResidencia: '' }
        : { ciudadActual: '', tiempoEnEspana: '' as FormState['tiempoEnEspana'], objetivoBusqueda: '' as FormState['objetivoBusqueda'] }),
    }))
    limpiarError('origenResidencia')
  }

  function setObjetivoBusqueda(v: 'busca-vivienda' | 'integrarse') {
    setForm((prev) => ({
      ...prev,
      objetivoBusqueda: v,
      ...(v === 'integrarse'
        ? {
            tipoInmueble: '' as FormState['tipoInmueble'],
            habitacionesMinimas: '' as FormState['habitacionesMinimas'],
            amueblado: '' as FormState['amueblado'],
            imprescindibles: [] as FormState['imprescindibles'],
            comodidades: [] as FormState['comodidades'],
          }
        : {}),
    }))
    limpiarError('objetivoBusqueda')
  }

  function setTipoInmueble(v: 'habitacion' | 'estudio' | 'piso' | 'casa' | 'co-living') {
    setForm((prev) => ({
      ...prev,
      tipoInmueble: v,
      habitacionesMinimas: v === 'estudio' ? '' as FormState['habitacionesMinimas'] : prev.habitacionesMinimas,
    }))
    limpiarError('tipoInmueble')
  }

  function toggleGarantia(val: LeadData['garantias'][number]) {
    const next = toggleExclusivo(form.garantias, val, 'ninguna' as LeadData['garantias'][number])
    setForm((prev) => ({ ...prev, garantias: next }))
    limpiarError('garantias')
  }

  function toggleMascotaTipo(val: 'perro' | 'gato' | 'otro') {
    const yaEstaba = form.mascotaTipo.includes(val)
    const next = yaEstaba
      ? form.mascotaTipo.filter((v) => v !== val)
      : [...form.mascotaTipo, val]
    setForm((prev) => ({
      ...prev,
      mascotaTipo: next,
      mascotaPeso: val === 'perro' && yaEstaba ? '' as FormState['mascotaPeso'] : prev.mascotaPeso,
      cantidadPerros: val === 'perro' && yaEstaba ? '' as FormState['cantidadPerros'] : prev.cantidadPerros,
      cantidadGatos: val === 'gato' && yaEstaba ? '' as FormState['cantidadGatos'] : prev.cantidadGatos,
    }))
    limpiarError('mascotaTipo')
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

    // validarParaEnviar además ENCIENDE el modo reactivo: a partir del primer envío
    // fallido, cada campo que la persona abandone se revalida solo (ver validarCampo).
    const validationErrors = validarParaEnviar()
    if (Object.keys(validationErrors).length > 0) {
      const firstKey = Object.keys(validationErrors)[0]
      const el = document.getElementById(firstKey) ?? document.getElementById(`${firstKey}-error`)
      // Foco además del scroll: el scroll solo mueve la vista, y quien navega con teclado
      // o lector de pantalla se queda donde estaba sin enterarse de que el envío falló
      // (mismo hueco que se corrigió en el formulario de Comunidad).
      if (el instanceof HTMLElement && typeof el.focus === 'function') el.focus({ preventScroll: true })
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setStatus('loading')

    const hayEstudio = form.tipoInmueble === 'estudio'
    const sinBusquedaVivienda = omiteBusquedaVivienda(form)

    try {
      // origenResidencia y paisResidencia se envían tal cual — el servidor deriva
      // paisResidencia='España' y modalidad, igual que hace Gina con sesion.origenResidencia.
      const payload:
        Partial<LeadData> & Pick<LeadData, 'nombreCompleto' | 'email' | 'comprendeServicio' | 'consentimientoRGPD'>
        & { origenResidencia: FormState['origenResidencia'] } = {
        // Contacto
        nombreCompleto: form.nombreCompleto,
        email: form.email,
        telefono: form.telefono,
        origenResidencia: form.origenResidencia,
        paisResidencia: form.origenResidencia === 'fuera' ? form.paisResidencia : '',
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
        ...(form.mascotas === 'si' && form.mascotaTipo.includes('perro') && form.cantidadPerros
          ? { cantidadPerros: form.cantidadPerros as LeadData['cantidadPerros'] }
          : {}),
        ...(form.mascotas === 'si' && form.mascotaTipo.includes('gato') && form.cantidadGatos
          ? { cantidadGatos: form.cantidadGatos as LeadData['cantidadGatos'] }
          : {}),
        ...(form.mascotas === 'si' && form.mascotaTipo.includes('perro') && form.mascotaPeso
          ? { mascotaPeso: form.mascotaPeso as LeadData['mascotaPeso'] }
          : {}),
        // Legal y económica
        documentacion: form.documentacion as LeadData['documentacion'],
        situacionLaboral: form.situacionLaboral as LeadData['situacionLaboral'],
        ingresosMensuales: form.ingresosMensuales,
        garantias: form.garantias,
        cuentaBancaria: form.cuentaBancaria as LeadData['cuentaBancaria'],
        comprendeHonorarios: form.comprendeHonorarios as LeadData['comprendeHonorarios'],
        // Vivienda
        ciudadDestino: form.ciudadDestino as LeadData['ciudadDestino'],
        presupuestoMensual: form.presupuestoMensual as LeadData['presupuestoMensual'],
        ...(!sinBusquedaVivienda
          ? {
              tipoInmueble: form.tipoInmueble as LeadData['tipoInmueble'],
              amueblado: form.amueblado as LeadData['amueblado'],
              ...(!hayEstudio && form.habitacionesMinimas
                ? { habitacionesMinimas: form.habitacionesMinimas as LeadData['habitacionesMinimas'] }
                : {}),
              ...(form.imprescindibles.length > 0
                ? { imprescindibles: form.imprescindibles as LeadData['imprescindibles'] }
                : {}),
              ...(form.comodidades.length > 0
                ? { comodidades: form.comodidades as LeadData['comodidades'] }
                : {}),
            }
          : {}),
        // Perfil y plazos
        ...(form.necesidadesEspeciales
          ? { necesidadesEspeciales: form.necesidadesEspeciales }
          : {}),
        tipoLicencia: form.tipoLicencia as LeadData['tipoLicencia'],
        ...(form.origenResidencia === 'en_espana'
          ? {
              ciudadActual: form.ciudadActual.trim(),
              tiempoEnEspana: form.tiempoEnEspana as LeadData['tiempoEnEspana'],
              objetivoBusqueda: form.objetivoBusqueda as LeadData['objetivoBusqueda'],
            }
          : {}),
        ...(form.profesion.trim() ? { profesion: form.profesion.trim() } : {}),
        nivelEstudios: form.nivelEstudios as LeadData['nivelEstudios'],
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
        // Consulta enviada: el borrador ya no tiene sentido y no debe quedar
        // guardado (además de PII, reaparecería en la próxima visita).
        borrarBorrador()
        limpiarTodo()
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
    /** onBlur de cada campo. Silencioso hasta el primer envío fallido. */
    validarCampo,
    /** Por si algún componente necesita saber si el formulario ya está en modo reactivo. */
    huboIntentoFallido,
    set,
    setHayMenores,
    setMascotas,
    setTipoInmueble,
    setOrigenResidencia,
    setObjetivoBusqueda,
    toggleGarantia,
    toggleMascotaTipo,
    toggleImprescindible,
    toggleComodidad,
    handleSubmit,
    formRef,
  }
}

/**
 * components/admin/ficha/camposFicha.ts — Etiquetas y secciones de campos para la
 * Ficha 360° (app/admin/leads/[id]/page.tsx). Deliberadamente separado del archivo
 * app/admin/lead/[recordId]/page.tsx (no se toca, es otro flujo con auth por token).
 *
 * `calificacion` y `etiqueta` no aparecen acá: ya se muestran como badges en la
 * cabecera de la ficha, mostrarlos también en una sección sería redundante.
 */

export const CAMPOS_MIGRATORIOS = ['documentacion', 'tipoLicencia'] as const

export const LABELS: Record<string, string> = {
  paisResidencia:        'País de residencia',
  ciudadActual:          'Ciudad actual',
  ciudadDestino:         'Ciudad de destino',
  telefono:              'Teléfono',
  personas:              'Personas en el grupo',
  adultos:               'Adultos',
  ninos:                 'Niños',
  adolescentes:          'Adolescentes',
  mascotas:              'Mascotas',
  detalleMascotas:       'Detalle de mascotas',
  mascotaTipo:           'Tipo de mascota',
  cantidadPerros:        'Cantidad de perros',
  cantidadGatos:         'Cantidad de gatos',
  mascotaPeso:           'Peso de la mascota',
  documentacion:         'Documentación',
  situacionLaboral:      'Situación laboral',
  ingresosMensuales:     'Ingresos mensuales',
  garantias:             'Garantías',
  cuentaBancaria:        'Cuenta bancaria en España',
  comprendeHonorarios:   'Comprende honorarios',
  tipoLicencia:          'Tipo de licencia',
  nivelEstudios:         'Nivel de estudios',
  profesion:             'Profesión',
  tipoInmueble:          'Tipo de inmueble',
  habitacionesMinimas:   'Habitaciones mínimas',
  presupuestoMensual:    'Presupuesto mensual',
  amueblado:             'Amueblado',
  estacionamiento:       'Estacionamiento',
  comodidades:           'Comodidades deseadas',
  imprescindibles:       'Imprescindibles',
  fechaLlegada:          'Fecha de llegada prevista',
  tiempoEnEspana:        'Tiempo en España',
  objetivoBusqueda:      'Objetivo de búsqueda',
  modalidad:             'Modalidad',
  necesidadesEspeciales: 'Necesidades especiales',
  comoNosConociste:      'Cómo nos conoció',
  comprendeServicio:     'Comprende el servicio',
  consentimientoRGPD:    'Consentimiento RGPD',
  consentimientoRGPDAt:  'Última confirmación RGPD',
  fuenteLead:            'Fuente del lead',
  notasContacto:         'Mensaje del formulario de contacto',
}

export const SECTIONS: { title: string; fields: string[] }[] = [
  {
    title: 'Datos personales',
    fields: ['paisResidencia', 'ciudadActual', 'ciudadDestino', 'telefono'],
  },
  {
    title: 'Familia',
    fields: [
      'personas', 'adultos', 'ninos', 'adolescentes', 'mascotas',
      'detalleMascotas', 'mascotaTipo', 'cantidadPerros', 'cantidadGatos', 'mascotaPeso',
    ],
  },
  {
    title: 'Legal y laboral',
    fields: [
      'documentacion', 'situacionLaboral', 'ingresosMensuales',
      'garantias', 'cuentaBancaria', 'comprendeHonorarios',
      'tipoLicencia', 'nivelEstudios', 'profesion',
    ],
  },
  {
    title: 'Vivienda buscada',
    fields: [
      'tipoInmueble', 'habitacionesMinimas', 'presupuestoMensual',
      'amueblado', 'estacionamiento', 'comodidades', 'imprescindibles',
    ],
  },
  {
    title: 'Contexto y plazos',
    fields: [
      'fechaLlegada', 'tiempoEnEspana', 'objetivoBusqueda',
      'modalidad', 'necesidadesEspeciales', 'comoNosConociste',
      'comprendeServicio', 'consentimientoRGPD', 'consentimientoRGPDAt',
    ],
  },
  {
    title: 'Atribución',
    fields: ['fuenteLead', 'notasContacto'],
  },
]

/** Secciones filtradas: si el lead es nacional, oculta los campos migratorios. */
export function getSeccionesVisibles(esNacional: boolean): { title: string; fields: string[] }[] {
  if (!esNacional) return SECTIONS
  return SECTIONS.map(section => ({
    ...section,
    fields: section.fields.filter(f => !(CAMPOS_MIGRATORIOS as readonly string[]).includes(f)),
  }))
}

export const VALID_ADULTOS = ['1', '2', '3', '4+'] as const
export const VALID_MENORES_COUNT = ['0', '1', '2', '3+'] as const
export const VALID_MASCOTA_TIPO = ['perro', 'gato', 'otro'] as const
export const VALID_MASCOTA_PESO = ['0-5 kg', '5-10 kg', '+10 kg'] as const
export const VALID_CANTIDAD_MASCOTA = ['1', '2', '3+'] as const

export const VALID_ORIGEN_RESIDENCIA = ['en_espana', 'fuera'] as const
export const VALID_CUENTA_BANCARIA = ['si', 'no'] as const
export const VALID_COMPRENDE_HONORARIOS = ['entiende', 'pide-explicacion'] as const
export const VALID_TIPO_LICENCIA = ['espanola', 'europea', 'origen', 'no-tiene'] as const
export const VALID_TIEMPO_EN_ESPANA = ['menos-1-ano', '1-5-anos', 'mas-5-anos'] as const
export const VALID_OBJETIVO_BUSQUEDA = ['busca-vivienda', 'integrarse'] as const
export const VALID_NIVEL_ESTUDIOS = [
  'sin-estudios',
  'bachillerato',
  'tecnico',
  'universitario',
  'posgrado',
] as const

export const VALID_DOCUMENTACION = [
  'espanol',
  'ue-otro',
  'residencia-aprobada',
  'en-tramite',
  'nacionalidad-en-tramite',
  'turista',
] as const

export const VALID_SITUACION_LABORAL = [
  'cuenta-ajena',
  'autonomo',
  'teletrabajo-extranjero',
  'rentista',
  'jubilado',
  'estudiante',
  'busca-empleo',
] as const

export const VALID_INGRESOS = [
  'menos-1500',
  '1500-2500',
  '2500-4000',
  'mas-4000',
  'sin-ingresos',
] as const

export const VALID_GARANTIAS = ['garantia-adicional', 'aval-bancario', 'avalista', 'seguro-impago', 'ninguna'] as const

export const VALID_CIUDAD_DESTINO = [
  'vigo',
  'a-coruna',
  'santiago',
  'pontevedra',
  'lugo',
  'indiferente',
] as const

export const VALID_TIPO_INMUEBLE = [
  'habitacion',
  'estudio',
  'piso',
  'casa',
  'co-living',
] as const

export const VALID_PRESUPUESTO = ['menos-700', '700-1000', '1000-1400', 'mas-1400'] as const

export const VALID_HABITACIONES = ['1', '2', '3', '4+'] as const

export const VALID_AMUEBLADO = ['si', 'no', 'indiferente'] as const

export const VALID_IMPRESCINDIBLES = [
  'ascensor',
  'garaje',
  'calefaccion',
  'terraza',
  'no',
] as const

export const VALID_COMODIDADES = [
  'transporte',
  'zona-tranquila',
  'cerca-colegios',
  'internet',
  'ninguna',
] as const

export const VALID_NECESIDADES_ESPECIALES = ['si', 'no'] as const

export const VALID_FECHA_LLEGADA = [
  'menos-1-mes',
  '1-3-meses',
  '3-6-meses',
  'mas-6-meses',
  'sin-fecha',
] as const

export const VALID_COMO_NOS_CONOCISTE = [
  'instagram',
  'facebook',
  'tiktok',
  'google',
  'recomendacion',
  'otro',
] as const

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

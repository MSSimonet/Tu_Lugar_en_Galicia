export type AppUtil = {
  nombre: string
  descripcion: string
  plataformas: string
  icono: string
  link: string
}

export type CiudadKey = 'vigo' | 'coruna' | 'santiago' | 'lugo' | 'pontevedra'

export const CIUDADES: { key: CiudadKey; label: string; imagen: string }[] = [
  { key: 'vigo', label: 'Vigo', imagen: '/images/apps%20ciudades/vigo1.jpg' },
  { key: 'coruna', label: 'A Coruña', imagen: '/images/apps%20ciudades/coruna1.jpg' },
  { key: 'santiago', label: 'Santiago', imagen: '/images/apps%20ciudades/santiago1.jpg' },
  { key: 'lugo', label: 'Lugo', imagen: '/images/apps%20ciudades/lugo1.jpg' },
  { key: 'pontevedra', label: 'Pontevedra', imagen: '/images/apps%20ciudades/pontevedra1.jpg' },
]

export type NumeroEmergencia = { numero: string; servicio: string }

export const NUMEROS_EMERGENCIA: NumeroEmergencia[] = [
  { numero: '112', servicio: 'Emergencias generales' },
  { numero: '091', servicio: 'Policía Nacional' },
  { numero: '062', servicio: 'Guardia Civil' },
  { numero: '092', servicio: 'Policía Local' },
  { numero: '061', servicio: 'Emergencias sanitarias' },
  { numero: '080', servicio: 'Bomberos' },
]

// Apps compartidas entre varias ciudades — misma referencia de objeto en cada LOCAL_APPS
// donde corresponda, igual que en el diseño de referencia.
const MOBT: AppUtil = {
  nombre: 'MoBT',
  descripcion: 'paga con el móvil el bus interurbano de la Xunta (QR, descuentos automáticos)',
  plataformas: 'iOS · Android',
  icono: '🎫',
  link: 'https://play.google.com/store/apps/details?id=gal.xunta.maas',
}

const VIAQUA: AppUtil = {
  nombre: 'Viaqua',
  descripcion: 'factura y lecturas del agua',
  plataformas: 'iOS · Android · Web',
  icono: '🚰',
  link: 'https://www.viaqua.gal',
}

const AQUALIA: AppUtil = {
  nombre: 'Aqualia',
  descripcion: 'factura y gestión del suministro de agua',
  plataformas: 'iOS · Android · Web',
  icono: '🌊',
  link: 'https://www.aqualia.com',
}

const EMALCSA: AppUtil = {
  nombre: 'Emalcsa',
  descripcion: 'factura y consumo de agua (A Coruña)',
  plataformas: 'Web',
  icono: '💧',
  link: 'https://www.emalcsa.es',
}

const ESPINA_DELFIN: AppUtil = {
  nombre: 'Espina & Delfín',
  descripcion: 'consumos y lecturas de agua',
  plataformas: 'Web',
  icono: '🪣',
  link: 'https://oficinavirtual.espinaydelfin.com/',
}

export const LOCAL_APPS: Record<CiudadKey, AppUtil[]> = {
  vigo: [
    {
      nombre: 'Passvigo',
      descripcion: 'tarjeta monedero del bus urbano (Vitrasa)',
      plataformas: 'iOS · Android · Web',
      icono: '🚌',
      link: 'https://passvigo.vigo.org/',
    },
    MOBT,
    {
      nombre: 'GasAll',
      descripcion: 'gasolineras más baratas cerca de ti',
      plataformas: 'iOS · Android',
      icono: '⛽',
      link: 'https://play.google.com/store/apps/details?id=com.gasall',
    },
    AQUALIA,
    VIAQUA,
    ESPINA_DELFIN,
  ],
  coruna: [
    {
      nombre: 'App Coruña',
      descripcion: 'trámites municipales y bus urbano',
      plataformas: 'iOS · Android · Web',
      icono: '🚏',
      link: 'https://play.google.com/store/apps/details?id=org.coruna.appcoruna',
    },
    MOBT,
    EMALCSA,
    VIAQUA,
    AQUALIA,
  ],
  santiago: [
    {
      nombre: 'Concello de Santiago',
      descripcion: 'sede electrónica y bus urbano',
      plataformas: 'iOS · Android',
      icono: '🏢',
      link: 'https://sede.santiagodecompostela.gal',
    },
    MOBT,
    VIAQUA,
    AQUALIA,
    EMALCSA,
  ],
  lugo: [
    {
      nombre: 'Concello de Lugo',
      descripcion: 'trámites municipales y bus urbano',
      plataformas: 'iOS · Android · Web',
      icono: '🧱',
      link: 'https://concellodelugo.gal/es/tramites/online',
    },
    MOBT,
    AQUALIA,
    VIAQUA,
  ],
  pontevedra: [
    {
      nombre: 'Pontevédrate',
      descripcion: 'actividades municipales y avisos de servicios',
      plataformas: 'Android · Web',
      icono: '📅',
      link: 'https://pontevedra.gal',
    },
    MOBT,
    VIAQUA,
    AQUALIA,
    ESPINA_DELFIN,
  ],
}

export type CategoriaNacional = {
  key: string
  label: string
  apps: AppUtil[]
}

export const NATIONAL_CATEGORIES: CategoriaNacional[] = [
  {
    key: 'identidad',
    label: 'Identidad y Trámites',
    apps: [
      { nombre: 'Cl@ve', descripcion: 'identificación digital ante la Administración', plataformas: 'iOS · Android · Web', icono: '🔑', link: 'https://clave.gob.es/clave-movil/app-clave' },
      { nombre: 'Carpeta Ciudadana', descripcion: 'documentos y trámites con el Estado', plataformas: 'iOS · Android · Web', icono: '🗂️', link: 'https://apps.apple.com/es/app/mi-carpeta-ciudadana/id1555943725' },
      { nombre: 'AEAT', descripcion: 'declaración de la Renta y datos fiscales', plataformas: 'iOS · Android · Web', icono: '🧾', link: 'https://sede.agenciatributaria.gob.es' },
      { nombre: 'Importass', descripcion: 'vida laboral y afiliación a la Seg. Social', plataformas: 'iOS · Android · Web', icono: '🗄️', link: 'https://portal.seg-social.gob.es/importass' },
      { nombre: 'miDGT', descripcion: 'permiso de conducir y canje de licencia', plataformas: 'iOS · Android · Web', icono: '🚘', link: 'https://www.dgt.es' },
      { nombre: 'MiDNI', descripcion: 'DNI digitalizado en el móvil', plataformas: 'iOS · Android · Web', icono: '🪪', link: 'https://apps.apple.com/es/app/midni/id6477598076' },
      { nombre: 'Extranjería Cita Previa', descripcion: 'cita para la TIE y el NIE', plataformas: 'Web · Android', icono: '🛂', link: 'https://sede.administracionespublicas.gob.es/icpplus/index.html' },
    ],
  },
  {
    key: 'salud',
    label: 'Salud',
    apps: [
      { nombre: 'ÉSaúde', descripcion: 'cita médica e informes del SERGAS', plataformas: 'iOS · Android · Web', icono: '🩺', link: 'https://www.sergas.es' },
    ],
  },
  {
    key: 'empleo',
    label: 'Empleo',
    apps: [
      { nombre: 'InfoJobs', descripcion: 'ofertas de empleo en toda España', plataformas: 'iOS · Android · Web', icono: '💼', link: 'https://www.infojobs.net' },
      { nombre: 'LinkedIn', descripcion: 'red profesional y networking', plataformas: 'iOS · Android · Web', icono: '🔗', link: 'https://www.linkedin.com' },
      { nombre: 'Emprego Galicia', descripcion: 'servicio público de empleo de la Xunta', plataformas: 'iOS · Android · Web', icono: '📋', link: 'https://emprego.xunta.gal' },
    ],
  },
  {
    key: 'movilidad',
    label: 'Viajes y Transporte',
    apps: [
      { nombre: 'Renfe', descripcion: 'billetes de tren y asistencia de viaje', plataformas: 'iOS · Android · Web', icono: '🚆', link: 'https://www.renfe.com' },
      { nombre: 'BlaBlaCar', descripcion: 'viaje compartido en coche', plataformas: 'iOS · Android · Web', icono: '🚗', link: 'https://www.blablacar.es' },
      { nombre: 'Skyscanner', descripcion: 'comparar tarifas de vuelos', plataformas: 'iOS · Android · Web', icono: '✈️', link: 'https://www.skyscanner.es' },
    ],
  },
  {
    key: 'hogar',
    label: 'Clima y Hogar',
    apps: [
      { nombre: 'MeteoGalicia', descripcion: 'pronóstico oficial para Galicia', plataformas: 'iOS · Android · Web', icono: '🌦', link: 'https://www.meteogalicia.gal' },
      { nombre: 'Endesa / Naturgy', descripcion: 'alta de luz y gas del hogar', plataformas: 'iOS · Android · Web', icono: '⚡', link: 'https://www.endesa.com' },
      { nombre: 'Correos', descripcion: 'seguimiento de paquetes y correo', plataformas: 'iOS · Android · Web', icono: '📦', link: 'https://www.correos.es' },
    ],
  },
  {
    key: 'telco',
    label: 'Telefonía, Fibra y TV',
    apps: [
      { nombre: 'Mi Movistar', descripcion: 'gestiona tu línea, factura y datos móviles', plataformas: 'iOS · Android · Web', icono: '📱', link: 'https://www.movistar.es' },
      { nombre: 'Mi Vodafone', descripcion: 'gestiona tu línea, factura y datos móviles', plataformas: 'iOS · Android · Web', icono: '📶', link: 'https://www.vodafone.es' },
      { nombre: 'Mi R', descripcion: 'gestiona tu línea de fibra y móvil (R)', plataformas: 'iOS · Android · Web', icono: '📡', link: 'https://www.mundo-r.com' },
      { nombre: 'Mi Digi', descripcion: 'gestiona tu línea, factura y datos móviles', plataformas: 'iOS · Android · Web', icono: '🌐', link: 'https://www.digimobil.es' },
      { nombre: 'Mi Yoigo', descripcion: 'gestiona tu línea, factura y datos móviles', plataformas: 'iOS · Android', icono: '☎️', link: 'https://play.google.com/store/apps/details?id=com.yoigo.miyoigo' },
      { nombre: 'Mi Orange', descripcion: 'gestiona tu línea, factura y datos móviles', plataformas: 'iOS · Android · Web', icono: '🍊', link: 'https://www.orange.es' },
      { nombre: 'Mi Jazztel', descripcion: 'gestiona tu línea de fibra y factura', plataformas: 'iOS · Android · Web', icono: '🎷', link: 'https://www.jazztel.com' },
      { nombre: 'MasOrange', descripcion: 'portal del grupo Orange · MasMóvil', plataformas: 'Web', icono: '🧡', link: 'https://www.masorange.es' },
      { nombre: 'Movistar Plus+', descripcion: 'televisión y streaming de Movistar', plataformas: 'iOS · Android · Web', icono: '▶️', link: 'https://www.movistarplus.es' },
      { nombre: 'Orange TV', descripcion: 'televisión y streaming de Orange', plataformas: 'iOS · Android · Web', icono: '📺', link: 'https://www.orange.es/television' },
      { nombre: 'TV comigo (R)', descripcion: 'televisión y streaming de R', plataformas: 'iOS · Android · Web', icono: '🎬', link: 'https://www.mundo-r.com' },
      { nombre: 'Vodafone TV', descripcion: 'televisión y streaming de Vodafone', plataformas: 'iOS · Android · Web', icono: '📹', link: 'https://www.vodafone.es/television' },
    ],
  },
]

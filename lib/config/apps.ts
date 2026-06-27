export type App = {
  nombre: string
  descripcion: string
  paraQue: string
  categoria: 'identidad' | 'salud' | 'transporte' | 'hogar' | 'burocracia'
  links: {
    ios?: string
    android?: string
    web?: string
  }
}

export const APPS: App[] = [
  // ── Identidad y Trámites ──────────────────────────────────────────────────
  {
    nombre: 'Certificado Digital (FNMT)',
    descripcion: 'Firma electrónica emitida por la Fábrica Nacional de Moneda y Timbre.',
    paraQue: 'Firmar documentos y hacer trámites ante la Administración desde casa, sin desplazamientos.',
    categoria: 'identidad',
    links: {
      web: 'https://www.sede.fnmt.gob.es/certificados',
    },
  },
  {
    nombre: 'Cl@ve',
    descripcion: 'Sistema oficial de identificación digital de la Administración española.',
    paraQue: 'Acceder a tu expediente de extranjería, al SEPE y a cualquier sede electrónica del Estado.',
    categoria: 'identidad',
    links: {
      ios: 'https://apps.apple.com/es/app/clave/id1282788314',
      android: 'https://play.google.com/store/apps/details?id=es.gob.clave',
      web: 'https://clave.gob.es',
    },
  },
  {
    nombre: 'Carpeta Ciudadana',
    descripcion: 'Acceso centralizado a tus documentos y trámites con el Estado español.',
    paraQue: 'Descargar el volante de empadronamiento y consultar el estado de tus expedientes en un solo lugar.',
    categoria: 'identidad',
    links: {
      ios: 'https://apps.apple.com/es/app/carpeta-ciudadana/id1340629305',
      android: 'https://play.google.com/store/apps/details?id=es.gob.carpetaciudadana',
      web: 'https://carpetaciudadana.gob.es',
    },
  },
  {
    nombre: 'miDGT',
    descripcion: 'App oficial de la Dirección General de Tráfico.',
    paraQue: 'Llevar el permiso de conducir en el móvil y gestionar el canje de tu licencia extranjera.',
    categoria: 'identidad',
    links: {
      ios: 'https://apps.apple.com/es/app/midgt/id1437765807',
      android: 'https://play.google.com/store/apps/details?id=es.dgt.sMidgtAndroid',
      web: 'https://sede.dgt.gob.es/es/midgt/',
    },
  },

  // ── Salud (SERGAS) ────────────────────────────────────────────────────────
  {
    nombre: 'ÉSaúde',
    descripcion: 'App del Servicio Gallego de Salud para gestionar tu atención médica.',
    paraQue: 'Pedir cita con tu médico de cabecera y consultar tus informes clínicos del SERGAS.',
    categoria: 'salud',
    links: {
      ios: 'https://apps.apple.com/es/app/esaude/id1146007095',
      android: 'https://play.google.com/store/apps/details?id=es.xunta.sergas.esaude',
      web: 'https://www.sergas.es/Saude-publica/esaude',
    },
  },
  {
    nombre: 'SaúdeGal',
    descripcion: 'Portal web del SERGAS para trámites de salud en Galicia.',
    paraQue: 'Obtener tu tarjeta sanitaria gallega y localizar centros de salud en tu área.',
    categoria: 'salud',
    links: {
      web: 'https://saude.sergas.gal',
    },
  },

  // ── Transporte ────────────────────────────────────────────────────────────
  {
    nombre: 'Passvigo',
    descripcion: 'Tarjeta de transporte público de Vigo recargable desde el móvil.',
    paraQue: 'Recargar el abono mensual del bus de Vigo sin ir a un punto de venta presencial.',
    categoria: 'transporte',
    links: {
      ios: 'https://apps.apple.com/es/app/passvigo/id1448148264',
      android: 'https://play.google.com/store/apps/details?id=es.passvigo.app',
      web: 'https://www.passvigo.es',
    },
  },
  {
    nombre: 'Bus Metropolitano A Coruña',
    descripcion: 'Información de la red de autobuses del área metropolitana de A Coruña.',
    paraQue: 'Consultar horarios y líneas de bus en A Coruña antes de planificar tus primeros días.',
    categoria: 'transporte',
    links: {
      web: 'https://www.metropolitano.gal',
    },
  },
  {
    nombre: 'Renfe',
    descripcion: 'App oficial del operador ferroviario nacional de España.',
    paraQue: 'Comprar billetes de tren y consultar horarios entre las ciudades gallegas y el resto del país.',
    categoria: 'transporte',
    links: {
      ios: 'https://apps.apple.com/es/app/renfe-billetes-de-tren/id432062635',
      android: 'https://play.google.com/store/apps/details?id=com.renfe.renfemobile',
      web: 'https://www.renfe.com',
    },
  },
  {
    nombre: 'BlaBlaCar',
    descripcion: 'Plataforma de viajes compartidos en coche entre ciudades.',
    paraQue: 'Viajar entre ciudades gallegas a bajo costo cuando no hay tren directo o buscas más flexibilidad.',
    categoria: 'transporte',
    links: {
      ios: 'https://apps.apple.com/es/app/blablacar-carpooling-y-bus/id341329033',
      android: 'https://play.google.com/store/apps/details?id=com.comuto',
      web: 'https://www.blablacar.es',
    },
  },

  // ── Hogar ─────────────────────────────────────────────────────────────────
  {
    nombre: 'Endesa',
    descripcion: 'Área de clientes de la principal eléctrica de Galicia.',
    paraQue: 'Dar de alta la luz en tu nuevo piso y gestionar tus facturas eléctricas desde el móvil.',
    categoria: 'hogar',
    links: {
      ios: 'https://apps.apple.com/es/app/endesa-clientes/id456399849',
      android: 'https://play.google.com/store/apps/details?id=es.endesa.clientes',
      web: 'https://www.endesa.com/es/clientes/area-clientes',
    },
  },
  {
    nombre: 'Naturgy',
    descripcion: 'Área de clientes del proveedor de gas natural más extendido en Galicia.',
    paraQue: 'Contratar el gas para tu vivienda y consultar el estado de tus facturas online.',
    categoria: 'hogar',
    links: {
      ios: 'https://apps.apple.com/es/app/naturgy-clientes/id1209476547',
      android: 'https://play.google.com/store/apps/details?id=com.gasnatural.oac',
      web: 'https://www.naturgy.es/clientes',
    },
  },
  {
    nombre: 'Correos',
    descripcion: 'App del servicio postal oficial de España.',
    paraQue: 'Recibir notificaciones certificadas del Estado sin tener que estar presente en el buzón.',
    categoria: 'hogar',
    links: {
      ios: 'https://apps.apple.com/es/app/correos/id424587943',
      android: 'https://play.google.com/store/apps/details?id=es.correos.correos',
      web: 'https://www.correos.es',
    },
  },

  // ── Burocracia ────────────────────────────────────────────────────────────
  {
    nombre: 'Agencia Tributaria (AEAT)',
    descripcion: 'App oficial de Hacienda para declaraciones y consultas fiscales.',
    paraQue: 'Hacer la declaración de la renta y consultar tus datos fiscales registrados en España.',
    categoria: 'burocracia',
    links: {
      ios: 'https://apps.apple.com/es/app/agencia-tributaria/id440161042',
      android: 'https://play.google.com/store/apps/details?id=es.aeat.appmovil',
      web: 'https://sede.agenciatributaria.gob.es',
    },
  },
  {
    nombre: 'Seguridad Social',
    descripcion: 'Sede electrónica de la Seguridad Social española.',
    paraQue: 'Solicitar tu número de Seguridad Social (NUSS) e informes de vida laboral.',
    categoria: 'burocracia',
    links: {
      web: 'https://sede.seg-social.gob.es',
    },
  },
  {
    nombre: 'Padrón Municipal',
    descripcion: 'Registro municipal de habitantes — el primer trámite al llegar.',
    paraQue: 'Empadronarte en tu nuevo domicilio: es requisito para el TIE, la sanidad y la escolarización.',
    categoria: 'burocracia',
    links: {
      web: 'https://www.xunta.gal/tramites-e-servizos',
    },
  },
]

export const CATEGORIAS = [
  { id: 'identidad',   label: 'Identidad y Trámites' },
  { id: 'salud',       label: 'Salud (SERGAS)'        },
  { id: 'transporte',  label: 'Transporte'             },
  { id: 'hogar',       label: 'Hogar'                  },
  { id: 'burocracia',  label: 'Burocracia'             },
] as const satisfies { id: App['categoria']; label: string }[]

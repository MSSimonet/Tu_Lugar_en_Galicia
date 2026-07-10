export type Plataformas = {
  ios?: string
  android?: string
  web?: string
}

export type AppUtil = {
  nombre: string
  descripcion: string
  plataformas: Plataformas
}

export type CiudadKey = 'vigo' | 'coruna' | 'santiago' | 'lugo' | 'pontevedra'

export const CIUDADES: { key: CiudadKey; label: string; imagen: string }[] = [
  { key: 'vigo', label: 'Vigo', imagen: '/images/apps%20ciudades/vigo1.jpg' },
  { key: 'coruna', label: 'A Coruña', imagen: '/images/apps%20ciudades/coruna1.jpg' },
  { key: 'santiago', label: 'Santiago', imagen: '/images/apps%20ciudades/santiago1.jpg' },
  { key: 'lugo', label: 'Lugo', imagen: '/images/apps%20ciudades/lugo1.jpg' },
  { key: 'pontevedra', label: 'Pontevedra', imagen: '/images/apps%20ciudades/pontevedra1.jpg' },
]

// Apps municipales por ciudad. Fuente: "apps - galicia.md" §"Aplicaciones Municipales por
// Ciudades". Lugo no tiene sección propia en esa fuente (solo cubre Vigo/A Coruña/Santiago/
// Ourense/Pontevedra) — se mantiene en el selector porque así lo define el diseño de
// referencia, pero sin links reales inventados (plataformas queda vacío).
export const LOCAL_APPS: Record<CiudadKey, AppUtil[]> = {
  vigo: [
    {
      nombre: 'Passvigo',
      descripcion: 'tarjeta monedero del bus urbano (Vitrasa)',
      plataformas: {
        web: 'https://vitrasa.es/',
        ios: 'https://apps.apple.com/es/app/passvigo/id1485303649',
        android: 'https://play.google.com/store/apps/details?id=com.vigodigital.passvigo',
      },
    },
    {
      nombre: 'GasAll',
      descripcion: 'gasolineras más baratas cerca de ti',
      plataformas: {
        ios: 'https://apps.apple.com/es/app/gasall-gasolineras-espa%C3%B1a/id317316715',
        android: 'https://play.google.com/store/apps/details?id=com.gasall.android',
      },
    },
  ],
  coruna: [
    {
      nombre: 'iComi',
      descripcion: 'trámites municipales y bus urbano',
      plataformas: {
        web: 'https://www.coruna.gal/',
        ios: 'https://apps.apple.com/es/app/i-comi/id1390432321',
        android: 'https://play.google.com/store/apps/details?id=es.coruna.icomi',
      },
    },
  ],
  santiago: [
    {
      nombre: 'Concello de Santiago',
      descripcion: 'sede electrónica y bus urbano',
      plataformas: {
        ios: 'https://apps.apple.com/es/app/santiago-de-compostela/id1159283076',
        android: 'https://play.google.com/store/apps/details?id=com.concello.santiago',
      },
    },
  ],
  lugo: [
    {
      nombre: 'Concello de Lugo',
      descripcion: 'trámites municipales y bus urbano',
      plataformas: {},
    },
  ],
  pontevedra: [
    {
      nombre: 'Pontevédrate',
      descripcion: 'actividades municipales y avisos de servicios',
      plataformas: {
        web: 'https://www.pontevedra.gal/',
        android: 'https://play.google.com/store/apps/details?id=com.tokapp.pontevedrate',
      },
    },
  ],
}

export type CategoriaNacional = {
  key: string
  label: string
  apps: AppUtil[]
}

// Apps nacionales, agrupadas por categoría. Fuente: "apps - galicia.md".
export const NATIONAL_CATEGORIES: CategoriaNacional[] = [
  {
    key: 'identidad',
    label: 'Identidad y Trámites',
    apps: [
      {
        nombre: 'Cl@ve',
        descripcion: 'identificación digital ante la Administración',
        plataformas: {
          web: 'https://clave.gob.es/',
          ios: 'https://apps.apple.com/es/app/cl-ve/id1524317112',
          android: 'https://play.google.com/store/apps/details?id=es.gob.clave.app',
        },
      },
      {
        nombre: 'Carpeta Ciudadana',
        descripcion: 'documentos y trámites con el Estado',
        plataformas: {
          web: 'https://recetaciudadana.gob.es/',
          ios: 'https://apps.apple.com/es/app/mi-carpeta-ciudadana/id1631525096',
          android: 'https://play.google.com/store/apps/details?id=es.gob.seg.mcc',
        },
      },
      {
        nombre: 'AEAT',
        descripcion: 'declaración de la Renta y datos fiscales',
        plataformas: {
          web: 'https://sede.agenciatributaria.gob.es/',
          ios: 'https://apps.apple.com/es/app/agencia-tributaria/id1331773095',
          android: 'https://play.google.com/store/apps/details?id=es.aeat.etributaria',
        },
      },
      {
        nombre: 'Importass',
        descripcion: 'vida laboral y afiliación a la Seg. Social',
        plataformas: {
          web: 'https://sede.seg-social.gob.es/',
          ios: 'https://apps.apple.com/es/app/importass-seguridad-social/id1600127521',
          android: 'https://play.google.com/store/apps/details?id=es.seg_social.importass',
        },
      },
      {
        nombre: 'miDGT',
        descripcion: 'permiso de conducir y canje de licencia',
        plataformas: {
          web: 'https://www.dgt.es/nuestros-servicios/app-midgt/',
          ios: 'https://apps.apple.com/es/app/midgt/id1418659178',
          android: 'https://play.google.com/store/apps/details?id=es.dgt.app',
        },
      },
      {
        nombre: 'MiDNI',
        descripcion: 'DNI digitalizado en el móvil',
        plataformas: {
          web: 'https://www.midni.gob.es',
          ios: 'https://apps.apple.com/es/app/midni/id6477598076',
          android: 'https://play.google.com/store/apps/details?id=es.gob.interior.policia.midni',
        },
      },
      {
        nombre: 'Extranjería Cita Previa',
        descripcion: 'cita para la TIE y el NIE',
        plataformas: {
          web: 'https://icp.administracionelectronica.gob.es/icpplus/index.html',
          android: 'https://play.google.com/store/apps/details?id=com.amsoft.extranjeria',
        },
      },
    ],
  },
  {
    key: 'salud',
    label: 'Salud',
    apps: [
      {
        nombre: 'ÉSaúde',
        descripcion: 'cita médica e informes del SERGAS',
        plataformas: {
          web: 'https://esaude.sergas.gal/',
          ios: 'https://apps.apple.com/es/app/sergas-m%C3%B3bil/id1510444535',
          android: 'https://play.google.com/store/apps/details?id=es.sergas.sergasmobil',
        },
      },
    ],
  },
  {
    key: 'empleo',
    label: 'Empleo',
    apps: [
      {
        nombre: 'InfoJobs',
        descripcion: 'ofertas de empleo en toda España',
        plataformas: {
          web: 'https://www.infojobs.net/',
          ios: 'https://apps.apple.com/es/app/infojobs-empleo-y-trabajo/id372274154',
          android: 'https://play.google.com/store/apps/details?id=net.infojobs.mobile',
        },
      },
      {
        nombre: 'LinkedIn',
        descripcion: 'red profesional y networking',
        plataformas: {
          web: 'https://www.linkedin.com/',
          ios: 'https://apps.apple.com/es/app/linkedin-red-profesional/id288429040',
          android: 'https://play.google.com/store/apps/details?id=com.linkedin.android',
        },
      },
      {
        nombre: 'Emprego Galicia',
        descripcion: 'servicio público de empleo de la Xunta',
        plataformas: {
          web: 'https://empleo.xunta.gal/',
          ios: 'https://apps.apple.com/es/app/mobem/id1044432174',
          android: 'https://play.google.com/store/apps/details?id=gl.xunta.ceei.mobem',
        },
      },
    ],
  },
  {
    key: 'movilidad',
    label: 'Viajes y Transporte',
    apps: [
      {
        nombre: 'Renfe',
        descripcion: 'billetes de tren y asistencia de viaje',
        plataformas: {
          web: 'https://www.renfe.com/',
          ios: 'https://apps.apple.com/es/app/renfe/id1454512966',
          android: 'https://play.google.com/store/apps/details?id=com.renfe.asistencias',
        },
      },
      {
        nombre: 'BlaBlaCar',
        descripcion: 'viaje compartido en coche',
        plataformas: {
          web: 'https://www.blablacar.es/',
          ios: 'https://apps.apple.com/es/app/blablacar-viajes-compartidos/id343517547',
          android: 'https://play.google.com/store/apps/details?id=com.comuto',
        },
      },
      {
        nombre: 'Skyscanner',
        descripcion: 'comparar tarifas de vuelos',
        plataformas: {
          web: 'https://www.skyscanner.es/',
          ios: 'https://apps.apple.com/es/app/skyscanner-vuelos-hoteles/id415456883',
          android: 'https://play.google.com/store/apps/details?id=net.skyscanner.android.main',
        },
      },
    ],
  },
  {
    key: 'hogar',
    label: 'Clima y Hogar',
    apps: [
      {
        nombre: 'MeteoGalicia',
        descripcion: 'pronóstico oficial para Galicia',
        plataformas: {
          web: 'https://www.meteogalicia.gal/',
          ios: 'https://apps.apple.com/es/app/meteogalicia/id535036139',
          android: 'https://play.google.com/store/apps/details?id=gl.xunta.meteogalicia',
        },
      },
      // El diseño de referencia agrupa "Endesa / Naturgy" en una sola fila, pero son dos
      // apps distintas con links propios en la fuente — se separan para no dejar un botón
      // que diga "Naturgy" y abra la ficha de Endesa (o viceversa).
      {
        nombre: 'Endesa',
        descripcion: 'alta de luz del hogar',
        plataformas: {
          web: 'https://www.endesaclientes.com/',
          ios: 'https://apps.apple.com/es/app/endesa-clientes/id1126765796',
          android: 'https://play.google.com/store/apps/details?id=com.endesa.endesaclientes',
        },
      },
      {
        nombre: 'Naturgy',
        descripcion: 'alta de gas del hogar',
        plataformas: {
          web: 'https://www.naturgy.es/',
          ios: 'https://apps.apple.com/es/app/naturgy-clientes/id580053932',
          android: 'https://play.google.com/store/apps/details?id=es.gasnaturalfenosa.comercializacion.clientes',
        },
      },
      {
        nombre: 'Correos',
        descripcion: 'seguimiento de paquetes y correo',
        plataformas: {
          web: 'https://www.correos.es/',
          ios: 'https://apps.apple.com/es/app/correos/id490100788',
          android: 'https://play.google.com/store/apps/details?id=com.correos.infocor',
        },
      },
    ],
  },
]

import type { Metadata } from 'next'
import { buildOpenGraph } from './og'
import { SITE_URL } from '@/lib/config/site'

type PageMetadata = {
  title: string
  description: string
  keywords: string[]
  canonical: string
}

export const PAGE_METADATA: Record<string, PageMetadata> = {
  home: {
    title: 'Relocation en Galicia para familias latinoamericanas | Tu Lugar en Galicia',
    description:
      'Ayudamos a familias emigrantes a encontrar alquiler en Galicia, estés donde estés. Más de 200 familias reubicadas. Agenda tu videollamada gratuita hoy.',
    keywords: [
      'relocation galicia',
      'mudarse a galicia desde argentina',
      'alquiler emigrantes galicia',
      'relocation españa latinoamericanos',
      'personal shopper inmobiliario galicia',
    ],
    canonical: SITE_URL,
  },
  vigo: {
    title: 'Relocation Vigo para familias emigrantes | Tu Lugar en Galicia',
    description:
      'Buscamos tu piso en Vigo antes de que llegues. Servicio de relocation especializado para familias latinoamericanas. Conoce precios y cómo funciona.',
    keywords: [
      'relocation vigo',
      'alquiler emigrantes vigo',
      'piso vigo latinoamericanos',
      'mudarse a vigo',
      'buscar piso vigo antes de llegar',
    ],
    canonical: `${SITE_URL}/ciudades/vigo`,
  },
  aCoruna: {
    title: 'Relocation A Coruña para familias emigrantes | Tu Lugar en Galicia',
    description:
      'Encuentra piso en A Coruña sin estar en España. Servicio de relocation personalizado para familias latinoamericanas. Contáctanos sin compromiso.',
    keywords: [
      'relocation a coruña',
      'alquiler a coruña emigrantes',
      'mudarse a a coruña',
      'piso a coruña latinoamericanos',
      'buscar alquiler a coruña',
    ],
    canonical: `${SITE_URL}/ciudades/a-coruna`,
  },
  santiago: {
    title: 'Relocation Santiago de Compostela emigrantes | Tu Lugar en Galicia',
    description:
      'Servicio de relocation en Santiago de Compostela para familias que vienen de Latinoamérica. Alquiler gestionado antes de tu llegada. Hablemos.',
    keywords: [
      'relocation santiago de compostela',
      'alquiler santiago de compostela emigrantes',
      'mudarse a santiago galicia',
      'piso santiago compostela familias',
      'buscar piso santiago antes de llegar',
    ],
    canonical: `${SITE_URL}/ciudades/santiago-de-compostela`,
  },
  pontevedra: {
    title: 'Relocation Pontevedra para familias latinoamericanas | Tu Lugar en Galicia',
    description:
      'Gestionamos tu alquiler en Pontevedra desde donde estés. Relocation especializado para emigrantes. Más de 4 años ayudando familias a llegar a Galicia.',
    keywords: [
      'relocation pontevedra',
      'alquiler pontevedra emigrantes',
      'mudarse a pontevedra',
      'piso pontevedra latinoamericanos',
      'buscar alquiler pontevedra',
    ],
    canonical: `${SITE_URL}/ciudades/pontevedra`,
  },
  lugo: {
    title: 'Relocation Lugo para familias emigrantes | Tu Lugar en Galicia',
    description:
      'Alquiler en Lugo gestionado a distancia para familias latinoamericanas. Acompañamiento personal desde la búsqueda hasta la entrega de llaves.',
    keywords: [
      'relocation lugo',
      'alquiler lugo emigrantes',
      'mudarse a lugo galicia',
      'piso lugo latinoamericanos',
      'buscar alquiler lugo',
    ],
    canonical: `${SITE_URL}/ciudades/lugo`,
  },
  comoFunciona: {
    title: 'Cómo funciona el servicio de relocation en Galicia | Tu Lugar en Galicia',
    description:
      'Conoce los 6 pasos de nuestro servicio de relocation: desde el primer contacto hasta la entrega de llaves. Transparente, personal y sin sorpresas.',
    keywords: [
      'cómo funciona relocation galicia',
      'proceso alquiler emigrantes españa',
      'personal shopper inmobiliario galicia pasos',
      'servicio relocation familias',
      'buscar piso antes de llegar españa',
    ],
    canonical: `${SITE_URL}/como-funciona`,
  },
  sobreSilvana: {
    title: 'Quiénes somos — Silvana Lorenzo, fundadora de Tu Lugar en Galicia',
    description:
      'Silvana es gallega de corazón y emigrante de experiencia. Conoce su historia y por qué creó el primer servicio de relocation especializado en Galicia.',
    keywords: [
      'silvana lorenzo relocation galicia',
      'fundadora tu lugar en galicia',
      'historia relocation galicia',
      'emigrante gallega argentina',
      'quiénes somos tu lugar en galicia',
    ],
    canonical: `${SITE_URL}/sobre-silvana`,
  },
  faq: {
    title: 'Preguntas frecuentes sobre relocation en Galicia | Tu Lugar en Galicia',
    description:
      'Respondemos las dudas más comunes sobre alquiler en Galicia para emigrantes: documentación, garantías, tiempos y costos. Todo lo que necesitas saber.',
    keywords: [
      'preguntas frecuentes relocation galicia',
      'alquiler galicia emigrantes dudas',
      'documentación alquiler españa extranjeros',
      'garantías alquiler galicia',
      'faq mudarse a galicia',
    ],
    canonical: `${SITE_URL}/faq`,
  },
  conocernos: {
    title: 'Vamos a conocernos — Cuéntanos tu caso | Tu Lugar en Galicia',
    description:
      'Cuéntanos sobre tu familia y tu situación. Evaluamos si podemos ayudarte a conseguir alquiler en Galicia. Respuesta en 48 horas hábiles. Sin compromiso.',
    keywords: [
      'consulta relocation galicia',
      'formulario alquiler emigrantes galicia',
      'consulta mudanza galicia',
      'viabilidad alquiler españa latinoamericanos',
      'contacto tu lugar en galicia',
    ],
    canonical: `${SITE_URL}/conocernos`,
  },
  agenda: {
    title: 'Agenda tu videollamada gratuita sobre relocation en Galicia | Tu Lugar en Galicia',
    description:
      'Reserva una videollamada gratuita con nuestro equipo. Cuéntanos tu caso y evaluamos juntos si podemos ayudarte a encontrar alquiler en Galicia.',
    keywords: [
      'agendar videollamada relocation galicia',
      'consulta gratuita alquiler galicia',
      'cita relocation españa',
      'reservar llamada tu lugar en galicia',
      'videollamada mudanza galicia',
    ],
    canonical: `${SITE_URL}/agenda`,
  },
  politicaPrivacidad: {
    title: 'Política de Privacidad | Tu Lugar en Galicia',
    description:
      'Cómo tratamos tus datos personales. Responsable del tratamiento, finalidad, derechos ARCO y contacto.',
    keywords: ['política de privacidad', 'RGPD', 'protección de datos'],
    canonical: `${SITE_URL}/politica-de-privacidad`,
  },
  // ── Las 4 de marketing que hasta 2026-08-09 declaraban un Metadata suelto ──
  //
  // OJO CON LOS TÍTULOS: getNextMetadata() emite `title.absolute`, que NO pasa por el
  // template '%s | Tu Lugar en Galicia' de app/layout.tsx. Los de abajo son los títulos
  // COMPLETOS tal como ya se renderizaban, no los cortos que había en cada página. Escribir
  // solo la parte corta acá habría cambiado en silencio el título de 4 páginas publicadas.
  ciudadesIndice: {
    title: 'Ciudades de Galicia | Tu Lugar en Galicia',
    description:
      'Vigo, A Coruña, Santiago de Compostela, Pontevedra y Lugo. Descubre la ciudad de Galicia que mejor se adapta a tu vida.',
    keywords: [
      'ciudades de galicia',
      'dónde vivir en galicia',
      'comparar ciudades galicia',
      'mudarse a galicia',
      'mejores ciudades galicia familias',
    ],
    canonical: `${SITE_URL}/ciudades`,
  },
  contacto: {
    title: 'Contáctanos | Tu Lugar en Galicia',
    description: 'Escríbenos directamente. Te respondemos en 24 horas hábiles.',
    keywords: [
      'contacto tu lugar en galicia',
      'contactar relocation galicia',
      'escribir a tu lugar en galicia',
      'consulta alquiler galicia',
    ],
    canonical: `${SITE_URL}/contacto`,
  },
  comunidad: {
    title: 'Formando comunidad | Tu Lugar en Galicia',
    description:
      'Únete a la comunidad de Galicia: ofrece un café, una caminata o simplemente escuchar a quien acaba de llegar.',
    keywords: [
      'comunidad emigrantes galicia',
      'conocer gente en galicia',
      'red de apoyo emigrantes españa',
      'acogida familias galicia',
      'voluntariado acogida galicia',
    ],
    canonical: `${SITE_URL}/comunidad`,
  },
  // El título dice "Encuentra a tu gente en Galicia" y no "Formando comunidad" por decisión
  // de la auditoría 2026-07-25 (I8): dos URLs con el mismo título confunden en resultados de
  // búsqueda, y este coincide con el H1 real de la página. No unificarlo con el de arriba.
  comunidadMapa: {
    title: 'Encuentra a tu gente en Galicia | Tu Lugar en Galicia',
    description:
      'Encuentra a otras familias y vecinos en Galicia dispuestos a tomar un café, salir a caminar o simplemente escucharte. Mira quién está cerca de ti.',
    keywords: [
      'mapa comunidad galicia',
      'familias emigrantes galicia',
      'vecinos que ayudan galicia',
      'encontrar gente cerca galicia',
      'comunidad latinoamericana galicia',
    ],
    canonical: `${SITE_URL}/comunidad/mapa`,
  },
  appsUtiles: {
    title: 'Apps útiles para vivir en Galicia | Tu Lugar en Galicia',
    description:
      'El kit digital para tu primera semana en Galicia, por ciudad: transporte local, Cl@ve, ÉSaúde, empleo y trámites del Estado. Apps con enlace directo de descarga.',
    keywords: [
      'apps para vivir en galicia',
      'apps recién llegados españa',
      'certificado digital españa',
      'ésaúde galicia',
      'clave pin españa',
      'passvigo',
      'apps emigrantes galicia',
      'kit digital vivir en galicia',
    ],
    canonical: `${SITE_URL}/apps-utiles`,
  },
}

export function getNextMetadata(page: keyof typeof PAGE_METADATA): Metadata {
  const meta = PAGE_METADATA[page]
  const og = buildOpenGraph(page)
  return {
    title: { absolute: meta.title },
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: meta.canonical,
    },
    openGraph: og,
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: og?.images as string[] | undefined,
    },
  }
}

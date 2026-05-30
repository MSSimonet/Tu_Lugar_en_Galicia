import type { Metadata } from 'next'
import { buildOpenGraph } from './og'

const SITE_URL = 'https://tulugarengalicia.com'

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
      'Ayudamos a familias emigrantes a encontrar alquiler en Galicia antes de llegar. Más de 200 familias reubicadas. Agendá tu videollamada gratuita hoy.',
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
      'Buscamos tu piso en Vigo antes de que llegues. Servicio de relocation especializado para familias latinoamericanas. Conocé precios y cómo funciona.',
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
      'Encontrá piso en A Coruña sin estar en España. Servicio de relocation personalizado para familias latinoamericanas. Consultanos sin compromiso.',
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
      'Conocé los 6 pasos de nuestro servicio de relocation: desde el primer contacto hasta la entrega de llaves. Transparente, personal y sin sorpresas.',
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
    title: 'Sobre Silvana Lorenzo — Fundadora de Tu Lugar en Galicia',
    description:
      'Silvana es gallega de corazón y emigrante de experiencia. Conocé su historia y por qué creó el primer servicio de relocation especializado en Galicia.',
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
      'Respondemos las dudas más comunes sobre alquiler en Galicia para emigrantes: documentación, garantías, tiempos y costos. Todo lo que necesitás saber.',
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
    title: 'Vamos a conocernos — Contanos tu caso | Tu Lugar en Galicia',
    description:
      'Contanos sobre tu familia y tu situación. Evaluamos si podemos ayudarte a conseguir alquiler en Galicia. Respuesta en 48 horas hábiles. Sin compromiso.',
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
    title: 'Agendá tu videollamada gratuita sobre relocation en Galicia | Tu Lugar en Galicia',
    description:
      'Reservá una videollamada gratuita con Silvana. Contanos tu caso y evaluamos juntos si podemos ayudarte a encontrar alquiler en Galicia.',
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
}

export function getNextMetadata(page: keyof typeof PAGE_METADATA): Metadata {
  const meta = PAGE_METADATA[page]
  const og = buildOpenGraph(page)
  return {
    title: meta.title,
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

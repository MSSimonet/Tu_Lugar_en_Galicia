const SITE_URL = 'https://tulugarengalicia.com'

export function localBusinessSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#business`,
    name: 'Tu Lugar en Galicia',
    description:
      'Servicio de relocation especializado en Galicia para familias latinoamericanas. Gestionamos la búsqueda de alquiler antes de tu llegada a España.',
    url: SITE_URL,
    foundingDate: '2021',
    areaServed: [
      {
        '@type': 'AdministrativeArea',
        name: 'Galicia',
        containedInPlace: {
          '@type': 'Country',
          name: 'España',
        },
      },
      { '@type': 'City', name: 'Vigo' },
      { '@type': 'City', name: 'A Coruña' },
      { '@type': 'City', name: 'Santiago de Compostela' },
      { '@type': 'City', name: 'Pontevedra' },
      { '@type': 'City', name: 'Lugo' },
    ],
    serviceType: 'Relocation y búsqueda de alquiler para emigrantes',
    founder: {
      '@type': 'Person',
      name: 'Silvana Lorenzo',
      jobTitle: 'Fundadora y personal shopper inmobiliaria',
    },
    sameAs: [
      'https://www.instagram.com/tulugarengalicia',
      'https://www.facebook.com/tulugarengalicia',
    ],
  }
}

export function serviceSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Servicio de relocation en Galicia',
    description:
      'Acompañamiento integral para familias latinoamericanas que buscan alquiler en Galicia: diagnóstico de viabilidad, búsqueda activa de propiedades, negociación con propietarios y entrega de llaves antes de tu llegada.',
    url: `${SITE_URL}/como-funciona`,
    serviceType: 'Relocation inmobiliaria',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Galicia',
      containedInPlace: {
        '@type': 'Country',
        name: 'España',
      },
    },
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/#business`,
      name: 'Tu Lugar en Galicia',
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Familias emigrantes latinoamericanas',
    },
  }
}

export function faqSchema(faqs: { question: string; answer: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

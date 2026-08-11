import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/config/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      // Hub de ciudades: mismo nivel que sus cinco hijas, que ya estaban listadas.
      url: `${SITE_URL}/ciudades`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ciudades/vigo`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ciudades/a-coruna`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ciudades/santiago-de-compostela`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ciudades/pontevedra`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ciudades/lugo`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/como-funciona`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/sobre-silvana`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/conocernos`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      // Canal de contacto principal desde que se retiró WhatsApp (A08): mismo
      // nivel que las otras dos páginas de conversión, /conocernos y /agenda.
      url: `${SITE_URL}/contacto`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/agenda`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/apps-utiles`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/comunidad`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      // El mapa cambia cada vez que se registra una familia, no cuando se edita
      // la página — de ahí 'weekly' frente al 'monthly' de /comunidad.
      url: `${SITE_URL}/comunidad/mapa`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]
}

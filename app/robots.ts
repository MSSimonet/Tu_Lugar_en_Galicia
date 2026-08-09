import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/config/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // '/admin/' es defensa en profundidad, no la protección real: las páginas
      // ya salen con noindex desde app/admin/layout.tsx y el middleware exige
      // sesión en todas menos /admin/login. Ojo con el efecto conocido de
      // combinar ambas cosas — un crawler que respeta el disallow nunca llega a
      // leer el noindex del HTML, así que si alguna vez se enlaza una URL de
      // /admin/ desde fuera, Google podría indexar la URL pelada. Hoy no hay
      // ningún enlace público hacia /admin/, así que el disallow es la capa útil.
      disallow: ['/api/', '/_next/', '/admin/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

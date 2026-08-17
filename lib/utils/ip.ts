import type { NextRequest } from 'next/server'

/**
 * Extrae el IP real del cliente para usarlo como clave de rate limiting.
 *
 * EN VERCEL EL HEADER CONFIABLE ES X-FORWARDED-FOR, y esto es contraintuitivo:
 * la plataforma lo SOBRESCRIBE con el IP de quien conecta y no reenvía IPs externas,
 * justamente para impedir el spoofing (docs de Vercel, "Request headers": «Vercel
 * overwrites this header and does not forward external IPs to prevent IP spoofing»).
 * X-Real-Ip es idéntico y sirve de respaldo. El que NO hay que usar es
 * X-Vercel-Forwarded-For: la propia doc aclara que ese es el único que no se
 * sobrescribe cuando hay un proxy por encima, así que es el falsificable de los tres.
 *
 * POR QUE CAMBIO (hallazgo F2 de la auditoría 2026-08-17): antes esta función confiaba
 * en CF-Connecting-IP sin ninguna verificación de que el request hubiera pasado por
 * Cloudflare, y restringía X-Forwarded-For a no-producción por suponer lo contrario de
 * lo que Vercel documenta. Hoy no hay Cloudflare delante —el dominio propio todavía no
 * resuelve y producción se sirve desde *.vercel.app— así que CF-Connecting-IP era
 * entrada libre del cliente: bastaba mandar uno distinto en cada request para caer
 * siempre en una ventana de rate limit vacía. Y al revés, el tráfico honesto, que no
 * manda ese header, se agolpaba entero en la cubeta 'anonymous'. El control estaba
 * invertido: castigaba al usuario legítimo y no frenaba al atacante.
 *
 * ⚠️ AL PONER CLOUDFLARE DELANTE hay que volver sobre esto. Cuando eso pase,
 * X-Forwarded-For va a traer el IP del edge de Cloudflare y no el del visitante, con lo
 * cual todo el tráfico legítimo va a compartir un puñado de cubetas y se va a
 * autobloquear. Ahí corresponde volver a CF-Connecting-IP, pero SOLO después de cerrar
 * el acceso directo al origen *.vercel.app — si no, se vuelve exactamente al agujero
 * que este cambio cierra.
 *
 * En desarrollo local no hay proxy y ninguno de los dos headers llega: cae a
 * 'anonymous', que es lo correcto (una sola cubeta local, útil además para probar el
 * límite a mano).
 */
export function getRealIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0].trim()
    if (first) return first
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    const valor = realIp.trim()
    if (valor) return valor
  }

  return 'anonymous'
}

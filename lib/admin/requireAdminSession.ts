import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import type { Session } from 'next-auth'
import { auth } from '@/auth'

/**
 * Segundo control del gate de /admin, para las páginas que renderizan PII (hallazgo F1,
 * auditoría 2026-08-17).
 *
 * POR QUE EXISTE. La protección de /admin/* vivía solo en middleware.ts, como un
 * `pathname.startsWith('/admin/')`. Ese match corre contra el path SIN decodificar, así que
 * una URL percent-encoded (`/%61dmin/inbox`) lo esquiva: el gate no dispara y el request cae
 * en la página. Verificado en producción — el path plano da 307 al login, el codificado no.
 * Hoy no hay fuga porque Next crashea (500) al renderizar la ruta codificada, pero eso es un
 * accidente del framework, no un control: un bump de Next podría convertir ese 500 en un
 * 200-con-datos.
 *
 * POR QUE ACA Y NO REFORZANDO EL MIDDLEWARE. `auth()` lee la cookie de sesión, no la URL, así
 * que este control no depende de la forma del path: cierra `%61`, `%2f`, doble-encoding y
 * cualquier otra codificación POR IGUAL. Anclar en el string-match del middleware, en cambio,
 * obligaría a perseguir cada variante de encoding a mano.
 *
 * `server-only`: si alguien importa este módulo desde un componente cliente, el build falla en
 * vez de arrastrar la lógica de sesión al bundle del navegador.
 */

/**
 * Sesión de admin, deduplicada por request. next-auth v5 (beta) NO envuelve `auth()` en
 * React `cache`: su rama RSC hace `headers()` + `getSession()` en cada llamada (verificado en
 * node_modules/next-auth/lib/index.js). La `cache()` la agregamos acá, así si más de un punto
 * del mismo render pide la sesión, `auth()` corre una sola vez.
 */
const getAdminSession = cache(async (): Promise<Session | null> => auth())

/**
 * Exige una sesión de admin en un Server Component. Sin sesión, hace `redirect('/admin/login')`.
 *
 * OJO al usarla: `redirect()` corta el flujo lanzando `NEXT_REDIRECT`. No envolver la llamada
 * en un `try/catch` que se trague esa excepción, o el redirect no ocurriría y la página
 * seguiría renderizando sin sesión.
 */
export async function requireAdminSession(): Promise<Session> {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  return session
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { GestionarPerfil } from '@/components/comunidad/GestionarPerfil'
import { leerSesionGestion } from '@/lib/comunidad/gestion'
import { leerPerfilParaGestion } from '@/lib/comunidad/perfil'

export const metadata: Metadata = {
  title: 'Tu perfil del mapa',
  description: 'Gestiona la visibilidad de tu perfil en el mapa de Formando comunidad.',
  robots: { index: false, follow: false },
}

const textoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-dz-ui)',
  fontSize: 'var(--text-md)',
  color: 'var(--dz-ink)',
}

const helperStyle: React.CSSProperties = {
  fontFamily: 'var(--font-dz-ui)',
  fontSize: 'var(--text-sm)',
  color: 'var(--dz-muted)',
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[var(--space-4)]">
      <p style={textoStyle} role="alert">
        {children}
      </p>
      <p style={helperStyle}>
        <Link
          href="/comunidad/gestionar"
          className="underline underline-offset-2"
          style={{ color: 'var(--dz-accent-text)' }}
        >
          Pedir un enlace nuevo
        </Link>
      </p>
    </div>
  )
}

/**
 * La sesión se resuelve EN EL SERVIDOR y los datos bajan como props.
 *
 * Por qué así y no con un endpoint de lectura: evita una superficie más que devuelva datos de
 * perfil. Y por qué es seguro que sea un GET, a diferencia de /comunidad/confirmar: acá el GET
 * solo lee. Los escáneres de correo prefetchean enlaces, así que ninguna página alcanzable
 * desde un mail puede mutar nada por sí sola — las dos acciones de esta página son POST.
 */
export default async function SesionGestionPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; token?: string }>
}) {
  const { id, token } = await searchParams

  let contenido: React.ReactNode

  if (!id || !token) {
    contenido = <Aviso>Este enlace no es válido. Puede que se haya cortado al copiarlo.</Aviso>
  } else {
    const sesion = await leerSesionGestion(id, token)

    if (!sesion.ok) {
      contenido =
        sesion.motivo === 'expirado' ? (
          <Aviso>Este enlace caducó — vale una hora.</Aviso>
        ) : (
          <Aviso>Este enlace no es válido.</Aviso>
        )
    } else {
      const perfil = await leerPerfilParaGestion(sesion.email)
      // Sesión válida pero sin perfil: se dio de baja desde otra pestaña, o el enlace quedó
      // vivo un rato después de borrarse. No es un error que haya que explicar con alarma.
      contenido = perfil ? (
        <GestionarPerfil id={id} token={token} perfil={perfil} />
      ) : (
        <Aviso>Este perfil ya no está en el mapa.</Aviso>
      )
    }
  }

  return (
    <section
      style={{
        backgroundColor: 'var(--dz-papel)',
        paddingTop: 'var(--dz-section-y)',
        paddingBottom: 'var(--dz-section-y)',
        paddingLeft: 'var(--space-6)',
        paddingRight: 'var(--space-6)',
      }}
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-[var(--space-5)]">
          <Eyebrow>Formando comunidad</Eyebrow>
        </div>

        <h1
          className="mb-[var(--space-6)]"
          style={{
            fontFamily: 'var(--font-dz-display)',
            fontSize: 'var(--dz-text-h1)',
            fontWeight: 'var(--dz-weight-h1)',
            color: 'var(--dz-ink)',
            lineHeight: 'var(--dz-leading-h1)',
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          Tu perfil
        </h1>

        {contenido}
      </div>
    </section>
  )
}

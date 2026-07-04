import { getNextMetadata } from '@/lib/seo/metadata'
import { CalEmbed } from '@/components/shared/CalEmbed'
import { AgendaPublica } from '@/components/agenda/AgendaPublica'

import { validateCodigoAgenda } from '@/lib/admin/airtable'

export const metadata = getNextMetadata('agenda')

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AgendaPage({ searchParams }: PageProps) {
  const params = await searchParams
  const rawCode = typeof params.code === 'string' ? params.code : (params.code?.[0] ?? '')

  let isValid = false
  try {
    isValid = rawCode ? await validateCodigoAgenda(rawCode) : false
  } catch {
    // Airtable no disponible — fail closed (mostrar página pública)
    isValid = false
  }

  if (!isValid) {
    return <AgendaPublica />
  }

  // ── Código válido — mostrar calendario ───────────────────────────────────
  return (
    <>
      {/* Hero */}
      <section
        className="bg-[var(--color-granito)] pb-[var(--space-16)] px-[var(--space-6)]"
        style={{ paddingTop: 'calc(64px + 60px)' }}
        aria-labelledby="agenda-heading"
      >
        <div className="mx-auto max-w-3xl">
          <p
            className="mb-[var(--space-2)] font-[family-name:var(--font-ui)] [font-size:var(--text-xs)] uppercase tracking-[var(--tracking-ui)]"
            style={{ color: 'var(--color-laton-claro)' }}
          >
            Tu cita te espera
          </p>
          <h1
            id="agenda-heading"
            className="font-[family-name:var(--font-titular)] leading-[var(--leading-titulo)] [color:var(--color-niebla)]"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
          >
            Elige tu horario
          </h1>
          <p
            className="mt-[var(--space-4)] font-[family-name:var(--font-ui)] leading-[var(--leading-cuerpo)]"
            style={{ fontSize: 'var(--text-md)', color: 'var(--color-laton-claro)' }}
          >
            Gratuita, sin compromiso. Silvana te va a escuchar y decirte si puede ayudarte.
          </p>
        </div>
      </section>

      {/* Intro breve */}
      <section className="bg-[var(--color-niebla)] py-[var(--space-8)] px-[var(--space-6)]">
        <div className="mx-auto max-w-3xl">
          <p
            className="font-[family-name:var(--font-ui)] [font-size:var(--text-sm)] [color:var(--color-granito)] leading-[var(--leading-cuerpo)]"
          >
            En esta llamada escuchamos tu situación, respondemos tus dudas sobre el proceso
            en Galicia y evaluamos si el servicio es el indicado para ti. Sin presión,
            sin compromiso. Es simplemente una conversación para conocernos.
          </p>
        </div>
      </section>

      {/* CalEmbed */}
      <section className="bg-[var(--color-blanco)] py-[var(--space-16)] px-[var(--space-6)]">
        <div className="mx-auto max-w-4xl">
          <CalEmbed className="rounded-[var(--radius-card)]" />
          <p className="mt-[var(--space-6)] text-center font-[family-name:var(--font-ui)] [font-size:var(--text-xs)] [color:var(--color-pizarra)] leading-[var(--leading-cuerpo)]">
            Si el calendario no carga,{' '}
            <a
              href="/contacto"
              className="[color:var(--color-mar)] underline hover:no-underline"
            >
              escríbenos por el formulario de contacto
            </a>
            .
          </p>
        </div>
      </section>
    </>
  )
}

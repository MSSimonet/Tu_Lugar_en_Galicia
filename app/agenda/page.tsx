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
    <section
      className="bg-[var(--color-niebla)] px-[var(--space-6)] pb-[var(--space-16)] md:pb-[var(--space-24)]"
      style={{ paddingTop: 'calc(64px + 60px)' }}
      aria-labelledby="agenda-heading"
    >
      <div className="mx-auto max-w-[920px] flex flex-col items-center text-center gap-[var(--space-4)]">

        <span
          className="inline-flex items-center rounded-[var(--radius-pill)] border px-[var(--space-4)] py-[var(--space-1)] font-[family-name:var(--font-ui)] text-[var(--text-xs)] uppercase tracking-[var(--tracking-ui)]"
          style={{ color: 'var(--color-laton-text)', borderColor: 'var(--color-laton-text)' }}
        >
          Tu cita te espera
        </span>

        <h1
          id="agenda-heading"
          className="font-[family-name:var(--font-titular)] leading-[var(--leading-titulo)] [color:var(--color-granito)]"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
        >
          Elige tu horario
        </h1>

        <p
          className="font-[family-name:var(--font-ui)] leading-[var(--leading-cuerpo)] max-w-xl [color:var(--color-pizarra)]"
          style={{ fontSize: 'var(--text-md)' }}
        >
          Gratuita, sin compromiso. Silvana te va a escuchar y decirte si puede ayudarte.
        </p>

        <p
          className="font-[family-name:var(--font-ui)] leading-[var(--leading-cuerpo)] max-w-xl [color:var(--color-pizarra)]"
          style={{ fontSize: 'var(--text-sm)' }}
        >
          En esta llamada escuchamos tu situación, respondemos tus dudas sobre el proceso
          en Galicia y evaluamos si el servicio es el indicado para ti. Sin presión,
          sin compromiso. Es simplemente una conversación para conocernos.
        </p>

        {/* Marco alrededor del CalEmbed — el widget en sí no se toca */}
        <div className="w-full mt-[var(--space-4)] rounded-[var(--radius-card)] border border-[var(--color-arena)] bg-[var(--color-blanco)] shadow-md p-[var(--space-3)] md:p-[var(--space-4)]">
          <CalEmbed className="rounded-[var(--radius-card)]" />
        </div>

        <p className="font-[family-name:var(--font-ui)] text-[var(--text-xs)] [color:var(--color-pizarra)] leading-[var(--leading-cuerpo)]">
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
  )
}

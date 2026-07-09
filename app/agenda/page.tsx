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
      className="px-[var(--space-6)] pb-[var(--space-16)] md:pb-[var(--space-24)]"
      style={{ backgroundColor: 'var(--po-areia)', paddingTop: 'calc(64px + 60px)' }}
      aria-labelledby="agenda-heading"
    >
      <div className="mx-auto max-w-[920px] flex flex-col items-center text-center gap-[var(--space-4)]">

        <span
          className="inline-flex items-center rounded-full border px-[var(--space-4)] py-[var(--space-1)] [font-size:var(--text-xs)] uppercase tracking-[var(--tracking-ui)]"
          style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, color: 'var(--po-ouro-text)', borderColor: 'var(--po-ouro-text)' }}
        >
          Tu cita te espera
        </span>

        <h1
          id="agenda-heading"
          className="leading-[var(--leading-titulo)]"
          style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--po-pedra)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
        >
          Elige tu horario
        </h1>

        <p
          className="leading-[var(--leading-cuerpo)] max-w-xl"
          style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)', fontSize: 'var(--text-md)' }}
        >
          Gratuita, sin compromiso. Te vamos a escuchar y decirte si podemos ayudarte.
        </p>

        <p
          className="leading-[var(--leading-cuerpo)] max-w-xl"
          style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)', fontSize: 'var(--text-sm)' }}
        >
          En esta llamada escuchamos tu situación, respondemos tus dudas sobre el proceso
          en Galicia y evaluamos si el servicio es el indicado para ti. Sin presión,
          sin compromiso. Es simplemente una conversación para conocernos.
        </p>

        {/* Marco alrededor del CalEmbed — el widget en sí no se toca */}
        <div
          className="w-full mt-[var(--space-4)] shadow-md p-[var(--space-3)] md:p-[var(--space-4)]"
          style={{ borderRadius: '4px', border: '1px solid var(--po-borde)', backgroundColor: 'var(--po-luz)' }}
        >
          <CalEmbed className="rounded" />
        </div>

        <p
          className="[font-size:var(--text-xs)] leading-[var(--leading-cuerpo)]"
          style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)' }}
        >
          Si el calendario no carga,{' '}
          <a
            href="/contacto"
            className="underline hover:no-underline"
            style={{ color: 'var(--po-ouro-text)' }}
          >
            escríbenos por el formulario de contacto
          </a>
          .
        </p>
      </div>
    </section>
  )
}

import { getNextMetadata } from '@/lib/seo/metadata'
import { CalEmbed } from '@/components/shared/CalEmbed'
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '@/lib/config/site'

export const metadata = getNextMetadata('agenda')

const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

export default function AgendaPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[var(--color-granito)] py-[var(--space-16)] px-[var(--space-6)]">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-titular)] text-[var(--text-2xl)] leading-[var(--leading-titulo)] text-[var(--color-niebla)] md:text-[var(--text-3xl)]">
            Agenda tu videollamada
          </h1>
          <p className="mt-[var(--space-4)] font-[family-name:var(--font-ui)] text-[var(--text-md)] text-[var(--color-laton-claro)] leading-[var(--leading-cuerpo)]">
            Gratuita, sin compromiso. Silvana te va a escuchar y decirte si puede ayudarte.
          </p>
        </div>
      </section>

      {/* Intro breve */}
      <section className="bg-[var(--color-niebla)] py-[var(--space-8)] px-[var(--space-6)]">
        <div className="mx-auto max-w-3xl">
          <p className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-granito)] leading-[var(--leading-cuerpo)]">
            La videollamada dura aproximadamente 30 minutos. En esa charla, Silvana escucha tu
            situación, responde tus dudas sobre el proceso de búsqueda de vivienda en Galicia, y
            evalúa si el servicio es el indicado para tu caso. Sin presión, sin compromiso de
            contratación. Es simplemente una conversación para conocernos.
          </p>
        </div>
      </section>

      {/* CalEmbed */}
      <section className="bg-[var(--color-blanco)] py-[var(--space-16)] px-[var(--space-6)]">
        <div className="mx-auto max-w-4xl">
          <CalEmbed className="rounded-[var(--radius-card)]" />
          {/* Fallback textual */}
          <p className="mt-[var(--space-6)] text-center font-[family-name:var(--font-ui)] text-[var(--text-xs)] text-[var(--color-pizarra)] leading-[var(--leading-cuerpo)]">
            Si el calendario no carga, puedes escribirnos directamente por{' '}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-mar)] underline hover:no-underline"
            >
              WhatsApp
            </a>
            .
          </p>
        </div>
      </section>
    </>
  )
}

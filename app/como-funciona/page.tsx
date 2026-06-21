import Link from 'next/link'
import { getNextMetadata } from '@/lib/seo/metadata'
import { serviceSchema } from '@/lib/seo/schemas'
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '@/lib/config/site'
import ComoFuncionaStepper from './ComoFuncionaStepper'

export const metadata = getNextMetadata('comoFunciona')

const noSomos = [
  { titulo: 'No somos una inmobiliaria',  texto: 'Trabajamos para vos, no para el propietario.' },
  { titulo: 'No cobramos al propietario', texto: 'Sin conflicto de interés, sin carteras propias.' },
  { titulo: 'No garantizamos el contrato', texto: 'Garantizamos la búsqueda y el acompañamiento.' },
]

const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
const schema = serviceSchema()

function IconX() {
  return (
    <svg
      width={14} height={14} viewBox="0 0 24 24" fill="none"
      stroke="rgba(255,255,255,0.35)" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  )
}

export default function ComoFuncionaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* ── Stepper principal ── */}
      <ComoFuncionaStepper />

      {/* ── Lo que no somos ── */}
      <section style={{ background: '#EFEADE', paddingRight: '60px', paddingBottom: '64px', paddingLeft: '60px' }}>
        <div style={{ maxWidth: '1500px', margin: '0 auto' }}>
          <div style={{ background: '#1C1D1F', borderRadius: '12px', padding: '1.5rem 2rem' }}>
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1.5rem' }}>
              {noSomos.map((item) => (
                <div key={item.titulo} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ marginTop: '3px', flexShrink: 0 }}>
                    <IconX />
                  </span>
                  <div>
                    <p style={{
                      fontFamily: 'var(--font-ui)', fontSize: '0.86rem', fontWeight: 500,
                      color: 'rgba(255,255,255,0.8)', marginTop: 0, marginBottom: '3px',
                    }}>
                      {item.titulo}
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-ui)', fontSize: '0.81rem',
                      color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, marginTop: 0, marginBottom: 0,
                    }}>
                      {item.texto}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="bg-[var(--color-atlantico)] py-[var(--space-16)] px-[var(--space-6)]">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-[family-name:var(--font-titular)] text-[var(--text-xl)] text-white leading-[var(--leading-titulo)] mb-[var(--space-4)]">
            ¿Tiene sentido para tu familia?
          </h2>
          <p className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-white/80 leading-[var(--leading-cuerpo)] mb-[var(--space-8)]">
            Si leíste hasta acá y sientes que esto es lo que necesitas, el primer paso es conocernos.
            Es corto, gratuito y sin compromiso.
          </p>
          <div className="flex flex-col items-center gap-[var(--space-4)] sm:flex-row sm:justify-center">
            <Link
              href="/conocernos"
              className="inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-laton)] px-[var(--space-8)] py-[var(--space-4)] font-[family-name:var(--font-ui)] font-medium text-[var(--text-sm)] text-white tracking-[var(--tracking-ui)] uppercase hover:bg-[var(--color-laton-oscuro)] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Vamos a conocernos
            </Link>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-[var(--radius-pill)] border border-white px-[var(--space-8)] py-[var(--space-4)] font-[family-name:var(--font-ui)] font-medium text-[var(--text-sm)] text-white tracking-[var(--tracking-ui)] uppercase hover:bg-white/10 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

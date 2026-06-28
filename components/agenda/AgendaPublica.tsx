'use client'

import Link from 'next/link'

const pasos = [
  {
    n: '01',
    title: 'Cuéntale tu caso a Gina',
    desc: 'Gina te hace unas preguntas sobre tu situación. Tarda menos de 5 minutos y puedes hacerlo ahora mismo.',
  },
  {
    n: '02',
    title: 'Silvana revisa tu caso',
    desc: 'El equipo analiza tu perfil y, si el servicio encaja con lo que necesitas, te envía un código de acceso por email.',
  },
  {
    n: '03',
    title: 'Eliges tu horario',
    desc: 'Con el código en mano, vuelves a esta página y reservas la videollamada gratuita con Silvana.',
  },
]

export function AgendaPublica() {
  function openGina() {
    window.dispatchEvent(new Event('gina:open'))
  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="bg-[var(--color-granito)] pb-[var(--space-16)] px-[var(--space-6)]"
        style={{ paddingTop: 'calc(64px + 60px)' }}
        aria-labelledby="agenda-publica-heading"
      >
        <div className="mx-auto max-w-3xl">
          <p
            className="mb-[var(--space-4)] font-[family-name:var(--font-ui)] text-[var(--text-xs)] uppercase tracking-[var(--tracking-ui)]"
            style={{ color: 'var(--color-laton-claro)' }}
          >
            Antes de agendar
          </p>
          <h1
            id="agenda-publica-heading"
            className="font-[family-name:var(--font-titular)] leading-[var(--leading-titulo)]"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--color-niebla)' }}
          >
            Primero, cuéntanos tu historia
          </h1>
          <p
            className="mt-[var(--space-4)] font-[family-name:var(--font-ui)] leading-[var(--leading-cuerpo)] max-w-xl"
            style={{ fontSize: 'var(--text-md)', color: 'var(--color-laton-claro)' }}
          >
            La videollamada con Silvana es el inicio de todo — y para que valga de verdad, queremos conocerte antes.
          </p>
        </div>
      </section>

      {/* ── Contenido principal ───────────────────────────────────────── */}
      <section
        className="bg-[var(--color-niebla)] px-[var(--space-6)] py-[var(--space-16)] md:py-[var(--space-24)]"
        aria-label="Cómo agendar tu videollamada"
      >
        <div className="mx-auto max-w-2xl">

          {/* Párrafo introductorio */}
          <p
            className="font-[family-name:var(--font-ui)] leading-[var(--leading-cuerpo)] mb-[var(--space-12)]"
            style={{ fontSize: 'var(--text-md)', color: 'var(--color-granito)' }}
          >
            Cada familia que viene a Galicia llega con una situación propia: ciudad de destino, plazos,
            documentación, expectativas. Antes de reservar un espacio en el calendario de Silvana,
            Gina recoge esos datos para que esa charla sea aprovechada al máximo.
          </p>

          {/* Pasos */}
          <ol className="mb-[var(--space-14)] flex flex-col gap-[var(--space-8)]" aria-label="Pasos para agendar">
            {pasos.map((paso) => (
              <li key={paso.n} className="flex gap-[var(--space-5)] items-start">
                <span
                  aria-hidden="true"
                  className="font-[family-name:var(--font-titular)] shrink-0"
                  style={{
                    fontSize: 'var(--text-xl)',
                    color: 'var(--color-laton-text)',
                    lineHeight: 1,
                    fontStyle: 'italic',
                    minWidth: '2.5rem',
                  }}
                >
                  {paso.n}
                </span>
                <div>
                  <p
                    className="font-[family-name:var(--font-ui)] font-semibold mb-[var(--space-1)]"
                    style={{ fontSize: 'var(--text-sm)', color: 'var(--color-granito)' }}
                  >
                    {paso.title}
                  </p>
                  <p
                    className="font-[family-name:var(--font-ui)] leading-[var(--leading-cuerpo)]"
                    style={{ fontSize: 'var(--text-xs)', color: 'var(--color-pizarra)' }}
                  >
                    {paso.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* Divisor */}
          <div
            className="mb-[var(--space-10)] h-px"
            style={{ background: 'var(--color-arena)' }}
            aria-hidden="true"
          />

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-[var(--space-4)]">
            <button
              onClick={openGina}
              className="inline-flex items-center justify-center gap-[var(--space-2)] rounded-[var(--radius-pill)] px-[var(--space-8)] py-[var(--space-4)] font-[family-name:var(--font-ui)] text-[var(--text-sm)] font-medium uppercase tracking-[var(--tracking-ui)] text-white transition-brand hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ backgroundColor: 'var(--color-laton)', outlineColor: 'var(--color-laton)' }}
            >
              Cuéntale tu caso a Gina
            </button>
            <Link
              href="/conocernos"
              className="inline-flex items-center justify-center rounded-[var(--radius-pill)] border px-[var(--space-8)] py-[var(--space-4)] font-[family-name:var(--font-ui)] text-[var(--text-sm)] font-medium uppercase tracking-[var(--tracking-ui)] transition-brand hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                borderColor: 'var(--color-laton)',
                color: 'var(--color-granito)',
                outlineColor: 'var(--color-laton)',
              }}
            >
              Completar el formulario
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

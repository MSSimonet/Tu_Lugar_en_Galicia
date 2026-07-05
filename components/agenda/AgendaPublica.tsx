'use client'

import Image from 'next/image'

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
    <section
      className="bg-[var(--color-niebla)] px-[var(--space-6)] py-[var(--space-16)] md:py-[var(--space-24)]"
      aria-labelledby="agenda-publica-heading"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[1fr_1.15fr]">

        {/* Imagen editorial */}
        <div
          className="relative min-h-[280px] md:min-h-[560px] overflow-hidden rounded-tl-[var(--radius-card)] rounded-tr-[var(--radius-card)] md:rounded-tr-none md:rounded-bl-[var(--radius-card)] bg-[var(--color-arena)]"
          aria-hidden="true"
        >
          <Image
            src="/images/ciudades/tag_coruna3.jpg"
            alt="Vista de A Coruña, Galicia"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 45vw"
          />
        </div>

        {/* Contenido */}
        <div className="bg-[var(--color-blanco)] rounded-bl-[var(--radius-card)] rounded-br-[var(--radius-card)] md:rounded-bl-none md:rounded-tr-[var(--radius-card)] px-[var(--space-6)] py-[var(--space-12)] md:px-[var(--space-12)] md:py-[var(--space-16)] flex flex-col justify-center gap-[var(--space-6)]">

          <span
            className="inline-flex self-start items-center rounded-[var(--radius-pill)] border px-[var(--space-4)] py-[var(--space-1)] font-[family-name:var(--font-ui)] text-[var(--text-xs)] uppercase tracking-[var(--tracking-ui)]"
            style={{ color: 'var(--color-laton-text)', borderColor: 'var(--color-laton-text)' }}
          >
            Antes de agendar
          </span>

          <h1
            id="agenda-publica-heading"
            className="font-[family-name:var(--font-titular)] leading-[var(--leading-titulo)] [color:var(--color-granito)]"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
          >
            Primero, cuéntanos tu historia
          </h1>

          <p
            className="font-[family-name:var(--font-ui)] leading-[var(--leading-cuerpo)] max-w-xl [color:var(--color-pizarra)]"
            style={{ fontSize: 'var(--text-md)' }}
          >
            La videollamada con Silvana es el inicio de todo — y para que valga de verdad, queremos conocerte antes.
          </p>

          <p
            className="font-[family-name:var(--font-ui)] leading-[var(--leading-cuerpo)] max-w-xl [color:var(--color-pizarra)]"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            Cada familia que viene a Galicia llega con una situación propia: ciudad de destino, plazos,
            documentación, expectativas. Antes de reservar un espacio en el calendario de Silvana,
            Gina recoge esos datos para que esa charla sea aprovechada al máximo.
          </p>

          {/* Pasos — número + texto en línea */}
          <ol className="flex flex-col gap-[var(--space-4)] mt-[var(--space-2)]" aria-label="Pasos para agendar">
            {pasos.map((paso) => (
              <li key={paso.n} className="flex gap-[var(--space-4)] items-baseline">
                <span
                  aria-hidden="true"
                  className="font-[family-name:var(--font-titular)] shrink-0"
                  style={{ fontSize: 'var(--text-lg)', color: 'var(--color-laton-text)', lineHeight: 1, minWidth: '2.25rem' }}
                >
                  {paso.n}
                </span>
                <p
                  className="font-[family-name:var(--font-ui)] leading-[var(--leading-cuerpo)]"
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  <span className="font-semibold [color:var(--color-granito)]">{paso.title}</span>
                  {' — '}
                  <span style={{ color: 'var(--color-pizarra)' }}>{paso.desc}</span>
                </p>
              </li>
            ))}
          </ol>

          {/* CTA */}
          <button
            onClick={openGina}
            className="mt-[var(--space-2)] inline-flex w-fit items-center gap-[var(--space-2)] rounded-[var(--radius-pill)] px-[var(--space-8)] py-[var(--space-4)] font-[family-name:var(--font-ui)] text-[var(--text-sm)] font-bold uppercase tracking-[var(--tracking-ui)] text-white transition-brand hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ backgroundColor: 'var(--color-laton)', outlineColor: 'var(--color-laton)', boxShadow: '0 4px 14px rgba(143, 114, 43, 0.35)' }}
          >
            Cuéntale tu caso a Gina
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  )
}

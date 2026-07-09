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
    title: 'El equipo revisa tu caso',
    desc: 'El equipo analiza tu perfil y, si el servicio encaja con lo que necesitas, te envía un código de acceso por email.',
  },
  {
    n: '03',
    title: 'Eliges tu horario',
    desc: 'Con el código en mano, vuelves a esta página y reservas la videollamada gratuita con nuestro equipo.',
  },
]

export function AgendaPublica() {
  function openGina() {
    window.dispatchEvent(new Event('gina:open'))
  }

  return (
    <section
      className="px-[var(--space-6)] py-[var(--space-16)] md:py-[var(--space-24)]"
      style={{ backgroundColor: 'var(--po-areia)' }}
      aria-labelledby="agenda-publica-heading"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-[1fr_1.15fr]">

        {/* Imagen editorial */}
        <div
          className="relative min-h-[280px] md:min-h-[560px] overflow-hidden"
          style={{ borderRadius: '4px 4px 0 0', backgroundColor: 'var(--po-borde)' }}
          aria-hidden="true"
        >
          <Image
            src="/images/ciudades/tag_coruna3.jpg"
            alt="Vista de A Coruña, Galicia"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 45vw"
          />
        </div>

        {/* Contenido */}
        <div
          className="px-[var(--space-6)] py-[var(--space-12)] md:px-[var(--space-12)] md:py-[var(--space-16)] flex flex-col justify-center gap-[var(--space-6)]"
          style={{ backgroundColor: 'var(--po-luz)', borderRadius: '0 0 4px 4px' }}
        >

          <span
            className="inline-flex self-start items-center rounded-full border px-[var(--space-4)] py-[var(--space-1)] [font-size:var(--text-xs)] uppercase tracking-[var(--tracking-ui)]"
            style={{ fontFamily: 'var(--font-lato)', fontWeight: 700, color: 'var(--po-ouro-text)', borderColor: 'var(--po-ouro-text)' }}
          >
            Antes de agendar
          </span>

          <h1
            id="agenda-publica-heading"
            className="leading-[var(--leading-titulo)]"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--po-pedra)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
          >
            Primero, cuéntanos tu historia
          </h1>

          <p
            className="leading-[var(--leading-cuerpo)] max-w-xl"
            style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)', fontSize: 'var(--text-md)' }}
          >
            La videollamada con nuestro equipo es el inicio de todo — y para que valga de verdad, queremos conocerte antes.
          </p>

          <p
            className="leading-[var(--leading-cuerpo)] max-w-xl"
            style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)', fontSize: 'var(--text-sm)' }}
          >
            Cada familia que viene a Galicia llega con una situación propia: ciudad de destino, plazos,
            documentación, expectativas. Antes de reservar un espacio en nuestro calendario,
            Gina recoge esos datos para que esa charla sea aprovechada al máximo.
          </p>

          {/* Pasos — número + texto en línea */}
          <ol className="flex flex-col gap-[var(--space-4)] mt-[var(--space-2)]" aria-label="Pasos para agendar">
            {pasos.map((paso) => (
              <li key={paso.n} className="flex gap-[var(--space-4)] items-baseline">
                <span
                  aria-hidden="true"
                  className="shrink-0"
                  style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--po-ouro-text)', lineHeight: 1, minWidth: '2.25rem' }}
                >
                  {paso.n}
                </span>
                <p
                  className="leading-[var(--leading-cuerpo)]"
                  style={{ fontFamily: 'var(--font-lato)', fontSize: 'var(--text-xs)' }}
                >
                  <span className="font-semibold" style={{ color: 'var(--po-pedra)' }}>{paso.title}</span>
                  {' — '}
                  <span style={{ color: 'var(--po-muted)' }}>{paso.desc}</span>
                </p>
              </li>
            ))}
          </ol>

          {/* CTA */}
          <button
            onClick={openGina}
            className="mt-[var(--space-2)] inline-flex w-fit items-center gap-[var(--space-2)] px-[var(--space-8)] py-[var(--space-4)] [font-size:var(--text-sm)] font-bold uppercase tracking-[var(--tracking-ui)] transition-brand hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              fontFamily: 'var(--font-lato)',
              borderRadius: '4px',
              backgroundColor: 'var(--po-ouro)',
              color: '#1A1410',
              outlineColor: 'var(--po-ouro)',
              boxShadow: '0 4px 14px rgba(200, 155, 60, 0.35)',
            }}
          >
            Cuéntale tu caso a Gina
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  )
}

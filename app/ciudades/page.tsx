import type { Metadata } from 'next'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { CarruselCiudades } from '@/components/ciudades/CarruselCiudades'

export const metadata: Metadata = {
  title: 'Ciudades de Galicia',
  description:
    'Vigo, A Coruña, Santiago de Compostela, Pontevedra y Lugo. Descubre la ciudad de Galicia que mejor se adapta a tu vida.',
}

export default function CiudadesIndexPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="flex flex-col items-center justify-center text-center px-[var(--space-6)] py-[var(--space-16)] md:px-12"
        style={{ backgroundColor: 'var(--dz-luz)' }}
      >
        <Eyebrow tone="claro" className="mb-[var(--space-5)]">
          Relocation especializado · Galicia
        </Eyebrow>
        <h1
          className="font-normal mb-[var(--space-4)]"
          style={{
            fontFamily: 'var(--font-dz-display)',
            fontWeight: 900,
            fontSize: 'clamp(31px, 4.25vw, 54px)',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            color: 'var(--dz-ink)',
          }}
        >
          Elige tu ciudad
        </h1>
        <p
          className="leading-relaxed max-w-[480px] mx-auto"
          style={{ fontFamily: 'var(--font-dz-ui)', fontSize: '1rem', color: 'var(--dz-muted)' }}
        >
          Cada ciudad de Galicia tiene su carácter. Encuentra la que mejor se adapta a lo que buscas.
        </p>
      </section>

      <CarruselCiudades variant="listado" />
    </>
  )
}

import type { Metadata } from 'next'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { CarruselCiudades } from '@/components/ciudades/CarruselCiudades'
import { BrujulaDivider } from '@/components/ciudades/BrujulaDivider'

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
        className="flex flex-col items-center justify-center text-center px-[var(--space-6)] py-[var(--dz-section-y)] md:px-12"
        style={{ backgroundColor: 'var(--dz-luz)' }}
      >
        <Eyebrow tone="claro" className="mb-[var(--space-5)]">
          Relocation especializado · Galicia
        </Eyebrow>
        <h1
          className="font-normal mb-[var(--space-4)]"
          style={{
            fontFamily: 'var(--font-dz-display)',
            fontWeight: 'var(--dz-weight-h1)',
            fontSize: 'var(--dz-text-h1)',
            lineHeight: 'var(--dz-leading-h1)',
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

      <div style={{ background: 'linear-gradient(to bottom, var(--dz-luz), var(--dz-papel))' }}>
        <BrujulaDivider direction="rtl" />
      </div>

      <CarruselCiudades variant="listado" />
    </>
  )
}

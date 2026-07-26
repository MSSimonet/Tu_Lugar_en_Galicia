import type { Metadata } from 'next'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { CarruselCiudades } from '@/components/ciudades/CarruselCiudades'
import { BrujulaDivider } from '@/components/ciudades/BrujulaDivider'
import { CiudadesHeroTitulo } from '@/components/ciudades/CiudadesHeroTitulo'

export const metadata: Metadata = {
  title: 'Ciudades de Galicia',
  description:
    'Vigo, A Coruña, Santiago de Compostela, Pontevedra y Lugo. Descubre la ciudad de Galicia que mejor se adapta a tu vida.',
}

export default function CiudadesIndexPage() {
  return (
    <>
      {/* Hero — padding unificado con el resto de los Hero interiores vía
          --dz-hero-pad-y (auditoría 2026-07-25) */}
      <section
        className="flex flex-col items-center justify-center text-center px-[var(--space-6)] py-[var(--dz-hero-pad-y)]"
        style={{ backgroundColor: 'var(--dz-luz)', minHeight: 'var(--dz-hero-min-h)' }}
      >
        <Eyebrow tone="claro">
          Relocation especializado · Galicia
        </Eyebrow>
        <CiudadesHeroTitulo />
        <p
          className="leading-relaxed max-w-[480px] mx-auto"
          style={{ fontFamily: 'var(--font-dz-ui)', fontSize: '1rem', color: 'var(--dz-muted)' }}
        >
          Cada ciudad de Galicia tiene su carácter. Encuentra la que mejor se adapta a lo que buscas.
        </p>
      </section>

      {/* Color plano, no degradado: la base del Hero debe cortar nítida, igual
          que en el Hero de Inicio (pedido explícito). El resto de las uniones de
          la página conservan su degradado. */}
      <div style={{ backgroundColor: 'var(--dz-papel)' }}>
        <BrujulaDivider direction="rtl" />
      </div>

      <CarruselCiudades variant="listado" />
    </>
  )
}

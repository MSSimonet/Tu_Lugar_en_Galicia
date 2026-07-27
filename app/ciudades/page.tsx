import type { Metadata } from 'next'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PageHero } from '@/components/ui/PageHero'
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
      {/* Hero — único de los 5 con paleta clara (--dz-luz) y centrado: es la
          página índice y se lee distinto a propósito (decisión de marca,
          sesión 2026-07-26). Todo lo demás —caja, alto y ritmo vertical— sale
          del mismo PageHero que las otras cuatro. */}
      <PageHero
        tone="claro"
        align="center"
        eyebrow={<Eyebrow tone="claro">Relocation especializado · Galicia</Eyebrow>}
        title="Elige tu ciudad"
        subtitle="Cada ciudad de Galicia tiene su carácter. Encuentra la que mejor se adapta a lo que buscas."
      />

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

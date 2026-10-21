import { getNextMetadata } from '@/lib/seo/metadata'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PageHero } from '@/components/ui/PageHero'
import { CarruselCiudades } from '@/components/ciudades/CarruselCiudades'
import { BrujulaDivider } from '@/components/ciudades/BrujulaDivider'

export const metadata = getNextMetadata('ciudadesIndice')

export default function CiudadesIndexPage() {
  return (
    <>
      {/* Hero — único de los 5 con paleta clara (--dz-luz) y centrado: es la
          página índice y se lee distinto a propósito (decisión de marca,
          sesión 2026-07-26). Todo lo demás —caja, alto y ritmo vertical— sale
          del mismo PageHero que las otras cuatro. */}
      <PageHero
        compact
        tone="claro"
        align="center"
        eyebrow={<Eyebrow tone="claro">Relocation especializado · Galicia</Eyebrow>}
        title="Elige tu ciudad"
        subtitle="Cada ciudad de Galicia tiene su carácter. Encuentra la que mejor se adapta a lo que buscas."
      />

      {/* Cuerpo — fondo de página único; el divisor vuelve a ser un separador
          lineal entre el Hero y el listado. */}
      <div style={{ backgroundColor: 'var(--dz-fondo-pagina)' }}>
        <BrujulaDivider direction="rtl" />
        <CarruselCiudades variant="listado" />
      </div>
    </>
  )
}

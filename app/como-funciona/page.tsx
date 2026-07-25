import { getNextMetadata } from '@/lib/seo/metadata'
import { serviceSchema } from '@/lib/seo/schemas'
import ComoFuncionaStepper from './ComoFuncionaStepper'
import LoQueNoSomos from '@/components/sections/LoQueNoSomos'
import { MaletasDivider } from '@/components/ui/MaletasDivider'

export const metadata = getNextMetadata('comoFunciona')

const schema = serviceSchema()

export default function ComoFuncionaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* ── Stepper principal ── */}
      <ComoFuncionaStepper />

      {/* ── Divisor animado — maletas de derecha a izquierda ── */}
      <div style={{ background: "linear-gradient(to bottom, var(--dz-luz), var(--dz-papel))" }}>
        <MaletasDivider direction="rtl" />
      </div>

      {/* ── Lo que no somos ── */}
      <LoQueNoSomos />

      {/* ── Divisor ── */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(to right, transparent, var(--dz-accent), transparent)',
        margin: '0 64px',
      }} />
    </>
  )
}

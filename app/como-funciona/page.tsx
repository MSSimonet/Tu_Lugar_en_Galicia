import { getNextMetadata } from '@/lib/seo/metadata'
import { serviceSchema } from '@/lib/seo/schemas'
import ComoFuncionaStepper from './ComoFuncionaStepper'
import LoQueNoSomos from '@/components/sections/LoQueNoSomos'

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

      {/* ── Divisor ── */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(to right, transparent, var(--po-ouro), transparent)',
        margin: '0 64px',
      }} />

      {/* ── Lo que no somos ── */}
      <LoQueNoSomos />

      {/* ── Divisor ── */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(to right, transparent, var(--po-ouro), transparent)',
        margin: '0 64px',
      }} />
    </>
  )
}

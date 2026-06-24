import { getNextMetadata } from '@/lib/seo/metadata'
import { serviceSchema } from '@/lib/seo/schemas'
import ComoFuncionaStepper from './ComoFuncionaStepper'

export const metadata = getNextMetadata('comoFunciona')

const noSomos = [
  {
    num: '01',
    titulo: 'Una inmobiliaria',
    texto: 'Trabajamos para ti, no para el propietario. Sin carteras propias ni comisiones cruzadas.',
  },
  {
    num: '02',
    titulo: 'Pagados por el dueño',
    texto: 'Sin conflicto de interés. Tu búsqueda es nuestra única prioridad desde el primer mensaje.',
  },
  {
    num: '03',
    titulo: 'Un contrato garantizado',
    texto: 'Garantizamos la búsqueda activa, el filtro de calidad y el acompañamiento completo.',
  },
]

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
        background: 'linear-gradient(to right, transparent, #C4A45A, transparent)',
        margin: '0 64px',
      }} />

      {/* ── Lo que no somos ── */}
      <section
        id="lo-que-no-somos"
        style={{
          background: '#EDE7DA',
          color: '#1F3A2C',
          fontFamily: 'var(--font-mulish), sans-serif',
          padding: '32px 64px',
        }}
      >
        {/* Encabezado */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '20px',
          gap: '40px',
          flexWrap: 'wrap',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-cormorant), serif',
            fontWeight: 600,
            fontSize: '38px',
            lineHeight: 1,
            margin: 0,
            color: '#1F3A2C',
          }}>
            Lo que{' '}
            <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#C4633A' }}>no</em>
            {' '}somos
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '6px' }}>
            <span style={{ width: '7px', height: '7px', background: '#C4633A', borderRadius: '50%', flexShrink: 0 }} />
            <span style={{
              fontFamily: 'var(--font-mulish), sans-serif',
              fontSize: '11px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#C4633A',
            }}>
              Transparencia
            </span>
          </div>
        </div>

        {/* Grid 3 columnas separadas por líneas 1px */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: 'rgba(31,58,44,0.15)',
        }}>
          {noSomos.map((item, i) => {
            const paddingMap = ['18px 26px 18px 0', '18px 26px', '18px 0 18px 26px']
            return (
              <div key={item.num} style={{ background: '#EDE7DA', padding: paddingMap[i] }}>
                <div style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontSize: '15px',
                  color: '#C4633A',
                  marginBottom: '10px',
                }}>
                  No. {item.num}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontWeight: 600,
                  fontSize: '22px',
                  lineHeight: 1.15,
                  margin: '0 0 10px',
                  color: '#1F3A2C',
                }}>
                  {item.titulo}
                </h3>
                <p style={{
                  margin: 0,
                  fontFamily: 'var(--font-mulish), sans-serif',
                  fontSize: '14.5px',
                  lineHeight: 1.55,
                  color: '#4D5E52',
                }}>
                  {item.texto}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Divisor ── */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(to right, transparent, #C4A45A, transparent)',
        margin: '0 64px',
      }} />
    </>
  )
}

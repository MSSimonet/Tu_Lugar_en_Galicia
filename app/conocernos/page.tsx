import type { Metadata } from 'next'
import { getNextMetadata } from '@/lib/seo/metadata'
import { FormularioDiagnostico } from '@/components/conocernos'

export const metadata: Metadata = getNextMetadata('conocernos')

export default function ConocernosPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--po-luz)' }}>
      {/* Hero de la página */}
      <div style={{ backgroundColor: 'var(--po-areia)', borderBottom: '1px solid var(--po-borde)' }}>
        <div className="max-w-2xl mx-auto px-[var(--space-6)] pb-[var(--space-16)]" style={{ paddingTop: 'calc(64px + 60px)' }}>
          <h1
            className="[font-size:var(--text-2xl)] md:[font-size:var(--text-3xl)] leading-[var(--leading-titulo)] mb-[var(--space-6)]"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--po-pedra)' }}
          >
            Vamos a conocernos
          </h1>
          <p
            className="[font-size:var(--text-sm)] md:[font-size:var(--text-md)] leading-[var(--leading-cuerpo)] mb-[var(--space-4)]"
            style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)' }}
          >
            ¿Prefieres escribir antes de chatear? Este formulario recoge exactamente la misma información que Gina, nuestra asistente virtual. Cuéntanos sobre tu familia y tu situación para que nuestro equipo pueda entender tu caso y ver cómo puede acompañarte.
          </p>
          <p
            className="[font-size:var(--text-xs)] opacity-80"
            style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)' }}
          >
            Tus datos se usan solo para evaluar tu caso. No los compartimos con nadie.
          </p>
        </div>
      </div>

      {/* Formulario — lógica de Gina, no se toca su estilo interno */}
      <div className="max-w-2xl mx-auto px-[var(--space-6)] py-[var(--space-16)]">
        <FormularioDiagnostico />
      </div>
    </div>
  )
}

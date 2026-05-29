import type { Metadata } from 'next'
import { getNextMetadata } from '@/lib/seo/metadata'
import { FormularioDiagnostico } from '@/components/conocernos'

export const metadata: Metadata = getNextMetadata('conocernos')

export default function ConocernosPage() {
  return (
    <div className="min-h-screen bg-[var(--color-blanco)]">
      {/* Hero de la página */}
      <div className="bg-[var(--color-niebla)] border-b border-[var(--color-arena)]">
        <div className="max-w-2xl mx-auto px-[var(--space-6)] py-[var(--space-16)]">
          <h1 className="font-[family-name:var(--font-titular)] text-[var(--text-2xl)] md:text-[var(--text-3xl)] text-[var(--color-granito)] font-semibold leading-[var(--leading-titulo)] mb-[var(--space-6)]">
            Vamos a conocernos
          </h1>
          <p className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] md:text-[var(--text-md)] text-[var(--color-pizarra)] leading-[var(--leading-cuerpo)] mb-[var(--space-4)]">
            Contanos sobre tu familia y tu situación para que Silvana pueda entender tu caso y ver cómo puede acompañarlos. No es un formulario de contacto genérico: cada campo importa para armar tu historia.
          </p>
          <p className="font-[family-name:var(--font-ui)] text-[var(--text-xs)] text-[var(--color-pizarra)] opacity-80">
            Tus datos se usan solo para evaluar tu caso. No los compartimos con nadie.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-2xl mx-auto px-[var(--space-6)] py-[var(--space-16)]">
        <FormularioDiagnostico />
      </div>
    </div>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { FAQAccordion } from '@/components/ciudades/FAQAccordion'
import { faqSchema } from '@/lib/seo/schemas'
import { WHATSAPP_NUMBER } from '@/lib/config/site'

export interface CiudadLayoutProps {
  nombre: string
  subtitulo: string
  descripcion: string[]
  precios: { tipo: string; rango: string }[]
  faqs: { question: string; answer: string }[]
  imagenSrc?: string
  imagenAlt?: string
}

export function CiudadLayout({
  nombre,
  subtitulo,
  descripcion,
  precios,
  faqs,
  imagenSrc,
  imagenAlt,
}: CiudadLayoutProps) {
  const heroImage =
    imagenSrc ??
    `https://placehold.co/1200x400/${encodeURIComponent('1A5247')}/${encodeURIComponent('F2F0EB')}?text=${encodeURIComponent(nombre)}`

  const altText = imagenAlt ?? `Vista de ${nombre}, Galicia`

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola, me interesa saber más sobre alquilar en ${nombre}`
  )}`

  const schema = faqSchema(faqs)

  return (
    <>
      {/* JSON-LD FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* ── 1. HERO ── */}
      <section className="relative bg-[var(--color-granito)] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={altText}
            fill
            priority
            className="object-cover opacity-30"
            sizes="100vw"
          />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-[var(--space-6)] py-[var(--space-24)] text-center">
          <h1
            className="
              font-[family-name:var(--font-titular)]
              text-[var(--color-laton-claro)]
              text-[var(--text-2xl)] md:text-[var(--text-3xl)]
              leading-[var(--leading-titulo)]
              mb-[var(--space-4)]
            "
          >
            {nombre}
          </h1>
          <p
            className="
              font-[family-name:var(--font-ui)]
              text-[var(--color-niebla)]
              text-[var(--text-md)] md:text-[var(--text-lg)]
              leading-[var(--leading-cuerpo)]
              max-w-2xl mx-auto
            "
          >
            {subtitulo}
          </p>
        </div>
      </section>

      {/* ── 2. INTRODUCCIÓN ── */}
      <section className="bg-[var(--color-blanco)] py-[var(--space-16)] px-[var(--space-6)]">
        <div className="max-w-3xl mx-auto space-y-[var(--space-6)]">
          {descripcion.map((parrafo, i) => (
            <p
              key={i}
              className="
                font-[family-name:var(--font-ui)]
                text-[var(--color-granito)]
                text-[var(--text-sm)]
                leading-[var(--leading-cuerpo)]
              "
            >
              {parrafo}
            </p>
          ))}
        </div>
      </section>

      {/* ── 3. PRECIOS ORIENTATIVOS ── */}
      <section className="bg-[var(--color-niebla)] py-[var(--space-16)] px-[var(--space-6)]">
        <div className="max-w-3xl mx-auto">
          <h2
            className="
              font-[family-name:var(--font-titular)]
              text-[var(--color-laton)]
              text-[var(--text-xl)]
              leading-[var(--leading-titulo)]
              mb-[var(--space-8)]
            "
          >
            Precios orientativos de alquiler
          </h2>

          {/* Tabla — escritorio */}
          <div className="hidden sm:block overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-arena)]">
            <table className="w-full text-left font-[family-name:var(--font-ui)] text-[var(--text-sm)]">
              <thead>
                <tr className="bg-[var(--color-laton)] text-[var(--color-blanco)]">
                  <th className="px-[var(--space-6)] py-[var(--space-4)] font-medium tracking-[var(--tracking-ui)] uppercase text-[var(--text-xs)]">
                    Tipo de vivienda
                  </th>
                  <th className="px-[var(--space-6)] py-[var(--space-4)] font-medium tracking-[var(--tracking-ui)] uppercase text-[var(--text-xs)]">
                    Precio mensual orientativo
                  </th>
                </tr>
              </thead>
              <tbody>
                {precios.map((fila, i) => (
                  <tr
                    key={i}
                    className={
                      i % 2 === 0
                        ? 'bg-[var(--color-blanco)]'
                        : 'bg-[var(--color-niebla)]'
                    }
                  >
                    <td className="px-[var(--space-6)] py-[var(--space-4)] text-[var(--color-granito)]">
                      {fila.tipo}
                    </td>
                    <td className="px-[var(--space-6)] py-[var(--space-4)] text-[var(--color-pizarra)] font-medium">
                      {fila.rango}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards — móvil */}
          <div className="sm:hidden space-y-[var(--space-3)]">
            {precios.map((fila, i) => (
              <div
                key={i}
                className="bg-[var(--color-blanco)] rounded-[var(--radius-card)] border border-[var(--color-arena)] px-[var(--space-4)] py-[var(--space-3)]"
              >
                <p className="font-[family-name:var(--font-ui)] text-[var(--text-xs)] text-[var(--color-pizarra)] uppercase tracking-[var(--tracking-ui)] mb-[var(--space-1)]">
                  {fila.tipo}
                </p>
                <p className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] font-medium text-[var(--color-granito)]">
                  {fila.rango}
                </p>
              </div>
            ))}
          </div>

          {/* TODO: verificar precios reales con Silvana */}
          <p className="mt-[var(--space-4)] font-[family-name:var(--font-ui)] text-[var(--text-xs)] text-[var(--color-pizarra)] italic">
            Precios orientativos a mayo 2026. Pueden variar según barrio y estado del inmueble.
          </p>
        </div>
      </section>

      {/* ── 4. CTA AL DIAGNÓSTICO ── */}
      <section className="bg-[var(--color-atlantico)] py-[var(--space-16)] px-[var(--space-6)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="
              font-[family-name:var(--font-titular)]
              text-[var(--color-blanco)]
              text-[var(--text-xl)]
              leading-[var(--leading-titulo)]
              mb-[var(--space-4)]
            "
          >
            ¿{nombre} es tu destino?
          </h2>
          <p
            className="
              font-[family-name:var(--font-ui)]
              text-[var(--color-niebla)]
              text-[var(--text-sm)]
              leading-[var(--leading-cuerpo)]
              mb-[var(--space-8)]
              max-w-xl mx-auto
            "
          >
            Contanos tu situación y te ayudamos a encontrar el barrio y el piso
            que se adaptan a lo que necesitás. Sin costo, sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row gap-[var(--space-4)] justify-center">
            <Link href="/conocernos">
              <Button variant="primario" size="lg">
                Vamos a conocernos
              </Button>
            </Link>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <Button variant="fantasma" size="lg" className="border-[var(--color-blanco)] text-[var(--color-blanco)] hover:bg-[var(--color-blanco)] hover:text-[var(--color-atlantico)]">
                Escribinos por WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── 5. FAQ LOCAL ── */}
      <section className="bg-[var(--color-blanco)] py-[var(--space-16)] px-[var(--space-6)]">
        <div className="max-w-3xl mx-auto">
          <h2
            className="
              font-[family-name:var(--font-titular)]
              text-[var(--color-granito)]
              text-[var(--text-xl)]
              leading-[var(--leading-titulo)]
              mb-[var(--space-8)]
            "
          >
            Preguntas frecuentes sobre {nombre}
          </h2>
          <FAQAccordion faqs={faqs} />
        </div>
      </section>

      {/* ── 6. CTA FINAL ── */}
      <section className="bg-[var(--color-niebla)] py-[var(--space-16)] px-[var(--space-6)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="
              font-[family-name:var(--font-titular)]
              text-[var(--color-granito)]
              text-[var(--text-xl)]
              leading-[var(--leading-titulo)]
              mb-[var(--space-4)]
            "
          >
            ¿Listas para empezar?
          </h2>
          <p
            className="
              font-[family-name:var(--font-ui)]
              text-[var(--color-pizarra)]
              text-[var(--text-sm)]
              leading-[var(--leading-cuerpo)]
              mb-[var(--space-8)]
            "
          >
            El primer paso es conocernos. Tarda diez minutos y
            les damos una respuesta en 48 horas hábiles.
          </p>
          <Link href="/conocernos">
            <Button variant="primario" size="lg">
              Vamos a conocernos
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import { getNextMetadata } from '@/lib/seo/metadata'
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '@/lib/config/site'

export const metadata = getNextMetadata('sobreSilvana')

// TODO: reemplazar imagen placeholder con foto real de Silvana

const confianza = [
  {
    titulo: 'Cuatro años de experiencia real en el mercado de alquiler gallego.',
    texto:
      'No soy una consultora que aprendió de libros. Conozco el mercado desde adentro: los barrios que funcionan para familias, los propietarios que realmente alquilan a latinoamericanos, las condiciones que son negociables y las que no. Ese conocimiento práctico no se improvisa.',
  },
  {
    titulo: 'Entiendo el proceso migratorio desde adentro.',
    texto:
      'No hablo de teoría cuando explico qué documentación piden o cómo es el sistema de garantías en España. Lo viví. Sé lo que se siente tener el pasaporte con raíces gallegas y no saber si eso alcanza. Esa comprensión hace que mi ayuda sea diferente a la de alguien que nunca emigró.',
  },
  {
    titulo: 'Una red de contactos que lleva años construyéndose.',
    texto:
      'Propietarios particulares que confían en mí, agencias con las que tengo relación directa, gestores y abogados que conocen las necesidades específicas de familias inmigrantes. No busco en los mismos portales que abre cualquier persona desde Buenos Aires o Caracas.',
  },
  {
    titulo: 'Resultados concretos y verificables.',
    texto:
      '+200 familias reubicadas. 57 solo en 2025. Testimonios reales de personas que llegaron con las llaves en la mano. No trabajo con promesas — trabajo con resultados.',
  },
]

const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

export default function SobreSilvanaPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[var(--color-granito)] py-[var(--space-16)] px-[var(--space-6)]">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-[var(--space-8)] md:flex-row-reverse md:items-center md:gap-[var(--space-12)]">
            {/* Foto */}
            <div className="flex shrink-0 justify-center md:justify-end">
              <Image
                src="https://placehold.co/400x400/9A7A2E/FFFFFF?text=Silvana"
                alt="Silvana Lorenzo, fundadora de Tu Lugar en Galicia"
                width={200}
                height={200}
                className="rounded-full object-cover"
                priority
              />
            </div>
            {/* Título */}
            <div>
              <h1 className="font-[family-name:var(--font-titular)] text-[var(--text-2xl)] leading-[var(--leading-titulo)] text-[var(--color-niebla)] md:text-[var(--text-3xl)]">
                Hola, soy Silvana. Y yo también hice este camino.
              </h1>
              <p className="mt-[var(--space-4)] font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-laton-claro)] leading-[var(--leading-cuerpo)]">
                Fundadora de Tu Lugar en Galicia — emigrante argentina con raíces gallegas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Historia en primera persona */}
      <section className="bg-[var(--color-blanco)] py-[var(--space-16)] px-[var(--space-6)]">
        <div className="mx-auto max-w-3xl space-y-[var(--space-6)]">
          <p className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] leading-relaxed">
            Nací en Argentina y crecí sabiendo que en algún momento iba a cruzar el Atlántico. Mi
            familia tiene raíces gallegas — como tantas familias latinoamericanas — y Galicia siempre
            fue algo más que un lugar en el mapa. Era una historia que me habían contado desde chica,
            con nombres de pueblos, recetas y un idioma que sonaba familiar aunque yo no lo hablara.
            Cuando decidí venirme, sentí que no estaba yendo a un lugar desconocido: estaba volviendo
            a algo.
          </p>
          <p className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] leading-relaxed">
            Pero la realidad del proceso migratorio no se parece a esa historia romántica. Encontrar
            vivienda desde el otro lado del Atlántico es una de las partes más duras. Los propietarios
            no confían en alguien que no pueden ver, los portales de alquiler están llenos de opciones
            que no corresponden a lo que describen, y nadie te explica qué documentación necesitás,
            cómo funciona un contrato de arrendamiento en España o qué es eso de la fianza legal. Yo
            lo viví en carne propia. Tardé mucho más de lo que debería haber tardado, y llegué a
            Galicia con más incertidumbre de la necesaria.
          </p>
          <p className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] leading-relaxed">
            Cuando me instalé y empecé a conocer la realidad del mercado desde adentro, entendí que
            podía hacer algo concreto con eso. Empecé a ayudar a algunas familias del entorno —
            amigos de amigos, conocidos de conocidos — que estaban pasando por lo mismo que yo había
            pasado. Lo hacía porque podía, porque conocía el territorio y porque recordaba exactamente
            cómo se sentía esa incertidumbre. En algún momento dejó de ser un favor ocasional y se
            convirtió en un servicio real.
          </p>
          <p className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] leading-relaxed">
            Hoy llevo cuatro años haciendo esto de manera profesional. Más de doscientas familias
            encontraron su lugar en Galicia con nuestra ayuda. Conozco propietarios, conozco barrios,
            conozco los trucos del mercado y conozco los trámites. Pero lo más importante es que
            conozco lo que siente una familia cuando está a miles de kilómetros tratando de imaginar
            su vida nueva. Eso no lo enseña ningún curso — lo da haberlo vivido.
          </p>
          <p className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] leading-relaxed">
            Empecé este servicio porque quería que otras familias llegaran a Galicia mejor de lo que
            llegué yo. Eso sigue siendo lo que me mueve cada día.
          </p>
        </div>
      </section>

      {/* Por qué confiar en mí */}
      <section className="bg-[var(--color-niebla)] py-[var(--space-16)] px-[var(--space-6)]">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-[family-name:var(--font-titular)] text-[var(--text-xl)] text-[var(--color-granito)] leading-[var(--leading-titulo)] mb-[var(--space-8)]">
            Por qué confiar en mí
          </h2>
          <ul className="space-y-[var(--space-6)]" role="list">
            {confianza.map((item) => (
              <li key={item.titulo} className="flex gap-[var(--space-4)]">
                <span
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-[var(--color-laton)] font-bold text-[var(--text-md)]"
                >
                  ✓
                </span>
                <div>
                  <p className="font-[family-name:var(--font-ui)] font-semibold text-[var(--text-sm)] text-[var(--color-granito)]">
                    {item.titulo}
                  </p>
                  <p className="mt-[var(--space-1)] font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] leading-[var(--leading-cuerpo)]">
                    {item.texto}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Cierre + CTA */}
      <section className="bg-[var(--color-blanco)] py-[var(--space-16)] px-[var(--space-6)]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-[family-name:var(--font-ui)] text-[var(--text-md)] text-[var(--color-pizarra)] leading-[var(--leading-cuerpo)] mb-[var(--space-8)]">
            Si llegaste hasta acá, ya sabés quién soy y por qué hago esto. Ahora lo que me gustaría
            es conocerte a vos, escuchar tu historia y ver si puedo ayudarte.
          </p>
          <div className="flex flex-col items-center gap-[var(--space-4)] sm:flex-row sm:justify-center">
            <Link
              href="/conocernos"
              className="inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-laton)] px-[var(--space-8)] py-[var(--space-4)] font-[family-name:var(--font-ui)] font-medium text-[var(--text-sm)] text-white tracking-[var(--tracking-ui)] uppercase hover:bg-[var(--color-laton-oscuro)] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-laton)]"
            >
              Vamos a conocernos
            </Link>
            <Link
              href="/agenda"
              className="inline-flex items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-laton)] px-[var(--space-8)] py-[var(--space-4)] font-[family-name:var(--font-ui)] font-medium text-[var(--text-sm)] text-[var(--color-laton)] tracking-[var(--tracking-ui)] uppercase hover:bg-[var(--color-laton)] hover:text-white transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-laton)]"
            >
              Agendá una videollamada
            </Link>
          </div>
          <p className="mt-[var(--space-4)] font-[family-name:var(--font-ui)] text-[var(--text-xs)] text-[var(--color-pizarra)]">
            O si preferís escribirme directamente,{' '}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-mar)] underline hover:no-underline"
            >
              estoy en WhatsApp
            </a>
            . Respondo personalmente.
          </p>
        </div>
      </section>
    </>
  )
}

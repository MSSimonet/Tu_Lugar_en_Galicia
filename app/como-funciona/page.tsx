import Link from 'next/link'
import { getNextMetadata } from '@/lib/seo/metadata'
import { serviceSchema } from '@/lib/seo/schemas'
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '@/lib/config/site'

export const metadata = getNextMetadata('comoFunciona')

const pasos = [
  {
    numero: '01',
    nombre: 'Diagnóstico de viabilidad',
    tiempo: '48 horas hábiles',
    descripcion:
      'Completás el formulario de diagnóstico con tu situación real: dónde estás, cuándo pensás viajar, qué documentación tenés, cuántos son, qué presupuesto manejás. Silvana lee cada formulario personalmente y evalúa si puede ayudarte en este momento. No todos los casos son viables de entrada — y preferimos decirte la verdad desde el principio antes que prometerte algo que no podemos cumplir.',
  },
  {
    numero: '02',
    nombre: 'Videollamada de conocimiento mutuo',
    tiempo: '45-60 minutos',
    descripcion:
      'Nos conocemos en persona (virtual). Silvana te escucha, te hace las preguntas necesarias para entender bien qué buscás y qué necesitás, y te explica exactamente cómo funciona el proceso, qué vas a conseguir y cuánto cuesta el servicio. No hay letra chica. Esta llamada es el cimiento de todo lo que viene.',
  },
  {
    numero: '03',
    nombre: 'Búsqueda activa',
    tiempo: '1-3 semanas según disponibilidad del mercado',
    descripcion:
      'Silvana y su red de contactos en Galicia salen a buscar activamente: revisan portales, contactan propietarios directamente, consultan redes informales de alquiler que no aparecen en internet. Filtran por tus criterios concretos — ciudad, barrio, presupuesto, habitaciones, mascotas, fecha de entrada — y descartan las opciones que no cumplen sin gastar tu tiempo.',
  },
  {
    numero: '04',
    nombre: 'Presentación de opciones',
    tiempo: 'Inmediato al encontrar opciones que califican',
    descripcion:
      'Cuando hay opciones que realmente se ajustan a lo que buscás, te las presentamos con toda la información: fotos actualizadas, videos del piso y del edificio, información del barrio, características del propietario y condiciones del alquiler. Nada de fotos viejas ni información incompleta.',
  },
  {
    numero: '05',
    nombre: 'Negociación y cierre del contrato',
    tiempo: '3-7 días',
    descripcion:
      'Silvana negocia en tu nombre: precio, condiciones, garantías, fecha de entrada. Si estás en otro país, gestionamos las firmas de manera que todo sea legal y seguro sin que tengas que estar presente físicamente. Te explicamos cada cláusula del contrato en lenguaje claro — sin tecnicismos legales.',
  },
  {
    numero: '06',
    nombre: 'Acompañamiento post-llegada',
    tiempo: 'Primeras semanas en Galicia',
    descripcion:
      'Cuando llegás, el piso está listo. Pero el servicio no termina ahí. Estamos disponibles para orientarte en los primeros trámites: empadronamiento, apertura de cuenta bancaria, registro en el centro de salud. Queremos que tu llegada a Galicia sea una buena historia. Una que cuentes después.',
  },
]

const noSomos = [
  {
    titulo: 'No somos una inmobiliaria.',
    texto:
      'Las inmobiliarias trabajan para los propietarios. Nosotros trabajamos para vos. Nuestra lealtad es con la familia que busca vivienda, no con quien la pone en alquiler.',
  },
  {
    titulo: 'No cobramos al propietario.',
    texto:
      'El propietario no paga nada por nuestro servicio. Por eso podemos buscar en el mercado de particulares y en agencias sin conflicto de interés. No tenemos carteras de pisos propias ni acuerdos que nos obliguen a empujar ciertas opciones.',
  },
  {
    titulo: 'No garantizamos el contrato de arrendamiento.',
    texto:
      'Sí garantizamos la búsqueda, la presentación de opciones reales y el acompañamiento en el proceso. El contrato lo firmás vos con el propietario. Nuestra responsabilidad es que tengas toda la información, el apoyo y la negociación necesarios para llegar a ese contrato en las mejores condiciones.',
  },
]

const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
const schema = serviceSchema()

export default function ComoFuncionaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Hero */}
      <section className="bg-[var(--color-granito)] py-[var(--space-16)] px-[var(--space-6)]">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-titular)] text-[var(--text-2xl)] leading-[var(--leading-titulo)] text-[var(--color-niebla)] md:text-[var(--text-3xl)]">
            Cómo funciona Tu Lugar en Galicia: el proceso completo, paso a paso
          </h1>
          <p className="mt-[var(--space-4)] font-[family-name:var(--font-ui)] text-[var(--text-md)] text-[var(--color-laton-claro)] leading-[var(--leading-cuerpo)]">
            Transparente, personal y sin sorpresas. Así es el camino de principio a fin.
          </p>
        </div>
      </section>

      {/* Bajada introductoria */}
      <section className="bg-[var(--color-niebla)] py-[var(--space-12)] px-[var(--space-6)]">
        <div className="mx-auto max-w-3xl">
          <p className="font-[family-name:var(--font-ui)] text-[var(--text-md)] text-[var(--color-pizarra)] leading-[var(--leading-cuerpo)]">
            No somos una inmobiliaria. Somos el intermediario que le faltaba al proceso de mudarse a
            Galicia. Buscamos, negociamos y gestionamos por vos, para que cuando llegués, tu casa ya
            esté esperándote. Así es el camino.
          </p>
        </div>
      </section>

      {/* 6 pasos */}
      <section className="bg-[var(--color-blanco)] py-[var(--space-16)] px-[var(--space-6)]">
        <div className="mx-auto max-w-3xl">
          <ol className="relative space-y-[var(--space-12)]">
            {pasos.map((paso, i) => (
              <li key={paso.numero} className="relative pl-[var(--space-12)]">
                {/* Línea conectora */}
                {i < pasos.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[1.35rem] top-[3.5rem] bottom-[-2.5rem] w-px bg-[var(--color-laton)]"
                  />
                )}
                {/* Número */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 font-[family-name:var(--font-titular)] text-[var(--text-2xl)] leading-none text-[var(--color-laton)] font-bold select-none"
                >
                  {paso.numero}
                </span>
                <div className="pt-[var(--space-1)]">
                  <h2 className="font-[family-name:var(--font-titular)] text-[var(--text-lg)] text-[var(--color-granito)] leading-[var(--leading-titulo)]">
                    {paso.nombre}
                  </h2>
                  {/* Badge de tiempo */}
                  <span className="mt-[var(--space-2)] inline-block rounded-[var(--radius-pill)] bg-[var(--color-atlantico)] px-[var(--space-3)] py-[var(--space-1)] font-[family-name:var(--font-ui)] text-[var(--text-xs)] text-white tracking-[var(--tracking-ui)] uppercase">
                    {paso.tiempo}
                  </span>
                  <p className="mt-[var(--space-3)] font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] leading-[var(--leading-cuerpo)]">
                    {paso.descripcion}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Lo que NO somos */}
      <section className="bg-[var(--color-arena)] py-[var(--space-16)] px-[var(--space-6)]">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-[family-name:var(--font-titular)] text-[var(--text-xl)] text-[var(--color-granito)] leading-[var(--leading-titulo)] mb-[var(--space-8)]">
            Lo que NO somos
          </h2>
          <ul className="space-y-[var(--space-6)]" role="list">
            {noSomos.map((item) => (
              <li key={item.titulo} className="flex gap-[var(--space-4)]">
                <span
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-[var(--color-coral)] font-bold text-[var(--text-md)]"
                >
                  ✗
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

      {/* CTA final */}
      <section className="bg-[var(--color-atlantico)] py-[var(--space-16)] px-[var(--space-6)]">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-[family-name:var(--font-titular)] text-[var(--text-xl)] text-white leading-[var(--leading-titulo)] mb-[var(--space-4)]">
            ¿Tiene sentido para tu familia?
          </h2>
          <p className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-white/80 leading-[var(--leading-cuerpo)] mb-[var(--space-8)]">
            Si leíste hasta acá y sentís que esto es lo que necesitás, el primer paso es el
            formulario de diagnóstico. Es corto, gratuito y sin compromiso.
          </p>
          <div className="flex flex-col items-center gap-[var(--space-4)] sm:flex-row sm:justify-center">
            <Link
              href="/diagnostico"
              className="inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-laton)] px-[var(--space-8)] py-[var(--space-4)] font-[family-name:var(--font-ui)] font-medium text-[var(--text-sm)] text-white tracking-[var(--tracking-ui)] uppercase hover:bg-[var(--color-laton-oscuro)] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Empezar el diagnóstico
            </Link>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-[var(--radius-pill)] border border-white px-[var(--space-8)] py-[var(--space-4)] font-[family-name:var(--font-ui)] font-medium text-[var(--text-sm)] text-white tracking-[var(--tracking-ui)] uppercase hover:bg-white/10 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Escribinos por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

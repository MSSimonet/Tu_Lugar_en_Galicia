import Link from 'next/link'
import { getNextMetadata } from '@/lib/seo/metadata'
import { faqSchema } from '@/lib/seo/schemas'
import { FAQAccordion } from '@/components/ciudades/FAQAccordion'
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '@/lib/config/site'

export const metadata = getNextMetadata('faq')

const categorias = [
  {
    titulo: 'El servicio',
    faqs: [
      {
        question: '¿Qué es Tu Lugar en Galicia exactamente?',
        answer:
          'Somos un servicio de relocation especializado: buscamos vivienda de alquiler en Galicia por vos, antes de que viajes. No somos una inmobiliaria ni un portal de anuncios. Somos el intermediario que faltaba — alguien que conoce el mercado desde adentro, habla tu idioma (literalmente y culturalmente) y trabaja exclusivamente para la familia que quiere mudarse.',
      },
      {
        question: '¿Qué NO son ustedes?',
        answer:
          'No somos una inmobiliaria. No tenemos carteras de pisos propias ni cobramos comisión al propietario. No somos una gestoría ni hacemos trámites migratorios. No somos un portal de anuncios donde buscás solo. Somos un servicio personalizado de búsqueda y acompañamiento — trabajamos para vos.',
      },
      {
        question: '¿Cómo funciona el cobro? ¿Cuánto cuesta?',
        answer:
          'Cobramos honorarios por el servicio de búsqueda y acompañamiento, pagados por la familia que contrata el servicio. El propietario no paga nada. El monto específico depende del tipo de búsqueda y la ciudad — te lo explicamos en detalle en la videollamada inicial, sin sorpresas. El servicio no tiene costo de consulta: el formulario de diagnóstico y la primera videollamada son gratuitos.',
      },
      {
        question: '¿Qué garantías tienen de que van a encontrar algo?',
        answer:
          'No garantizamos un resultado específico en un tiempo determinado — el mercado de alquiler tiene sus propias variables. Lo que sí garantizamos es una búsqueda activa, real y personalizada, con presentación de opciones que realmente cumplen tus criterios. Si en algún momento la situación cambia y no podemos continuar, te lo decimos claramente. Nuestra reputación se basa en más de 200 familias reubicadas.',
      },
      {
        question: '¿Trabajan solo con familias o también con personas solas?',
        answer:
          'Trabajamos principalmente con familias y parejas. Si sos una persona sola con una situación clara y una búsqueda viable, también podemos ayudarte — evaluamos caso a caso en el formulario de diagnóstico.',
      },
    ],
  },
  {
    titulo: 'El proceso',
    faqs: [
      {
        question: '¿Cuánto tiempo lleva encontrar un piso?',
        answer:
          'Depende de la ciudad, la época del año y qué tan específicos sean tus requisitos. En promedio, entre el inicio de la búsqueda activa y la firma del contrato suelen pasar entre 2 y 6 semanas. Ciudades como Vigo y A Coruña tienen más competencia; Lugo y Pontevedra suelen resolverse más rápido. Te damos una estimación más concreta en la videollamada.',
      },
      {
        question: '¿Qué documentación necesito tener lista para buscar piso?',
        answer:
          'Como mínimo: pasaporte vigente, prueba de ingresos (contrato de trabajo, extracto bancario de los últimos 3 meses, o declaración de renta del país de origen), y si ya tenés NIE o TIE, mejor. Si tu documentación migratoria está en trámite, también podemos buscar — hay propietarios que aceptan esa situación con garantías adicionales. Te orientamos según tu caso específico.',
      },
      {
        question: '¿Pueden alquilar un piso antes de llegar a España?',
        answer:
          'Sí. Eso es exactamente lo que hacemos en la mayoría de los casos. El contrato de arrendamiento se puede firmar de forma telemática con firma electrónica o con poder notarial. La fianza y el primer mes se transfieren por banco. Cuando llegás, el piso está disponible. Es legal, es seguro y es lo que diferencia nuestro servicio.',
      },
      {
        question: '¿Con cuánta antelación tengo que contactarlos antes de viajar?',
        answer:
          'Cuanto antes, mejor. Idealmente con 2-3 meses de antelación respecto a tu fecha de llegada. Menos de 6 semanas hace que la búsqueda sea muy ajustada, aunque en algunos casos se puede resolver. Más de 4 meses puede ser demasiado temprano para que los propietarios comprometan el piso. El punto dulce es 8-10 semanas antes de la fecha de llegada.',
      },
      {
        question: '¿Qué pasa si el piso que elegimos no está disponible cuando llegamos?',
        answer:
          'Antes de la firma del contrato verificamos disponibilidad y condiciones. Una vez firmado, el piso está comprometido desde la fecha acordada. Si surge algún problema con el propietario (que es muy raro), lo gestionamos directamente. Por eso es importante tener todo bien documentado desde el inicio — nosotros nos encargamos de eso.',
      },
    ],
  },
  {
    titulo: 'Galicia',
    faqs: [
      {
        question: '¿Por qué Galicia y no Madrid, Barcelona u otras ciudades de España?',
        answer:
          'Madrid y Barcelona están saturadas de demanda, tienen alquileres muy altos y una competencia brutal para encontrar piso. Galicia ofrece calidad de vida excelente, alquileres razonables, seguridad, naturaleza y una comunidad latinoamericana ya establecida. Además, muchas familias tienen raíces gallegas — y eso hace que la adaptación sea diferente a la de cualquier otro lugar.',
      },
      {
        question: '¿Cómo es el clima en Galicia?',
        answer:
          'Galicia tiene clima oceánico: lluvias frecuentes (especialmente en otoño e invierno), veranos suaves y luminosos, inviernos frescos pero sin fríos extremos. No hay nieve en las ciudades costeras. No hay calores de 40 grados en verano. Es un clima de los que "dejan vivir", aunque la lluvia es real y hay que acostumbrarse. Vigo tiene más horas de sol que el resto de Galicia por su posición geográfica.',
      },
      {
        question: '¿Cuánto cuesta vivir en Galicia comparado con mi país?',
        answer:
          'Para familias que vienen de Argentina, Uruguay o Venezuela, Galicia es accesible una vez que conseguís ingresos en euros. Los alquileres van desde 400 € en Lugo hasta 1.500 € o más en zonas premium de A Coruña. La comida, el transporte y los servicios básicos son razonables para estándares europeos. Una familia de tres personas puede vivir bien con 2.000-2.500 € netos mensuales, dependiendo del estilo de vida y la ciudad.',
      },
      {
        question: '¿Hay comunidad latinoamericana en Galicia?',
        answer:
          'Sí, y bastante consolidada, especialmente en Vigo y A Coruña. Hay asociaciones culturales, comercios latinoamericanos, grupos de WhatsApp de apoyo mutuo y redes informales que facilitan mucho la llegada. No llegás a un lugar donde sos el único — llegás a una comunidad que ya tiene experiencia en hacer ese camino.',
      },
      {
        question: '¿Es Galicia segura?',
        answer:
          'Galicia es una de las regiones más seguras de España, que ya es uno de los países más seguros de Europa. Los índices de criminalidad son bajos en todas las ciudades que trabajamos. Para familias que vienen de contextos urbanos difíciles, el contraste en seguridad cotidiana es muy notable.',
      },
    ],
  },
  {
    titulo: 'Vivienda',
    faqs: [
      {
        question: '¿Cómo son los contratos de alquiler en España?',
        answer:
          'La Ley de Arrendamientos Urbanos (LAU) regula los alquileres en España. Los contratos de vivienda habitual tienen una duración mínima de 5 años (7 si el propietario es una empresa) con renovaciones anuales automáticas. La fianza legal es de 1 mes de alquiler, aunque muchos propietarios piden garantías adicionales. Te explicamos cada cláusula antes de firmar.',
      },
      {
        question: '¿Qué me van a pedir al alquilar siendo extranjero?',
        answer:
          'Típicamente: pasaporte o TIE/NIE, últimas nóminas o prueba de ingresos, extracto bancario, y en muchos casos una garantía adicional (adelanto de varios meses de alquiler, seguro de impago o aval bancario). Los requisitos varían por propietario. Nosotros preparamos tu dossier y te orientamos para que tu candidatura sea lo más sólida posible.',
      },
      {
        question: '¿Pueden tener mascotas en un piso de alquiler?',
        answer:
          'Depende del propietario. La ley no prohíbe las mascotas en alquiler, pero los propietarios pueden establecer restricciones en el contrato. Trabajamos buscando opciones que permitan mascotas si ese es tu caso — es un filtro que aplicamos desde el inicio de la búsqueda. Si tenés mascotas, indicalo en el formulario de diagnóstico con el detalle completo.',
      },
      {
        question: '¿Los pisos suelen venir amueblados?',
        answer:
          'En España es común alquilar tanto amueblado como sin amueblar. En las ciudades gallegas hay buena oferta de las dos opciones. Para familias que llegan desde otro país, los pisos amueblados son más cómodos inicialmente. Los sin amueblar suelen tener contratos más estables a largo plazo. Te asesoramos según tu situación y preferencia.',
      },
    ],
  },
  {
    titulo: 'Migración',
    faqs: [
      {
        question: '¿Necesito visado para vivir en Galicia / España?',
        answer:
          'Depende de tu nacionalidad. Los ciudadanos de la Unión Europea (incluidos los que tienen pasaporte de un país UE aunque vivan en América) pueden residir en España sin visado especial — solo necesitan registrarse. Los ciudadanos latinoamericanos sin pasaporte europeo necesitan un visado de residencia o de trabajo. El más común para familias es el visado por reagrupación familiar o el de residencia no lucrativa. Recomendamos siempre consultar con un gestor o abogado de extranjería.',
      },
      {
        question: '¿Qué es el NIE y para qué sirve?',
        answer:
          'El NIE (Número de Identificación de Extranjero) es el número fiscal que necesitás para casi cualquier trámite en España: abrir cuenta bancaria, firmar un contrato, trabajar, pagar impuestos. Se tramita en la policía o en el consulado español en tu país de origen. Es uno de los primeros trámites que hay que resolver. Nosotros te orientamos sobre el proceso, aunque el trámite en sí lo hacés vos.',
      },
      {
        question: '¿Puedo trabajar en España con el NIE?',
        answer:
          'El NIE por sí solo no habilita a trabajar. Para trabajar legalmente en España, necesitás autorización de residencia y trabajo (si sos de fuera de la UE) o simplemente el registro como ciudadano europeo (si tenés pasaporte de la UE). Las condiciones exactas dependen de tu situación migratoria. Te recomendamos consultar con un gestor de extranjería antes de viajar.',
      },
      {
        question: '¿Puedo llevar a mis hijos al colegio público en España?',
        answer:
          'Sí. En España todos los niños en edad escolar tienen derecho a educación pública independientemente de su situación migratoria. La matrícula se hace en el colegio correspondiente al domicilio. Tener la vivienda cerrada antes de llegar facilita enormemente la matriculación, porque necesitás el empadronamiento (registro en el domicilio) para acceder a la plaza escolar. Nosotros coordinamos los tiempos para que llegués con la vivienda lista y puedas empadronarte de inmediato.',
      },
    ],
  },
]

// Array plano de todas las preguntas para el schema JSON-LD
const allFaqs = categorias.flatMap((cat) => cat.faqs)
const schema = faqSchema(allFaqs)

const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

export default function FAQPage() {
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
            Preguntas frecuentes
          </h1>
          <p className="mt-[var(--space-4)] font-[family-name:var(--font-ui)] text-[var(--text-md)] text-[var(--color-laton-claro)] leading-[var(--leading-cuerpo)]">
            Respondemos las preguntas que más nos hacen
          </p>
        </div>
      </section>

      {/* Bajada */}
      <section className="bg-[var(--color-niebla)] py-[var(--space-8)] px-[var(--space-6)]">
        <div className="mx-auto max-w-3xl">
          <p className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] leading-[var(--leading-cuerpo)]">
            Reunimos las preguntas que nos hacen todas las familias antes de arrancar. Si la tuya no
            está acá, escribinos — respondemos hoy.
          </p>
        </div>
      </section>

      {/* Categorías */}
      <section className="bg-[var(--color-blanco)] py-[var(--space-16)] px-[var(--space-6)]">
        <div className="mx-auto max-w-3xl space-y-[var(--space-12)]">
          {categorias.map((cat) => (
            <div key={cat.titulo}>
              <h2 className="font-[family-name:var(--font-titular)] text-[var(--text-xl)] text-[var(--color-laton)] leading-[var(--leading-titulo)] mb-[var(--space-6)]">
                {cat.titulo}
              </h2>
              <FAQAccordion faqs={cat.faqs} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA al final */}
      <section className="bg-[var(--color-arena)] py-[var(--space-16)] px-[var(--space-6)]">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-[family-name:var(--font-titular)] text-[var(--text-xl)] text-[var(--color-granito)] leading-[var(--leading-titulo)] mb-[var(--space-4)]">
            ¿No encontraste tu respuesta?
          </h2>
          <p className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] leading-[var(--leading-cuerpo)] mb-[var(--space-8)]">
            Completá el formulario de diagnóstico o escribinos directamente por WhatsApp. Respondemos
            hoy.
          </p>
          <div className="flex flex-col items-center gap-[var(--space-4)] sm:flex-row sm:justify-center">
            <Link
              href="/diagnostico"
              className="inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-laton)] px-[var(--space-8)] py-[var(--space-4)] font-[family-name:var(--font-ui)] font-medium text-[var(--text-sm)] text-white tracking-[var(--tracking-ui)] uppercase hover:bg-[var(--color-laton-oscuro)] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-laton)]"
            >
              Empezar el diagnóstico
            </Link>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-laton)] px-[var(--space-8)] py-[var(--space-4)] font-[family-name:var(--font-ui)] font-medium text-[var(--text-sm)] text-[var(--color-laton)] tracking-[var(--tracking-ui)] uppercase hover:bg-[var(--color-laton)] hover:text-white transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-laton)]"
            >
              Escribinos por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

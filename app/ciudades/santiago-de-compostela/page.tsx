import { getNextMetadata } from '@/lib/seo/metadata'
import { CiudadLayout } from '@/components/ciudades'

export const metadata = getNextMetadata('santiago')

const descripcion = [
  'Santiago de Compostela tiene una ventaja que pocas ciudades del mundo pueden ofrecer: casi todo el mundo ya la conoce antes de llegar. Millones de peregrinos, turistas y visitantes pasaron por sus calles de piedra, por la Plaza del Obradoiro, por los bares del casco histórico. Eso significa que instalarse aquí tiene algo especial — llegas a una ciudad que ya existía en tu imaginación, y encuentras que la vida cotidiana es aún mejor que la postal.',
  'Es una ciudad universitaria de verdad. La Universidad de Santiago de Compostela, fundada en el siglo XV, le da a la ciudad una energía joven, intelectual y abierta que contrasta de manera muy linda con la antigüedad de la arquitectura. Hay mercados de productores, cafés con libros, festivales de música, exposiciones — una vida cultural activa para una ciudad de 100.000 habitantes.',
  'La escala es lo que más valoran las familias que eligen Santiago: más pequeña que Vigo o A Coruña, pero con todos los servicios necesarios. Puedes ir al trabajo, al colegio y al supermercado caminando. El casco histórico declarado Patrimonio de la Humanidad por la UNESCO está literalmente a la vuelta de la esquina. Y el Hospital Clínico Universitario es un referente médico en Galicia.',
  'El turismo internacional que pasa por Santiago también tiene un efecto positivo: los vecinos están acostumbrados a gente de todas partes del mundo. Nadie te va a mirar raro por tu acento. La adaptación social suele ser muy fluida.',
]

const precios = [
  { tipo: 'Estudio / 1 habitación', rango: '580 € – 780 €' },
  { tipo: '2 habitaciones', rango: '780 € – 1.050 €' },
  { tipo: '3 habitaciones', rango: '1.000 € – 1.350 €' },
  { tipo: '3+ hab. zona universitaria o histórica', rango: '1.200 € – 1.600 €' },
]

const faqs = [
  {
    question: '¿Santiago es una ciudad muy turística para vivir de manera estable?',
    answer:
      'El turismo es intenso en el casco histórico, especialmente en verano y durante los años santos. Pero la ciudad tiene barrios residenciales donde la vida cotidiana transcurre con tranquilidad total. Muchas familias viven en Santiago de toda la vida sin que el turismo afecte su día a día. La clave es elegir bien el barrio, y nosotros te ayudamos con eso.',
  },
  {
    question: '¿Qué posibilidades de trabajo hay en Santiago?',
    answer:
      'La administración pública gallega tiene sede en Santiago (es la capital autonómica), lo que genera empleo en servicios, salud, educación y sector público. La universidad también mueve mucho trabajo indirecto. El comercio, la hostelería y el turismo son sectores activos. Para trabajadores del conocimiento y remoto, la ciudad ofrece una calidad de vida excelente a un costo razonable.',
  },
  {
    question: '¿Cómo es el sistema educativo para niños en Santiago?',
    answer:
      'Muy sólido. Hay colegios públicos, concertados y privados de buena calidad. Algunos centros tienen programas bilingües español-inglés. La proximidad a la universidad genera un ambiente cultural estimulante para los chicos. Si tu hijo quiere estudiar en la USC en el futuro, ya crece en la misma ciudad.',
  },
  {
    question: '¿Llueve mucho en Santiago?',
    answer:
      'Santiago es, junto con Pontevedra, una de las ciudades más lluviosas de España. Eso es real y hay que asumirlo. Pero los santiagueses tienen una relación muy particular con la lluvia: no la ven como un problema sino como parte de la identidad. Un buen paraguas, buenas botas y la costumbre de los soportales (las galerías cubiertas del casco histórico) hacen que la lluvia no limite la vida. Con el tiempo, la lluvia te empieza a gustar.',
  },
]

export default function SantiagoDeCompostelaCiudadPage() {
  return (
    <CiudadLayout
      nombre="Santiago de Compostela"
      subtitulo="Una ciudad que el mundo ya conoce y que se convierte en tuya para siempre"
      descripcion={descripcion}
      precios={precios}
      faqs={faqs}
      imagenAlt="La Catedral de Santiago de Compostela y la Plaza del Obradoiro"
      slug="santiago-de-compostela"
    />
  )
}

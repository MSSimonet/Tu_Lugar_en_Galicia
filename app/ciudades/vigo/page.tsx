import { getNextMetadata } from '@/lib/seo/metadata'
import { CiudadLayout } from '@/components/ciudades'

export const metadata = getNextMetadata('vigo')

const descripcion = [
  'Vigo es la ciudad más grande de Galicia y la que más latinoamericanos elige como primer destino. No es casualidad: tiene una energía que mezcla lo urbano con lo atlántico de una manera difícil de encontrar en otra parte de España. Las rías, el puerto, el mercado de A Pedra con el marisco más fresco de Europa — y al mismo tiempo supermercados, hospitales, transporte y todo lo que una familia necesita para instalarse bien desde el primer día.',
  'La comunidad latinoamericana en Vigo es real y consolidada. Hay asociaciones, negocios, iglesias y redes informales que hacen que el proceso de adaptación sea mucho más llevadero. No llegas a un lugar donde eres el único — llegas a una ciudad donde muchos ya hicieron el mismo camino antes que tú.',
  'El clima es lo que más sorprende a quienes vienen de zonas cálidas: llueve, sí, pero Vigo tiene más horas de sol que otras ciudades gallegas gracias a su posición en la Ría. Los veranos son suaves y luminosos, los inviernos son frescos pero raramente fríos de verdad. Nada de nieve en la ciudad, nada de calores extremos. Un clima de los que te dejan vivir afuera.',
  'En términos de servicios, Vigo no te va a fallar: el Hospital Álvaro Cunqueiro es uno de los más modernos de España, hay colegios públicos y concertados de buena calidad, y la conexión en tren y autobús con el resto de Galicia y con Portugal es excelente. Si estás pensando en trabajar en remoto o montar algo propio, la ciudad tiene un ecosistema de coworking y emprendimiento que sigue creciendo.',
]

const precios = [
  { tipo: 'Estudio / 1 habitación', rango: '600 € – 800 €' },
  { tipo: '2 habitaciones', rango: '800 € – 1.100 €' },
  { tipo: '3 habitaciones', rango: '1.050 € – 1.400 €' },
  { tipo: '3+ hab. con garaje o zona premium', rango: '1.300 € – 1.700 €' },
]

const faqs = [
  {
    question: '¿Puedo alquilar un piso en Vigo antes de llegar a España?',
    answer:
      'Sí, y es exactamente lo que hacemos. Buscamos opciones, visitamos los pisos por vos, negociamos con el propietario y coordinamos la firma del contrato de manera que cuando llegues, la vivienda ya esté disponible. No es lo habitual en el mercado — pero con nuestra gestión es posible.',
  },
  {
    question: '¿Qué documentación me van a pedir para alquilar en Vigo?',
    answer:
      'La mayoría de los propietarios pide: pasaporte o documento de identidad, prueba de ingresos (contrato de trabajo, extracto bancario o declaración de renta del país de origen), y en muchos casos una garantía adicional como adelanto de meses de alquiler o seguro de impago. Nosotros te orientamos según tu situación específica antes de que empieces a buscar.',
  },
  {
    question: '¿Cuáles son los barrios más tranquilos para familias con niños en Vigo?',
    answer:
      'Coia, Navia y Cabral son los más elegidos por familias. Tienen colegios cercanos, parques, buena conectividad en autobús y un ambiente tranquilo. El centro está bien pero puede ser más ruidoso. Te asesoramos según la edad de tus hijos y tus prioridades.',
  },
  {
    question: '¿Hay mucha competencia para encontrar piso en Vigo?',
    answer:
      'El mercado de alquiler en Vigo es competitivo, especialmente para pisos de 2 y 3 habitaciones en buenas zonas. Actuar rápido y tener la documentación lista marca la diferencia. Por eso trabajar con nosotros desde antes de viajar te da una ventaja real — salimos a buscar activamente, no esperamos a que aparezca algo.',
  },
]

export default function VigoCiudadPage() {
  return (
    <CiudadLayout
      nombre="Vigo"
      subtitulo="La ciudad que te recibe con el mar en la puerta"
      descripcion={descripcion}
      precios={precios}
      faqs={faqs}
      imagenSrc="/images/ciudades/hero-vigo.jpg"
      imagenAlt="Vista panorámica de Vigo y la Ría desde el Monte Castro"
    />
  )
}

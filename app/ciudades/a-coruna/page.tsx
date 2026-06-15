import { getNextMetadata } from '@/lib/seo/metadata'
import { CiudadLayout } from '@/components/ciudades'

export const metadata = getNextMetadata('aCoruna')

const descripcion = [
  'A Coruña tiene algo que pocas ciudades en España pueden decir: una playa urbana en el centro mismo. El Paseo Marítimo más largo de Europa bordea la ciudad, y desde cualquier punto del centro puedes llegar caminando al mar en menos de veinte minutos. Para muchas familias latinoamericanas que vienen de ciudades costeras, eso no es un detalle — es una forma de vida.',
  'Es también la ciudad gallega más cosmopolita. Sede de grandes empresas (Inditex nació aquí), con una clase media consolidada, una oferta cultural activa y una vida nocturna y gastronómica que sorprende a quienes vienen esperando una ciudad pequeña. A Coruña tiene el tamaño justo: lo suficientemente grande para que no te falte nada, lo suficientemente manejable para que no te pierda.',
  'La Torre de Hércules, el faro romano más antiguo del mundo en funcionamiento, se convierte rápidamente en un símbolo que adoptás como propio. Hay algo en esa permanencia — dos mil años mirando el Atlántico — que le da a la ciudad una identidad única. Los coruñeses son conocidos por su carácter abierto y su sentido del humor. La adaptación suele ser natural.',
  'En términos prácticos: el Complejo Hospitalario Universitario de A Coruña (CHUAC) es uno de los hospitales de referencia del noroeste de España. Los colegios públicos tienen buena reputación. La conexión en AVE con Madrid y en autobús con Vigo y Santiago es fluida. Y el Aeropuerto de Alvedro, a pocos kilómetros, conecta con Madrid, Barcelona y varias ciudades europeas.',
]

const precios = [
  { tipo: 'Estudio / 1 habitación', rango: '650 € – 850 €' },
  { tipo: '2 habitaciones', rango: '850 € – 1.150 €' },
  { tipo: '3 habitaciones', rango: '1.100 € – 1.500 €' },
  { tipo: '3+ hab. con vistas al mar o zona premium', rango: '1.400 € – 1.900 €' },
]

const faqs = [
  {
    question: '¿Es A Coruña una ciudad cara para vivir?',
    answer:
      'Es algo más cara que Vigo en términos de alquiler, pero sigue siendo muy accesible comparada con Madrid, Barcelona o el País Vasco. Para una familia de tres personas, con un piso de dos habitaciones en una zona buena, el alquiler está entre 850 € y 1.150 €. El costo de vida en general (comida, transporte, ocio) es razonable.',
  },
  {
    question: '¿Hay trabajo para latinoamericanos en A Coruña?',
    answer:
      'El sector servicios, logística, industria y tecnología tienen demanda activa. Inditex y su cadena de empresas generan miles de puestos de trabajo directos e indirectos. También hay oportunidades en hostelería, comercio y salud. Trabajar en España requiere tener la documentación migratoria en orden — te orientamos sobre eso en la videollamada.',
  },
  {
    question: '¿Cómo es el sistema de transporte público en A Coruña?',
    answer:
      'La red de autobuses urbanos (Compañía de Tranvías) cubre bien toda la ciudad. No hay metro, pero los buses son frecuentes y puntuales. Para moverte por Galicia, el tren y los autobuses interurbanos conectan con Vigo, Santiago y Ferrol sin problemas.',
  },
  {
    question: '¿A Coruña es una buena ciudad para criar hijos?',
    answer:
      'Muy buena. Tiene una escala manejable, espacios verdes, playas accesibles, colegios de calidad y un ambiente tranquilo más allá del centro. La violencia urbana es prácticamente inexistente. Muchas familias latinoamericanas que llegaron pensando en quedarse un año terminan echando raíces.',
  },
]

export default function ACorunaCiudadPage() {
  return (
    <CiudadLayout
      nombre="A Coruña"
      subtitulo="La ciudad que tiene el mar en todas partes y una luz que no olvidás"
      descripcion={descripcion}
      precios={precios}
      faqs={faqs}
      imagenSrc="/images/ciudades/hero-coruna.jpg"
      imagenAlt="El Paseo Marítimo de A Coruña con la Torre de Hércules al fondo"
      slug="a-coruna"
    />
  )
}

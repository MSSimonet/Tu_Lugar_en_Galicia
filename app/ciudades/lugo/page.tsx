import { getNextMetadata } from '@/lib/seo/metadata'
import { CiudadLayout } from '@/components/ciudades'

export const metadata = getNextMetadata('lugo')

const descripcion = [
  'Lugo tiene algo que ninguna otra ciudad del mundo puede decir: está completamente rodeada por una muralla romana del siglo II declarada Patrimonio de la Humanidad. Puedes caminar los dos kilómetros y medio del adarve con vistas a la ciudad y a la campiña gallega. Es un paseo cotidiano que en otro lugar sería una atracción turística de primer nivel — aquí es simplemente donde los vecinos van a dar una vuelta.',
  'Para familias que necesitan encontrar un equilibrio entre calidad de vida y presupuesto disponible, Lugo es la respuesta en Galicia. Los alquileres son notablemente más bajos que en Vigo o A Coruña, los servicios son completos y el ritmo de vida es el más tranquilo de las cinco ciudades gallegas que trabajamos. No hay tráfico enloquecedor, no hay largas filas, no hay la presión de las grandes ciudades.',
  'Lugo es una ciudad de provincia con orgullo propio. Su gastronomía es extraordinaria: tiene más bares de pinchos per cápita que San Sebastián, y el tapeo es una institución social que facilita mucho la integración. Hay una vida social activa, ferias, mercados y eventos culturales durante todo el año.',
  'El Hospital Universitario Lucus Augusti (HULA) es uno de los hospitales más modernos de Galicia, inaugurado en 2011. Los colegios públicos tienen buena reputación. Y para las familias que trabajan en el sector primario, la agroindustria o la administración pública gallega, Lugo tiene oportunidades laborales concretas. Para trabajo remoto es una opción excelente: calidad de vida alta a un costo muy razonable.',
]

const precios = [
  { tipo: 'Estudio / 1 habitación', rango: '400 € – 580 €' },
  { tipo: '2 habitaciones', rango: '550 € – 750 €' },
  { tipo: '3 habitaciones', rango: '700 € – 950 €' },
  { tipo: '3+ hab. zona histórica o reformada', rango: '850 € – 1.150 €' },
]

const faqs = [
  {
    question: '¿Lugo está bien comunicada con el resto de Galicia?',
    answer:
      'Razonablemente bien. Hay autobús y tren a Vigo, A Coruña y Santiago. Las distancias son mayores que entre las ciudades del litoral, pero los tiempos son manejables. Para el día a día dentro de Lugo, la ciudad es completamente caminable. El aeropuerto más cercano es el de Santiago (1 hora en coche o bus).',
  },
  {
    question: '¿Por qué los alquileres son más bajos en Lugo?',
    answer:
      'Principalmente por la demografía: Lugo ha perdido población en las últimas décadas y hay más oferta relativa de vivienda. Eso es una ventaja real para las familias que llegan: puedes acceder a pisos más grandes y mejor ubicados con el mismo presupuesto que en Vigo o A Coruña. El mercado es menos competitivo y los propietarios suelen ser más flexibles.',
  },
  {
    question: '¿Hay comunidad latinoamericana en Lugo?',
    answer:
      'Más pequeña que en las otras ciudades, pero activa. Hay familias latinoamericanas bien integradas que llevan años en Lugo y que suelen recibir muy bien a los recién llegados. La ciudad es acogedora por naturaleza — el tamaño hace que la integración social sea rápida y genuina.',
  },
  {
    question: '¿Es Lugo adecuada para familias con niños en edad escolar?',
    answer:
      'Muy adecuada. Los colegios públicos lucenses tienen buena reputación, hay actividades extraescolares accesibles y la ciudad es segura y caminable. La oferta cultural para niños es más limitada que en las ciudades grandes, pero la calidad de vida cotidiana — espacios para jugar, tranquilidad, contacto con la naturaleza — es difícil de igualar.',
  },
]

export default function LugoCiudadPage() {
  return (
    <CiudadLayout
      nombre="Lugo"
      subtitulo="La ciudad de la muralla romana, los alquileres accesibles y la vida a tu ritmo"
      descripcion={descripcion}
      precios={precios}
      faqs={faqs}
      imagenAlt="La muralla romana de Lugo, Patrimonio de la Humanidad, al atardecer"
      slug="lugo"
    />
  )
}

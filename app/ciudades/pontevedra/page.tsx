import { getNextMetadata } from '@/lib/seo/metadata'
import { CiudadLayout } from '@/components/ciudades'

export const metadata = getNextMetadata('pontevedra')

const descripcion = [
  'Pontevedra es una ciudad que se hizo famosa en el mundo entero por una razón concreta: sacó los autos del centro y se los devolvió a las personas. Hoy su casco histórico es completamente peatonal, los niños juegan en la calle, los vecinos se conocen y la vida transcurre a una escala humana que muy pocas ciudades europeas pueden ofrecer. Ganó premios internacionales de urbanismo que la pusieron en el mapa, y quien la visita entiende inmediatamente por qué.',
  'Para familias con niños, Pontevedra es difícil de superar. No hay autos en el centro, hay parques por todas partes, las distancias son caminables y el ambiente es tranquilo sin ser aburrido. El Lérez, el río que abraza la ciudad, tiene un paseo fluvial precioso donde familias enteras salen a caminar, andar en bici o simplemente estar.',
  'La ciudad tiene todos los servicios necesarios — hospital, colegios de calidad, comercio, gastronomía excelente — con un tamaño que la hace manejable. Con unos 85.000 habitantes, Pontevedra tiene la ventaja de que en poco tiempo ya conoces tu barrio, tus vecinos, tu panadería, tu bar. Para muchas familias latinoamericanas que vienen de metrópolis enormes, eso es un alivio genuino.',
  'Y está a media hora de Vigo en tren, lo que significa que si necesitas aeropuerto, grandes superficies comerciales o trámites en organismos importantes, los tienes cerca. Lo mejor de los dos mundos: ciudad tranquila con acceso rápido a ciudad grande.',
]

const precios = [
  { tipo: 'Estudio / 1 habitación', rango: '550 € – 720 €' },
  { tipo: '2 habitaciones', rango: '720 € – 950 €' },
  { tipo: '3 habitaciones', rango: '900 € – 1.200 €' },
  { tipo: '3+ hab. zona premium o reformada', rango: '1.100 € – 1.450 €' },
]

const faqs = [
  {
    question: '¿Pontevedra tiene suficiente oferta laboral para instalarse?',
    answer:
      'Pontevedra tiene industria, servicios y comercio activos. La proximidad a Vigo (30 minutos en tren) amplía enormemente las posibilidades laborales: mucha gente vive en Pontevedra y trabaja en Vigo. Para trabajo remoto, Pontevedra es ideal: calidad de vida alta, alquileres más accesibles que las ciudades grandes y conexión de fibra óptica sin problemas.',
  },
  {
    question: '¿Qué tan segura es Pontevedra para criar hijos?',
    answer:
      'Es una de las ciudades más seguras de España. Los índices de criminalidad son muy bajos incluso para estándares europeos. Los niños salen solos a partir de cierta edad, hay parques y espacios de juego en todos los barrios, y la gente se conoce. Para familias que vienen de contextos urbanos complicados, el contraste es notable.',
  },
  {
    question: '¿Hay comunidad latinoamericana en Pontevedra?',
    answer:
      'Es más pequeña que en Vigo o A Coruña, pero existe y está bien integrada. Hay asociaciones culturales, comercios latinoamericanos y redes sociales activas. La ciudad es acogedora y los vecinos suelen facilitar la integración. El tamaño de la ciudad hace que las redes de apoyo sean más cercanas y personales.',
  },
  {
    question: '¿Cómo es la conexión de Pontevedra con el resto de Galicia?',
    answer:
      'Muy buena. Tren frecuente a Vigo (30 min) y a Santiago (45 min). Autobús a A Coruña y otras ciudades gallegas. El Aeropuerto de Vigo queda a 20 minutos en coche o en taxi. Para quienes no tienen coche, el tren de cercanías es suficiente para moverse bien por la zona.',
  },
]

export default function PontevedraCiudadPage() {
  return (
    <CiudadLayout
      nombre="Pontevedra"
      subtitulo="La ciudad que le devolvió las calles a las personas — y a la tuya le va a encantar"
      descripcion={descripcion}
      precios={precios}
      faqs={faqs}
      imagenAlt="El casco histórico peatonal de Pontevedra y el río Lérez"
      slug="pontevedra"
    />
  )
}

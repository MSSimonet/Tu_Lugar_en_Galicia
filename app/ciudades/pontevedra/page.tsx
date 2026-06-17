import { getNextMetadata } from '@/lib/seo/metadata'
import { CiudadLayout } from '@/components/ciudades'

export const metadata = getNextMetadata('pontevedra')

export default function PontevedraCiudadPage() {
  return (
    <CiudadLayout
      nombre="Pontevedra"
      slug="pontevedra"
      codigoAEMET="36038"
      vistaEnVivo={{ lat: 42.4336, lon: -8.6480, descripcionUbicacion: 'Casco histórico' }}
      videoSrc="/videos/Pontevedra.mp4"
      posterSrc="/images/ciudades/card_pontevedra.jpg"
      descripcionCorta="La ciudad más peatonal de España. Pequeña, cómoda y con una calidad de vida que sorprende a quien llega."
      descripcionLarga="Pontevedra es una ciudad que se disfruta caminando. Su centro histórico es casi completamente peatonal, lo que la convierte en una de las ciudades más vivibles de España para familias con niños. Tiene buenos colegios, hospital de referencia, y está a solo 30 minutos de Vigo por tren — lo que la hace una opción muy real para quienes trabajan allí."
      descripcionLarga2="El mercado de alquiler en Pontevedra es más tranquilo y accesible que en las ciudades grandes. La oferta es menor, pero los precios son más razonables y la competencia más manejable. Una buena alternativa para familias que priorizan calidad de vida sobre tamaño de ciudad."
      barrios={[
        { nombre: 'Zona Monumental (Casco Vello)', descripcion: 'Histórico, peatonal y lleno de encanto medieval. El corazón de la ciudad para los amantes del comercio local y la vida urbana sin coches.' },
        { nombre: 'Campolongo', descripcion: 'Céntrico, cómodo y excelentemente equipado con parques y complejos deportivos. La opción número uno para la vida familiar diaria.' },
        { nombre: 'A Moureira', descripcion: 'Tradición marinera renovada con un toque bohemio a orillas del río. Perfecto para quienes buscan un entorno tranquilo y con personalidad.' },
        { nombre: 'O Burgo / Zona Universitaria', descripcion: 'Económico, activo y en constante modernización. Muy atractivo para estudiantes, jóvenes profesionales y perfiles inversores.' },
      ]}
      alquileres={[
        { habitaciones: '1 habitación', rango: '480–650€' },
        { habitaciones: '2 habitaciones', rango: '620–850€' },
        { habitaciones: '3 habitaciones', rango: '750–1.050€' },
        { habitaciones: '4 habitaciones o más', rango: '900–1.250€' },
      ]}
      faqs={[
        {
          pregunta: '¿Pontevedra tiene suficiente oferta laboral para instalarse?',
          respuesta: 'Pontevedra tiene industria, servicios y comercio activos. La proximidad a Vigo (30 minutos en tren) amplía enormemente las posibilidades laborales: mucha gente vive en Pontevedra y trabaja en Vigo. Para trabajo remoto, Pontevedra es ideal.',
        },
        {
          pregunta: '¿Qué tan segura es Pontevedra para criar hijos?',
          respuesta: 'Es una de las ciudades más seguras de España. Los índices de criminalidad son muy bajos incluso para estándares europeos. Los niños salen solos a partir de cierta edad, hay parques y espacios de juego en todos los barrios, y la gente se conoce.',
        },
        {
          pregunta: '¿Hay comunidad latinoamericana en Pontevedra?',
          respuesta: 'Es más pequeña que en Vigo o A Coruña, pero existe y está bien integrada. Hay asociaciones culturales, comercios latinoamericanos y redes sociales activas. El tamaño de la ciudad hace que las redes de apoyo sean más cercanas y personales.',
        },
        {
          pregunta: '¿Cómo es la conexión de Pontevedra con el resto de Galicia?',
          respuesta: 'Muy buena. Tren frecuente a Vigo (30 min) y a Santiago (45 min). El Aeropuerto de Vigo queda a 20 minutos en coche. Para quienes no tienen coche, el tren de cercanías es suficiente para moverse bien por la zona.',
        },
      ]}
    />
  )
}

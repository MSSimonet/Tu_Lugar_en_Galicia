import { getNextMetadata } from '@/lib/seo/metadata'
import { CiudadLayout } from '@/components/ciudades'

export const metadata = getNextMetadata('santiago')

export default function SantiagoDeCompostelaCiudadPage() {
  return (
    <CiudadLayout
      nombre="Santiago de Compostela"
      slug="santiago-de-compostela"
      codigoAEMET="15078"
      vistaEnVivo={{ lat: 42.8782, lon: -8.5448, descripcionUbicacion: 'Praza do Obradoiro' }}
      videoSrc="/videos/Santiago.mp4"
      posterSrc="/images/ciudades/card_santiago.jpg"
      descripcionCorta="Ciudad universitaria, patrimonio mundial y capital de Galicia. Más tranquila que Vigo o A Coruña, con una calidad de vida difícil de igualar."
      descripcionLarga="Santiago es la capital de Galicia y una de las ciudades más bien conservadas de Europa. Tiene universidad pública grande, excelentes centros de salud, buena red de transporte y una vida cultural activa todo el año. Para familias que no necesitan la intensidad de una ciudad grande, Santiago ofrece algo difícil de encontrar: escala humana con infraestructura completa."
      descripcionLarga2="El mercado de alquiler en Santiago es más pequeño que en Vigo o A Coruña — lo que significa menos oferta, pero también menos competencia. Los pisos cerca del centro histórico son muy cotizados; los barrios residenciales exteriores ofrecen más espacio por el mismo precio."
      barrios={[
        { nombre: 'Ensanche (Zona Nueva)', descripcion: 'Céntrico, comercial y con muchísima vida estudiantil y cultural. La zona más dinámica y mejor comunicada para el día a día.' },
        { nombre: 'Casco Histórico', descripcion: 'Mágico, empedrado y con un encanto arquitectónico inigualable. Ideal para quienes buscan una experiencia residencial auténtica e inspiradora.' },
        { nombre: 'San Lázaro / Fontiñas', descripcion: 'Moderno, administrativo y con acceso rápido a las principales salidas de la ciudad. Una de las zonas favoritas para familias de funcionarios y profesionales.' },
        { nombre: 'Conxo / Santa Marta', descripcion: 'En plena expansión, residencial y muy bien valorado por su cercanía al hospital. Perfecto para quienes buscan pisos nuevos y zonas comunes despejadas.' },
      ]}
      alquileres={[
        { habitaciones: '1 habitación', rango: '550–730€' },
        { habitaciones: '2 habitaciones', rango: '700–920€' },
        { habitaciones: '3 habitaciones', rango: '820–1.150€' },
        { habitaciones: '4 habitaciones o más', rango: '1.000–1.400€' },
      ]}
      faqs={[
        {
          pregunta: '¿Santiago es una ciudad muy turística para vivir de manera estable?',
          respuesta: 'El turismo es intenso en el casco histórico, especialmente en verano. Pero la ciudad tiene barrios residenciales donde la vida cotidiana transcurre con tranquilidad total. Muchas familias viven en Santiago de toda la vida sin que el turismo afecte su día a día.',
        },
        {
          pregunta: '¿Qué posibilidades de trabajo hay en Santiago?',
          respuesta: 'La administración pública gallega tiene sede en Santiago, lo que genera empleo en servicios, salud, educación y sector público. La universidad también mueve mucho trabajo indirecto. Para trabajadores del conocimiento y remoto, la ciudad ofrece una calidad de vida excelente a un costo razonable.',
        },
        {
          pregunta: '¿Cómo es el sistema educativo para niños en Santiago?',
          respuesta: 'Muy sólido. Hay colegios públicos, concertados y privados de buena calidad. Algunos centros tienen programas bilingües español-inglés. La proximidad a la universidad genera un ambiente cultural estimulante para los chicos.',
        },
        {
          pregunta: '¿Llueve mucho en Santiago?',
          respuesta: 'Santiago es una de las ciudades más lluviosas de España, sí. Pero los santiagueses tienen una relación muy particular con la lluvia: no la ven como un problema sino como parte de la identidad. Los soportales del casco histórico hacen que la lluvia no limite la vida cotidiana.',
        },
      ]}
    />
  )
}

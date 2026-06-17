import { getNextMetadata } from '@/lib/seo/metadata'
import { CiudadLayout } from '@/components/ciudades'

export const metadata = getNextMetadata('vigo')

export default function VigoCiudadPage() {
  return (
    <CiudadLayout
      nombre="Vigo"
      slug="vigo"
      codigoAEMET="36057"
      vistaEnVivo={{ lat: 42.2406, lon: -8.7207, descripcionUbicacion: 'Puerto de Vigo' }}
      videoSrc="/videos/Vigo.mp4"
      posterSrc="/images/ciudades/card_vigo.jpg"
      descripcionCorta="La ciudad más grande de Galicia. Ría, mar y montaña a la vez — con toda la infraestructura que una familia necesita para empezar."
      descripcionLarga="Vigo no es solo la ciudad más poblada de Galicia: es la puerta de entrada natural para familias que llegan desde América Latina. Puerto atlántico, universidad, hospitales de referencia, centros comerciales y una red de transporte que conecta con toda Galicia en menos de dos horas. Hay comunidad latinoamericana consolidada, colegios bien valorados y una vida urbana real sin pagar precios de capital."
      descripcionLarga2="El mercado de alquiler en Vigo es activo y competitivo. Los pisos buenos salen y entran rápido — por eso tener a alguien que ya conoce el mercado, y que puede visitarlos el mismo día que aparecen, marca toda la diferencia."
      barrios={[
        { nombre: 'Coia', descripcion: 'Barrio familiar con colegios, supermercados y buena conexión. Muy buscado por familias con hijos.' },
        { nombre: 'Bouzas', descripcion: 'Tranquilo y cerca del puerto. Ideal para familias que priorizan calidad de vida y espacios al aire libre.' },
        { nombre: 'Travesas', descripcion: 'Céntrico y bien conectado. Primera opción para quienes llegan solos o en pareja.' },
      ]}
      alquileres={[
        { habitaciones: '1 habitación', rango: '600–800€' },
        { habitaciones: '2 habitaciones', rango: '750–1.050€' },
        { habitaciones: '3 habitaciones', rango: '900–1.300€' },
        { habitaciones: '4 habitaciones o más', rango: '1.100–1.600€' },
      ]}
      faqs={[
        {
          pregunta: '¿Puedo alquilar un piso en Vigo antes de llegar a España?',
          respuesta: 'Sí, y es exactamente lo que hacemos. Buscamos opciones, visitamos los pisos por ti, negociamos con el propietario y coordinamos la firma del contrato de manera que cuando llegues, la vivienda ya esté disponible.',
        },
        {
          pregunta: '¿Qué barrios son mejores para familias con niños?',
          respuesta: 'Coia y Bouzas son los más buscados por familias. Tienen colegios bien valorados, espacios verdes y una vida de barrio tranquila. Travesas es una buena opción para quienes prefieren estar más cerca del centro.',
        },
        {
          pregunta: '¿Hay comunidad latinoamericana en Vigo?',
          respuesta: 'Vigo tiene una de las comunidades latinoamericanas más activas de Galicia, con asociaciones, comercios y redes de apoyo consolidadas. La integración social suele ser rápida para quien llega con ganas de participar.',
        },
        {
          pregunta: '¿Cómo es el mercado de alquiler en Vigo?',
          respuesta: 'Activo y competitivo. Los pisos en zonas buscadas salen y se alquilan en días. Contar con los documentos en orden y un intermediario que conozca el mercado hace una diferencia real en los tiempos de búsqueda.',
        },
      ]}
    />
  )
}

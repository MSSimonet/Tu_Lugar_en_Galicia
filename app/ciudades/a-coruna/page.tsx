import { getNextMetadata } from '@/lib/seo/metadata'
import { CiudadLayout } from '@/components/ciudades'

export const metadata = getNextMetadata('aCoruna')

export default function ACorunaCiudadPage() {
  return (
    <CiudadLayout
      nombre="A Coruña"
      slug="a-coruna"
      codigoAEMET="15030"
      videoSrc="/videos/Coruña.mp4"
      posterSrc="/images/ciudades/hero-coruna.jpg"
      descripcionCorta="Ciudad atlántica con barrios consolidados, buenas escuelas y un mercado de alquiler más tranquilo que Vigo."
      descripcionLarga="A Coruña combina ciudad costera con infraestructura de capital regional. Tiene universidad, hospitales de referencia, una red de colegios sólida y conexión directa con el aeropuerto de Santiago a menos de 40 minutos. Su carácter es abierto y cosmopolita — una ciudad que recibe bien a quien llega."
      descripcionLarga2="El mercado de alquiler en A Coruña es activo pero algo menos saturado que en Vigo. Con el perfil adecuado y los documentos en orden, los tiempos de búsqueda suelen ser más cortos. Aun así, los pisos que aceptan mascotas o familias numerosas requieren una búsqueda específica y con experiencia."
      barrios={[
        { nombre: 'Agra del Orzán', descripcion: 'Céntrico, diverso y bien conectado. Muy popular entre familias recién llegadas.' },
        { nombre: 'Matogrande', descripcion: 'Barrio tranquilo con parques y colegios. Primera opción para familias con niños.' },
        { nombre: 'Os Mallos', descripcion: 'Relación calidad-precio destacada. Buena opción para quienes buscan amplitud sin salirse del presupuesto.' },
      ]}
      alquileres={[
        { habitaciones: '1 habitación', rango: '550–750€' },
        { habitaciones: '2 habitaciones', rango: '700–950€' },
        { habitaciones: '3 habitaciones', rango: '850–1.200€' },
        { habitaciones: '4 habitaciones o más', rango: '1.050–1.450€' },
      ]}
      faqs={[
        {
          pregunta: '¿Es A Coruña una ciudad cara para vivir?',
          respuesta: 'Es algo más cara que Vigo en términos de alquiler, pero sigue siendo muy accesible comparada con Madrid, Barcelona o el País Vasco. Para una familia de tres personas, con un piso de dos habitaciones en una zona buena, el alquiler está entre 700 € y 950 €.',
        },
        {
          pregunta: '¿Hay trabajo para latinoamericanos en A Coruña?',
          respuesta: 'El sector servicios, logística, industria y tecnología tienen demanda activa. Inditex y su cadena de empresas generan miles de puestos de trabajo directos e indirectos. También hay oportunidades en hostelería, comercio y salud.',
        },
        {
          pregunta: '¿Cómo es el sistema de transporte público en A Coruña?',
          respuesta: 'La red de autobuses urbanos cubre bien toda la ciudad. No hay metro, pero los buses son frecuentes y puntuales. Para moverte por Galicia, el tren y los autobuses interurbanos conectan con Vigo, Santiago y Ferrol sin problemas.',
        },
        {
          pregunta: '¿A Coruña es una buena ciudad para criar hijos?',
          respuesta: 'Muy buena. Tiene una escala manejable, espacios verdes, playas accesibles, colegios de calidad y un ambiente tranquilo más allá del centro. Muchas familias latinoamericanas que llegaron pensando en quedarse un año terminan echando raíces.',
        },
      ]}
    />
  )
}

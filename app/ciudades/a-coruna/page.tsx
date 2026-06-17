import { getNextMetadata } from '@/lib/seo/metadata'
import { CiudadLayout } from '@/components/ciudades'

export const metadata = getNextMetadata('aCoruna')

export default function ACorunaCiudadPage() {
  return (
    <CiudadLayout
      nombre="A Coruña"
      slug="a-coruna"
      codigoAEMET="15030"
      vistaEnVivo={{ lat: 43.3623, lon: -8.4115, descripcionUbicacion: 'Torre de Hércules' }}
      objectPosition="top center"
      videoSrc="/videos/coruna.mp4"
      posterSrc="/images/ciudades/card_coruna.jpg"
      descripcionCorta="Ciudad atlántica con barrios consolidados, buenas escuelas y un mercado de alquiler más tranquilo que Vigo."
      descripcionLarga="A Coruña combina ciudad costera con infraestructura de capital regional. Tiene universidad, hospitales de referencia, una red de colegios sólida y conexión directa con el aeropuerto de Santiago a menos de 40 minutos. Su carácter es abierto y cosmopolita — una ciudad que recibe bien a quien llega."
      descripcionLarga2="El mercado de alquiler en A Coruña es activo pero algo menos saturado que en Vigo. Con el perfil adecuado y los documentos en orden, los tiempos de búsqueda suelen ser más cortos. Aun así, los pisos que aceptan mascotas o familias numerosas requieren una búsqueda específica y con experiencia."
      barrios={[
        { nombre: 'Ensanche / Plaza de Lugo', descripcion: 'Elegante, comercial y con una oferta gastronómica inmejorable. El epicentro de las tendencias y la vida urbana coruñesa.' },
        { nombre: 'Ciudad Vieja', descripcion: 'Tranquilo, histórico y con un ambiente casi de pueblo dentro de la ciudad. Una joya para quienes buscan desconexión y patrimonio.' },
        { nombre: 'Riazor / Ciudad Escolar', descripcion: 'Frente al mar, deportivo y con una excelente oferta educativa. La opción idónea para familias activas que quieren ver el océano cada día.' },
        { nombre: 'Matogrande', descripcion: 'Moderno, empresarial y con un ambiente residencial exclusivo. Muy valorado por su accesibilidad y su perfil ejecutivo.' },
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

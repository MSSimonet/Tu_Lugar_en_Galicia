import { getNextMetadata } from '@/lib/seo/metadata'
import { CiudadLayout } from '@/components/ciudades'

export const metadata = getNextMetadata('lugo')

export default function LugoCiudadPage() {
  return (
    <CiudadLayout
      nombre="Lugo"
      slug="lugo"
      codigoAEMET="27028"
      vistaEnVivo={{ lat: 43.0097, lon: -7.5567, descripcionUbicacion: 'Muralla romana' }}
      videoSrc="/videos/Lugo.mp4"
      posterSrc="/images/ciudades/card-lugo.jpg"
      descripcionCorta="La ciudad romana de Galicia. Muralla histórica, ritmo tranquilo y los alquileres más accesibles de las cinco ciudades."
      descripcionLarga="Lugo tiene algo que las ciudades grandes no pueden ofrecer: calma y espacio. Es la ciudad más interior de Galicia, con un casco histórico declarado Patrimonio de la Humanidad por su muralla romana intacta. Tiene universidad, hospital de referencia y todos los servicios que una familia necesita, a una escala que hace la vida más fácil."
      descripcionLarga2="El mercado de alquiler en Lugo es el más accesible de las cinco ciudades. La oferta es más amplia en relación a la demanda, y los precios permiten encontrar pisos amplios a costos que en Vigo o A Coruña serían impensables. Una opción excelente para familias que priorizan espacio y tranquilidad."
      barrios={[
        { nombre: 'Centro histórico', descripcion: 'Vivir dentro de la muralla romana. Única experiencia, muy buscada por quienes llegan de grandes ciudades.' },
        { nombre: 'Sagrado Corazón', descripcion: 'Barrio residencial tranquilo con colegios y parques. Muy popular entre familias.' },
        { nombre: 'A Milagrosa', descripcion: 'Bien comunicado y con buena oferta de pisos amplios a precios razonables.' },
      ]}
      alquileres={[
        { habitaciones: '1 habitación', rango: '400–560€' },
        { habitaciones: '2 habitaciones', rango: '530–720€' },
        { habitaciones: '3 habitaciones', rango: '650–900€' },
        { habitaciones: '4 habitaciones o más', rango: '780–1.100€' },
      ]}
      faqs={[
        {
          pregunta: '¿Lugo está bien comunicada con el resto de Galicia?',
          respuesta: 'Razonablemente bien. Hay autobús y tren a Vigo, A Coruña y Santiago. Las distancias son mayores que entre las ciudades del litoral, pero los tiempos son manejables. Para el día a día dentro de Lugo, la ciudad es completamente caminable.',
        },
        {
          pregunta: '¿Por qué los alquileres son más bajos en Lugo?',
          respuesta: 'Principalmente por la demografía: Lugo tiene más oferta relativa de vivienda. Eso es una ventaja real para las familias que llegan: puedes acceder a pisos más grandes y mejor ubicados con el mismo presupuesto que en Vigo o A Coruña.',
        },
        {
          pregunta: '¿Hay comunidad latinoamericana en Lugo?',
          respuesta: 'Más pequeña que en las otras ciudades, pero activa. Hay familias latinoamericanas bien integradas que llevan años en Lugo y que suelen recibir muy bien a los recién llegados. La ciudad es acogedora por naturaleza.',
        },
        {
          pregunta: '¿Es Lugo adecuada para familias con niños en edad escolar?',
          respuesta: 'Muy adecuada. Los colegios públicos lucenses tienen buena reputación, hay actividades extraescolares accesibles y la ciudad es segura y caminable. La calidad de vida cotidiana — espacios para jugar, tranquilidad, contacto con la naturaleza — es difícil de igualar.',
        },
      ]}
    />
  )
}

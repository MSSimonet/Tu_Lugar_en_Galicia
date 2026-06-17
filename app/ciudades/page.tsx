import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ciudades de Galicia — Tu Lugar en Galicia',
  description:
    'Vigo, A Coruña, Santiago de Compostela, Pontevedra y Lugo. Descubre la ciudad de Galicia que mejor se adapta a tu vida.',
}

const CIUDADES = [
  {
    slug: 'vigo',
    nombre: 'Vigo',
    imagen: '/images/ciudades/card-vigo.jpg',
    descripcion: 'Donde la ría se abre al Atlántico y la ciudad nunca para.',
  },
  {
    slug: 'a-coruna',
    nombre: 'A Coruña',
    imagen: '/images/ciudades/card-coruna.jpg',
    descripcion: 'Viento, faro y una luz que no se parece a ninguna otra.',
  },
  {
    slug: 'santiago-de-compostela',
    nombre: 'Santiago de Compostela',
    imagen: '/images/ciudades/card-santiago.jpg',
    descripcion: 'La ciudad que lleva siglos esperando a quien llega.',
  },
  {
    slug: 'pontevedra',
    nombre: 'Pontevedra',
    imagen: '/images/ciudades/card-pontevedra.jpg',
    descripcion: 'Piedra, silencio y la vida que pasa despacio.',
  },
  {
    slug: 'lugo',
    nombre: 'Lugo',
    imagen: '/images/ciudades/card-lugo.jpg',
    descripcion: 'Dos mil años de muralla y todo el tiempo del mundo.',
  },
]

function CiudadCard({ ciudad }: { ciudad: typeof CIUDADES[number] }) {
  return (
    <Link
      href={`/ciudades/${ciudad.slug}`}
      className="group block relative overflow-hidden rounded-2xl"
      style={{ aspectRatio: '3/2' }}
    >
      <Image
        src={ciudad.imagen}
        alt={ciudad.nombre}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      {/* Overlay gradiente */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0) 100%)',
        }}
        aria-hidden="true"
      />
      {/* Texto */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p
          className="font-[family-name:var(--font-cormorant)] text-white font-normal leading-tight mb-1"
          style={{ fontSize: 'clamp(1.5rem, 3vw, 1.8rem)' }}
        >
          {ciudad.nombre}
        </p>
        <p
          className="font-[family-name:var(--font-mulish)] text-white/75 leading-snug"
          style={{ fontSize: '0.9rem' }}
        >
          {ciudad.descripcion}
        </p>
      </div>
    </Link>
  )
}

export default function CiudadesIndexPage() {
  const [fila1, fila2] = [CIUDADES.slice(0, 3), CIUDADES.slice(3)]

  return (
    <>
      {/* Hero */}
      <section
        className="bg-[var(--color-granito)] flex flex-col items-center justify-center text-center px-6 md:px-12"
        style={{ minHeight: '320px' }}
      >
        {/* Eyebrow pill */}
        <span
          className="inline-flex items-center px-3 py-1 rounded-full mb-5 font-[family-name:var(--font-mulish)] tracking-widest uppercase text-[var(--color-laton-claro)] border"
          style={{
            fontSize: '10px',
            background: 'rgba(0,0,0,0.42)',
            borderColor: 'rgba(255,255,255,0.18)',
          }}
        >
          Relocation especializado · Galicia
        </span>
        <h1
          className="font-[family-name:var(--font-cormorant)] text-white font-normal leading-tight mb-4"
          style={{ fontSize: 'clamp(2.4rem, 6vw, 3.5rem)' }}
        >
          Elige tu ciudad
        </h1>
        <p
          className="font-[family-name:var(--font-mulish)] leading-relaxed max-w-[480px] mx-auto"
          style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.70)' }}
        >
          Cada ciudad de Galicia tiene su carácter. Encuentra la que mejor se adapta a lo que buscas.
        </p>
      </section>

      {/* Grid de ciudades */}
      <section className="bg-[var(--color-niebla)] px-6 md:px-8 py-10">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Fila 1: 3 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fila1.map(ciudad => (
              <CiudadCard key={ciudad.slug} ciudad={ciudad} />
            ))}
          </div>
          {/* Fila 2: 2 columnas centradas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:w-2/3 md:mx-auto">
            {fila2.map(ciudad => (
              <CiudadCard key={ciudad.slug} ciudad={ciudad} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

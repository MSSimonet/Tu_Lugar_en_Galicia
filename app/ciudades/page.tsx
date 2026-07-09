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
    nombre: 'Vigo',
    tag: 'La ría se abre al Atlántico y la ciudad nunca para.',
    slug: 'vigo',
    imagen: '/images/ciudades/card_vigo.jpg',
  },
  {
    nombre: 'A Coruña',
    tag: 'Viento, faro y una luz que no se parece a ninguna otra.',
    slug: 'a-coruna',
    imagen: '/images/ciudades/card_coruna2.jpg',
  },
  {
    nombre: 'Santiago de Compostela',
    tag: 'La ciudad que lleva siglos esperando a quien llega.',
    slug: 'santiago-de-compostela',
    imagen: '/images/ciudades/card_santiago 2.jpg',
  },
  {
    nombre: 'Pontevedra',
    tag: 'Piedra, silencio y la vida que pasa despacio.',
    slug: 'pontevedra',
    imagen: '/images/ciudades/card_pontevedra.jpg',
  },
  {
    nombre: 'Lugo',
    tag: 'Dos mil años de muralla y todo el tiempo del mundo.',
    slug: 'lugo',
    imagen: '/images/ciudades/card_lugo.jpg',
  },
]

function CiudadCard({ nombre, tag, slug, imagen }: typeof CIUDADES[number]) {
  return (
    <Link href={`/ciudades/${slug}`} className="ciudad-card-link">
      <div className="ciudad-card">
        <Image
          src={imagen}
          alt={nombre}
          fill
          className="ciudad-img"
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 20vw"
        />
        {/* Gradiente oscuro inferior */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 45%, transparent 72%)',
            zIndex: 1,
          }}
        />
        {/* Texto superpuesto */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 16px 18px', zIndex: 2 }}>
          <p style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '26px',
            fontWeight: 700,
            fontStyle: 'italic',
            color: '#F5EFE4',
            margin: '0 0 7px 0',
            lineHeight: 1.2,
          }}>
            {nombre}
          </p>
          <p style={{
            fontFamily: 'var(--font-lato)',
            fontSize: '13px',
            fontWeight: 400,
            color: 'rgba(245,239,228,0.75)',
            margin: 0,
            lineHeight: 1.5,
          }}>
            {tag}
          </p>
        </div>
        {/* Borde dorado inferior — siempre visible */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'var(--po-ouro)',
          zIndex: 3,
        }} />
        {/* Borde dorado completo — aparece en hover via CSS */}
        <div aria-hidden="true" className="ciudad-border" style={{
          position: 'absolute',
          inset: 0,
          border: '1.5px solid var(--po-ouro)',
          borderRadius: '4px',
          zIndex: 3,
          pointerEvents: 'none',
        }} />
      </div>
    </Link>
  )
}

export default function CiudadesIndexPage() {
  return (
    <>
      <style>{`
        .ciudad-card-link { text-decoration: none; display: block; }
        .ciudad-card {
          position: relative;
          height: 320px;
          overflow: hidden;
          border-radius: 4px;
          cursor: pointer;
        }
        .ciudad-img { transition: transform 500ms ease !important; }
        .ciudad-border { opacity: 0; transition: opacity 250ms ease; }
        .ciudad-card:hover .ciudad-img { transform: scale(1.05) !important; }
        .ciudad-card:hover .ciudad-border { opacity: 1; }
        .ciudades-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          padding: 0 80px 80px;
        }
        @media (max-width: 768px) {
          .ciudades-grid {
            grid-template-columns: 1fr !important;
            padding: 0 20px 48px !important;
          }
          .ciudad-card { height: 220px !important; }
        }
      `}</style>

      {/* Hero */}
      <section
        className="flex flex-col items-center justify-center text-center px-6 md:px-12"
        style={{ backgroundColor: 'var(--po-luz)', padding: '40px 48px' }}
      >
        <span
          className="inline-flex items-center px-3 py-1 rounded-full mb-5 tracking-widest uppercase"
          style={{
            fontFamily: 'var(--font-lato)',
            fontWeight: 700,
            fontSize: '10px',
            color: 'var(--po-ouro-text)',
            background: 'var(--po-areia)',
            border: '1px solid var(--po-borde)',
          }}
        >
          Relocation especializado · Galicia
        </span>
        <h1
          className="font-normal mb-4"
          style={{
            fontFamily: 'var(--font-playfair)',
            fontWeight: 900,
            fontSize: 'clamp(36px, 5vw, 64px)',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            color: 'var(--po-pedra)',
          }}
        >
          Elige tu ciudad
        </h1>
        <p
          className="leading-relaxed max-w-[480px] mx-auto"
          style={{ fontFamily: 'var(--font-lato)', fontSize: '1rem', color: 'var(--po-muted)' }}
        >
          Cada ciudad de Galicia tiene su carácter. Encuentra la que mejor se adapta a lo que buscas.
        </p>
      </section>

      {/* Grid 5 columnas */}
      <section style={{ backgroundColor: 'var(--po-luz)', paddingTop: '10px' }}>
        <div className="ciudades-grid">
          {CIUDADES.map(ciudad => (
            <CiudadCard key={ciudad.slug} {...ciudad} />
          ))}
        </div>
      </section>
    </>
  )
}

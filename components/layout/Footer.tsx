import type React from 'react'
import Link from 'next/link'

const navLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Cómo funciona', href: '/como-funciona' },
  { label: 'Ciudades', href: '/ciudades' },
  { label: 'Sobre Silvana', href: '/sobre-silvana' },
  { label: '¿Tienes dudas?', href: '/faq' },
]

const cityLinks = [
  { label: 'Vigo', href: '/ciudades/vigo' },
  { label: 'A Coruña', href: '/ciudades/a-coruna' },
  { label: 'Santiago de Compostela', href: '/ciudades/santiago-de-compostela' },
  { label: 'Pontevedra', href: '/ciudades/pontevedra' },
  { label: 'Lugo', href: '/ciudades/lugo' },
]

const contactLinks = [
  { label: 'Facebook', href: 'https://facebook.com/tulugarengalicia' },
  { label: 'Instagram', href: 'https://instagram.com/tulugarengalicia' },
]

const LABEL_STYLE =
  'text-[9px] font-bold text-[#D4AF6A] tracking-[0.22em] uppercase mb-[26px]'

const LINK_STYLE =
  'text-[13.5px] text-[rgba(255,255,255,0.82)] font-normal hover:text-white transition-colors duration-[180ms] no-underline'

export function Footer() {
  return (
    <footer style={{ background: '#2A2B2E', fontFamily: "'Mulish', sans-serif", width: '100%' }}>

      {/* ── Cuerpo principal: dos paneles ── */}
      <div className="flex flex-col md:flex-row min-h-[360px]">

        {/* Panel izquierdo: marca */}
        <div
          className="w-full md:w-[42%] flex flex-col justify-between relative overflow-hidden"
          style={{ background: '#222325', padding: '64px 56px' }}
        >
          {/* Ornamentos de fondo — esquina inferior derecha */}
          <div
            className="pointer-events-none absolute"
            style={{
              right: -80, bottom: -80,
              width: 280, height: 280,
              borderRadius: '50%',
              border: '1px solid rgba(143,114,43,0.12)',
            }}
          />
          <div
            className="pointer-events-none absolute"
            style={{
              right: -40, bottom: -40,
              width: 200, height: 200,
              borderRadius: '50%',
              border: '1px solid rgba(143,114,43,0.08)',
            }}
          />

          {/* Logo */}
          <div className="text-center">
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 52,
                fontWeight: 500,
                color: '#ffffff',
                letterSpacing: '-0.01em',
                lineHeight: 0.95,
              }}
            >
              Tu Lugar
            </div>
            <div className="inline-block">
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 52,
                  fontWeight: 300,
                  fontStyle: 'italic',
                  color: '#8F722B',
                  letterSpacing: '-0.01em',
                  lineHeight: 0.95,
                }}
              >
                en Galicia
              </div>
              <div
                style={{
                  width: '100%',
                  height: 1.5,
                  background: '#8F722B',
                  marginTop: 14,
                  opacity: 0.6,
                }}
              />
            </div>
            <p
              style={{
                fontSize: 13.5,
                fontWeight: 300,
                color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.75,
                marginTop: 20,
                textWrap: 'pretty' as React.CSSProperties['textWrap'],
              }}
            >
              Ayudamos a familias a instalarse en Galicia con tranquilidad,
              acompañamiento real y sin sorpresas.
            </p>
          </div>

          {/* Espacio inferior (reservado para CTA futura) */}
          <div />
        </div>

        {/* Divisor vertical (visible solo en desktop) */}
        <div
          className="hidden md:block flex-shrink-0"
          style={{
            width: 1,
            background: 'linear-gradient(180deg, transparent 0%, #8F722B 25%, #8F722B 75%, transparent 100%)',
            opacity: 0.35,
          }}
        />

        {/* Divisor horizontal (visible solo en mobile) */}
        <div
          className="block md:hidden"
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent 0%, #8F722B 25%, #8F722B 75%, transparent 100%)',
            opacity: 0.35,
          }}
        />

        {/* Panel derecho: navegación */}
        <div
          className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_1fr_1.1fr] content-start"
          style={{ padding: '64px 56px', gap: '40px 40px' }}
        >
          {/* Columna 1 — Navegación */}
          <nav aria-label="Navegación footer">
            <p className={LABEL_STYLE}>Navegación</p>
            <ul className="flex flex-col gap-[14px]">
              {navLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className={LINK_STYLE}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Columna 2 — Ciudades */}
          <nav aria-label="Ciudades disponibles">
            <p className={LABEL_STYLE}>Ciudades</p>
            <ul className="flex flex-col gap-[14px]">
              {cityLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className={LINK_STYLE}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Columna 3 — Contacto */}
          <div>
            <p className={LABEL_STYLE}>Contacto</p>
            <ul className="flex flex-col gap-[14px]">
              {contactLinks.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={LINK_STYLE}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Pie legal ── */}
      <div
        className="flex flex-col md:flex-row md:justify-between md:items-center flex-wrap text-center md:text-left"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '18px 56px',
          gap: 12,
        }}
      >
        <p
          style={{
            fontSize: 11.5,
            fontWeight: 300,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.03em',
          }}
        >
          © {new Date().getFullYear()} Tu Lugar en Galicia · Todos los derechos reservados
        </p>
        <Link
          href="/politica-de-privacidad"
          style={{
            fontSize: 11.5,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.55)',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
            textDecorationColor: 'rgba(255,255,255,0.12)',
          }}
          className="hover:text-[rgba(255,255,255,0.55)] transition-colors duration-[180ms]"
        >
          Política de privacidad
        </Link>
      </div>

    </footer>
  )
}

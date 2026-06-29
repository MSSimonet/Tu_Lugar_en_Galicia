'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SITE_NAME } from '@/lib/config/site'

const serviceLinks = [
  { label: 'Cómo funciona',       href: '/como-funciona' },
  { label: 'Ciudades',            href: '/ciudades' },
  { label: 'Sobre Silvana',       href: '/sobre-silvana' },
  { label: 'Testimonios',         href: '/#testimonios' },
  { label: 'Preguntas frecuentes', href: '/faq' },
]

const legalLinks = [
  { label: 'Política de privacidad',  href: '/politica-de-privacidad' },
  { label: 'Términos y condiciones',  href: '/terminos-y-condiciones' },
  { label: 'Política de cookies',     href: '/politica-de-cookies' },
  { label: 'Aviso legal',             href: '/aviso-legal' },
]

/* ─── subcomponentes locales ─────────────────────────────── */

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      aria-hidden="true"
      style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.68rem',
        fontWeight: 300,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: '#B8943F',
        marginBottom: '1.25rem',
      }}
    >
      {children}
    </p>
  )
}

function NavLink({
  href,
  children,
  external,
}: {
  href: string
  children: React.ReactNode
  external?: boolean
}) {
  const style: React.CSSProperties = {
    fontSize: '0.84rem',
    fontWeight: 300,
    color: '#A8A8A8',
    textDecoration: 'none',
    lineHeight: 1.5,
    fontFamily: 'var(--font-ui)',
    transition: 'color 200ms ease',
    display: 'block',
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={style}
        className="hover:text-[#D4AF6A]"
      >
        {children}
        <span className="sr-only">(abre en nueva pestaña)</span>
      </a>
    )
  }

  return (
    <Link href={href} style={style} className="hover:text-[#D4AF6A]">
      {children}
    </Link>
  )
}

function InstagramIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

/* ─── componente principal ───────────────────────────────── */

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: '#141414', fontFamily: 'var(--font-ui)' }}>

      {/* Separador dorado superior */}
      <div style={{ height: '1px', background: '#B8943F', opacity: 0.7 }} />

      {/* ── Cuerpo principal ─────────────────────────────── */}
      <div
        className="mx-auto max-w-7xl"
        style={{ padding: '4rem 5rem 3.5rem' }}
      >
        <div className="grid grid-cols-1 gap-12 md:gap-10 lg:gap-14 md:grid-cols-[2.1fr_1.1fr_1.1fr_1.5fr]">

          {/* ── Columna 1 — Marca ────────────────────────── */}
          <div className="flex flex-col gap-5 items-center text-center md:items-start md:text-left">

            {/* Logo footer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px' }}>
              <Image
                src="/images/aldaba.png"
                alt=""
                width={72}
                height={93}
                style={{ objectFit: 'contain', display: 'block', flexShrink: 0 }}
                priority
              />
              <span style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '24px',
                fontWeight: 400,
                fontStyle: 'italic',
                color: '#D4AF6A',
                letterSpacing: '0.06em',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}>
                Tu Lugar<br />en Galicia
              </span>
            </div>

            {/* Tagline — C4: serif itálico dorado */}
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '15px',
                fontWeight: 400,
                fontStyle: 'italic',
                color: '#D4AF6A',
                letterSpacing: '0.06em',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              La primera agencia de relocation de Galicia
            </p>

            {/* Descripción — C1: "+200" en línea propia */}
            <div>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 300,
                  color: '#9A9A9A',
                  lineHeight: 1.8,
                  margin: '0 0 8px 0',
                  maxWidth: '300px',
                }}
              >
                Ayudamos a familias latinoamericanas a conseguir su hogar en
                Galicia antes de llegar.
              </p>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#D4AF6A',
                  margin: 0,
                }}
              >
                +200 familias reubicadas.
              </p>
            </div>
          </div>

          {/* ── Columnas 2 y 3 — Servicios + Legal (C3: 2 col en mobile) */}
          <div className="grid grid-cols-2 gap-8 md:contents">

            {/* Columna 2 — Servicios */}
            <nav aria-label="Servicios">
              <ColTitle>Servicios</ColTitle>
              <ul className="flex flex-col gap-[0.85rem]">
                {serviceLinks.map(({ label, href }) => (
                  <li key={href}>
                    <NavLink href={href}>{label}</NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Columna 3 — Legal */}
            <nav aria-label="Información legal">
              <ColTitle>Legal</ColTitle>
              <ul className="flex flex-col gap-[0.85rem]">
                {legalLinks.map(({ label, href }) => (
                  <li key={href}>
                    <NavLink href={href}>{label}</NavLink>
                  </li>
                ))}
              </ul>
            </nav>

          </div>

          {/* ── Columna 4 — Contacto ─────────────────────── */}
          <div>
            <ColTitle>Contacto</ColTitle>
            <div className="flex flex-col gap-4">

              {/* Email */}
              <a
                href="mailto:hola@tulugarengalicia.com"
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 300,
                  color: '#A8A8A8',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-ui)',
                  transition: 'color 200ms ease',
                }}
                className="hover:text-[#D4AF6A]"
              >
                hola@tulugarengalicia.com
              </a>

              {/* C2: RRSS con nombre de usuario */}
              <a
                href="https://www.instagram.com/tulugarengalicia/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#A8A8A8',
                  textDecoration: 'none',
                  transition: 'color 200ms ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#D4AF6A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#A8A8A8')}
              >
                <InstagramIcon />
                <span>@tulugarengalicia</span>
                <span className="sr-only">(abre en nueva pestaña)</span>
              </a>

              <a
                href="https://www.facebook.com/p/Tu-lugar-en-Galicia-100075983977059/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#A8A8A8',
                  textDecoration: 'none',
                  transition: 'color 200ms ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#D4AF6A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#A8A8A8')}
              >
                <FacebookIcon />
                <span>Tu Lugar en Galicia</span>
                <span className="sr-only">(abre en nueva pestaña)</span>
              </a>

            </div>
          </div>
        </div>
      </div>

      {/* ── Banda inferior ───────────────────────────────── */}
      <div style={{ borderTop: '1px solid #2A2A2A' }}>
        <div
          className="mx-auto max-w-7xl flex flex-col gap-1 text-center md:flex-row md:justify-between md:items-center md:text-left"
          style={{ padding: '1.1rem 5rem' }}
        >
          <p
            style={{
              fontSize: '0.71rem',
              fontWeight: 300,
              color: '#A8A8A8',
              letterSpacing: '0.025em',
            }}
          >
            © {year} {SITE_NAME}. Todos los derechos reservados.
          </p>
          <p
            style={{
              fontSize: '0.71rem',
              fontWeight: 300,
              color: '#A8A8A8',
              letterSpacing: '0.025em',
            }}
          >
            Desarrollado con ♥ en Galicia
          </p>
        </div>
      </div>

    </footer>
  )
}

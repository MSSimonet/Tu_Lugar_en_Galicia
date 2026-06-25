import Link from 'next/link'
import Image from 'next/image'
import {
  WHATSAPP_NUMBER,
  WHATSAPP_MESSAGE,
  CALCOM_URL,
  SITE_NAME,
} from '@/lib/config/site'

const CALCOM_PLACEHOLDER = 'https://cal.com/tu-usuario'
const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
const ctaHref = CALCOM_URL !== CALCOM_PLACEHOLDER ? CALCOM_URL : waHref

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
    color: '#6B6B6B',
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
      width="19"
      height="19"
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
      width="19"
      height="19"
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

function MessageIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

/* ─── componente principal ───────────────────────────────── */

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: '#0D0D0D', fontFamily: 'var(--font-ui)' }}>

      {/* Separador dorado superior */}
      <div style={{ height: '1px', background: '#B8943F', opacity: 0.7 }} />

      {/* ── Cuerpo principal ─────────────────────────────── */}
      <div
        className="mx-auto max-w-7xl"
        style={{ padding: '4rem 2.5rem', paddingBottom: '3.5rem' }}
      >
        <div className="grid grid-cols-1 gap-12 md:gap-10 lg:gap-14 md:grid-cols-[2.1fr_1.1fr_1.1fr_1.5fr]">

          {/* ── Columna 1 — Marca ────────────────────────── */}
          <div className="flex flex-col gap-5 items-center text-center md:items-start md:text-left">

            {/* Logo */}
            <Image
              src="/Logo TLG.jpeg"
              alt="Tu Lugar en Galicia"
              width={68}
              height={68}
              style={{ borderRadius: '4px', objectFit: 'contain' }}
              priority={false}
            />

            {/* Nombre y tagline */}
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '1.55rem',
                  fontWeight: 400,
                  color: '#D4AF6A',
                  letterSpacing: '0.015em',
                  lineHeight: 1.15,
                }}
              >
                Tu Lugar en Galicia
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '0.67rem',
                  fontWeight: 500,
                  color: '#B8943F',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  marginTop: '0.4rem',
                  lineHeight: 1.4,
                }}
              >
                La primera agencia de relocation de Galicia
              </p>
            </div>

            {/* Descripción */}
            <p
              style={{
                fontSize: '0.82rem',
                fontWeight: 300,
                color: '#6B6B6B',
                lineHeight: 1.8,
                maxWidth: '21rem',
              }}
            >
              Ayudamos a familias latinoamericanas a conseguir su hogar en
              Galicia antes de llegar.{' '}
              <span style={{ color: '#F0EDE6', fontWeight: 400 }}>
                +200 familias reubicadas.
              </span>
            </p>

            {/* Íconos RRSS */}
            <div className="flex items-center gap-4" style={{ marginTop: '0.25rem' }}>
              <a
                href="https://instagram.com/tulugarengalicia"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Instagram"
                style={{ color: '#6B6B6B', transition: 'color 200ms ease' }}
                className="hover:text-[#B8943F]"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://facebook.com/tulugarengalicia"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Facebook"
                style={{ color: '#6B6B6B', transition: 'color 200ms ease' }}
                className="hover:text-[#B8943F]"
              >
                <FacebookIcon />
              </a>
            </div>
          </div>

          {/* ── Columna 2 — Servicios ────────────────────── */}
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

          {/* ── Columna 3 — Legal ────────────────────────── */}
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
                  color: '#6B6B6B',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-ui)',
                  transition: 'color 200ms ease',
                }}
                className="hover:text-[#D4AF6A]"
              >
                hola@tulugarengalicia.com
              </a>

              {/* WhatsApp */}
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.82rem',
                  fontWeight: 300,
                  color: '#6B6B6B',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-ui)',
                  transition: 'color 200ms ease',
                }}
                className="hover:text-[#D4AF6A]"
              >
                <MessageIcon />
                Escríbenos por WhatsApp
              </a>

              {/* Divisor fino */}
              <div
                style={{
                  height: '1px',
                  background: '#2A2A2A',
                  margin: '0.35rem 0',
                }}
              />

              {/* CTA principal */}
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #B8943F',
                  color: '#D4AF6A',
                  background: 'transparent',
                  fontSize: '0.73rem',
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-ui)',
                  textAlign: 'center',
                  borderRadius: '2px',
                  transition: 'background 200ms ease, color 200ms ease',
                }}
                className="hover:bg-[#B8943F] hover:text-[#0D0D0D]"
              >
                Agenda tu videollamada
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Banda inferior ───────────────────────────────── */}
      <div style={{ borderTop: '1px solid #2A2A2A' }}>
        <div
          className="mx-auto max-w-7xl flex flex-col gap-1 text-center md:flex-row md:justify-between md:items-center md:text-left"
          style={{ padding: '1.1rem 2.5rem' }}
        >
          <p
            style={{
              fontSize: '0.71rem',
              fontWeight: 300,
              color: '#6B6B6B',
              letterSpacing: '0.025em',
            }}
          >
            © {year} {SITE_NAME}. Todos los derechos reservados.
          </p>
          <p
            style={{
              fontSize: '0.71rem',
              fontWeight: 300,
              color: '#6B6B6B',
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

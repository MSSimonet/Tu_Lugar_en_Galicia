import Link from 'next/link'
import { SITE_NAME } from '@/lib/config/site'

const footerLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Cómo funciona', href: '/como-funciona' },
  { label: 'Ciudades', href: '/ciudades/vigo' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Vamos a conocernos', href: '/conocernos' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[var(--color-granito)] text-[var(--color-niebla)] border-t border-[var(--color-pizarra)]/30">
      <div className="max-w-7xl mx-auto px-[var(--space-6)] py-[var(--space-12)] flex flex-col gap-[var(--space-8)]">
        {/* Marca y tagline */}
        <div className="flex flex-col gap-[var(--space-2)]">
          <span className="font-[family-name:var(--font-titular)] text-[var(--text-lg)] font-semibold text-[var(--color-niebla)]">
            {SITE_NAME}
          </span>
          <span className="font-[family-name:var(--font-ui)] text-[var(--text-xs)] text-[var(--color-arena)]">
            El primer servicio de relocation especializado en Galicia
          </span>
        </div>

        {/* Links de navegación */}
        <nav aria-label="Navegación del pie de página">
          <ul className="flex flex-wrap gap-x-[var(--space-6)] gap-y-[var(--space-3)]">
            {footerLinks.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="font-[family-name:var(--font-ui)] text-[var(--text-xs)] tracking-[var(--tracking-ui)] uppercase text-[var(--color-arena)] hover:text-[var(--color-laton-claro)] transition-colors duration-150"
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/politica-de-privacidad"
                className="font-[family-name:var(--font-ui)] text-[var(--text-xs)] tracking-[var(--tracking-ui)] uppercase text-[var(--color-arena)] hover:text-[var(--color-laton-claro)] transition-colors duration-150"
              >
                Política de privacidad
              </Link>
            </li>
          </ul>
        </nav>

        {/* Copyright */}
        <p className="font-[family-name:var(--font-ui)] text-[var(--text-xs)] text-[var(--color-arena)] border-t border-[var(--color-pizarra)] pt-[var(--space-6)]">
          &copy; {year} {SITE_NAME}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

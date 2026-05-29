'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SITE_NAME } from '@/lib/config/site'

const navLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Cómo funciona', href: '/como-funciona' },
  { label: 'Ciudades', href: '/ciudades/vigo' },
  { label: 'Sobre Silvana', href: '/sobre-silvana' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Vamos a conocernos', href: '/conocernos' },
]

export function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="bg-[var(--color-granito)] text-[var(--color-niebla)]">
      <div className="max-w-7xl mx-auto px-[var(--space-6)] h-16 flex items-center justify-between">
        {/* Logo / nombre */}
        <Link
          href="/"
          className="font-[family-name:var(--font-titular)] text-[var(--text-md)] font-semibold tracking-wide text-[var(--color-niebla)] hover:text-[var(--color-laton-claro)] transition-colors duration-150"
          aria-label="Tu Lugar en Galicia — inicio"
        >
          {SITE_NAME}
        </Link>

        {/* Navegación escritorio */}
        <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-[var(--space-6)]">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={[
                'font-[family-name:var(--font-ui)] text-[var(--text-xs)] tracking-[var(--tracking-ui)] uppercase transition-colors duration-150',
                isActive(href)
                  ? 'text-[var(--color-laton)] font-semibold'
                  : 'text-[var(--color-niebla)] hover:text-[var(--color-laton-claro)]',
              ].join(' ')}
              aria-current={isActive(href) ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
          <Link href="/agenda" tabIndex={-1}>
            <Button size="sm" variant="primario">
              Agenda
            </Button>
          </Link>
        </nav>

        {/* Botón hamburguesa móvil */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-laton)]"
        >
          <span
            className={[
              'block h-0.5 w-6 bg-[var(--color-niebla)] transition-transform duration-200',
              menuOpen ? 'translate-y-2 rotate-45' : '',
            ].join(' ')}
          />
          <span
            className={[
              'block h-0.5 w-6 bg-[var(--color-niebla)] transition-opacity duration-200',
              menuOpen ? 'opacity-0' : '',
            ].join(' ')}
          />
          <span
            className={[
              'block h-0.5 w-6 bg-[var(--color-niebla)] transition-transform duration-200',
              menuOpen ? '-translate-y-2 -rotate-45' : '',
            ].join(' ')}
          />
        </button>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Navegación móvil"
          className="md:hidden bg-[var(--color-granito)] border-t border-[var(--color-pizarra)] px-[var(--space-6)] py-[var(--space-4)] flex flex-col gap-[var(--space-4)]"
        >
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={[
                'font-[family-name:var(--font-ui)] text-[var(--text-sm)] tracking-[var(--tracking-ui)] uppercase py-[var(--space-2)] transition-colors duration-150',
                isActive(href)
                  ? 'text-[var(--color-laton)] font-semibold'
                  : 'text-[var(--color-niebla)] hover:text-[var(--color-laton-claro)]',
              ].join(' ')}
              aria-current={isActive(href) ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
          <Link href="/agenda" onClick={() => setMenuOpen(false)} tabIndex={-1}>
            <Button size="md" variant="primario" className="w-full justify-center">
              Agenda
            </Button>
          </Link>
        </nav>
      )}
    </header>
  )
}

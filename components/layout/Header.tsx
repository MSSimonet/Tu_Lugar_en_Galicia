'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { SITE_NAME } from '@/lib/config/site'

const navLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Cómo funciona', href: '/como-funciona' },
  { label: 'Ciudades', href: '/ciudades/vigo' },
  { label: 'Sobre Silvana', href: '/sobre-silvana' },
  { label: '¿Tienes dudas?', href: '/faq' },
  { label: 'Vamos a conocernos', href: '/conocernos' },
]

export function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  useEffect(() => {
    if (!menuOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        hamburgerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  return (
    <>
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-laton)] focus:text-white focus:rounded-[var(--radius-card)] focus:font-[family-name:var(--font-ui)]"
    >
      Ir al contenido principal
    </a>
    <header className="sticky top-0 z-40 bg-[var(--color-granito)]/95 backdrop-blur-sm text-[var(--color-niebla)]">
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
          <Link
            href="/agenda"
            className="inline-flex items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-laton)] text-white px-[var(--space-4)] py-[var(--space-2)] text-[var(--text-xs)] font-medium font-[family-name:var(--font-ui)] tracking-[var(--tracking-ui)] uppercase transition-all duration-200 hover:bg-[var(--color-laton-oscuro)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-laton)]"
          >
            Agenda
          </Link>
        </nav>

        {/* Botón hamburguesa móvil */}
        <button
          ref={hamburgerRef}
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
          <Link
            href="/agenda"
            onClick={() => setMenuOpen(false)}
            className="inline-flex items-center justify-center w-full rounded-[var(--radius-pill)] bg-[var(--color-laton)] text-white px-[var(--space-6)] py-[var(--space-3)] text-[var(--text-sm)] font-medium font-[family-name:var(--font-ui)] tracking-[var(--tracking-ui)] uppercase transition-all duration-200 hover:bg-[var(--color-laton-oscuro)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-laton)]"
          >
            Agenda
          </Link>
        </nav>
      )}
    </header>
    </>
  )
}

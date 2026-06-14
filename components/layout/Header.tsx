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
]

function abrirGina() {
  window.dispatchEvent(new CustomEvent('gina:open'))
}

const SPARKLES_PATH =
  'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z'

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={SPARKLES_PATH} />
    </svg>
  )
}

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

            {/* Botón Gina — mismo estilo que el del hero */}
            <button
              type="button"
              onClick={abrirGina}
              aria-label="Hablar con Gina, abrir asistente"
              className="inline-flex items-center gap-1.5 rounded-full transition-brand cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-laton-claro)]"
              style={{
                background: 'linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%)',
                color: 'var(--color-laton-claro)',
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-ui)',
                fontWeight: 600,
                letterSpacing: 'var(--tracking-ui)',
                textTransform: 'uppercase',
                border: '1px solid rgba(230, 193, 88, 0.4)',
                boxShadow:
                  '0 2px 8px rgba(0,0,0,0.2), 0 0 0 1px rgba(230,193,88,0.12), 0 0 12px rgba(230,193,88,0.10)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(0,0,0,0.25), 0 0 0 1px rgba(230,193,88,0.22), 0 0 16px rgba(230,193,88,0.18)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  '0 2px 8px rgba(0,0,0,0.2), 0 0 0 1px rgba(230,193,88,0.12), 0 0 12px rgba(230,193,88,0.10)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <SparklesIcon className="w-4 h-4 shrink-0" />
              Hablar con Gina
            </button>

            {/* Botón Agenda */}
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

            {/* Botón Gina — móvil */}
            <button
              type="button"
              onClick={() => { abrirGina(); setMenuOpen(false) }}
              aria-label="Hablar con Gina, abrir asistente"
              className="inline-flex items-center justify-center gap-2 w-full rounded-full transition-brand cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-laton-claro)]"
              style={{
                background: 'linear-gradient(135deg, #2A2A2A 0%, #1A1A1A 100%)',
                color: 'var(--color-laton-claro)',
                padding: 'var(--space-3) var(--space-6)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-ui)',
                fontWeight: 600,
                letterSpacing: 'var(--tracking-ui)',
                textTransform: 'uppercase',
                border: '1px solid rgba(230, 193, 88, 0.4)',
                boxShadow:
                  '0 2px 8px rgba(0,0,0,0.2), 0 0 0 1px rgba(230,193,88,0.12), 0 0 12px rgba(230,193,88,0.10)',
              }}
            >
              <SparklesIcon className="w-4 h-4 shrink-0" />
              Hablar con Gina
            </button>

            {/* Botón Agenda — móvil */}
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

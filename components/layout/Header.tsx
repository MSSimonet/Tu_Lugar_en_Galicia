'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { SITE_NAME } from '@/lib/config/site'

const navLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Cómo funciona', href: '/como-funciona' },
  { label: 'Ciudades', href: '/ciudades' },
  { label: 'Sobre Silvana', href: '/sobre-silvana' },
  { label: '¿Tienes dudas?', href: '/faq' },
]

const SPARKLES_PATH =
  'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z'

function SparklesIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={SPARKLES_PATH} />
    </svg>
  )
}

function abrirGina() {
  window.dispatchEvent(new CustomEvent('gina:open'))
}

export function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY >= 50)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  const headerStyle: React.CSSProperties = {
    height: '64px',
    background: scrolled
      ? '#1A1B1E'
      : 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0) 100%)',
    borderBottom: scrolled ? '0.5px solid rgba(255,255,255,0.07)' : 'none',
    transition: 'background 300ms ease, border-color 300ms ease',
  }

  const ginaStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    borderRadius: '20px',
    padding: scrolled ? '7px 16px' : '8px 18px',
    fontSize: scrolled ? '0.77rem' : '0.8rem',
    fontFamily: 'var(--font-ui)',
    color: scrolled ? 'rgba(255,255,255,0.8)' : 'white',
    background: 'transparent',
    border: scrolled ? '0.5px solid rgba(255,255,255,0.25)' : '0.5px solid rgba(255,255,255,0.5)',
    cursor: 'pointer',
    letterSpacing: '0.03em',
    transition: 'all 300ms ease',
  }

  const agendaStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '20px',
    padding: scrolled ? '7px 16px' : '8px 18px',
    fontSize: scrolled ? '0.77rem' : '0.8rem',
    fontFamily: 'var(--font-ui)',
    color: 'white',
    background: '#8F722B',
    border: 'none',
    textDecoration: 'none',
    textTransform: 'uppercase' as const,
    fontWeight: 600,
    letterSpacing: '0.05em',
    transition: 'all 300ms ease',
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--color-laton)] focus:text-white focus:rounded-lg focus:font-[family-name:var(--font-ui)]"
      >
        Ir al contenido principal
      </a>

      <header className="fixed top-0 left-0 right-0 z-40" style={headerStyle}>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            aria-label="Tu Lugar en Galicia — inicio"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.4rem',
              fontWeight: 400,
              color: 'white',
              textDecoration: 'none',
              letterSpacing: '0.03em',
              textShadow: scrolled ? 'none' : '0 1px 8px rgba(0,0,0,0.6)',
            }}
          >
            {SITE_NAME}
          </Link>

          {/* Navegación escritorio */}
          <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-6">
            {navLinks.map(({ label, href }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  style={{
                    position: 'relative',
                    fontSize: '0.83rem',
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: active ? 'white' : scrolled ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.65)',
                    fontWeight: active ? 500 : 400,
                    textDecoration: 'none',
                    fontFamily: 'var(--font-ui)',
                    textShadow: scrolled ? 'none' : '0 1px 4px rgba(0,0,0,0.5)',
                    transition: 'color 300ms ease',
                  }}
                >
                  {label}
                  {active && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        left: 0,
                        right: 0,
                        height: '1.5px',
                        background: scrolled ? '#8F722B' : '#D4B96A',
                        borderRadius: '1px',
                        transition: 'background 300ms ease',
                      }}
                    />
                  )}
                </Link>
              )
            })}

            <button type="button" onClick={abrirGina} aria-label="Hablar con Gina, abrir asistente" style={ginaStyle}>
              <SparklesIcon color="#D4B96A" />
              Hablar con Gina
            </button>

            <Link href="/agenda" style={agendaStyle}>
              Agenda
            </Link>
          </nav>

          {/* Hamburguesa móvil */}
          <button
            ref={hamburgerRef}
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-laton)]"
          >
            <span className={['block h-0.5 w-6 bg-white transition-transform duration-200', menuOpen ? 'translate-y-2 rotate-45' : ''].join(' ')} />
            <span className={['block h-0.5 w-6 bg-white transition-opacity duration-200', menuOpen ? 'opacity-0' : ''].join(' ')} />
            <span className={['block h-0.5 w-6 bg-white transition-transform duration-200', menuOpen ? '-translate-y-2 -rotate-45' : ''].join(' ')} />
          </button>
        </div>

        {/* Menú móvil */}
        {menuOpen && (
          <nav
            id="mobile-menu"
            aria-label="Navegación móvil"
            className="md:hidden px-6 py-4 flex flex-col gap-4"
            style={{ background: '#1A1B1E', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}
          >
            {navLinks.map(({ label, href }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  style={{
                    fontSize: '0.85rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: active ? 'white' : 'rgba(255,255,255,0.6)',
                    fontWeight: active ? 500 : 400,
                    textDecoration: 'none',
                    fontFamily: 'var(--font-ui)',
                  }}
                >
                  {label}
                </Link>
              )
            })}

            <button
              type="button"
              onClick={() => { abrirGina(); setMenuOpen(false) }}
              aria-label="Hablar con Gina, abrir asistente"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: '6px', borderRadius: '20px', padding: '8px 18px',
                fontSize: '0.85rem', fontFamily: 'var(--font-ui)',
                color: 'white', background: 'rgba(255,255,255,0.1)',
                border: '0.5px solid rgba(255,255,255,0.3)', cursor: 'pointer',
                letterSpacing: '0.03em',
              }}
            >
              <SparklesIcon color="#D4B96A" />
              Hablar con Gina
            </button>

            <Link
              href="/agenda"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '20px', padding: '8px 18px',
                fontSize: '0.85rem', fontFamily: 'var(--font-ui)',
                color: 'white', background: '#8F722B',
                border: 'none', textDecoration: 'none',
                textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em',
              }}
            >
              Agenda
            </Link>
          </nav>
        )}
      </header>
    </>
  )
}

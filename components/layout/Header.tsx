'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

const navLinks = [
  { label: 'Inicio',         href: '/'              },
  { label: 'Cómo funciona',  href: '/como-funciona' },
  { label: 'Ciudades',       href: '/ciudades'       },
  { label: 'Sobre Silvana',  href: '/sobre-silvana'  },
  { label: '¿Tienes dudas?', href: '/faq'            },
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
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#B8943F] focus:text-white focus:rounded-lg focus:font-[family-name:var(--font-ui)]"
      >
        Ir al contenido principal
      </a>

      <header
        className="h-16 md:h-[92px]"
        style={{
          background: '#111111',
          borderBottom: '1px solid #B8943F',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {/*
          Grid 1fr auto 1fr: col izquierda y derecha iguales → nav centrado sin overlap.
          El gap del nav baja a 16px para que 1fr ≥ 285px (ancho de los CTAs).
        */}
        <div
          className="max-w-7xl mx-auto h-full flex justify-between items-center md:grid"
          style={{ padding: '0 24px', gridTemplateColumns: '1fr auto 1fr' }}
        >

          {/* Col 1: Logo — izquierda */}
          <div className="flex items-center">
            <Link
              href="/"
              aria-label="Tu Lugar en Galicia — inicio"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              <Image
                src="/images/aldaba.svg"
                alt=""
                width={54}
                height={70}
                className="h-10 w-auto md:h-[70px]"
                style={{ objectFit: 'contain', display: 'block' }}
                priority
              />
              <span style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '20px',
                fontWeight: 400,
                fontStyle: 'italic',
                color: '#D4AF6A',
                letterSpacing: '0.05em',
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
              }}>
                Tu Lugar<br />en Galicia
              </span>
            </Link>
          </div>

          {/* Col 2: Nav links — centro exacto (md+) */}
          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center"
            style={{ gap: '20px' }}
          >
            {navLinks.map(({ label, href }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  style={{
                    position: 'relative',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '11px',
                    fontWeight: 300,
                    color: active ? '#F0EDE6' : '#A8A8A8',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    transition: 'color 200ms ease',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#F0EDE6' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#A8A8A8' }}
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
                        height: '1px',
                        background: '#B8943F',
                      }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Col 3: CTAs (md+) + Hamburger (mobile) — derecha */}
          <div className="flex items-center justify-end">

            {/* CTAs — solo desktop */}
            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                onClick={abrirGina}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0D0D0D',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: '#B8943F',
                  padding: '9px 18px',
                  borderRadius: '999px',
                  letterSpacing: '0.06em',
                  transition: 'background 200ms ease',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#D4AF6A')}
                onMouseLeave={e => (e.currentTarget.style.background = '#B8943F')}
              >
                <span style={{ fontSize: '13px', lineHeight: '1' }}>✦</span>
                Hablar con Gina
              </button>

              <Link
                href="/agenda"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#D4AF6A',
                  border: '1px solid #B8943F',
                  padding: '9px 22px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'background 200ms ease, color 200ms ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#B8943F'
                  e.currentTarget.style.color = '#0D0D0D'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#D4AF6A'
                }}
              >
                Agenda
              </Link>
            </div>

            {/* Hamburger — solo mobile */}
            <button
              ref={hamburgerRef}
              type="button"
              onClick={() => setMenuOpen(prev => !prev)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8943F]"
            >
              <span className={['block h-0.5 w-6 bg-white transition-transform duration-200', menuOpen ? 'translate-y-2 rotate-45' : ''].join(' ')} />
              <span className={['block h-0.5 w-6 bg-white transition-opacity duration-200', menuOpen ? 'opacity-0' : ''].join(' ')} />
              <span className={['block h-0.5 w-6 bg-white transition-transform duration-200', menuOpen ? '-translate-y-2 -rotate-45' : ''].join(' ')} />
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {menuOpen && (
          <nav
            id="mobile-menu"
            aria-label="Navegación móvil"
            className="md:hidden px-6 py-5 flex flex-col gap-5"
            style={{ background: '#111111', borderTop: '1px solid rgba(184,148,63,0.3)' }}
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
                    fontFamily: 'var(--font-ui)',
                    fontSize: '13px',
                    fontWeight: 300,
                    color: active ? '#F0EDE6' : '#A8A8A8',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-ui)',
                fontSize: '13px',
                fontWeight: 300,
                color: '#A8A8A8',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.03em',
                padding: 0,
              }}
            >
              <SparklesIcon color="#B8943F" />
              Hablar con Gina
            </button>

            <Link
              href="/agenda"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-cormorant)',
                fontSize: '13px',
                fontWeight: 500,
                color: '#D4AF6A',
                border: '1px solid #B8943F',
                padding: '9px 22px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textDecoration: 'none',
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

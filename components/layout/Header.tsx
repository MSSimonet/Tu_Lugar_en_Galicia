'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

// Nav flotante (rediseño 2026-08-03).
//
// La pieza del rediseño es la PASTILLA: los links dejan de vivir sobre la banda
// del header y pasan a una cápsula oscura con sombra, que flota sobre ella. Para
// que eso se lea hace falta que la banda contraste con la pastilla, y de ahí sale
// la única decisión de sistema que toca este archivo: la banda del header ya no
// es siempre oscura, se aclara en tema claro. El razonamiento y los números están
// en app/globals.css, junto a los tokens --nav-*, y en DESIGN.md §Capa chrome.
//
// Los tokens --nav-* son nuevos y NO pisan ninguno existente. En concreto no se
// toca --color-header-bg, que además de acá lo consumen Footer (vía
// --color-footer-bg), GinaWidget y VistaEnVivo.

declare global {
  interface Window {
    /** Lo instala el script de tema de app/layout.tsx — ver el comentario de ese archivo. */
    __tlgAplicarTema?: (dark: boolean) => void
  }
}

const navLinks = [
  { label: 'Inicio',         href: '/'              },
  { label: 'Cómo funciona',  href: '/como-funciona' },
  { label: 'Ciudades',       href: '/ciudades'       },
  { label: 'Comunidad',      href: '/comunidad'      },
  { label: 'Quiénes somos',  href: '/sobre-silvana'  },
  { label: 'Apps útiles',    href: '/apps-utiles'    },
  { label: '¿Tienes dudas?', href: '/faq'            },
]

const SPARKLE_PATH =
  'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z'

function Sparkle({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={SPARKLE_PATH} />
    </svg>
  )
}

/** Mecanismo real del proyecto para abrir a Gina: lo escucha GinaWidget.tsx y lo
 *  disparan también Hero, CTAFinal, CiudadLayout y GinaButton. */
function abrirGina() {
  window.dispatchEvent(new CustomEvent('gina:open'))
}

export function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  // Estado de scroll — agrega sombra a la banda una vez que el contenido pasa
  // por debajo. Listener pasivo, sin GSAP para un booleano.
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 40)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  // Sincroniza isDark con el tema que aplicó el script anti-flash antes de hidratar
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  // El toggle es de SITIO COMPLETO y ya lo era antes de este rediseño: togglea
  // .dark en <html> y persiste en localStorage, y el script de app/layout.tsx lo
  // relee antes de hidratar (respetando prefers-color-scheme si no hay elección
  // guardada). No hace falta ningún ThemeProvider.
  //
  // Lo que NO puede hacer es conmutar la clase por su cuenta: hay que pasar por
  // __tlgAplicarTema, que apaga las transiciones mientras dura el cambio. Al
  // togglear la clase a pelo, Chromium deja congelado el valor computado de toda
  // propiedad transicionada que dependa de un token de tema — la banda del header
  // se quedaba clara con el texto del nav ya en su color oscuro (1,14:1), y el
  // panel de Gina claro sobre claro. El porqué completo está en app/layout.tsx.
  const toggleTheme = () => {
    const newIsDark = !document.documentElement.classList.contains('dark')
    localStorage.setItem('tlg-theme', newIsDark ? 'dark' : 'light')
    // El fallback deja el comportamiento anterior (con el congelado), no un botón
    // muerto, si el script de tema no llegó a ejecutarse.
    if (window.__tlgAplicarTema) window.__tlgAplicarTema(newIsDark)
    else document.documentElement.classList.toggle('dark', newIsDark)
    setIsDark(newIsDark)
  }

  useEffect(() => {
    if (!menuOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        hamburgerRef.current?.focus()
        return
      }
      if (e.key === 'Tab') {
        const menu = document.getElementById('mobile-menu')
        if (!menu) return
        const focusable = Array.from(
          menu.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        )
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  const focusRing =
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nav-pastilla-activo)]'

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-[var(--nav-pastilla)] focus:text-[var(--nav-pastilla-ink)] focus:rounded-lg focus:font-[family-name:var(--font-dz-ui)]"
      >
        Ir al contenido principal
      </a>

      <header
        style={{
          background: 'var(--nav-banda)',
          borderBottom: '1px solid var(--nav-banda-borde)',
          boxShadow: scrolled ? 'var(--dz-shadow-md)' : 'none',
          transition: 'background 200ms ease, box-shadow 250ms ease',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          className="max-w-[1440px] mx-auto flex items-center justify-between"
          style={{ padding: '14px 20px', gap: '16px' }}
        >

          {/* ── Logo + wordmark ── */}
          <Link
            href="/"
            aria-label="Tu Lugar en Galicia — inicio"
            className={focusRing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <Image
              src="/images/aldaba-tlg.png"
              alt=""
              width={398}
              height={448}
              priority
              style={{
                // 56px es la medida del mockup; se alcanza a partir de ~1650px.
                // Por debajo se comprime para que la fila entre sin desbordar.
                height: 'clamp(44px, 3.4vw, 56px)',
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontStyle: 'italic',
                fontSize: 'clamp(18px, 1.35vw, 23px)',
                fontWeight: 600,
                color: 'var(--nav-ink)',
                letterSpacing: '0.04em',
                lineHeight: 1.12,
                whiteSpace: 'nowrap',
                transition: 'color 200ms ease',
              }}
            >
              Tu Lugar<br />en Galicia
            </span>
          </Link>

          {/* ── Pastilla flotante con los links ── */}
          <nav
            aria-label="Navegación principal"
            className="hidden xl:flex items-center"
            style={{
              // El breakpoint es xl (1280) y NO lg (1024), medido: con 7 links,
              // wordmark y 3 CTAs, a 1024px la fila desborda 52px
              // (scrollWidth 1076). Para que entrara habría que bajar el nav a
              // 10px, por debajo del suelo de 12px que la auditoría del proyecto
              // verifica. Es la misma conclusión a la que ya había llegado la
              // versión anterior de este archivo. Entre 1280 y 1024 se usa el
              // panel móvil.
              //
              // Los clamp comprimen la pastilla en la parte baja del rango y le
              // devuelven las medidas del mockup a partir de ~1500px.
              gap: 'clamp(12px, 1.15vw, 20px)',
              background: 'var(--nav-pastilla)',
              border: '1px solid var(--nav-pastilla-borde)',
              borderRadius: '999px',
              padding: 'clamp(10px, 0.8vw, 12px) clamp(16px, 1.6vw, 24px)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
              transition: 'background 200ms ease, border-color 200ms ease',
            }}
          >
            {navLinks.map(({ label, href }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={focusRing}
                  style={{
                    // inline-flex + minHeight: el objetivo táctil de cada link
                    // llega a 24px (WCAG 2.2 AA, 2.5.8). El texto solo daría ~16.
                    display: 'inline-flex',
                    alignItems: 'center',
                    minHeight: '24px',
                    fontFamily: 'var(--font-cormorant)',
                    // 12px es el suelo: la auditoría de diseño del proyecto
                    // verifica que no haya texto por debajo de esa medida.
                    fontSize: 'clamp(12px, 0.86vw, 13px)',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                    color: active ? 'var(--nav-pastilla-activo)' : 'var(--nav-pastilla-ink)',
                    transition: 'color 200ms ease',
                  }}
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.color = 'var(--nav-pastilla-activo)'
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.color = 'var(--nav-pastilla-ink)'
                  }}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* ── CTAs de escritorio + hamburguesa ── */}
          <div className="flex items-center justify-end" style={{ flexShrink: 0 }}>
            <div className="hidden xl:flex items-center" style={{ gap: '10px' }}>

              {/* Agenda — outline */}
              <Link
                href="/agenda"
                className={focusRing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '42px',
                  padding: '0 clamp(12px, 1.2vw, 18px)',
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--nav-ink)',
                  border: '1.5px solid var(--nav-ink)',
                  background: 'transparent',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'background 200ms ease, color 200ms ease, border-color 200ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--nav-agenda-hover)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                Agenda
              </Link>

              {/* Conozcámonos — pastilla rellena de acento. El texto va en
                  --laton-ink y no en blanco: 7.35:1 en reposo y 5.34:1 en hover,
                  contra los 3.44:1 que daba el blanco. */}
              <button
                type="button"
                onClick={abrirGina}
                className={focusRing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  height: '42px',
                  padding: '0 clamp(14px, 1.5vw, 22px)',
                  fontFamily: 'var(--font-dz-ui)',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--laton-ink)',
                  background: 'var(--color-laton-claro)',
                  border: 'none',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background 200ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-laton)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-laton-claro)' }}
              >
                <Sparkle />
                Conozcámonos
              </button>

              {/* Toggle de tema */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
                className={focusRing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: '1px solid var(--nav-ink)',
                  background: 'transparent',
                  color: 'var(--nav-ink)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 200ms ease, color 200ms ease, border-color 200ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--nav-agenda-hover)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                {isDark ? <Sun size={16} strokeWidth={1.6} /> : <Moon size={15} strokeWidth={1.6} />}
              </button>
            </div>

            {/* Hamburguesa — solo móvil */}
            <button
              ref={hamburgerRef}
              type="button"
              onClick={() => setMenuOpen(prev => !prev)}
              aria-expanded={menuOpen}
              aria-controls={menuOpen ? 'mobile-menu' : undefined}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className={`xl:hidden flex flex-col items-center justify-center gap-1.5 w-11 h-11 ${focusRing}`}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <span
                className="block h-0.5 w-[22px] transition-transform duration-200"
                style={{ background: 'var(--nav-ink)', transform: menuOpen ? 'translateY(8px) rotate(45deg)' : undefined }}
              />
              <span
                className="block h-0.5 w-[22px] transition-opacity duration-200"
                style={{ background: 'var(--nav-ink)', opacity: menuOpen ? 0 : 1 }}
              />
              <span
                className="block h-0.5 w-[22px] transition-transform duration-200"
                style={{ background: 'var(--nav-ink)', transform: menuOpen ? 'translateY(-8px) rotate(-45deg)' : undefined }}
              />
            </button>
          </div>
        </div>

        {/* ── Panel móvil ── */}
        {menuOpen && (
          <nav
            id="mobile-menu"
            aria-label="Navegación móvil"
            className="xl:hidden flex flex-col"
            style={{
              maxWidth: '1440px',
              margin: '0 auto 16px',
              background: 'var(--nav-pastilla)',
              border: '1px solid var(--nav-pastilla-borde)',
              borderRadius: '20px',
              padding: '20px',
              gap: '16px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.32)',
              width: 'calc(100% - 40px)',
            }}
          >
            {navLinks.map(({ label, href }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={focusRing}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    minHeight: '24px',
                    fontFamily: 'var(--font-dz-ui)',
                    fontSize: '13px',
                    fontWeight: 400,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    color: active ? 'var(--nav-pastilla-activo)' : 'var(--nav-pastilla-ink)',
                  }}
                >
                  {label}
                </Link>
              )
            })}

            <button
              type="button"
              onClick={() => { abrirGina(); setMenuOpen(false) }}
              className={focusRing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                height: '46px',
                marginTop: '4px',
                fontFamily: 'var(--font-dz-ui)',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--laton-ink)',
                background: 'var(--color-laton-claro)',
                border: 'none',
                borderRadius: '999px',
                cursor: 'pointer',
              }}
            >
              <Sparkle />
              Conozcámonos
            </button>

            <Link
              href="/agenda"
              onClick={() => setMenuOpen(false)}
              className={focusRing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '24px',
                fontFamily: 'var(--font-cormorant)',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--nav-pastilla-ink)',
                textDecoration: 'none',
              }}
            >
              Agenda
            </Link>

            {/* Utilidades: tema, separado por una línea */}
            <button
              type="button"
              onClick={() => { toggleTheme(); setMenuOpen(false) }}
              aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
              className={focusRing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minHeight: '24px',
                paddingTop: '14px',
                fontFamily: 'var(--font-dz-ui)',
                fontSize: '12px',
                fontWeight: 400,
                letterSpacing: '0.04em',
                color: 'var(--nav-pastilla-ink)',
                background: 'transparent',
                // Solo borde superior: hace de separador entre el bloque de
                // navegación y las utilidades, como en el mockup.
                border: 'none',
                borderTop: '1px solid var(--color-footer-border)',
                cursor: 'pointer',
              }}
            >
              {isDark
                ? <><Sun size={14} strokeWidth={1.6} /><span>Modo claro</span></>
                : <><Moon size={13} strokeWidth={1.6} /><span>Modo oscuro</span></>}
            </button>
          </nav>
        )}
      </header>
    </>
  )
}

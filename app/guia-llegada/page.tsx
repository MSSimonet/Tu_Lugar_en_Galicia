import { getNextMetadata } from '@/lib/seo/metadata'
import { GinaButton } from '@/components/shared/GinaButton'
import { APPS, CATEGORIAS } from '@/lib/config/apps'
import { AppCardPedraEOuro } from '@/components/guia/AppCardPedraEOuro'

export const metadata = getNextMetadata('guiaLlegada')

// Evita filas incompletas en pantallas grandes (ej. 4 tarjetas en grilla de 3 = 3+1 huérfana).
// Con 4 tarjetas se usan 2 columnas (2x2) en vez de 3 (3+1).
function lgColsForCount(n: number): string {
  if (n === 4) return 'lg:grid-cols-2'
  if (n <= 2) return 'lg:grid-cols-2'
  return 'lg:grid-cols-3'
}

export default function GuiaLlegadaPage() {
  return (
    <>
      {/* ── Hero — bookend fijo oscuro (Pedra e Ouro) ───────────────────────── */}
      <section
        className="px-[var(--space-6)] py-[var(--space-16)] md:py-[var(--space-24)]"
        style={{ backgroundColor: 'var(--po-hero-bg)' }}
        aria-labelledby="guia-heading"
      >
        <div className="mx-auto max-w-3xl">
          <div
            aria-hidden="true"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}
          >
            <span style={{ display: 'block', width: '32px', height: '1px', backgroundColor: 'var(--po-ouro)' }} />
            <span
              style={{
                fontFamily: 'var(--font-lato)',
                fontWeight: 700,
                fontSize: '11px',
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: 'var(--po-ouro)',
              }}
            >
              Guía de llegada
            </span>
          </div>
          <h1
            id="guia-heading"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontWeight: 900,
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.15,
              color: 'var(--po-hero-text)',
            }}
          >
            Tu kit digital para vivir en Galicia
          </h1>
          <p
            className="mt-[var(--space-6)] max-w-xl leading-[var(--leading-cuerpo)]"
            style={{ fontFamily: 'var(--font-lato)', fontSize: 'var(--text-md)', color: 'var(--po-hero-muted)' }}
          >
            Las apps y webs que usarás desde el primer día. Sin rodeos: qué es cada una y para qué la necesitás ahora mismo.
          </p>
        </div>
      </section>

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <section className="px-[var(--space-6)] py-[var(--space-8)]" style={{ backgroundColor: 'var(--po-luz)' }}>
        <div className="mx-auto max-w-3xl">
          <p
            className="text-[var(--text-sm)] leading-[var(--leading-cuerpo)]"
            style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)' }}
          >
            Llegar a Galicia implica navegar una burocracia nueva. Esta guía agrupa las herramientas
            digitales imprescindibles por categoría — identidad, salud, transporte, hogar y burocracia —
            para que sepas exactamente qué instalar en tu primer semana y para qué sirve cada cosa.
          </p>
        </div>
      </section>

      {/* ── Secciones por categoría ───────────────────────────────────────── */}
      <div style={{ backgroundColor: 'var(--po-areia)' }}>
        {CATEGORIAS.map((cat) => {
          const appsDeCategoria = APPS.filter((a) => a.categoria === cat.id)
          return (
            <section
              key={cat.id}
              className="px-[var(--space-6)] py-[var(--space-12)] md:py-[var(--space-16)]"
              aria-labelledby={`cat-${cat.id}`}
            >
              <div className="mx-auto max-w-5xl">
                {/* Encabezado de categoría */}
                <div className="mb-[var(--space-8)] flex items-baseline gap-[var(--space-4)]">
                  <h2
                    id={`cat-${cat.id}`}
                    style={{
                      fontFamily: 'var(--font-playfair)',
                      fontWeight: 700,
                      fontSize: 'var(--text-xl)',
                      color: 'var(--po-pedra)',
                      lineHeight: 'var(--leading-titulo)',
                    }}
                  >
                    {cat.label}
                  </h2>
                  <span
                    className="text-[var(--text-xs)] uppercase tracking-[var(--tracking-ui)]"
                    style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)' }}
                  >
                    {appsDeCategoria.length} {appsDeCategoria.length === 1 ? 'app' : 'apps'}
                  </span>
                </div>

                {/* Grid de cards */}
                <ul
                  className={`grid gap-[var(--space-4)] sm:grid-cols-2 ${lgColsForCount(appsDeCategoria.length)}`}
                  role="list"
                >
                  {appsDeCategoria.map((app) => (
                    <li key={app.nombre}>
                      <AppCardPedraEOuro app={app} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Separador entre secciones */}
              <div
                className="mx-auto mt-[var(--space-12)] max-w-5xl border-t md:mt-[var(--space-16)]"
                style={{ borderColor: 'var(--po-borde)' }}
                aria-hidden="true"
              />
            </section>
          )
        })}
      </div>

      {/* ── CTA final — bookend fijo oscuro (Pedra e Ouro) ──────────────────── */}
      <section
        className="px-[var(--space-6)] py-[var(--space-16)] md:py-[var(--space-24)]"
        style={{ backgroundColor: 'var(--po-hero-bg)' }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2
            style={{
              fontFamily: 'var(--font-playfair)',
              fontWeight: 700,
              fontSize: 'var(--text-xl)',
              color: 'var(--po-hero-text)',
              lineHeight: 'var(--leading-titulo)',
            }}
          >
            ¿Listo para dar el siguiente paso?
          </h2>
          <p
            className="mt-[var(--space-4)] text-[var(--text-sm)] leading-[var(--leading-cuerpo)]"
            style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-hero-muted)' }}
          >
            Las apps son el kit digital, pero encontrar el piso es el primer paso real.
            Cuéntanos tu caso y buscamos juntos tu hogar en Galicia.
          </p>
          <div className="mt-[var(--space-8)] flex justify-center">
            <GinaButton
              className="inline-flex items-center justify-center px-[var(--space-8)] py-[var(--space-4)] text-[var(--text-sm)] font-bold uppercase tracking-[0.10em] transition-brand focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                fontFamily: 'var(--font-lato)',
                borderRadius: '4px',
                backgroundColor: 'var(--po-ouro)',
                color: '#1A1410',
                outlineColor: 'var(--po-ouro)',
              }}
            >
              Cuéntame de ti
            </GinaButton>
          </div>
        </div>
      </section>
    </>
  )
}

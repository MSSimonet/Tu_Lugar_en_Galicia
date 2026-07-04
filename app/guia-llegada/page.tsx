import { getNextMetadata } from '@/lib/seo/metadata'
import { APPS, CATEGORIAS } from '@/lib/config/apps'
import { AppCard } from '@/components/guia/AppCard'

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
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="hero-gradient px-[var(--space-6)] py-[var(--space-16)] md:py-[var(--space-24)]"
        aria-labelledby="guia-heading"
      >
        <div className="mx-auto max-w-3xl">
          <p
            className="mb-[var(--space-4)] font-[family-name:var(--font-ui)] text-[var(--text-xs)] uppercase tracking-[var(--tracking-ui)]"
            style={{ color: 'var(--color-laton-claro)' }}
          >
            Guía de llegada
          </p>
          <h1
            id="guia-heading"
            className="font-[family-name:var(--font-titular)] leading-[var(--leading-titulo)]"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              color: 'var(--color-niebla)',
            }}
          >
            Tu kit digital para vivir en Galicia
          </h1>
          <p
            className="mt-[var(--space-6)] font-[family-name:var(--font-ui)] leading-[var(--leading-cuerpo)] max-w-xl"
            style={{ fontSize: 'var(--text-md)', color: 'var(--color-laton-claro)' }}
          >
            Las apps y webs que usarás desde el primer día. Sin rodeos: qué es cada una y para qué la necesitás ahora mismo.
          </p>
        </div>
      </section>

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <section className="bg-[var(--color-niebla)] px-[var(--space-6)] py-[var(--space-8)]">
        <div className="mx-auto max-w-3xl">
          <p
            className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] leading-[var(--leading-cuerpo)]"
            style={{ color: 'var(--color-pizarra)' }}
          >
            Llegar a Galicia implica navegar una burocracia nueva. Esta guía agrupa las herramientas
            digitales imprescindibles por categoría — identidad, salud, transporte, hogar y burocracia —
            para que sepas exactamente qué instalar en tu primer semana y para qué sirve cada cosa.
          </p>
        </div>
      </section>

      {/* ── Secciones por categoría ───────────────────────────────────────── */}
      <div className="bg-[var(--color-blanco)]">
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
                    className="font-[family-name:var(--font-titular)] leading-[var(--leading-titulo)]"
                    style={{
                      fontSize: 'var(--text-xl)',
                      color: 'var(--color-granito)',
                    }}
                  >
                    {cat.label}
                  </h2>
                  <span
                    className="font-[family-name:var(--font-ui)] text-[var(--text-xs)] uppercase tracking-[var(--tracking-ui)]"
                    style={{ color: 'var(--color-pizarra)' }}
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
                      <AppCard app={app} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Separador entre secciones */}
              <div
                className="mx-auto mt-[var(--space-12)] max-w-5xl border-t md:mt-[var(--space-16)]"
                style={{ borderColor: 'var(--color-arena)' }}
                aria-hidden="true"
              />
            </section>
          )
        })}
      </div>

      {/* ── CTA final ─────────────────────────────────────────────────────── */}
      <section
        className="px-[var(--space-6)] py-[var(--space-16)] md:py-[var(--space-24)]"
        style={{ backgroundColor: 'var(--color-arena)' }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2
            className="font-[family-name:var(--font-titular)] leading-[var(--leading-titulo)]"
            style={{ fontSize: 'var(--text-xl)', color: 'var(--color-granito)' }}
          >
            ¿Listo para dar el siguiente paso?
          </h2>
          <p
            className="mt-[var(--space-4)] font-[family-name:var(--font-ui)] text-[var(--text-sm)] leading-[var(--leading-cuerpo)]"
            style={{ color: 'var(--color-granito)' }}
          >
            Las apps son el kit digital, pero encontrar el piso es el primer paso real.
            Cuéntanos tu caso y buscamos juntos tu hogar en Galicia.
          </p>
          <div className="mt-[var(--space-8)] flex flex-col items-center gap-[var(--space-4)] sm:flex-row sm:justify-center">
            <a
              href="/conocernos"
              className="inline-flex items-center justify-center rounded-[var(--radius-pill)] px-[var(--space-8)] py-[var(--space-4)] font-[family-name:var(--font-ui)] text-[var(--text-sm)] font-medium uppercase tracking-[var(--tracking-ui)] text-white transition-brand hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: 'var(--color-laton)',
                outlineColor: 'var(--color-laton)',
              }}
            >
              Vamos a conocernos
            </a>
            <a
              href="/guia-llegada#cat-burocracia"
              className="inline-flex items-center justify-center rounded-[var(--radius-pill)] border px-[var(--space-8)] py-[var(--space-4)] font-[family-name:var(--font-ui)] text-[var(--text-sm)] font-medium uppercase tracking-[var(--tracking-ui)] transition-brand focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                borderColor: 'var(--color-laton)',
                color: 'var(--color-granito)',
                outlineColor: 'var(--color-laton)',
              }}
            >
              Ver trámites y burocracia
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

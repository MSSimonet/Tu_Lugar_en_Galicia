'use client'

import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { staggerContainer, fadeUp } from '@/lib/motion/variants'

/** Paleta del Hero. No es "color libre": cada tono mapea a tokens ya existentes.
 *  - `oscuro`: bookend Pedra e Ouro (--dz-hero-*) — /faq, /comunidad, /sobre-silvana.
 *  - `claro`:  fondo plano --dz-luz — /ciudades, que es la página índice y se lee
 *              distinto a propósito (decisión de marca, sesión 2026-07-26).
 *  - `apps`:   /apps-utiles conserva su sistema propio --au-*; el Hero no pinta
 *              fondo porque vive sobre el --au-bg de la página. */
export type PageHeroTone = 'oscuro' | 'claro' | 'apps'
export type PageHeroAlign = 'start' | 'center'

interface ToneTokens {
  background: string
  title: string
  subtitle: string
  /** Sólo la tipografía de UI cambia por tono; el display es el mismo en las 5. */
  uiFont: string
}

const TONOS: Record<PageHeroTone, ToneTokens> = {
  oscuro: {
    background: 'var(--dz-hero-bg)',
    title: 'var(--dz-hero-text)',
    subtitle: 'var(--dz-hero-muted)',
    uiFont: 'var(--font-dz-ui)',
  },
  claro: {
    background: 'var(--dz-luz)',
    title: 'var(--dz-ink)',
    subtitle: 'var(--dz-muted)',
    uiFont: 'var(--font-dz-ui)',
  },
  apps: {
    background: 'var(--dz-fondo-marco)',
    title: 'var(--au-hero-heading)',
    subtitle: 'var(--au-hero-body)',
    uiFont: 'var(--font-au-ui)',
  },
}

interface PageHeroProps {
  title: ReactNode
  eyebrow?: ReactNode
  subtitle?: ReactNode
  /** Bloque lateral opcional (foto, monograma). Se apila arriba del texto en
   *  móvil y pasa al costado desde `md`. Hoy sólo lo usa /sobre-silvana. */
  media?: ReactNode
  tone?: PageHeroTone
  align?: PageHeroAlign
  /** Ancho máximo del bloque de contenido, en px. Explícito y con `w-full`
   *  porque `mx-auto` dentro de un flex column produce shrink-to-fit: el bloque
   *  de /faq declaraba max-w-3xl (768px) y renderizaba 458px reales, distinto en
   *  cada página según el largo del texto (auditoría 2026-07-26, D4). */
  maxWidth?: number
  /** Baja el alto mínimo al segundo escalón (`.dz-hero-compact` en globals.css).
   *  Para las páginas cuyo Hero tiene poco contenido y arrastraba aire muerto:
   *  hoy /ciudades, /apps-utiles y /faq. Las tres siguen midiendo igual entre sí;
   *  /comunidad y /sobre-silvana se quedan en el escalón alto. */
  compact?: boolean
}

/** Hero único de las páginas interiores. Es dueño de la caja (padding vertical,
 *  alto mínimo, centrado) y del ritmo interno (eyebrow → H1 → subtítulo), que
 *  antes vivían copiados en 5 archivos y sólo coincidían por convención. */
export function PageHero({
  title,
  eyebrow,
  subtitle,
  media,
  tone = 'oscuro',
  align = 'start',
  maxWidth = 768,
  compact = false,
}: PageHeroProps) {
  const tokens = TONOS[tone]

  const texto = (
    <div>
      {eyebrow ? (
        <motion.div variants={fadeUp} className="mb-[var(--space-4)]">
          {eyebrow}
        </motion.div>
      ) : null}
      <motion.h1
        variants={fadeUp}
        style={{
          fontFamily: 'var(--font-dz-display)',
          fontSize: 'var(--dz-text-h1-compact)',
          fontWeight: 'var(--dz-weight-h1)',
          lineHeight: 'var(--dz-leading-h1)',
          letterSpacing: '-0.01em',
          color: tokens.title,
          margin: 'var(--dz-hero-title-gap) 0',
        }}
      >
        {title}
      </motion.h1>
      {subtitle ? (
        <motion.p
          variants={fadeUp}
          // 68ch: mismo tope de medida de línea que ya usa el cuerpo de
          // /sobre-silvana. Sin él, subir el subtítulo a --text-md dejaba
          // líneas de ~90 caracteres en los Hero anchos (/apps-utiles, 900px).
          className={[
            'leading-[var(--leading-cuerpo)] max-w-[68ch]',
            align === 'center' ? 'mx-auto' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            fontFamily: tokens.uiFont,
            // Token único para las 5 (mata D1) y responsive: --text-sm en móvil,
            // --text-md desde 768px. Definido en `.dz-hero` (app/globals.css).
            fontSize: 'var(--dz-hero-sub-size)',
            color: tokens.subtitle,
          }}
        >
          {subtitle}
        </motion.p>
      ) : null}
    </div>
  )

  return (
    <section
      className={[
        'dz-hero flex flex-col justify-center px-[var(--space-6)] py-[var(--dz-hero-pad-y)]',
        compact ? 'dz-hero-compact' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        // Fundido al fondo de página en la franja final del Hero, en vez del
        // corte seco que había antes. La última parada cae en el 100%, o sea
        // EXACTAMENTE en la frontera, así que el cuerpo sigue con el mismo color
        // y no queda ninguna costura: la transición deja de ser una línea y pasa
        // a ser una zona.
        //
        // Sirve para las cinco páginas con una sola regla porque los tres tonos
        // (`--dz-hero-bg`, `--dz-luz` y `--dz-fondo-marco`) resuelven al mismo
        // color en cada tema —#F7F5F0 en claro desde 2026-08-11 (antes #FFFFFF),
        // #1B1913 en oscuro— y las cinco apoyan sobre `--dz-fondo-pagina`. Y como
        // el degradado se escribe con tokens, el fundido acompaña al cambio de
        // tema sin nada más. Esa igualdad entre los tres tonos es la invariante
        // que hace que esto funcione: si algún día uno se separa, este degradado
        // deja de servir para las cinco.
        background: `linear-gradient(to bottom, ${tokens.background} 0, ${tokens.background} calc(100% - var(--dz-hero-fundido)), var(--dz-fondo-pagina) 100%)`,
        minHeight: 'var(--dz-hero-min-h)',
      }}
    >
      <motion.div
        className={[
          'mx-auto w-full',
          media ? 'flex flex-col gap-[var(--space-8)] md:flex-row-reverse md:items-center md:gap-[var(--space-12)]' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ maxWidth, textAlign: align === 'center' ? 'center' : undefined }}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {media ? (
          <motion.div variants={fadeUp} className="flex shrink-0 justify-center md:justify-end">
            {media}
          </motion.div>
        ) : null}
        {texto}
      </motion.div>
    </section>
  )
}

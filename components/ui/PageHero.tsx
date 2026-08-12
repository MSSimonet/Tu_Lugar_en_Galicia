'use client'

import type { ReactNode } from 'react'
import { Pause, Play } from 'lucide-react'
import { motion } from 'motion/react'
import { useVideoPauseToggle } from '@/lib/hooks/useVideoPauseToggle'
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
  /** Video de fondo. Cuando se pasa, el Hero deja de pintar el color de `tone` y
   *  monta el video + scrim; el texto pasa a la paleta clara fija (ver `SOBRE_VIDEO`). */
  video?: PageHeroVideo
}

interface PageHeroVideo {
  src: string
  /** Primer fotograma mientras el video carga. Opcional: sin él se ve el color
   *  de fondo de la sección, que ya es el mismo tono del scrim. */
  poster?: string
}

/** Paleta del Hero cuando hay video detrás. No sigue el tema: es fija clara en
 *  claro y oscuro, igual que el Hero de Inicio (--dz-hero-inicio-*). El motivo es
 *  el mismo: encima del video el texto no apoya sobre el fondo del tema sino sobre
 *  el scrim oscuro, así que invertirlo en modo claro dejaría el titular casi negro
 *  sobre negro. */
const SOBRE_VIDEO = {
  title: 'var(--dz-hero-inicio-text)',
  // No --dz-hero-inicio-muted (#9C9484): sobre el scrim da 2,03:1 y no llega ni
  // de cerca a AA. Este blanco roto al 92% mide ~5:1 contra el peor caso del
  // scrim (ver el cálculo en el gradiente de abajo).
  subtitle: 'rgba(243,239,228,0.92)',
  shadow: '0 2px 12px rgba(0,0,0,0.7)',
} as const

/** Scrim del Hero con video. Los tres tramos están elegidos por contraste medido,
 *  no a ojo: el tramo más claro es el 0,66 del centro, y ahí el peor caso posible
 *  —un fotograma blanco puro— compone rgb(98,98,98), que contra el titular
 *  #F3EFE4 da 5,36:1, por encima del 4,5:1 de AA. Cualquier fotograma más oscuro
 *  que blanco sólo mejora ese número, así que la legibilidad no depende de qué
 *  esté pasando en el video. Los extremos suben a 0,80/0,86 porque son las
 *  franjas donde el texto puede quedar más cerca del borde. */
const SCRIM_VIDEO = [
  'linear-gradient(to bottom,',
  'rgba(11,16,18,0.80) 0%,',
  'rgba(11,16,18,0.66) 50%,',
  'rgba(11,16,18,0.86) 100%)',
].join(' ')

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
  video,
}: PageHeroProps) {
  const tokens = TONOS[tone]
  const { videoRef, isPlaying, toggle } = useVideoPauseToggle()
  const colorTitulo = video ? SOBRE_VIDEO.title : tokens.title
  const colorSubtitulo = video ? SOBRE_VIDEO.subtitle : tokens.subtitle
  const sombraTexto = video ? SOBRE_VIDEO.shadow : undefined

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
          color: colorTitulo,
          textShadow: sombraTexto,
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
            color: colorSubtitulo,
            textShadow: sombraTexto,
          }}
        >
          {subtitle}
        </motion.p>
      ) : null}
    </div>
  )

  // Con video el fondo lo pone la capa de abajo, no el `background` de la sección:
  // el degradado de fundido pasa a ser una capa más encima del scrim, para que la
  // frontera con el cuerpo siga siendo una zona y no una costura (misma invariante
  // que se explica abajo, ahora resuelta en otro plano).
  const capaVideo = video ? (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster={video.poster}
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
        tabIndex={-1}
      >
        <source src={video.src} type="video/mp4" />
      </video>
      <div className="absolute inset-0" style={{ background: SCRIM_VIDEO }} />
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: 'var(--dz-hero-fundido)',
          background: 'linear-gradient(to bottom, transparent 0, var(--dz-fondo-pagina) 100%)',
        }}
      />
    </div>
  ) : null

  return (
    <section
      className={[
        'dz-hero flex flex-col justify-center px-[var(--space-6)] py-[var(--dz-hero-pad-y)]',
        compact ? 'dz-hero-compact' : '',
        video ? 'relative isolate overflow-hidden' : '',
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
        background: video
          ? 'var(--dz-hero-inicio-bg)'
          : `linear-gradient(to bottom, ${tokens.background} 0, ${tokens.background} calc(100% - var(--dz-hero-fundido)), var(--dz-fondo-pagina) 100%)`,
        minHeight: 'var(--dz-hero-min-h)',
      }}
    >
      {capaVideo}

      {video ? (
        // WCAG 2.2.2: todo video en autoplay+loop necesita un control de pausa
        // visible. Mismo control, mismo tamaño y misma posición que en el Hero de
        // Inicio y en el de las páginas de ciudad.
        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? 'Pausar video de fondo' : 'Reproducir video de fondo'}
          className="absolute bottom-4 right-4 z-10 flex items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dz-accent)]"
          style={{
            width: '40px',
            height: '40px',
            background: 'rgba(0,0,0,0.45)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: 'var(--dz-hero-inicio-text)',
            cursor: 'pointer',
          }}
        >
          {isPlaying ? <Pause size={16} strokeWidth={1.8} /> : <Play size={16} strokeWidth={1.8} />}
        </button>
      ) : null}

      <motion.div
        className={[
          'mx-auto w-full',
          video ? 'relative z-10' : '',
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

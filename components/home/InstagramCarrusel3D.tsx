'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BRAND_EASE } from '@/lib/motion/variants';
import type { InstagramPost } from '@/lib/instagram/posts';

// Cover-flow 3D: la activa queda centrada y grande, las adyacentes más chicas y rotadas hacia
// los costados (offset ±1, ±2 visibles; más allá se oculta). Diferenciado a propósito del
// futuro carrusel de "Casos de éxito" (no existe todavía, ver conversación): formato cuadrado
// 1:1 nativo de Instagram en vez de retrato, anillo dorado (--po-ouro) solo en la tarjeta
// activa, y autoplay con pausa explícita en vez de solo-manual — si casos de éxito termina
// siendo solo-manual, esta sigue distinguiéndose por formato y color.
//
// Solo transform/opacity animados (x %, scale, rotateY, opacity) — nunca width/height/margin,
// para no disparar layout shift (skill motion-tu-lugar-en-galicia). El offset se expresa en %
// del propio ancho de cada tarjeta, no en px: así el cover-flow escala solo en cada breakpoint
// sin medir el DOM a mano.

const AUTOPLAY_MS = 4500;

const OFFSET_CONFIG = [
  { x: 0, scale: 1.18, rotate: 0, opacity: 1 },
  { x: 62, scale: 0.86, rotate: 32, opacity: 0.55 },
  { x: 108, scale: 0.62, rotate: 42, opacity: 0.28 },
] as const;

function signedOffset(index: number, active: number, total: number): number {
  let diff = index - active;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
}

interface InstagramCarrusel3DProps {
  posts: InstagramPost[];
}

export function InstagramCarrusel3D({ posts }: InstagramCarrusel3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const total = posts.length;

  const goTo = useCallback(
    (index: number) => setActiveIndex(((index % total) + total) % total),
    [total],
  );
  const siguiente = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const anterior = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Sin autoplay si el usuario lo pausó, si está interactuando (hover/foco), o si prefiere
  // menos movimiento — prefers-reduced-motion desactiva el auto-avance entero, no solo la
  // curva de transición (skill motion-tu-lugar-en-galicia).
  const autoplayHabilitado = total > 1 && !userPaused && !isHovering && !isFocusedWithin && !prefersReducedMotion;

  useEffect(() => {
    if (!autoplayHabilitado) return;
    const id = setInterval(() => setActiveIndex((i) => (i + 1) % total), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [autoplayHabilitado, total]);

  const activo = posts[activeIndex];

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocus={() => setIsFocusedWithin(true)}
      onBlur={() => setIsFocusedWithin(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') anterior();
        if (e.key === 'ArrowRight') siguiente();
      }}
    >
      <div
        className="relative mx-auto h-[220px] max-w-2xl sm:h-[260px] md:h-[300px]"
        style={{ perspective: '1200px' }}
      >
        {posts.map((post, i) => {
          const offset = signedOffset(i, activeIndex, total);
          const abs = Math.abs(offset);
          const visible = abs <= 2;
          const cfg = OFFSET_CONFIG[Math.min(abs, 2)];
          const sign = Math.sign(offset);
          const isActive = offset === 0;

          return (
            <div
              key={post.id}
              className="absolute inset-0 flex items-center justify-center"
              style={{ zIndex: 30 - abs }}
            >
              <motion.button
                type="button"
                onClick={() => goTo(i)}
                animate={{
                  x: `${sign * cfg.x}%`,
                  scale: cfg.scale,
                  rotateY: sign * -cfg.rotate,
                  opacity: visible ? cfg.opacity : 0,
                }}
                transition={{ duration: 0.4, ease: BRAND_EASE }}
                style={{ pointerEvents: visible ? 'auto' : 'none' }}
                aria-hidden={!visible}
                tabIndex={-1}
                aria-label={`Ver publicación ${i + 1} de ${total}${post.caption ? `: ${post.caption.slice(0, 60)}` : ''}`}
                className={[
                  'relative aspect-square w-[38vw] max-w-[200px] overflow-hidden rounded-[4px]',
                  isActive ? 'ring-2 ring-[var(--po-ouro)]' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <Image
                  src={post.imageUrl}
                  alt={post.caption ? post.caption.slice(0, 140) : 'Publicación de Instagram'}
                  fill
                  sizes="(min-width: 768px) 200px, 38vw"
                  className="object-cover"
                />
                {post.isVideo && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="absolute right-2 top-2 h-5 w-5 drop-shadow"
                    style={{ color: 'var(--po-luz)' }}
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </motion.button>
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <div className="mt-[var(--space-4)] flex items-center justify-center gap-[var(--space-4)]">
          <button
            type="button"
            onClick={anterior}
            aria-label="Publicación anterior"
            className="transition-brand [font-size:var(--text-lg)] hover:opacity-70"
            style={{ color: 'var(--po-pedra)' }}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setUserPaused((v) => !v)}
            aria-label={userPaused ? 'Reanudar carrusel' : 'Pausar carrusel'}
            className="transition-brand [font-size:var(--text-xs)] uppercase tracking-[var(--tracking-ui)] hover:opacity-70"
            style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)' }}
          >
            {userPaused ? 'Reanudar' : 'Pausar'}
          </button>
          <button
            type="button"
            onClick={siguiente}
            aria-label="Publicación siguiente"
            className="transition-brand [font-size:var(--text-lg)] hover:opacity-70"
            style={{ color: 'var(--po-pedra)' }}
          >
            ›
          </button>
        </div>
      )}

      <div aria-live="polite" className="mt-[var(--space-4)] text-center">
        <AnimatePresence mode="wait">
          {activo?.caption && (
            <motion.p
              key={activo.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: BRAND_EASE }}
              className="line-clamp-2 [font-size:var(--text-xs)]"
              style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)' }}
            >
              {activo.caption}
            </motion.p>
          )}
        </AnimatePresence>
        {activo && (
          <a
            href={activo.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-[var(--space-2)] inline-block [font-size:var(--text-xs)] underline"
            style={{ color: 'var(--po-ouro-text)', textUnderlineOffset: '3px' }}
          >
            Ver en Instagram
          </a>
        )}
      </div>
    </div>
  );
}

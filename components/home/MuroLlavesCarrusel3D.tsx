'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BRAND_EASE } from '@/lib/motion/variants';

// Cover-flow 3D: la foto activa queda centrada y grande, las adyacentes más chicas y rotadas
// hacia los costados (offset ±1, ±2 visibles; más allá se oculta).
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

export interface FotoMuroLlaves {
  src: string;
  alt: string;
}

interface MuroLlavesCarrusel3DProps {
  fotos: FotoMuroLlaves[];
}

export function MuroLlavesCarrusel3D({ fotos }: MuroLlavesCarrusel3DProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const total = fotos.length;

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

  const activa = fotos[activeIndex];

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
        className="relative h-[300px] w-full sm:h-[380px] md:h-[460px]"
        style={{ perspective: '1200px' }}
      >
        {fotos.map((foto, i) => {
          const offset = signedOffset(i, activeIndex, total);
          const abs = Math.abs(offset);
          const visible = abs <= 2;
          const cfg = OFFSET_CONFIG[Math.min(abs, 2)];
          const sign = Math.sign(offset);
          const isActive = offset === 0;

          return (
            <div
              key={foto.src}
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
                aria-label={`Ver foto ${i + 1} de ${total}: ${foto.alt}`}
                className={[
                  'relative aspect-square w-[46vw] max-w-[320px] overflow-hidden rounded-[4px]',
                  isActive ? 'ring-2 ring-[var(--po-ouro)]' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <Image
                  src={foto.src}
                  alt={foto.alt}
                  fill
                  sizes="(min-width: 768px) 320px, 46vw"
                  className="object-cover"
                />
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
            aria-label="Foto anterior"
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
            aria-label="Foto siguiente"
            className="transition-brand [font-size:var(--text-lg)] hover:opacity-70"
            style={{ color: 'var(--po-pedra)' }}
          >
            ›
          </button>
        </div>
      )}

      <div aria-live="polite" className="mt-[var(--space-4)] text-center">
        <AnimatePresence mode="wait">
          {activa && (
            <motion.p
              key={activa.src}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: BRAND_EASE }}
              className="line-clamp-2 [font-size:var(--text-xs)]"
              style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-muted)' }}
            >
              {activa.alt}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

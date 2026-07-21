"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { animate, useReducedMotion, type AnimationPlaybackControls } from "motion/react";

// Tira continua con las fotos reales del muro de llaves — reemplaza al carrusel 3D cover-flow
// (fidelidad al mockup design-drafts/deslumbrante). Track duplicado + traslación lineal
// infinita (motion.animate imperativo, sin GSAP: no hay scroll de por medio, solo un loop).
// Con prefers-reduced-motion: fila estática única, sin duplicar ni animar.

const DURACION_S = 22;

export interface FotoMuroLlaves {
  src: string;
  alt: string;
}

export function MuroLlavesMarquee({ fotos }: { fotos: FotoMuroLlaves[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    if (!track || prefersReducedMotion) return;
    const mitad = track.scrollWidth / 2;
    controlsRef.current = animate(track, { x: [0, -mitad] }, {
      duration: DURACION_S,
      ease: "linear",
      repeat: Infinity,
    });
    return () => controlsRef.current?.stop();
  }, [prefersReducedMotion, fotos]);

  const fotosVisibles = prefersReducedMotion ? fotos : [...fotos, ...fotos];

  return (
    <div
      onMouseEnter={() => controlsRef.current?.pause()}
      onMouseLeave={() => controlsRef.current?.play()}
    >
      <style>{`
        .muro-marquee-viewport {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        }
        .muro-marquee-track { display: flex; gap: var(--space-4); width: max-content; }
      `}</style>
      <div className="muro-marquee-viewport">
        <div ref={trackRef} className="muro-marquee-track" aria-hidden="true">
          {fotosVisibles.map((foto, i) => (
            <div
              key={`${foto.src}-${i}`}
              className="relative shrink-0 overflow-hidden"
              style={{ width: 207, height: 207, borderRadius: 14 }}
            >
              <Image src={foto.src} alt="" fill sizes="207px" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
      {/* La tira visual es decorativa (aria-hidden, fotos duplicadas para el loop) — el
          contenido real queda accesible en esta lista, no en el marquee. */}
      <ul className="sr-only">
        {fotos.map((foto) => (
          <li key={foto.src}>{foto.alt}</li>
        ))}
      </ul>
    </div>
  );
}

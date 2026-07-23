"use client";

import { useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";

// Tamaño de despliegue del PNG (public/images/avion-divider-v2.png, 1024x703) — se
// preserva la proporción nativa exacta, nunca se estira/deforma. Nombre "-v2": el
// archivo original (avion-divider.png) quedó pisado por caché del optimizador de
// Next.js/navegador tras corregirle la transparencia — renombrar fue la forma
// confiable de invalidar cualquier URL cacheada de la versión sin alpha real.
const ICON_WIDTH = 64;
const ICON_HEIGHT = Math.round((ICON_WIDTH * 703) / 1024);

export interface AnimatedDividerProps {
  /** "ltr" (default): arranca en el borde izquierdo, primer tramo vuela a la derecha.
   *  "rtl": arranca en el borde derecho, primer tramo vuela a la izquierda. Misma
   *  lógica de ida-vuelta con giro en ambos casos, solo cambia el punto de partida. */
  direction?: "ltr" | "rtl";
}

const RECORRIDO_DURATION = 15; // segundos por tramo — vuelo tranquilo, no apurado
const GIRO_DURATION = 0.5; // segundos — giro de 180° visible y gradual, no instantáneo
const WOBBLE_DURATION = 2; // segundos — turbulencia suave
const WOBBLE_AMPLITUDE = 2; // px hacia cada lado (~4px de rango total)

// Separador decorativo entre secciones — un avión (PNG real, fondo transparente) que
// recorre una línea fina en loop infinito: vuela de un borde al otro, gira 180° en
// el borde, vuela de vuelta, gira de nuevo. Movimiento propio, no atado al scroll.
export function AnimatedDivider({ direction = "ltr" }: AnimatedDividerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const empiezaDerecha = direction === "rtl";

  useGSAP(
    () => {
      if (prefersReducedMotion || !containerRef.current || !iconRef.current) return;
      const container = containerRef.current;
      const icon = iconRef.current;
      const distancia = container.offsetWidth - icon.offsetWidth;

      const xInicial = empiezaDerecha ? distancia : 0;
      const xFinal = empiezaDerecha ? 0 : distancia;
      const rotInicial = empiezaDerecha ? 180 : 0;
      const rotFinal = empiezaDerecha ? 0 : 180;

      gsap.set(icon, { x: xInicial, rotateY: rotInicial, transformPerspective: 800 });

      // Ciclo: vuela → gira 180° → vuela (dirección opuesta) → gira 180° → repite.
      const ciclo = gsap.timeline({ repeat: -1 });
      ciclo
        .to(icon, { x: xFinal, duration: RECORRIDO_DURATION, ease: "sine.inOut" })
        .to(icon, { rotateY: rotFinal, duration: GIRO_DURATION, ease: "power1.inOut" })
        .to(icon, { x: xInicial, duration: RECORRIDO_DURATION, ease: "sine.inOut" })
        .to(icon, { rotateY: rotInicial, duration: GIRO_DURATION, ease: "power1.inOut" });

      // Oscilación vertical leve — turbulencia suave, independiente del recorrido horizontal.
      gsap.fromTo(
        icon,
        { y: -WOBBLE_AMPLITUDE },
        { y: WOBBLE_AMPLITUDE, duration: WOBBLE_DURATION, ease: "sine.inOut", repeat: -1, yoyo: true }
      );
    },
    { scope: containerRef, dependencies: [prefersReducedMotion, empiezaDerecha] }
  );

  return (
    <div aria-hidden="true" style={{ padding: "var(--space-8) 0" }}>
      <div
        ref={containerRef}
        className="relative mx-auto max-w-6xl px-[var(--space-6)]"
        style={{ height: "56px" }}
      >
        <div
          className="absolute left-[var(--space-6)] right-[var(--space-6)] top-1/2"
          style={{ height: "1px", backgroundColor: "var(--dz-borde)", transform: "translateY(-50%)" }}
        />
        {prefersReducedMotion ? (
          <div
            className="absolute top-1/2 left-1/2"
            style={{ transform: `translate(-50%, -50%) ${empiezaDerecha ? "scaleX(-1)" : ""}` }}
          >
            <Image src="/images/avion-divider-v2.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
          </div>
        ) : (
          <div ref={iconRef} className="absolute" style={{ left: 0, top: `calc(50% - ${ICON_HEIGHT / 2}px)` }}>
            <Image src="/images/avion-divider-v2.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
          </div>
        )}
      </div>
    </div>
  );
}

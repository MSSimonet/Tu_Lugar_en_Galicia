"use client";

import { useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { useFlightWithWake } from "@/lib/gsap/useFlightWithWake";

// Tamaño de despliegue del PNG (public/images/avion-divider-v3.png) — se
// preserva la proporción nativa exacta, nunca se estira/deforma. Nombre "-v2": el
// archivo original (avion-divider.png) quedó pisado por caché del optimizador de
// Next.js/navegador tras corregirle la transparencia — renombrar fue la forma
// confiable de invalidar cualquier URL cacheada de la versión sin alpha real.
const ICON_HEIGHT = 44; // mismo alto ya vigente (64×703/1024 ≈ 44), sin cambios de escala
const ICON_WIDTH = Math.round((ICON_HEIGHT * 702) / 512); // aspecto nativo de avion-divider-v3.png

export interface AnimatedDividerProps {
  /** "ltr" (default): arranca en el borde izquierdo, primer tramo vuela a la derecha.
   *  "rtl": arranca en el borde derecho, primer tramo vuela a la izquierda. Misma
   *  lógica de ida-vuelta con giro en ambos casos, solo cambia el punto de partida. */
  direction?: "ltr" | "rtl";
}

// Separador decorativo entre secciones — un avión (PNG real, fondo transparente) que
// recorre una línea fina en loop infinito: vuela de un borde al otro, gira 180° en
// el borde, vuela de vuelta, gira de nuevo, dejando una estela punteada que se
// desvanece. Movimiento propio, no atado al scroll. Motor compartido con
// MaletasDivider — ver lib/gsap/useFlightWithWake.ts.
export function AnimatedDivider({ direction = "ltr" }: AnimatedDividerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const estelaRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const empiezaDerecha = direction === "rtl";

  useFlightWithWake(containerRef, iconRef, estelaRef, {
    empiezaDerecha,
    estelaMax: 210, // +5% (pedido explícito)
    skip: !!prefersReducedMotion,
  });

  return (
    <div aria-hidden="true" style={{ padding: "var(--space-8) 0" }}>
      <style>{`
        .ad-estela {
          background-image: repeating-linear-gradient(to right, var(--dz-accent) 0 3px, transparent 3px 8px);
        }
        .ad-estela[data-dir="derecha"] { -webkit-mask-image: linear-gradient(to left, black 0%, transparent 100%); mask-image: linear-gradient(to left, black 0%, transparent 100%); }
        .ad-estela[data-dir="izquierda"] { -webkit-mask-image: linear-gradient(to right, black 0%, transparent 100%); mask-image: linear-gradient(to right, black 0%, transparent 100%); }
      `}</style>
      <div
        ref={containerRef}
        className="relative mx-auto max-w-6xl px-[var(--space-6)]"
        style={{ height: "56px", overflow: "hidden" }}
      >
        {prefersReducedMotion ? (
          <div
            className="absolute top-1/2 left-1/2"
            style={{ transform: `translate(-50%, -50%) ${empiezaDerecha ? "scaleX(-1)" : ""}` }}
          >
            <Image src="/images/avion-divider-v3.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
          </div>
        ) : (
          <>
            <div
              ref={estelaRef}
              className="ad-estela absolute"
              data-dir={empiezaDerecha ? "izquierda" : "derecha"}
              style={{ left: 0, top: "calc(50% - 1.03px)", height: "2.06px", width: 0 }}
            />
            <div ref={iconRef} className="absolute" style={{ left: 0, top: `calc(50% - ${ICON_HEIGHT / 2}px)` }}>
              <Image src="/images/avion-divider-v3.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { useFlightWithWake } from "@/lib/gsap/useFlightWithWake";

// Separador con las 4 maletas (public/images/maletas-divider-v3.png) — mismo
// motor de animación que components/ui/AnimatedDivider.tsx
// (lib/gsap/useFlightWithWake.ts). Fuente: foto real del usuario (maletas.png,
// cobre sobre fondo negro) — recortada (fondo transparente) y recoloreada al
// naranja/ámbar de marca (--dz-accent) para que quede en la misma familia
// visual que el avión. Vivía en Comunidad; se reubicó a Cómo Funciona (ese
// lugar ahora usa gente.png) — mismo comportamiento y estilo, solo cambió la
// ubicación, por eso pasó a components/ui junto al resto de los separadores
// compartidos.

const ICON_HEIGHT = 44;
const ICON_WIDTH = Math.round((ICON_HEIGHT * 755) / 512); // aspecto nativo de maletas-divider-v3.png

export interface MaletasDividerProps {
  /** "ltr" (default): arranca en el borde izquierdo, primer tramo vuela a la derecha.
   *  "rtl": arranca en el borde derecho, primer tramo vuela a la izquierda. */
  direction?: "ltr" | "rtl";
}

export function MaletasDivider({ direction = "ltr" }: MaletasDividerProps) {
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
    <div aria-hidden="true" style={{ padding: "var(--space-6) 0" }}>
      <style>{`
        .mld-estela {
          background-image: repeating-linear-gradient(to right, var(--dz-accent) 0 3px, transparent 3px 8px);
        }
        .mld-estela[data-dir="derecha"] { -webkit-mask-image: linear-gradient(to left, black 0%, transparent 100%); mask-image: linear-gradient(to left, black 0%, transparent 100%); }
        .mld-estela[data-dir="izquierda"] { -webkit-mask-image: linear-gradient(to right, black 0%, transparent 100%); mask-image: linear-gradient(to right, black 0%, transparent 100%); }
      `}</style>
      <div
        ref={containerRef}
        className="relative mx-auto max-w-6xl px-[var(--space-6)]"
        style={{ height: "64px", overflow: "hidden" }}
      >
        {prefersReducedMotion ? (
          <div
            className="absolute top-1/2 left-1/2"
            style={{ transform: `translate(-50%, -50%) ${empiezaDerecha ? "scaleX(-1)" : ""}` }}
          >
            <Image src="/images/maletas-divider-v3.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
          </div>
        ) : (
          <>
            <div
              ref={estelaRef}
              className="mld-estela absolute"
              data-dir={empiezaDerecha ? "izquierda" : "derecha"}
              style={{ left: 0, top: "calc(50% - 1.03px)", height: "2.06px", width: 0 }}
            />
            <div ref={iconRef} className="absolute" style={{ left: 0, top: `calc(50% - ${ICON_HEIGHT / 2}px)` }}>
              <Image src="/images/maletas-divider-v3.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

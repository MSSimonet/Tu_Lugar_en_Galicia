"use client";

import { useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { useFlightWithWake } from "@/lib/gsap/useFlightWithWake";

// Separador de la sección Comunidad — mismo motor de animación que
// components/ui/AnimatedDivider.tsx (lib/gsap/useFlightWithWake.ts). Reemplaza
// a MaletasDivider (reubicado a Cómo Funciona) con el ícono de gente
// (public/images/gente-divider-v2.png). Fuente: foto real del usuario
// (gente.png, cobre sobre fondo negro) — recortada (fondo transparente) y
// recoloreada al naranja/ámbar de marca (--dz-accent) para que quede en la
// misma familia visual que el avión; la única excepción es la brújula, que
// por decisión previa mantiene sus colores originales. `gira: false`: se
// traslada sin rotar, mantiene su orientación fija — igual que la brújula.
//
const ICON_HEIGHT = 44;
const ICON_WIDTH = Math.round((ICON_HEIGHT * 633) / 512); // aspecto nativo de gente-divider-v2.png

export interface GenteDividerProps {
  /** "ltr" (default): arranca en el borde izquierdo, primer tramo vuela a la derecha.
   *  "rtl": arranca en el borde derecho, primer tramo vuela a la izquierda. */
  direction?: "ltr" | "rtl";
}

export function GenteDivider({ direction = "ltr" }: GenteDividerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const estelaRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const empiezaDerecha = direction === "rtl";

  useFlightWithWake(containerRef, iconRef, estelaRef, {
    empiezaDerecha,
    estelaMax: 210, // +5% (pedido explícito)
    gira: false,
    skip: !!prefersReducedMotion,
  });

  return (
    <div aria-hidden="true" style={{ padding: "var(--space-6) 0" }}>
      <style>{`
        .gtd-estela {
          background-image: repeating-linear-gradient(to right, var(--dz-accent) 0 3px, transparent 3px 8px);
        }
        .gtd-estela[data-dir="derecha"] { -webkit-mask-image: linear-gradient(to left, black 0%, transparent 100%); mask-image: linear-gradient(to left, black 0%, transparent 100%); }
        .gtd-estela[data-dir="izquierda"] { -webkit-mask-image: linear-gradient(to right, black 0%, transparent 100%); mask-image: linear-gradient(to right, black 0%, transparent 100%); }
      `}</style>
      <div
        ref={containerRef}
        className="relative mx-auto max-w-6xl px-[var(--space-6)]"
        style={{ height: "64px", overflow: "hidden" }}
      >
        {prefersReducedMotion ? (
          <div className="absolute top-1/2 left-1/2" style={{ transform: "translate(-50%, -50%)" }}>
            <Image src="/images/gente-divider-v2.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
          </div>
        ) : (
          <>
            <div
              ref={estelaRef}
              className="gtd-estela absolute"
              data-dir={empiezaDerecha ? "izquierda" : "derecha"}
              style={{ left: 0, top: "calc(50% - 1.03px)", height: "2.06px", width: 0 }}
            />
            <div ref={iconRef} className="absolute" style={{ left: 0, top: `calc(50% - ${ICON_HEIGHT / 2}px)` }}>
              <Image src="/images/gente-divider-v2.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

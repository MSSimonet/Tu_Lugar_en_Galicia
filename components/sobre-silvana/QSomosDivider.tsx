"use client";

import { useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { useFlightWithWake } from "@/lib/gsap/useFlightWithWake";

// Separador de la sección Quiénes Somos (/sobre-silvana) — mismo motor de
// animación que components/ui/AnimatedDivider.tsx
// (lib/gsap/useFlightWithWake.ts), con el medallón
// (public/images/q-somos-divider-v2.png) en vez del avión. Fuente: imagen real
// del usuario, fondo negro sólido removido (alpha real) — a pedido explícito
// del usuario esta vez se mantiene el color de cobre/tierra tal cual salió
// de la foto, sin recolorear al dorado del resto de los separadores.
// `gira: false`: se traslada sin rotar, mantiene su orientación fija.
//
const ICON_HEIGHT = 44;
const ICON_WIDTH = Math.round((ICON_HEIGHT * 519) / 512); // aspecto nativo de q-somos-divider-v2.png

export interface QSomosDividerProps {
  /** "ltr" (default): arranca en el borde izquierdo, primer tramo vuela a la derecha.
   *  "rtl": arranca en el borde derecho, primer tramo vuela a la izquierda. */
  direction?: "ltr" | "rtl";
}

export function QSomosDivider({ direction = "ltr" }: QSomosDividerProps) {
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
        .qsd-estela {
          background-image: repeating-linear-gradient(to right, var(--dz-accent) 0 3px, transparent 3px 8px);
        }
        .qsd-estela[data-dir="derecha"] { -webkit-mask-image: linear-gradient(to left, black 0%, transparent 100%); mask-image: linear-gradient(to left, black 0%, transparent 100%); }
        .qsd-estela[data-dir="izquierda"] { -webkit-mask-image: linear-gradient(to right, black 0%, transparent 100%); mask-image: linear-gradient(to right, black 0%, transparent 100%); }
      `}</style>
      <div
        ref={containerRef}
        className="relative mx-auto max-w-6xl px-[var(--space-6)]"
        style={{ height: "64px", overflow: "hidden" }}
      >
        {prefersReducedMotion ? (
          <div className="absolute top-1/2 left-1/2" style={{ transform: "translate(-50%, -50%)" }}>
            <Image src="/images/q-somos-divider-v2.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
          </div>
        ) : (
          <>
            <div
              ref={estelaRef}
              className="qsd-estela absolute"
              data-dir={empiezaDerecha ? "izquierda" : "derecha"}
              style={{ left: 0, top: "calc(50% - 1.03px)", height: "2.06px", width: 0 }}
            />
            <div ref={iconRef} className="absolute" style={{ left: 0, top: `calc(50% - ${ICON_HEIGHT / 2}px)` }}>
              <Image src="/images/q-somos-divider-v2.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

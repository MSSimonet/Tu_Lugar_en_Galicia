"use client";

import { useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { useFlightWithWake, DIVIDER_MARGEN_LATERAL, DIVIDER_WOBBLE_AMPLITUDE } from "@/lib/gsap/useFlightWithWake";

// Separador de la sección Ciudades — mismo motor de animación que
// components/ui/AnimatedDivider.tsx (lib/gsap/useFlightWithWake.ts: línea fina +
// recorrido de borde a borde + oscilación vertical + estela punteada). Antes
// mostraba una rosa de los vientos recoloreada a var(--dz-accent)
// (RosaVientosDivider, reemplazada); ahora una brújula tipo reloj con marco de
// cobre real (public/images/brujula-divider-v3.png, foto del usuario con fondo
// removido — "-v2" porque brujula-divider.png era una versión previa gris sin
// los colores reales). Aguja en dos tonos — rojo apagado + gris — sobre marco
// cobre; colores tal cual la foto original, sin recolorear al ámbar del theme.
// `gira: false`: se traslada sin rotar, mantiene su orientación fija.
//
// Ancho: recorre casi todo el ancho de la página — las puntas del recorrido
// llegan a 2cm de cada borde (DIVIDER_MARGEN_LATERAL, compartida por los 5
// separadores). Se logra con el truco de "full-bleed" (margin-left negativo
// basado en vw) en vez de max-w/mx-auto.

const ICON_HEIGHT = Math.round(44 * 1.05); // mismo tamaño ya vigente, sin cambios
const ICON_WIDTH = Math.round((ICON_HEIGHT * 510) / 512); // aspecto nativo de brujula-divider-v3.png
// Alto mínimo del contenedor sin recortar el ícono en los extremos del wobble
// vertical (pedido explícito: la sección no debe dejar espacio sobrante).
const CONTAINER_HEIGHT = ICON_HEIGHT + 2 * DIVIDER_WOBBLE_AMPLITUDE;

export interface BrujulaDividerProps {
  /** "ltr" (default): arranca en el borde izquierdo, primer tramo vuela a la derecha.
   *  "rtl": arranca en el borde derecho, primer tramo vuela a la izquierda. */
  direction?: "ltr" | "rtl";
}

export function BrujulaDivider({ direction = "ltr" }: BrujulaDividerProps) {
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
    <div aria-hidden="true" style={{ paddingLeft: DIVIDER_MARGEN_LATERAL, paddingRight: DIVIDER_MARGEN_LATERAL }}>
      <style>{`
        .bjd-estela {
          background-image: repeating-linear-gradient(to right, var(--dz-accent) 0 3px, transparent 3px 8px);
        }
        .bjd-estela[data-dir="derecha"] { -webkit-mask-image: linear-gradient(to left, black 0%, transparent 100%); mask-image: linear-gradient(to left, black 0%, transparent 100%); }
        .bjd-estela[data-dir="izquierda"] { -webkit-mask-image: linear-gradient(to right, black 0%, transparent 100%); mask-image: linear-gradient(to right, black 0%, transparent 100%); }
      `}</style>
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${CONTAINER_HEIGHT}px`, width: "100%", overflow: "hidden" }}
      >
        {prefersReducedMotion ? (
          <div className="absolute top-1/2 left-1/2" style={{ transform: "translate(-50%, -50%)" }}>
            <Image src="/images/brujula-divider-v3.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
          </div>
        ) : (
          <>
            <div ref={estelaRef} className="bjd-estela absolute" data-dir={empiezaDerecha ? "izquierda" : "derecha"} style={{ left: 0, top: "calc(50% - 1.133px)", height: "2.266px", width: 0 }} />
            <div ref={iconRef} className="absolute" style={{ left: 0, top: `calc(50% - ${ICON_HEIGHT / 2}px)` }}>
              <Image src="/images/brujula-divider-v3.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

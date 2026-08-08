"use client";

import { useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { useFlightWithWake, apoyoEnFrontera, DIVIDER_MARGEN_LATERAL, DIVIDER_WOBBLE_AMPLITUDE } from "@/lib/gsap/useFlightWithWake";

// Separador de la sección Quiénes Somos (/sobre-silvana) — mismo motor de
// animación que components/ui/AnimatedDivider.tsx
// (lib/gsap/useFlightWithWake.ts), con el medallón
// (public/images/q-somos-divider-v3.png) en vez del avión. Fuente: imagen real
// del usuario (aldaba_texto.png), fondo BLANCO removido con alfa real — ojo, las
// versiones anteriores venían sobre negro y el método es distinto: acá el blanco
// también aparece DENTRO del hueco del aro, así que se recorta por relleno desde
// los bordes más detección de huecos, no por umbral.
//
// Se mantiene el color dorado tal cual salió de la foto, sin recolorear al ámbar
// del theme — mismo criterio que la brújula de Ciudades.
// `gira: false`: se traslada sin rotar, mantiene su orientación fija.
//
const ICON_HEIGHT = 44;
// Aspecto nativo de q-somos-divider-v3.png. Esta constante hay que actualizarla
// SIEMPRE que se sustituya el archivo, o el ícono sale deformado: ya pasó dos
// veces (519/512 → 374/448 → 405/448).
const ICON_WIDTH = Math.round((ICON_HEIGHT * 405) / 448);
// Alto mínimo del contenedor sin recortar el ícono en los extremos del wobble
// vertical (pedido explícito: la sección no debe dejar espacio sobrante).
const CONTAINER_HEIGHT = ICON_HEIGHT + 2 * DIVIDER_WOBBLE_AMPLITUDE;

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
    <div
      aria-hidden="true"
      // apoyoEnFrontera: sube el divisor media caja para que la estela quede
      // clavada sobre la frontera hero/cuerpo. Ver lib/gsap/useFlightWithWake.ts.
      style={{ ...apoyoEnFrontera(ICON_HEIGHT), paddingLeft: DIVIDER_MARGEN_LATERAL, paddingRight: DIVIDER_MARGEN_LATERAL }}
    >
      <style>{`
        .qsd-estela {
          background-image: repeating-linear-gradient(to right, var(--dz-accent) 0 3px, transparent 3px 8px);
        }
        .qsd-estela[data-dir="derecha"] { -webkit-mask-image: linear-gradient(to left, black 0%, transparent 100%); mask-image: linear-gradient(to left, black 0%, transparent 100%); }
        .qsd-estela[data-dir="izquierda"] { -webkit-mask-image: linear-gradient(to right, black 0%, transparent 100%); mask-image: linear-gradient(to right, black 0%, transparent 100%); }
      `}</style>
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${CONTAINER_HEIGHT}px`, width: "100%", overflow: "hidden" }}
      >
        {prefersReducedMotion ? (
          <div className="absolute top-1/2 left-1/2" style={{ transform: "translate(-50%, -50%)" }}>
            <Image src="/images/q-somos-divider-v3.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
          </div>
        ) : (
          <>
            <div
              ref={estelaRef}
              className="qsd-estela absolute"
              data-dir={empiezaDerecha ? "izquierda" : "derecha"}
              style={{ left: 0, top: "calc(50% - 1.133px)", height: "2.266px", width: 0 }}
            />
            <div ref={iconRef} className="absolute" style={{ left: 0, top: `calc(50% - ${ICON_HEIGHT / 2}px)` }}>
              <Image src="/images/q-somos-divider-v3.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

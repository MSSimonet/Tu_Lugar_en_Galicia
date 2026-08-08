"use client";

import { useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { useFlightWithWake, DIVIDER_MARGEN_LATERAL, DIVIDER_WOBBLE_AMPLITUDE } from "@/lib/gsap/useFlightWithWake";

// Separador de equipaje (public/images/maletas-divider-v6.png) — mismo motor
// de animación que components/ui/AnimatedDivider.tsx (lib/gsap/useFlightWithWake.ts).
//
// Origen del asset: equipaje1.png (naranja sobre fondo negro) se keyeó tratándola
// como premultiplicada contra negro y des-premultiplicando el color, para que los
// bordes antialiaseados no quedaran con halo oscuro. Ese paso produjo una versión
// intermedia con los 6 objetos de la fuente que YA NO EXISTE en el repo: medía
// 168px de ancho contra los 45-60px del resto de los divisores, ocupaba el 51% de
// la franja en móvil y, con la velocidad ya unificada, giraba casi el doble de
// seguido que los otros cuatro (auditoría 2026-07-25, I1). Se borró al quedar
// huérfana; si hiciera falta rehacerla, se regenera desde equipaje1.png.
//
// La v6 recompone 4 de esos objetos —maleta grande, bolso, maleta alta y mochila,
// de tamaños deliberadamente distintos— apoyados sobre una misma línea de base.
// Se eligieron los 4 más estrechos en proporción a su alto, que son los que menos
// ensanchan el resultado: 513×226 → aspecto 2,27 → 100px de ancho. Cuatro objetos
// en fila no pueden bajar al 1,24-1,37 del resto, pero la diferencia de recorrido
// contra los otros divisores cae del 42% al ~18%.

const ICON_HEIGHT = 44;
// Aspecto nativo de maletas-divider-v6.png. Era 513/226 con la imagen anterior;
// la sustitución de 2026-08-03 dejó el archivo en 616x271. El ancho redondeado
// sale igual (100px) en los dos casos, pero se actualiza para que la constante
// siga describiendo el archivo real y no uno que ya no existe.
const ICON_WIDTH = Math.round((ICON_HEIGHT * 616) / 271);
// Alto mínimo del contenedor sin recortar el ícono en los extremos del wobble
// vertical (pedido explícito: la sección no debe dejar espacio sobrante).
const CONTAINER_HEIGHT = ICON_HEIGHT + 2 * DIVIDER_WOBBLE_AMPLITUDE;

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
    // El padding vertical va en este envoltorio y no en el contenedor de abajo:
    // aquél tiene `overflow: hidden` y un alto calculado al milímetro para no
    // recortar el ícono en los extremos del wobble, así que sumarle padding lo
    // recortaría. Acá el aire queda por fuera del área de recorte.
    <div
      aria-hidden="true"
      style={{
        paddingLeft: DIVIDER_MARGEN_LATERAL,
        paddingRight: DIVIDER_MARGEN_LATERAL,
        paddingTop: 'var(--space-8)',
        paddingBottom: 'var(--space-8)',
      }}
    >
      <style>{`
        .mld-estela {
          background-image: repeating-linear-gradient(to right, var(--dz-accent) 0 3px, transparent 3px 8px);
        }
        .mld-estela[data-dir="derecha"] { -webkit-mask-image: linear-gradient(to left, black 0%, transparent 100%); mask-image: linear-gradient(to left, black 0%, transparent 100%); }
        .mld-estela[data-dir="izquierda"] { -webkit-mask-image: linear-gradient(to right, black 0%, transparent 100%); mask-image: linear-gradient(to right, black 0%, transparent 100%); }
      `}</style>
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${CONTAINER_HEIGHT}px`, width: "100%", overflow: "hidden" }}
      >
        {prefersReducedMotion ? (
          <div
            className="absolute top-1/2 left-1/2"
            style={{ transform: `translate(-50%, -50%) ${empiezaDerecha ? "scaleX(-1)" : ""}` }}
          >
            <Image src="/images/maletas-divider-v6.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
          </div>
        ) : (
          <>
            <div
              ref={estelaRef}
              className="mld-estela absolute"
              data-dir={empiezaDerecha ? "izquierda" : "derecha"}
              style={{ left: 0, top: "calc(50% - 1.133px)", height: "2.266px", width: 0 }}
            />
            <div ref={iconRef} className="absolute" style={{ left: 0, top: `calc(50% - ${ICON_HEIGHT / 2}px)` }}>
              <Image src="/images/maletas-divider-v6.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

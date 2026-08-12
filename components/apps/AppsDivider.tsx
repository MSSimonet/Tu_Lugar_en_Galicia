"use client";

import { useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { useFlightWithWake, apoyoEnFrontera, DIVIDER_MARGEN_LATERAL, DIVIDER_WOBBLE_AMPLITUDE } from "@/lib/gsap/useFlightWithWake";

// Separador de la sección Apps Útiles — quinto de la familia, mismo motor que
// BrujulaDivider/GenteDivider/QSomosDivider/MaletasDivider
// (lib/gsap/useFlightWithWake.ts: línea fina + recorrido de borde a borde +
// oscilación vertical + estela punteada).
//
// La VELOCIDAD no se configura acá y no debe configurarse: el hook la normaliza
// contra ANCHO_ICONO_REFERENCIA, así que mientras no se toque `recorridoDuration`
// este divisor avanza exactamente a los mismos px/s que los otros cuatro en
// cualquier viewport. Fijar una duración propia es justo lo que producía 82,9
// px/s contra 74,7 entre divisores (auditoría 2026-07-25, C1).
//
// Imagen: public/images/apps-divider-v3.png — foto del usuario (escritorio,
// tablet y móvil) con el fondo removido. OJO: la v1 venía sobre fondo BLANCO y la
// v2 sobre fondo NEGRO, así que el recorte no es el mismo trabajo. Se hizo con
// flood fill desde los bordes y no con umbral de luminancia: el arte tiene sombras
// propias y un umbral plano las habría agujereado.
//
// COLOR (v3): reencajado en el ámbar de la familia, #E8A848 — el mismo que domina
// el 95% de gente-divider-v2.png (Comunidad) y el 85% de maletas-divider-v6.png.
// La v2 conservaba el color original del arte, un dorado mostaza cuyo tono dominante
// medía #A87828: al lado de los otros cuatro divisores se leía como otro material,
// no como el mismo objeto en otra sección.
//
// El reencaje NO es un teñido plano. La ilustración tiene volumen —biseles, reflejos,
// la sombra bajo cada pantalla— y pintarla de un color liso la habría dejado chata.
// Se conservó la luminancia relativa de cada pixel y se desplazó la escala para que
// el dominante caiga exactamente en #E8A848; el resto se acomodó alrededor a la
// misma distancia que tenía. Medido después: dominante #E8A848 (34%), con los
// reflejos repartidos en #F8B848 y #F8C858.
//
// `gira: false`: se traslada sin rotar. Los tres dispositivos tienen orientación
// legible —pantallas hacia el espectador—, así que girarlos 180° en cada extremo
// los dejaría del revés, el mismo motivo por el que no giran la brújula ni el
// medallón.
//
// La estela usa --au-accent y no --dz-accent porque esta página conserva a
// propósito su propio sistema --au-* (decisión de marca, sesión 2026-07-26). Hoy
// los dos valen #E0932E, así que se ve idéntica a las demás; si esa paleta se
// separa algún día, el divisor acompaña a su página.

const ICON_HEIGHT = 44; // mismo alto que gente, q-somos y maletas
const ICON_WIDTH = Math.round((ICON_HEIGHT * 616) / 271); // aspecto nativo de apps-divider-v3.png
// Alto mínimo del contenedor sin recortar el ícono en los extremos del wobble.
const CONTAINER_HEIGHT = ICON_HEIGHT + 2 * DIVIDER_WOBBLE_AMPLITUDE;

export interface AppsDividerProps {
  /** "ltr" (default): arranca en el borde izquierdo, primer tramo vuela a la derecha.
   *  "rtl": arranca en el borde derecho, primer tramo vuela a la izquierda. */
  direction?: "ltr" | "rtl";
}

export function AppsDivider({ direction = "ltr" }: AppsDividerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const estelaRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const empiezaDerecha = direction === "rtl";

  useFlightWithWake(containerRef, iconRef, estelaRef, {
    empiezaDerecha,
    estelaMax: 210, // mismo largo de estela que los otros cuatro
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
        .apd-estela {
          background-image: repeating-linear-gradient(to right, var(--au-accent) 0 3px, transparent 3px 8px);
        }
        .apd-estela[data-dir="derecha"] { -webkit-mask-image: linear-gradient(to left, black 0%, transparent 100%); mask-image: linear-gradient(to left, black 0%, transparent 100%); }
        .apd-estela[data-dir="izquierda"] { -webkit-mask-image: linear-gradient(to right, black 0%, transparent 100%); mask-image: linear-gradient(to right, black 0%, transparent 100%); }
      `}</style>
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${CONTAINER_HEIGHT}px`, width: "100%", overflow: "hidden" }}
      >
        {prefersReducedMotion ? (
          <div className="absolute top-1/2 left-1/2" style={{ transform: "translate(-50%, -50%)" }}>
            <Image src="/images/apps-divider-v3.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
          </div>
        ) : (
          <>
            <div
              ref={estelaRef}
              className="apd-estela absolute"
              data-dir={empiezaDerecha ? "izquierda" : "derecha"}
              style={{ left: 0, top: "calc(50% - 1.133px)", height: "2.266px", width: 0 }}
            />
            <div ref={iconRef} className="absolute" style={{ left: 0, top: `calc(50% - ${ICON_HEIGHT / 2}px)` }}>
              <Image src="/images/apps-divider-v3.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

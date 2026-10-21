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
// Imagen: public/images/apps_divider.png — misma ilustración del usuario
// (escritorio, tablet y móvil) que la v3, recortada de nuevo desde el master a
// resolución completa (3128×1376 en vez de 616×271) y cuantizada a paleta de 128
// colores: 17,3 kB contra los 31,4 kB del PNG que reemplaza, un 45% menos, sin
// diferencia visible ni siquiera a 520px de ancho (el divisor se pinta a 100).
//
// PNG y no WebP a pesar de que WebP pesaba parecido (14,7 kB): el optimizador de
// next/image convierte a JPEG cuando la fuente es WebP y el cliente no acepta
// WebP en su Accept — y JPEG NO TIENE CANAL ALFA, así que el divisor saldría
// sobre un rectángulo opaco. Comprobado sirviendo las dos fuentes con y sin
// `image/webp` en el Accept: la fuente WebP devuelve image/jpeg, y un PNG
// hermano (gente-divider-v2.png) devuelve image/png con la transparencia intacta.
// Con la fuente en PNG no se pierde nada: a quien acepta WebP, next/image le
// sirve WebP igual (3,4 kB en el ancho que usa esta página).
//
// RECORTE: flood fill desde los bordes, no umbral de luminancia. El arte tiene
// sombras propias y zonas oscuras interiores —la línea fina dentro del monitor,
// los biseles, la sombra bajo cada pantalla— que un umbral plano habría
// agujereado. Además el sujeto TOCA los bordes (el monitor por la izquierda, el
// teclado por abajo), así que el relleno solo arranca en píxeles de borde que ya
// son fondo. El borde del recorte lleva alfa parcial con descontaminación de
// color —color = (mezcla − fondo·(1−α)) / α— porque el master viene sobre negro
// y sin eso el corte dejaría una orla oscura al componerse sobre fondo claro.
//
// COLOR: el dorado mostaza CRUDO del arte, tal como viene el master. No se le
// aplica ningún ajuste — el pipeline es recorte y ya, sin paso de color.
//
// ESTO SE APARTA DE LOS OTROS CUATRO DIVISORES A PROPÓSITO, y conviene saberlo
// antes de "arreglarlo". Los hermanos miden #EDA549 (gente), #EDA34A (maletas),
// #EDA448 (brújula) y #E9A859 (q-somos), o sea la banda ámbar de la familia; éste
// mide #A77A25 de dominante y #B68732 de promedio sobre los píxeles opacos, que es
// bastante más oscuro y apagado. La versión anterior sí lo reencajaba en esa banda
// (caía en #E7A84A) y se quitó por decisión de Marcelo del 2026-08-19: quiere el
// color original de la imagen. Si alguien vuelve a verlo "fuera de sistema", que
// pregunte antes de tocar: es una elección, no un olvido.
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
// 618/271 = 2,2804, el aspecto REAL del recorte nuevo. La v3 era 616/271 =
// 2,2731: 0,3% de diferencia, que a este alto NO mueve el ancho renderizado —
// round(44·618/271) = 100 y round(44·616/271) = 100, el mismo entero. O sea que
// el divisor ocupa exactamente la misma caja que antes y no hay nada que
// reencajar en el layout.
const ICON_WIDTH = Math.round((ICON_HEIGHT * 618) / 271); // aspecto nativo de apps_divider.png
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
            <Image src="/images/apps_divider.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
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
              <Image src="/images/apps_divider.png" alt="" width={ICON_WIDTH} height={ICON_HEIGHT} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

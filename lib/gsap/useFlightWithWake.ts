import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// Motor compartido de "línea de vuelo": recorrido de borde a borde, giro de 180°
// en cada punto de giro (opcional vía `gira`), oscilación vertical leve, y una
// estela punteada que se desvanece detrás del elemento — se borra por completo
// antes de que empiece la del tramo siguiente. Usado por AnimatedDivider (avión),
// MaletasDivider (maletas) y RosaVientosDivider (sin `gira`, solo traslación) —
// misma mecánica, distinto contenido visual dentro de `iconRef`.

// 0,5cm de separación entre el borde trasero del ícono y el inicio de la
// estela (pedido explícito) — 1cm CSS = 96px/2.54.
const ESTELA_GAP_PX = (0.5 * 96) / 2.54;

export interface FlightWithWakeOptions {
  recorridoDuration?: number;
  giroDuration?: number;
  wobbleDuration?: number;
  wobbleAmplitude?: number;
  estelaMax?: number;
  estelaClearDuration?: number;
  /** "ltr" (default): arranca a la izquierda, primer tramo hacia la derecha.
   *  "rtl": arranca a la derecha, primer tramo hacia la izquierda. */
  empiezaDerecha?: boolean;
  /** true (default): gira 180° en cada punto de giro (avión/maletas). false:
   *  solo traslada, sin rotar — mantiene su orientación fija (rosa de los vientos). */
  gira?: boolean;
  skip?: boolean;
}

export function useFlightWithWake(
  containerRef: RefObject<HTMLElement | null>,
  iconRef: RefObject<HTMLElement | null>,
  estelaRef: RefObject<HTMLElement | null>,
  {
    recorridoDuration = 15,
    giroDuration = 0.5,
    wobbleDuration = 2,
    wobbleAmplitude = 2,
    estelaMax = 210,
    estelaClearDuration = 0.3,
    empiezaDerecha = false,
    gira = true,
    skip = false,
  }: FlightWithWakeOptions = {}
) {
  useGSAP(
    () => {
      if (skip || !containerRef.current || !iconRef.current || !estelaRef.current) return;
      const container = containerRef.current;
      const icon = iconRef.current;
      const estela = estelaRef.current;
      const distancia = container.offsetWidth - icon.offsetWidth;

      const xInicial = empiezaDerecha ? distancia : 0;
      const xFinal = empiezaDerecha ? 0 : distancia;
      // Sin `gira`, rotateY se queda fijo en 0 todo el ciclo — mismo timing/estela,
      // solo traslación (la rosa de los vientos no debe girar sobre sí misma).
      const rotInicial = gira && empiezaDerecha ? 180 : 0;
      const rotFinal = gira && !empiezaDerecha ? 180 : 0;
      const dirLeg1 = !empiezaDerecha; // true = primer tramo hacia la derecha
      const dirLeg2 = empiezaDerecha;

      gsap.set(icon, { x: xInicial, rotateY: rotInicial, transformPerspective: 800 });
      gsap.set(estela, { width: 0 });
      estela.dataset.dir = dirLeg1 ? "derecha" : "izquierda";

      // Largo/posición de la estela por frame, acotada a estelaMax (no se
      // acumula sin límite) — el mask-image en CSS (fijo, 0%→100% del propio
      // ancho del elemento) ya produce el desvanecido sin recalcular porcentajes.
      function actualizarEstela(legStart: number, haciaDerecha: boolean) {
        const x = gsap.getProperty(icon, "x") as number;
        const recorrido = Math.abs(x - legStart);
        const largo = Math.min(recorrido, estelaMax);
        estela.style.width = `${largo}px`;
        estela.style.transform = haciaDerecha
          ? `translate3d(${x - ESTELA_GAP_PX - largo}px, 0, 0)`
          : `translate3d(${x + icon.offsetWidth + ESTELA_GAP_PX}px, 0, 0)`;
      }

      // Ciclo: vuela (estela crece) → estela se borra → gira 180° → vuela en
      // sentido opuesto (nueva estela, del otro lado) → se borra → gira → repite.
      // La estela siempre termina de borrarse (estelaClearDuration) antes de que
      // el giro (giroDuration) complete, así nunca coexisten ida y vuelta.
      const ciclo = gsap.timeline({ repeat: -1 });
      ciclo
        .to(icon, {
          x: xFinal,
          duration: recorridoDuration,
          ease: "sine.inOut",
          onUpdate: () => actualizarEstela(xInicial, dirLeg1),
        })
        .to(estela, { width: 0, duration: estelaClearDuration, ease: "power1.in" })
        .to(icon, { rotateY: rotFinal, duration: giroDuration, ease: "power1.inOut" }, "<")
        .call(() => {
          estela.dataset.dir = dirLeg2 ? "derecha" : "izquierda";
        })
        .to(icon, {
          x: xInicial,
          duration: recorridoDuration,
          ease: "sine.inOut",
          onUpdate: () => actualizarEstela(xFinal, dirLeg2),
        })
        .to(estela, { width: 0, duration: estelaClearDuration, ease: "power1.in" })
        .to(icon, { rotateY: rotInicial, duration: giroDuration, ease: "power1.inOut" }, "<")
        .call(() => {
          estela.dataset.dir = dirLeg1 ? "derecha" : "izquierda";
        });

      gsap.fromTo(
        icon,
        { y: -wobbleAmplitude },
        { y: wobbleAmplitude, duration: wobbleDuration, ease: "sine.inOut", repeat: -1, yoyo: true }
      );
    },
    { scope: containerRef, dependencies: [skip, empiezaDerecha, gira] }
  );
}

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

// Margen lateral compartido por los 5 divisores: el recorrido arranca/termina
// a 2cm de cada borde (pedido explícito). El `min()` lo hace responsive: en
// desktop manda el 2cm exacto; en pantallas angostas manda el 6vw, porque 2cm
// fijos se comen el 40% de un viewport de 375px y dejaban al ícono casi sin
// recorrido (auditoría 2026-07-25, C2/I1).
//
// Se aplica como PADDING del contenedor externo, nunca con el truco de
// `100vw` + margin negativo: `100vw` incluye el ancho de la barra de scroll
// pero el `50%` se calcula sobre el ancho de contenido, y esa diferencia
// descentraba el divisor 15px (medido: 68px izq / 83px der en 1440 y 768).
export const DIVIDER_MARGEN_LATERAL = "min(2cm, 6vw)";

// Amplitud por defecto de la oscilación vertical (wobble) — exportada para que
// cada divisor pueda calcular su alto mínimo de contenedor (ICON_HEIGHT + 2 *
// esta amplitud) sin duplicar el número mágico.
export const DIVIDER_WOBBLE_AMPLITUDE = 2;

// Ancho de ícono de referencia (el del avión) para normalizar la VELOCIDAD.
// `recorridoDuration` sola no alcanzaba: la distancia real es
// `ancho del contenedor − ancho del ícono`, y los íconos miden distinto
// (avión 60px, brújula 46, q-somos 45, gente 54, equipaje 168). Con duración
// fija, cada divisor se movía a px/s distintos — medido en la auditoría
// 2026-07-25 (C1): 82,9 px/s la brújula contra 74,7 el equipaje en desktop, y
// 3× de diferencia en móvil. Derivando la duración de la distancia contra esta
// referencia, los 5 avanzan exactamente a la misma velocidad en cualquier
// viewport, y el ritmo general sigue atado al ancho de pantalla como antes.
const ANCHO_ICONO_REFERENCIA = 60;

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
    wobbleAmplitude = DIVIDER_WOBBLE_AMPLITUDE,
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

      let ciclo: ReturnType<typeof gsap.timeline> | null = null;

      // Se reconstruye entero ante cada cambio de ancho: la distancia y la
      // duración se calculan del tamaño real del contenedor, así que un
      // timeline creado a 1440px seguía moviendo el ícono la distancia de
      // 1440px después de rotar el móvil — a 375px eso daba 80 px/s en vez de
      // 18 y el ícono se iba fuera del contenedor (auditoría 2026-07-25).
      function construirCiclo() {
        ciclo?.kill();

        const distancia = container.offsetWidth - icon.offsetWidth;
        // Velocidad común a los 5 divisores (px/s), derivada del ícono de
        // referencia; cada uno tarda lo que le tome su propia distancia.
        const velocidad =
          (container.offsetWidth - ANCHO_ICONO_REFERENCIA) / recorridoDuration;
        const duracionTramo =
          velocidad > 0 ? Math.max(distancia / velocidad, 0.1) : recorridoDuration;

        const xInicial = empiezaDerecha ? distancia : 0;
        const xFinal = empiezaDerecha ? 0 : distancia;
        // Sin `gira`, rotateY se queda fijo en 0 todo el ciclo — mismo timing/estela,
        // solo traslación (la brújula no debe girar sobre sí misma).
        const rotInicial = gira && empiezaDerecha ? 180 : 0;
        const rotFinal = gira && !empiezaDerecha ? 180 : 0;
        const dirLeg1 = !empiezaDerecha; // true = primer tramo hacia la derecha
        const dirLeg2 = empiezaDerecha;

        gsap.set(icon, { x: xInicial, rotateY: rotInicial, transformPerspective: 800 });
        gsap.set(estela, { width: 0 });
        estela.dataset.dir = dirLeg1 ? "derecha" : "izquierda";

        // Ciclo: vuela (estela crece) → estela se borra → gira 180° → vuela en
        // sentido opuesto (nueva estela, del otro lado) → se borra → gira → repite.
        // La estela siempre termina de borrarse (estelaClearDuration) antes de que
        // el giro (giroDuration) complete, así nunca coexisten ida y vuelta.
        ciclo = gsap.timeline({ repeat: -1 });
        ciclo
          .to(icon, {
            x: xFinal,
            duration: duracionTramo,
            // "none" (lineal): velocidad constante de punta a punta, sin
            // aceleración/desaceleración perceptible (pedido explícito) —
            // el giro de 180° en el borde es un tween aparte, no se ve afectado.
            ease: "none",
            onUpdate: () => actualizarEstela(xInicial, dirLeg1),
          })
          .to(estela, { width: 0, duration: estelaClearDuration, ease: "power1.in" })
          .to(icon, { rotateY: rotFinal, duration: giroDuration, ease: "power1.inOut" }, "<")
          .call(() => {
            estela.dataset.dir = dirLeg2 ? "derecha" : "izquierda";
          })
          .to(icon, {
            x: xInicial,
            duration: duracionTramo,
            ease: "none",
            onUpdate: () => actualizarEstela(xFinal, dirLeg2),
          })
          .to(estela, { width: 0, duration: estelaClearDuration, ease: "power1.in" })
          .to(icon, { rotateY: rotInicial, duration: giroDuration, ease: "power1.inOut" }, "<")
          .call(() => {
            estela.dataset.dir = dirLeg1 ? "derecha" : "izquierda";
          });
      }

      construirCiclo();

      const wobble = gsap.fromTo(
        icon,
        { y: -wobbleAmplitude },
        { y: wobbleAmplitude, duration: wobbleDuration, ease: "sine.inOut", repeat: -1, yoyo: true }
      );

      let anchoPrevio = container.offsetWidth;
      const observer = new ResizeObserver(() => {
        const ancho = container.offsetWidth;
        if (Math.abs(ancho - anchoPrevio) < 2) return; // ignora ruido subpíxel
        anchoPrevio = ancho;
        construirCiclo();
      });
      observer.observe(container);

      // Pausa fuera de viewport. Estas animaciones son `repeat: -1` y estos
      // divisores viven en casi todas las páginas, así que sin esto el avión
      // sigue recorriendo su ciclo —y repintando cada frame— aunque esté a
      // varias pantallas de distancia. Auditoría pre-merge 2026-07-31.
      const visibilidad = new IntersectionObserver(
        ([entrada]) => {
          if (entrada.isIntersecting) {
            ciclo?.resume();
            wobble.resume();
          } else {
            ciclo?.pause();
            wobble.pause();
          }
        },
        { rootMargin: "100px" }
      );
      visibilidad.observe(container);

      return () => {
        observer.disconnect();
        visibilidad.disconnect();
        ciclo?.kill();
        wobble.kill();
      };
    },
    { scope: containerRef, dependencies: [skip, empiezaDerecha, gira] }
  );
}

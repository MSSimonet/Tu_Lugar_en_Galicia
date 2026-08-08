"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP, MotionPathPlugin } from "@/lib/gsap";
import { construirTrayectoria, type Banda, type TrayectoriaKind } from "@/lib/gsap/trayectorias";

// Capa de fondo animada. Sustituye a los divisores lineales (AnimatedDivider,
// BrujulaDivider, GenteDivider, QSomosDivider), que eran bloques insertados
// ENTRE secciones y por lo tanto solo podían moverse en una franja horizontal
// de ~48px de alto.
//
// Acá el ícono deja de ser un separador y pasa a ser fondo: la capa se estira
// sobre el alto completo de la página y el ícono la recorre libremente por
// detrás de todas las secciones intermedias.
//
// Sobre "nunca por detrás de Hero, Nav o Footer": no hace falta recortar la
// capa ni calcular offsets. Hero, Nav y Footer pintan fondo opaco propio
// (--dz-fondo-marco / --color-header-bg) y viven por encima en el eje Z, así
// que ocluyen al ícono cuando pasa por debajo. El recorte es visual, no lógico.

/** Velocidad común a todas las trayectorias, en px/s. Hereda el criterio del
 *  motor anterior: la duración se deriva del largo real del recorrido, así un
 *  ícono no se mueve más rápido solo porque su página es más corta. */
const VELOCIDAD_PX_S = 46;

/** Opacidad de cada tramo de la estela. Se dibuja como LÍNEA punteada real
 *  (stroke-dasharray) partida en tres tramos, no como círculos sueltos: además
 *  de leerse como línea, baja de 68 escrituras de DOM por avión y por frame a
 *  3, que es lo que hace viable una flota grande sin entrecortar el movimiento. */
const TRAMOS_OPACIDAD = [0.55, 0.32, 0.14];
const ESTELA_PUNTOS = 34;
const ESTELA_SEPARACION = 0.0021;

// `rotBase`: corrección de orientación del PNG. El ángulo que devuelve
// MotionPathPlugin toma 0° = apuntando a la DERECHA, así que un sprite dibujado
// mirando hacia arriba —como avioncito.png, vista superior— necesita +90° o
// vuela de costado por toda la página.
const ICONOS = {
  // Dos variantes por tema. Cada una lleva su propio ratio porque los archivos
  // NO tienen el mismo aspecto (551x572 el claro, 1024x1024 el oscuro): con un
  // ratio unico el claro saldria achatado.
  avion: {
    src: "/images/avion_claro.png",
    ratio: 551 / 572,
    srcOscuro: "/images/avion_oscuro.png",
    ratioOscuro: 1024 / 1024,
    alto: 48,
    rota: true,
    rotBase: 90,
  },
  brujula: { src: "/images/brujula-divider-v3.png", alto: 46, ratio: 510 / 512, rota: false, rotBase: 0 },
  gente: { src: "/images/gente-divider-v2.png", alto: 44, ratio: 633 / 512, rota: false, rotBase: 0 },
  qsomos: { src: "/images/q-somos-divider-v3.png", alto: 44, ratio: 405 / 448, rota: false, rotBase: 0 },
  maletas: { src: "/images/maletas-divider-v6.png", alto: 44, ratio: 513 / 226, rota: false, rotBase: 0 },
} as const;

export type FondoAnimadoIcono = keyof typeof ICONOS;

export interface FondoAnimadoProps {
  icono: FondoAnimadoIcono;
  trayectoria: TrayectoriaKind;
  /** 1 (default): recorre la curva en el sentido en que está definida. -1: la
   *  recorre al revés. Es lo que permite que dos aviones sobre curvas iguales o
   *  espejadas nunca se muevan en la misma dirección al mismo tiempo. */
  sentido?: 1 | -1;
  /** Desfase inicial sobre el recorrido, 0..1. Separa a dos aviones que
   *  comparten curva para que se crucen en vez de superponerse. */
  demora?: number;
  /** Semilla de la trayectoria "aleatoria" y de la variación de forma de
   *  "banda". Determinista: la misma semilla da siempre la misma curva, así el
   *  servidor y el cliente coinciden. */
  semilla?: number;
  /** Solo para `trayectoria: "banda"`: franja del alto de la capa a la que se
   *  confina este avión. */
  banda?: Banda;
}


/** Lee la clase .dark de <html> — el mecanismo de tema que ya usa el proyecto
 *  (globals.css: @custom-variant dark, toggle en Header.tsx) — y reacciona en
 *  caliente via MutationObserver, sin recargar. Arranca en false para que el
 *  HTML del servidor y la primera pintura del cliente coincidan. */
function useTemaOscuro(): boolean {
  const [oscuro, setOscuro] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const leer = () => setOscuro(root.classList.contains("dark"));
    leer();
    const mo = new MutationObserver(leer);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return oscuro;
}

export function FondoAnimado({
  icono,
  trayectoria,
  sentido = 1,
  demora = 0,
  semilla = 0,
  banda,
}: FondoAnimadoProps) {
  const capaRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tramosRef = useRef<(SVGPathElement | null)[]>([]);
  const prefersReducedMotion = useReducedMotion();

  const cfg = ICONOS[icono];
  const oscuro = useTemaOscuro();
  // "srcOscuro" solo lo define el avion; el resto de los iconos usa una sola imagen.
  const variante = oscuro && "srcOscuro" in cfg ? { src: cfg.srcOscuro, ratio: cfg.ratioOscuro } : { src: cfg.src, ratio: cfg.ratio };
  const ancho = Math.round(cfg.alto * variante.ratio);

  useGSAP(
    () => {
      if (prefersReducedMotion) return;
      const capa = capaRef.current;
      const icon = iconRef.current;
      const svg = svgRef.current;
      if (!capa || !icon || !svg) return;

      let tween: gsap.core.Animation | null = null;
      // Progreso conservado entre reconstrucciones. La capa se reconstruye cada
      // vez que la página cambia de alto (imágenes que cargan tarde, acordeones,
      // el mapa); sin esto el recorrido se reiniciaba en 0 y el avión pegaba un
      // salto a mitad de vuelo. Es la única interrupción real que tenía el
      // movimiento, y no dependía del scroll sino del layout.
      let progreso = 0;
      let arrancado = false;
      function soltar() {
        arrancado = true;
        tween?.play();
      }

      function construir() {
        if (tween) progreso = tween.progress();
        tween?.kill();
        const w = capa!.offsetWidth;
        const h = capa!.offsetHeight;
        if (w < 2 || h < 2) return;

        svg!.setAttribute("viewBox", `0 0 ${w} ${h}`);

        const d = construirTrayectoria(trayectoria, w, h, { semilla, banda });
        const rawPath = MotionPathPlugin.stringToRawPath(d);
        MotionPathPlugin.cacheRawPathMeasurements(rawPath);

        // `totalLength` lo deja cacheRawPathMeasurements; si por lo que sea no
        // está, se cae a una duración fija antes que romper la animación.
        const largo = (rawPath as unknown as { totalLength?: number }).totalLength ?? 0;
        const duracion = largo > 0 ? largo / VELOCIDAD_PX_S : 60;

        // `r` avanza siempre 0→1; el sentido y el desfase se aplican al
        // convertirlo en posición sobre la curva. Así invertir la marcha no
        // requiere otra curva ni otro tween.
        const proxy = { r: 0 };
        const tramos = tramosRef.current;
        const porTramo = Math.ceil(ESTELA_PUNTOS / TRAMOS_OPACIDAD.length);

        function posEn(offset: number) {
          let q = (demora + sentido * proxy.r + offset) % 1;
          if (q < 0) q += 1;
          return q;
        }

        function pintar() {
          // El tipo de retorno declarado es la unión Point2D | {…angle}: con
          // `true` siempre trae `angle`, pero TS no lo estrecha por el booleano.
          const pos = MotionPathPlugin.getPositionOnPath(rawPath, posEn(0), true) as {
            x: number;
            y: number;
            angle: number;
          };
          gsap.set(icon, {
            x: pos.x - ancho / 2,
            y: pos.y - cfg.alto / 2,
            // Yendo al revés el morro tiene que apuntar al revés, o el avión
            // vuela de cola.
            rotation: cfg.rota ? pos.angle + cfg.rotBase + (sentido === -1 ? 180 : 0) : 0,
          });
          // Progreso hacia atrás desde el ícono, con wrap circular: la estela
          // sigue la curva real. Va DETRÁS, así que con sentido -1 "detrás" es
          // hacia adelante en el parámetro de la curva.
          const buf: string[][] = TRAMOS_OPACIDAD.map(() => []);
          for (let i = 0; i < ESTELA_PUNTOS; i++) {
            const q = posEn(-sentido * (i + 1) * ESTELA_SEPARACION);
            const pp = MotionPathPlugin.getPositionOnPath(rawPath, q, false);
            const coord = `${pp.x.toFixed(1)} ${pp.y.toFixed(1)}`;
            const tramo = Math.min(TRAMOS_OPACIDAD.length - 1, Math.floor(i / porTramo));
            // El punto de frontera se repite en el tramo anterior para que la
            // línea no muestre un hueco al cambiar de opacidad.
            if (tramo > 0 && buf[tramo].length === 0) buf[tramo - 1].push(coord);
            buf[tramo].push(coord);
          }
          for (let tr = 0; tr < tramos.length; tr++) {
            const el = tramos[tr];
            if (!el) continue;
            el.setAttribute("d", buf[tr].length > 1 ? `M ${buf[tr].join(" L ")}` : "");
          }
        }

        pintar();
        // Un solo tramo a velocidad constante. Ninguna trayectoria tiene ya
        // pasillo oculto que valga la pena acelerar (ver trayectorias.ts), así
        // que el avión mantiene exactamente los mismos px/s de punta a punta.
        tween = gsap.to(proxy, { r: 1, duration: duracion, ease: "none", repeat: -1, onUpdate: pintar });
        // Retoma donde estaba, no desde el principio.
        tween.progress(progreso);

        // Arranque atado al primer scroll: con la página quieta arriba de todo
        // los aviones esperan; se sueltan apenas el usuario empieza a bajar.
        if (!arrancado && window.scrollY <= 0) {
          tween.pause();
          window.addEventListener("scroll", soltar, { passive: true, once: true });
        }
      }

      construir();

      let anchoPrevio = capa.offsetWidth;
      let altoPrevio = capa.offsetHeight;
      const observer = new ResizeObserver(() => {
        // Mismo criterio antirruido que el motor anterior: reconstruir en cada
        // subpíxel mataría el rendimiento en páginas que crecen al hacer scroll
        // (acordeones, mapas, imágenes que cargan tarde).
        const w = capa.offsetWidth;
        const h = capa.offsetHeight;
        if (Math.abs(w - anchoPrevio) < 4 && Math.abs(h - altoPrevio) < 24) return;
        anchoPrevio = w;
        altoPrevio = h;
        construir();
      });
      observer.observe(capa);

      return () => {
        window.removeEventListener("scroll", soltar);
        observer.disconnect();
        tween?.kill();
      };
    },
    {
      scope: capaRef,
      dependencies: [
        icono,
        trayectoria,
        sentido,
        demora,
        semilla,
        banda?.indice,
        banda?.total,
        prefersReducedMotion,
      ],
    }
  );

  return (
    <div
      ref={capaRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {prefersReducedMotion ? null : (
        <>
          <svg
            ref={svgRef}
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            fill="none"
          >
            {TRAMOS_OPACIDAD.map((op, i) => (
              <path
                key={i}
                ref={(el) => {
                  tramosRef.current[i] = el;
                }}
                fill="none"
                stroke="var(--dz-accent)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeDasharray="2 7"
                strokeOpacity={op}
              />
            ))}
          </svg>
          <div ref={iconRef} className="absolute top-0 left-0">
            <Image src={variante.src} alt="" width={ancho} height={cfg.alto} priority={false} />
          </div>
        </>
      )}
    </div>
  );
}

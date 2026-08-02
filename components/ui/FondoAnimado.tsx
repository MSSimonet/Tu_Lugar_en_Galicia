"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP, MotionPathPlugin } from "@/lib/gsap";
import { construirTrayectoria, type Banda, type TrayectoriaKind } from "@/lib/gsap/trayectorias";
import {
  medirTextos,
  filtrarPorFranja,
  desplazamientoLibre,
  distanciaAlTexto,
  MARGEN_ESQUIVA,
  MARGEN_LIBRE,
  type RectTexto,
} from "@/lib/gsap/esquiva";

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

// ── Esquiva de texto ────────────────────────────────────────────────────────

/** Cuántos píxeles por delante mira el avión. Es lo que convierte la esquiva en
 *  una maniobra y no en un rebote: cuando el texto entra en el margen, el avión
 *  ya viene apartándose desde antes. */
const VISTA_ADELANTE_PX = 130;

/** Constante de tiempo del suavizado exponencial del desplazamiento, en
 *  segundos. Con 0,15 la maniobra completa ~95% en 450ms, dentro de la ventana
 *  de 300–600ms pedida, y como es exponencial no tiene principio ni fin brusco:
 *  la velocidad angular nace y muere en cero sola. */
const TAU_ESQUIVA = 0.15;

/** Tope de giro por frame, en grados. */
const GIRO_MAX_FRAME = 45;

/** Inclinación máxima que se le suma al morro al apartarse, en grados, y la
 *  velocidad de desplazamiento (px/s) que la satura. Sin esto el avión se
 *  desplaza de costado como un cangrejo: se mueve en vertical sin mirar a dónde
 *  va. */
const BANQUEO_MAX = 20;
const BANQUEO_SATURA = 140;

/** Sobre cuántos puntos de estela se desvanece el desplazamiento. La estela
 *  arrastra la maniobra y vuelve a la curva base por detrás. */
const ESTELA_ARRASTRE = 18;

// ── Piruetas ────────────────────────────────────────────────────────────────

/** Cada cuánto tira el dado cada avión, y con qué probabilidad sale. */
const PIRUETA_INTERVALO_MS = 2000;
const PIRUETA_PROBABILIDAD = 0.04;
const PIRUETA_MS_MIN = 400;
const PIRUETA_MS_MAX = 700;

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
  qsomos: { src: "/images/q-somos-divider-v2.png", alto: 44, ratio: 519 / 512, rota: false, rotBase: 0 },
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

      // Estado de esquiva y pirueta. Vive acá y no dentro de construir() por el
      // mismo motivo que `progreso`: la capa se reconstruye cada vez que la
      // página cambia de alto, y si el desplazamiento se reiniciara a 0 el avión
      // pegaría un salto lateral en mitad de una maniobra.
      //
      // Cada avión tiene su propio juego de estas variables — nadie lee ni
      // escribe el estado de otro. La única cosa compartida en toda la feature
      // es la medición del DOM, que es un dato, no una decisión.
      let textos: RectTexto[] = [];
      let desvio = 0;
      let desvioPrev = 0;
      let rotActual = Number.NaN; // NaN = primer frame: adopta el ángulo real sin girar
      let tPrev = 0;
      let tSorteo = 0;
      let piruetaIni = 0;
      let piruetaFin = 0;
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

        // Vista adelantada expresada en unidades de progreso de ESTA curva: los
        // 130px son de pantalla, y cada trayectoria tiene un largo distinto.
        const pasoVista = largo > 0 ? VISTA_ADELANTE_PX / largo : 0;

        // Texto que puede llegar a molestar a este avión. La medición del DOM
        // está cacheada por tamaño de capa y la comparten los 14; acá cada uno
        // se queda sólo con su franja, y con eso la prueba por frame pasa de
        // cientos de rectángulos a unos pocos.
        const franja = banda
          ? {
              min: (h / banda.total) * banda.indice - MARGEN_LIBRE,
              max: (h / banda.total) * (banda.indice + 1) + MARGEN_LIBRE,
            }
          : { min: 0, max: h };
        textos = filtrarPorFranja(medirTextos(capa!), franja.min, franja.max);

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
          // ── Reloj propio ──────────────────────────────────────────────────
          // El suavizado y las piruetas se miden en tiempo real y no en frames:
          // así una pestaña a 30fps hace la misma maniobra en los mismos
          // milisegundos que una a 120.
          const ahora = performance.now();
          const dt = tPrev === 0 ? 1 / 60 : Math.min(0.05, (ahora - tPrev) / 1000);
          tPrev = ahora;

          // ── Esquiva ───────────────────────────────────────────────────────
          // Se evalúa el punto donde el avión VA A ESTAR, no donde está, y se le
          // suma el desplazamiento vigente: sin eso el avión pelea contra su
          // propia maniobra y oscila alrededor del borde del texto.
          if (textos.length > 0) {
            // Se muestrea el TRAMO (acá, mitad de camino, y el punto adelantado),
            // no sólo el punto adelantado. Con un único punto por delante el
            // avión empezaba a apartarse a tiempo pero, justo cuando llegaba al
            // texto, la mirada ya estaba del otro lado y veía pista libre: el
            // desplazamiento volvía a cero y se metía encima del texto
            // exactamente en el peor momento. Medido: 11% de las muestras caían
            // dentro de un bloque de texto. Tomando el máximo del tramo, la
            // maniobra se sostiene mientras dura el obstáculo.
            let salida = desplazamientoLibre(pos.x, pos.y + desvio, textos, MARGEN_ESQUIVA);
            for (let k = 1; k <= 2; k++) {
              const p = MotionPathPlugin.getPositionOnPath(
                rawPath,
                posEn(sentido * pasoVista * (k / 2)),
                false
              );
              const s = desplazamientoLibre(p.x, p.y + desvio, textos, MARGEN_ESQUIVA);
              if (Math.abs(s) > Math.abs(salida)) salida = s;
            }
            let objetivo = desvio + salida;
            // Nunca fuera de la capa: antes pasar cerca del texto que salirse de
            // cuadro y dejar la banda vacía.
            const techo = -(pos.y - cfg.alto / 2);
            const piso = h - cfg.alto / 2 - pos.y;
            if (objetivo < techo) objetivo = techo;
            if (objetivo > piso) objetivo = piso;
            desvio += (objetivo - desvio) * (1 - Math.exp(-dt / TAU_ESQUIVA));
          } else if (desvio !== 0) {
            desvio += (0 - desvio) * (1 - Math.exp(-dt / TAU_ESQUIVA));
          }

          const vDesvio = (desvio - desvioPrev) / dt;
          desvioPrev = desvio;

          // ── Pirueta ───────────────────────────────────────────────────────
          if (ahora - tSorteo >= PIRUETA_INTERVALO_MS) {
            tSorteo = ahora;
            const enManiobra = Math.abs(desvio) > 1 || Math.abs(vDesvio) > 8;
            if (
              piruetaFin === 0 &&
              !enManiobra &&
              distanciaAlTexto(pos.x, pos.y + desvio, textos, MARGEN_LIBRE) >= MARGEN_LIBRE &&
              Math.random() < PIRUETA_PROBABILIDAD
            ) {
              piruetaIni = ahora;
              piruetaFin = ahora + PIRUETA_MS_MIN + Math.random() * (PIRUETA_MS_MAX - PIRUETA_MS_MIN);
            }
          }

          let giroBarril = 0;
          if (piruetaFin !== 0) {
            const t = (ahora - piruetaIni) / (piruetaFin - piruetaIni);
            if (t >= 1) piruetaFin = 0;
            // easeInOutQuad sobre una vuelta entera: nace y muere quieta, y el
            // pico de velocidad angular queda en ~24°/frame a 60fps con la
            // pirueta más corta (400ms) — por debajo del tope de 45.
            else giroBarril = 360 * (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
          }

          // ── Rumbo ─────────────────────────────────────────────────────────
          let rot = 0;
          if (cfg.rota) {
            // Sin banqueo el avión se aparta de costado, como un cangrejo: se
            // mueve en vertical sin mirar hacia dónde va.
            let banqueo = (vDesvio / BANQUEO_SATURA) * BANQUEO_MAX;
            if (banqueo > BANQUEO_MAX) banqueo = BANQUEO_MAX;
            else if (banqueo < -BANQUEO_MAX) banqueo = -BANQUEO_MAX;
            if (sentido === -1) banqueo = -banqueo;

            // Yendo al revés el morro tiene que apuntar al revés, o el avión
            // vuela de cola.
            const objetivoRot = pos.angle + cfg.rotBase + (sentido === -1 ? 180 : 0) + banqueo;

            if (Number.isNaN(rotActual)) {
              rotActual = objetivoRot;
            } else {
              // Diferencia por el arco corto y con tope por frame: ni el cierre
              // del recorrido ni una esquiva pueden producir un latigazo.
              let d = ((objetivoRot - rotActual + 540) % 360) - 180;
              if (d > GIRO_MAX_FRAME) d = GIRO_MAX_FRAME;
              else if (d < -GIRO_MAX_FRAME) d = -GIRO_MAX_FRAME;
              rotActual += d;
            }
            rot = rotActual;
          }

          gsap.set(icon, {
            x: pos.x - ancho / 2,
            y: pos.y + desvio - cfg.alto / 2,
            rotation: rot,
            // Siempre presente, aunque valga 0: así el transform es una matriz
            // 3D de punta a punta y el navegador no cambia de tipo de matriz al
            // arrancar una pirueta, que es de donde saldría un parpadeo.
            rotationY: giroBarril,
          });
          // Progreso hacia atrás desde el ícono, con wrap circular: la estela
          // sigue la curva real. Va DETRÁS, así que con sentido -1 "detrás" es
          // hacia adelante en el parámetro de la curva.
          const buf: string[][] = TRAMOS_OPACIDAD.map(() => []);
          for (let i = 0; i < ESTELA_PUNTOS; i++) {
            const q = posEn(-sentido * (i + 1) * ESTELA_SEPARACION);
            const pp = MotionPathPlugin.getPositionOnPath(rawPath, q, false);
            // La estela arrastra la maniobra: el desplazamiento se desvanece
            // hacia atrás en vez de aplicarse entero, así la cola vuelve sola a
            // la curva base. Es una aproximación deliberada — lo exacto sería
            // guardar el histórico de desplazamientos y desfasarlo en el tiempo,
            // pero la estela abarca ~4,6s de vuelo y ese buffer, por 14 aviones,
            // cuesta más de lo que mejora en una línea punteada de fondo.
            const arrastre = i < ESTELA_ARRASTRE ? desvio * (1 - i / ESTELA_ARRASTRE) : 0;
            const coord = `${pp.x.toFixed(1)} ${(pp.y + arrastre).toFixed(1)}`;
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

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
  type LadoSalida,
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

/** Puntos de la estela y separación entre ellos, en unidades de progreso del
 *  recorrido. El producto es el LARGO de la estela: 42 × 0,0037 ≈ 16% del
 *  recorrido.
 *
 *  Se alargó desde el 7% original por los rizos del recorrido (ver
 *  lib/gsap/trayectorias.ts): un rizo mide ~230px de arco y una estela de ~220px
 *  no llegaba a dibujarlo entero nunca. Se veía una curva, no un lazo — que es
 *  justo lo que había que conseguir. */
const ESTELA_PUNTOS = 42;
const ESTELA_SEPARACION = 0.0037;

/** Entradas del histórico de desplazamiento por avión (ver `histT`/`histD`). El
 *  buffer se reparte el tramo de vuelo que abarca la estela, así que 280
 *  entradas cubren la estela entera mida lo que mida el recorrido de la página y
 *  corra la pestaña a 30 o a 120fps. Son 4,5KB por avión, 63KB la flota. */
const HIST_N = 280;

// ── Esquiva de texto ────────────────────────────────────────────────────────

/** Cuántos píxeles por delante mira el avión, y en cuántos puntos se muestrea
 *  ese tramo (el primero es la posición actual).
 *
 *  Es lo que convierte la esquiva en una maniobra y no en un rebote: cuando el
 *  texto entra en el margen, el avión ya viene apartándose desde antes. Subió de
 *  130 a 210 al aparecer TREPADA_MAX: con la trepada acotada, despejar un bloque
 *  alto cuesta ~150px de avance, y mirando solo 130 por delante el avión ya no
 *  llegaba a tiempo. Con 210 hacen falta 4 muestras — a 3 quedaban 105px entre
 *  una y otra y un bloque angosto podía colarse entre dos. */
const VISTA_ADELANTE_PX = 210;
const MUESTRAS = 4;

/** Constante de tiempo del suavizado exponencial del desplazamiento, en
 *  segundos. Con 0,15 la maniobra completa ~95% en 450ms, dentro de la ventana
 *  de 300–600ms pedida, y como es exponencial no tiene principio ni fin brusco:
 *  la velocidad angular nace y muere en cero sola. */
const TAU_ESQUIVA = 0.15;

/** Tope de giro por frame, en grados. */
const GIRO_MAX_FRAME = 45;

/** Paso de tiempo mínimo, en segundos.
 *
 *  `performance.now()` viene con la resolución recortada por el navegador, así
 *  que dos pintadas pueden caer en el MISMO milisegundo. Y no es un caso raro:
 *  pasa en cada reconstrucción, donde `construir()` llama a `pintar()` a mano y
 *  acto seguido `tween.progress()` la dispara otra vez.
 *
 *  Con dt = 0 la velocidad de esquiva sale `0/0 = NaN`, el NaN llega a la
 *  rotación, y `gsap.set` con un NaN DEJA DE ESCRIBIR el transform: el avión
 *  sigue calculando su posición y su estela sigue dibujándose, pero el sprite se
 *  queda clavado para siempre. Medido en esta sesión: 8 de 14 aviones parados al
 *  minuto — y el mismo fallo ya estaba en la rama, porque el banqueo anterior
 *  también propagaba el NaN a `rotActual`, que es acumulador y no se recupera. */
const DT_MINIMO = 0.001;

/** Tope de velocidad vertical de la esquiva, como múltiplo de la velocidad de
 *  vuelo. Es lo que fija el ÁNGULO máximo de la trayectoria real: con 1,0 el
 *  avión nunca trepa más empinado que 45°.
 *
 *  Hace falta porque el suavizado exponencial tiene su velocidad MÁXIMA en el
 *  instante en que aparece el obstáculo —(objetivo−desvío)/τ, que para un bloque
 *  alto son ~1.000px/s contra 46px/s de avance—: el avión subía casi en vertical.
 *  Dibujando la estela desde la curva base eso no se veía; en cuanto la estela
 *  pasó a seguir el vuelo real, el latigazo quedó a la vista.
 *
 *  Fluidez antes que precisión: si con este tope no llega a despejar el bloque,
 *  lo roza. Rozar un párrafo se perdona; un latigazo vertical, no. */
const TREPADA_MAX = 1.0;

/** Constante de tiempo del filtro de la velocidad de esquiva, en segundos. El
 *  rumbo se calcula con la velocidad filtrada y no con la cruda porque el tope
 *  de trepada convierte el arranque de la maniobra en un escalón de velocidad:
 *  sin filtrar, el morro pegaba los 45° enteros en un solo frame. */
const TAU_RUMBO = 0.12;

// ── Piruetas ────────────────────────────────────────────────────────────────

/** Cada cuánto tira el dado cada avión, y con qué probabilidad sale: una pirueta
 *  cada ~12s por avión. Antes eran 2000ms y 0,04 —una cada 50s— y con la flota
 *  repartida en doce bandas la enorme mayoría caían fuera de la pantalla. */
const PIRUETA_INTERVALO_MS = 1500;
const PIRUETA_PROBABILIDAD = 0.12;
const PIRUETA_MS_MIN = 400;
const PIRUETA_MS_MAX = 700;

/** Aire mínimo al texto para tirar el dado. Es una constante propia y NO
 *  MARGEN_LIBRE (los 120px con que se filtra el texto por franja): con 120, seis
 *  de los catorce aviones no hacían una pirueta jamás, porque en su banda no hay
 *  un solo punto del recorrido tan lejos de un bloque de texto. */
const PIRUETA_ESPACIO = 64;

/** Velocidad de esquiva, en px/s, por encima de la cual no se tira el dado: no
 *  se hacen acrobacias en mitad de una maniobra. Antes también bloqueaba tener
 *  cualquier desplazamiento vigente (>1px), y eso descartaba tramos enteros en
 *  los que el avión vuela perfectamente estable, apenas apartado de la curva. */
const PIRUETA_VELOCIDAD_MAX = 30;

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
      let vSuave = 0; // velocidad de esquiva filtrada (ver TAU_RUMBO)
      let rotActual = Number.NaN; // NaN = primer frame: adopta el ángulo real sin girar
      let tPrev = 0;
      let tSorteo = 0;
      let piruetaIni = 0;
      let piruetaFin = 0;

      // Lado por el que el avión decidió pasar el obstáculo que tiene delante.
      // 0 = sin compromiso. Ver el bloque de esquiva en `pintar`.
      let ladoEsquiva: LadoSalida = 0;

      // Histórico de desplazamiento: (instante, desvío) en un anillo preasignado.
      // Es lo que permite dibujar la estela por donde el avión ESTUVO en vez de
      // por la curva base corregida — ver el bloque de estela en `pintar`.
      const histT = new Float64Array(HIST_N);
      const histD = new Float64Array(HIST_N);
      let histEscritos = 0;
      let histUltimo = 0;
      let histPasoMs = 16;

      // Tramo por delante que se prueba cada frame, desde la posición actual
      // hasta VISTA_ADELANTE_PX. Preasignado — nada se reserva por frame.
      const muestraX = new Float64Array(MUESTRAS);
      const muestraY = new Float64Array(MUESTRAS);

      /** Acerca el desplazamiento a `objetivo` con suavizado exponencial y tope
       *  de trepada (ver TREPADA_MAX). */
      function acercarDesvio(objetivo: number, dt: number): void {
        const antes = desvio;
        desvio += (objetivo - desvio) * (1 - Math.exp(-dt / TAU_ESQUIVA));
        const tope = VELOCIDAD_PX_S * TREPADA_MAX * dt;
        const paso = desvio - antes;
        if (paso > tope) desvio = antes + tope;
        else if (paso < -tope) desvio = antes - tope;
      }

      /** Mayor desplazamiento que pide el tramo por delante, saliendo por `lado`.
       *  Se toma el máximo y no el del punto adelantado solo: con una sola mirada,
       *  justo cuando el avión llegaba al texto la vista ya estaba del otro lado y
       *  veía pista libre, así que el desplazamiento volvía a cero encima del
       *  obstáculo. Medido: 11% de las muestras caían dentro de un bloque. */
      function salidaDelTramo(lado: LadoSalida): number {
        let s = 0;
        for (let k = 0; k < MUESTRAS; k++) {
          const v = desplazamientoLibre(
            muestraX[k],
            muestraY[k] + desvio,
            textos,
            MARGEN_ESQUIVA,
            lado
          );
          if (Math.abs(v) > Math.abs(s)) s = v;
        }
        return s;
      }

      function soltar() {
        arrancado = true;
        tween?.play();
      }

      function construir() {
        // Se mide ANTES de tocar el tween. Al revés —matar primero y comprobar
        // el tamaño después— una capa que midiera 0 en ese instante dejaba al
        // avión sin tween y congelado hasta el siguiente cambio de tamaño que
        // superara la banda muerta del ResizeObserver. Medido en la sesión: con
        // la página castigada, aviones parados a 0px/s. Si la capa no tiene
        // tamaño utilizable, lo correcto es seguir volando el recorrido viejo.
        const w = capa!.offsetWidth;
        const h = capa!.offsetHeight;
        if (w < 2 || h < 2) return;
        if (tween) progreso = tween.progress();
        tween?.kill();

        svg!.setAttribute("viewBox", `0 0 ${w} ${h}`);

        const d = construirTrayectoria(trayectoria, w, h, { semilla, banda });
        const rawPath = MotionPathPlugin.stringToRawPath(d);
        MotionPathPlugin.cacheRawPathMeasurements(rawPath);

        // `totalLength` lo deja cacheRawPathMeasurements; si por lo que sea no
        // está, se cae a una duración fija antes que romper la animación.
        const largo = (rawPath as unknown as { totalLength?: number }).totalLength ?? 0;
        const duracion = largo > 0 ? largo / VELOCIDAD_PX_S : 60;

        // Vista adelantada expresada en unidades de progreso de ESTA curva: los
        // 210px son de pantalla, y cada trayectoria tiene un largo distinto.
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

        // Hasta dónde puede apartarse el avión. Se acota a la franja que este
        // avión tiene MEDIDA —su banda más MARGEN_LIBRE—, no al alto de la capa:
        // más allá volaría sobre texto que no midió (`filtrarPorFranja` lo
        // descartó) y encima dejaría su banda vacía, que es exactamente la
        // garantía por la que existen las bandas.
        const limSup = Math.max(cfg.alto / 2, franja.min);
        const limInf = Math.min(h - cfg.alto / 2, franja.max);

        // Cadencia del histórico: se reparten las HIST_N entradas entre los
        // segundos de vuelo que abarca la estela. Muestrear por TIEMPO y no por
        // frame es lo que hace que el buffer cubra siempre la estela entera
        // aunque la pestaña corra a 120fps.
        const estelaMs = ESTELA_PUNTOS * ESTELA_SEPARACION * duracion * 1000;
        histPasoMs = estelaMs / (HIST_N - 1);

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
          const dt =
            tPrev === 0
              ? 1 / 60
              : Math.min(0.05, Math.max(DT_MINIMO, (ahora - tPrev) / 1000));
          tPrev = ahora;

          // ── Esquiva ───────────────────────────────────────────────────────
          // Se evalúa el TRAMO por delante, no el punto donde el avión está, y a
          // cada muestra se le suma el desplazamiento vigente: sin eso el avión
          // pelea contra su propia maniobra y oscila alrededor del borde.
          //
          // Tres reglas, las tres al servicio de la fluidez: mirar un tramo y no
          // un punto (`salidaDelTramo`), comprometerse con un lado y sostenerlo
          // (`ladoEsquiva`) y no trepar más rápido que el avance (TREPADA_MAX).
          if (textos.length > 0) {
            muestraX[0] = pos.x;
            muestraY[0] = pos.y;
            for (let k = 1; k < MUESTRAS; k++) {
              const p = MotionPathPlugin.getPositionOnPath(
                rawPath,
                posEn((sentido * pasoVista * k) / (MUESTRAS - 1)),
                false
              );
              muestraX[k] = p.x;
              muestraY[k] = p.y;
            }

            let salida = salidaDelTramo(ladoEsquiva);
            if (salida === 0) {
              // Pista libre por delante: se suelta el compromiso y el avión
              // vuelve solo a su curva.
              ladoEsquiva = 0;
            } else if (ladoEsquiva === 0) {
              // Se elige lado UNA vez por obstáculo y se sostiene. Sin esto la
              // salida se recalcula por el borde más cercano en cada frame, y ese
              // borde cambia solo con que el avión pase la mitad del bloque: el
              // avión dudaba entre pasar por arriba y por abajo y oscilaba.
              //
              // Y no se elige por el borde más cercano sino por el que tiene
              // SITIO: salir por el lado corto y chocar contra el límite de la
              // franja deja al avión pegado al borde del texto todo el tramo, que
              // es la otra forma de que la maniobra se vea trabada.
              const arriba = salidaDelTramo(-1);
              const abajo = salidaDelTramo(1);
              const yAqui = pos.y + desvio;
              const sobraArriba = yAqui + arriba - limSup;
              const sobraAbajo = limInf - (yAqui + abajo);
              if (sobraArriba < 0 || sobraAbajo < 0) {
                ladoEsquiva = sobraArriba >= sobraAbajo ? -1 : 1;
              } else {
                ladoEsquiva = -arriba <= abajo ? -1 : 1;
              }
              salida = ladoEsquiva === -1 ? arriba : abajo;
            }

            let objetivo = desvio + salida;
            if (objetivo < limSup - pos.y) objetivo = limSup - pos.y;
            if (objetivo > limInf - pos.y) objetivo = limInf - pos.y;
            acercarDesvio(objetivo, dt);
          } else if (desvio !== 0) {
            acercarDesvio(0, dt);
          }

          const vDesvio = (desvio - desvioPrev) / dt;
          desvioPrev = desvio;
          vSuave += (vDesvio - vSuave) * (1 - Math.exp(-dt / TAU_RUMBO));

          // ── Pirueta ───────────────────────────────────────────────────────
          if (ahora - tSorteo >= PIRUETA_INTERVALO_MS) {
            tSorteo = ahora;
            if (
              piruetaFin === 0 &&
              Math.abs(vSuave) < PIRUETA_VELOCIDAD_MAX &&
              distanciaAlTexto(pos.x, pos.y + desvio, textos, PIRUETA_ESPACIO) >= PIRUETA_ESPACIO &&
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
            // Rumbo real: se COMPONEN las dos velocidades, la de la curva y la de
            // la esquiva, y el morro apunta a la suma. Antes se tomaba la tangente
            // de la curva y se le sumaba una inclinación proporcional al
            // desplazamiento —un apaño para que el avión no se moviera de costado
            // como un cangrejo—, que acertaba el gesto pero nunca el ángulo.
            //
            // `marcha` resuelve de paso el sentido inverso: yendo al revés el
            // vector velocidad es el opuesto, y el morro sale apuntando bien sin
            // el +180° que había que sumarle aparte.
            const rad = (pos.angle * Math.PI) / 180;
            const marcha = sentido === -1 ? -1 : 1;
            const vx = Math.cos(rad) * VELOCIDAD_PX_S * marcha;
            const vy = Math.sin(rad) * VELOCIDAD_PX_S * marcha + vSuave;
            const objetivoRot = (Math.atan2(vy, vx) * 180) / Math.PI + cfg.rotBase;

            // `isFinite` y no `isNaN`: además del primer frame (que arranca en
            // NaN a propósito, para adoptar el ángulo real sin girar), cubre
            // cualquier valor no finito que llegara a colarse. `rotActual` es un
            // acumulador, así que sin esto un solo NaN lo deja inservible para
            // siempre y congela el sprite — ver DT_MINIMO.
            if (!Number.isFinite(rotActual) || !Number.isFinite(objetivoRot)) {
              rotActual = Number.isFinite(objetivoRot) ? objetivoRot : 0;
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
          // ── Estela ────────────────────────────────────────────────────────
          // Se guarda el desplazamiento vigente con marca de tiempo. Cada punto
          // de la estela lee después el valor que tenía cuando el avión pasó por
          // ahí, así que la estela es DÓNDE ESTUVO el avión.
          //
          // Antes se desvanecía el desplazamiento ACTUAL sobre los primeros 18
          // puntos. El resultado: el cuerpo de la estela se quedaba en la curva
          // base mientras el avión volaba apartado, con un codo a mitad de cola
          // y el avión suelto por encima. Eso es lo que se veía como una cola
          // despegada — la punta sí estaba pegada, el problema era el resto.
          if (histEscritos === 0 || ahora - histUltimo >= histPasoMs) {
            const w = histEscritos % HIST_N;
            histT[w] = ahora;
            histD[w] = desvio;
            histEscritos++;
            histUltimo = ahora;
          }

          // Progreso hacia atrás desde el ícono, con wrap circular: la estela
          // sigue la curva real. Va DETRÁS, así que con sentido -1 "detrás" es
          // hacia adelante en el parámetro de la curva.
          const buf: string[][] = TRAMOS_OPACIDAD.map(() => []);
          const validos = histEscritos < HIST_N ? histEscritos : HIST_N;
          const retrasoMs = ESTELA_SEPARACION * duracion * 1000;
          // Cursor del anillo. Los instantes que se piden van cada vez más atrás,
          // así que un solo recorrido del buffer por frame alcanza para los 42
          // puntos: no hace falta buscar desde cero en cada uno.
          let cur = 0;
          for (let i = 0; i < ESTELA_PUNTOS; i++) {
            const q = posEn(-sentido * (i + 1) * ESTELA_SEPARACION);
            const pp = MotionPathPlugin.getPositionOnPath(rawPath, q, false);
            const cuando = ahora - (i + 1) * retrasoMs;
            let arrastre = 0;
            if (validos > 0) {
              while (cur + 1 < validos && histT[(histEscritos - 1 - cur) % HIST_N] > cuando) cur++;
              const viejo = (histEscritos - 1 - cur) % HIST_N;
              arrastre = histD[viejo];
              if (cur > 0) {
                // Interpolación con la entrada siguiente. Sin ella la estela se
                // escalona cuando el histórico se muestrea más lento que los
                // puntos que lo consultan.
                const nuevo = (histEscritos - cur) % HIST_N;
                const t0 = histT[viejo];
                const t1 = histT[nuevo];
                if (t1 > t0) {
                  let u = (cuando - t0) / (t1 - t0);
                  if (u < 0) u = 0;
                  else if (u > 1) u = 1;
                  arrastre += (histD[nuevo] - histD[viejo]) * u;
                }
              }
            }
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

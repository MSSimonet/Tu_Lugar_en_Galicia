"use client";

import { useEffect, useRef, useState } from "react";

// Grilla infinita arrastrable — reemplaza al marquee horizontal. Portado desde
// galicia-world-grid.html (referencia del usuario), adaptado a React/TS y a los
// tokens de diseño del proyecto (ver comentario de estilos más abajo).
//
// El pool de celdas se maneja con DOM imperativo (no JSX/estado de React) a
// propósito: "reciclado real de celdas" significa crear/destruir nodos según
// entran y salen del viewport mientras se arrastra, potencialmente muchas veces
// por segundo — recrear elementos React en cada pointermove sería mucho más lento
// que la reconciliación manual que ya usaba la referencia. React solo controla el
// panel de vista ampliada y el ciclo de vida del efecto — sin HUD/texto sobre la
// grilla (pedido explícito del usuario), se abre con doble click sobre una foto.

export interface FotoMuroLlaves {
  src: string;
  alt: string;
}

const PANEL_AUTO_CLOSE_MS = 3000;
const FRICCION = 0.92;
const VELOCIDAD_MINIMA = 0.4;

/** Proporción de la celda (foto + marco), 4:5 — la de una Polaroid. */
const RELACION_CELDA = 375 / 300;
/** Ancho de celda al que se APUNTA. No es un ancho fijo: decide cuántas columnas
 *  entran, y el ancho real se ajusta para que esas columnas llenen la ventana
 *  exacta. Bajarlo da una pared más densa de fotos más chicas; subirlo, menos
 *  fotos y más grandes. Es la única perilla de densidad. */
const ANCHO_CELDA_OBJETIVO = 180;
/** Techo del alto de la ventana. En px y no en vh a propósito: con vh, esconder
 *  la barra de direcciones en móvil cambiaría la cantidad de filas y recolocaría
 *  la grilla a mitad de uso.
 *
 *  Es responsive desde que ANCHO_CELDA_OBJETIVO bajó a 180: con celdas chicas
 *  entraban TRES filas en móvil (594px de ventana en un iPhone SE, el 89% de la
 *  pantalla). 552 es el techo más alto que deja la tercera fila afuera en todo
 *  el rango 320–767px — medido, no estimado; a 553 reaparece a 360px de ancho.
 *  De 768 para arriba se mantiene 640, que ahí nunca llegó a tres filas. */
const ALTO_MAX_MOVIL = 552;
const ALTO_MAX_ANCHO = 640;
/** Mismo corte que usa --muro-margen en globals.css (2cm desde 768px). Se lee del
 *  viewport y NO del ancho del contenedor: el contenedor no es monótono — a 767px
 *  mide 719 y a 768px mide 617, porque el margen salta de 24px a 2cm. Deducir el
 *  breakpoint del contenedor daría el techo equivocado justo en el cruce. */
function altoMaxPara(viewportW: number): number {
  return viewportW >= 768 ? ALTO_MAX_ANCHO : ALTO_MAX_MOVIL;
}
/** Margen de seguridad, en px, para que el redondeo no coma el borde. */
const HOLGURA = 1;

// Cuánto SOBRESALE una celda rotada respecto de su caja sin rotar, como fracción
// del ancho de celda. Es la clave de que antes no hubiera ni una foto entera:
// las celdas se inclinan hasta 6° (ver rotacionParaCelda), así que una celda de
// 300x375 ocupa en pantalla 337x404 y se comía el borde del recuadro aunque la
// grilla estuviera perfectamente alineada. Medido en navegador: 335,3x402,6.
//   ox = (w·cosθ + h·senθ − w) / 2      oy = (w·senθ + h·cosθ − h) / 2
const ROTACION_MAX_RAD = (6 * Math.PI) / 180;
const SOBRESALE_X =
  (Math.cos(ROTACION_MAX_RAD) - 1 + RELACION_CELDA * Math.sin(ROTACION_MAX_RAD)) / 2;
const SOBRESALE_Y =
  (Math.sin(ROTACION_MAX_RAD) - RELACION_CELDA * (1 - Math.cos(ROTACION_MAX_RAD))) / 2;

interface GeometriaGrilla {
  columnas: number;
  filas: number;
  celdaW: number;
  celdaH: number;
  margenX: number;
  margenY: number;
  gap: number;
  alto: number;
}

/** Geometría que hace que, en reposo, entren SÓLO celdas enteras y centradas.
 *
 *  Dos condiciones, y las dos salen del sobresalto de la rotación:
 *    · margen = sobresalto + holgura  → la celda del borde entra completa.
 *    · gap    = 2 · margen            → la celda vecina queda entera AFUERA, y no
 *                                       asoma una punta rotada dentro del cuadro.
 *  Con eso, el ancho de la ventana queda repartido así:
 *      W = n·celdaW + (n−1)·gap + 2·margenX  ⟹  celdaW = (W − 2·h·n) / (n·(1+2·ox))
 *  El alto NO se impone: se deriva de cuántas filas enteras entran bajo altoMax.
 *  Es la única forma de que los dos ejes encajen exacto con celdas de proporción
 *  fija; si se fijaran ancho y alto a la vez el sistema queda sobredeterminado y
 *  siempre sobra una franja que corta la fila o la columna del borde. */
function calcularGeometria(ancho: number, altoMax: number): GeometriaGrilla {
  const columnas = Math.max(
    1,
    Math.round(ancho / (ANCHO_CELDA_OBJETIVO * (1 + 2 * SOBRESALE_X)))
  );
  const celdaW = (ancho - 2 * HOLGURA * columnas) / (columnas * (1 + 2 * SOBRESALE_X));
  const celdaH = celdaW * RELACION_CELDA;
  const margenX = celdaW * SOBRESALE_X + HOLGURA;
  const margenY = celdaW * SOBRESALE_Y + HOLGURA;
  const gap = 2 * margenX;
  const filas = Math.max(1, Math.floor((altoMax + gap - 2 * margenY) / (celdaH + gap)));
  const alto = filas * celdaH + (filas - 1) * gap + 2 * margenY;
  return { columnas, filas, celdaW, celdaH, margenX, margenY, gap, alto };
}

// Textura de papel sutil para el marco — ruido monocromático vía feTurbulence en
// un SVG inline (data URI), sin agregar ningún archivo de imagen al proyecto.
// Opacidad muy baja (0.045): "ligeramente texturizada", no un patrón visible.
const TEXTURA_PAPEL_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E\")";

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

// Inclinación determinística por celda (-6°..+6°) — mismo hash para la misma
// col/row siempre, así la rotación no "salta" al reciclar la celda en el drag.
function rotacionParaCelda(col: number, row: number): number {
  let h = (col * 374761393 + row * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = (h ^ (h >>> 16)) >>> 0;
  const frac = (h % 1201) / 1200; // 0..1
  return frac * 12 - 6; // -6..+6
}

export function MuroLlavesGrid({ fotos }: { fotos: FotoMuroLlaves[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const [panelFoto, setPanelFoto] = useState<FotoMuroLlaves | null>(null);

  // Vista ampliada por doble click: se cierra sola a los 3s exactos. El timer se
  // reinicia/cancela si panelFoto cambia (otro doble click) o se cierra a mano
  // (botón/backdrop) antes de tiempo — evita que un timer viejo cierre un panel
  // que ya no corresponde a esa apertura.
  useEffect(() => {
    if (!panelFoto) return;
    const timer = setTimeout(() => setPanelFoto(null), PANEL_AUTO_CLOSE_MS);
    // Escape para cerrar: es lo que se espera de cualquier vista superpuesta y
    // era la única forma de cerrarla sin mouse (auditoría 2026-07-25, M5).
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelFoto(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [panelFoto]);

  useEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    const plane = planeRef.current;
    if (!root || !viewport || !plane || fotos.length === 0) return;

    // Geometría vigente. Se recalcula cuando cambia el ancho disponible, no en
    // cada render: de ella dependen el tamaño de celda, el alto de la ventana y
    // la posición de reposo.
    let geo = calcularGeometria(root.clientWidth, altoMaxPara(window.innerWidth));
    let pasoX = geo.celdaW + geo.gap;
    let pasoY = geo.celdaH + geo.gap;
    // Reposo: la grilla arranca ENCUADRADA, no en 0,0. Con 0,0 la celda (0,0)
    // quedaba pegada a la esquina y su propia inclinación la dejaba cortada
    // contra el borde — medido: 0 celdas enteras de 4 a 6 visibles.
    let offsetX = geo.margenX;
    let offsetY = geo.margenY;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let velX = 0;
    let velY = 0;
    let rafId: number | null = null;
    const pool = new Map<string, HTMLDivElement>();

    function fotoParaCelda(col: number, row: number): FotoMuroLlaves {
      const n = mod(col * 7 + row * 13, fotos.length);
      return fotos[n];
    }

    function abrirPanel(foto: FotoMuroLlaves) {
      setPanelFoto(foto);
    }

    /** Vuelca la geometría al DOM: tamaño de celda vía variables CSS (el marco y
     *  el viñeteado se derivan de ellas con calc), alto de la ventana, y la
     *  posición de reposo encuadrada. Tira el pool porque las celdas existentes
     *  quedaron con el tamaño y el paso viejos. */
    function aplicarGeometria() {
      geo = calcularGeometria(root!.clientWidth, altoMaxPara(window.innerWidth));
      pasoX = geo.celdaW + geo.gap;
      pasoY = geo.celdaH + geo.gap;
      offsetX = geo.margenX;
      offsetY = geo.margenY;
      root!.style.setProperty("--mlg-celda-w", `${geo.celdaW}px`);
      root!.style.setProperty("--mlg-celda-h", `${geo.celdaH}px`);
      root!.style.setProperty("--mlg-alto", `${geo.alto}px`);
      pool.forEach((el) => el.remove());
      pool.clear();
      render();
    }

    function render() {
      const vw = viewport!.clientWidth;
      const vh = viewport!.clientHeight;
      const buffer = 1;
      const colStart = Math.floor(-offsetX / pasoX) - buffer;
      const colEnd = Math.floor((vw - offsetX) / pasoX) + buffer;
      const rowStart = Math.floor(-offsetY / pasoY) - buffer;
      const rowEnd = Math.floor((vh - offsetY) / pasoY) + buffer;

      const needed = new Set<string>();
      for (let c = colStart; c <= colEnd; c++) {
        for (let r = rowStart; r <= rowEnd; r++) {
          const key = `${c},${r}`;
          needed.add(key);
          if (!pool.has(key)) {
            const foto = fotoParaCelda(c, r);
            const el = document.createElement("div");
            el.className = "mlg-tile";
            el.style.transform = `translate3d(${c * pasoX}px, ${r * pasoY}px, 0)`;

            const polaroid = document.createElement("div");
            polaroid.className = "mlg-polaroid";
            polaroid.style.setProperty("--rot", `${rotacionParaCelda(c, r)}deg`);

            const img = document.createElement("img");
            img.src = foto.src;
            img.alt = ""; // decorativo — se repite al reciclar celdas; el contenido real vive en el <ul> sr-only de abajo
            img.loading = "lazy";
            img.className = "mlg-tile-img";
            polaroid.appendChild(img);
            el.appendChild(polaroid);

            el.addEventListener("dblclick", () => abrirPanel(foto));
            plane!.appendChild(el);
            pool.set(key, el);
          }
        }
      }
      for (const [key, el] of pool) {
        if (!needed.has(key)) {
          el.remove();
          pool.delete(key);
        }
      }
      plane!.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
    }

    function inertia() {
      if (Math.abs(velX) < VELOCIDAD_MINIMA && Math.abs(velY) < VELOCIDAD_MINIMA) {
        rafId = null;
        return;
      }
      velX *= FRICCION;
      velY *= FRICCION;
      offsetX += velX;
      offsetY += velY;
      render();
      rafId = requestAnimationFrame(inertia);
    }

    function onPointerDown(e: PointerEvent) {
      dragging = true;
      viewport!.classList.add("mlg-grabbing");
      lastX = e.clientX;
      lastY = e.clientY;
      velX = 0;
      velY = 0;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      viewport!.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: PointerEvent) {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      offsetX += dx;
      offsetY += dy;
      velX = dx;
      velY = dy;
      lastX = e.clientX;
      lastY = e.clientY;
      render();
    }

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      viewport!.classList.remove("mlg-grabbing");
      rafId = requestAnimationFrame(inertia);
    }

    // Sólo se recalcula si cambió el ANCHO. El alto lo fija la propia grilla, así
    // que un resize vertical (la barra de direcciones del móvil al aparecer y
    // desaparecer) no debe reencuadrar y tirarle el arrastre al usuario.
    let anchoPrevio = root.clientWidth;
    function onResize() {
      if (root!.clientWidth === anchoPrevio) {
        render();
        return;
      }
      anchoPrevio = root!.clientWidth;
      aplicarGeometria();
    }

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointerleave", endDrag);
    window.addEventListener("resize", onResize);

    aplicarGeometria();

    return () => {
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      viewport.removeEventListener("pointerup", endDrag);
      viewport.removeEventListener("pointerleave", endDrag);
      window.removeEventListener("resize", onResize);
      if (rafId !== null) cancelAnimationFrame(rafId);
      pool.forEach((el) => el.remove());
      pool.clear();
    };
  }, [fotos]);

  return (
    <div ref={rootRef} className="mlg-root">
      <style>{`
        .mlg-root {
          position: relative;
          width: 100%;
          /* El alto lo calcula la grilla (filas enteras); el valor de respaldo es
             para el HTML del servidor, que todavía no sabe el ancho disponible.
             Está elegido cerca del resultado real (350-395px) para que el ajuste
             al montar no mueva la página de forma perceptible. */
          height: var(--mlg-alto, 380px);
          overflow: hidden;
          background-color: var(--dz-hero-bg);
          /* Marco Polaroid: laterales y arriba finos y uniformes (8% del ancho del
             tile); abajo notablemente más grueso (21% del alto, rango pedido
             20-22%) — proporción ajustada contra la referencia visual del usuario
             (mockup de Polaroid física). Ahora se derivan del tamaño de celda con
             calc, porque ese tamaño dejó de ser una constante. */
          --mlg-pad-lado: calc(var(--mlg-celda-w, 300px) * 0.08);
          --mlg-pad-abajo: calc(var(--mlg-celda-h, 375px) * 0.21);
        }
        .mlg-viewport {
          position: absolute;
          inset: 0;
          overflow: hidden;
          cursor: grab;
          touch-action: none;
        }
        .mlg-viewport.mlg-grabbing { cursor: grabbing; }
        .mlg-plane { position: absolute; top: 0; left: 0; width: 0; height: 0; will-change: transform; }
        .mlg-tile {
          position: absolute;
          will-change: transform;
        }
        .mlg-polaroid {
          position: relative;
          width: var(--mlg-celda-w, 300px);
          height: var(--mlg-celda-h, 375px);
          box-sizing: border-box;
          padding: var(--mlg-pad-lado) var(--mlg-pad-lado) var(--mlg-pad-abajo);
          /* Gris claro en modo claro, apenas más oscuro en oscuro. Token propio
             porque --dz-hero-text dejó de ser el "crema fijo" que este marco
             asumía: cuando el Hero pasó a seguir el tema, el marco quedó casi
             negro justo en modo claro. Los dos valores salen de la paleta
             (--color-niebla y --dz-borde), ver globals.css. */
          background-color: var(--dz-polaroid-marco);
          background-image: ${TEXTURA_PAPEL_URL};
          border-radius: 2px;
          box-shadow: var(--dz-shadow-md);
          transform: rotate(var(--rot));
          transition: transform .3s ease, box-shadow .3s ease;
        }
        .mlg-polaroid:hover {
          transform: translateY(-4px) rotate(calc(var(--rot) * 0.3));
          box-shadow: var(--dz-shadow-lg);
        }
        /* Viñeteado sutil sobre la foto — inset calcado del padding del marco, así
           cubre exactamente el área de la imagen y no el marco. Estático (no depende
           del hover), refuerza el efecto Polaroid en todo momento. */
        .mlg-polaroid::after {
          content: '';
          position: absolute;
          inset: var(--mlg-pad-lado) var(--mlg-pad-lado) var(--mlg-pad-abajo);
          background: radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,.32) 100%);
          pointer-events: none;
        }
        .mlg-tile-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          /* sepia sutil en ambos estados: refuerza la temperatura cálida de una
             Polaroid real, incluso en el B&W de reposo (efecto "sepia vintage"). */
          filter: grayscale(1) brightness(.72) contrast(1.05) sepia(.15);
          transition: filter .45s ease;
          pointer-events: none;
          user-select: none;
          -webkit-user-drag: none;
        }
        .mlg-polaroid:hover .mlg-tile-img {
          filter: grayscale(0) brightness(.95) contrast(1.05) sepia(.15);
        }
        .mlg-panel {
          position: fixed;
          inset: 0;
          background-color: color-mix(in srgb, var(--dz-hero-bg) 85%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 30;
        }
        .mlg-panel-img {
          max-width: 80vw;
          max-height: 80vh;
          object-fit: contain;
          border-radius: var(--dz-radius-card);
          box-shadow: var(--dz-shadow-lg);
        }
        .mlg-panel-close {
          position: fixed;
          top: 28px;
          right: 32px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid var(--dz-hero-muted);
          background-color: color-mix(in srgb, var(--dz-hero-bg) 40%, transparent);
          color: var(--dz-hero-text);
          cursor: pointer;
          font-size: 16px;
        }
        /* Oculto a la vista pero enfocable — al recibir foco por teclado se
           muestra, para que un usuario sin mouse vea qué acaba de enfocar. */
        .mlg-lista-accesible { position: absolute; bottom: 0; left: 0; margin: 0; padding: 0; list-style: none; z-index: 20; }
        .mlg-lista-accesible button {
          position: absolute; width: 1px; height: 1px; overflow: hidden;
          clip-path: inset(50%); white-space: nowrap; border: 0; padding: 0;
        }
        .mlg-lista-accesible button:focus-visible {
          position: static; width: auto; height: auto; overflow: visible;
          clip-path: none; white-space: normal;
          margin: 6px; padding: 8px 14px; cursor: pointer;
          background-color: var(--dz-hero-text); color: var(--dz-hero-bg);
          border-radius: 999px; font-family: var(--font-dz-ui); font-size: 0.8rem;
          outline: 2px solid var(--dz-accent); outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          .mlg-tile-img { transition: none; }
          .mlg-polaroid { transition: none; }
        }
      `}</style>

      <div ref={viewportRef} className="mlg-viewport" aria-hidden="true">
        <div ref={planeRef} className="mlg-plane" />
      </div>

      {panelFoto && (
        <div
          className="mlg-panel"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPanelFoto(null);
          }}
        >
          <button
            type="button"
            className="mlg-panel-close"
            onClick={() => setPanelFoto(null)}
            aria-label="Cerrar vista ampliada"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- vista ampliada de una imagen ya cargada por el tile; next/image no aporta nada acá */}
          <img src={panelFoto.src} alt={panelFoto.alt} className="mlg-panel-img" />
        </div>
      )}

      {/* Contenido accesible real — las celdas recicladas del fondo son decorativas
          (aria-hidden). Además de nombrar cada foto, ahora cada entrada es un
          <button> que abre la vista ampliada: la grilla se amplía con doble click,
          que no tiene equivalente por teclado, así que sin esto la función era
          inalcanzable sin mouse (auditoría 2026-07-25, M5). Los botones están
          visualmente ocultos pero son enfocables, y se hacen visibles al recibir
          foco (mismo patrón que el enlace "Ir al contenido principal"). */}
      <ul className="mlg-lista-accesible">
        {fotos.map((foto) => (
          <li key={foto.src}>
            <button type="button" onClick={() => setPanelFoto(foto)}>
              Ampliar: {foto.alt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

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

const CELL_W = 300; // vertical/retrato, conjunto foto+marco ~4:5
const CELL_H = 375; // 300:375 = 4:5 exacto
const GAP = 23;
const PANEL_AUTO_CLOSE_MS = 3000;
const STEP_X = CELL_W + GAP;
const STEP_Y = CELL_H + GAP;
const FRICCION = 0.92;
const VELOCIDAD_MINIMA = 0.4;

// Marco Polaroid: laterales y arriba finos y uniformes (8% del ancho del tile);
// abajo notablemente más grueso (21% del alto, rango pedido 20-22%) — proporción
// ajustada contra la referencia visual del usuario (mockup de Polaroid física).
const POLAROID_PAD_SIDE = Math.round(CELL_W * 0.08);
const POLAROID_PAD_BOTTOM = Math.round(CELL_H * 0.21);

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
    return () => clearTimeout(timer);
  }, [panelFoto]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const plane = planeRef.current;
    if (!viewport || !plane || fotos.length === 0) return;

    let offsetX = 0;
    let offsetY = 0;
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

    function render() {
      const vw = viewport!.clientWidth;
      const vh = viewport!.clientHeight;
      const buffer = 1;
      const colStart = Math.floor(-offsetX / STEP_X) - buffer;
      const colEnd = Math.floor((vw - offsetX) / STEP_X) + buffer;
      const rowStart = Math.floor(-offsetY / STEP_Y) - buffer;
      const rowEnd = Math.floor((vh - offsetY) / STEP_Y) + buffer;

      const needed = new Set<string>();
      for (let c = colStart; c <= colEnd; c++) {
        for (let r = rowStart; r <= rowEnd; r++) {
          const key = `${c},${r}`;
          needed.add(key);
          if (!pool.has(key)) {
            const foto = fotoParaCelda(c, r);
            const el = document.createElement("div");
            el.className = "mlg-tile";
            el.style.transform = `translate3d(${c * STEP_X}px, ${r * STEP_Y}px, 0)`;

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

    function onResize() {
      render();
    }

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointerleave", endDrag);
    window.addEventListener("resize", onResize);

    render();

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
    <div className="mlg-root">
      <style>{`
        .mlg-root {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: var(--dz-hero-bg);
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
          width: ${CELL_W}px;
          height: ${CELL_H}px;
          box-sizing: border-box;
          padding: ${POLAROID_PAD_SIDE}px ${POLAROID_PAD_SIDE}px ${POLAROID_PAD_BOTTOM}px;
          /* --dz-hero-text (no --dz-papel): el marco de una Polaroid física es
             siempre claro, no debería invertir a casi-negro en modo oscuro como
             hace --dz-papel — --dz-hero-text es el tono crema fijo del proyecto,
             mismo criterio que ya usa el fondo de este componente (--dz-hero-bg). */
          background-color: var(--dz-hero-text);
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
          inset: ${POLAROID_PAD_SIDE}px ${POLAROID_PAD_SIDE}px ${POLAROID_PAD_BOTTOM}px;
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

      {/* Contenido accesible real — las celdas recicladas del fondo son decorativas (aria-hidden). */}
      <ul className="sr-only">
        {fotos.map((foto) => (
          <li key={foto.src}>{foto.alt}</li>
        ))}
      </ul>
    </div>
  );
}

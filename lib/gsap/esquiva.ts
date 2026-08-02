// Detección de texto y geometría de esquiva para la capa de fondo animada
// (components/ui/FondoAnimado.tsx).
//
// NO reemplaza a lib/gsap/trayectorias.ts: las trayectorias se siguen generando
// igual y siguen siendo la verdad del recorrido. Lo de acá es una capa de
// DESPLAZAMIENTO que se suma encima en tiempo de ejecución. El avión nunca
// abandona su curva: se corre en vertical unos píxeles mientras pasa cerca de un
// bloque de texto y vuelve solo. Por eso el vuelo no se interrumpe ni se
// reinicia — no hay recálculo de path, no hay tween nuevo, no hay salto.
//
// Todo lo que corre por frame evita asignar memoria: los intervalos se acumulan
// en buffers preasignados de módulo. Con 14 aviones a 60fps, un array nuevo por
// avión por frame son 840 arrays por segundo para el recolector, y eso se ve
// como micro-tirones en una animación continua.

export interface RectTexto {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Distancia a la que el avión empieza a apartarse de un bloque de texto. */
export const MARGEN_ESQUIVA = 40;

/** Distancia mínima a cualquier texto para considerar que hay espacio libre.
 *  Es el permiso para hacer una pirueta. */
export const MARGEN_LIBRE = 120;

// Elementos que cuentan como "texto". Se listan por etiqueta y no por una clase
// del proyecto a propósito: la capa vuela por detrás de secciones que no conoce
// y que van a seguir cambiando. Un selector estructural no se desactualiza.
const SELECTOR_TEXTO =
  'h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,button,a,label,dt,dd,summary';

/** Un elemento más chico que esto no molesta a la lectura y no vale una esquiva. */
const LADO_MINIMO = 8;

// ── Caché compartida de mediciones ──────────────────────────────────────────
// Los 14 aviones de Inicio viven en 14 capas apiladas del mismo tamaño y miran
// el mismo texto. Medir por avión serían 14 barridos del DOM con
// getBoundingClientRect, que fuerza layout: decenas de ms en cada reconstrucción.
// Se mide una vez por tamaño de capa y todos leen el mismo array.
//
// Esto NO rompe el requisito de que cada avión evalúe solo: lo compartido es el
// dato medido, no la decisión. Cada avión filtra su banda y decide su propia
// esquiva con su propio estado.
let claveCache = '';
let rectsCache: RectTexto[] = [];

/** Fuerza que la próxima medición vuelva a leer el DOM. */
export function invalidarCacheTextos(): void {
  claveCache = '';
  rectsCache = [];
}

/** Mide los bloques de texto que hay bajo la capa, en coordenadas de la capa. */
export function medirTextos(capa: HTMLElement): RectTexto[] {
  const base = capa.getBoundingClientRect();
  const clave = `${Math.round(base.width)}x${Math.round(base.height)}`;
  if (clave === claveCache) return rectsCache;

  // El hermano con el contenido cuelga del padre de la capa, no de la capa (que
  // es `absolute inset-0` y está vacía salvo el svg y el ícono).
  const raiz = capa.parentElement ?? capa;
  const nodos = raiz.querySelectorAll<HTMLElement>(SELECTOR_TEXTO);
  const out: RectTexto[] = [];

  for (let i = 0; i < nodos.length; i++) {
    const el = nodos[i];
    const texto = el.textContent;
    if (!texto || !texto.trim()) continue;
    const r = el.getBoundingClientRect();
    if (r.width < LADO_MINIMO || r.height < LADO_MINIMO) continue;
    out.push({
      x1: r.left - base.left,
      y1: r.top - base.top,
      x2: r.right - base.left,
      y2: r.bottom - base.top,
    });
  }

  claveCache = clave;
  rectsCache = out;
  return out;
}

/** Se queda con los rectángulos que pueden llegar a afectar a una franja
 *  horizontal. Un avión confinado a su banda no necesita mirar el resto de la
 *  página: con esto la prueba por frame baja de cientos de rectángulos a unos
 *  pocos, que es de dónde sale el presupuesto de tiempo. */
export function filtrarPorFranja(
  rects: readonly RectTexto[],
  yMin: number,
  yMax: number
): RectTexto[] {
  const out: RectTexto[] = [];
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (r.y2 < yMin || r.y1 > yMax) continue;
    out.push(r);
  }
  return out;
}

// ── Buffers de trabajo (sin asignar por frame) ──────────────────────────────
const MAX_INTERVALOS = 64;
const bufA = new Float64Array(MAX_INTERVALOS);
const bufB = new Float64Array(MAX_INTERVALOS);

/**
 * Desplazamiento vertical mínimo que saca al punto (x, y) de todo texto inflado
 * por `margen`. Devuelve 0 si el punto ya está libre.
 *
 * Los intervalos bloqueados se FUSIONAN antes de elegir salida. Sin fusionar,
 * con dos párrafos apilados el avión salía del primero y entraba en el segundo,
 * y el resultado era un zigzag entre los dos en vez de una esquiva.
 */
export function desplazamientoLibre(
  x: number,
  y: number,
  rects: readonly RectTexto[],
  margen: number
): number {
  // 1. Intervalos verticales bloqueados en esta x.
  let n = 0;
  for (let i = 0; i < rects.length && n < MAX_INTERVALOS; i++) {
    const r = rects[i];
    if (x < r.x1 - margen || x > r.x2 + margen) continue;
    bufA[n] = r.y1 - margen;
    bufB[n] = r.y2 + margen;
    n++;
  }
  if (n === 0) return 0;

  // 2. Orden por borde superior (inserción: n es chico y ya viene casi ordenado
  //    porque el DOM se recorre en orden de documento).
  for (let i = 1; i < n; i++) {
    const a = bufA[i];
    const b = bufB[i];
    let j = i - 1;
    while (j >= 0 && bufA[j] > a) {
      bufA[j + 1] = bufA[j];
      bufB[j + 1] = bufB[j];
      j--;
    }
    bufA[j + 1] = a;
    bufB[j + 1] = b;
  }

  // 3. Fusión in-place y búsqueda del intervalo que contiene a y.
  let m = 0;
  for (let i = 1; i < n; i++) {
    if (bufA[i] <= bufB[m]) {
      if (bufB[i] > bufB[m]) bufB[m] = bufB[i];
    } else {
      m++;
      bufA[m] = bufA[i];
      bufB[m] = bufB[i];
    }
  }

  for (let i = 0; i <= m; i++) {
    const arriba = bufA[i];
    const abajo = bufB[i];
    if (y > arriba && y < abajo) {
      // Salida por el borde más cercano.
      return y - arriba <= abajo - y ? arriba - y : abajo - y;
    }
  }
  return 0;
}

/** Distancia del punto al bloque de texto más cercano. Corta apenas encuentra
 *  algo por debajo de `corte`, que es todo lo que hace falta para responder
 *  "¿hay espacio libre acá?" sin recorrer la lista entera. */
export function distanciaAlTexto(
  x: number,
  y: number,
  rects: readonly RectTexto[],
  corte: number
): number {
  let min = Infinity;
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    const dx = x < r.x1 ? r.x1 - x : x > r.x2 ? x - r.x2 : 0;
    const dy = y < r.y1 ? r.y1 - y : y > r.y2 ? y - r.y2 : 0;
    const d = dx === 0 ? dy : dy === 0 ? dx : Math.sqrt(dx * dx + dy * dy);
    if (d < corte) return d;
    if (d < min) min = d;
  }
  return min;
}

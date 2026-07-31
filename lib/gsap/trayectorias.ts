// Trayectorias de la capa de fondo animada (components/ui/FondoAnimado.tsx).
//
// Reemplazan el recorrido del motor anterior (lib/gsap/useFlightWithWake.ts),
// que solo sabía ir de borde izquierdo a borde derecho en línea recta. Acá cada
// ícono recibe un recorrido propio —diagonal, espiral, lóbulos, ocho— generado
// en función del tamaño real de la capa, así escala con el alto de cada página.
//
// TODAS las trayectorias son CERRADAS (el último punto coincide con el primero).
// Es un requisito, no un detalle: el recorrido se reproduce en loop infinito y
// con una curva abierta el ícono daría un salto visible al reiniciar.
//
// TODAS caen además DENTRO del alto de la capa: ninguna tiene tramo oculto. Eso
// es lo que permite una sola velocidad para todo el recorrido. La versión
// anterior tenía trayectorias de cruce con un pasillo de retorno fuera de cuadro
// que había que recorrer 6× más rápido para que el avión no desapareciera medio
// minuto; ver `banda` para el reemplazo y el motivo.

export type TrayectoriaKind =
  | "banda"
  | "diagonal"
  | "espiral"
  | "lobulos"
  | "ocho"
  | "diagonalPrincipal"
  | "diagonalInversa"
  | "rulos"
  | "aleatoria";

/** Franja horizontal de la capa a la que se confina una trayectoria "banda".
 *
 *  Se declara por índice y no por píxeles a propósito: así las bandas cubren el
 *  alto de la capa sin huecos por construcción, y siguen cubriéndolo cuando la
 *  página cambia de alto (imágenes que cargan tarde, acordeones, otro viewport).
 *  Con rangos escritos a mano un typo dejaba una franja sin avión. */
export interface Banda {
  /** 0-based. */
  indice: number;
  total: number;
}

/** Margen relativo contra los bordes de la capa, para que el ícono no quede
 *  cortado a mitad de camino ni roce el borde del viewport. */
const MARGEN = 0.12;

/** Relación ancho/alto máxima de la caja de dibujo.
 *
 *  Sin este tope, la amplitud horizontal se derivaba solo del ancho y la
 *  vertical solo del alto, así que en un contenedor bajo y ancho la figura se
 *  aplastaba: /ciudades a 1024px dejaba una caja de 1024×367 y la espiral salía
 *  de 778×279 — una espiral estirada, ilegible como espiral, apretada en una
 *  franja baja.
 *
 *  Con el tope, cuando el contenedor es bajo la amplitud HORIZONTAL se reduce
 *  en proporción al alto disponible en vez de quedarse fija: la figura se
 *  achica entera y se sigue leyendo completa. En contenedores altos (el caso
 *  normal en móvil) no interviene, porque ahí quien limita es el ancho. */
const ASPECTO_MAX = 1.8;

interface Caja {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

/** Caja de dibujo centrada en la capa, ya con el tope de aspecto aplicado. */
function caja(w: number, h: number): Caja {
  const ry = (h * (1 - 2 * MARGEN)) / 2;
  const rxLibre = (w * (1 - 2 * MARGEN)) / 2;
  return { cx: w / 2, cy: h / 2, rx: Math.min(rxLibre, ry * ASPECTO_MAX), ry };
}

function puntosAPath(puntos: readonly (readonly [number, number])[]): string {
  const [primero, ...resto] = puntos;
  const cabeza = `M ${primero[0].toFixed(1)} ${primero[1].toFixed(1)}`;
  const cuerpo = resto.map((p) => `L ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  return `${cabeza} ${cuerpo} Z`;
}

/** Recorre una función paramétrica cerrada y la vuelca a un path. `f` recibe el
 *  ángulo y devuelve un punto en coordenadas relativas (-1..1). */
function trazar(c: Caja, pasos: number, f: (t: number, ang: number) => [number, number]): string {
  const puntos: [number, number][] = [];
  for (let i = 0; i <= pasos; i++) {
    const t = i / pasos;
    const [ux, uy] = f(t, t * Math.PI * 2);
    puntos.push([c.cx + ux * c.rx, c.cy + uy * c.ry]);
  }
  return puntosAPath(puntos);
}

/** Diagonal en S: cruza la caja de esquina a esquina y vuelve por el otro lado.
 *  La que más se parece a un "vuelo" real — se usa para el avión. */
function diagonal(c: Caja): string {
  const x = (u: number) => (c.cx + u * c.rx).toFixed(1);
  const y = (v: number) => (c.cy + v * c.ry).toFixed(1);
  return [
    `M ${x(-1)} ${y(-1)}`,
    `C ${x(0)} ${y(-1.05)}, ${x(0.25)} ${y(-0.3)}, ${x(1)} ${y(0)}`,
    `C ${x(0.6)} ${y(0.5)}, ${x(-0.35)} ${y(0.45)}, ${x(-1)} ${y(1)}`,
    `C ${x(-1.4)} ${y(0.5)}, ${x(-1.4)} ${y(-0.5)}, ${x(-1)} ${y(-1)}`,
    "Z",
  ].join(" ");
}

/** Espiral que entra hacia el centro y vuelve a salir. Cierra sola porque el
 *  ángulo total es múltiplo exacto de 2π y el radio termina donde empezó. */
function espiral(c: Caja): string {
  const VUELTAS = 3;
  const RADIO_MIN = 0.15;
  return trazar(c, VUELTAS * 72, (t) => {
    // Radio: 1 → RADIO_MIN en la primera mitad, de vuelta a 1 en la segunda.
    const k =
      t <= 0.5
        ? 1 - (t / 0.5) * (1 - RADIO_MIN)
        : RADIO_MIN + ((t - 0.5) / 0.5) * (1 - RADIO_MIN);
    const ang = t * Math.PI * 2 * VUELTAS;
    return [Math.cos(ang) * k, Math.sin(ang) * k];
  });
}

/** Órbita irregular de tres lóbulos — vaivén orgánico, sin centro evidente. */
function lobulos(c: Caja): string {
  return trazar(c, 240, (_t, ang) => {
    // 0.78 de base para que el máximo (0.78 * 1.28 ≈ 1) no se salga de la caja.
    const r = 0.78 * (1 + 0.28 * Math.sin(ang * 3));
    return [Math.cos(ang) * r, Math.sin(ang) * r];
  });
}

/** Lemniscata (ocho acostado) — cruza el centro dos veces por vuelta. */
function ocho(c: Caja): string {
  return trazar(c, 240, (_t, ang) => [Math.sin(ang), Math.sin(ang) * Math.cos(ang)]);
}

/** Sobresalto lateral, en px: cuánto se pasa el recorrido de los bordes
 *  izquierdo y derecho de la capa. Alcanza para que el sprite (≤48px de lado)
 *  quede entero fuera de cuadro en el punto de giro.
 *
 *  Es una constante en PÍXELES y no una fracción del ancho a propósito: cuando
 *  era `w * 0.14` el avión pasaba ~22% de cada pasada fuera de cuadro por los
 *  costados, que es tiempo muerto puro. */
const SOBRESALTO_X = 64;

/** Cruce confinado a una banda: el avión cruza la franja de punta a punta, gira
 *  FUERA de cuadro y vuelve a cruzarla en el otro sentido por un arco distinto.
 *
 *  Reemplaza a las trayectorias `cruce*`, que barrían el alto ENTERO de la capa.
 *  Ese barrido era la causa medida de que en la sección del marcador (282px de
 *  una capa de 3.105) hubiera 0 de 6 aviones en cuadro: cada avión pasaba la
 *  mayor parte del ciclo en otra franja de la página o en el pasillo de retorno,
 *  así que la cobertura dependía de la suerte del timing.
 *
 *  Confinando cada avión a su banda la cobertura pasa a ser geométrica: mientras
 *  las bandas cubran el alto de la capa y ninguna sea más alta que la mitad de
 *  la VENTANA ÚTIL, siempre hay al menos una banda entera en pantalla y el avión
 *  de esa banda no puede estar en otra parte. Ventana útil = viewport menos lo
 *  que ocupa el Header, que es `position: sticky` y nunca devuelve esos píxeles;
 *  quien elige cuántas bandas usar es app/page.tsx, que tiene esa medida.
 *
 *  Forma: una lente (dos arcos entre los mismos dos puntos, uno combado hacia
 *  arriba y otro hacia abajo). No tiene tramo de retorno oculto —los dos arcos
 *  son visibles— así que el avión está en cuadro ~95% del ciclo y la velocidad
 *  puede ser constante en TODO el recorrido, sin el tramo acelerado que hacía
 *  falta cuando el retorno era invisible.
 *
 *  El giro cae en x = ±SOBRESALTO_X, fuera de cuadro: no se ve rebotar. */
function banda(w: number, h: number, b: Banda, semilla: number): string {
  const r = lcg(semilla);
  const alto = h / b.total;
  const yTop = alto * b.indice;
  const yc = yTop + alto / 2;

  // Combado del arco, como fracción de la media banda. Varía con la semilla para
  // que una flota entera a distinta altura no dibuje el mismo arco calcado.
  const amp = (alto / 2) * (0.62 + r() * 0.3);
  // Un cubico cuyos dos controles se desvían `d` de la cuerda al 25% y al 75%
  // alcanza un pico de 0.75*d, así que para un pico de `amp` hace falta amp/0.75.
  const d = amp / 0.75;
  // Espejar el orden de los combados cambia por dónde arranca el avión sin
  // cambiar la figura.
  const signo = r() < 0.5 ? 1 : -1;
  // Asimetría leve del punto de máximo combado: corre la panza del arco hacia un
  // lado, lo que le saca el aire de "onda de seno" perfecta.
  const sesgo = 0.06 * (r() * 2 - 1);

  const x0 = -SOBRESALTO_X;
  const x1 = w + SOBRESALTO_X;
  const span = x1 - x0;
  const f = (n: number) => n.toFixed(1);
  const xa = f(x0 + span * (0.25 + sesgo));
  const xb = f(x0 + span * (0.75 + sesgo));

  return [
    `M ${f(x0)} ${f(yc)}`,
    // Ida: cruza combando hacia un lado.
    `C ${xa} ${f(yc - signo * d)}, ${xb} ${f(yc - signo * d)}, ${f(x1)} ${f(yc)}`,
    // Vuelta: cruza en el otro sentido combando hacia el otro lado.
    `C ${xb} ${f(yc + signo * d)}, ${xa} ${f(yc + signo * d)}, ${f(x0)} ${f(yc)}`,
    "Z",
  ].join(" ");
}

/** Recta de esquina a esquina, ida y vuelta por la misma línea.
 *
 *  El recorrido es cerrado porque vuelve sobre sí mismo: el avión baja, gira y
 *  sube por la misma diagonal. Es a propósito — "línea diagonal recta" pedida
 *  para 2 de los 4 aviones de Inicio.
 *
 *  `principal` va de la esquina superior-izquierda a la inferior-derecha;
 *  la otra usa la anti-diagonal (superior-derecha → inferior-izquierda). Las
 *  dos se cruzan EXACTAMENTE en el centro de la caja, que es lo que garantiza
 *  el cruce de estelas sin depender de la suerte del timing. */
function recta(c: Caja, principal: boolean): string {
  const x1 = c.cx - c.rx;
  const x2 = c.cx + c.rx;
  const yA = principal ? c.cy - c.ry : c.cy + c.ry;
  const yB = principal ? c.cy + c.ry : c.cy - c.ry;
  const f = (n: number) => n.toFixed(1);
  return `M ${f(x1)} ${f(yA)} L ${f(x2)} ${f(yB)} L ${f(x1)} ${f(yA)} Z`;
}

const diagonalPrincipal = (c: Caja) => recta(c, true);
const diagonalInversa = (c: Caja) => recta(c, false);

/** Rulos: figura de Lissajous 5:1. Barre el alto de la capa mientras dibuja
 *  cinco lazos horizontales — el "errático/circular" pedido para los otros dos
 *  aviones. Cerrada por construcción (ambas frecuencias son enteras). */
function rulos(c: Caja): string {
  return trazar(c, 400, (_t, ang) => [Math.sin(ang * 5) * 0.85, -Math.cos(ang)]);
}

/** Trayectorias que se resuelven solo con la caja de dibujo. `banda` y
 *  `aleatoria` quedan afuera porque necesitan datos extra, y los resuelve
 *  `construirTrayectoria`. */
const GENERADORES: Record<Exclude<TrayectoriaKind, "banda" | "aleatoria">, (c: Caja) => string> = {
  diagonal,
  espiral,
  lobulos,
  ocho,
  diagonalPrincipal,
  diagonalInversa,
  rulos,
};

export interface OpcionesTrayectoria {
  /** Semilla de "aleatoria" y de la variación de forma de "banda". */
  semilla?: number;
  /** Obligatoria para `kind: "banda"`; ignorada por el resto. */
  banda?: Banda;
}

export function construirTrayectoria(
  kind: TrayectoriaKind,
  w: number,
  h: number,
  { semilla = 0, banda: franja }: OpcionesTrayectoria = {}
): string {
  if (kind === "banda") {
    // Sin banda declarada se cae a una sola franja del alto completo: sigue
    // siendo un recorrido válido, solo que sin el confinamiento.
    return banda(w, h, franja ?? { indice: 0, total: 1 }, semilla);
  }
  if (kind === "aleatoria") return aleatoria(caja(w, h), semilla);
  return GENERADORES[kind](caja(w, h));
}

/** Ruido determinista: mismo `semilla` ⇒ misma curva. NO se usa Math.random
 *  porque el servidor y el cliente tienen que generar exactamente lo mismo. */
function lcg(semilla: number): () => number {
  let s = (semilla * 1664525 + 1013904223) % 4294967296;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** Vuelo errático: suma de tres armónicos en cada eje. Es cerrada por
 *  construcción —todas las frecuencias son enteras, así que en 2π vuelve al
 *  punto de partida— y cada semilla da un recorrido distinto que barre toda la
 *  caja en vez de repetir una figura reconocible. */
export function aleatoria(c: Caja, semilla: number): string {
  const r = lcg(semilla);
  const arm = [1, 2, 3].map((k) => ({
    k,
    ax: 0.9 / k + r() * 0.35,
    ay: 0.9 / k + r() * 0.35,
    fx: r() * Math.PI * 2,
    fy: r() * Math.PI * 2,
  }));
  const norm = (ejes: "ax" | "ay") => arm.reduce((s, a) => s + a[ejes], 0);
  const nx = norm("ax");
  const ny = norm("ay");
  return trazar(c, 320, (_t, ang) => [
    arm.reduce((s, a) => s + a.ax * Math.cos(a.k * ang + a.fx), 0) / nx,
    arm.reduce((s, a) => s + a.ay * Math.sin(a.k * ang + a.fy), 0) / ny,
  ]);
}

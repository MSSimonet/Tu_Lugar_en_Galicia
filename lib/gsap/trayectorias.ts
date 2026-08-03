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

// ── Rizos (los lazos del dibujo) ────────────────────────────────────────────
//
// El lazo que se ve en la estela es del RECORRIDO, no del sprite: el avión lo
// vuela y por eso queda dibujado. La pirueta de FondoAnimado.tsx es otra cosa
// —el avión gira sobre su propio eje sin moverse del sitio— y no deja rastro.
//
// POR QUÉ VAN DENTRO DE `banda` Y NO MEZCLANDO `espiral`/`ocho`/`rulos`. Esos
// generadores dibujan figuras centradas que barren el alto ENTERO de la capa, y
// eso es exactamente la geometría que hacía que la cobertura dependiera del
// timing (0 de 6 aviones en cuadro en la sección del marcador; ver `banda`).
// Metiéndolos en la flota se recupera el dibujo pero se pierde la garantía.
// El rizo da el mismo lazo sin tocar el confinamiento por franja.
//
// CÓMO SE INSERTA. El rizo es un círculo tangente a la curva, y se intercala en
// la polilínea con el punto base CONGELADO: entra y sale con exactamente la
// misma tangente, así que no hay cúspide ni cambio brusco de rumbo. Como
// MotionPathPlugin reparametriza por longitud de arco, el avión lo recorre a la
// misma velocidad que el resto del vuelo — un rizo de 36px de radio le lleva
// unos 5s a 46px/s, que es un lazo lento, no un latigazo.

/** Radio del rizo. El tope ABSOLUTO hace falta porque el alto de banda sale del
 *  alto de la PÁGINA: sin él, en una página larga el rizo salía más ancho que el
 *  viewport de un móvil. Las dos fracciones lo acotan además contra la banda y
 *  contra el largo del cruce, y el mínimo descarta el rizo que ya no se leería
 *  como lazo. */
const RIZO_RADIO_MAX = 40;
const RIZO_RADIO_MIN = 14;
const RIZO_FRACCION_BANDA = 0.14;
const RIZO_FRACCION_CRUCE = 0.05;

/** Muestras por vuelta. Con radio ≤ 40px el error de cuerda queda en 0,15px. */
const RIZO_PASOS = 36;

/** Muestras por arco del cruce. */
const BANDA_PASOS = 96;

/** Rizo a insertar: dónde (t del arco) y hacia dónde se abre en coordenadas de
 *  PANTALLA (+1 abajo). */
interface Rizo {
  t: number;
  dir: 1 | -1;
}

function bez(t: number, a: number, b: number, c: number, d: number): number {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
}

function bezDer(t: number, a: number, b: number, c: number, d: number): number {
  const u = 1 - t;
  return 3 * u * u * (b - a) + 6 * u * t * (c - b) + 3 * t * t * (d - c);
}

/** Radio que entra en la banda abriendo el rizo hacia `hacia`.
 *
 *  El círculo queda centrado a |tx|·radio del anclaje en la dirección elegida,
 *  así que llega a (1+|tx|)·radio de ese lado y asoma (1−|tx|)·radio del
 *  contrario. Hay que acotar contra los DOS: en móvil —banda alta y cruce corto,
 *  o sea pendientes fuertes— mirando solo el lado propio el rizo se salía por
 *  arriba al abrirse hacia abajo.
 *
 *  Y hay que hacerlo con la tangente y no con un margen fijo: en el vértice del
 *  arco la curva base ya está pegada al borde de la banda (el combado llega al
 *  92% de la media banda), pero ahí la tangente es horizontal, |tx|→1 y el rizo
 *  no asoma NADA por el lado corto. Un margen fijo descartaba justo los rizos
 *  del vértice, que son la mitad de los que se piden. */
function radioQueEntra(
  py: number,
  absTx: number,
  yMin: number,
  yMax: number,
  hacia: 1 | -1
): number {
  const propio = hacia === 1 ? yMax - py : py - yMin;
  const contrario = hacia === 1 ? py - yMin : yMax - py;
  const porPropio = propio / (1 + absTx);
  const porContrario = absTx >= 1 ? Infinity : contrario / (1 - absTx);
  return Math.min(porPropio, porContrario);
}

function insertarRizo(
  puntos: [number, number][],
  px: number,
  py: number,
  tx: number,
  ty: number,
  dir: 1 | -1,
  radioMax: number,
  yMin: number,
  yMax: number
): void {
  // Si por el lado pedido no entra se prueba el otro, y si tampoco se saltea: un
  // rizo aplastado contra el borde de la banda se lee como un error, no como un
  // lazo.
  const absTx = Math.abs(tx);
  let hacia = dir;
  let radio = Math.min(radioMax, radioQueEntra(py, absTx, yMin, yMax, hacia));
  if (radio < RIZO_RADIO_MIN) {
    hacia = hacia === 1 ? -1 : 1;
    radio = Math.min(radioMax, radioQueEntra(py, absTx, yMin, yMax, hacia));
    if (radio < RIZO_RADIO_MIN) return;
  }

  // Normal a izquierda de la tangente: (-ty, tx). Su componente vertical tiene
  // el signo de tx, así que para abrir el rizo hacia el mismo lado de la PANTALLA
  // en la ida y en la vuelta hay que corregir por el sentido de marcha.
  const lado = tx >= 0 ? hacia : -hacia;
  const nx = -ty * lado;
  const ny = tx * lado;
  // Se omiten k=0 y k=RIZO_PASOS: los dos caen sobre el anclaje, que ya está en
  // la polilínea y vuelve a estarla en el punto siguiente del arco.
  for (let k = 1; k < RIZO_PASOS; k++) {
    const ang = (Math.PI * 2 * k) / RIZO_PASOS;
    const s = Math.sin(ang);
    const c = 1 - Math.cos(ang);
    puntos.push([px + (tx * s + nx * c) * radio, py + (ty * s + ny * c) * radio]);
  }
}

/** Vuelca un arco cúbico a la polilínea insertando un rizo en cada `t` pedido.
 *  `desde` permite arrancar en el paso 1 y no repetir el punto de unión entre la
 *  ida y la vuelta. */
function arcoConRizos(
  puntos: [number, number][],
  cx: readonly [number, number, number, number],
  cy: readonly [number, number, number, number],
  rizos: readonly Rizo[],
  radioMax: number,
  yMin: number,
  yMax: number,
  desde: number
): void {
  let sig = 0;
  for (let i = desde; i <= BANDA_PASOS; i++) {
    const t = i / BANDA_PASOS;
    const x = bez(t, cx[0], cx[1], cx[2], cx[3]);
    const y = bez(t, cy[0], cy[1], cy[2], cy[3]);
    puntos.push([x, y]);
    while (sig < rizos.length && rizos[sig].t <= t) {
      const dx = bezDer(t, cx[0], cx[1], cx[2], cx[3]);
      const dy = bezDer(t, cy[0], cy[1], cy[2], cy[3]);
      const largo = Math.hypot(dx, dy);
      if (largo > 0) {
        insertarRizo(puntos, x, y, dx / largo, dy / largo, rizos[sig].dir, radioMax, yMin, yMax);
      }
      sig++;
    }
  }
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
 *  arriba y otro hacia abajo) con dos o tres rizos intercalados. No tiene tramo
 *  de retorno oculto —los dos arcos son visibles— así que el avión está en cuadro
 *  ~95% del ciclo y la velocidad puede ser constante en TODO el recorrido, sin el
 *  tramo acelerado que hacía falta cuando el retorno era invisible.
 *
 *  El giro cae en x = ±SOBRESALTO_X, fuera de cuadro: no se ve rebotar.
 *
 *  Se emite como POLILÍNEA y no como dos cúbicas porque los rizos se insertan en
 *  el marco local de la curva (tangente y normal punto a punto), y para eso hay
 *  que muestrearla igual. La figura base es la misma cúbica de antes, evaluada. */
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
  const signo: 1 | -1 = r() < 0.5 ? 1 : -1;
  const contra: 1 | -1 = signo === 1 ? -1 : 1;
  // Asimetría leve del punto de máximo combado: corre la panza del arco hacia un
  // lado, lo que le saca el aire de "onda de seno" perfecta.
  const sesgo = 0.06 * (r() * 2 - 1);

  const x0 = -SOBRESALTO_X;
  const x1 = w + SOBRESALTO_X;
  const span = x1 - x0;
  const xa = x0 + span * (0.25 + sesgo);
  const xb = x0 + span * (0.75 + sesgo);

  const radioMax = Math.min(
    RIZO_RADIO_MAX,
    alto * RIZO_FRACCION_BANDA,
    span * RIZO_FRACCION_CRUCE
  );
  // Los rizos se acotan contra los bordes de la BANDA, sin margen extra: la curva
  // base ya llega al 92% de la media banda y el sprite ya asoma esos 24px a la
  // banda vecina. Un rizo que respete el mismo límite no empeora nada.
  const yMin = yTop;
  const yMax = yTop + alto;

  // Uno o dos rizos en la ida y uno en la vuelta, siempre entre el 26% y el 78%
  // del arco: así el lazo cae en cuadro y lejos del giro de los extremos.
  //
  // El primero de cada arco se abre hacia el centro de la banda —el lado por el
  // que el arco dejó sitio al combar— y el segundo hacia afuera, para que la
  // flota no dibuje catorce lazos calcados en el mismo sentido. Si afuera no
  // entra, `insertarRizo` lo devuelve hacia adentro solo.
  const rizosIda: Rizo[] = r() < 0.5
    ? [{ t: 0.26 + r() * 0.12, dir: signo }, { t: 0.62 + r() * 0.12, dir: contra }]
    : [{ t: 0.38 + r() * 0.26, dir: signo }];
  const rizosVuelta: Rizo[] = [{ t: 0.34 + r() * 0.3, dir: contra }];

  const puntos: [number, number][] = [];
  // Ida: cruza combando hacia un lado.
  arcoConRizos(
    puntos,
    [x0, xa, xb, x1],
    [yc, yc - signo * d, yc - signo * d, yc],
    rizosIda,
    radioMax,
    yMin,
    yMax,
    0
  );
  // Vuelta: cruza en el otro sentido combando hacia el otro lado. Arranca en el
  // paso 1 para no repetir el punto de unión.
  arcoConRizos(
    puntos,
    [x1, xb, xa, x0],
    [yc, yc + signo * d, yc + signo * d, yc],
    rizosVuelta,
    radioMax,
    yMin,
    yMax,
    1
  );
  return puntosAPath(puntos);
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

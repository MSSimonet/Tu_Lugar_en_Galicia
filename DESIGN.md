# DESIGN.md — Sistema de diseño Tu Lugar en Galicia

> Fuente de verdad derivada del código real: `app/globals.css`, `components/ui/Button.tsx`,
> `components/layout/Header.tsx`, `docs/design-system.md`.
> El `UI Designer` y el `Frontend Developer` usan este archivo como referencia operativa.
> Ante conflicto entre este archivo y el código, el código gana.

> **Changelog 2026-07-18 — migración a Deslumbrante:** el sistema vigente pasó de **Pedra e
> Ouro** (`--po-*`) a **Deslumbrante** (`--dz-*`), aprobado por el usuario tras una exploración
> de ~30 direcciones en `design-drafts/`. Los tokens `--po-*` quedan definidos en
> `app/globals.css` pero **dormidos** (no los consume ningún componente) — permite revertir sin
> pelearse con `git` si hace falta, mismo criterio no-destructivo que ya usaban los sistemas
> `--ae-*`/`--mar-*`. Este archivo reemplaza por completo la versión anterior (que tenía una nota
> de discrepancia fechada 2026-07-16 documentando que §1-§3/§6-§8 describían un sistema
> laton/atlántico/Fraunces/Plus-Jakarta que ya no corría en el sitio real).

---

## 1. Tema visual y atmósfera

**Concepto:** un solo acento cálido (ámbar) sobre tinta/papel neutros, con un hilo oscuro
("bookend") que conecta hero → marcador → CTA final. Menos ornamento que Pedra e Ouro, más
contraste y confianza tipográfica — la paleta hace el trabajo, no la decoración.

**Paleta emocional:**
- Identidad → ámbar único (`--dz-accent`), usado con moderación (CTAs, acentos, nunca fondos grandes)
- Estructura → tinta cálida casi negra (`--dz-ink`) / papel cálido casi blanco (`--dz-papel`)
- Bookend → un mismo tono de tinta oscura fija (`--dz-hero-bg`) recorre hero, marcador y CTA final
- Territorio → las fotos/video reales de cada ciudad hacen el trabajo emocional, no un color "territorial" separado

**Tono visual:** editorial, confiado, tecnológico sin ser frío. Sigue sin ser una landing de SaaS
genérica — el acento único y las fotografías/videos reales evitan el look de plantilla.

---

## 2. Paleta de color y roles

Los valores de referencia son los del bloque `@theme` "Deslumbrante" en `app/globals.css`
(justo después del bloque Pedra e Ouro, ahora dormido).

### Modo claro

| Token CSS | Hex | Rol |
|---|---|---|
| `--dz-ink` | `#16140F` | Texto principal — AA 16.89:1 sobre `--dz-papel` |
| `--dz-papel` | `#F7F5F0` | Fondo de sección |
| `--dz-luz` | `#FFFFFF` | Fondo de tarjeta/superficie |
| `--dz-muted` | `#6B6558` | Texto secundario — AA 5.31:1 sobre `--dz-papel` |
| `--dz-borde` | `#DCDAD5` | Bordes y divisores |
| `--dz-accent` | `#E0932E` | Acento único de marca — fijo, no invierte |
| `--dz-accent-hover` | `#C27A1F` | Hover/press sobre acento — fijo |
| `--dz-accent-text` | `#945A18` | Texto AA sobre `--dz-papel` (4.93:1 sobre #F0F0F0; oscurecido de #9C5F19 el 2026-08-18 para despejar margen) — en dark usa `--dz-accent` directo |
| `--dz-accent-ink` | `#16140F` | Texto sobre botón `--dz-accent` — AA 7.35:1 |
| `--dz-hero-bg` | `#16140F` | Bookend fijo: hero, `ElMarcador`, CTA final |
| `--dz-hero-text` | `#F3EFE4` | Texto sobre `--dz-hero-bg` — fijo |
| `--dz-hero-muted` | `rgba(243,239,228,.7)` | Texto secundario sobre `--dz-hero-bg` |

### Modo oscuro (swapeo vía clase `.dark` en `<html>`)

| Token CSS | Hex oscuro | Nota |
|---|---|---|
| `--dz-papel` | `#0E0D0B` | Fondo de sección en dark |
| `--dz-luz` | `#1B1913` | Tarjetas en dark |
| `--dz-ink` | `#F3EFE4` | Texto principal en dark |
| `--dz-muted` | `#9C9484` | Texto secundario en dark — AA 6.46:1 |
| `--dz-borde` | `#292825` | Bordes en dark |
| `--dz-accent-text` | `= var(--dz-accent)` | El ámbar crudo ya es AA sobre fondo oscuro (7.75:1) |

`--dz-accent`, `--dz-accent-hover`, `--dz-accent-ink`, `--dz-hero-*` **no tienen override en
`.dark`** — son fijos en ambos temas, igual filosofía que `--po-ouro`/`--po-hero-*` antes.

### Capa "chrome" (Header/Footer — siempre oscura, independiente del toggle)

Header y Footer **no usan `--dz-*`**: consumen una familia de tokens separada e intencionalmente
fija en ambos temas (`app/globals.css`, comentario "el header es siempre oscuro"). Se retiñeron
sus valores hacia el mismo ámbar, sin tocar `Header.tsx`/`Footer.tsx`:

| Token CSS | Hex nuevo | Rol |
|---|---|---|
| `--color-header-bg` / `--color-footer-bg` | `#16140F` / `#14120F` | Fondo siempre oscuro |
| `--color-laton` | `#C27A1F` | **Hover** de los botones acento — 5.34:1 con `--laton-ink` |
| `--color-laton-claro` | `#E0932E` | Wordmark, links activos y **reposo** de los botones acento — 7.35:1 sobre `#16140F` |
| `--laton-ink` | `#16140F` | Texto sobre los botones acento de la capa chrome — fijo, no invierte |
| `--color-laton-oscuro` | `#9C5F19` | Hover |
| `--color-laton-borde` | `#7A5230` | Bordes estructurales del header |
| `--color-nav-muted` / `--color-header-active` / `--color-sobre-laton` / `--color-footer-border` | sin cambios | Neutros ya seguros, no necesitaban retinte |

#### Excepción: la BANDA del header ya no es siempre oscura (nav flotante, 2026-08-03)

El rediseño del nav mete los links en una **pastilla oscura que flota** sobre la banda del header.
Eso solo se lee si la banda contrasta con la pastilla, y por eso **la banda —y solo la banda— pasa
a aclararse en tema claro**. Es la primera y única grieta en "la capa chrome es siempre oscura".

Medido, no estimado: banda clara `#E8DFCC` contra pastilla `#16140F` da **13,90:1**. Con la banda
oscura de antes el par quedaba en **1,03:1**, o sea la pastilla desaparecía.

En tema oscuro el problema no tiene solución por tono: banda y pastilla son las dos casi negras y
forzando la pastilla hasta `#241C13` sobre banda `#100B06` se llega a **1,17:1**. Dos superficies
muy oscuras no producen ratio. Ahí la separación la hace un **borde** (`--color-laton-borde`), que
es vocabulario que el header ya usaba, más la sombra.

Tokens nuevos, todos en `app/globals.css`, **sin prefijo `--color-`** por la poda de Tailwind v4
(§14.1): `--nav-banda`, `--nav-ink`, `--nav-muted`, `--nav-banda-borde`, `--nav-agenda-hover`,
`--nav-pastilla`, `--nav-pastilla-ink`, `--nav-pastilla-activo`, `--nav-pastilla-borde`.

**No se tocó ningún token existente.** En particular `--color-header-bg` sigue igual porque además
del Header lo consumen Footer (vía `--color-footer-bg`), `GinaWidget` y `VistaEnVivo`.

**Consecuencia asumida y aprobada:** en tema claro el header queda claro y **el Footer sigue
oscuro**. Si algún día se quiere coherencia arriba/abajo, el cambio es del Footer y de sus tokens,
y hay que volver a medir sus contrastes — no basta con reusar `--nav-*`.

**Dos valores del mockup no se adoptaron tal cual:**
- `#6B6558` como muted de tema claro daba **4,37:1** sobre la banda: no llega a AA para texto
  normal. Se usa `#615B4E` → **5,09:1**.
- El acento **no puede usarse como color de texto sobre la banda clara**: `#E0932E` sobre
  `#E8DFCC` es **1,89:1**. El acento solo aparece como relleno de botón (con `--laton-ink`
  encima) o dentro de la pastilla oscura.

**Breakpoint de escritorio: `xl` (1280px), no `lg` (1024px).** Medido: a 1024px la fila desborda
52px (`scrollWidth` 1076). Para que entrara habría que bajar el nav a 10px, por debajo del suelo
de 12px que verifica la auditoría de diseño. Es la misma conclusión a la que ya había llegado la
versión anterior del Header.

**Decisión deliberada — wordmark sin cambio de tipografía:** el wordmark/tagline de Header y
Footer usa `fontStyle: 'italic'` sobre Cormorant Garamond. `Jost` (la nueva display, ver §3) no
tiene corte itálico cargado — cambiar la fuente ahí produciría una itálica falsa (oblicua,
sintetizada por el navegador), una regresión tipográfica real. Se deja Cormorant Garamond
italic intacto; solo cambia el color (automático, vía el retinte de arriba).

### Apps Útiles (`--au-*`) — retinte de color únicamente

`--au-accent` → `#E0932E` (= `--dz-accent`), `--au-accent-text` → `#945A18` (= `--dz-accent-text`), `--au-border`/
`--au-border-strong` → `rgba(224,147,46,...)`. El resto de `--au-*` (fondos/textos neutros)
queda igual — ya eran seguros. Cero cambios en `components/apps/**`.

> **Decisión (auditoría de diseño 2026-07-19): Apps Útiles es un micrositio utilitario
> deliberado, no deuda del sistema.** Es la única página pública que abre con hero claro (todas
> las demás usan el bookend oscuro `--dz-hero-bg`), conserva su identidad tipográfica propia
> (Lora + Work Sans vía `--font-au-*`) y usa emojis como iconografía en vez de Lucide. Se
> acepta así: funciona como directorio/herramienta de consulta, distinto del recorrido
> narrativo del resto del sitio. Los agentes NO deben "corregir" estas diferencias hacia el
> sistema Deslumbrante sin pedido explícito del usuario — el puente `--au-*` → tokens `dz`
> de arriba es la única integración pactada.

### Jerarquía de uso

1. **Identidad de marca** (CTA primario, acentos): `dz-accent` / `dz-accent-hover` — con moderación, nunca como fondo grande
2. **Fondos y estructura**: `dz-papel` (sección), `dz-luz` (tarjeta), `dz-hero-bg` (bookend fijo: hero/marcador/CTA final)
3. **Texto**: `dz-ink` sobre claro, `dz-hero-text` sobre `dz-hero-bg` (fijo, no `dz-ink`)
4. **Texto secundario**: `dz-muted`
5. **Chrome (header/footer)**: familia `--color-laton*`/`--color-header-*`/`--color-footer-*`, siempre oscura, independiente del toggle

### Contrastes WCAG (fórmula de luminancia relativa, verificados no asumidos)

- `dz-ink` sobre `dz-papel` (claro): **16.89:1** — AAA
- `dz-muted` sobre `dz-papel` (claro): **5.31:1** — AA
- `dz-accent-text` sobre `dz-papel`: **4.74:1** — AA
- `dz-accent-ink` sobre `dz-accent` (botón): **7.35:1** — AAA
- `dz-ink` sobre `dz-papel` (oscuro): **16.91:1** — AAA
- `dz-muted` sobre `dz-papel` (oscuro): **6.46:1** — AAA
- `dz-accent` crudo sobre `dz-papel` oscuro (texto): **7.75:1** — AAA
- `dz-accent` crudo sobre `dz-papel` claro — decorativo únicamente, **2.30:1**, no usar como texto pequeño (igual que pasaba con `po-ouro` crudo)

---

## 3. Tipografía

### Familias

| Variable | Stack | Uso |
|---|---|---|
| `--font-dz-display` | `Unbounded` → `Jost` → `Montserrat` → `system-ui` | Titulares — toda la web |
| `--font-dz-ui` | `Inter` → `Lato` → `Helvetica Neue` → `system-ui` | UI, navegación, botones, cuerpo de texto — toda la web |

> **Changelog 2026-07-18 (sesión 2) — Unbounded reemplaza a Jost como display:** al aplicar
> `design-drafts/deslumbrante/index.html` fielmente sobre el Home real, el usuario confirmó
> explícitamente el cambio de tipografía (el mockup específico usa Unbounded + Inter, no
> Jost + Lato). Se agregó `Unbounded` vía `next/font/google` en `app/layout.tsx`
> (`--font-unbounded`, pesos 500-800) y se repuntó `--font-dz-display` para usarla primero,
> con Jost como fallback en el propio token (no se borra, mismo criterio no-destructivo de
> siempre).

> **Changelog 2026-07-18 (sesión 3) — Inter reemplaza a Lato como UI, y el "two-tier" de abajo
> queda superado — se extiende a toda la web:** el usuario pidió explícitamente propagar
> Unbounded/Inter y el lenguaje visual de Deslumbrante a **todo el sitio**, incluyendo Header,
> Footer y el widget de Gina (fuera de alcance en la sesión 2). Se agregó `Inter` vía
> `next/font/google` (`--font-inter`, pesos 400-700) y se repuntó `--font-dz-ui` para usarla
> primero, con Lato como fallback en el propio token. Un sweep mecánico reemplazó
> `var(--font-lato)`/`var(--font-ui)`/`font-[family-name:var(--font-ui)]` por
> `var(--font-dz-ui)` en 38 archivos públicos (páginas + componentes + `Header.tsx`/`Footer.tsx`
> + `Button.tsx`/`Accordion.tsx`/`Eyebrow.tsx`), y los titulares en `var(--font-playfair)` no
> itálicos de 18 archivos más pasaron a `var(--font-dz-display)` — preservando cada itálica real
> existente (ver "Excepción deliberada" abajo, sin cambios en el criterio). El párrafo "Páginas
> secundarias/utilitarias" de más abajo describe la decisión **anterior** (sesión 2), ya superada:
> hoy no hay distinción de dos niveles, toda página pública usa `--font-dz-display`/`--font-dz-ui`.
>
> **Excluidos deliberadamente del sweep** (no forman parte del sistema Deslumbrante):
> `/admin/**` y `components/admin/**` (herramienta interna, sigue en `--font-ui`/Plus Jakarta,
> nunca se tocó — verificado que `components/ui/Button.tsx` no se importa desde admin antes de
> barrer su fuente), `app/apps-utiles/page.tsx` + `components/apps/**` (identidad tipográfica
> propia Lora+Work Sans, documentada como distinta desde antes). `GinaWidget.tsx` recibió un
> único `fontFamily: 'var(--font-dz-ui)'` en la raíz del panel — cascada por herencia CSS a
> `GinaConversation`/`GinaMessages`/`GinaInput`/`GinaButtons` sin tocar ninguno de esos archivos
> (NO-TOCAR.md §3: forma/color/animación sí, funcionamiento no).
>
> **Header/Footer — matiz real, no un olvido:** el wordmark y los nav links (`Header.tsx`) siguen
> en Cormorant Garamond a propósito — es un tratamiento tipográfico ya existente y deliberado
> (serif elegante para navegación/wordmark), **no** parte del sweep de `--font-ui`→`--font-dz-ui`
> porque nunca usaron ese token (usan `var(--font-cormorant)` directo). Solo el CTA "Hablar con
> Gina" y un puñado de textos de soporte en el chrome usaban `--font-ui` y ahora heredan Inter.

> **Precisión (auditoría de diseño 2026-07-19) — el wordmark es pieza de marca con familia
> propia:** se ratifica que Cormorant Garamond en el wordmark "Tu Lugar en Galicia"
> (Header + Footer) es identidad de marca, no deuda a unificar — es la tercera y única familia
> permitida fuera de `--font-dz-display`/`--font-dz-ui` (aparte de la itálica de acento en
> Playfair, documentada arriba). Matiz de implementación detectado: el párrafo anterior dice
> que usa `var(--font-cormorant)`, pero el código real hardcodea el string
> `'Cormorant Garamond', Georgia, serif` en 3 lugares (`Header.tsx` ×1, `Footer.tsx` ×2).
> El token `--font-cormorant` existe y carga la misma fuente — cuando se toque ese código por
> otro motivo, apuntar los 3 sitios al token. No urgente: hoy renderizan idéntico.

**Por qué Jost y no una fuente nueva (decisión original de sesión 1, superada):** ya estaba
cargada en `app/layout.tsx` (`--font-jost`, pesos 600-900), dormida, reservada para el sistema
"Atlántico Editorial" que nadie usa. Cero costo de red/CSP nuevo.

**Excepción deliberada — itálica real en vez de itálica falsa:** ni `Unbounded`/`Jost` ni
`Inter`/`Lato` se cargaron con estilo itálico (`app/layout.tsx` no declara `style: ["italic"]`
para ninguna de las cuatro). Donde el diseño pide texto en itálica real (la palabra "puerta
abierta..." en el hero, "ya existe." en `ComoFuncionaStepper.tsx`, el "no" de
`LoQueNoSomos.tsx`, el nombre de ciudad en las tarjetas de `app/ciudades/page.tsx`, la cita de
`Testimonios.tsx`), se usa `var(--font-playfair)` explícito — que sí tiene corte itálico
cargado — en vez de forzar una itálica sintetizada. Se auditó cada ocurrencia de
`var(--font-playfair)` restante tras el sweep de sesión 3: todas son itálicas reales
verificadas, ninguna quedó huérfana.

### Escala tipográfica, interlineado y tracking

Sin cambios — misma escala genérica `--text-*`/`--leading-*`/`--tracking-ui` de siempre (no es
específica de un sistema de color/tipografía, ver `app/globals.css`).

---

## 4. Estilos de componentes

### Button (`components/ui/Button.tsx`)

Misma estructura de antes (3 variantes × 3 tamaños, siempre `rounded-pill`, construido sobre
`motion.button`), solo cambiaron los nombres de variable:

| Variante | Fondo | Texto | Hover |
|---|---|---|---|
| `primario` | `--dz-accent` | `--dz-accent-ink` | `--dz-accent-hover` |
| `secundario` | `--dz-ink` | `--dz-luz` | ink –15% dark |
| `fantasma` | transparente | `--dz-accent-text` | bg `--dz-accent-text` / text `--dz-luz` |

### Header (`components/layout/Header.tsx`) / Footer (`components/layout/Footer.tsx`)

**Arquitectura que la versión anterior de este archivo nunca documentó correctamente:** Header y
Footer **no consumen `--dz-*`**. Usan una familia de tokens separada (`--color-header-bg`,
`--color-laton*`, `--color-footer-*`) que permanece **siempre oscura en ambos temas** — ver
comentarios en `app/globals.css`. Es deliberado: el chrome del sitio no invierte con el toggle
claro/oscuro, solo el contenido de página lo hace. Ver tabla de retinte en §2.

- **Fondo:** `--color-header-bg` (#16140F) / `--color-footer-bg` (#14120F) — siempre oscuro
- **Wordmark:** `aldaba-tlg.png` (con alfa real; sustituye a `aldaba.png`, que traía el fondo
  negro incrustado y se veía como un recuadro oscuro sobre la banda clara del nav rediseñado)
  + "Tu Lugar / en Galicia" en Cormorant Garamond italic (sin cambios
  de fuente, ver §3), color `--color-laton-claro` (ahora ámbar)
- **Nav links:** Cormorant, uppercase, tracking 0.1em, `--color-nav-muted` inactivo →
  `--color-laton-claro` activo/hover
- **CTA "Hablar con Gina":** pill `--color-laton-claro`, texto `--laton-ink`, dispara
  `CustomEvent('gina:open')` — **no tocar la lógica**, solo hereda el nuevo color automáticamente
- **Toggle claro/oscuro:** botón Sun/Moon (`lucide-react`), `document.documentElement.classList.toggle('dark')` + `localStorage.setItem('tlg-theme', ...)` — sin cambios, ya funcionaba

### Tarjetas de ciudad (grid "Otras ciudades" en `components/ciudades/CiudadLayout.tsx`)

- Fondo: `--dz-luz`, borde `--dz-borde`, radio `--dz-radius-card` (20px, antes 12px con Pedra e Ouro)
- Foto real de portada + gradiente inferior para legibilidad del nombre superpuesto
- Título en `--font-dz-display`, hover con elevación (`motion`, solo `transform`/`opacity`)
- Prefetch de video al hover/touchstart (`lib/ciudades/videoPrefetch.ts`) — sin cambios

### GinaWidget (`components/gina/*`)

- **NO-TOCAR:** la lógica de conversación (`lib/gina/**`, `app/api/gina/**`) está protegida —
  solo forma/color/animación del widget son editables
- Hereda automáticamente `--color-laton`/`--color-sobre-laton` (capa chrome) en los botones que
  ya usaban esos tokens — sin cambios de código necesarios
- Trigger: `CustomEvent('gina:open')`, mismo mecanismo en Header, Hero y CTA final

### FAQAccordion

`components/ciudades/FAQAccordionPedraEOuro.tsx` es un wrapper delgado sobre
`components/ui/Accordion.tsx` (Radix, accesible: teclado, ARIA, altura animada real). Tokens
`--dz-borde`/`--dz-luz`/`--dz-ink`/`--dz-accent`/`--dz-accent-text`/`--dz-muted`.

### MetricCard / `ElMarcador`

- Número: `--font-dz-display`, color `--dz-hero-text` (fijo — el fondo `--dz-hero-bg` tampoco
  invierte, necesita texto igual de fijo)
- Etiqueta: `--font-dz-ui`, `--dz-hero-text`
- **Nuevo — conteo animado:** cada cifra (las 3 "trayectoria" fijas y las 4 dinámicas de
  `/api/marcador`) cuenta desde 0 hasta su valor real cuando el marcador entra en viewport
  (`onViewportEnter`, una sola vez), 400ms, easing de marca, gateado por `useReducedMotion()`
  (ver `components/home/ElMarcador.tsx`, componente `CifraAnimada`). Las dinámicas esperan a que
  `loading` sea `false` antes de arrancar, nunca cuentan desde un valor stale.
- Fondo de banda: `--dz-hero-bg` (antes `--po-terra`) — une hero → marcador → CTA final en un
  solo hilo oscuro, ver §1

### Titular del hero (`components/home/HeroPedraEOuro.tsx`)

- **Nuevo — kinético palabra por palabra:** el `<h1>` reusa las variants compartidas
  `staggerContainer`/`fadeUp` (`lib/motion/variants.ts`), cada palabra entra con `fadeUp` (400ms,
  easing de marca), escalonada 70ms entre palabras. Gateado por `useReducedMotion()` — texto
  plano sin animación si el usuario lo pide. El copy real no cambió, solo cómo se trocea en
  markup para animar.

---

## 5. Principios de layout

Sin cambios respecto a la versión anterior salvo:
- `radius-card` pasa de 12px (Pedra e Ouro) a **20px** (`--dz-radius-card`) — tarjetas más
  suaves/generosas, consistente con el mockup aprobado.
- Resto de la escala de espaciado (`space-*`) y contenedores (`max-w-7xl`, etc.) sin cambios —
  no son específicos de un sistema de color.

---

## 6. Profundidad y elevación

### Sombras — fórmula `--dz-shadow-*`

Mismo mecanismo que Pedra e Ouro (`color-mix` con el bookend oscuro, no negro puro):

```css
--dz-shadow-sm: 0 1px 3px color-mix(in srgb, var(--dz-hero-bg) 12%, transparent);
--dz-shadow-md: 0 4px 12px color-mix(in srgb, var(--dz-hero-bg) 18%, transparent);
--dz-shadow-lg: 0 12px 32px color-mix(in srgb, var(--dz-hero-bg) 24%, transparent);
```

Funciona igual en claro y oscuro sin necesitar overrides bajo `.dark` (`--dz-hero-bg` es fijo).

### Superficies

| Superficie | Color de fondo | Uso |
|---|---|---|
| Header / Footer (chrome) | `--color-header-bg` / `--color-footer-bg` | Siempre oscuro, independiente del tema |
| Hero / Marcador / CTA final (bookend) | `--dz-hero-bg` | Fijo, mismo hilo oscuro en las 3 secciones |
| Sección de contenido | `--dz-papel` | Ciudades, testimonios, FAQ |
| Tarjeta | `--dz-luz` | Cards, acordeón |

---

## 7. Qué hacer y qué no

### Hacer

- Usar siempre `var(--dz-*)` — nunca hexadecimales hardcodeados en componentes nuevos
- Un solo acento (`dz-accent`) por vista — no mezclar con colores decorativos nuevos
- Reusar `BRAND_EASE` (`cubic-bezier(0.4, 0, 0.2, 1)`, `lib/motion/variants.ts`) en toda animación nueva — no inventar curvas
- Entradas de contenido ≤400ms, micro-interacciones ≤200ms (skill `motion-tu-lugar-en-galicia`)
- `useReducedMotion()` de `motion/react` en todo componente `'use client'` que anime
- Animar solo `transform`/`opacity` — nunca `width`/`height`/`margin`/`top`/`left` (layout shift real)
- Verificar contraste WCAG AA con los ratios del §2 antes de usar un color en texto
- Voz de marca: segunda persona "tú" neutro en todo el copy visible

### No hacer

- No tocar la lógica de `components/gina/**`, `lib/gina/**`, `app/api/gina/**` — solo forma/color/animación (ver NO-TOCAR.md si existe en la rama de trabajo activa)
- No usar `fontStyle: 'italic'` sobre `--font-dz-display`/`--font-dz-ui` (Jost/Lato no tienen corte itálico cargado) — usar `--font-playfair` para itálica real
- No migrar Header/Footer a `--dz-*` — su capa "chrome" es intencionalmente separada y siempre oscura
- No usar `--dz-accent` crudo como texto pequeño sobre `dz-papel` claro — usar `--dz-accent-text`
- No animar con duraciones >400ms salvo modales/cargas con progreso real
- No usar "vos" ni "vosotros" en ningún texto visible
- No usar `any` en TypeScript — ver reglas ECC

---

## 8. Comportamiento responsive

Sin cambios respecto a la versión anterior en breakpoints/estructura (`md:`/`lg:`/`xl:`, grid del
header, foco trampa del menú mobile, columnas de tarjetas). El único cambio de superficie es de
color (chrome siempre oscuro con los nuevos valores de §2), no de layout.

---

## 9. Guía de prompts para agentes

### Frontend Developer — nuevo componente

```
Activá el Frontend Developer. Crear <NombreComponente> siguiendo DESIGN.md.
Paleta: usar solo var(--dz-*) de globals.css (o la capa chrome --color-laton*/--color-header-*
si es Header/Footer). Tipografía: font-dz-display para titulares, font-dz-ui para UI — nunca
fontStyle:italic sobre esas dos, usar font-playfair si hace falta itálica real.
Border-radius: dz-radius-card (tarjetas) o radius-pill (botones).
Animación: reusar BRAND_EASE y las variants de lib/motion/variants.ts, useReducedMotion()
obligatorio. Tocar solo components/<carril>. Cuando termines, resumí qué cambiaste y para.
```

### UI Designer — nuevo token o componente de diseño

```
Activá el UI Designer. Agregar token <nombre> al bloque @theme "Deslumbrante" de app/globals.css.
Respetar la jerarquía de la paleta (§2 de DESIGN.md): un solo acento dz-accent, fondos en
dz-papel/dz-luz, bookend fijo dz-hero-bg para hero/marcador/CTA final. Verificar contraste WCAG
AA antes de proponer el hex. Tocar solo app/globals.css (bloque @theme). Cuando termines, para.
```

### Accessibility Auditor — revisión de contraste

```
Activá el Accessibility Auditor. Verificar todos los textos en <archivo> contra los ratios
del §2 de DESIGN.md. Mínimo: AA (4.5:1 normal text, 3:1 large text). Foco visible en todos
los interactivos. Reportá hallazgos con selector CSS y ratio medido. Solo revisar, no modificar.
```

### Brand Guardian — validación de copy nuevo

```
Activá el Brand Guardian. Validar el copy de <sección> contra DESIGN.md §7 (Do's and Don'ts)
y la skill voz-tu-lugar-en-galicia: "tú" neutro, nunca "vos"/"vosotros", tono cálido y directo.
Devolver el texto corregido con las sustituciones marcadas. No tocar código.
```

### Content Creator — copy de nueva sección

```
Activá el Content Creator. Escribir el copy para <sección>, siguiendo la voz de marca de
DESIGN.md: "tú" neutro, sin jerga, CTAs directos (imperativo: "Agenda", "Descubre", "Cuéntanos").
Español internacional. Longitud: máx 3 párrafos por bloque. No incluir código ni HTML.
```

---

## 10. Home — estructura fiel al mockup Deslumbrante (2026-07-18, sesión 2)

`app/page.tsx` se reconstruyó para seguir `design-drafts/deslumbrante/index.html` estructuralmente
(no solo en color/tipografía), con dos excepciones documentadas: las páginas interiores **no**
replican la estructura del Home (hero cinético, scroll pineado de Ciudades, marquee) — eso sigue
siendo exclusivo del Home, ver §11 para qué sí se extendió a esas páginas (tipografía/tokens) en
sesión 3 — y no se instaló Lenis (ver addendum de `docs/adr/010-stack-animacion-interaccion.md`
— riesgo de accesibilidad sitewide no aprobado, reconfirmado en sesión 3).

Orden real: `Hero → ElMarcador → CiudadesDestacadas → FeedInstagram → MuroLlavesPreview
(marquee) → Testimonios (cita rotativa) → ComoFuncionaTeaser → CTAFinal`.

**GSAP + `@gsap/react` instalados** (aprobados condicionalmente en ADR-010, caso de uso concreto
ahora sí existe) — usados solo en dos lugares, ambos con `useGSAP` para cleanup automático:
- `CiudadesDestacadas.tsx`: scroll horizontal pineado (`ScrollTrigger` + `pin` + `scrub`),
  desktop-only vía `gsap.matchMedia('(min-width: 860px)')`; con `prefers-reduced-motion` o
  viewport angosto cae a fila con scroll-snap nativo (mismo fallback que `app/ciudades/page.tsx`).
- `ComoFuncionaTeaser.tsx`: línea que se dibuja (`scrub`, sin `pin`) entre los 3 pasos.

`motion` (ya instalado) sigue siendo la base para todo lo que no es scroll-driven:
`MuroLlavesMarquee.tsx` (loop de traslación imperativo, `animate()`), `Testimonios.tsx`
(crossfade `AnimatePresence` entre los 3 testimonios reales, rotan en vez de mostrarse los 3 a
la vez — se preserva el contenido real, no se borran 2 testimonios para igualar el mockup).

Ningún componente nuevo anima sin chequear `useReducedMotion()` (de `motion/react`, mismo hook
que ya usaba el resto del código) o el equivalente `prefers-reduced-motion` de `gsap.matchMedia`.
`lib/ciudades/data.ts` es ahora la fuente única de las 5 ciudades (antes vivía duplicada en
`app/ciudades/page.tsx`).

---

## 11. Extensión sitewide del sistema Deslumbrante (2026-07-18, sesión 3)

Alcance: **tipografía, tokens y lenguaje visual/de animación** de Deslumbrante a toda la web
pública, sin replicar los componentes exclusivos del Home (§10) y **sin tocar contenido, datos
ni lógica de ninguna página** — cada página conserva exactamente su información y funcionalidad
previas. Ver §3 para el detalle del cambio de tipografía (Unbounded/Inter sitewide).

### Qué se aplicó a cada superficie

| Superficie | Qué cambió |
|---|---|
| **Header / Footer** | Textos que usaban `--font-ui` (CTA "Hablar con Gina", copy de soporte) ahora en `--font-dz-ui` (Inter). Wordmark y nav links siguen en Cormorant Garamond — tratamiento deliberado preexistente, no tocado. Colores sin cambios (ya retinteados en sesión 1). |
| **GinaWidget** | Un `fontFamily: 'var(--font-dz-ui)'` en la raíz del panel (único punto de inyección) — hereda a toda la conversación. Cero cambios de lógica/estado/payload. |
| **Home** | Sin cambios nuevos en sesión 3 — ya tenía la estructura fiel al mockup de sesión 2; solo hereda Inter en el cuerpo de texto que antes decía `var(--font-lato)` directo (ahora vía `--font-dz-ui`, mismo valor visual salvo la fuente real cargada). |
| **`ciudades` (índice + 5 detalle)** | Índice: h1 → `--font-dz-display`; nombre de ciudad en cada tarjeta sigue itálico en Playfair (deliberado). `CiudadLayout.tsx` (comparten las 5 páginas de detalle): el h1 ya usaba `--font-dz-display` desde antes; cuerpo de texto (26 ocurrencias) migrado a `--font-dz-ui`. |
| **`como-funciona`** | `ComoFuncionaStepper.tsx`: h1 y título de cada paso → `--font-dz-display`; el "ya existe." (itálica) y el numeral "01-05" (itálica) quedan explícitos en Playfair para no sintetizar una itálica falsa sobre Unbounded. `LoQueNoSomos.tsx`: h2/h3 → `--font-dz-display`, el "no" itálico queda explícito en Playfair. |
| **`agenda`** | h1 (página + `AgendaPublica.tsx`) → `--font-dz-display`; resto del copy → `--font-dz-ui`. `CalEmbed.tsx` (Cal.com, lógica protegida): solo su `--font-ui` → `--font-dz-ui`, cero cambios de embed/props. |
| **`comunidad` + `comunidad/mapa`** | h1 de ambas páginas → `--font-dz-display`. `FormularioComunidad.tsx` (h2), `TarjetaPerfil.tsx` (iniciales + nombre) → `--font-dz-display`; `MapaComunidad.tsx`/`FormMensajePrivado.tsx` solo cuerpo → `--font-dz-ui`. |
| **`contacto`** | h1 → `--font-dz-display`; `FormularioContacto.tsx` ("Mensaje recibido") → `--font-dz-display`. |
| **`faq`** | h1 + preguntas del acordeón → `--font-dz-display`. |
| **`conocernos`** | h1 → `--font-dz-display`. `FormularioDiagnostico.tsx`/`form-fields.tsx` (cuestionario de Gina, lógica protegida): solo `--font-ui` → `--font-dz-ui`, cero cambios de validación/estado/RGPD. |
| **`sobre-silvana`** | h1 + 2 h2 → `--font-dz-display`. |
| **Legales** (`aviso-legal`, `terminos-y-condiciones`, `politica-de-privacidad`, `politica-de-cookies`) | Solo h1 y headers de sección (`--font-dz-display`) + cuerpo (`--font-dz-ui`). **Contenido legal real sin ninguna modificación** — el TODO pendiente de A04 (`CLAUDE.md` §9) sigue exactamente igual, esto no lo resuelve ni lo empeora. |
| **`components/ciudad/ClimaActual.tsx`** | Lógica de fetch a AEMET protegida, sin tocar; solo `--font-ui` → `--font-dz-ui`. |
| **`components/ui/Button.tsx`, `Accordion.tsx`, `Eyebrow.tsx`** | Primitivos compartidos, solo consumidos por rutas públicas (verificado: ningún import desde `/admin`) — `--font-ui`/`--font-lato` → `--font-dz-ui`. |

### Fuera de alcance (confirmado explícitamente, no un olvido)

- **`/admin/**` y `components/admin/**`** — panel interno, sigue en `--font-ui` (Plus Jakarta
  Sans) sin ningún cambio. El body global (`app/layout.tsx`) tampoco se tocó — sigue en
  `--font-ui` — precisamente porque admin y público comparten el mismo `<body>` y no hay forma
  de repuntar el default global sin afectar también a admin.
- **`app/apps-utiles/page.tsx` + `components/apps/**`** — identidad tipográfica propia (Lora +
  Work Sans), documentada como un sistema aparte desde antes de esta sesión. No se tocó.
- **Estructura del Home** (hero cinético, scroll pineado, marquee) — exclusiva del Home, ver §10.
  Ninguna página interior la replica.
- **Lenis** — sigue sin instalarse, ver addendum de ADR-010: el pedido de esta sesión fue
  tipografía/tokens/lenguaje visual, no scroll con inercia sitewide.

---

## 12. Extensión de paleta/layout/composición/animación (2026-07-18, sesión 4)

El pedido de sesión 3 (extensión sitewide) se completó solo a nivel tipográfico. El usuario
aclaró que "aplicá el diseño a toda la web" incluía además **paleta, radio de bordes, sombras,
composición de hero y el lenguaje de animación de entrada/scroll** — el resto del sitio (fuera
de Home/`CiudadLayout.tsx`) era visualmente plano y estático pese a tener ya los colores
`--dz-*`. Mismo alcance de páginas que sesión 3 (24 públicas + Header/Footer/Gina), mismas
exclusiones (`/admin/**`, `apps-utiles`), mismo criterio de "no replicar componentes exclusivos
del Home" (rule 2 de esa sesión — hero cinético/scroll pineado/marquee siguen solo en Home).

### El sistema aplicado

- **Radio:** el valor pre-Deslumbrante `4px`, repetido en casi todas las tarjetas/paneles/
  inputs/botones fuera de Home, se reemplazó por `--dz-radius-card` (20px) en superficies tipo
  tarjeta (paneles de formulario, estados de éxito/error, cajas "en construcción" de las legales)
  y por un radio menor intencional (`8px`, no un token nuevo) en controles chicos (inputs,
  chips, ítems de accordion) — igual criterio que ya usaba `CiudadLayout.tsx`. Botones/CTAs
  pasaron de `4px` a `999px` (pill), igual que `Button.tsx`.
- **Sombra:** `--dz-shadow-sm`/`-md` ahora se usan en paneles de formulario y CTAs primarios que
  antes no tenían elevación; sombras crudas (`rgba(...)` a mano, en el CTA de `AgendaPublica.tsx`
  y las burbujas de Gina) pasaron a los tokens. Superficies puramente informativas (texto legal)
  quedan sin sombra a propósito.
- **Animación de entrada/scroll — el cambio de mayor impacto:** se extendió el patrón
  `motion.div`/`ul` + `variants={fadeUp}`/`staggerContainer` + `whileInView` (o `animate` directo
  para contenido ya visible al cargar, como los hero) que antes solo vivía en Home/
  `CiudadLayout.tsx`, a las 24 páginas + Gina. Como toda la app ya corre dentro de
  `<MotionConfig reducedMotion="user">` (`MotionProvider`), este patrón declarativo respeta
  `prefers-reduced-motion` automáticamente sin chequeos manuales por componente.
  - `GinaMessages.tsx`: cada burbuja nueva monta con `fadeUp` (`initial`/`animate`, no
    `whileInView` — es un chat en vivo, no contenido de scroll); como React no re-anima
    mensajes ya montados, el efecto es "solo el mensaje nuevo aparece con fade", correcto para
    un log de conversación. Cero cambios en la lógica de mensajes/sesión/API.
- **`Eyebrow` (`components/ui/Eyebrow.tsx`) — de 1 a 3 variantes:** el componente solo se usaba
  sobre foto/video (Home, `CiudadLayout`). Se agregó `tone="claro"` (pill clara para fondos
  `--dz-luz`/`--dz-papel`, ej. índice de ciudades) y `tone="hero"` (pill con tinte de acento para
  el bookend sólido `--dz-hero-bg` — `tone="oscuro"`, pensado para foto/video, es casi invisible
  ahí). Reemplaza los "eyebrows" de texto plano o regla+label que existían en `comunidad`,
  `comunidad/mapa`, `contacto`, `faq`, `sobre-silvana`, agenda. **Decisión deliberada:** las 4
  legales y `conocernos` NO reciben `Eyebrow` — son formularios/documentos, no superficies de
  marketing (rule 3 de la sesión: libertad de composición explícita, no un olvido).
- **Header — estado `.scrolled`:** listener de scroll pasivo (umbral 40px, igual que el mockup),
  agrega `--dz-shadow-md` al header sticky una vez que el contenido pasa debajo — el header ya
  era opaco (no transparente-sobre-hero como en el mockup), así que el efecto se adaptó a sombra
  en vez de blur/opacidad, mismo objetivo (separar el chrome del contenido al hacer scroll).
- **Server/client boundary:** varias páginas eran server components (exportan `metadata`) sin
  ninguna lógica async — para poder usar `motion` se extrajo su contenido a un componente
  `'use client'` chico (`ComunidadContenido.tsx`, `ContactoContenido.tsx`, `FAQContenido.tsx`,
  `SobreSilvanaContenido.tsx`, `AgendaConCodigo.tsx`, `ConocernosContenido.tsx`,
  `CiudadesGrid.tsx`, `ComunidadMapaHero.tsx`, `LegalHero.tsx`/`LegalSection.tsx` reusable para
  las 4 legales), dejando `page.tsx` como wrapper server-only con su `metadata` intacta.

### Hallazgo real durante la implementación: un tercer sistema de tokens, no dos

Al auditar `FormularioDiagnostico.tsx` (cuestionario de Gina) para el cambio de radio, apareció
un tercer sistema de tokens **anterior a Pedra e Ouro**, nunca migrado en ninguna sesión previa:
`--color-niebla`/`--color-arena`/`--color-granito`/`--color-pizarra` (neutros, con overrides de
modo oscuro reales) + `--radius-card` genérico (8px, distinto de `--dz-radius-card`) +
`--font-titular` (Cormorant). Grep reveló que este sistema sigue **vivo y activo**, no muerto:
lo usan también `GinaInput.tsx`, `GinaConversation.tsx`, `useGinaEditor.tsx`, `GinaMessages.tsx`,
`GinaButtons.tsx`, `components/ciudad/ClimaActual.tsx`, `components/ciudad/VistaEnVivo.tsx` y
`components/shared/CalEmbed.tsx` — es decir, toda la lógica de Gina y los widgets de ciudad
corrían sobre una paleta neutra distinta a `--dz-*`, algo que la sesión 1 ("colores ya migrados
en todo el sitio") no había detectado. Se migró mecánicamente (`niebla→dz-papel`,
`arena→dz-borde`, `granito→dz-ink`, `pizarra→dz-muted`, `radius-card→dz-radius-card`,
`font-titular→font-dz-display`) en los 8 archivos afectados — **solo valores CSS, cero cambios
de lógica**, mismo criterio que protege el resto de Gina. Las definiciones viejas quedan intactas
en `app/globals.css` (las sigue usando `/admin/**`, confirmado con grep — no se tocaron).

### Fuera de alcance (confirmado explícitamente)

Mismo criterio que sesión 3: `/admin/**` y `components/admin/**` (nunca importan los componentes
tocados en esta sesión, verificado antes de cada sweep), estructura exclusiva del Home (§10),
Lenis (addendum de ADR-010, sin cambios en esta sesión). **Nuevo en esta sesión:** se confirmó que
`app/admin/layout.tsx` existe como layout anidado (hoy un passthrough) — si en el futuro se
quisiera aislar admin de algún cambio global (ej. repuntar el `<body>` por completo), ese archivo
es el mecanismo, no hace falta seguir excluyendo admin manualmente archivo por archivo. No se usó
en esta sesión porque no hizo falta.

> **Corrección de sesión 5 (2026-07-18):** `apps-utiles`/`components/apps/**` dejó de estar
> excluido — la exclusión por "identidad tipográfica propia" quedó revertida a pedido explícito
> del usuario. Ver §13.

---

## 13. Correcciones puntuales sobre lo ya construido (2026-07-18, sesión 5)

Cinco correcciones específicas pedidas por el usuario sobre el trabajo de sesiones 2-4, cada una
con su propio alcance — no una extensión general.

### 13.1 Carrusel de ciudades unificado

Existían dos implementaciones distintas de "ciudades" (`CiudadesDestacadas.tsx` en Home, con
scroll horizontal pineado vía GSAP; `CiudadesGrid.tsx` en `/ciudades`, un grid estático con
`fadeUp`). Se unificaron en **`components/ciudades/CarruselCiudades.tsx`**, con prop
`variant: "preview" | "listado"` — la única diferencia real es si muestra su propio encabezado
("preview", vive dentro del Home) o no ("listado", `/ciudades` ya tiene su propio hero arriba).
**Ambas variantes muestran las mismas 5 ciudades reales** — "preview" no es un subconjunto.

Corrección del pin/scroll reportado como errático:
- **Dónde engancha:** el `start` del `ScrollTrigger` no compensaba la altura real del header
  sticky (64px/92px según breakpoint) — el pin enganchaba parcialmente tapado detrás del header
  (`z-50`). Ahora `start` mide `header.getBoundingClientRect().height` en vivo en vez de asumir
  un valor fijo.
- **Snapping impreciso:** no había configuración `snap` — el `scrub` podía dejar el carrusel a
  mitad de camino entre dos ciudades. Se agregó `snap: { snapTo: 1/(total-1), ... }` para que
  siempre asiente en una tarjeta completa.
- `scrub` bajado de `1` a `0.3` (respuesta más directa al gesto de scroll) y
  `ScrollTrigger.refresh()` agregado al evento `load` de `window` como red de seguridad si algo
  todavía afecta el layout cuando el efecto corre.

`app/ciudades/page.tsx` y `app/page.tsx` consumen el mismo componente. `CiudadesDestacadas.tsx` y
`CiudadesGrid.tsx` se borraron.

### 13.2 El Marcador — bloqueado por credenciales, no por código

`lib/marcador.ts` + `/api/marcador` **ya están completamente implementados** (documentado
también en `docs/pendientes-config.md` §6) — leen una Google Sheet vía API v4 y cachean 1h. Hoy
devuelven el fallback en cero porque faltan `SHEET_MARCADOR_ID` y `GOOGLE_SHEETS_API_KEY` en
`.env.local`/Vercel. No se tocó código — no había nada que construir. Ver el mensaje al usuario
en el chat para el detalle de qué se necesita (incluye un bug de casing ya documentado en
`docs/pendientes-config.md` que probablemente explica por qué tampoco funciona en producción).

### 13.3 Cómo funciona — fuente única + rediseño vertical

`lib/como-funciona/pasos.ts` es ahora la fuente única de los 5 pasos reales — antes vivían
duplicados con redacción distinta en `ComoFuncionaStepper.tsx` (versión completa) y
`ComoFuncionaTeaser.tsx` (versión resumida de Home, que además **omitía por completo** el paso
de la videollamada, un problema de contenido real, no solo de estilo).

- **`/como-funciona`**: `ComoFuncionaStepper.tsx` (imagen que cambiaba por click/hover, layout
  fijo a la altura del viewport) se reemplazó por **`components/como-funciona/
  ComoFuncionaVertical.tsx`** — scroll natural (sin pin, es una página de lectura), imagen
  sticky a la izquierda que cambia según qué paso está en foco (`ScrollTrigger` por paso,
  `onEnter`/`onEnterBack`), línea vertical que se llena progresivamente (`scrub`) a medida que
  se avanza. Los 5 pasos reales completos, sin recortar. Mobile: la columna de imagen se oculta
  (mismo criterio que el diseño anterior), queda la lista de pasos con la línea.
- **Teaser de Home**: ahora importa `PASOS_COMO_FUNCIONA` y muestra 3 de los 5 pasos reales
  **verbatim** (índices 0, 1, 4 — inicio/videollamada/cierre), en vez de una redacción propia
  que inventaba una versión distinta del proceso. El encabezado, antes "Tres pasos, en ese
  orden" (literalmente falso — son 5), pasa a "Así funciona, de punta a punta" + una nota
  explícita "Este es un adelanto — el proceso real tiene 5 pasos" antes del link a la versión
  completa.

### 13.4 Apps Útiles — exclusión revertida

Sin razón de fondo documentada para mantener Lora+Work Sans separado más allá de "identidad
propia" (una observación de sesión 3, no una decisión de producto) — se procedió a adaptar, tal
como habilitaba la instrucción del usuario. **Cero cambios en `components/apps/*.tsx`**: todos
consumen `--au-*`/`--font-au-*` por variable, así que repuntar la *definición* del token en
`app/globals.css` alcanza para todo el árbol (mismo mecanismo no-destructivo que `--au-accent`
ya usaba desde sesión 1, que de hecho ya era `= --dz-accent`). `--font-au-display`→
`var(--font-dz-display)`, `--font-au-ui`→`var(--font-dz-ui)`, `--au-bg`/`--au-card`/`--au-text`/
etc.→ sus equivalentes `--dz-*`. Además: el glow de hover de `.au-city-card`/`.au-app-card` tenía
un dorado hardcodeado (`#d8b96a`) ajeno a la paleta — pasó a `var(--dz-accent)`. Se agregó
entrada `fadeUp`/`staggerContainer` al hero y a las secciones que aparecen al elegir ciudad
(`AppsUtilesPagina.tsx`, antes 100% estático). Radio de las tarjetas de ciudad (`CityPicker.tsx`)
alineado a `--dz-radius-card`, igual que el resto de "tarjetas de ciudad" del sitio. Se eliminó
`.au-fade-in` (clase CSS que había quedado sin uso al reemplazarla por el `motion` real).
Confirmado: `/apps-utiles` es una sola ruta, sin subpáginas anidadas — las secciones
condicionales por ciudad son parte de la misma página, no rutas separadas.

### 13.5 "Para tu llegada" eliminado de las páginas de ciudad

Bloque de `CiudadLayout.tsx` (enlace a `/apps-utiles`) — confirmado que no tenía ningún dato ni
lógica compartida con otra sección (ni props, ni componente propio, texto e imagen 100%
hardcodeados dentro del bloque) antes de eliminarlo. `Link` de `next/link` se mantiene importado
porque lo siguen usando el hero y la grilla de "otras ciudades" del mismo archivo.

### Barrido completo de rutas — confirmación explícita

**20 rutas públicas** (`app/**/page.tsx` fuera de `/admin`) + Header/Footer/`GinaWidget` —
**todas** con el sistema Deslumbrante completo (tipografía sesión 3, paleta/layout/animación
sesión 4, Apps Útiles sumado en sesión 5): `/`, `/ciudades`, `/ciudades/{vigo,a-coruna,lugo,
pontevedra,santiago-de-compostela}`, `/como-funciona`, `/agenda`, `/comunidad`, `/comunidad/
mapa`, `/contacto`, `/faq`, `/conocernos`, `/sobre-silvana`, `/aviso-legal`, `/terminos-y-
condiciones`, `/politica-de-cookies`, `/politica-de-privacidad`, `/apps-utiles`.

**Excluido, con motivo — el único caso:** `/admin/**` (6 rutas: dashboard, inbox, kanban,
lead/[recordId], leads/[id], login) — herramienta interna de gestión de leads, nunca formó parte
de ningún pedido de "toda la web" en ninguna sesión, usa su propio lenguaje visual
(`--font-ui`/Plus Jakarta, sin `--dz-*`). No hay exclusiones silenciosas: esta es la única.

---

## 14. Dos trampas verificadas — leer antes de tocar tokens o medir contraste (2026-07-31)

Las dos se descubrieron corrigiendo contraste y las dos hacen perder tiempo o, peor, dan por
bueno algo que está roto. No son teoría: están medidas contra el CSS servido y el DOM real.

### 14.1 Tailwind v4 poda los `--color-*` que solo se consumen con `var()` inline

El namespace `--color-*` lo **gestiona Tailwind v4**: emite al CSS final solo los tokens que
alguna utilidad generada referencia. Un token declarado en `@theme` que solo se usa como
`style={{ color: 'var(--color-loquesea)' }}` **no llega al navegador**, sin error ni aviso.

Medido el 2026-07-31 contra el CSS realmente servido: **33 de los 61 `--color-*` declarados en
`app/globals.css` no se emiten**. Entre ellos `--color-laton-invertido`, que es un token propio
del proyecto y hoy no existe en runtime — si alguien lo usa, hereda el color del padre.

El síntoma es cruel: `var()` sin valor no rompe, la propiedad queda inválida y el elemento
**hereda**. En un botón de acento eso significó blanco sobre ámbar en claro y, en oscuro, texto
casi blanco sobre ámbar: **2,11:1, peor que el bug que se estaba arreglando**.

Los `--dz-*`, `--po-*`, `--au-*` y `--mar-*` **no** tienen este problema: al no ser namespaces
de Tailwind, se emiten enteros. Por eso `--dz-accent-ink` funciona y su equivalente en la capa
chrome tuvo que llamarse **`--laton-ink`, sin el prefijo `--color-`**.

**Regla:** un token nuevo que solo vaya a consumirse con `var()` inline **no lleva prefijo
`--color-`**. Si tocás esta zona, verificá contra el CSS servido, no contra `globals.css`:

```bash
curl -s "http://localhost:3000/$(curl -s http://localhost:3000 | grep -o '_next/static/chunks/[^"]*\.css' | head -1)" | grep -c -- --tu-token
```

### 14.2 Para medir contraste en oscuro hay que CARGAR el tema, no togglear la clase

Togglear `.dark` sobre `<html>` y leer `getComputedStyle` a continuación devuelve el color
**anterior** en todo elemento que tenga una transición de color (`transition-colors`,
`transition-brand`). El custom property se actualiza al instante, pero la propiedad que lo
consume sigue animando.

En la auditoría de las 6 páginas eso produjo **7 falsos positivos sobre 12 hallazgos brutos**,
incluido un "texto blanco sobre blanco a 1,15:1" que en pantalla se veía perfecto. Esperar un
frame no alcanza; a los 300 ms ya está bien, pero el margen depende de cada transición.

**Regla:** para auditar el modo oscuro, `localStorage.setItem('tlg-theme','dark')` + recarga, y
medir sobre la página ya pintada. Nunca togglear en caliente.

**Corolario del mismo barrido:** cuando el texto va sobre una `<img>` o un `<video>` (tarjetas de
`/ciudades`, Hero de Inicio), el contraste **no es medible** subiendo por los ancestros — el
buscador de fondo trepa hasta el fondo de página y devuelve un número inventado (aparecía como
`1.00:1`). Esos casos se resuelven mirando, no midiendo.

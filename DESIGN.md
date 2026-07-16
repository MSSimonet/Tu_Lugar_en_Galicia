# DESIGN.md — Sistema de diseño Tu Lugar en Galicia

> Fuente de verdad derivada del código real: `app/globals.css`, `components/ui/Button.tsx`,
> `components/layout/Header.tsx`, `docs/design-system.md`.
> El `UI Designer` y el `Frontend Developer` usan este archivo como referencia operativa.
> Ante conflicto entre este archivo y el código, el código gana.

> ⚠️ **Nota de discrepancia (2026-07-16):** las secciones §2 (paleta laton/atlántico/coral) y
> §3 (Fraunces/Plus Jakarta) describen un sistema de diseño que **ya no es el vigente en el sitio
> real** — el código en producción usa el sistema **Pedra e Ouro** (tokens `--po-*` en
> `app/globals.css`, ver también `docs/adr/010-stack-animacion-interaccion.md`). Esta discrepancia
> existía porque `components/ui/Button.tsx` (la fuente citada arriba) usaba tokens `--color-laton`
> que nadie más en el sitio consumía — se corrigió en este mismo pase (ver §4 Button abajo), pero
> el resto de §1-§3 y §6-§8 sigue describiendo el sistema viejo y necesita una revisión completa
> en una sesión futura. No asumas que §2/§3 reflejan el sitio real sin verificar contra
> `app/globals.css` primero.

---

## 1. Tema visual y atmósfera

**Concepto:** antes de leer, se sabe que es Galicia. Verde atlántico, piedra de granito, rías,
lluvia fina, calidez de aldaba en latón envejecido. Ningún competidor liga su imagen al territorio.

**Paleta emocional:**
- Identidad → latón/bronce envejecido (extraído del logo: aldaba gallega)
- Territorio → verde atlántico profundo
- Estructura → grafito granito cálido, no frío
- Fondo → niebla (crema cálido, nunca blanco puro frío)
- Acento → coral suave para CTAs secundarios y alertas amables

**Tono visual:** editorial, humano, de confianza. No minimalista-frío ni exuberante.
La persona que nos ve acaba de decidir el cambio más importante de su vida; el sitio
debe sentirse como un abrazo, no como una landing de SaaS.

---

## 2. Paleta de color y roles

Los valores de referencia son los del bloque `@theme` en `app/globals.css`.

### Modo claro

| Token CSS | Hex | Rol |
|---|---|---|
| `--color-laton` | `#8F722B` | Identidad primaria: CTAs, acentos de marca, aldaba del logo |
| `--color-laton-claro` | `#D4B96A` | Hover/highlight decorativo sobre latón |
| `--color-laton-oscuro` | `#8A6E2A` | Estados activos, sombras cálidas |
| `--color-laton-text` | `#7A5F22` | Texto latón sobre fondos claros (WCAG AA) |
| `--color-atlantico` | `#1A5247` | Acento territorial: naturaleza, Galicia verde |
| `--color-atlantico-claro` | `#2E7A68` | Hover sobre atlántico, estados secundarios |
| `--color-granito` | `#1E1C19` | Fondo hero, header, footer, textos sobre claro |
| `--color-pizarra` | `#696560` | Texto secundario, separadores, metadatos |
| `--color-niebla` | `#F5F0E8` | Fondo de sección (cálido, no frío) |
| `--color-arena` | `#E8E0D2` | Tarjetas, divisores suaves |
| `--color-mar` | `#1E5F7A` | Enlaces, información |
| `--color-coral` | `#D4694F` | CTA secundario, alertas amables |
| `--color-blanco` | `#FFFCF7` | Base de contenido (blanco cálido, no `#FFFFFF`) |

### Modo oscuro (swapeo vía clase `.dark` en `<html>`)

| Token CSS | Hex oscuro | Nota |
|---|---|---|
| `--color-blanco` | `#141210` | Fondo base en dark |
| `--color-niebla` | `#1E1B18` | Fondo sección en dark |
| `--color-arena` | `#302B25` | Tarjetas en dark |
| `--color-granito` | `#F0EBE2` | Texto principal en dark |
| `--color-pizarra` | `#8C8278` | Texto secundario en dark |
| `--color-laton-text` | `#D4AF6A` | Texto latón sobre fondos oscuros (WCAG AA) |

### Jerarquía de uso

1. **Identidad de marca** (CTA primario, wordmark, aldaba): `laton` / `laton-claro` / `laton-oscuro`
2. **Diferenciación territorial**: `atlantico` / `atlantico-claro`
3. **Fondos y estructura**: `granito` (oscuro), `niebla` (claro), `arena` (tarjetas)
4. **Texto**: `granito` sobre claro; `niebla` sobre `granito`
5. **CTAs secundarios y alertas**: `coral`
6. **Información y enlaces**: `mar`

### Contrastes WCAG

- Blanco sobre `laton` (#8F722B): 4.56:1 — pasa **AA**
- `laton` sobre `blanco`: 4.56:1 — pasa **AA**
- `atlantico` sobre `niebla`: ~5.2:1 — pasa **AA**
- `coral` sobre `blanco`: ~4.5:1 — pasa **AA** (solo texto ≥14px bold)
- `granito` sobre `laton`: ~9:1 — pasa **AAA**

---

## 3. Tipografía

### Familias

| Variable | Stack | Uso |
|---|---|---|
| `--font-titular` | `Fraunces` → `Source Serif 4` → `Georgia` serif | Titulares editoriales, heroes, testimonios, secciones narrativas |
| `--font-ui` | `Plus Jakarta Sans` → `Inter` → `system-ui` | UI, navegación, botones, etiquetas, datos, cuerpo de texto |

> El logo usa una sans-serif geométrica espaciada. La nav replica ese espíritu con
> Cormorant Garamond (elegante, histórica) en el header. `Fraunces` aporta calidez humana
> en los titulares de contenido.

### Escala tipográfica

| Token | rem | px | Uso típico |
|---|---|---|---|
| `--text-xs` | 0.875rem | 14px | Etiquetas, captions, microcopy |
| `--text-sm` | 1rem | 16px | Cuerpo de texto base |
| `--text-md` | 1.25rem | 20px | Lead / subtítulos de card |
| `--text-lg` | 1.5rem | 24px | Subtítulos de sección |
| `--text-xl` | 2rem | 32px | Titulares de sección |
| `--text-2xl` | 2.5rem | 40px | Titulares de página (h1 interior) |
| `--text-3xl` | 3.5rem | 56px | Hero h1 en mobile |
| `--text-4xl` | 4.25rem | 68px | Hero h1 tablet/desktop |
| `--text-5xl` | 5.5rem | 88px | Hero h1 desktop grande |
| `--text-6xl` | 6.5rem | 104px | Hero h1 pantallas XL |

### Interlineado

| Token | Valor | Uso |
|---|---|---|
| `--leading-cuerpo` | 1.5 | Cuerpo, párrafos |
| `--leading-titulo` | 1.2 | Titulares h2–h3 |
| `--leading-display` | 1.08 | Heroes, titulares de gran escala |

### Tracking

- **UI y botones:** `--tracking-ui` = `0.06em` — coherente con el wordmark del logo
- **Nav links:** `0.1em` — espacio extra para etiquetas en caps
- **Hero eyebrow:** `0.32em` desktop / `0.14em` mobile (clases `.hero-eyebrow`)

---

## 4. Estilos de componentes

### Button (`components/ui/Button.tsx`)

**Actualizado 2026-07-16 — reescrito a tokens Pedra e Ouro** (antes usaba `--color-laton`, un
sistema que ningún otro CTA del sitio consumía; por eso nadie usaba este componente para el CTA
dorado real). Ver `docs/adr/010-stack-animacion-interaccion.md` para el detalle completo.

Tres variantes, tres tamaños. Siempre `rounded-pill` (999px), `font-ui`, `font-medium`. Construido
sobre `motion.button` (librería `motion`) — hover/tap animados vía `whileHover`/`whileTap`
(`transform: translateY`/`scale`, easing de marca `cubic-bezier(0.4, 0, 0.2, 1)`), no CSS puro.

**Variantes:**

| Variante | Fondo | Texto | Hover | Extra |
|---|---|---|---|---|
| `primario` | `--po-ouro` (#C89B3C) | `--po-ouro-ink` (#1A1410) | `--po-ouro-hover` | `tracking-ui`, `uppercase` |
| `secundario` | `--po-pedra` | `--po-luz` | pedra –15% dark | — |
| `fantasma` | transparente | `--po-ouro-text` | bg `--po-ouro-text` / text `--po-luz` | `border: 1px --po-ouro` |

**Tamaños:**

| Size | Padding X | Padding Y | Font |
|---|---|---|---|
| `sm` | `space-4` (16px) | `space-2` (8px) | `text-xs` (14px) |
| `md` | `space-6` (24px) | `space-3` (12px) | `text-sm` (16px) |
| `lg` | `space-8` (32px) | `space-4` (16px) | `text-md` (20px) |

**Estados:** `whileHover`/`whileTap` de `motion` (200ms, easing de marca) · `focus-visible:outline-2
--po-ouro` · `disabled:opacity-60`. Sombra recomendada en uso: `boxShadow: 'var(--po-shadow-md)'`
inline (no forma parte del componente, se agrega por consumidor según contexto).

### Header (`components/layout/Header.tsx`)

- **Fondo:** `#111111` (hardcodeado — el header siempre es negro, en ambos modos)
- **Borde inferior:** `1px solid #B8943F`
- **Altura:** 64px mobile / 92px desktop
- **Max-width:** 7xl (1280px) con padding horizontal 24px
- **Grid desktop:** `1fr auto 1fr` — logo | nav centrado | CTAs
- **Logo:** `aldaba.png` 54×70px + wordmark "Tu Lugar / en Galicia" en Cormorant Garamond, italic, 20px, `#D4AF6A`, letter-spacing 0.05em
- **Nav links:** Cormorant font, 13px, weight 500, uppercase, tracking 0.1em, color `#A8A8A8` → hover/active `#D4AF6A`
- **Indicador activo:** línea `1px #B8943F` a -4px del texto
- **CTA Agenda:** ghost border `rgba(212,175,106,0.5)`, altura 36px, Cormorant 13px
- **CTA Hablar con Gina:** pill `bg-laton`, texto blanco, ícono ✦, Plus Jakarta Sans 12px bold
- **Utility buttons (tema/idioma):** 36px, border `rgba(212,175,106,0.3)`, color `#D4AF6A`

### CityCard

- Fondo: `arena` en claro / `arena-dark` en oscuro
- Border-radius: `radius-card` (8px)
- Sombra suave (ver §6)
- Hover: elevación leve + border latón suave

### GinaWidget

- Paleta propia: dark (`granito`/`#111111`), acentos en latón
- Siempre superpuesto al contenido (z-index > header)
- Mobile: full-screen o panel inferior
- Trigger: botón "✦ Hablar con Gina" dispara `CustomEvent('gina:open')`

### FAQAccordion

- Usa `<details>/<summary>` nativo
- Transición de apertura: `overflow: hidden` en `details > dd`
- Separador entre ítems: `1px solid arena`

### MetricCard / Marcador

- Familia: `font-titular` para el número, `font-ui` para la etiqueta
- Color del número: `laton`
- Etiqueta: `pizarra`

---

## 5. Principios de layout

### Grid y contenedores

| Contexto | Max-width | Padding horizontal |
|---|---|---|
| Contenido principal | `max-w-7xl` (1280px) | 24px (mobile) / 48px (lg+) |
| Secciones narrativas | `max-w-4xl` (896px) | centrado |
| Hero | full-bleed | scrim sobre imagen |

### Espaciado

Escala de spaciado en tokens:

| Token | rem | px |
|---|---|---|
| `space-1` | 0.25rem | 4px |
| `space-2` | 0.5rem | 8px |
| `space-3` | 0.75rem | 12px |
| `space-4` | 1rem | 16px |
| `space-6` | 1.5rem | 24px |
| `space-8` | 2rem | 32px |
| `space-12` | 3rem | 48px |
| `space-16` | 4rem | 64px |
| `space-24` | 6rem | 96px |

### Separadores de sección

- Nada de líneas horizontales duras — usar diferencia de fondo (`blanco` ↔ `niebla` ↔ `arena`)
- Padding vertical mínimo entre secciones: `space-16` (64px) mobile, `space-24` (96px) desktop

### Bordes y forma

- Tarjetas: `radius-card` = 8px
- Botones: `radius-pill` = 999px
- Inputs: 6px
- Sin bordes duros decorativos — sensación cálida, no corporativa

---

## 6. Profundidad y elevación

### Clases de gradiente definidas en `globals.css`

**`.hero-gradient`** — fondo hero oscuro con profundidad:
```css
background: linear-gradient(
  135deg,
  var(--color-granito) 0%,
  color-mix(in srgb, var(--color-granito) 85%, var(--color-atlantico)) 100%
);
```

**`.hero-lateral-gradient`** — scrim fotográfico desktop (de izquierda a derecha):
```
100deg: rgba(11,16,18, 0.84→0.72→0.28→0)
```
Mobile: doble scrim top+bottom para cubrir texto arriba y estadísticas abajo.

### Sombras de superficie

Usar sombras cálidas (tinte laton), no neutras:
- Tarjeta en reposo: `box-shadow: 0 2px 8px rgba(143, 114, 43, 0.08)`
- Tarjeta en hover: `box-shadow: 0 6px 20px rgba(143, 114, 43, 0.15)`
- Modal/overlay: `box-shadow: 0 24px 64px rgba(30, 28, 25, 0.4)`

### Superficies claras vs. oscuras

| Superficie | Color de fondo | Uso |
|---|---|---|
| Hero / Header / Footer | `#111111` / `granito` | Máxima presencia de marca |
| Sección destacada | `niebla` (#F5F0E8) | Contenido narrativo, testimonios |
| Tarjeta | `arena` (#E8E0D2) | CityCards, MetricCards |
| Base de contenido | `blanco` (#FFFCF7) | Cuerpo de página |

---

## 7. Qué hacer y qué no

### Hacer

- Usar siempre variables CSS (`var(--color-laton)`) — nunca hexadecimales hardcodeados en componentes
- Aplicar `transition-brand` (200ms ease-in-out) en todos los estados interactivos
- Mantener contraste WCAG AA en todo texto (verificar con los ratios del §2)
- Respetar la jerarquía tipográfica: `font-titular` para emoción, `font-ui` para UI
- `active:scale-[0.98]` en todos los botones y elementos clickeables
- `focus-visible:outline` siempre visible (no usar `outline: none` sin alternativa)
- Usar `prefers-reduced-motion` — el sitio tiene `@media (prefers-reduced-motion: reduce)` para las animaciones del hero
- Voz de marca: segunda persona "tú" neutro en todo el copy visible

### No hacer

- No usar `#FFFFFF` puro — el blanco del proyecto es `#FFFCF7` (cálido)
- No mezclar `font-titular` en UI funcional (nav, botones, etiquetas de formulario)
- No usar latón sobre blanco en texto pequeño (<16px regular) — no pasa AA
- No añadir bordes duros decorativos (`border: 1px solid black`) — usar el sistema de arena/pizarra con opacidad
- No animar con `transition` durations > 400ms salvo en modales o cargas
- No usar "vos" ni "vosotros" en ningún texto visible
- No usar `any` en TypeScript — ver reglas ECC
- No hardcodear `console.log` en producción

---

## 8. Comportamiento responsive

### Breakpoints de Tailwind (proyectados)

| Prefijo | Mínimo | Contexto |
|---|---|---|
| (base) | 0px | Mobile first |
| `md:` | 768px | Tablets, aparece nav desktop |
| `lg:` | 1024px | Desktop estándar |
| `xl:` | 1280px | Desktop grande |

### Nav / Header

- **Mobile (<768px):** hamburger (3 líneas → X animado), menú overlay bajo el header, fondo `#111111`, links en stack vertical
- **Desktop (≥768px):** grid 1fr/auto/1fr con logo izq, nav centrado, CTAs derecha
- Foco trampa activo en el menú mobile (Tab/Shift+Tab + Escape para cerrar)

### Hero

- **Mobile:** doble scrim (top+bottom), eyebrow tracking reducido (0.14em), título en `text-3xl`-`text-4xl`
- **Desktop:** scrim lateral (100deg), eyebrow tracking amplio (0.32em), título en `text-5xl`-`text-6xl`

### GinaWidget

- **Mobile:** panel que ocupa 100% de viewport height o bottom-sheet
- **Desktop:** widget flotante esquina inferior derecha, ancho fijo ~380px, altura máx 600px

### Tarjetas (CityCard, MetricCard)

- **Mobile:** columna única, full-width
- **md+:** grid de 2 columnas
- **lg+:** grid de 3 columnas

---

## 9. Guía de prompts para agentes

Fórmulas listas para usar en instrucciones a agentes.

### Frontend Developer — nuevo componente

```
Activá el Frontend Developer. Crear <NombreComponente> siguiendo DESIGN.md y docs/design-system.md.
Paleta: usar solo var(--color-*) de globals.css. Tipografía: font-titular para títulos emocionales,
font-ui para UI. Border-radius: radius-card (tarjetas) o radius-pill (botones).
Transiciones: transition-brand (200ms ease-in-out). Foco visible obligatorio.
Tocar solo components/<carril>. Cuando termines, resumí qué cambiaste y para.
```

### UI Designer — nuevo token o componente de diseño

```
Activá el UI Designer. Agregar token <nombre> al bloque @theme de app/globals.css.
Respetar la jerarquía de la paleta (§2 de DESIGN.md): primario latón, territorial atlántico,
fondos en niebla/arena/granito. Verificar contraste WCAG AA antes de proponer el hex.
Tocar solo app/globals.css (bloque @theme) y docs/design-system.md. Cuando termines, para.
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
Español español internacional. Longitud: máx 3 párrafos por bloque. No incluir código ni HTML.
```

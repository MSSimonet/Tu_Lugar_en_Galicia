### ADR-010 — Stack de animación e interacción

**Status:** Accepted — 2026-07-16

**Contexto:** El proyecto no tiene hoy ninguna librería de animación (grep confirma cero uso de
`framer-motion`, `motion`, `gsap` o similar en todo el repo). Las únicas transiciones existentes
son CSS puro: la clase `.transition-brand` (`app/globals.css:114-117`, `cubic-bezier(0.4, 0, 0.2,
1)` a 200ms) y animaciones `@keyframes` sueltas por componente (`fadeInUp`, `heroContentIn`,
`auFadeIn`). No hay ningún componente accesible reutilizable (accordion, dialog, dropdown) más
allá de lo que ya se construyó a mano (`FAQAccordionPedraEOuro.tsx`, acordeón `<details>` nativo
de `/faq`). Tampoco hay forma de previsualizar un componente o una animación aislada sin levantar
la página real.

Stack real del proyecto: Next.js 16.2.10 (App Router) + React 19.2.7 + TypeScript 5 +
Tailwind CSS v4.3.2 **CSS-first** (sin `tailwind.config.ts`, ver ADR-006 — la config vive en
`app/globals.css` vía bloques `@theme`, y los plugins JS se cargan con la directiva `@plugin`).

**Decisión:** se aprueba el siguiente stack, evaluado herramienta por herramienta. Todas son de
uso gratuito/comercial libre — confirmado explícitamente en cada punto.

1. **[motion](https://motion.dev) (ex Framer Motion) — se instala ahora, base de transiciones.**
   Librería declarativa para componentes React (`variants`, `AnimatePresence`, `layout` animations)
   con soporte oficial de React 19 y App Router (componentes `'use client'`). MIT license, sin
   costo. Encaja con el patrón ya usado en el proyecto (componentes `'use client'` con `useState`
   para transiciones, ej. `ElMarcador.tsx`, `HeroPedraEOuro.tsx`) sin requerir un motor de timeline
   imperativo para lo que hay hoy (fades, entradas, hover/tap states, accordion/dialog).

2. **gsap + @gsap/react — aprobado condicionalmente, NO instalado en esta fase.**
   GSAP es de uso comercial libre desde abril de 2025 (todos los plugins que antes eran "Club
   GreenSock" ya son gratis — confirmado en la documentación oficial vigente de greensock.com al
   momento de este ADR). Es la herramienta correcta para scroll-driven timelines (`ScrollTrigger`)
   o animación de SVG compleja (`MorphSVG`, `DrawSVG`) — pero **hoy el proyecto no tiene ninguna
   página con ese requisito** (los heroes de ciudad/home son video+overlay estático, no parallax
   ni SVG animado). Instalar GSAP ahora sin un caso de uso real sería la misma clase de deuda que
   se limpió esta sesión (`@dnd-kit/sortable` sin uso, ver commit `885f121`). Se deja aprobado para
   cuando surja un caso concreto (ej. una landing con scroll-driven storytelling), no como
   dependencia especulativa.

3. **Clases utilitarias de animación sin JS — `tw-animate-css`, no `tailwindcss-animate`
   (corrección hecha en la implementación, con evidencia real).**
   La intención original de este ADR era `tailwindcss-animate` (el plugin clásico, cargado vía
   `@plugin "tailwindcss-animate";` en Tailwind v4 CSS-first). Al correr `npx shadcn@latest init`
   (CLI v4.13.0), el propio CLI escribió `@import "tw-animate-css";` en `app/globals.css` — el
   sucesor nativo de Tailwind v4 que `shadcn/ui` usa hoy internamente para sus componentes
   (dialog, dropdown, accordion), sin necesitar el mecanismo de compatibilidad `@plugin` para
   plugins JS clásicos. Mantener ambos era redundante (mismas clases utilitarias `animate-in`,
   `fade-in`, `slide-in-*` por duplicado) — se desinstaló `tailwindcss-animate` y se dejó solo
   `tw-animate-css`, que es lo que `shadcn/ui` realmente espera. MIT license igual.

4. **lenis — aprobado condicionalmente, NO instalado en esta fase.**
   Librería de scroll suave con inercia, MIT license. Tiene sentido para páginas largas con
   parallax o secciones ancladas con scroll-snap. El proyecto hoy no tiene ese patrón: las páginas
   de ciudad son secciones apiladas normales, y el único anchor-scroll existente
   (`/#testimonios`, `Footer.tsx`) es un salto simple de una sección, no un caso que necesite
   inercia de scroll. Mismo criterio que GSAP: se aprueba para cuando exista una página con ese
   requisito real, no se instala especulativamente.

5. **shadcn/ui + Radix primitives — se instala ahora, base de componentes accesibles.**
   `shadcn/ui` no es una dependencia de npm tradicional: es un CLI que copia componentes fuente
   (no un paquete que se actualiza vía `npm update`) construidos sobre Radix UI (primitivas
   headless accesibles: manejo de foco, roles ARIA, navegación por teclado ya resueltos). MIT
   license tanto shadcn/ui como Radix. Reemplaza la necesidad de reconstruir accordion/dialog/
   dropdown a mano — el proyecto ya tiene un acordeón hecho a mano (`FAQAccordionPedraEOuro.tsx`)
   que **no se toca** en este ADR; queda como decisión futura si migrarlo o no.

6. **Storybook — se instala ahora, para previsualizar componentes/animaciones aisladas.**
   MIT license. Permite ver un componente (o una variante de animación) sin levantar la página
   real ni depender del dev server completo — relevante en este proyecto porque el Browser pane de
   esta sesión tiene un bug confirmado de la herramienta (ver `KNOWN-ISSUES.md`) que impide
   verificar visualmente vía `screenshot`; Storybook no resuelve ese bug, pero da una superficie
   de componente aislado más fácil de inspeccionar por `read_page`/`javascript_tool`.

**Consecuencias:**
- Se instalan como dependencias reales: `motion`, `tailwindcss-animate`, `shadcn/ui` (vía CLI,
  no como paquete de runtime) + los primitivos de Radix que shadcn resuelva automáticamente,
  Storybook (vía CLI, como devDependency).
- `gsap`, `@gsap/react` y `lenis` quedan **aprobados pero no instalados** — quien los necesite
  para una feature concreta debe verificar primero que este ADR sigue vigente (podría ya haber
  cambiado la situación de scroll/parallax del sitio) antes de agregarlos.
- Ningún componente existente (`FAQAccordionPedraEOuro.tsx`, el acordeón `<details>` de `/faq`,
  los toggles de tema del Header) se migra a shadcn/Radix en este ADR — es una decisión de stack,
  no una migración de componentes ya construidos.
- Toda animación nueva debe respetar `prefers-reduced-motion` (patrón ya usado 3 veces en
  `app/globals.css`) y evitar propiedades que generen layout shift (usar `transform`/`opacity`) —
  ver la skill `motion-tu-lugar-en-galicia` (`.claude/skills/`) y el agente `Motion Designer`
  (`~/.claude/agents/`) para el detalle de estas reglas.

**Referencia cruzada:** este ADR vive en `/docs/adr/` (carpeta nueva) en vez de agregarse inline a
`docs/ARCHITECTURE.md` junto a ADR-001..009 — mantiene la numeración secuencial (continúa después
de ADR-009) pero como archivo separado, siguiendo el pedido explícito de esta tarea. Se deja un
puntero en `docs/ARCHITECTURE.md` para que quede descubrible desde un solo lugar.

---

## Hallazgo real durante la instalación: colisión de `components/ui/Button.tsx`

`npx shadcn@latest init` (con el alias `ui` por defecto, `@/components/ui`) **sobrescribió** el
componente compartido existente `components/ui/Button.tsx` (usado en `Header.tsx` y otros) con su
propio `Button` genérico (`components/ui/button.tsx`). En Windows el filesystem es case-insensitive
— `button.tsx` y `Button.tsx` son el mismo archivo — así que el CLI pisó el componente real del
proyecto sin ningún aviso. Se detectó por `git diff` antes de commitear, se revirtió (`git checkout
-- components/ui/Button.tsx app/layout.tsx`, este último también había sumado una fuente `Geist`
no pedida) y se corrigió `components.json`: `aliases.ui` ahora apunta a `@/components/ui/shadcn`
en vez de `@/components/ui` — cualquier componente que se agregue con `npx shadcn add <nombre>` a
partir de ahora se escribe en `components/ui/shadcn/<nombre>.tsx`, sin poder colisionar nunca con
los componentes propios del proyecto (que siguen en `components/ui/` directamente, con mayúscula).

Se verificó el pipeline completo end-to-end antes de dar esto por resuelto: se agregó un botón de
prueba real (`npx shadcn add button`), se renderizó en una ruta temporal, se confirmó que sus
clases utilitarias (`bg-primary`, `h-8`, `rounded-lg`, etc.) compilan a CSS real con valores
computados correctos — y se borró la ruta y el componente de prueba después (esta fase es solo
instalación, no implementación).

También se confirmó en vivo que el `@layer base { body {...} html {...} }` que el init de shadcn
agregó a `app/globals.css` **no genera ninguna regla CSS real hoy** (Tailwind v4 no genera
utilidades sin uso real en el árbol — nadie usa `bg-background`/`font-sans` todavía) y que el
`body{}` propio del proyecto (sin `@layer`, así que gana por cascada sobre cualquier regla en
capa) sigue controlando el fondo/color/tipografía real del sitio sin cambios. Se dejó un mapeo
`--font-sans: var(--font-ui)` en el `@theme inline` que sumó shadcn, por si algún componente futuro
usa la clase `font-sans` directamente — sin esto, esa clase resolvería a una fuente indefinida.

---

## Revisión de CSP (`middleware.ts`)

El proyecto **ya tiene** una Content-Security-Policy activa (`middleware.ts:43-71`, documentada
como A05 en `CLAUDE.md` §9): `script-src` con nonce por-request + hashes SHA-256 (sin
`unsafe-inline`, sin `unsafe-eval` en producción); `style-src 'self' 'unsafe-inline'`.

**Confirmado: ninguna de las herramientas instaladas en este ADR necesita cambios de CSP.**

- **`motion`**: anima escribiendo directo sobre `element.style.*` (CSSOM), no inyecta elementos
  `<style>` ni usa `eval()`/`new Function()`. La mutación de propiedades de estilo vía CSSOM no
  está sujeta a `style-src` (a diferencia de `<style>` inline en el markup o `innerHTML`) — no
  requiere `unsafe-eval` ni ampliar `style-src`.
- **`tailwindcss-animate`**: son clases utilitarias compiladas al bundle de CSS en build time
  (servidas como `style-src 'self'`, ya permitido) — no hay nada runtime que inyectar.
- **`shadcn/ui` + Radix**: los primitivos (Dialog, Dropdown, Accordion) posicionan sus popovers
  también vía CSSOM (estilo del mismo mecanismo que Popper.js: `element.style.transform`), no
  `<style>` inyectado ni `eval`. Sin impacto en CSP.
- **Storybook**: corre como proceso de desarrollo completamente separado (su propio dev server,
  puerto propio), nunca se despliega a producción — no interactúa con la CSP del middleware de
  la app en ningún momento.
- **gsap/lenis** (aprobados condicionalmente, no instalados): mismo mecanismo que `motion`
  (mutación CSSOM), sin impacto esperado en CSP si se instalan a futuro — reconfirmar igual en
  ese momento, no asumir que este análisis sigue vigente sin revisar.

No se modificó `middleware.ts` — no hace falta ningún cambio hoy.

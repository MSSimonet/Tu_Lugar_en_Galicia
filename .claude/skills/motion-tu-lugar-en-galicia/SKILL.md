---
name: motion-tu-lugar-en-galicia
description: >-
  Reglas de animación e interacción de "Tu Lugar en Galicia". Usar SIEMPRE que
  se agregue o edite cualquier animación, transición o micro-interacción:
  variants de motion, transiciones de gsap, clases animate-* de
  tw-animate-css, o cualquier cambio de estado visual con movimiento. Fija el
  easing de marca, las duraciones máximas ya acordadas, la obligatoriedad de
  prefers-reduced-motion, y la prohibición de animar layout shift. Si dudás
  de si un cambio visual cuenta como "animación", aplicá esta skill.
---

# Motion — Tu Lugar en Galicia

> Fuente de verdad: `docs/adr/010-stack-animacion-interaccion.md` (stack aprobado) y
> `docs/design-system.md` (identidad visual, aún sin sección de movimiento — esta skill
> la cubre hasta que se documente ahí). Ver también el agente `Motion Designer`
> (`~/.claude/agents/`), que aplica estas reglas al proponer animaciones.

## Cuándo aplica

Aplicá esta skill a **todo lo que se mueve o transiciona** en la interfaz:

- `variants`/`transition`/`initial`/`animate`/`exit` de `motion`
- Timelines o `ScrollTrigger` de gsap (si el proyecto lo instala a futuro, ver ADR-010)
- Clases utilitarias `animate-*`/`fade-*`/`slide-*` de `tw-animate-css`
- `@keyframes` y clases `.animate-*` propias del proyecto (`app/globals.css`)
- Cualquier `transition-*` de Tailwind o CSS que acompañe un cambio de estado

## Easing de marca — no usar easings genéricos sin justificar

**El easing de marca es `cubic-bezier(0.4, 0, 0.2, 1)`** — ya está codificado como
`.transition-brand` en `app/globals.css:117` y en uso real (Header, botones, tarjetas).
No es una elección arbitraria para esta skill: es una curva "standard ease" sin rebote ni
overshoot, coherente con el tono editorial/cálido de la marca (relocation service serio y de
confianza, no una app lúdica) — un spring/bounce (como el `--mar-spring:
cubic-bezier(0.34, 1.56, 0.64, 1)` que existe en el sistema "Mar Abierto", hoy no vigente)
comunicaría un tono más juguetón que no encaja con Pedra e Ouro.

**Regla:** toda animación nueva reusa `cubic-bezier(0.4, 0, 0.2, 1)` (o la clase
`.transition-brand` si aplica) salvo que haya una razón concreta y documentada para otra curva
— nunca `ease`, `ease-in-out` genérico de CSS, ni un cubic-bezier inventado sin justificar por
qué el estándar de marca no sirve para ese caso puntual.

## Duraciones máximas (ya acordadas)

| Tipo de interacción | Duración máxima |
|---|---|
| Micro-interacciones (hover, focus, toggle, botones) | **200ms** (el estándar ya en uso) |
| Entradas de contenido (fade-in, slide-in de secciones) | **400ms** |
| Modales, diálogos, estados de carga | **sin tope estricto** — pueden durar más si comunican progreso real (ej. spinner, skeleton), nunca decorativos |

Ninguna animación decorativa (que no comunique estado, jerarquía o feedback) supera los 400ms.

## `prefers-reduced-motion` — obligatorio, sin excepción

Toda animación nueva necesita su contraparte en `@media (prefers-reduced-motion: reduce)` que la
neutralice (estado final directo, sin transición). El patrón ya existe 3 veces en
`app/globals.css` (`.animate-fade-in-up`, `.animate-hero-content`, animaciones del stepper) —
extenderlo, no inventar uno nuevo. Para `motion`, usar `useReducedMotion()` del propio paquete en
vez de un `matchMedia` manual cuando el componente sea `'use client'`.

## Prohibido: animar layout shift

**Solo `transform` y `opacity`.** Nunca animar `width`, `height`, `top`/`left`/`right`/`bottom`
(fuera de `position: fixed/absolute` con `transform`), `margin` o `padding` — esas propiedades
disparan reflow/repaint y generan Cumulative Layout Shift real, no solo un problema estético.
Si una animación "necesita" cambiar tamaño, usar `transform: scale()` en vez de `width`/`height`.

## Checklist antes de agregar una animación

- [ ] ¿Usa `cubic-bezier(0.4, 0, 0.2, 1)` (o `.transition-brand`), o hay una razón documentada
      para otra curva?
- [ ] ¿Está dentro de 200ms (micro-interacción) o 400ms (entrada de contenido)? Si es más largo,
      ¿es un modal/carga con progreso real?
- [ ] ¿Tiene su contraparte en `prefers-reduced-motion: reduce`?
- [ ] ¿Solo anima `transform`/`opacity`? ¿Ninguna propiedad de layout?
- [ ] ¿Comunica algo real (estado, jerarquía, feedback) o es decorativa sin motivo?

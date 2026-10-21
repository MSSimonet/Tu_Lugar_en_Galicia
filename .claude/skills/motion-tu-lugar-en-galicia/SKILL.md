---
name: motion-tu-lugar-en-galicia
description: Reglas de animación e interacción de Tu Lugar en Galicia. Aplicar a toda animación, transición o efecto de scroll nuevo. Easing de marca, duraciones máximas, prefers-reduced-motion obligatorio, prohibido animar layout.
metadata:
  origin: proyecto
  fuente: docs/adr/010-stack-animacion-interaccion.md
---

# Animación e interacción — Tu Lugar en Galicia

## Cuándo se aplica

Toda animación, transición, efecto de scroll o micro-interacción **nueva**. También al ajustar
una existente.

No se aplica a componentes ya construidos que nadie pidió tocar: ADR-010 es una decisión de
stack, **no una orden de migrar lo que ya funciona**.

## Fuente de verdad

`docs/adr/010-stack-animacion-interaccion.md` — el ADR que fija el stack y sus límites.
Complemento: `DESIGN.md` §7 (duraciones) y `lib/motion/variants.ts` (el código real).

**Esta skill no los duplica: los aplica.** Si hay contradicción, manda el ADR.

## Las cinco reglas duras

1. **Easing de marca.** Reusar `BRAND_EASE` de `lib/motion/variants.ts` —
   `[0.4, 0, 0.2, 1]`. **No inventar curvas.** Si una animación "pide" otra curva, casi
   siempre lo que pide en realidad es otra duración.
2. **Duraciones con techo.** Entradas de contenido **≤400 ms**, micro-interacciones **≤200 ms**.
   Por encima de 400 ms solo modales o cargas con progreso real.
3. **`prefers-reduced-motion` es obligatorio.** En componentes `'use client'` que animen, vía
   `useReducedMotion()` de `motion/react`. En CSS, con la media query. No es un extra de
   accesibilidad: hay gente a la que el movimiento le produce náuseas.
4. **Animar solo `transform` y `opacity`.** Nunca `width`, `height`, `margin`, `top`, `left`.
   Esas provocan layout shift real, y el sitio tiene **CLS 0,0000** medido — un número que
   costó y que una sola animación descuidada arruina.
5. **Nada de animación infinita sin pausa fuera de viewport.** Ya hay precedente en el repo.

## Qué está instalado y qué no

Antes de importar algo, comprobarlo — el ADR tiene addenda y el estado cambió más de una vez:

| Paquete | Estado |
|---|---|
| `motion` (ex framer-motion) | instalado, es el default |
| `gsap` / `@gsap/react` | instalados, para scroll-driven concreto |
| `lenis` | **aprobado pero NO instalado** |

Si algo no está instalado, no se instala sin releer el ADR: puede haber cambiado la situación
que justificaba la decisión.

## El error que ya se cometió una vez

En la auditoría del 2026-07-31 se culpó a las animaciones infinitas del score de performance
77, se les agregó pausa fuera de viewport, y **el score no se movió ni un punto**. La causa real
era el nonce de CSP (ver `CLAUDE.md` §9).

Moraleja para cualquier optimización de animación: **medir antes y después**, y si el número no
se mueve, revertir la explicación, no insistir.

## Checklist antes de dar una animación por terminada

- [ ] ¿Usa `BRAND_EASE` o inventé una curva?
- [ ] ¿Está por debajo de su techo de duración?
- [ ] ¿Respeta `prefers-reduced-motion`?
- [ ] ¿Anima solo `transform`/`opacity`?
- [ ] ¿Medí el CLS después, o lo estoy suponiendo?
- [ ] ¿Aporta algo, o es movimiento porque sí?

La última es la que más filtra.

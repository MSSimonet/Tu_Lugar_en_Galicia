# DESIGN-BACKUP.md — Snapshot de respaldo del sistema de diseño

> Generado: 2026-07-17, antes de la exploración radical de diseño en la rama
> `design/radical-explore`. Extraído directamente de `app/globals.css`,
> `app/layout.tsx` y uso real en `/components` (no de `docs/design-system.md`
> ni de `DESIGN.md` §2-§3, que están desactualizados — ver nota de discrepancia
> más abajo). Sirve como punto de restauración si la exploración necesita
> revertirse.

---

## ⚠️ Discrepancia importante detectada

Hay **tres documentos distintos** que describen "el" sistema de diseño, y solo uno
coincide con el código que corre en producción:

| Fuente | Paleta que describe | ¿Es la que usa el sitio real? |
|---|---|---|
| `docs/design-system.md` | `laton` #8F722B + `atlantico` #1A5247, Fraunces + Plus Jakarta Sans | ❌ No — superado |
| `DESIGN.md` §2-§3 | Mismo sistema laton/atlantico | ❌ No — el propio archivo trae una nota fechada 2026-07-16 avisando que está desactualizado |
| **Código real** (`app/globals.css` tokens `--po-*`, usado en 36 componentes) | **Pedra e Ouro**: `ouro` #C89B3C (dorado) + `pedra` #3D3530, Playfair Display + Lato | ✅ **Sí — este es el sistema vigente** |

El mensaje original que me diste describía la paleta "laton/atlántico" como la actual —
esa descripción coincide con la documentación pero no con el código. Documento acá
el sistema **realmente vigente (Pedra e Ouro)** para que el respaldo sea útil de verdad.

Además, `app/globals.css` y `app/layout.tsx` ya contienen **tres sistemas experimentales
adicionales**, definidos pero no aplicados a ningún componente visible (tokens
declarados, fuentes cargadas, cero uso en `/components`): **Atlántico Editorial**
(`--ae-*`), **Mar Abierto** (`--mar-*`) y **Apps Útiles** (`--au-*`, este sí se usa,
pero solo en la sección `/apps-utiles`, no en el sitio general). Las 3 direcciones
nuevas de la Fase 2 deben ser distintas también de estos tres, no solo de Pedra e Ouro.

---

## 1. Sistema vigente: Pedra e Ouro (`--po-*`)

Fuente: `app/globals.css` líneas 253-288, uso confirmado en 36 componentes
(`Header.tsx`, `Footer.tsx`, `HeroPedraEOuro.tsx`, `GinaWidget.tsx`, `Testimonios.tsx`,
`MuroLlavesCarrusel3D.tsx`, `CiudadLayout.tsx`, etc.)

### Paleta

| Token | Hex / valor | Uso |
|---|---|---|
| `--po-pedra` | `#3D3530` | Texto principal (invierte en dark) |
| `--po-ouro` | `#C89B3C` | Acento principal, fijo en ambos temas |
| `--po-ouro-hover` | `#A67C25` | Hover sobre dorado, fijo |
| `--po-ouro-text` | `#8A6220` | Texto dorado AA sobre fondo claro (4.68:1); en dark usa `--po-ouro` (5.98:1) |
| `--po-ouro-ink` | `#1A1410` | Texto sobre botón dorado (7.14:1), fijo |
| `--po-terra` | `#8B6E4E` | Secciones secundarias, fijo |
| `--po-areia` | `#F2EDE4` | Canvas claro (invierte en dark) |
| `--po-luz` | `#FBF8F2` | Superficie muy clara (invierte en dark) |
| `--po-muted` | `#6E625A` | Texto secundario (AA 5.06:1, invierte en dark) |
| `--po-borde` | `#DDD5C8` | Borde cálido (invierte en dark) |
| `--po-hero-bg` | `#2C2420` | Bookend siempre oscuro (hero/CTA), no invierte |
| `--po-hero-text` | `#F5EFE4` | Texto sobre hero-bg, no invierte |

Modo oscuro (override bajo `.dark`): `--po-areia` → `#2A2420`, `--po-luz` → `#332C27`,
`--po-pedra` → `#F0E8DC`, `--po-muted` → `#A8998C`, `--po-borde` → `#4A3F38`,
`--po-ouro-text` → `#C89B3C`.

### Tipografía

- Display: `--font-po-display` = `Playfair Display` → Georgia serif (pesos 700/900, itálica incluida)
- UI: `--font-po-ui` = `Lato` → Helvetica Neue sans (pesos 400/700)

### Forma y elevación

- `--po-radius-card`: `12px`
- `--po-shadow-sm/md/lg`: sombra con tinte cálido (`color-mix` sobre `--po-hero-bg`), no negro puro — funciona igual en claro y oscuro sin overrides `.dark`.

### Base compartida (no exclusiva de Pedra e Ouro, sigue activa)

- Espaciado: `--space-1` (4px) a `--space-24` (96px), escala estándar del proyecto.
- Radios base: `--radius-card` 8px, `--radius-pill` 999px (usados por `CalEmbed.tsx` y `FormularioDiagnostico.tsx`, fuera del pase Pedra e Ouro).
- Tracking UI: `0.06em`.
- Transición estándar: `.transition-brand` — color/bg/border/shadow/transform/opacity, `cubic-bezier(0.4,0,0.2,1)`, 200ms.
- `html { scroll-behavior: smooth }`.
- Animaciones existentes: `fadeInUp` (0.5s ease-out), `heroContentIn` (0.75s ease-out, delay 0.15s), `tlgUp`/`tlgStage` (stepper "Cómo funciona"). Todas respetan `prefers-reduced-motion: reduce` (fallback a estado final sin animación).

### Componentes clave (inventario, de `docs/design-system.md` §4, vigente)

`Button` (primario/secundario/fantasma), `WhatsAppFloat`, `Hero` (`HeroPedraEOuro.tsx`),
`MetricCard`, `Marcador`, `CityCard` (`CiudadLayout.tsx`), `StepList`, `Testimonial`,
`KeyWallGrid` (`MuroLlavesCarrusel3D.tsx`), `InstagramFeed` (`FeedInstagram.tsx`),
`FAQAccordion`, `DiagnosticForm`, `Footer`, `GinaWidget` (widget de chat flotante).

---

## 2. Sistemas experimentales dormidos (tokens definidos, sin aplicar al sitio general)

### Atlántico Editorial (`--ae-*`)
Papel `#F8F5EF`, tinta `#0F172A`, océano `#1E3A5F`, ámbar `#B45309`. Tipografía:
`Jost` (display) + `DM Sans` (UI).

### Mar Abierto (`--mar-*`)
Canvas `#E4EDEA`, ink `#0C1F1A`, teal `#0D9488`. Tipografía: `Syne` (display) +
`Nunito Sans` (UI). Easing propio: `--mar-spring: cubic-bezier(0.34, 1.56, 0.64, 1)`.

### Apps Útiles (`--au-*`) — sí en uso, pero solo en `/apps-utiles`
Dorado `#c9a237`, fondo crema `#f8f3ea`. Tipografía: `Lora` (display) + `Work Sans` (UI).
Sigue el toggle claro/oscuro global.

---

## 3. Fuentes cargadas en `app/layout.tsx` (todas, no solo las vigentes)

`Plus Jakarta Sans`, `Cormorant Garamond`, `Syne`, `Nunito Sans`, `Fraunces`, `DM Sans`,
`Jost`, `Playfair Display`, `Lato`, `Lora`, `Work Sans` — 11 familias cargadas vía
`next/font/google`, todas expuestas como variables CSS en `<html>`.

---

## 4. Cómo restaurar desde este backup

Si una exploración necesita revertirse: los tokens `--po-*` y su uso en los 36
componentes listados arriba siguen intactos en `app/globals.css` mientras no se
borren explícitamente. Este documento es la referencia de qué valores debían tener.

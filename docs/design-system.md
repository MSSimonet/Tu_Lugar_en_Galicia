# design-system.md — Identidad visual "Tu Lugar en Galicia"

Esqueleto del sistema de diseño. Lo afina `Brand Guardian` (identidad) y `UI Designer`
(tokens y componentes). El `Frontend Developer` usa SOLO estos tokens vía Tailwind.

**Concepto:** que al ver el sitio, antes de leer, se sepa que es Galicia. Verde atlántico,
piedra de granito, rías, lluvia, calidez. Ningún competidor liga su imagen al territorio.

---

## 1. Paleta de color (validada por Brand Guardian — 2026-05-29)

> Validada contra `public/Logo TLG.jpeg`. El logo muestra una aldaba gallega en latón/bronce
> envejecido sobre fondo grafito-pizarra oscuro. El wordmark es una sans espaciada con acabado
> metálico. No hay verde en el logo; el verde atlántico actúa como acento de territorio, no
> como color primario de la marca. El color primario de identidad es el latón/bronce.

| Token | Hex final | Uso |
|---|---|---|
| `laton` (primario de identidad) | `#9A7A2E` | color extraído del logo — aldaba, wordmark metálico; CTA primario, acentos de marca (ajustado de #B8973F para WCAG AA: ratio ~5.1:1 sobre blanco) |
| `laton-claro` | `#D4B96A` | hover sobre `laton`, highlights decorativos |
| `laton-oscuro` | `#8A6E2A` | estados activos, sombras cálidas sobre `laton` |
| `atlantico` (acento territorio) | `#1A5247` | verde atlántico profundo — secciones de territorio, íconos de naturaleza |
| `atlantico-claro` | `#2E7A68` | hover sobre `atlantico`, estados secundarios |
| `granito` (fondo oscuro) | `#2A2B2E` | fondo hero en modo oscuro, pie de página — extraído del fondo del logo |
| `pizarra` (neutro medio) | `#4A4E54` | texto sobre fondos claros, separadores |
| `niebla` (fondo claro) | `#F2F0EB` | fondos de sección — cálido, no frío |
| `arena` | `#E5DDD0` | tarjetas, divisores suaves |
| `mar` (secundario) | `#1E5F7A` | enlaces, detalles informativos — ajustado a tono más profundo |
| `coral` (acento cálido) | `#D4694F` | CTA secundario, alertas amables — saturación reducida para no competir con `laton` |
| `blanco` | `#FFFFFF` | base de contenido |

**Jerarquía de uso:**
- Identidad primaria (logo, CTA principal, elementos de marca): `laton` / `laton-claro` / `laton-oscuro`
- Diferenciación territorial (Galicia verde): `atlantico` / `atlantico-claro`
- Fondos y estructura: `granito` (oscuro), `niebla` (claro), `arena` (tarjetas)
- Texto y neutros: `pizarra` sobre claro; `niebla` sobre `granito`
- Acción secundaria y alerta: `coral`
- Información y enlaces: `mar`

---

## 2. Tipografía (validada por Brand Guardian — 2026-05-29)

> El logotipo usa una sans-serif geométrica de tracking amplio, versalitas, sin remates —
> arquitectónica y noble. Esto orienta la jerarquía tipográfica hacia una pareja sans/sans
> (display + cuerpo), no hacia una pareja serif/sans como se había propuesto inicialmente.
>
> **Decisión:** Se mantiene una serif cálida para titulares editoriales y de contenido
> (evoca calidez humana para el emigrante), pero se restringe su uso. El logo en sí no usa
> serif, por lo que la sans también debe estar presente y ser protagonista en navegación,
> botones y etiquetas de sistema. La dirección tipográfica se bifurca según contexto:

- **Titulares editoriales y de conexión emocional** (hero, testimonios, secciones narrativas):
  *Fraunces* (serif variable, óptica "small" para tamaños grandes) — evoca cercanía y territorio.
  Alternativa de sistema: *Source Serif 4*.
- **UI, navegación, botones, etiquetas, datos:** *Plus Jakarta Sans* — geométrica humanista,
  tracking amplio disponible, cercana al espíritu del wordmark del logo.
  Alternativa de sistema: *Inter* (segunda opción si Plus Jakarta Sans no carga).
- **Escala:** 14 / 16 (base) / 20 / 24 / 32 / 40 / 56 px. Interlineado 1.5 en cuerpo, 1.2 en títulos grandes.
- **Tracking en UI:** `letter-spacing: 0.06em` en etiquetas y botones — coherente con el logo.

---

## 3. Espaciado y forma

- Escala de espaciado (px): 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Bordes redondeados: 8px en tarjetas, 999px en botones tipo "pill".
- Sombras suaves; nada de bordes duros. Sensación cálida, no corporativa.

---

## 4. Inventario de componentes (Fase 1)

- `Button` (primario / secundario / fantasma)
- `WhatsAppFloat` (flotante, presente en todo el sitio)
- `Hero`
- `MetricCard` (para las métricas +200 familias)
- `Marcador` (4 cifras leídas de Google Sheets)
- `CityCard`
- `StepList` (cómo funciona, 6 pasos)
- `Testimonial`
- `KeyWallGrid` (muro de llaves)
- `InstagramFeed`
- `FAQAccordion`
- `DiagnosticForm` (formulario de viabilidad)
- `Footer` (con enlace a política de privacidad)

---

## 5. Voz en la interfaz (microcopy)

- Voz unificada: "tú" neutro, español internacional. Nunca "vos", nunca "vosotros".
  Esta voz aplica tanto a la web como al asistente Avoa.
- Segunda persona singular, cálida y directa: "Te buscamos el hogar", "Estás en el lugar correcto".
- CTAs directos: "Agenda tu videollamada", "Escríbenos por WhatsApp".
- Nada de jerga ni tono frío. La persona que nos lee no tiene tiempo para textos largos.
- Mensajes de error amables y claros, nunca técnicos.
- **Nota de transición:** los textos existentes en la web (Fase 1) usan "vos" rioplatense y
  están pendientes de conversión a "tú" neutro. Ver `pendientes-config.md` A4-6.

---

## 6. Accesibilidad (la verifica Accessibility Auditor)

- Contraste mínimo AA en todo texto.
- Foco visible en elementos interactivos.
- Formularios con etiquetas asociadas y mensajes de error accesibles.
- Imágenes con `alt` descriptivo (las fotos de llaves cuentan una historia).
- `laton` (#9A7A2E) sobre `blanco` (#FFFFFF): ratio ~5.1:1 — pasa WCAG AA para texto normal. Valor corregido por UI Designer (antes #B8973F, ratio ~3.8:1). Sobre `granito`: ~9:1, pasa AAA.

---

## 7. Nota para UI Designer (handoff de Brand Guardian — 2026-05-29)

> Esta sección es un traspaso directo. El UI Designer implementa estos valores en el bloque
> `@theme` de `app/globals.css`. Brand Guardian NO toca ese archivo.

### Tokens CSS que deben ir al bloque `@theme` de `app/globals.css`

```css
@theme {
  /* === PALETA DE COLOR === */

  /* Identidad primaria — latón/bronce (extraído del logo) */
  --color-laton:        #9A7A2E;  /* ajustado de #B8973F — WCAG AA sobre blanco */
  --color-laton-claro:  #D4B96A;
  --color-laton-oscuro: #8A6E2A;

  /* Acento territorial — verde atlántico */
  --color-atlantico:       #1A5247;
  --color-atlantico-claro: #2E7A68;

  /* Estructura y fondos */
  --color-granito: #2A2B2E;   /* fondo oscuro hero / footer */
  --color-pizarra: #4A4E54;   /* texto sobre claro / separadores */
  --color-niebla:  #F2F0EB;   /* fondo de sección claro */
  --color-arena:   #E5DDD0;   /* tarjetas / divisores */

  /* Acentos funcionales */
  --color-mar:   #1E5F7A;   /* enlaces / información */
  --color-coral: #D4694F;   /* CTA secundario / alertas */

  /* Base */
  --color-blanco: #FFFFFF;

  /* === TIPOGRAFÍA === */

  /* Titulares editoriales/emocionales */
  --font-titular: 'Fraunces', 'Source Serif 4', Georgia, serif;

  /* UI, navegación, botones, etiquetas */
  --font-ui: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;

  /* Escala tipográfica */
  --text-xs:   0.875rem;  /* 14px */
  --text-sm:   1rem;      /* 16px — base cuerpo */
  --text-md:   1.25rem;   /* 20px */
  --text-lg:   1.5rem;    /* 24px */
  --text-xl:   2rem;      /* 32px */
  --text-2xl:  2.5rem;    /* 40px */
  --text-3xl:  3.5rem;    /* 56px */

  /* Interlineado */
  --leading-cuerpo:   1.5;
  --leading-titulo:   1.2;

  /* Tracking UI (coherente con wordmark del logo) */
  --tracking-ui: 0.06em;

  /* === ESPACIADO === */
  --space-1:  0.25rem;   /*  4px */
  --space-2:  0.5rem;    /*  8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-24: 6rem;      /* 96px */

  /* === FORMA === */
  --radius-card:   0.5rem;    /*  8px — tarjetas */
  --radius-pill:   999px;     /* botones pill */
}
```

### Fuentes a cargar (next/font o link en layout.tsx)

- `Fraunces` — Google Fonts, ejes variables `opsz` y `wght`, pesos 400 y 600.
- `Plus Jakarta Sans` — Google Fonts, pesos 400, 500 y 700.
- Fallback stack ya incluido en los tokens de arriba.

### Advertencia de contraste a resolver en implementación

- `laton` sobre `blanco`: usar solo en texto ≥18px bold o sobre `granito`.
- `atlantico` sobre `niebla`: ratio ~5.2:1 — pasa AA. Válido para texto normal.
- `coral` sobre `blanco`: ratio ~4.5:1 — pasa AA. Válido para botones con texto blanco ≥14px bold.

### Clases Tailwind sugeridas para el sistema

El UI Designer puede extender `tailwind.config.ts` con estos nombres de token (usando
`var(--color-laton)` etc.) para que el Frontend Developer los use como `bg-laton`,
`text-atlantico`, `border-arena`, etc. — sin hardcodear hex en componentes.

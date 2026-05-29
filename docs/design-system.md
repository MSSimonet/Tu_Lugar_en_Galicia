# design-system.md — Identidad visual "Tu Lugar en Galicia"

Esqueleto del sistema de diseño. Lo afina `Brand Guardian` (identidad) y `UI Designer`
(tokens y componentes). El `Frontend Developer` usa SOLO estos tokens vía Tailwind.

**Concepto:** que al ver el sitio, antes de leer, se sepa que es Galicia. Verde atlántico,
piedra de granito, rías, lluvia, calidez. Ningún competidor liga su imagen al territorio.

---

## 1. Paleta de color (propuesta inicial — afinar con Brand Guardian)

| Token | Hex aprox. | Uso |
|---|---|---|
| `atlantico` (primario) | `#1F5A4C` | verde atlántico, acentos, botones primarios |
| `atlantico-claro` | `#3E8E7E` | hover, estados |
| `granito` (neutro oscuro) | `#3A3F44` | texto principal, piedra |
| `niebla` (fondo claro) | `#F4F2ED` | fondos de sección |
| `arena` | `#E8E0D2` | tarjetas, divisores |
| `mar` (secundario) | `#2E6E8E` | enlaces, detalles |
| `coral` (acento cálido) | `#E07A5F` | CTA secundario, alertas amables |
| `blanco` | `#FFFFFF` | base |

> Estos valores son un punto de partida; `Brand Guardian` debe validarlos contra el logo
> (`Logo_TLG.jpeg`) y entregar la versión final antes de que `UI Designer` los fije en Tailwind.

---

## 2. Tipografía

- **Titulares:** una serif cálida con carácter (ej. *Fraunces* o *Source Serif*) — evoca cercanía.
- **Cuerpo:** una sans legible (ej. *Inter* o *Source Sans*) — claridad para móvil.
- Escala: 14 / 16 (base) / 20 / 24 / 32 / 40 / 56. Interlineado cómodo (1.5 en cuerpo).

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

- Segunda persona del plural, cálida: "Les buscamos", "Están en el lugar correcto".
- CTAs directos: "Agendá tu videollamada", "Escribinos por WhatsApp".
- Nada de jerga ni tono frío. El emigrante no tiene tiempo para textos largos.
- Mensajes de error amables y claros, nunca técnicos.

---

## 6. Accesibilidad (la verifica Accessibility Auditor)

- Contraste mínimo AA en todo texto.
- Foco visible en elementos interactivos.
- Formularios con etiquetas asociadas y mensajes de error accesibles.
- Imágenes con `alt` descriptivo (las fotos de llaves cuentan una historia).

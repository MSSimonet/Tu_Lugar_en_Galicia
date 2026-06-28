# Auditoría Técnica Profunda — Tu Lugar en Galicia

**Fecha:** 24 junio 2026  
**Escuadrón activado:** Reality Checker · Code Reviewer · Accessibility Auditor · Performance Benchmarker · Security Engineer · Legal Compliance Checker · Brand Guardian · UI Designer  
**Alcance:** 6 fases · 13 rutas · 57 hallazgos totales  
**Estado:** Solo análisis — sin cambios aplicados

---

## Resumen ejecutivo

| Severidad | Cantidad |
|-----------|----------|
| 🔴 Críticos | 3 |
| 🟠 Importantes | 12 |
| 🟡 Mejoras | 11 |
| ✅ Correctos | 31 |

---

## 🔴 Bugs críticos — bloquean producción

### C-1 · /api/plan/preview expone datos personales sin autenticación
**Archivo:** `app/api/plan/preview/route.ts:1-31`  
**Fase:** 4 (Componentes críticos) + 6 (Seguridad)

El endpoint `/api/plan/preview` devuelve un PDF de ejemplo sin ningún tipo de autenticación. El objeto `EJEMPLO_LEAD` hardcodeado en el archivo contiene email y teléfono reales. El propio comentario del archivo dice: _"Eliminar o proteger antes de producción"_ — y está en código vivo desplegado en Vercel.

**Impacto:** Violación de RGPD (Art. 5 principio de minimización). Dato personal accesible públicamente sin consentimiento. Riesgo legal inmediato.  
**Fix:** Eliminar el archivo o protegerlo con autenticación básica antes del lanzamiento.

---

### C-2 · 4 bloques TODO visibles al usuario en /politica-de-privacidad
**Archivo:** `app/politica-de-privacidad/page.tsx:44, 48, 52, 182`  
**Fase:** 3 (Rutas) + 5 (Calidad) + 6 (Legal)

La página oficial de Política de Privacidad renderiza cuatro `<TodoBlock>` visibles al usuario final con los siguientes textos:
- `TODO: completar razón social (ej: "Silvana Lorenzo Lorenzo" o nombre comercial registrado)`
- `TODO: completar dirección postal en Galicia, España`
- `TODO: completar email dedicado a consultas de protección de datos`
- `TODO: completar email de protección de datos` (línea 182, repetido)

**Impacto:** La AEPD (Agencia Española de Protección de Datos) requiere que estos datos sean exactos y públicos. Una política con TODOs visibles no cumple el RGPD y expone a la empresa a sanciones administrativas.  
**Fix:** Silvana completa los datos reales. Developer reemplaza los cuatro `<TodoBlock>` con los valores definitivos.

---

### C-3 · Voz rioplatense visible en UI — "Llegás y abrís tu puerta"
**Archivo:** `app/como-funciona/Acordeon.tsx:37`  
**Fase:** 3 (Rutas) · Brand Guardian

El paso 05 del acordeón muestra `nombre: 'Llegás y abrís tu puerta'` — imperativos rioplatenses argentinos. Viola la regla central del design system (CLAUDE.md §6.1): _"lo que ve el cliente = tú neutro"_. Es el paso final del proceso de 5 pasos, la posición de máxima visibilidad y cierre emocional del pitch.

**Impacto:** Inconsistencia de voz de marca en el elemento más importante del flujo de conversión. Un usuario venezolano o mexicano lo percibe como error.  
**Fix:** `nombre: 'Llegas y abres tu puerta'`

---

## 🟠 Problemas importantes — degradan calidad significativamente

### I-1 · 4 rioplatensismos en meta descriptions (SEO visible en Google)
**Archivo:** `lib/seo/metadata.ts:30, 43, 95, 108`  
**Fase:** 3 (Rutas) · Brand Guardian

| Línea | Ruta | Texto incorrecto | Corrección |
|-------|------|-----------------|------------|
| 30 | /ciudades/vigo | `"Conocé precios y cómo funciona."` | `"Conoce precios y cómo funciona."` |
| 43 | /ciudades/a-coruna | `'Encontrá piso en A Coruña sin estar en España.'` | `'Encuentra piso en A Coruña sin estar en España.'` |
| 95 | /como-funciona | `'Conocé los 6 pasos de nuestro servicio...'` | `'Conoce los 6 pasos de nuestro servicio...'` |
| 108 | /sobre-silvana | `'Conocé su historia y por qué creó...'` | `'Conoce su historia y por qué creó...'` |

**Impacto:** Los rioplatensismos aparecen en los snippets de Google, LinkedIn y Twitter (og:description). Afectan la percepción de marca en el primer punto de contacto con el usuario.

---

### I-2 · WHATSAPP_DISPLAY es "+34 XXX XXX XXX" — placeholder sin configurar
**Archivo:** `lib/config/site.ts`  
**Fase:** 5 (Calidad de código)

El número de WhatsApp visible en el sitio es un placeholder. Cualquier link de contacto que use `WHATSAPP_DISPLAY` directamente mostraría el placeholder al usuario.

**Impacto:** Medio. El CTA de WhatsApp en `CalEmbed.tsx` usa `wa.me/34605421661` hardcodeado (que sí es un número real), pero la constante `WHATSAPP_DISPLAY` está desincronizada y podría usarse en otros lugares.  
**Fix:** Actualizar `WHATSAPP_DISPLAY` al número real en `lib/config/site.ts`.

---

### I-3 · Imagen placeholder de Silvana activa en producción
**Archivo:** `app/sobre-silvana/page.tsx:45`  
**Fase:** 3 (Rutas) · UI Designer

```tsx
src="https://placehold.co/400x400/9A7A2E/FFFFFF?text=Silvana"
```

La página `/sobre-silvana` muestra una imagen generada por placehold.co en el hero. Es la página de confianza más crítica del sitio — el único lugar donde el usuario ve quién es la persona detrás del servicio.

**Impacto:** Alto impacto en conversión. Un servicio de relocation vende confianza personal; una imagen placeholder destruye esa confianza.  
**Fix:** Reemplazar con foto real de Silvana (400×400 px mínimo, formato WebP/JPG optimizado).

---

### I-4 · Avatares de 3 testimonios con placeholders (home page)
**Archivo:** `components/home/Testimonios.tsx:12, 20, 28`  
**Fase:** 3 (Rutas) · UI Designer

```tsx
avatar: "https://placehold.co/80x80/1A5247/F2F0EB?text=VR",
avatar: "https://placehold.co/80x80/1A5247/F2F0EB?text=MF",
avatar: "https://placehold.co/80x80/1A5247/F2F0EB?text=DC",
```

Los testimonios son el principal elemento de social proof en la home. Los tres muestran círculos con iniciales generadas en lugar de fotos reales.

**Impacto:** Los testimonios con fotos genéricas tienen un ratio de credibilidad significativamente menor. Los usuarios experimentados los identifican inmediatamente como placeholders.  
**Fix:** Obtener fotos reales (con permiso explícito de cada persona) o iniciales estilizadas en el design system si las fotos no están disponibles.

---

### I-5 · npm audit: 3 vulnerabilidades moderate
**Fase:** 6 (Seguridad)

| Paquete | CVE / GHSA | Descripción |
|---------|-----------|-------------|
| `js-yaml` | GHSA-h67p-54hq-rp68 | DoS via merge key aliases en YAML |
| `postcss` | GHSA-qx2v-qp2m-jg93 | XSS via `</style>` sin escapar |
| `next` | Dependiente | Afectado por postcss transitivo |

**Fix:** `npm audit fix` o actualizar las dependencias que traen `js-yaml <4.1.1` y `postcss <8.5.10`.

---

### I-6 · recordId sin validación de formato en /api/plan/[recordId]/pdf
**Archivo:** `app/api/plan/[recordId]/pdf/route.ts:10-11`  
**Fase:** 4 (Componentes críticos) + 6 (Seguridad)

```ts
const { recordId } = await params
// ← Falta validación aquí
const lead = await getLead(recordId) // recordId se pasa directamente
```

El parámetro `recordId` se pasa sin verificar que sea un ID válido de Airtable (patrón: alfanumérico, ~17 caracteres). Aunque Airtable rechaza IDs malformados, un input inesperado podría causar comportamiento no definido o exponer mensajes de error internos.

**Fix:**
```ts
if (!recordId || !/^[a-zA-Z0-9]{10,20}$/.test(recordId)) {
  return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
}
```

---

### I-7 · og-default.jpg posiblemente ausente en /public
**Archivo:** `lib/seo/og.ts`  
**Fase:** 1 (Config) + 2 (Layout global)

La función `buildOpenGraph()` referencia `/og-default.jpg` como fallback para páginas sin imagen OG explícita. Si este archivo no existe físicamente en `/public`, todos los previews de redes sociales fallan silenciosamente (la URL devuelve 404 y las plataformas no muestran imagen).

**Fix:** Verificar que `/public/og-default.jpg` existe. Si no, crear una imagen OG de 1200×630px con el branding del proyecto.

---

### I-8 · FormularioDiagnostico.tsx: 1240 líneas — mantenimiento crítico
**Archivo:** `components/conocernos/FormularioDiagnostico.tsx`  
**Fase:** 5 (Calidad de código)

El componente más grande del proyecto concentra toda la lógica del formulario de captación de leads (ruta `/conocernos`). 1240 líneas en un solo archivo hace imposible testear secciones por separado y aumenta drásticamente el riesgo de regresiones en cada cambio.

**Impacto:** Cualquier bug en este formulario afecta la captación completa de leads — el objetivo principal del negocio.  
**Fix:** Dividir en `SeccionContacto`, `SeccionFamilia`, `SeccionVivienda`, `SeccionLegal` y un `FormularioDiagnostico` orquestador que los componga.

---

### I-9 · Año hardcodeado en Footer
**Archivo:** `components/layout/Footer.tsx`  
**Fase:** 2 (Layout global)

El copyright muestra `© 2026 Tu Lugar en Galicia`. En enero 2027 el footer mostrará un año incorrecto sin que nadie lo note necesariamente.

**Fix:** `© {new Date().getFullYear()} Tu Lugar en Galicia`

---

### I-10 · CALCOM_URL sigue siendo placeholder (Cal.com no funciona)
**Archivo:** `lib/config/site.ts`  
**Fase:** 3 (Rutas)

```ts
export const CALCOM_URL = 'https://cal.com/tu-usuario'
```

El embed de Cal.com detecta correctamente el placeholder y muestra el fallback de WhatsApp — pero la funcionalidad de auto-agenda está completamente inactiva. Es el CTA principal de la página `/agenda`.

**Fix:** Silvana provee su URL real de Cal.com. Actualizar la constante.

---

### I-11 · Scripts npm incompletos: falta `type-check`
**Archivo:** `package.json`  
**Fase:** 1 (Config)

No existe un script `"type-check": "tsc --noEmit"`. Los errores de TypeScript solo se detectan durante `next build`, no en CI pre-push ni en desarrollo local sin compilación completa.

**Fix:**
```json
"scripts": {
  "type-check": "tsc --noEmit",
  "lint:fix": "eslint . --fix"
}
```

---

### I-12 · FORCE_SOLID_PATHS: /agenda posiblemente faltante
**Archivo:** `components/layout/Header.tsx:32`  
**Fase:** 2 (Layout global) · Accessibility Auditor

```ts
const FORCE_SOLID_PATHS = ['/conocernos', '/como-funciona', '/faq', '/politica-de-privacidad']
```

La ruta `/agenda` tiene un hero con texto H1 oscuro. Sin scroll, el header transparente puede generar texto sobre texto (blanco sobre oscuro o viceversa dependiendo del fondo real). Requiere verificación visual.

**Fix:** Verificar en browser. Si el header es ilegible sin scroll, añadir `'/agenda'` al array.

---

## 🟡 Mejoras recomendadas — buenas prácticas

### M-1 · Sin CSP global (Content Security Policy)
**Archivo:** `next.config.ts`  
**Fase:** 6 (Seguridad)

La CSP configurada en `next.config.ts` solo aplica a imágenes SVG inline, no al sitio completo. Un `middleware.ts` con headers de seguridad mejoraría la postura frente a XSS y clickjacking:

```ts
// middleware.ts
response.headers.set('X-Content-Type-Options', 'nosniff')
response.headers.set('X-Frame-Options', 'DENY')
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
```

---

### M-2 · Rate limiting solo documental — no ejecutado en código
**Archivo:** `app/api/lead/route.ts:121`  
**Fase:** 6 (Seguridad)

```ts
const COMMON_HEADERS = { 'X-RateLimit-Policy': '1 req/s per IP' }
```

El header anuncia rate limiting pero no hay lógica que lo aplique. Un bot puede enviar leads masivos sin restricción.

**Fix:** Implementar rate limiting real con Vercel KV o `@upstash/ratelimit` antes del lanzamiento.

---

### M-3 · GinaWidget.tsx: 647 líneas — candidato a refactor
**Archivo:** `components/gina/GinaWidget.tsx`  
**Fase:** 5 (Calidad de código)

Podría dividirse en:
- `GinaWidget` — shell, estado de apertura/cierre, sesión
- `GinaConversation` — historial de mensajes y flujo
- `GinaEditor` — lógica de edición de respuestas anteriores

---

### M-4 · Regex de teléfono muy permisivo en GinaInput
**Archivo:** `components/gina/GinaInput.tsx:22`  
**Fase:** 4 (Componentes críticos)

```ts
REGEX_TELEFONO = /^\+?[\d\s\-().]{6,20}$/
// Acepta: +++---()()()  ← inválido
```

**Fix:**
```ts
const REGEX_TELEFONO = /^(\+\d{1,3}[\s-]?)?\d{6,14}$/
```

---

### M-5 · `any[]` en ruta de clima de AEMET
**Archivo:** `app/api/clima/[ciudad]/route.ts:31`  
**Fase:** 5 (Calidad de código)

```ts
vientoAndRachaMax?: any[]  // Campo AEMET con múltiples formatos
```

**Fix:** Usar `unknown[]` con casting explícito en la función `extraerViento()` para mantener seguridad de tipos.

---

### M-6 · Catálogos de validación duplicados
**Archivos:** `app/api/lead/route.ts:28-95` y `lib/leads.ts`  
**Fase:** 5 (Calidad de código)

Los arrays `VALID_DOCUMENTACION`, `VALID_GARANTIAS`, etc. viven solo en `route.ts`. Si se añade un valor a Airtable, hay que buscarlo manualmente. Deberían extraerse a `lib/validation.ts` e importarse en ambos lugares.

---

### M-7 · `<div role="button">` en ComoFuncionaStepper
**Archivo:** `app/como-funciona/ComoFuncionaStepper.tsx:179-182`  
**Fase:** 3 (Rutas) · Accessibility Auditor

```tsx
<div role="button" tabIndex={0} aria-pressed={i === selected}
     onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') pick(i) }}>
```

Las 5 filas del stepper usan `div` con `role="button"` + `tabIndex` + `onKeyDown`. El elemento `<button type="button">` nativo maneja focus, Enter y Space sin código extra y es más robusto con tecnologías asistivas.

---

### M-8 · Magic numbers en typing delay de Gina
**Archivo:** `components/gina/GinaWidget.tsx:54`  
**Fase:** 5 (Calidad de código)

```ts
Math.min(1200, Math.max(500, texto.length * 8))
// ← 1200, 500 y 8 sin nombre ni comentario
```

**Fix:** Extraer a constantes nombradas: `TYPING_DELAY_MIN`, `TYPING_DELAY_MAX`, `CHARS_PER_MS`.

---

### M-9 · Sin verificación de Origin en endpoints sensibles
**Archivos:** `app/api/gina/route.ts`, `app/api/lead/route.ts`  
**Fase:** 6 (Seguridad)

Los endpoints no verifican el header `Origin`. Como usan JSON (no `application/x-www-form-urlencoded`), el riesgo CSRF es bajo, pero una verificación explícita es buena práctica antes de lanzamiento público.

---

### M-10 · `tsconfig.json`: target ES2017 — podría actualizarse
**Archivo:** `tsconfig.json`  
**Fase:** 1 (Config)

Next.js 14+ compila para runtimes modernos. `"target": "ES2022"` habilita top-level await y class fields nativos sin polyfills adicionales.

---

### M-11 · MuroLlavesPreview: imágenes placeholder + página inexistente
**Archivo:** `components/home/MuroLlavesPreview.tsx`  
**Fase:** 5 (Calidad de código)

Dos imágenes placehold.co visibles en home + TODO de crear la página `/muro-de-llaves` que aún no existe. El componente es visible en producción.

---

## ✅ Lo que está bien hecho

### Configuración y seguridad
1. `strict: true` en TypeScript — activado correctamente
2. `@/*` path alias configurado en `tsconfig.json`
3. `.env*` en `.gitignore` excepto `.env*.example`
4. Todas las variables `process.env` documentadas en `.env.local.example`
5. `AIRTABLE_API_KEY`, `GEMINI_API_KEY` y `AEMET_API_KEY` — solo en servidor, nunca expuestas al cliente
6. No hay `NEXT_PUBLIC_` con datos sensibles
7. `serverExternalPackages` configurado para `@react-pdf/renderer`
8. ESLint con `eslint-config-next/core-web-vitals` + TypeScript

### Accesibilidad
9. Skip link "Ir al contenido principal" en Header
10. `aria-current="page"` en links activos del Header
11. `aria-label` en todos los botones y navs
12. Escape key handler en el menú móvil (`Header.tsx:55-65`)
13. `lang="es"` en el tag `<html>`
14. `FAQAccordion` con `<details>`/`<summary>` nativo + `focus-visible`
15. `prefers-reduced-motion` respetado en todas las animaciones del hero

### SEO y metadata
16. `{ absolute: meta.title }` en `getNextMetadata()` — sin doble template
17. JSON-LD estructurado: LocalBusiness (home), Service (como-funciona), FAQ (faq)
18. Sitemap dinámico en `app/sitemap.ts` con todas las rutas
19. `robots.ts` configurado correctamente
20. OpenGraph y Twitter card por página en `lib/seo/metadata.ts`

### Semántica HTML
21. H1 único por página verificado en las 13 rutas
22. Orden lógico de headings (H1→H2→H3) en todas las rutas
23. Landmarks semánticos (`<section aria-label>`, `<nav>`, `<article>`)
24. `target="_blank"` siempre con `rel="noopener noreferrer"`

### Performance
25. `next/image` con `sizes` correctos en `/ciudades`
26. Google Fonts con `display: 'swap'` — minimiza CLS
27. Cache-Control correcto en `/api/marcador` (s-maxage=3600) y `/api/clima` (6h)

### Robustez de API y datos
28. Validación exhaustiva en `/api/lead` — catálogos de valores + regex de email
29. `conReintentos()` en guardado de leads — 3 intentos con delays exponenciales
30. `localStorage` con try-catch — el chat funciona en modo incógnito
31. Errores genéricos al cliente, detalles solo en server logs de Vercel
32. Event listeners con cleanup en `useEffect` (GinaWidget)
33. `personalizarTexto()` usa replace simple — sin riesgo de code injection
34. Límite de 2000 caracteres en payload de respuestas Gemini

---

## 🎯 Top 10 — priorizados por impacto

| # | Fix | Tiempo estimado |
|---|-----|----------------|
| **1** | Eliminar `/api/plan/preview` o protegerlo con auth | 15 min |
| **2** | Completar datos RGPD en `/politica-de-privacidad` (4 bloques) | 30 min + datos de Silvana |
| **3** | Fix voz marca: `"Llegás y abrís"` → `"Llegas y abres"` en Acordeon.tsx | 5 min |
| **4** | Fix 4 rioplatensismos en meta descriptions (`metadata.ts:30,43,95,108`) | 10 min |
| **5** | Configurar `CALCOM_URL` real + `WHATSAPP_DISPLAY` real en `lib/config/site.ts` | 10 min + datos de Silvana |
| **6** | Reemplazar imágenes placeholder: Silvana + 3 testimonios | 1 h + assets reales |
| **7** | `npm audit fix` — actualizar js-yaml y postcss | 20 min |
| **8** | Validar `recordId` en `/api/plan/[recordId]/pdf` | 10 min |
| **9** | Footer año dinámico + verificar `/public/og-default.jpg` | 10 min |
| **10** | Añadir script `type-check` en `package.json` + verificar `/agenda` en `FORCE_SOLID_PATHS` | 10 min |

**Total estimado Top 10:** ~2 h 20 min de código + tiempo de Silvana para proveer assets y datos

---

## Notas para el equipo

- Los items **1, 2 y 7** son bloqueantes para un lanzamiento con validez legal y seguridad mínima.
- Los items **3, 4 y 9** son cambios de una línea con impacto de marca y SEO inmediato.
- Los items **5 y 6** requieren acción de Silvana (proveer URL Cal.com, número WhatsApp real, fotos propias y de clientes).
- Los items **8 y 10** son mejoras defensivas de código, recomendadas antes del lanzamiento pero no bloqueantes.
- Los hallazgos 🟡 (M-1 a M-11) pueden agendarse para el sprint post-lanzamiento.

---

*Generado por el escuadrón técnico — Reality Checker · Code Reviewer · Accessibility Auditor · Performance Benchmarker · Security Engineer · Legal Compliance Checker · Brand Guardian · UI Designer*

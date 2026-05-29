# QA Fase 1 — Tu Lugar en Galicia
**Fecha:** 2026-05-29  
**Auditores:** Code Reviewer · Accessibility Auditor · Performance Benchmarker  
**Metodología:** análisis estático del código fuente. Lighthouse real requiere deploy en producción.

> Los problemas están ordenados por prioridad global. Un ítem marcado como **CRÍTICO** bloquea el lanzamiento.

---

## Estimación Lighthouse móvil (análisis estático)

| Métrica | Estimado | Objetivo PRD | Estado |
|---|---|---|---|
| Performance | 78–85 | ≥ 90 | ⚠ Riesgo |
| SEO | 88–92 | ≥ 95 | ✗ No cumple |
| Accesibilidad | 90–95 | ≥ 95 | ⚠ Límite |
| Best Practices | 78–85 | — | — |

---

## CRÍTICOS — bloquean producción

### [CRIT-1] Lead perdido sin aviso al usuario — formulario trata 503 como éxito
**Área:** Código / UX  
**Archivo:** `components/conocernos/FormularioDiagnostico.tsx` ~línea 296  
Cuando Airtable no está configurado, la API devuelve HTTP 503 pero el formulario muestra "¡Recibimos tu consulta!". El lead nunca se guarda; Silvana no recibe nada; el usuario cree que fue atendido. **Consecuencia de negocio directa.**  
**Fix:** mostrar mensaje diferenciado en 503 ("el sistema está en mantenimiento, escribinos por WhatsApp") o guardar el lead en un fallback (email).

### [CRIT-2] Contraste crítico — copyright del Footer (ratio 1.72:1)
**Área:** Accesibilidad · WCAG 1.4.3 AA  
**Archivo:** `components/layout/Footer.tsx` ~línea 53  
Texto de copyright usa `pizarra` (#4A4E54) sobre `granito` (#2A2B2E). Ratio: **1.72:1**. Mínimo requerido: 4.5:1. El texto es ilegible para personas con baja visión.  
**Fix:** usar `niebla` o `arena` para el texto de copyright en el footer.

### [CRIT-3] Contraste — texto blanco sobre `coral` en Button variante secundario (ratio 3.56:1)
**Área:** Accesibilidad · WCAG 1.4.3 AA  
**Archivo:** `components/ui/Button.tsx` variante `secundario`  
Blanco (#FFFFFF) sobre coral (#D4694F): ratio **3.56:1**. Falla para texto normal (mínimo 4.5:1). Afecta todos los CTAs de WhatsApp en hero, ciudades y home.  
**Fix:** oscurecer `coral` a ~#B8523A (ratio ~5.1:1) o usar texto oscuro sobre el coral actual.

### [CRIT-4] Sin skip link "Ir al contenido principal"
**Área:** Accesibilidad · WCAG 2.4.1 A  
**Archivo:** `components/layout/Header.tsx`  
Usuarios de teclado y lectores de pantalla deben tabular por toda la navegación en cada cambio de ruta. Crítico en Next.js App Router.  
**Fix:** agregar `<a href="#main-content" className="sr-only focus:not-sr-only">Ir al contenido principal</a>` al inicio del Header y `id="main-content"` al `<main>` del layout.

### [CRIT-5] Botón "Agenda" del Header no es alcanzable por teclado
**Área:** Accesibilidad · WCAG 2.1.1 A  
**Archivo:** `components/layout/Header.tsx` ~líneas 54 y 114  
El `<Link>` que contiene al `<Button>` tiene `tabIndex={-1}`, eliminándolo del orden de tabulación. El `<button>` interno no navega. El CTA más importante del sitio es inaccesible por teclado.  
**Fix:** quitar `tabIndex={-1}` del `<Link>` o reemplazar el patrón Link+Button por un único `<Link>` con estilos de botón.

### [CRIT-6] Doble `<main>` en `/conocernos` — HTML inválido
**Área:** Accesibilidad · WCAG 4.1.1 A  
**Archivo:** `app/conocernos/page.tsx` ~línea 9  
La página declara su propio `<main>` que se anida dentro del `<main>` del layout raíz. Dos `<main>` en el DOM confunden lectores de pantalla.  
**Fix:** eliminar el `<main>` de `conocernos/page.tsx`; el layout raíz ya provee el landmark correcto.

### [CRIT-7] Grupos de radio sin nombre accesible (fieldset/legend incompleto)
**Área:** Accesibilidad · WCAG 4.1.2 A  
**Archivo:** `components/conocernos/FormularioDiagnostico.tsx` componente `RadioGroup`  
El `role="radiogroup"` en el `<div>` interior no tiene `aria-labelledby` que apunte a la pregunta del grupo. NVDA en Firefox anuncia "radiogroup" sin contexto.  
**Fix:** agregar `aria-labelledby` al div con `role="radiogroup"` apuntando al `id` del elemento de la pregunta.

### [CRIT-8] Estado de carga del formulario sin anuncio a lectores de pantalla
**Área:** Accesibilidad · WCAG 4.1.3 AA  
**Archivo:** `components/conocernos/FormularioDiagnostico.tsx` ~líneas 828-856  
Al enviar, el formulario muestra spinner pero no tiene `aria-busy="true"` ni región `aria-live`. Usuarios ciegos no reciben confirmación de que el envío está en proceso.  
**Fix:** agregar `aria-busy={status === 'loading'}` al formulario y/o una región `aria-live="polite"` para el mensaje de estado.

### [CRIT-9] Open Graph completamente ausente — todas las páginas
**Área:** SEO · Performance  
**Archivo:** `lib/seo/og.ts` (implementado pero nunca importado)  
`buildOpenGraph` existe pero ninguna página la usa. Sin OG tags, los snippets en búsqueda móvil y compartidos en redes son genéricos. Impacto estimado: **-3 a -5 puntos SEO** (objetivo 95 en riesgo).  
**Fix:** importar y usar `buildOpenGraph` en `getNextMetadata` o en cada `page.tsx`.

### [CRIT-10] Título duplicado en home — layout + page exportan `getNextMetadata('home')`
**Área:** SEO · Performance  
**Archivos:** `app/layout.tsx` y `app/page.tsx`  
Next.js App Router mergea metadata del layout y la página; el resultado puede ser `<title>` duplicado en la home. Impacto estimado: **-2 a -4 puntos SEO**.  
**Fix:** eliminar la exportación de `metadata` de `app/layout.tsx` (dejar solo la metadata base sin título) o usar `template` en el layout.

---

## IMPORTANTES — deben corregirse antes del lanzamiento

### [IMP-1] `laton` falla WCAG AA para texto normal en todas las superficies claras
**Área:** Accesibilidad · WCAG 1.4.3 AA

| Combinación | Ratio | AA Normal | AA Grande |
|---|---|---|---|
| `laton` #9A7A2E sobre `blanco` | 4.08:1 | ✗ | ✓ |
| `laton` #9A7A2E sobre `niebla` | 3.62:1 | ✗ | ✓ |
| `laton` #9A7A2E sobre `arena` | 3.04:1 | ✗ | ✓ (por margen mínimo) |

`laton` solo es conforme para texto grande (≥ 24px regular o ≥ 18.67px bold). Cualquier uso como etiqueta pequeña, enlace de cuerpo o badge viola WCAG AA.  
**Archivos afectados:** `CiudadLayout.tsx`, `faq/page.tsx`, `ComoFuncionaResumen.tsx`, `CiudadesCards.tsx`, `como-funciona/page.tsx`  
**Fix:** restringir `laton` a headings grandes (H1/H2 con tokens `--text-2xl` o mayor), o ajustar el token a ~#7A5F1F (ratio ~6.5:1).

### [IMP-2] Contraste — mensajes de error en formulario (`coral` sobre blanco, ratio 3.56:1)
**Área:** Accesibilidad · WCAG 1.4.3 AA  
**Archivo:** `components/conocernos/FormularioDiagnostico.tsx` clase `errorClass`  
Los mensajes de error son críticos para accesibilidad cognitiva y fallan el ratio mínimo.  
**Fix:** usar `pizarra` o `granito` sobre fondo claro, o rojo más oscuro (#B91C1C, ratio ~7:1).

### [IMP-3] FAQAccordion con HTML inválido — `<dt>/<dd>` dentro de `<details>/<summary>`
**Área:** Accesibilidad · WCAG 4.1.1 A  
**Archivo:** `components/ciudades/FAQAccordion.tsx`  
`<dl>` no puede contener `<details>` como hijo directo, y `<dt>` no puede ser hijo de `<summary>`. Estructura semántica rota que los lectores de pantalla interpretan inconsistentemente.  
**Fix:** usar `<ul>/<li>` con `<details>/<summary>` dentro de cada `<li>`, eliminando `<dl>/<dt>/<dd>`.

### [IMP-4] Link roto: `/muro-de-llaves` no existe como ruta ni en el sitemap
**Área:** SEO · Performance  
**Archivo:** `components/home/MuroLlavesPreview.tsx`  
El enlace "Ver todas las entregas" genera un 404 activo desde la home. Google penaliza links rotos.  
**Fix:** desactivar el enlace (`<span>` en lugar de `<Link>`) o crear una ruta `/muro-de-llaves` en Fase 1.

### [IMP-5] `ElMarcador` hace fetch en cliente — waterfall de +200–500ms en móvil
**Área:** Performance  
**Archivo:** `components/home/ElMarcador.tsx`  
`useEffect` + `fetch` del cliente añade latencia sobre el TTFB. Impacto estimado: **-5 a -8 puntos Performance**.  
**Fix:** convertir a Server Component con `fetch('/api/marcador', { next: { revalidate: 300 } })` directo, eliminando el bundle JS y el waterfall.

### [IMP-6] Animación `animate-fade-in-up` en Hero puede desplazar el LCP
**Área:** Performance  
**Archivo:** `components/home/Hero.tsx` ~línea 23  
El H1 con `animate-fade-in-up` retrasa el render del LCP hasta que la animación termina. En móvil lento puede superar 2.5s. Además, no respeta `prefers-reduced-motion`.  
**Fix:** (a) eliminar la animación del H1 o reducir `duration` a ≤ 100ms; (b) agregar `@media (prefers-reduced-motion: reduce) { .animate-fade-in-up { animation: none; } }` en `globals.css`.

### [IMP-7] `Header` completo como Client Component — bundle innecesario en cada página
**Área:** Performance  
**Archivo:** `components/layout/Header.tsx`  
Toda la navegación (logo, links) se incluye en el bundle de cliente solo por el estado del menú hamburguesa y `usePathname`.  
**Fix:** extraer un componente mínimo `MobileMenuToggle` como Client Component; el Header principal pasa a Server Component.

### [IMP-8] Tabla de precios sin caption ni aria-label
**Área:** Accesibilidad · WCAG 1.3.1 A  
**Archivo:** `components/ciudades/CiudadLayout.tsx` ~líneas 121–152  
La `<table>` no tiene `<caption>` ni `aria-labelledby` apuntando al H2 de sección.  
**Fix:** agregar `<caption className="sr-only">Precios orientativos de alquiler en {nombre}</caption>`.

### [IMP-9] Validación de array `garantias` no filtra valores permitidos en el servidor
**Área:** Código / Seguridad  
**Archivo:** `app/api/lead/route.ts` ~línea 160  
`body.garantias` se acepta sin verificar que cada elemento sea un valor del enum. Un atacante puede enviar strings arbitrarios a Airtable.  
**Fix:** `body.garantias.filter((g) => VALID_GARANTIAS.includes(g))` con array `as const`.

### [IMP-10] Sin validación de longitud en campos de texto libre
**Área:** Código / Seguridad  
**Archivo:** `app/api/lead/route.ts`  
Los campos `nombreCompleto`, `personas`, `detalleMascotas`, etc. solo se validan como "no vacíos". Strings de megabytes pueden sobrecargar la API de Airtable.  
**Fix:** agregar `value.length > 1000` → HTTP 400 en el loop de validación del servidor.

### [IMP-11] `SITE_URL` definido en dos archivos — puede desincronizarse
**Área:** Código  
**Archivos:** `lib/seo/metadata.ts` línea 3 y `lib/config/site.ts` línea 18  
**Fix:** `metadata.ts` debe importar `SITE_URL` desde `lib/config/site.ts`.

### [IMP-12] Fechas no validadas en el servidor
**Área:** Código  
**Archivo:** `app/api/lead/route.ts`  
`fechaLlegada` e `inicioContrato` se validan solo como "string no vacío". El servidor no verifica que sean fechas válidas.  
**Fix:** agregar `isNaN(Date.parse(value))` como condición de error.

### [IMP-13] Checkboxes de consentimiento sin atributo `required` ni `aria-required`
**Área:** Accesibilidad · WCAG 1.3.1 A  
**Archivo:** `components/conocernos/FormularioDiagnostico.tsx` ~líneas 770–821  
Los inputs de `comprendeServicio` y `consentimientoRGPD` no tienen `required` o `aria-required="true"`. Los lectores de pantalla no anuncian su obligatoriedad al enfocarlos.  
**Fix:** agregar `required aria-required="true"` a ambos checkboxes.

### [IMP-14] Twitter Card metadata ausente
**Área:** SEO  
**Archivo:** `lib/seo/metadata.ts`  
Sin `twitter:card`, los compartidos en X/Twitter usan preview genérico sin imagen.  
**Fix:** agregar `twitter: { card: 'summary_large_image', ... }` en `getNextMetadata`.

### [IMP-15] Foco no retorna al botón hamburguesa al cerrar el menú; sin soporte para tecla Escape
**Área:** Accesibilidad · WCAG 2.1.2 A  
**Archivo:** `components/layout/Header.tsx`  
El menú móvil no implementa `Escape` para cerrarse ni gestión del foco al cierre.  
**Fix:** agregar `useEffect` que escuche `keydown` `Escape` para cerrar el menú y devolver el foco al botón hamburguesa con `.focus()`.

---

## MENORES — mejoras recomendadas (no bloquean)

- **[MIN-1]** `console.log('Lead guardado OK')` en producción — reemplazar con log con timestamp o eliminar. (`lib/leads.ts` ~línea 129)
- **[MIN-2]** `WHATSAPP_DISPLAY` desincronizado de `WHATSAPP_NUMBER` — derivar uno del otro en `lib/config/site.ts`.
- **[MIN-3]** Google Sheets API key en query string de URL — verificar que la key esté restringida en Google Cloud Console al dominio y a la Sheets API únicamente. (`lib/marcador.ts` ~línea 61)
- **[MIN-4]** `Record<string, any>` en route de leads — cambiar a `Record<string, unknown>`. (`app/api/lead/route.ts` ~línea 52)
- **[MIN-5]** `#1A5247` hardcodeado en gradiente del Hero — usar `var(--color-atlantico)`. (`components/home/Hero.tsx`)
- **[MIN-6]** `#FDF3F1` hardcodeado en banner de error del formulario — agregar token o usar `bg-[var(--color-coral)]/10`. (`components/conocernos/FormularioDiagnostico.tsx`)
- **[MIN-7]** Variables OAuth en `.env.local.example` (líneas 25–28) no tienen código que las consuma — marcarlas como "no usadas aún / Fase futura".
- **[MIN-8]** `dangerouslySetInnerHTML` para JSON-LD — seguro con datos estáticos, pero agregar comentario advirtiendo que si el contenido se vuelve dinámico (CMS) debe sanitizarse antes del `JSON.stringify`. (`faq/page.tsx`, `como-funciona/page.tsx`, `CiudadLayout.tsx`)
- **[MIN-9]** Testimonios: `<blockquote>` sin atribución semántica — el autor está fuera del blockquote en el DOM. (`components/home/Testimonios.tsx` ~línea 74)
- **[MIN-10]** `alt` de avatares de testimonios dice "Foto de perfil de X" pero la imagen es un placeholder. Corregir cuando se reemplacen con fotos reales.
- **[MIN-11]** Tooltip del WhatsApp flotante no aparece al recibir foco por teclado (solo en hover). Usuarios de teclado con baja visión no lo ven. (`components/shared/WhatsAppFlotante.tsx`)
- **[MIN-12]** `FeedInstagram` tiene `aria-label` en `<ul>` pero el contenido describe algo que no existe aún. Evaluar si el texto visible es apropiado para producción.
- **[MIN-13]** `CalEmbed`: el iframe de Cal.com debe tener `title="Calendario para agendar videollamada"` — verificar que el componente lo aplique. (`components/shared/CalEmbed.tsx`)
- **[MIN-14]** Fuentes con `display: swap` — monitorear CLS en producción si los character widths de fallback difieren significativamente.
- **[MIN-15]** `dangerouslyAllowSVG: true` en `next.config.ts` — desactivar cuando se reemplacen los placeholders de `placehold.co`.
- **[MIN-16]** Sin HSTS ni CSP en `vercel.json` — Lighthouse Best Practices los valora; considerar para Fase 2.
- **[MIN-17]** Jerarquía semántica invertida en secciones de home: el título real (`<p>`) está visualmente más grande que el `<h2>` de etiqueta. Intercambiar para que el `<h2>` sea el título principal. Afecta `ElMarcador`, `Testimonios`, `CiudadesCards`, `ComoFuncionaResumen`.

---

## Ratios de contraste completos

| Combinación | Ratio | AA Normal (4.5:1) | AA Grande (3:1) |
|---|---|---|---|
| `pizarra` sobre `granito` (footer) | 1.72:1 | ✗ CRÍTICO | ✗ |
| `coral` sobre `blanco` (Button secundario) | 3.56:1 | ✗ | ✓ |
| `blanco` sobre `coral` (Button secundario) | 3.56:1 | ✗ | ✓ |
| `laton` sobre `arena` | 3.04:1 | ✗ | ✓ (justo) |
| `laton` sobre `niebla` | 3.62:1 | ✗ | ✓ |
| `laton` sobre `blanco` | 4.08:1 | ✗ | ✓ |
| `coral` sobre `niebla` (errores form.) | 3.16:1 | ✗ | ✓ |
| `pizarra` sobre `arena` | 6.11:1 | ✓ | ✓ |
| `pizarra` sobre `niebla` | 7.27:1 | ✓ | ✓ |
| `mar` sobre `niebla` | 6.24:1 | ✓ | ✓ |
| `mar` sobre `blanco` | 7.03:1 | ✓ | ✓ |
| `blanco` sobre `atlantico` | 8.88:1 | ✓ | ✓ |
| `arena` sobre `granito` | 10.51:1 | ✓ | ✓ |
| `niebla` sobre `granito` | 12.51:1 | ✓ | ✓ |

---

## Bien implementado (no tocar)

- **Separación server/client de claves:** ningún `NEXT_PUBLIC_*` para claves de API. Completamente server-side.
- **Validación server-side independiente:** `/api/lead` valida todos los enums contra listas `as const`. No depende del cliente.
- **Patrón de fallback del Marcador:** siempre devuelve HTTP 200 con datos válidos. Header `X-Data-Source: fallback` para diagnóstico.
- **Tipo `LeadData` como fuente de verdad:** definido una vez, importado en route y formulario. Cambios rompen el compilador en todos los consumidores.
- **RGPD correcto:** consentimiento explícito, enlace a política de privacidad, validado en cliente y servidor con mensaje específico.
- **`getNextMetadata` con tipado estricto:** `keyof typeof PAGE_METADATA` garantiza en compilación que solo existen claves válidas.
- **Sitemap completo:** 11 rutas con `/conocernos` (no `/diagnostico`), prioridades y `changeFrequency` por tipo de página.
- **`robots.ts`:** permite todo el sitio público, bloquea `/api/` y `/_next/`.
- **Schemas JSON-LD:** `LocalBusiness`, `Service` y `FAQPage` correctamente formados con cross-referencia via `@id`.
- **`aria-current="page"`** en navegación, `aria-expanded` + `aria-controls` en hamburguesa, `aria-label` en ambos `<nav>`.
- **`FieldWrapper` del formulario** con `htmlFor`/`id` matching y `aria-describedby` condicional. Patrón correcto.
- **Conventional Commits** respetados en todo el historial del repo.
- **Cache headers del Marcador:** `s-maxage=3600, stale-while-revalidate=86400` sincronizado con `next: { revalidate: 3600 }`.
- **5 security headers** en `vercel.json` cubren los vectores más comunes.

---

## Lista de correcciones para cerrar la Fase 1

Ordenadas por impacto. Las primeras 10 son bloqueantes.

| # | Ítem | Archivo principal |
|---|---|---|
| 1 | Tratar 503 como error (no éxito) en formulario | `FormularioDiagnostico.tsx` |
| 2 | Contraste footer copyright (pizarra→niebla) | `Footer.tsx` |
| 3 | Contraste Button secundario (blanco sobre coral) | `Button.tsx` / design-system |
| 4 | Agregar skip link al Header | `Header.tsx` |
| 5 | Corregir botón Agenda inaccesible por teclado | `Header.tsx` |
| 6 | Eliminar `<main>` duplicado en `/conocernos` | `app/conocernos/page.tsx` |
| 7 | Corregir `role="radiogroup"` sin nombre accesible | `FormularioDiagnostico.tsx` |
| 8 | Agregar `aria-busy` y `aria-live` al estado de carga | `FormularioDiagnostico.tsx` |
| 9 | Implementar Open Graph en todas las páginas | `lib/seo/og.ts` + `metadata.ts` |
| 10 | Eliminar metadata duplicada en home | `app/layout.tsx` o `app/page.tsx` |
| 11 | Corregir `laton` solo a texto grande (≥24px) | Múltiples componentes |
| 12 | Corregir contraste mensajes de error (coral→rojo oscuro) | `FormularioDiagnostico.tsx` |
| 13 | Corregir HTML inválido en FAQAccordion | `FAQAccordion.tsx` |
| 14 | Corregir o desactivar link a `/muro-de-llaves` | `MuroLlavesPreview.tsx` |
| 15 | Convertir `ElMarcador` a Server Component | `ElMarcador.tsx` |
| 16 | Agregar `prefers-reduced-motion` a animaciones | `globals.css` |
| 17 | Validar longitud y formato fechas en API | `app/api/lead/route.ts` |
| 18 | Filtrar valores permitidos en array `garantias` | `app/api/lead/route.ts` |
| 19 | Agregar Twitter Card metadata | `lib/seo/metadata.ts` |
| 20 | Soporte tecla Escape en menú móvil | `Header.tsx` |

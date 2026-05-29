# Certificación Fase 1 — Tu Lugar en Galicia

**Fecha:** 2026-05-29
**Agente:** Reality Checker (TestingRealityChecker)
**Metodología:** Análisis estático del código fuente + ejecución de `npm run build`
**Fuentes verificadas:**
- `docs/PRD-fase-1.md` §6 (criterios de aceptación)
- `docs/qa-fase-1.md` (informe QA previo)
- `docs/pendientes-config.md` (pendientes de configuración conocidos)
- Código fuente relevante (listado en cada criterio)

---

## 1. Tabla de criterios de aceptación

| # | Criterio (PRD §6) | Estado | Tipo de brecha |
|---|---|---|---|
| C1 | Las 11 páginas existen, responden y se ven bien en móvil y escritorio | ⚠ Cumplido con salvedad | Bloquea LANZAMIENTO (no construcción) |
| C2 | El formulario de diagnóstico guarda el lead y muestra confirmación | ✗ No cumplido | Bloquea CIERRE DE FASE |
| C3 | El Marcador muestra números de la Google Sheet sin tocar código | ⚠ Cumplido con salvedad | Bloquea LANZAMIENTO (no construcción) |
| C4 | WhatsApp flotante visible en todas las páginas con mensaje predefinido | ⚠ Cumplido con salvedad | Bloquea LANZAMIENTO (no construcción) |
| C5 | Agenda de Cal.com funciona desde `/agenda` y desde los CTAs | ⚠ Cumplido con salvedad | Bloquea LANZAMIENTO (no construcción) |
| C6 | Lighthouse: SEO ≥ 95, Accesibilidad ≥ 95, Performance ≥ 90 en móvil | ✗ No cumplido | Bloquea CIERRE DE FASE |
| C7 | `sitemap.xml` y `robots.txt` accesibles; schema válido | ⚠ Cumplido con salvedad | Ver detalle §2.7 |
| C8 | Consentimiento RGPD en formulario + página de política de privacidad | ✗ No cumplido | Bloquea CIERRE DE FASE |
| C9 | `Code Reviewer` aprobó los PR y `Reality Checker` certificó la fase | ✗ No cumplido | Bloquea CIERRE DE FASE (este informe es el paso de certificación) |

---

## 2. Detalle por criterio

### C1 — Las 11 páginas existen, responden y se ven bien en móvil y escritorio

**Estado: ⚠ Cumplido con salvedad**

Las 11 rutas existen como archivos `page.tsx` verificados por inspección directa y confirmados por la salida de `npm run build` (18 rutas estáticas generadas sin errores):

- `app/page.tsx` — Home `/`
- `app/ciudades/vigo/page.tsx`
- `app/ciudades/a-coruna/page.tsx`
- `app/ciudades/santiago-de-compostela/page.tsx`
- `app/ciudades/pontevedra/page.tsx`
- `app/ciudades/lugo/page.tsx`
- `app/como-funciona/page.tsx`
- `app/sobre-silvana/page.tsx`
- `app/faq/page.tsx`
- `app/conocernos/page.tsx`
- `app/agenda/page.tsx`

**Nota sobre nomenclatura:** el PRD original nombra la ruta `/diagnostico`, pero el equipo renombró la página a `/conocernos` (confirmado por commit `refactor: rename Diagnóstico a Vamos a conocernos`). El sitemap también usa `/conocernos`. Esta decisión es válida y consistente. El criterio se considera cumplido con esta ruta.

**Salvedad — verificación visual en móvil:** el análisis es estático; no se ejecutaron Playwright ni capturas reales. El QA previo estimó riesgos de rendimiento y accesibilidad que afectan la experiencia visual (ver C6). La construcción existe y compila; la apariencia en dispositivos reales requiere deploy.

**Archivos que confirman el cumplimiento:**
`app/*/page.tsx` (11 archivos), salida de `npm run build`

---

### C2 — El formulario de diagnóstico guarda el lead y muestra confirmación

**Estado: ✗ No cumplido**

El formulario existe en `components/conocernos/FormularioDiagnostico.tsx` con los 19 campos de datos más los 2 checkboxes de consentimiento (total conforme al PRD). El flujo de envío realiza `POST /api/lead` y `app/api/lead/route.ts` existe con validación en servidor.

**Defecto bloqueante — CRIT-1 del QA, confirmado sin corrección:**

En la línea 298 del formulario el código lee:

```
if (res.ok || res.status === 503) {
  setStatus('success')
}
```

Cuando Airtable no está configurado (ausencia de `AIRTABLE_API_KEY` en entorno), la API route devuelve HTTP 503 — pero el formulario lo trata como éxito y muestra "¡Recibimos tu consulta!". El lead no se guarda en ningún lado. Silvana no recibe nada. El usuario cree haber sido atendido.

Este defecto no fue corregido en el último commit (`style: refine visual design across the site`). El código evidencia la condición `res.status === 503` tratada como éxito aún presente en el archivo.

**Consecuencia:** el criterio "guarda el lead" falla de forma demostrable. Aunque `aria-busy` y `aria-live` fueron implementados (CRIT-8 resuelto), el problema de negocio central del formulario permanece abierto.

**Archivos relevantes:**
`components/conocernos/FormularioDiagnostico.tsx` línea 298, `app/api/lead/route.ts`

---

### C3 — El Marcador muestra números de la Google Sheet sin tocar código

**Estado: ⚠ Cumplido con salvedad**

`app/api/marcador/route.ts` existe con el patrón de fallback correcto (siempre devuelve HTTP 200, header `X-Data-Source: fallback` para diagnóstico, caché `s-maxage=3600`). `components/home/ElMarcador.tsx` consume la API vía `useEffect` + `fetch`.

**Salvedad de configuración (documentada en `pendientes-config.md` ítem 6):** la Google Sheet real no está creada ni conectada. La variable `SHEET_MARCADOR_ID` no tiene valor en Vercel. El Marcador hoy siempre muestra datos de fallback (ceros). Silvana no puede actualizar los números aún.

**Nota técnica (IMP-5 del QA, no resuelto):** `ElMarcador` es Client Component con `useEffect`. Esto añade latencia de 200–500ms en móvil. No bloquea el criterio funcional pero impacta C6 (Performance).

**Lo que sí está construido:** la arquitectura completa para que el Marcador lea de la Sheet sin tocar código existe y funciona una vez que se conecte la Sheet real.

**Archivos relevantes:**
`app/api/marcador/route.ts`, `components/home/ElMarcador.tsx`, `lib/marcador.ts`

---

### C4 — WhatsApp flotante visible en todas las páginas con mensaje predefinido

**Estado: ⚠ Cumplido con salvedad**

`components/shared/WhatsAppFlotante.tsx` existe, genera URL `wa.me/{WHATSAPP_NUMBER}?text={mensaje}` con mensaje predefinido, y está incluido en el layout raíz (`app/layout.tsx` línea 44: `<WhatsAppFlotante />`). Por estar en el layout, aparece en todas las páginas.

**Salvedad de configuración (documentada en `pendientes-config.md` ítems 1 y 4):** el número `WHATSAPP_NUMBER` en `lib/config/site.ts` es un placeholder. El enlace funciona técnicamente pero apunta a un número que no es el real de Silvana hasta que se actualice la constante.

**Archivos relevantes:**
`components/shared/WhatsAppFlotante.tsx`, `app/layout.tsx`, `lib/config/site.ts`

---

### C5 — Agenda de Cal.com funciona desde `/agenda` y desde los CTAs

**Estado: ⚠ Cumplido con salvedad**

`app/agenda/page.tsx` usa el componente `CalEmbed` (`components/shared/CalEmbed.tsx`). La página tiene fallback textual con enlace a WhatsApp si el calendario no carga. El Header incluye enlace "Agenda" accesible en desktop y mobile.

**Salvedad de configuración (documentada en `pendientes-config.md` ítem 2):** `CALCOM_LINK` en `lib/config/site.ts` es un placeholder sin cuenta real de Cal.com conectada. El iframe de Cal.com no mostrará un calendario real hasta que se cargue el slug correcto.

**Nota sobre CRIT-5 del QA (tabIndex=-1 en botón Agenda):** el código actual en `Header.tsx` muestra que el botón "Agenda" es ahora un `<Link>` directo con estilos de botón (líneas 60–65 y 121–127), sin `tabIndex={-1}`. El CRIT-5 fue resuelto en el último commit de refactoring visual.

**Archivos relevantes:**
`app/agenda/page.tsx`, `components/shared/CalEmbed.tsx`, `components/layout/Header.tsx`

---

### C6 — Lighthouse: SEO ≥ 95, Accesibilidad ≥ 95, Performance ≥ 90 en móvil

**Estado: ✗ No cumplido**

El QA estimó (análisis estático, sin deploy real): Performance 78–85, SEO 88–92, Accesibilidad 90–95. Ninguno alcanza los objetivos del PRD.

**Problemas de construcción verificados que deprimen las métricas:**

Accesibilidad:
- CRIT-7: `role="radiogroup"` sin `aria-labelledby` en `FormularioDiagnostico.tsx` — impacta score de accesibilidad.
- IMP-1: token `laton` usado en texto normal con ratio 3.04–4.08:1 (falla WCAG AA) en múltiples componentes.
- IMP-2: mensajes de error en coral sobre blanco (ratio 3.16–3.56:1).
- IMP-3: HTML inválido en `FAQAccordion.tsx` (`<dt>` dentro de `<summary>`).
- IMP-13: checkboxes de consentimiento sin `required` ni `aria-required`.
- IMP-15: menú móvil sin soporte para tecla Escape.

SEO:
- CRIT-10: `app/layout.tsx` exporta `metadata` con template de título; `app/page.tsx` también exporta `getNextMetadata('home')`. El título de la home puede estar duplicado en el DOM. **Verificado en código actual:** el layout define `title.template` y `title.default`, y la página home exporta su propio título completo. Next.js fusionará ambos, resultando en el título de la página sobreescribiendo el del layout (comportamiento correcto de App Router con template). El riesgo de duplicado es menor de lo que indicó el QA inicial; sin embargo, la configuración podría simplificarse.
- IMP-4: enlace a `/muro-de-llaves` desde `MuroLlavesPreview.tsx` genera 404 activo.
- IMP-14: Twitter Card metadata ausente en `lib/seo/metadata.ts`.

Performance:
- IMP-5: `ElMarcador` como Client Component con `useEffect` (waterfall de 200–500ms).
- IMP-6: animación `animate-fade-in-up` en H1 del Hero sin `prefers-reduced-motion`.
- IMP-7: Header completo como Client Component.

**Importante:** Lighthouse real requiere deploy en producción. Las estimaciones son estáticas. Sin embargo, los problemas de construcción identificados son reales y medibles. No hay base para afirmar que las métricas se alcanzarán sin corregirlos.

**Correcciones verificadas que SÍ se implementaron (comparando QA con código actual):**
- CRIT-4 (skip link): resuelto — `<a href="#main-content">` presente en `Header.tsx` líneas 26–31.
- CRIT-5 (botón Agenda inaccesible): resuelto — reemplazado por `<Link>` directo.
- CRIT-6 (doble `<main>` en `/conocernos`): resuelto — `conocernos/page.tsx` usa `<div>`, no `<main>`.
- CRIT-8 (`aria-busy` y `aria-live`): resuelto — implementado en `FormularioDiagnostico.tsx` líneas 343–349.
- CRIT-9 (Open Graph ausente): resuelto — `lib/seo/metadata.ts` importa `buildOpenGraph` y lo usa en `getNextMetadata` línea 168.
- CRIT-2 (contraste footer copyright): resuelto — `Footer.tsx` línea 53 usa `text-[var(--color-arena)]` sobre `granito`.
- CRIT-3 (contraste Button secundario): resuelto — `Button.tsx` línea 17 usa `bg-[#B8523A]` (~ratio 5.1:1).

**Archivos relevantes:**
`components/conocernos/FormularioDiagnostico.tsx`, `components/ciudades/FAQAccordion.tsx`, `components/home/ElMarcador.tsx`, `components/home/Hero.tsx`, `components/home/MuroLlavesPreview.tsx`, `lib/seo/metadata.ts`

---

### C7 — `sitemap.xml` y `robots.txt` accesibles; schema válido

**Estado: ⚠ Cumplido con salvedad**

`app/sitemap.ts` existe con las 11 rutas correctas (incluyendo `/conocernos`, no `/diagnostico`), prioridades y `changeFrequency` adecuados. `app/robots.ts` existe, permite el sitio público y bloquea `/api/` y `/_next/`. Ambos archivos generan las rutas `/sitemap.xml` y `/robots.txt` confirmadas por `npm run build`.

**Schemas JSON-LD verificados:**
- `FAQPage`: inyectado en `app/faq/page.tsx` y en `components/ciudades/CiudadLayout.tsx` (páginas de ciudad).
- `Service`: inyectado en `app/como-funciona/page.tsx`.
- `LocalBusiness`: definido en `lib/seo/schemas.ts` pero **NO inyectado en ninguna página** (`app/page.tsx` no importa ni usa `localBusinessSchema`).

**Brecha de schema:** el PRD §4 requiere `LocalBusiness` + `FAQPage` + `Service`. `FAQPage` y `Service` están implementados. `LocalBusiness` existe en `lib/seo/schemas.ts` pero no se inyecta en ninguna página del sitio. Esto no bloquea el criterio de forma total (dos de tres schemas están presentes), pero es una brecha real respecto al PRD.

**Salvedad de configuración:** el `SITE_URL` del sitemap está hardcodeado como `https://tulugarengalicia.com` y el dominio real aún no está apuntando al sitio.

**Archivos relevantes:**
`app/sitemap.ts`, `app/robots.ts`, `lib/seo/schemas.ts`, `app/page.tsx`, `app/como-funciona/page.tsx`, `app/faq/page.tsx`

---

### C8 — Consentimiento RGPD presente en el formulario + página de política de privacidad

**Estado: ✗ No cumplido**

**Lo que sí está implementado:**
El formulario `components/conocernos/FormularioDiagnostico.tsx` incluye el checkbox de consentimiento RGPD con enlace a `/politica-de-privacidad` (líneas 806–829), validado en cliente y servidor. El pie del formulario y el Footer también enlazan a `/politica-de-privacidad`.

**Brecha bloqueante:**
`app/politica-de-privacidad/page.tsx` no existe. Verificado directamente: `grep -r "politica-de-privacidad" app/` no devuelve ningún archivo `page.tsx`. El enlace desde el formulario genera un 404. El consentimiento enlaza a una página inexistente.

Esta brecha está documentada en `pendientes-config.md` ítem 7, pero su naturaleza la clasifica distinto: la política de privacidad no es solo configuración — es un requisito legal (RGPD) y un requisito explícito del PRD. No tenerla creada significa que el formulario no puede operar legalmente en producción. Se clasifica como "bloquea cierre de fase" porque sin la página la parte "página de política de privacidad" del criterio falla por completo.

**Archivos relevantes:**
`components/conocernos/FormularioDiagnostico.tsx` líneas 818–827, `components/layout/Footer.tsx` líneas 42–48, ausencia de `app/politica-de-privacidad/page.tsx`

---

### C9 — `Code Reviewer` aprobó los PR y `Reality Checker` certificó la fase

**Estado: ✗ No cumplido (en curso)**

El proceso de revisión está documentado en `docs/qa-fase-1.md`. Este informe es la certificación del Reality Checker. El criterio no se puede marcar como cumplido hasta que:
1. Se corrijan los ítems que bloquean cierre de fase (ver §3).
2. El Reality Checker emita certificación positiva.

El presente informe documenta el estado actual; no otorga certificación positiva.

---

## 3. Ítems que bloquean cierre de fase

Estos son problemas de construcción o funcionalidad que deben resolverse antes de cerrar la Fase 1, independientemente de la configuración de producción.

| # | Problema | Archivo | Referencia QA |
|---|---|---|---|
| BF-1 | Formulario trata HTTP 503 como éxito — el lead no se guarda pero el usuario ve confirmación | `components/conocernos/FormularioDiagnostico.tsx` línea 298 | CRIT-1 |
| BF-2 | Métricas Lighthouse estimadas no alcanzan objetivos del PRD: SEO ~88-92 (objetivo 95), Performance ~78-85 (objetivo 90), Accesibilidad ~90-95 (objetivo 95) | Múltiples (ver C6) | Resumen QA |
| BF-3 | `role="radiogroup"` sin `aria-labelledby` en grupos de radio del formulario | `components/conocernos/FormularioDiagnostico.tsx` componente `RadioGroup` | CRIT-7 |
| BF-4 | Página `/politica-de-privacidad` no existe — enlace desde formulario genera 404 | Ausencia de `app/politica-de-privacidad/page.tsx` | `pendientes-config.md` ítem 7 |
| BF-5 | Schema `LocalBusiness` definido pero no inyectado en ninguna página | `lib/seo/schemas.ts` (implementado), `app/page.tsx` (no importa) | PRD §4 |
| BF-6 | Token `laton` usado en texto normal (ratio 3.04–4.08:1) en múltiples componentes — falla WCAG AA | `CiudadLayout.tsx`, `faq/page.tsx`, `ComoFuncionaResumen.tsx`, `CiudadesCards.tsx`, `como-funciona/page.tsx` | IMP-1 |
| BF-7 | Mensajes de error del formulario en color coral sobre fondo claro (ratio ~3.56:1) — falla WCAG AA | `components/conocernos/FormularioDiagnostico.tsx` | IMP-2 |
| BF-8 | HTML inválido en `FAQAccordion`: `<dt>/<dd>` dentro de `<details>/<summary>` | `components/ciudades/FAQAccordion.tsx` | IMP-3 |
| BF-9 | Enlace roto a `/muro-de-llaves` activo desde la home | `components/home/MuroLlavesPreview.tsx` | IMP-4 |
| BF-10 | Checkboxes de consentimiento sin `required` ni `aria-required` | `components/conocernos/FormularioDiagnostico.tsx` líneas 786–815 | IMP-13 |
| BF-11 | Twitter Card metadata ausente — impacta SEO estimado | `lib/seo/metadata.ts` | IMP-14 |

**Nota sobre BF-2:** los problemas BF-3, BF-6, BF-7, BF-8, BF-10 son los principales causantes del score de accesibilidad bajo. BF-9 y BF-11 impactan el SEO. Resolver estos problemas específicos es el camino para alcanzar las métricas objetivo.

---

## 4. Ítems que bloquean lanzamiento (pendientes de configuración)

Estos ítems no son defectos de construcción — el código está correctamente preparado para recibirlos. Son configuraciones del mundo real que deben completarse antes de poner el sitio en producción.

| # | Pendiente | Dónde configurar | Referencia |
|---|---|---|---|
| PL-1 | Número de WhatsApp real de Silvana | `lib/config/site.ts` → `WHATSAPP_NUMBER` | `pendientes-config.md` ítem 1 |
| PL-2 | Slug real de Cal.com con videollamada configurada | `lib/config/site.ts` → `CALCOM_LINK` | `pendientes-config.md` ítem 2 |
| PL-3 | Dominio propio apuntando al deploy de Vercel | Vercel + Cloudflare DNS | `pendientes-config.md` ítem 3 |
| PL-4 | Variables de entorno cargadas en Vercel (`AIRTABLE_API_KEY`, `SHEET_MARCADOR_ID`) | Panel Vercel → Settings → Environment Variables | `pendientes-config.md` ítem 5 |
| PL-5 | Google Sheet de El Marcador creada y conectada | Google Sheets + Google Cloud Console | `pendientes-config.md` ítem 6 |
| PL-6 | Logo renombrado sin espacios, formato PNG con transparencia | `public/` → renombrar `Logo TLG.jpeg` | `pendientes-config.md` ítem 8 |
| PL-7 | WhatsApp Business configurado con mensaje de bienvenida | App WhatsApp Business | `pendientes-config.md` ítem 4 |

---

## 5. Conclusión

### ¿La Fase 1 está cerrada a nivel construcción?

**No. La Fase 1 no está cerrada.**

Se han resuelto 7 de los 10 críticos del QA (CRIT-2, CRIT-3, CRIT-4, CRIT-5, CRIT-6, CRIT-8, CRIT-9). El proyecto compila sin errores. La estructura completa existe. Eso es trabajo real y significativo.

Sin embargo, quedan 3 problemas que bloquean el cierre:

1. **BF-1 (CRIT-1):** el formulario trata el 503 como éxito. Mientras no esté corregido, el criterio central de la fase — "el formulario guarda el lead" — falla. Este es el defecto de mayor impacto en el negocio.

2. **BF-4:** la página de política de privacidad no existe. El criterio C8 falla en su segunda mitad. Esta es también una obligación legal bajo RGPD.

3. **BF-2 + ítems de accesibilidad/SEO pendientes (BF-3, BF-6, BF-7, BF-8, BF-9, BF-10, BF-11):** el criterio C6 (Lighthouse) no tiene evidencia de cumplimiento. Los problemas que deprimirían el score están identificados y son corregibles.

### ¿Se puede avanzar a Fase 2?

**No se recomienda hasta resolver BF-1 y BF-4.**

BF-1 tiene consecuencia de negocio directa: cada lead que se capte antes de la corrección se perderá silenciosamente. BF-4 es un requisito legal que expone el negocio a reclamos bajo RGPD.

Los ítems BF-5 a BF-11 son importantes para las métricas Lighthouse pero no paralizan la funcionalidad central. Podrían abordarse en paralelo o en las primeras acciones de Fase 2 antes de lanzar.

**Camino mínimo para certificar la fase:**
1. Corregir BF-1: cambiar la condición `res.ok || res.status === 503` por `res.ok` solamente, y agregar mensaje diferenciado para 503.
2. Crear `app/politica-de-privacidad/page.tsx` con contenido legal básico validado por Legal Compliance Checker.
3. Opcional pero recomendado antes del lanzamiento: resolver BF-3, BF-6, BF-7, BF-8, BF-9, BF-10, BF-11 e inyectar `localBusinessSchema` en la home.

Una vez corregidos BF-1 y BF-4, el Reality Checker puede emitir certificación condicionada que habilite avanzar a Fase 2 con los ítems menores como deuda técnica documentada.

---

**Reality Checker:** TestingRealityChecker
**Fecha de evaluación:** 2026-05-29
**Estado:** FASE 1 NO CERTIFICADA — requiere corrección de BF-1 y BF-4 como mínimo
**Re-evaluación requerida:** sí, después de las correcciones identificadas

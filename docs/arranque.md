# Documento de arranque — Tu Lugar en Galicia

> Actualizado 2026-07-04. Próxima sesión: leer este archivo antes de actuar.
> Reglas completas en `CLAUDE.md`.

---

## 1 — Estado del proyecto

| Parámetro | Valor |
|---|---|
| **Stack** | Next.js 16.2.6 (App Router) · TypeScript · Tailwind CSS v4 · Vercel |
| **URL producción** | `https://tu-lugar-en-galicia.vercel.app` (dominio `tulugarengalicia.com` pendiente) |
| **Rama activa** | `main` — working tree limpio, sin cambios pendientes |
| **Auto-deploy** | Vercel ← GitHub `main` |
| **CDN / DNS / SSL** | Cloudflare (pendiente: apuntar dominio propio) |
| **CRM / Leads** | Supabase/Postgres (migrado desde Airtable el 2026-07-12 — ver `docs/crm-supabase-fase0.md`) |
| **IA (Gina)** | Gemini API (ADR-008 vigente — NO cambiar a Claude sin ADR) |
| **tsc** | 0 errores (verificado en `c960296`) |
| **build** | no re-verificado tras `c960296` — pendiente correr `npm run build` en próxima sesión |
| **Última sesión** | 2026-07-04 |
| **Fase actual** | Fase 1 (marketing + Gina + flujo agenda — completados). Auditoría de seguridad Fase 1 completa, auditoría UX/UI completa. Pendiente: fase de performance + QA funcional end-to-end + limpieza de código muerto |

### Commits desde el estado certificado anterior (9b223a7) — 7 en total

```
fa56ec7  fix: CalEmbed guard client-side nav y rate limit Gina        ← sesión 2026-07-02
2633d07  chore: reducir prompts de permiso para operaciones de diagnóstico  ← sesión 2026-07-02
16e045c  fix: contraste WCAG AA en GinaInput y CiudadesCards          ← sesión 2026-07-02
4f2359c  revert: sacar WhatsApp flotante y secciones duplicadas de home
a4f4508  fix: agregar URL de deployment al allowlist de origen en /api/gina
f159d9a  fix: restaurar WhatsApp flotante y secciones faltantes en home
0358828  docs: corregir referencias Avoa→Gina y desduplicar CLAUDE.md en arranque.md
```

Todos están en origin/main y auto-desplegados en Vercel. Los 3 marcados como "sesión 2026-07-02" son los que se pushearon en la sesión actual; los 4 restantes ya estaban en origin al inicio de la sesión.

---

## 1.1 — Sesión 2026-07-04 — resumen completo

10 commits, todos en `origin/main` y auto-desplegados:

```
7b78ef6  fix: eliminar rótulo de número de trámite en PDF y actualizar referencias cruzadas
08645ea  fix: agregar width explícito al logo del header para eliminar warning de Next Image
5f30fec  fix(security): reducir TTL de token admin de 72h a 24h (A15)
0b8a539  simplify: dejar "Vamos a conocernos" como único CTA en sección final de home
1b10394  fix(security): sanear logs de errores para evitar exposición indirecta de PII (A02)
2d08a6e  fix: corregir texto invisible por sintaxis Tailwind rota (text-[var(--color-*)])
b43640b  fix: corregir color equivocado en elementos funcionales por sintaxis Tailwind rota
e1ebaff  fix: corregir tono de color en texto secundario por sintaxis Tailwind rota
b8a2327  fix(security): prevenir IDOR en /api/gina mediante firma HMAC del recordId
c960296  fix(security): escapar HTML en templates de email para prevenir inyección (C2)
```

### Detalle por commit

1. **`7b78ef6` — Rótulo de trámites en PDF.** El PDF del plan estratégico mostraba "TRÁMITE {número}" antes del nombre de cada trámite. Se eliminó el rótulo (`lib/plan/generarPdf.tsx`) y se actualizaron 3 referencias cruzadas en `docs/contenido/tramites-galicia.md` (trámites 44, 47, 51) que citaban el número del trámite destino — ahora citan el nombre, para no quedar huérfanas.

2. **`08645ea` — Warning de aspect-ratio en el logo.** `components/layout/Header.tsx` — el `<Image>` del logo (`aldaba.png`) fijaba `height` vía clase Tailwind pero el `width` solo por `w-auto` en `className` (no en `style`), y Next.js Image chequea específicamente la prop `style`. Se agregó `width: 'auto'` al objeto `style`. Sin cambio de tamaño visual (verificado: 63.09×70px antes y después). Warning confirmado ausente en consola tras el fix.

3. **`5f30fec` — A15 resuelto: TTL 72h → 24h.** `lib/admin/tokens.ts:3` y su mensaje de error, más la comparación literal correspondiente en `app/admin/lead/[recordId]/page.tsx` (que debía seguir el mismo string para mostrar el mensaje amigable de expiración). Documentación actualizada en el mismo commit (CLAUDE.md, arranque.md, auditoria-2026-07-01.md, certificacion-fase-1, spec-flujo-agenda.md).

4. **`0b8a539` — Simplificación del CTA final de home.** `components/home/CTAFinal.tsx` — se eliminó el botón "Agenda tu videollamada" y la línea "O si prefieres, escríbenos por el formulario de contacto". Queda "Vamos a conocernos" como único CTA de la sección. El wrapper de botones se simplificó de `flex flex-col items-center gap-4 sm:flex-row sm:justify-center` (pensado para 2 botones) a `flex justify-center` (1 solo). Sin impacto en Header/Footer/otras páginas que también enlazan a `/agenda` o `/contacto`.

5. **`1b10394` — A02 resuelto (parcial — ver pendiente abajo): saneo de logs.** 5 puntos en `app/api/webhooks/calcom/route.ts` (búsqueda de lead por email, PATCH Airtable, envío de mail con/sin lead) y `app/api/gina/route.ts` (reintentos de guardado) reemplazaron el logueo de objetos `err`/body crudos por `status HTTP + timestamp + recordId` (cuando disponible). Ningún log puede ya arrastrar el email del cliente vía mensajes de error de Airtable/Resend. **Sin cambios de comportamiento funcional** — reintentos y manejo de errores permanecen idénticos.

6. **`2d08a6e`, `b43640b`, `e1ebaff` — Fix crítico: texto invisible en 28 archivos.** Ver §1.2 abajo (sección propia por la magnitud del hallazgo).

7. **`b8a2327` — C1 resuelto: IDOR en `/api/gina`.** Ver §1.3 abajo.

8. **`c960296` — C2 resuelto (parcial): HTML sin escapar en emails.** Ver §1.3 abajo.

### 1.2 — Auditoría UX/UI completa + fix del hallazgo crítico

Auditoría de las 17 páginas públicas (contraste medido vía `getComputedStyle` + muestreo de píxel real sobre imágenes/video, no estimado; verificado en modo claro y oscuro).

**Hallazgo crítico (ya resuelto en 3 commits por severidad):** la sintaxis `text-[var(--color-*)]` **no genera ninguna regla CSS en Tailwind v4** — el prefijo `text-` es ambiguo entre tamaño de fuente y color, y Tailwind no logra resolver un `var()` crudo como color válido. El elemento queda con el color heredado de `body { color: var(--color-granito) }`, que en varias secciones coincide exactamente con el fondo de esa misma sección → texto invisible. Se descubrió además un conflicto secundario: `text-[var(--text-*)]` (tamaño de fuente, sintaxis igual de ambigua) genera una declaración `color` fantasma que puede ganar la cascada sobre una clase de color correcta en el mismo elemento — se corrigió a `[font-size:var(--text-*)]` en los mismos 28 archivos.

Casos críticos confirmados invisibles antes del fix: párrafo de `CTAFinal.tsx`, **H1 completo de `/contacto`**, tooltip de `ContactoFlotante`, eyebrow de `CiudadLayout.tsx` (afecta las 5 páginas de ciudad). También se corrigió el contraste del dorado "Galicia" en `CTAFinal` en modo oscuro (1.62:1 → ~4.80:1 con el nuevo token `--color-laton-invertido`, fijo, no invierte en `.dark`).

Los 28 archivos se dividieron en 3 commits por severidad real (no solo por sintaxis): crítico (texto invisible), color equivocado en elementos funcionales (Button fantasma, chevron FAQ, ícono Instagram, asteriscos de obligatorio), y tono menor (texto secundario/legal, siempre legible).

**Pendiente de decisión de producto (sin código tocado):** `DESIGN.md` y `docs/design-system.md` especifican **Fraunces** para titulares editoriales, pero el código real (`app/layout.tsx`) nunca cargó esa fuente — usa **Cormorant Garamond** para `--font-titular`, más una tercera familia (**Mulish**) no documentada en absoluto, usada en 20+ archivos (Header, Footer, Button, formularios, Hero). Además `docs/design-system.md` está desactualizado y se contradice a sí mismo en varios tokens de color (tabla §1 vs. bloque de código §7) — ver detalle completo en la sección de pendientes (§5) más abajo.

### 1.3 — Auditoría de seguridad Fase 1 completa (8 áreas) + fix de C1 y C2

Auditoría de los 11 endpoints `/api/*`: secretos (grep exhaustivo + historial de git completo — limpio, sin hallazgos), auth/autorización por endpoint, validación de inputs, rate limiting, CORS/headers, dependencias (`npm audit`: 2 moderadas, bajo riesgo real), webhooks, manejo de errores.

**C1 — IDOR en `/api/gina` (crítico, resuelto).** El servidor confiaba ciegamente en `sesion.airtableRecordId` enviado por el cliente sin ninguna verificación de pertenencia — cualquiera con un `recordId` real (visible en URLs de mail a Silvana, o en logs de acceso) podía forjar una sesión y sobrescribir (`PATCH`) los datos de otro lead. Fix: el servidor firma el `recordId` con `generateAdminToken` (mismo mecanismo HMAC ya usado en `lib/admin/tokens.ts`) al crearlo, lo devuelve como `sesion.airtableRecordSig`, y valida esa firma con `verifyAdminToken` en cada request posterior antes de usar el recordId para el PATCH. Si la firma falta o no valida, la sesión se trata como nueva (fail-safe silencioso, sin error visible — el flujo simplemente crea un registro propio). Se removió `runtime = 'edge'` del endpoint porque `lib/admin/tokens.ts` usa el módulo `crypto` de Node, no disponible en Edge Runtime.

Verificado end-to-end contra Airtable real: flujo legítimo (reenviando la firma real) hace `PATCH` correcto sobre el mismo recordId; dos variantes de ataque (sin firma, firma inventada) contra el recordId real de un lead existente fueron descartadas — confirmado byte a byte que el registro real no cambió. Los registros de prueba/ataque creados durante la verificación fueron eliminados de la base real.

**C2 — HTML sin escapar en templates de email (crítico, resuelto parcialmente).** `nombre`, `email`, `mensaje`/`teléfono` se interpolaban crudos en el HTML de los mails a Silvana — un envío con `nombre: "<img src=x onerror=...>"` se renderizaba como HTML real en el cliente de correo. Fix: `escapeHtml()` nueva en `lib/admin/email.ts` (no existía ninguna función de escape en el proyecto), aplicada en `buildContactoEmail` (nombre, email, teléfono, mensaje), `buildAgendaEmail` (nombre) y `buildConfirmacionEmail` del webhook de Cal.com (nombre, email, plataforma). Verificado con payloads reales (`<img onerror>`, `<script>`, comillas de escape) — todos se renderizan como texto literal.

**⚠️ Pendiente — no cubierto por este fix:** `app/api/admin/recordatorio-silvana/route.ts:78-80` tiene el mismo patrón exacto (`plataformaHtml` interpola `plataforma` de Airtable sin escape) y ya estaba documentado desde la auditoría de 2026-07-01 (`docs/auditoria-2026-07-01.md`, sección "XSS en templates de email admin"). No se tocó en esta sesión porque el fix de C2 se acotó a los 3 templates identificados en la auditoría de seguridad de esta sesión. Queda abierto — ver §5.

**A09 — evaluado y aceptado como riesgo residual bajo (sin cambio de código).** Token admin en query string de `/admin/lead/[recordId]`. Se evaluaron las alternativas (header Authorization — no aplica a un link abierto directo en navegador; formulario intermedio — degrada UX sin agregar seguridad real) y se decidió no tocar el esquema: el destinatario es una sola persona de confianza, `no-referrer` ya está activo en rutas admin, no hay analytics de terceros, y el TTL ya bajó a 24h (A15). El único vector residual (URL con token en el log de acceso propio de Vercel) se acepta como riesgo bajo para un link interno de bajo volumen.

**Pendientes de la auditoría de seguridad (sin tocar, ver §5 para detalle completo):** A1 (rate limit en `/api/contacto`), A2 (rate limit fail-open en `/api/lead`), A3 (CSP con `unsafe-inline`), A4 (sin límite de tamaño en respuestas array de Gina), M1-M4 (rate limit en endpoints de token admin, precedencia de headers sin verificar, mensajes de error internos expuestos en `/api/gina`, dependencias moderadas).

---

## 2 — Lo que se implementó

### Fixes verificados en sesión 2026-07-02

Todos con evidencia concreta (tsc + build + test en producción o revisión de código):

| Commit | Fix | Evidencia |
|---|---|---|
| `a4f4508` | **Allowlist de origen `/api/gina`**: `VERCEL_URL` añadido para cubrir URLs de deployment específicas de Vercel (formato `tu-lugar-en-galicia-xxxxx.vercel.app`) | curl deployment URL → 200; curl evil.com → 403 |
| `16e045c` | **Contraste WCAG AA**: `--color-coral` `#D4694F`→`#B8492F` (3.46:1→5.09:1); `--color-pizarra` `#696560`→`#585450` (4.41:1→5.73:1). Dark mode con overrides independientes. 2 hex hardcodeados en `CiudadesCards.tsx` → `var(--color-pizarra)` | Ratios calculados, tsc 0 errores |
| `4f2359c` | **Revert WhatsApp flotante + secciones duplicadas**: `WhatsAppFlotante` y `ComoFuncionaResumen`/`CiudadesCards` re-añadidos en `f159d9a` basándose en PRD desactualizado — confirmado como decisión de producto descartada | Home verificada con 6 secciones correctas |
| `fa56ec7` | **CalEmbed guard client-side nav** (`components/shared/CalEmbed.tsx`): guard `getElementById` → `window.Cal`; extrae `initInline()` reutilizable; añade cleanup `script.onload = null` en return del `useEffect` | Code Reviewer aprobado; build exit 0 |
| `fa56ec7` | **Rate limit Gina**: `slidingWindow(30, '10 m')` → `slidingWindow(60, '10 m')`. Cálculo: rama más larga del `flow.json` = 44 pasos × 1.25 margen = 60 | AI Engineer mapeó todas las ramas; tsc 0 errores |
| (sin cambio) | **`fechaHabilitacion` ISO 8601**: confirmado que `app/api/admin/habilitar-agenda/[recordId]/route.ts` ya usa `new Date().toISOString()` — no era bug de código. El registro `"28/6/2026 7:03pm"` en Airtable es dato histórico de una versión anterior | Código verificado en línea 67 del archivo |
| `0358828` | **Referencias Avoa→Gina** corregidas en roadmap.md y ARCHITECTURE.md | — |
| `0358828` | **Duplicación de CLAUDE.md** en arranque.md eliminada | — |

### Flujo de agenda — 9 piezas completas (sesiones anteriores)

> Nota (2026-07-16): las descripciones de abajo son el registro histórico de lo que cada commit
> hizo en su momento, contra Airtable. Desde el 2026-07-12 todo el CRM de leads vive en Supabase
> — ver `docs/crm-supabase-fase0.md`. No se reescriben las filas para mantener el registro fiel a
> lo que cada commit realmente hizo.

| Pieza | Commit | Descripción |
|---|---|---|
| Pieza 1 — Calificación Airtable | (sesiones anteriores) | Lead guardado con `calificacion` en Airtable |
| Pieza 2 — Mail diario Silvana | `56b5129` | Cron 08:00 España → `/api/admin/resumen-diario` |
| Pieza 3 — Perfil `/admin/lead/[recordId]` | `86c505c` | Página privada HMAC, token 24h (reducido de 72h, A15 resuelto) |
| Pieza 4 — Endpoint habilitar-agenda | `2e3cba0` | Genera código 8 chars, guarda en Airtable, dispara mail |
| Pieza 5 — Mail cálido al cliente | `2e3cba0` | Template voz Silvana, código personal, link `/agenda?code=` |
| Pieza 6 — Expiración + alertas | `0e7d320` | Cron diario expira códigos >7 días |
| Pieza 7 — Webhook Cal.com | `0b18d37` | `app/api/webhooks/calcom/route.ts` — HMAC `CALCOM_WEBHOOK_SECRET` |
| Pieza 8 — Recordatorio Silvana 1h antes | `0b18d37` + `49d8e3e` | GitHub Actions cron horario |
| Pieza 9 — Validación dinámica /agenda | `8796142` | Valida código contra Airtable |

### Motor del plan estratégico (sesiones anteriores)

| Commit | Descripción |
|---|---|
| `6478857` | 11 fixes: path bug, trámites condicionales, sección económica personalizada, barra contexto PDF |
| `a14360c` | 2 fixes: familias mixtas UE, bloque herramientas digitales SERGAS |

---

## 3 — Estado del flujo de agenda

**Las 9 piezas están 100% implementadas en código.**

| Pieza | Estado | Bloqueado por |
|---|---|---|
| 1 — Calificación Supabase (migrado desde Airtable el 2026-07-12) | ✅ Funciona en producción | — |
| 2 — Mail diario Silvana | ✅ Funciona en producción | — |
| 3 — Perfil `/admin/lead/[recordId]` | ✅ Funciona | — |
| 4 — Endpoint habilitar-agenda | ✅ Funciona | — |
| 5 — Mail cálido al cliente | ✅ Funciona | Dominio propio para remitente definitivo |
| 6 — Expiración + alertas | ✅ Funciona | — |
| 7 — Webhook Cal.com | ✅ Funciona en producción | Cal.com configurado y verificado con ping test 200 (C3 resuelto sesión 2026-07-03) |
| 8 — Recordatorio Silvana 1h | ✅ Funciona | — |
| 9 — Validación dinámica /agenda | ✅ Funciona. `CalEmbed` bug client-side nav resuelto en `fa56ec7` | — |

**Nota sobre Cal.com (auditado 2026-07-02):** `https://cal.com/tu-lugar-en-galicia` existe (HTTP 200). Cero hits a `POST /api/webhooks/calcom` en logs — Cal.com no está disparando el webhook. Causa probable: URL en Cal.com → Settings → Developer → Webhooks apunta al dominio incorrecto.

---

## 4 — Pendientes de Silvana

Lista consolidada. Nada de código hasta que Silvana confirme.

| # | Pendiente | Acción exacta | Urgencia |
|---|---|---|---|
| ~~C3/PL-2~~ | ~~**Webhook Cal.com**~~ | ✅ **RESUELTO** — endpoint sano, Cal.com configurado y verificado con ping test 200, embed funcionando en producción (sesión 2026-07-03) | ✅ |
| A04 | **Datos fiscales en Política de Privacidad** | `docs/legal-terminos-privacidad.md` → completar todos los campos `[COMPLETAR]`: nombre, NIF/CIF, dirección, email contacto, email DPO — en revisión legal | 🔴 Antes de lanzar (RGPD) |
| A14 | **Fotos reales** | Reemplazar imágenes placeholder de Testimonios, Silvana y MuroLlaves — dato real requerido | 🟠 Antes de lanzar |
| ~~R3~~ | ~~**Sincronizar `INTERNAL_API_SECRET`**~~ | ✅ **RESUELTO** — secreto rotado y verificado con HTTP 200 en producción (sesión 2026-07-03) | ✅ |

**Pendientes adicionales de Silvana (menor urgencia):**

| # | Pendiente | Acción |
|---|---|---|
| S2 | Cuenta Cal.com — event types configurados con disponibilidad real | Cal.com → crear/verificar evento "Videollamada 30 min" con horarios reales |
| S8 | Feed Instagram (Behold.so) | behold.so → widget ID → `NEXT_PUBLIC_BEHOLD_WIDGET_ID` en Vercel |
| S9 | Google Sheet El Marcador | Sheet ID → `SHEET_MARCADOR_ID` en Vercel |
| S10 | Dominio `tulugarengalicia.com` | Registrar → Cloudflare DNS → Vercel Domains |

---

## 5 — Pendientes técnicos sin resolver

### 5.1 — Generales

| # | Pendiente | Detalle |
|---|---|---|
| **PDF del plan estratégico** | R3 resuelto (sesión 2026-07-03). Lead de prueba disponible: `recgLT5e61Im5mrhN` (etiqueta: `seguimiento-futuro`, no tiene `codigoAgenda`). Generar token con `generateAdminToken` y probar `/admin/lead/recgLT5e61Im5mrhN` | Pendiente verificación visual |
| **R2: `sesion.completado = false`** | En el E2E de Gina, `localStorage['gina_session_v1'].sesion.completado` quedó en `false` a pesar de llegar a `pasoActual === 'despedida'`. Posible desincronización entre estado React y localStorage tras el último guardado. No investigado — sin impacto visible en UX confirmado | Técnico, baja urgencia |
| **Calendario propio (reemplazo Cal.com)** | Eliminar branding Cal.com sin depender del plan Teams ($12/mes). Implica desarrollo propio de disponibilidad de slots, sincronización de calendario, envío de invitaciones — no es un ajuste menor. Evaluar cuando el volumen de reservas lo justifique | Backlog / futuro — no urgente |

### 5.2 — Auditoría de seguridad (sesión 2026-07-04) — pendientes

| ID | Severidad | Pendiente | Archivo |
|---|---|---|---|
| ~~A1~~ | ~~🟠 Alto~~ | ✅ **RESUELTO** (`c873534`) — rate limiting + verificación de origen agregados a `/api/contacto` | `app/api/contacto/route.ts` |
| ~~A2~~ | ~~🟠 Alto~~ | ✅ **RESUELTO** (`c873534`) — `/api/lead` ahora falla cerrado si falta config de Upstash, igual que `/api/gina` | `app/api/lead/route.ts` |
| A3 | 🟠 Alto | CSP con `'unsafe-inline'` en `script-src` — anula gran parte del valor de la CSP como mitigación XSS | `middleware.ts:9` |
| ~~A4~~ | ~~🟠 Alto~~ | ✅ **RESUELTO** (`c873534`) — límite de tamaño agregado para respuestas tipo array en `/api/gina` | `app/api/gina/route.ts` |
| M1 | 🟡 Medio | Sin rate limiting en endpoints de token admin (`plan/pdf`, `habilitar-agenda`) — riesgo bajo porque el token no es adivinable, pero sin freno si llegara a filtrarse | `app/api/plan/[recordId]/pdf/route.ts`, `app/api/admin/habilitar-agenda/[recordId]/route.ts` |
| M2 | 🟡 Medio | Posible conflicto de precedencia entre `vercel.json` (`Referrer-Policy: strict-origin-when-cross-origin` para todas las rutas) y `middleware.ts` (`no-referrer` específico para rutas admin) — **sin verificar con una request real en producción** | `vercel.json`, `middleware.ts` |
| M3 | 🟡 Medio | Mensajes de error internos expuestos al cliente en `/api/gina` (`(e as Error).message` de `obtenerPaso()` revela nombres de pasos de `flow.json`) | `app/api/gina/route.ts:96-99,114-117` |
| M4 | 🟡 Medio | 2 vulnerabilidades moderadas en dependencias (`next`→`postcss` interno del build, XSS en stringify) — bajo riesgo real, es tooling de build no runtime servido al usuario | `package.json` (npm audit) |
| ~~—~~ | ~~🟡 Medio~~ | ✅ **RESUELTO** (`c873534`) — `app/api/admin/recordatorio-silvana/route.ts` tenía el mismo patrón de HTML sin escapar que C2 (`plataformaHtml`); ya usa `escapeHtml()` | `app/api/admin/recordatorio-silvana/route.ts` |

### 5.3 — Auditoría UX/UI (sesión 2026-07-04) — pendientes

| # | Pendiente | Detalle |
|---|---|---|
| **Decisión de tipografía** | `DESIGN.md`/`docs/design-system.md` documentan Fraunces para titulares; el código real usa Cormorant Garamond + Mulish (no documentada) en 20+ archivos. Decidir: ¿documentar lo real, o migrar el código a Fraunces? Requiere decisión de producto antes de tocar código | `app/layout.tsx`, `DESIGN.md` §3 |
| **Consolidación de dorados del Hero** | `components/home/Hero.tsx` usa 4 variantes de dorado distintas sin un token unificado (`#D4B873`, `#E8C97A`, `#C9A961`, `#E7D29C`), y 13 hex hardcodeados en total, ignorando el sistema de tokens y el componente `Button` existente | `components/home/Hero.tsx` |
| **`docs/design-system.md` desactualizado** | Se contradice a sí mismo (tabla §1 vs. bloque de código §7 para `laton`) y contradice el código real (`app/globals.css`) en 4 de 7 tokens comparados (granito, niebla, arena, blanco) | `docs/design-system.md` |

### 5.4 — Auditoría global pendiente (no iniciada)

Esta sesión cubrió solo la **fase de seguridad** de una auditoría global más amplia. Quedan sin hacer:
- **Limpieza de código muerto / assets sin usar** (ej. dependencias de fuentes no usadas en `package.json` — `@fontsource/dm-sans`, `@fontsource/mulish`, `@fontsource/source-sans-3` — ya detectadas en `docs/auditoria-2026-07-01.md` §3, sin confirmar si siguen sin uso tras esta sesión).
- **Performance** (Lighthouse en producción — pendiente desde certificación de Fase 1, criterio C6 nunca verificado con medición real).
- **QA funcional end-to-end** — recorrido completo de los flujos de negocio (Gina → Supabase → agenda → PDF → mails) verificando comportamiento, no solo seguridad.

---

## 6 — Cambios de configuración de esta sesión (2026-07-02)

### `.claude/settings.json` (versionado en git, commit `2633d07`)

Añade `permissions.allow` con patrones de solo lectura/diagnóstico que ya no piden confirmación:
- `git log/status/diff/show/branch/stash list/remote -v`
- `vercel env ls / logs / inspect / ls / alias ls`
- `curl -s -o /dev/null` acotado a `https://tu-lugar-en-galicia.vercel.app*` y `http://localhost:*`
- `npm run build/lint/test`, `npx tsc --noEmit`, `npx eslint`
- PowerShell lectura: `Get-Content`, `Get-ChildItem`, `Select-String`, `Get-Item`, `Test-Path`, `Measure-Object`
- Unix lectura: `ls`, `cat`, `head`, `tail`, `grep`, `find`, `dir`

**Siguen requiriendo confirmación explícita:** `git push`, `git commit`, `git add` (y variantes), `vercel deploy`, `vercel env set/rm`, PowerShell de escritura (`Set-Content`, `Remove-Item`, `New-Item`, `Out-File`), acceso a `.env`.

### `settings.local.json` (no versionado — solo local)

Eliminadas en esta sesión 4 entradas que auto-aprobaban operaciones de git:
- `"Bash(git push *)"` — eliminada
- `"Bash(git add *)"` — eliminada
- `"Bash(git commit *)"` — eliminada
- `"Bash(git commit -m ' *)"` — eliminada

**Resultado:** a partir de esta sesión, cualquier `git add`, `git commit` o `git push` requiere confirmación explícita del usuario en el chat. Total actual: 260 entradas en `settings.local.json`.

---

## 7 — Roadmap próxima sesión — prioridades

**En este orden:**

### 1. Fixes de auditoría de seguridad pendientes (🟠 Alto)
✅ A1, A2, A4 resueltos en `c873534`. Queda **A3** (CSP `unsafe-inline`) sin tocar. Ver detalle completo en §5.2. Agentes: `Security Engineer` + `Backend Architect`.

### 2. ~~XSS pendiente en `recordatorio-silvana`~~
✅ **RESUELTO en `c873534`** — `escapeHtml()` aplicado a `plataformaHtml`.

### 3. Decisión de producto: tipografía del sitio
Fraunces (documentado) vs. Cormorant Garamond + Mulish (real, en 20+ archivos). Ver §5.3. Requiere decisión del dueño del producto antes de tocar código — no es un fix técnico unilateral.

### 4. Verificar PDF del plan estratégico
Generar token → probar `/admin/lead/recgLT5e61Im5mrhN` → confirmar que el PDF se genera sin errores visuales (colores, fuentes, layout).

### 5. Reserva real de prueba end-to-end del flujo de agenda
Confirmar que `POST /api/webhooks/calcom` actualiza Supabase y dispara mail a Silvana con una reserva real (no solo el ping test ya verificado).

### 6. Rediseño páginas de ciudad: tabs + cámara MeteoGalicia
- Tabs para secciones (Barrios, Clima, Colegios, Transporte, etc.)
- Verificar autorización legal de `VistaEnVivo.tsx` (Windy/MeteoGalicia — auditado A13)
- Agentes: `Frontend Developer` + `Legal Compliance Checker` + `Accessibility Auditor`

### 7. Motor del plan estratégico: completar PDF
- Pasada final de tono Carnegie sobre textos fijos
- Integrar `plan-estrategico.md` como fuente de textos fijos
- Verificar que los 55 trámites del catálogo están mapeados
- Agentes: `AI Engineer` + `Content Creator` + `Code Reviewer`

### 8. Fixes de seguridad medios (🟡) y auditoría global restante
M1-M4 (ver §5.2). Después: limpieza de código muerto/assets sin usar, performance (Lighthouse en producción, C6 nunca verificado), QA funcional end-to-end (§5.4) — la auditoría global de esta sesión cubrió solo la fase de seguridad.

---

## 8 — Variables de entorno — estado completo

| Variable | Propósito | Vercel Prod | GitHub Actions | `.env.local.example` |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Leads (tabla `leads`) y Comunidad | ✅ Configurada | — | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Leads y Comunidad (bypassea RLS, server-only) | ✅ Configurada | — | ✅ |
| `AIRTABLE_API_KEY` | Solo puente Comunidad — ya no leads, migrado a Supabase el 2026-07-12 | ✅ Configurada | — | ✅ |
| `AIRTABLE_BASE_ID` | Solo puente Comunidad — ya no leads | ✅ Configurada | — | ✅ |
| `AIRTABLE_TABLE_NAME` | Huérfana — la tabla de leads en Airtable ya no se lee desde ningún código | — | — | ❌ Eliminada de `.env.local.example` (Fase 5 de retiro de Airtable) |
| `GEMINI_API_KEY` | IA Gina (servidor only) | ✅ Verificar vigente | — | ✅ |
| `INTERNAL_API_SECRET` | Auth endpoints admin + HMAC | ✅ Rotado y verificado HTTP 200 producción (R3 resuelto 2026-07-03) | ✅ Verificado | ✅ |
| `RESEND_API_KEY` | Envío de emails | ✅ Configurada | — | ✅ |
| `SILVANA_EMAIL` | Destino mails internos | ✅ Configurada | — | ✅ |
| `CALCOM_WEBHOOK_SECRET` | Firma HMAC webhook Cal.com | ✅ Configurada (creada hace ~5 días) | — | ✅ |
| `CRON_SECRET` | Auth cron Vercel | ✅ Configurada | — | ✅ |
| `UPSTASH_REDIS_REST_URL` | Rate limiting Gina | ✅ Configurada (sesión 2026-07-02) | — | ⚠️ No está en example (A11) |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting Gina | ✅ Configurada (sesión 2026-07-02) | — | ⚠️ No está en example (A11) |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio | ❌ No configurada | — | ✅ |
| `AEMET_API_KEY` | Clima AEMET | ✅ Configurada | — | ✅ |
| `SHEET_MARCADOR_ID` | Google Sheets El Marcador | ⚠️ Pendiente Silvana | — | ✅ |
| `NEXT_PUBLIC_BEHOLD_WIDGET_ID` | Feed Instagram | ❌ Pendiente Silvana | — | — |
| `CALCOM_API_KEY` | Cal.com gestión slots (Pieza 7) | ❌ No configurada | — | ✅ (marcada como obsoleta en example) |
| `DATABASE_URL` | BD (Fase 5 — no usar aún) | — | — | ✅ |
| `STRIPE_SECRET_KEY` | Pagos (Fase 6) | — | — | ✅ |

> ⚠️ `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` deben añadirse a `.env.local.example` (auditado A11 — pendiente técnico menor).

---

## 9 — Arquitectura clave

### Rutas API activas

| Ruta | Método | Auth | Propósito |
|---|---|---|---|
| `/api/gina` | POST | Rate limit Upstash (**60**/10min) + origin allowlist + firma HMAC del `leadId` (C1, `generateAdminToken`/`verifyAdminToken`) | IA Gina → Gemini, guarda lead en Supabase. Runtime Node (ya no edge, por `crypto` de Node) |
| `/api/lead` | POST | Origin check | Guardar lead de FormularioDiagnostico |
| `/api/marcador` | GET | — | Lee Google Sheets → métricas El Marcador |
| `/api/clima/[ciudad]` | GET | — | Clima por ciudad (AEMET) |
| `/api/plan/[recordId]/pdf` | GET | `verifyAdminToken(recordId, token)` HMAC-SHA256 | Genera PDF personalizado |
| `/api/admin/resumen-diario` | GET | `Authorization: Bearer INTERNAL_API_SECRET` + x-vercel-cron | Cron diario 08:00 → mail Silvana |
| `/api/admin/habilitar-agenda/[recordId]` | POST | Token HMAC en query param | Genera código agenda, mail al cliente |
| `/api/admin/recordatorio-silvana` | GET | `Authorization: Bearer INTERNAL_API_SECRET` | Cron horario → recordatorio 1h antes |
| `/api/admin/expirar-codigos` | GET | `Authorization: Bearer INTERNAL_API_SECRET` | Expira códigos >7 días |
| `/api/webhooks/calcom` | POST | HMAC-SHA256 `X-Cal-Signature-256` (`CALCOM_WEBHOOK_SECRET`) | Webhook Cal.com → actualiza Supabase + mail Silvana |

### Componentes clave

| Componente | Archivo | Estado |
|---|---|---|
| `CalEmbed` | `components/shared/CalEmbed.tsx` | ✅ Guard client-side nav corregido (`fa56ec7`) |
| `GinaWidget` | `components/gina/GinaWidget.tsx` | ✅ Funciona, ambos triggers (Hero + Header) |
| `AgendaPublica` | `components/agenda/AgendaPublica.tsx` | ✅ Validación dinámica, código `ZR51P6AI` verificado |

### Motor del plan estratégico

| Archivo | Propósito |
|---|---|
| `lib/plan/armador.ts` | `RespuestasLead` → `PlanArmado`. 6 fases (A→F). |
| `lib/plan/generarPdf.tsx` | Renderer React-PDF. |
| `docs/contenido/tramites-galicia.md` | Catálogo 55 trámites (fuente de verdad) |

### GitHub Actions

| Workflow | Trigger | Propósito |
|---|---|---|
| `.github/workflows/recordatorio-silvana.yml` | `cron: '0 * * * *'` | Recordatorio 1h antes de cita |

---

## 10 — Herramientas del stack de Code

### ECC + agency-agents
- **Rules:** `~/.claude/rules/ecc/common/` (10 reglas) + `~/.claude/rules/ecc/typescript/` (5 reglas)
- **Skills globales:** `search-first`, `security-review`, `verification-loop`, `eval-harness`, `continuous-learning-v2`, `frontend-patterns`, `backend-patterns`, `tdd-workflow`
- **Skills de proyecto:** `voz-tu-lugar-en-galicia` — aplicar a TODO el copy visible sin excepción
- **Agentes más usados:** `Frontend Developer`, `Backend Architect`, `Brand Guardian`, `UI Designer`, `Security Engineer`, `Accessibility Auditor`, `Code Reviewer`, `Reality Checker`, `AI Engineer`, `DevOps Automator`

### DESIGN.md
Leer **siempre** antes de crear o modificar cualquier componente visual. Paleta hex exacta, tipografía, variantes de Button, layout, do's/don'ts.

---

## 11 — Instrucciones operativas

Reglas completas en `CLAUDE.md` — no duplicar aquí.
## Estado técnico al cierre

> Actualizado — sesión 2026-07-04.

### Últimos 10 commits

```
c960296 fix(security): escapar HTML en templates de email para prevenir inyección (C2)
b8a2327 fix(security): prevenir IDOR en /api/gina mediante firma HMAC del recordId
e1ebaff fix: corregir tono de color en texto secundario por sintaxis Tailwind rota
b43640b fix: corregir color equivocado en elementos funcionales por sintaxis Tailwind rota
2d08a6e fix: corregir texto invisible por sintaxis Tailwind rota (text-[var(--color-*)])
1b10394 fix(security): sanear logs de errores para evitar exposición indirecta de PII (A02)
0b8a539 simplify: dejar "Vamos a conocernos" como único CTA en sección final de home
5f30fec fix(security): reducir TTL de token admin de 72h a 24h (A15)
08645ea fix: agregar width explícito al logo del header para eliminar warning de Next Image
7b78ef6 fix: eliminar rótulo de número de trámite en PDF y actualizar referencias cruzadas
```

### Working tree

```
(pendiente confirmar tras esta actualización de docs — ver git status en la sesión)
```

### Pendientes de push (origin/main..HEAD)

```
(ninguno al cierre de la sesión de código — origin/main en c960296.
 Esta actualización de documentación (CLAUDE.md, arranque.md, auditoria-2026-07-01.md,
 certificacion-fase-1-2026-07-01.md) está sin commitear, a la espera de revisión.)
```
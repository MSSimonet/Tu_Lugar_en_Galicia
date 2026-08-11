# Documento de arranque — Tu Lugar en Galicia

> Actualizado 2026-08-09. Próxima sesión: leer este archivo antes de actuar.
> Reglas completas en `CLAUDE.md`.
>
> **Sesión 2026-08-09** (rama `fix/hallazgos-agosto-2`, 5 commits, mergeada en `a555ce0`):
> se cerraron los tres pendientes de esta lista — §5.7 (skill de voz), §5.6 (sobrescritura de
> perfiles sin auth) y §5.5 (SEO-03). **Los tres están desplegados y verificados en producción.**
> Aparecieron cinco pendientes nuevos: §5.10 a §5.14. El §5.9 (bloqueo de merge) nació y se
> cerró dentro de la misma sesión.
>
> **Sesión 2026-08-10** (directo sobre `main`, 9 commits). Cerró todo lo que quedaba de código:
> §5.10, §5.11, §5.12 y §5.13, más el primer test del proyecto, el Toggle A/B de PII-01 y un
> fix de z-index del mapa. Novedades que conviene leer antes de auditar:
>
> - **§5.13 era un falso positivo.** El widget de Gina no borra la página del árbol de
>   accesibilidad; lo decía una herramienta que no lee el árbol real. El bug era otro y menor.
> - **§5.12 subió de 🟡 a 🟠** al mirarlo de cerca: era una vía de cosecha de emails.
> - **Cuatro pendientes viejos (§5.2: A3, M1, M2, M3) estaban resueltos hacía rato** y esta
>   lista los arrastraba abiertos. M4 sigue abierto pero cambió de naturaleza.
> - El proyecto **ya tiene tests** (36) y un gate de CI que corre en cada push y PR.
>
> Nuevos: §5.16 (og:image atado a S10), §5.17 (nota de arquitectura), §5.18 (fines de línea).

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
| S8 | Feed Instagram — **ya no es Behold.so** | Silvana conecta su cuenta desde `/api/admin/instagram/conectar` (Graph API vía Facebook Login). Después: cargar `INSTAGRAM_EXPECTED_IG_USER_ID` en Vercel |
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
| ~~A3~~ | ~~🟠 Alto~~ | ✅ **RESUELTO** — verificado contra el código el 2026-08-10. `middleware.ts:50` usa `'nonce-${nonce}'` + hashes SHA-256; **no hay `unsafe-inline` en `script-src`**. Sigue solo en `style-src`, que es la decisión aceptada y documentada (A05 de `CLAUDE.md` §9, por el uso masivo de `style={{}}`). `CLAUDE.md` ya lo daba por resuelto; esta tabla lo arrastraba abierto | `middleware.ts:50` |
| ~~A4~~ | ~~🟠 Alto~~ | ✅ **RESUELTO** (`c873534`) — límite de tamaño agregado para respuestas tipo array en `/api/gina` | `app/api/gina/route.ts` |
| ~~M1~~ | ~~🟡 Medio~~ | ✅ **RESUELTO** — verificado 2026-08-10: los dos endpoints tienen `Ratelimit` | `app/api/plan/[recordId]/pdf/route.ts`, `app/api/admin/habilitar-agenda/[recordId]/route.ts` |
| ~~M2~~ | ~~🟡 Medio~~ | ✅ **RESUELTO** — el conflicto ya no existe: `Referrer-Policy` se declara **únicamente** en `middleware.ts` (línea 96, con el motivo escrito ahí) y se sacó de `vercel.json`. No hay dos fuentes que puedan pisarse | `middleware.ts:96` |
| ~~M3~~ | ~~🟡 Medio~~ | ✅ **RESUELTO** — ningún `NextResponse.json` de `/api/gina` interpola un `.message`. El único `err.message` que queda (línea 544) solo extrae un status HTTP para el log, no viaja al cliente | `app/api/gina/route.ts` |
| M4 | 🟡 Medio | ⚠️ **Abierto, pero cambió de naturaleza — el número engaña.** Ver el bloque de abajo | `package.json` (npm audit) |
| ~~—~~ | ~~🟡 Medio~~ | ✅ **RESUELTO** (`c873534`) — `app/api/admin/recordatorio-silvana/route.ts` tenía el mismo patrón de HTML sin escapar que C2 (`plataformaHtml`); ya usa `escapeHtml()` | `app/api/admin/recordatorio-silvana/route.ts` |

#### M4 — por qué "3 altas" no significa lo mismo que antes (medido 2026-08-10)

`CLAUDE.md` §9 describe M4 con **3 altas** que eran `postcss@8.4.31` y `sharp@0.34.5`,
empaquetadas por `next` dentro de `node_modules/next/node_modules/`. Hoy `npm audit` sigue
diciendo 3 altas, pero **son otras**:

```
@storybook/nextjs-vite        [high]  fixAvailable: false
image-size                    [high]  fixAvailable: false
vite-plugin-storybook-nextjs  [high]  fixAvailable: false
+ 3 moderadas (@storybook/addon-mcp, @storybook/mcp, valibot)
0 criticas
```

Las de `postcss`/`sharp` **desaparecieron** — presumiblemente con el bump a `next@16.3.0`
(`362070e`). Las tres que quedan son **todas de Storybook, devDependencies puras**: no entran al
bundle de producción ni se sirven al usuario. El riesgo real bajó bastante aunque el número no
se haya movido, y las tres tienen `fixAvailable: false` — dependen de un release upstream.

**Moraleja para la próxima auditoría:** no comparar el conteo de `npm audit` contra el
documentado. Comparar los paquetes.

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

### 5.5 — ✅ RESUELTO — SEO-03: `canonical` faltante en 7 páginas públicas (2026-08-09, `e3cfec4`)

> **Resuelto en `e3cfec4`.** Camino 2 (mínimo): `alternates.canonical` a mano en cada página.
> 7 archivos, +16 líneas, cero cambios en `lib/`. Verificado contra el servidor leyendo el
> HTML servido: las 7 emiten canonical; `/`, `/faq` y `/ciudades/vigo` (control) sin cambios.
>
> **Eran 7, no 8 — y 13 de 20, no 12.** El texto de abajo decía otra cosa y estaba mal: midió
> 5 páginas, infirió 2 más por el mismo patrón, y sumó 8. Se corrigió midiendo ruta por ruta
> sobre las 20 públicas. Se conserva el texto original para no perder el razonamiento, pero
> **los números buenos son estos.**
>
> `/comunidad/confirmar` (nueva en `005e7bf`) queda fuera a propósito: es `noindex, nofollow`,
> una URL de un solo uso con un token firmado. No lleva canonical ni entra al sitemap.

Hallazgo lateral que apareció al cerrar SEO-01/02 (commit `4ba1578`). **No se tocó** — es un pendiente propio, separado de aquel commit por decisión del usuario.

**Qué se midió.** Contra el servidor real, leyendo `<link rel="canonical">` del HTML servido:

| Página | canonical |
|---|---|
| `/ciudades` | ❌ ausente |
| `/contacto` | ❌ ausente |
| `/comunidad` | ❌ ausente |
| `/comunidad/mapa` | ❌ ausente |
| `/aviso-legal` | ❌ ausente |
| `/faq` | ✅ `https://tulugarengalicia.com/faq` (control) |

`/faq` es el control: confirma que la medición distingue de verdad. Por el mismo patrón faltan también en `/politica-de-cookies` y `/terminos-y-condiciones` — **8 páginas públicas en total**.

**Causa.** Dos formas conviven para declarar metadata. Las páginas que sí tienen canonical pasan por `getNextMetadata()` (`lib/seo/metadata.ts`), que lo emite desde `PAGE_METADATA[page].canonical`. Las 8 que no lo tienen declaran un objeto `Metadata` suelto con `title` + `description` y nada más. `app/layout.tsx` define `metadataBase` pero **eso no genera canonical** — Next.js no lo deriva solo.

**Corrige una afirmación falsa de la documentación.** `CLAUDE.md` §9 (gate pre-merge del 2026-07-31) afirma "metadata + canonical en las 20 páginas públicas". La primera mitad es cierta, la segunda no: son 12 de 20. Actualizar esa línea cuando se resuelva esto.

**Severidad: baja.** Google auto-canonicaliza cuando no hay tag. Sube un escalón desde `4ba1578`, porque 4 de las 8 ahora están en el sitemap y ahí es donde más pesa la ausencia.

**Dos caminos para el fix** (elegir uno, no mezclar — hoy el problema es justamente que conviven):
1. Sumar las 8 a `PAGE_METADATA` y pasarlas por `getNextMetadata()`. Unifica el enfoque y arrastra OG + Twitter cards, que también les faltan. Más trabajo, deja una sola forma de hacerlo.
2. Agregar `alternates: { canonical: … }` a mano en el `Metadata` de cada página. Mínimo y quirúrgico, pero perpetúa las dos formas.

Recomendado el 1 para las 4 públicas de marketing, y el 2 para las 4 legales, que no necesitan OG.

**Ojo con las legales.** Están fuera del sitemap por decisión confirmada (2026-08-08), no por olvido. Que se les agregue canonical no significa que entren al sitemap.

### 5.6 — ✅ RESUELTO — Cualquiera podía sobrescribir el perfil de comunidad de otra persona (2026-08-09, `005e7bf`)

> **Resuelto en `005e7bf`** por el camino que este propio texto proponía: verificación por
> email con el HMAC de `lib/admin/tokens.ts`. El registro ya no escribe en `comunidad`; guarda
> el perfil en Upstash (TTL 24 h) y manda un mail firmado. La única escritura vive en
> `POST /api/comunidad/confirmar`.
>
> **Verificado end-to-end contra infraestructura real** (2026-08-09), con la fila de prueba
> borrada después y el estado restaurado (4 filas / 3 pines, igual que antes):
>
> | Propiedad | Prueba |
> |---|---|
> | El registro no escribe | POST 200 y el mapa siguió en 3 pines, sin fila |
> | Un token forjado no escribe | 400, tabla intacta |
> | El mail llega y se ve bien | Confirmado por el usuario en su casilla |
> | Confirmar escribe con los datos correctos | Fila creada, `mostrar_contacto: false` (default PII-01 sostenido) |
> | Reusar el enlace no duplica | `getdel` atómico → `usado` |
>
> Decisiones de diseño y sus descartes, en el mensaje de `005e7bf`. Lo más importante para
> quien retome: **`lib/admin/tokens.ts` no se tocó**, y el sujeto que se firma lleva prefijo
> (`comunidad-pendiente:<uuid>`) como separación de dominio contra los tokens de admin, que
> usan el mismo `INTERNAL_API_SECRET` y también son uuid desde que los leads viven en Supabase.
>
> **✅ CERRADO DEFINITIVAMENTE — verificado en producción (2026-08-09, post-deploy).** Mergeado
> en `a555ce0`. Tras el deploy se repitió el flujo entero contra el dominio real, no contra dev:
>
> - `POST /api/comunidad/registro` en `tu-lugar-en-galicia.vercel.app` → 200, y el mapa de
>   producción siguió en 3 pines: **el alta no escribió**.
> - Mail recibido y **clic hecho por el usuario** sobre el link real del correo: llevó a la
>   página de confirmación y de ahí al mapa. Sin 404.
> - Fila creada con los datos exactos, `id` nuevo (`8e5ceda4…`, distinto del de la prueba
>   anterior, o sea alta y no update) y `mostrar_contacto: false`.
> - Fila borrada y estado restaurado: **4 filas / 3 pines**, idéntico al previo.
>
> El §5.9 que decía "no dar la feature por viva hasta probar esto" queda satisfecho. **La feature
> está viva.**
>
> El toggle self-service de teléfono quedó **desbloqueado** y ya está **implementado**
> (2026-08-09, `9f4e934` + `78c2373`): casilla en el registro y página
> `/comunidad/gestionar` para cambiarlo después. Con eso PII-01 queda cerrado del todo.

Hallazgo lateral de PII-01. **No se tocó: es scope nuevo, para una sesión de seguridad propia.** Es más grave que el PII-01 que lo destapó.

**El problema.** `upsertPerfilComunidad()` ([lib/comunidad/perfil.ts:19-52](../lib/comunidad/perfil.ts)) hace un upsert con `onConflict: 'email'`, y `POST /api/comunidad/registro` **nunca verifica que quien manda el POST sea dueño de ese email**. Valida formato, origen y rate limit — nada más. No hay login, magic link, token de verificación ni sesión en toda la feature de comunidad: `grep` de `localStorage|sessionStorage|registrado|acceso|gate` sobre `components/comunidad/` no devuelve una sola coincidencia.

**Qué permite hoy, en producción.** Sabiendo el email de una persona registrada —o probando emails— se puede pisar su fila entera: nombre, foto, y **su ubicación en el mapa**. El teléfono se conserva solo (`input.contacto ?? existente?.contacto`, [perfil.ts:40](../lib/comunidad/perfil.ts)), así que no hace falta conocerlo para quedarse con él.

Mover el pin de una familia inmigrante a una dirección que el atacante elige no es vandalismo cosmético: el mapa es, literalmente, "dónde vive esta persona".

**Por qué importa para el toggle que quedó pendiente.** El punto 5 del diseño de PII-01 —un switch "mostrar mi teléfono"— **se descartó por esto**. Con este agujero abierto, exponer `mostrar_contacto` como campo actualizable convierte "sé tu email" en "publico tu teléfono y después lo leo por el endpoint": el atacante manda un registro con el email de la víctima y el flag en `true`, y cosecha el número por `/api/comunidad/[id]/contacto`. Sería el único cambio que **empeora** la exposición respecto de hoy.

**Por eso el orden correcto es: primero esto, después el toggle.** No al revés.

**Camino de fix (no implementado).** Verificación por email antes de escribir. La pieza ya existe y está probada: `generateAdminToken`/`verifyAdminToken` ([lib/admin/tokens.ts](../lib/admin/tokens.ts)), HMAC-SHA256 con TTL, el mismo esquema del acceso a la ficha del lead. El alta manda un mail con un link firmado; hasta que se abre, la fila no se crea ni se actualiza. Eso resuelve el agujero **y** habilita el toggle self-service, que puede vivir en esa misma página de "gestiona tu perfil".

**Alcance de la revisión cuando se retome:** el mismo patrón de "confío en el email que me mandan" hay que buscarlo en `/api/comunidad/mensaje` (ahí el remitente declara su email sin verificación, aunque el impacto es menor: solo afecta el `replyTo`).

### 5.7 — ✅ RESUELTO — La skill `voz-tu-lugar-en-galicia` no existía (2026-08-09, `e18a60f`)

> **Resuelto en `e18a60f`** por la primera salida: se creó de verdad, en
> `.claude/skills/voz-tu-lugar-en-galicia/SKILL.md`, apuntando a
> `docs/contexto-estrategico.md:393-398` como fuente **sin duplicarla**.
>
> **Hizo falta tocar `.gitignore`, y ese era el detalle que faltaba en el análisis de abajo.**
> `.claude/skills/` estaba ignorado entero (a propósito: la colección instalada entró por error
> en `3fb0b7a` con 13,3 MB en 735 archivos). Crear el archivo sin más no lo habría commiteado,
> no habría sobrevivido a un clone, y `CLAUDE.md` seguiría apuntando al vacío — el mismo bug
> con más vida. Git no permite re-incluir dentro de un directorio excluido entero, así que la
> regla pasó a `.claude/skills/*` más `!.claude/skills/voz-tu-lugar-en-galicia/`. Verificado
> que no arrastra la colección: `git add --dry-run --all .claude/` stagea exactamente 1 archivo.
>
> **Corrección al conteo:** son 5 referencias prescriptivas (las que dice abajo) **más 2 en
> código** que el texto original no contó: `lib/admin/email.ts:171` y `:272`, que citan la skill
> en comentarios como si existiera.
>
> La skill suma sobre el doc: alcance (copy de cliente sí, comentarios y `/docs` no), ejemplos
> buenos tomados de copy real publicado, una sección sobre mensajes de error, y un checklist.
> Incluye una precisión deliberada: `CLAUDE.md` §6.1 dice "nunca 'vos' **con el cliente**", y
> ese matiz se pierde en las otras cuatro referencias, que dicen "sin excepción" a secas —
> pero `contexto-estrategico.md` y medio `/docs` están en rioplatense porque son internos, y
> eso **no se toca**. Sin esa aclaración, la próxima sesión "corrige" documentación que está bien.

### 5.7 (texto original del hallazgo, 2026-08-08)

**`CLAUDE.md` obliga a usar una skill que no está en el disco.** Buscada por nombre en todo el repo y en `~/.claude/`: cero resultados. En `.claude/skills/` solo viven las 74 carpetas de `design-references/`.

La exigen cinco lugares: `CLAUDE.md` §6.1 ("Todo texto publicado: aplicar skill…"), `CLAUDE.md` §10 dos veces ("TODO el copy que se escribe — sin excepción", "SIEMPRE → nunca escribir copy sin esta skill"), `DESIGN.md:423` y `docs/crm-supabase-fase0.md:657`. Este propio archivo la lista en la línea 401.

**Consecuencia real:** toda sesión que haya escrito copy en este proyecto invocó una skill inexistente o se la saltó en silencio. La regla más enfática de la sección de copy no se ha cumplido nunca de la forma en que está escrita.

Lo que sí existe y hace de fuente de verdad hoy es `docs/contexto-estrategico.md:393-398` — cálido y cercano, "tú" neutro (nunca "vos", nunca "vosotros"), directo y sin rodeos, empático, nunca corporativo. Es lo que se aplicó al copy de PII-01 (commit `3a13a97`).

**Dos salidas, elegir una:** crear la skill de verdad, o quitar las cinco referencias y apuntar a `contexto-estrategico.md`. Lo que no conviene es dejarla como está: una regla marcada "sin excepción" que apunta al vacío enseña a ignorar las reglas del archivo.

---

### 5.9 — ✅ CERRADO — el bloqueo de merge de los links de confirmación (2026-08-09)

> **Cerrado el mismo día que se abrió.** Se siguió la secuencia al pie: mergear (`a555ce0`) →
> esperar el deploy → alta real en el dominio de producción → clic real sobre el link del mail →
> verificar la fila → borrarla. El link **no dio 404** y la feature quedó viva. Detalle en §5.6.
>
> **La ventana de riesgo existió y duró segundos.** Medido: justo antes del deploy,
> `/comunidad/confirmar` en producción daba **404** mientras `/comunidad` daba 200 — o sea, el
> sitio vivo sirviendo un formulario cuyos mails no se podían confirmar. Al primer sondeo
> posterior ya respondía 200. Que haya sido corto fue suerte del timing, no del diseño.
>
> **Se deja escrito porque el mecanismo vuelve.** Cualquier feature futura que mande links por
> mail a una ruta nueva tiene exactamente este problema, y no se ve en code review: el código
> está bien, lo que falla es el orden de las operaciones. La tabla de los dos `SITE_URL` de
> abajo sigue vigente y es la trampa de fondo.

**Esto no es una nota al pie. Si la rama `fix/hallazgos-agosto-2` se mergea sin tener esto en
cuenta, nadie puede completar un alta en Comunidad.**

**El mecanismo.** El mail de confirmación arma su link con `EMAIL_BASE_URL`
(`lib/admin/email.ts`), que vale `NEXT_PUBLIC_SITE_URL ?? 'https://tu-lugar-en-galicia.vercel.app'`.
Como `NEXT_PUBLIC_SITE_URL` no está configurada en Vercel (ver §8), el link apunta siempre a
`https://tu-lugar-en-galicia.vercel.app/comunidad/confirmar?...`. Esa ruta **solo existe en esta
rama**. Hasta que el deploy esté vivo, todo link enviado da 404 — y como el alta ya no escribe
en la base sin ese clic, el registro queda inutilizable.

**Consecuencia del orden de operaciones:** entre el merge y el deploy de Vercel hay una ventana
en la que el formulario acepta altas, manda mails, y ninguna se puede confirmar. Los pendientes
expiran solos en 24 h sin dejar rastro en la base, así que no se corrompe nada — pero esas
personas se quedan afuera del mapa sin saber por qué.

**Qué hacer al mergear:**
1. Mergear y **esperar a que el deploy de Vercel termine** antes de anunciar o probar nada.
2. Verificar con un alta real que el link del mail resuelve (no 404).
3. Recién entonces dar la feature por viva.

**Ojo con los dos `SITE_URL`.** Son dos constantes distintas con valores distintos, y confundirlas
rompe cosas en silencio:

| Constante | Valor | Para qué |
|---|---|---|
| `lib/config/site.ts:9` | `https://tulugarengalicia.com` | canonical/OG — dominio propio, **todavía sin registrar** (S10) |
| `lib/admin/email.ts` → `EMAIL_BASE_URL` | `NEXT_PUBLIC_SITE_URL ?? vercel.app` | links dentro de mails — tienen que resolver **hoy** |

Si algún día se registra el dominio propio y se configura `NEXT_PUBLIC_SITE_URL`, los dos
convergen y este problema desaparece.

### 5.10 — ✅ RESUELTO — La skill `motion-tu-lugar-en-galicia` no existía (2026-08-10, `2e77963`)

> Creada en `.claude/skills/motion-tu-lugar-en-galicia/SKILL.md`, apuntando a
> `docs/adr/010-stack-animacion-interaccion.md` como fuente **sin duplicarlo**. Suma lo que el
> ADR no tiene reunido: el `BRAND_EASE` real leído del código (`[0.4, 0, 0.2, 1]`), los techos
> de duración de `DESIGN.md` §7, la tabla de qué está instalado y qué no (`lenis` sigue
> aprobado pero **sin instalar**), y un checklist.
>
> `.gitignore` extendido con la segunda excepción, sobre el patrón que estableció `e18a60f`.
> Verificado que no arrastra la colección instalada.
>
> **Con esto, las dos skills que `CLAUDE.md` daba por existentes existen de verdad.**

**Texto original del hallazgo (2026-08-09):**

**Mismo bug que §5.7, sin resolver.** Buscada en `.claude/skills/` y en `~/.claude/skills/`:
cero resultados. La exigen tres lugares: `CLAUDE.md:286` ("toda animación/transición nueva"),
`DESIGN.md:362` (duraciones máximas) y `docs/adr/010-stack-animacion-interaccion.md:85`, que
incluso indica dónde debería vivir (`.claude/skills/`).

Se detectó al resolver §5.7 y **se dejó fuera a propósito**, porque la decisión del usuario fue
sobre la skill de voz. Las salidas son las mismas dos: crearla (el contenido ya existe disperso
en `DESIGN.md` §7 y el ADR-010 — `BRAND_EASE`, ≤400 ms entradas, ≤200 ms micro-interacciones,
`prefers-reduced-motion` obligatorio, prohibido animar layout) o quitar las tres referencias.

Si se crea: **la excepción de `.gitignore` hay que ampliarla**, con el mismo cuidado de §5.7.

### 5.11 — ✅ RESUELTO (con una salvedad grande) — OG/Twitter cards (2026-08-10, `a4c4949`)

> Las 4 páginas pasan por `getNextMetadata()`. Verificado contra el servidor: `og:title`,
> `og:image`, `twitter:card` y `canonical` presentes en las cuatro.
>
> **El riesgo del cambio era el título, no el OG.** `getNextMetadata()` emite `title.absolute`,
> que **no pasa** por el template `'%s | Tu Lugar en Galicia'` de `app/layout.tsx`. Copiar a
> `PAGE_METADATA` el título corto que tenía cada página habría cambiado en silencio el título
> de 4 páginas publicadas. Los cuatro son los completos, y salen idénticos a antes.
>
> ### ⚠️ Esto todavía NO logra lo que lo justificaba — ver §5.16
>
> `og:image` apunta a `https://tulugarengalicia.com/og-default.jpg` y **ese dominio no
> resuelve**. Compartir por WhatsApp sigue sin mostrar imagen hasta que se registre el dominio.

**Texto original del hallazgo (2026-08-09):**

Aparecido al resolver SEO-03, y **deliberadamente fuera de aquel commit** por decisión del
usuario (el pedido era superficie mínima).

`/ciudades`, `/contacto`, `/comunidad` y `/comunidad/mapa` ahora tienen canonical, pero siguen
sin `openGraph` ni `twitter`. Las 13 que pasan por `getNextMetadata()` los tienen gratis vía
`buildOpenGraph()` (`lib/seo/og.ts`).

**Por qué importa más de lo que parece:** compartir `/comunidad/mapa` por WhatsApp muestra un
link pelado, sin imagen ni título. Este negocio se comparte por WhatsApp e Instagram entre
familias latinoamericanas — es el canal, no un extra.

**Fix:** sumar esas 4 a `PAGE_METADATA` y pasarlas por `getNextMetadata()` (camino 1 de §5.5).
Arrastra OG + Twitter y de paso unifica el enfoque en esas 4. Las 4 legales no lo necesitan.

### 5.12 — ✅ RESUELTO — `/api/comunidad/mensaje` no verificaba al remitente (2026-08-10, `df694b1`)

> **RECLASIFICADO DE 🟡 A 🟠 antes de arreglarlo.** El texto de abajo lo llamaba suplantación,
> "impacto menor que §5.6 porque no se escribe nada en la base". Mirando el flujo completo es
> algo peor: **una vía de cosecha del email de los miembros**, que es justo el dato que las
> migraciones 0002 y 0010 trabajaron para proteger.
>
> 1. el atacante elige un perfil del mapa, que es público;
> 2. manda un mensaje creíble con `replyTo: atacante@…`;
> 3. la persona responde de buena fe y su cliente manda la respuesta a esa casilla;
> 4. el atacante ya tiene su email personal.
>
> El endpoint devolvía por la puerta de atrás lo que 0002 sacó del alcance de la anon key, con
> la víctima colaborando sin saberlo.
>
> **El fix reusa la FORMA de §5.6, no su código.** Se descartó la lectura literal —exigir que
> el remitente sea miembro verificado— porque obligaría a registrarse en el mapa para
> escribirle a alguien: dos correos y tres pasos para mandar un hola. En cambio, el mensaje
> espera en un sobre firmado y se manda un enlace a la dirección declarada; solo al abrirlo se
> entrega. Así el `replyTo` es siempre una casilla demostradamente controlada por quien escribe.
>
> Efecto lateral bueno: **mata el spam**, que antes no requería controlar ningún buzón.
>
> **Fricción asumida:** suma un correo y un clic a mandar un mensaje, en una función pensada
> para ser liviana. Decisión consciente — el dato en juego es el email personal de gente que
> confió en el mapa.
>
> Dos cosas que aparecieron implementando: el destinatario se vuelve a buscar **al confirmar**
> (puede haberse dado de baja en el medio, algo que recién es posible desde el Toggle B), y un
> token manipulado **no consume el sobre** — un enlace mal copiado no puede costarle el mensaje
> a quien lo escribió.

**Texto original del hallazgo (2026-08-09):**

Ya estaba anotado dentro de §5.6 como "alcance de la revisión cuando se retome". Se deja como
pendiente propio porque §5.6 se cerró sin tocarlo, por decisión del usuario.

`remitenteEmail` llega del cliente sin verificación y va directo al `replyTo` del mail
([route.ts:118](../app/api/comunidad/mensaje/route.ts)). Se puede mandar un mensaje firmado con
el nombre y el email de un tercero: quien lo reciba responde a una casilla que el remitente real
eligió. Impacto menor que §5.6 —no se escribe nada en la base— pero es suplantación.

**Ahora tiene arreglo limpio, que antes no existía:** exigir que el remitente sea un miembro
verificado de la comunidad. Esa noción nació con §5.6.

### 5.13 — ✅ RESUELTO — el foco no volvía al cerrar el widget de Gina (2026-08-10, `09884d3`)

> ## ⚠️ El hallazgo original de esta sección era FALSO
>
> El título decía "el widget de Gina borra la página entera del árbol de accesibilidad".
> **No es cierto, y conviene entender por qué antes de volver a auditar accesibilidad acá.**
>
> Medido el 2026-08-10 con el árbol de accesibilidad **real**, vía CDP (Chrome DevTools
> Protocol), en los dos estados:
>
> | Widget | Árbol real |
> |---|---|
> | **Cerrado** (por defecto) | Página completa: los 11 campos del formulario, labels, checkboxes, submit, header, footer. Gina **ausente** — `aria-hidden` + `inert` funcionan |
> | **Abierto** | Página completa **más** el diálogo marcado `modal`. Nada se colapsa |
>
> **De dónde salió el error:** la herramienta `read_page` del MCP de navegador construye su
> propio árbol desde el DOM, no el de accesibilidad, y mostraba **exactamente lo inverso de la
> realidad** — incluía el widget `aria-hidden`+`inert` y omitía el formulario visible. Se
> confirmó con un A/B: se quitó `aria-modal` en caliente y el formulario **siguió sin aparecer**,
> o sea que ni siquiera era la causa de lo que la herramienta mostraba.
>
> Es el mismo género que los 12 falsos positivos que ya documenta `CLAUDE.md` §9. **Van 13.**
> Para juzgar accesibilidad en este repo: usar el árbol de CDP, no una heurística sobre el DOM.
>
> ### El bug real, que era otro y más chico — resuelto en `09884d3`
>
> Al cerrar, el foco se quedaba sobre el botón de cerrar, que en ese mismo instante pasa a
> estar dentro de un contenedor `inert` + `aria-hidden`. Para quien navega por teclado, cerrar
> dejaba el foco en el limbo (`volvioAlTrigger: false`). El patrón ARIA de diálogo exige
> devolverlo al disparador.
>
> Fix: se guarda `document.activeElement` al abrir y se restaura al cerrar, más `aria-modal`
> condicional (antes se declaraba también con el panel cerrado). No se tocó nada de la lógica
> de conversación.
>
> **Un detalle que solo aparece midiendo:** la primera versión restauraba el foco solo si
> seguía dentro del diálogo, y no funcionaba nunca — cuando el contenedor recibe `inert` el
> navegador desenfoca su contenido en el acto, así que el foco ya está en `body` y esa
> condición jamás se cumple. La versión final restaura si nadie más lo reclamó.
>
> Severidad real: 🟡, no 🟠. Molestia de teclado, no barrera.

**Texto original del hallazgo (2026-08-09) — conservado porque su parte descriptiva sigue
siendo cierta, pero su conclusión no:**

`components/gina/GinaWidget.tsx` renderiza un `<div aria-modal="true">` que es **flotante**
(`fixed bottom-6 right-6 z-50`), no un diálogo modal. `aria-modal="true"` le dice a la
tecnología asistiva que todo lo que está fuera de ese nodo no existe.

**Efecto medido** (2026-08-09, sobre el DOM real de `/comunidad`): con el widget abierto, el
formulario de registro completo —672×1233 px, perfectamente visible en pantalla, sin un solo
ancestro con `aria-hidden`— **desaparece del árbol de accesibilidad**. Para quien navega con
lector de pantalla, con Gina abierta el resto de la página no está.

Se descubrió de casualidad: las herramientas de automatización no encontraban los campos del
formulario aunque el DOM los tenía.

**Fix probable:** quitar `aria-modal="true"` (es un panel flotante, no un modal) o convertirlo
en un modal de verdad con foco atrapado y fondo inerte. Lo primero es casi seguro lo correcto.

**No se tocó** porque `DESIGN.md` §7 prohíbe tocar `components/gina/**` fuera de forma/color/
animación. Requiere una tarea propia con el `Accessibility Auditor`.

### 5.15 — 🟢 Riesgo residual aceptado: canal lateral de tiempo en `/api/comunidad/gestionar/solicitar` (2026-08-09)

**Aceptado, no pendiente de arreglo.** Decisión del usuario al mergear `78c2373`. Se documenta
para que no se "descubra" de nuevo en una auditoría futura y se trate como hallazgo.

**El mecanismo.** El endpoint que manda el enlace de gestión responde `{ok:true}` 200 exista o
no un perfil con ese email — eso es correcto y deliberado, y evita convertirlo en un oráculo de
quién está en el mapa. Pero los dos caminos **no tardan lo mismo**: el de perfil existente crea
una sesión en Redis y llama a Resend, y eso son cientos de milisegundos más. Alguien que mida
con cuidado, repitiendo, puede distinguir un email registrado de uno que no lo está.

**Por qué se acepta.** Es el mismo tipo de riesgo que A09 (token en query string) y la misma
lectura: el dato que se filtra es "esta persona está en el mapa de comunidad", el ataque exige
medición estadística sobre un endpoint con rate limit de 3 cada 10 minutos por IP, y el mapa ya
es público —lo que no es público es la correspondencia con el email—.

**Qué costaría cerrarlo, si algún día cambia la evaluación.** Dos caminos, los dos con precio:

1. No esperar al envío del mail (`void sendEmail(...)`) para que ambos caminos vuelvan igual de
   rápido. Precio: se pierde la detección de fallos de Resend, y hoy ese `catch` es lo único que
   avisa si los correos dejaron de salir.
2. Retardo artificial hasta un piso fijo. Precio: complejidad y un número mágico que hay que
   mantener cuando cambie la latencia de Resend.

Ninguno es gratis, y por eso no se hizo junto con la feature.

### 5.16 — 🟠 `og:image` apunta a un dominio que no resuelve — atado a S10 (2026-08-10)

**Se resuelve solo el día que se registre `tulugarengalicia.com`. No hay nada que arreglar en
el código, y tocarlo sería contraproducente.**

`lib/seo/og.ts` arma `og:image` como `${SITE_URL}/og-default.jpg`, con `SITE_URL` =
`https://tulugarengalicia.com` (`lib/config/site.ts:9`). Medido el 2026-08-10:

```
https://tulugarengalicia.com/og-default.jpg      -> 000 (no resuelve)
https://tu-lugar-en-galicia.vercel.app/…jpg      -> 200
```

**Consecuencia:** las 17 páginas que emiten OG tienen las etiquetas correctas, pero **ningún
cliente puede traer la imagen**. Compartir por WhatsApp muestra un link sin miniatura — que es
exactamente lo que §5.11 vino a arreglar y todavía no arregla. Y el canal importa: este negocio
se comparte por WhatsApp e Instagram entre familias latinoamericanas.

**Por qué NO se cambia al dominio de Vercel:** arreglaría hoy y rompería el día de la
migración, y encima dejaría las URLs de OG apuntando a un dominio que no es el canónico. Es el
mismo par de constantes de §5.9 (`SITE_URL` de SEO vs. `EMAIL_BASE_URL` de mails), con la
diferencia de que ahí sí hacía falta el fallback porque un enlace de correo tiene que resolver
hoy; una etiqueta OG puede declarar el dominio futuro.

**Al cerrar S10, verificar:** que la imagen dé 200 en el dominio propio, y pasar una URL por el
validador de enlaces de WhatsApp o Facebook antes de darlo por hecho.

### 5.17 — 🟢 Nota de arquitectura: el primitivo de sobres firmados (2026-08-10)

No es un pendiente. Es un puntero, para que quien agregue el cuarto flujo de "te mando un
enlace por mail" no escriba un cuarto módulo.

`lib/comunidad/sobreFirmado.ts` (`16de977`) concentra la mecánica: payload en Redis bajo un uuid
opaco + token HMAC que prueba que ese uuid lo emitió el servidor. Tres flujos lo usan y difieren
solo en tres parámetros:

| Flujo | dominio | TTL | ¿consume al leer? |
|---|---|---|---|
| Alta de perfil (§5.6) | `pendiente` | 24 h | sí |
| Gestión de perfil (Toggle B) | `gestion` | 1 h | no |
| Mensaje privado (§5.12) | `mensaje` | 1 h | sí |

**Dos cosas que no se pueden tocar sin romper cosas vivas:**

1. **El formato de la clave y del sujeto.** `comunidad:<dominio>:<uuid>` (dos puntos) y
   `comunidad-<dominio>:<uuid>` (guion). La asimetría es fea y es deliberada: hay sobres en
   producción en todo momento y enlaces ya enviados por correo. Cambiar la clave los deja
   huérfanos; cambiar el sujeto invalida los tokens ya firmados.
2. **El prefijo de dominio.** Es lo único que impide que un token de un flujo valga en otro —
   los tres firman uuids con el mismo `INTERNAL_API_SECRET`, y los ids de leads en Supabase
   también son uuid, así que la colisión alcanzaría a los tokens de admin. Hay tests que cubren
   la matriz completa; si se ponen rojos, es esto.

### 5.18 — 🟢 Los fines de línea de `.gitignore` (2026-08-10)

Nota de método, para no volver a analizarlo desde cero.

`.gitignore` estaba **mixto** (55 líneas CRLF + 20 LF). Cada vez que se edita desde una
herramienta de este entorno, la cola del archivo se renormaliza a CRLF y el diff muestra ~28
líneas fantasma —borradas y re-añadidas idénticas— por un cambio de una línea. Pasó dos veces:
en `e18a60f` se corrigió antes de commitear reescribiendo el archivo con los bytes originales;
en `2e77963` se detectó **después** del push y se decidió dejarlo (opción 1), porque un commit
correctivo agregaría otras 28 líneas de churn para arreglar algo cosmético.

`core.autocrlf` está en `false` y no hay `.gitattributes`, así que git guarda los bytes tal
cual. El archivo hoy es 100% CRLF.

**Sugerencia de prevención, NO aplicada** (pendiente de evaluación): un `.gitattributes` con
una sola línea —`.gitignore text eol=lf`— haría que git normalice ese archivo y el problema
desaparezca para siempre. Precio: fuerza **una** renormalización ruidosa la próxima vez que se
toque, y después nunca más. No se aplicó porque merece decidirse en frío, no de paso.

### 5.14 — Rediseño de `/comunidad/mapa` (producto — baja prioridad, sin fecha)

**Idea de Marcelo, para más adelante. No bloquea nada de lo actual y no es un defecto:** la
página funciona, está verificada end-to-end y cumple su función. Esto es querer que se vea y se
sienta mejor.

Alcance a definir cuando se retome — hoy es una intención, no una especificación:

- **Hero** de la página del mapa.
- **Layout del mapa**: tamaño, proporción, cómo convive con el resto de la página.
- **Presentación de los pines**: cómo se muestran los participantes, la tarjeta de perfil, el
  clustering, el estado de "poca gente todavía".

**Dato medido que importa para el diseño de los pines:** Nominatim **no es determinista** para
intersecciones. Las dos altas de prueba del 2026-08-09 usaron exactamente el mismo cruce (Rúa do
Príncipe × Rúa Urzáiz, Vigo) y cayeron a unos **700 m** una de otra:

```
prueba 1:  42.2340291,  -8.7123304
prueba 2:  42.23590405, -8.7202204
```

No es un defecto ni un riesgo: la imprecisión es el objetivo, y más varianza es más privacidad,
no menos. Pero tiene dos consecuencias de diseño reales:

1. **Dos personas que escriben el mismo cruce no caen en el mismo punto.** Cualquier idea que
   asuma "misma esquina = mismo pin" (agrupar por ubicación, detectar vecinos, "hay 3 personas
   en tu esquina") no se sostiene sobre este geocoder.
2. **El copy promete un "círculo de privacidad de unos 200 metros"** (`FormularioComunidad.tsx`).
   Eso describe la intención del producto, no la varianza real del geocoding, que es varias veces
   mayor. Si el rediseño llega a dibujar el círculo en el mapa, ojo con prometer una precisión
   que el dato no tiene.

Cuando se retome, tres cosas que ya están decididas y no conviene re-litigar:

1. La ubicación es **aproximada a propósito** (círculo de privacidad de ~200 m). Ningún rediseño
   puede aumentar la precisión visual de un pin.
2. El teléfono **no se muestra nunca por defecto** — depende de `mostrar_contacto` (PII-01,
   migración 0010). El camino de contacto por defecto es el mensaje privado.
3. Todo copy nuevo pasa por la skill `voz-tu-lugar-en-galicia` (§5.7).

Agentes naturales para la tarea: `UI Designer` + `Brand Guardian` + `Frontend Developer`, con
`Accessibility Auditor` al cierre. **Ojo:** si el rediseño toca el widget de Gina o convive con
él, ver §5.13 antes.

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
| `AIRTABLE_API_KEY` | Eliminada — el puente de Comunidad que la usaba se retiró el 2026-07-16 | — | — | ❌ Eliminada de `.env.local.example` (Fase 5 de retiro de Airtable) |
| `AIRTABLE_BASE_ID` | Eliminada — mismo motivo | — | — | ❌ Eliminada de `.env.local.example` |
| `AIRTABLE_TABLE_NAME` | Eliminada — huérfana desde que leads migró a Supabase el 2026-07-12 | — | — | ❌ Eliminada de `.env.local.example` |
| `AIRTABLE_COMUNIDAD_TABLE_NAME` | Eliminada — el puente de Comunidad que la usaba se retiró el 2026-07-16 | — | — | ❌ Eliminada de `.env.local.example` |
| `GEMINI_API_KEY` | IA Gina (servidor only) | ✅ Verificar vigente | — | ✅ |
| `INTERNAL_API_SECRET` | Auth endpoints admin + HMAC | ✅ Rotado y verificado HTTP 200 producción (R3 resuelto 2026-07-03) | ✅ Verificado | ✅ |
| `RESEND_API_KEY` | Envío de emails | ✅ Configurada | — | ✅ |
| `SILVANA_EMAIL` | Destino mails internos | ✅ Configurada | — | ✅ |
| `CALCOM_WEBHOOK_SECRET` | Firma HMAC webhook Cal.com | ✅ Configurada (creada hace ~5 días) | — | ✅ |
| `CRON_SECRET` | Auth cron Vercel | ✅ Configurada | — | ✅ |
| `UPSTASH_REDIS_REST_URL` | Rate limiting — 7 endpoints, fail-closed | ✅ Configurada (sesión 2026-07-02) | — | ✅ (añadida al example 2026-08-01, A11 resuelto) |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting — 7 endpoints, fail-closed | ✅ Configurada (sesión 2026-07-02) | — | ✅ (añadida al example 2026-08-01, A11 resuelto) |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio | ❌ No configurada | — | ✅ |
| `AEMET_API_KEY` | Clima AEMET | ✅ Configurada | — | ✅ |
| `SHEET_MARCADOR_ID` | Google Sheets El Marcador | ⚠️ Pendiente Silvana | — | ✅ |
| ~~`NEXT_PUBLIC_BEHOLD_WIDGET_ID`~~ | ~~Feed Instagram~~ | **Obsoleta (2026-08-11)** — Behold.so se abandonó; hoy el feed es Graph API + Supabase. Cero referencias en código | — | — |
| `INSTAGRAM_APP_ID` / `INSTAGRAM_APP_SECRET` | Feed Instagram (Graph API vía Facebook Login) | ⚠️ En `.env.local`; sin verificar en Vercel | — | — |
| `INSTAGRAM_EXPECTED_IG_USER_ID` | Fija la cuenta de IG esperada (IG-01, auditoría 2026-08-08) | ❌ Pendiente — cargar tras la primera conexión | — | — |
| `CALCOM_API_KEY` | Cal.com gestión slots (Pieza 7) — nunca implementada | ❌ No configurada | — | ❌ Eliminada de `.env.local.example` (2026-08-01, A12 resuelto) |
| `DATABASE_URL` | BD (Fase 5 — no usar aún) | — | — | ✅ |
| `STRIPE_SECRET_KEY` | Pagos (Fase 6) | — | — | ✅ |

> ✅ `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` ya están en `.env.local.example` (A11 resuelto el 2026-08-01). Ojo con la descripción vieja "rate limiting Gina": son **7** los endpoints que dependen de ellas y todos son fail-closed, así que sin estas dos variables el cuestionario de Gina y el formulario de contacto responden 503.

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
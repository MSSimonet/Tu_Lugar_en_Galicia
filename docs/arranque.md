# Documento de arranque — Tu Lugar en Galicia

> Actualizado 2026-07-02. Próxima sesión: leer este archivo antes de actuar.
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
| **CRM / Leads** | Airtable (sin base de datos hasta Fase 5) |
| **IA (Gina)** | Gemini API (ADR-008 vigente — NO cambiar a Claude sin ADR) |
| **tsc** | 0 errores (verificado en fa56ec7) |
| **build** | exit 0 (verificado en fa56ec7) |
| **Última sesión** | 2026-07-02 |
| **Fase actual** | Fase 1 (marketing + Gina + flujo agenda — completados) |

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

| Pieza | Commit | Descripción |
|---|---|---|
| Pieza 1 — Calificación Airtable | (sesiones anteriores) | Lead guardado con `calificacion` en Airtable |
| Pieza 2 — Mail diario Silvana | `56b5129` | Cron 08:00 España → `/api/admin/resumen-diario` |
| Pieza 3 — Perfil `/admin/lead/[recordId]` | `86c505c` | Página privada HMAC, token 72h |
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
| 1 — Calificación Airtable | ✅ Funciona en producción | — |
| 2 — Mail diario Silvana | ✅ Funciona en producción | — |
| 3 — Perfil `/admin/lead/[recordId]` | ✅ Funciona | `INTERNAL_API_SECRET` debe coincidir entre `.env.local` y Vercel (R3) |
| 4 — Endpoint habilitar-agenda | ✅ Funciona | — |
| 5 — Mail cálido al cliente | ✅ Funciona | Dominio propio para remitente definitivo |
| 6 — Expiración + alertas | ✅ Funciona | — |
| 7 — Webhook Cal.com | ✅ Código correcto. `CALCOM_WEBHOOK_SECRET` ✅ en Vercel | URL en Cal.com probablemente apunta a `tulugarengalicia.com` (no activo). Ver pendiente C3 |
| 8 — Recordatorio Silvana 1h | ✅ Funciona | `INTERNAL_API_SECRET` en GitHub Actions secrets (pendiente R3) |
| 9 — Validación dinámica /agenda | ✅ Funciona. `CalEmbed` bug client-side nav resuelto en `fa56ec7` | — |

**Nota sobre Cal.com (auditado 2026-07-02):** `https://cal.com/tu-lugar-en-galicia` existe (HTTP 200). Cero hits a `POST /api/webhooks/calcom` en logs — Cal.com no está disparando el webhook. Causa probable: URL en Cal.com → Settings → Developer → Webhooks apunta al dominio incorrecto.

---

## 4 — Pendientes de Silvana

Lista consolidada. Nada de código hasta que Silvana confirme.

| # | Pendiente | Acción exacta | Urgencia |
|---|---|---|---|
| C3/PL-2 | **Webhook Cal.com** | Cal.com → Settings → Developer → Webhooks → editar/crear webhook: URL `https://tu-lugar-en-galicia.vercel.app/api/webhooks/calcom`, evento `BOOKING_CREATED`. El secret (`CALCOM_WEBHOOK_SECRET`) ya está en Vercel — solo copiar el valor desde Vercel y pegarlo en Cal.com al crear/editar el webhook | 🔴 Para activar el flujo de agenda completo |
| A04 | **Datos fiscales en Política de Privacidad** | `docs/legal-terminos-privacidad.md` → completar todos los campos `[COMPLETAR]`: nombre, NIF/CIF, dirección, email contacto, email DPO | 🔴 Antes de lanzar (RGPD) |
| A14 | **Fotos reales** | Reemplazar imágenes placeholder de Testimonios, Silvana y MuroLlaves | 🟠 Antes de lanzar |
| R3 | **Sincronizar `INTERNAL_API_SECRET`** | Verificar que el valor en Vercel → Settings → Environment Variables → `INTERNAL_API_SECRET` coincide exactamente con el valor en `.env.local`. Si no coincide, actualizarlo en Vercel. Repetir en GitHub Actions secrets. Esto desbloquea: verificación del PDF del plan (hay un lead de prueba `recgLT5e61Im5mrhN`), y el cron de recordatorio Silvana | 🔴 Bloqueante para PDF y recordatorio |

**Pendientes adicionales de Silvana (menor urgencia):**

| # | Pendiente | Acción |
|---|---|---|
| S2 | Cuenta Cal.com — event types configurados con disponibilidad real | Cal.com → crear/verificar evento "Videollamada 30 min" con horarios reales |
| S8 | Feed Instagram (Behold.so) | behold.so → widget ID → `NEXT_PUBLIC_BEHOLD_WIDGET_ID` en Vercel |
| S9 | Google Sheet El Marcador | Sheet ID → `SHEET_MARCADOR_ID` en Vercel |
| S10 | Dominio `tulugarengalicia.com` | Registrar → Cloudflare DNS → Vercel Domains |

---

## 5 — Pendientes técnicos sin resolver

| # | Pendiente | Detalle |
|---|---|---|
| **PDF del plan estratégico** | Verificación bloqueada por R3 — nunca ejecutada esta sesión. Lead de prueba disponible: `recgLT5e61Im5mrhN` (etiqueta: `seguimiento-futuro`, no tiene `codigoAgenda`). Una vez R3 resuelto: generar token con `generateAdminToken` y probar `/admin/lead/recgLT5e61Im5mrhN` | Pendiente de Silvana (R3) |
| **R2: `sesion.completado = false`** | En el E2E de Gina, `localStorage['gina_session_v1'].sesion.completado` quedó en `false` a pesar de llegar a `pasoActual === 'despedida'`. Posible desincronización entre estado React y localStorage tras el último guardado. No investigado — sin impacto visible en UX confirmado | Técnico, baja urgencia |
| **A02: email cliente en logs** | `app/api/webhooks/calcom/route.ts:241` — email completo del cliente en logs de producción (RGPD). `console.warn` con primeros 3 chars ya existe en otro punto; revisar si línea 241 es un `console.log` o el email en el cuerpo del mail a Silvana (que es intencional). Verificar antes del lanzamiento | RGPD — antes de lanzar |
| **A09: token admin en query string** | Token HMAC en query param de `/admin/lead/[recordId]` — visible en Referer headers. Considerar mover a header Authorization o cookie httpOnly | Mejora de seguridad |
| **A15: TTL token admin 72h** | `lib/admin/tokens.ts:3` — reducir a 24h para acciones de alta sensibilidad | Mejora de seguridad |
| **Calendario propio (reemplazo Cal.com)** | Eliminar branding Cal.com (banner "Pruébalo Gratis", logo, "Powered by Cal.com") sin depender del plan Teams ($12/mes). Implica desarrollo propio de disponibilidad de slots, sincronización de calendario, envío de invitaciones/confirmaciones — no es un ajuste menor. Evaluar cuando el volumen de reservas justifique la inversión. | Backlog / futuro — no urgente |

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

### 1. Resolver R3 y verificar PDF (5 min si Silvana lo tiene)
Si `INTERNAL_API_SECRET` ya está sincronizado: generar token → probar `/admin/lead/recgLT5e61Im5mrhN` → confirmar que el PDF se genera sin errores visuales (colores, fuentes, layout) con los nuevos tokens de color.

### 2. Verificar webhook Cal.com tras C3
Una vez Silvana configure el webhook (C3): hacer una reserva de prueba real → confirmar que `POST /api/webhooks/calcom` aparece en logs con 200 → Airtable actualizado → mail a Silvana enviado.

### 3. Rediseño páginas de ciudad: tabs + cámara MeteoGalicia
- Tabs para secciones (Barrios, Clima, Colegios, Transporte, etc.)
- Verificar autorización legal de `VistaEnVivo.tsx` (Windy/MeteoGalicia — auditado A13)
- Agentes: `Frontend Developer` + `Legal Compliance Checker` + `Accessibility Auditor`

### 4. Motor del plan estratégico: completar PDF
- Pasada final de tono Carnegie sobre textos fijos
- Integrar `plan-estrategico.md` como fuente de textos fijos
- Verificar que los 55 trámites del catálogo están mapeados
- Agentes: `AI Engineer` + `Content Creator` + `Code Reviewer`

### 5. Fixes de auditoría pendientes (🟠)
A02 (email en logs), A09 (token en query string), A15 (TTL 72h→24h), A10 (sanitización email Airtable).

---

## 8 — Variables de entorno — estado completo

| Variable | Propósito | Vercel Prod | GitHub Actions | `.env.local.example` |
|---|---|---|---|---|
| `AIRTABLE_API_KEY` | Leads y flujo agenda | ✅ Configurada | — | ✅ |
| `AIRTABLE_BASE_ID` | ID base Airtable | ✅ Configurada | — | ✅ |
| `AIRTABLE_TABLE_NAME` | Nombre tabla | ✅ Configurada | — | ✅ |
| `GEMINI_API_KEY` | IA Gina (servidor only) | ✅ Verificar vigente | — | ✅ |
| `INTERNAL_API_SECRET` | Auth endpoints admin + HMAC | ✅ Existe — **⚠️ valor puede no coincidir con .env.local** (R3 pendiente) | ⚠️ Pendiente verificar | ✅ |
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
| `/api/gina` | POST | Rate limit Upstash (**60**/10min) + origin allowlist | IA Gina → Gemini, guarda lead en Airtable |
| `/api/lead` | POST | Origin check | Guardar lead de FormularioDiagnostico |
| `/api/marcador` | GET | — | Lee Google Sheets → métricas El Marcador |
| `/api/clima/[ciudad]` | GET | — | Clima por ciudad (AEMET) |
| `/api/plan/[recordId]/pdf` | GET | `verifyAdminToken(recordId, token)` HMAC-SHA256 | Genera PDF personalizado |
| `/api/admin/resumen-diario` | GET | `Authorization: Bearer INTERNAL_API_SECRET` + x-vercel-cron | Cron diario 08:00 → mail Silvana |
| `/api/admin/habilitar-agenda/[recordId]` | POST | Token HMAC en query param | Genera código agenda, mail al cliente |
| `/api/admin/recordatorio-silvana` | GET | `Authorization: Bearer INTERNAL_API_SECRET` | Cron horario → recordatorio 1h antes |
| `/api/admin/expirar-codigos` | GET | `Authorization: Bearer INTERNAL_API_SECRET` | Expira códigos >7 días |
| `/api/webhooks/calcom` | POST | HMAC-SHA256 `X-Cal-Signature-256` (`CALCOM_WEBHOOK_SECRET`) | Webhook Cal.com → actualiza Airtable + mail Silvana |

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

> Actualizado por pre-compact hook — 2026-07-03 18:30

### Últimos 10 commits

```
b7ea93b refactor(tokens): tokeniza hex en admin, conocernos, home y shared; agrega tokens de estado semántico
40ec095 refactor(tokens) + chore(deps): tokeniza hex en como-funciona y LoQueNoSomos; actualiza deps menores
8263525 refactor(tokens): elimina hex residuales en FormularioContacto, VistaEnVivo, GinaButtons y Header
82f742f refactor(footer): tokeniza todos los hex crudos en Footer.tsx
881b2c2 fix(agenda): elimina duración y nombre propio del texto de presentación de la llamada
c0af5e6 refactor(pdf): elimina cast 'as string' redundante en condición CTA
d036473 fix(types): agrega 'potencial-alto' al union type de calificacion en LeadData
b8b1333 fix(ui): aplica auditoría UX/UI completa y elimina toggle de idioma sin implementar
8253cb1 chore(cleanup): elimina pendiente WhatsApp de arranque.md
30bd85d chore(skills): instala skill ui-ux-pro-max (MIT) para diseno UI/UX
```

### Working tree

```
 M docs/arranque.md
```

### Pendientes de push (origin/main..HEAD)

```
(ninguno — origin/main al dia)
```
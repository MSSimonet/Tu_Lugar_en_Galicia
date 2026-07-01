# Documento de arranque — Tu Lugar en Galicia

> Generado automáticamente el 2026-07-01. Próxima sesión: leer este archivo antes de actuar.
> Fuentes: CLAUDE.md, docs/spec-flujo-agenda.md, git log, .env.local.example, docs/*.md.

---

## 1 — Estado del proyecto

| Parámetro | Valor |
|---|---|
| **Stack** | Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Vercel |
| **URL producción** | `https://tu-lugar-en-galicia.vercel.app` (dominio `tulugarengalicia.com` pendiente) |
| **Rama activa** | `main` (limpia, sin cambios pendientes) |
| **Auto-deploy** | Vercel ← GitHub `main` |
| **CDN / DNS / SSL** | Cloudflare (pendiente: apuntar dominio propio) |
| **CRM / Leads** | Airtable (sin base de datos hasta Fase 5) |
| **IA (Gina)** | Gemini API (ADR-008 vigente — NO cambiar a Claude sin ADR) |
| **tsc** | 0 errores (último commit verificado) |
| **lint (ESLint)** | 0 errores en fuentes |
| **build** | exit 0 |
| **Lighthouse / Unlighthouse** | Sin scores recientes registrados — pendiente de correr contra URL producción |
| **Última sesión** | 2026-07-01 |
| **Fase actual** | Fase 1 (marketing + Gina + flujo agenda — completados) |

---

## 2 — Lo que se implementó en las últimas sesiones

### Flujo de agenda — 9 piezas completas

| Pieza | Commit | Descripción |
|---|---|---|
| Pieza 1 — Calificación Airtable | (sesiones anteriores) | Lead guardado con `calificacion` en Airtable |
| Pieza 2 — Mail diario Silvana | `56b5129` | Cron 08:00 España → `/api/admin/resumen-diario` con tarjetas por lead |
| Pieza 3 — Perfil `/admin/lead/[recordId]` | `86c505c` | Página privada HMAC, token 72h, todos los campos del lead |
| Pieza 4 — Endpoint habilitar-agenda | `2e3cba0` | POST `/api/admin/habilitar-agenda/[recordId]` — genera código 8 chars, guarda en Airtable, dispara mail |
| Pieza 5 — Mail cálido al cliente | `2e3cba0` | Template en `lib/admin/email.ts`, voz Silvana, código personal, link `/agenda?code=` |
| Pieza 6 — Expiración + alertas | `0e7d320` | Cron diario expira códigos >7 días, alerta en resumen Silvana |
| Pieza 7 — Webhook Cal.com | `0b18d37` | `app/api/webhooks/calcom/route.ts` — HMAC CALCOM_WEBHOOK_SECRET, procesa BOOKING_CREATED, actualiza Airtable |
| Pieza 8 — Recordatorio Silvana 1h antes | `0b18d37` + `49d8e3e` | `/api/admin/recordatorio-silvana` · cron horario en **GitHub Actions** (`recordatorio-silvana.yml`) |
| Pieza 9 — Validación dinámica /agenda | `8796142` | Valida código contra Airtable (no array hardcodeado); verifica no expirado y no usado |

### Fixes de auditoría 2026-06-28

| Commit | Severidad | Descripción |
|---|---|---|
| `c90cba5` | 🔴 Críticos × 8 | IDOR en `/api/plan/pdf` (auth HMAC), rate limiting fail-closed en Gina, presupuesto lookup corregido en emails |
| `8fb5d7c` | 🟠 Altos × 13 | CSP + HSTS en `middleware.ts` y `vercel.json`, consentimientoRGPD dinámico, focus traps, aria-labels, botón pausa video hero, contraste Button fantasma, required en formularios |
| `dd6345d` | 🟡 Medios × 7 | EMAIL_REGEX robusta, sr-only en todos los `target="_blank"`, aria-hidden GinaWidget, aria-controls condicional Header, h2 sobre-silvana, INTERNAL_API_SECRET rotado |
| `e10e881` | 🔒 Seguridad | Referrer-Policy no-referrer en rutas admin y webhooks |

### Fixes visuales

| Commit | Descripción |
|---|---|
| `2722e97` | 4 fixes UI — LoQueNoSomos, ciudades dark mode, sobre-silvana, footer |

### Motor del plan estratégico (PDF personalizado)

| Commit | Descripción |
|---|---|
| `6478857` | **11 fixes**: path bug `tramites-galicia.md`, trámites [46][47] para `nacionalidad-en-tramite`, sección económica personalizada con presupuesto+garantías, barra contexto en PDF, contradicción turista resuelta, fallback `{{PAIS_ORIGEN}}`, frases [40][41] condicionales, nota urgencia `fechaLlegada < 1 mes`, nota `necesidadesEspeciales`, nota familia mixta UE, CLAUDE.md A01 ✅ |
| `a14360c` | **2 fixes**: nota familias mixtas UE/extracomunitario para trámite [9], bloque herramientas digitales SERGAS [33][34][35] en Fase E |

### Infraestructura de desarrollo

| Commit | Descripción |
|---|---|
| `f9f4e97` | `DESIGN.md` — sistema de diseño completo (paleta, tipografía, componentes, layout, responsive, prompts de agente) |
| `0631155` | `CLAUDE.md §11` — orquestación permanente de recursos y agentes |
| `d8f240c` | Hook `SessionStart` — consolidación automática de contexto al iniciar sesión |
| ECC (sin commit repo) | 148 archivos instalados en `~/.claude/hooks/`, rules/ecc/common + typescript, 8 skills globales |
| agency-agents (sin commit repo) | 222 agentes instalados en `~/.claude/agents/` |

---

## 3 — Estado del flujo de agenda

**Las 9 piezas están 100% implementadas en código.** Lo que falta son configuraciones manuales.

| Pieza | Estado código | Bloqueado por |
|---|---|---|
| 1 — Calificación Airtable | ✅ Funciona | — |
| 2 — Mail diario Silvana | ✅ Funciona | `SILVANA_EMAIL` en Vercel · `INTERNAL_API_SECRET` actualizado en Vercel · `RESEND_API_KEY` en Vercel |
| 3 — Perfil `/admin/lead/[recordId]` | ✅ Funciona | Necesita `INTERNAL_API_SECRET` en Vercel para verificar tokens |
| 4 — Endpoint habilitar-agenda | ✅ Funciona | `RESEND_API_KEY` + `SILVANA_EMAIL` en Vercel |
| 5 — Mail cálido al cliente | ✅ Funciona | Dominio propio para remitente `silvana@tulugarengalicia.com` (funciona con dominio Resend como fallback hasta entonces) |
| 6 — Expiración + alertas | ✅ Funciona | Mismo que Pieza 2 |
| 7 — Webhook Cal.com | ✅ Funciona | `CALCOM_WEBHOOK_SECRET` en Vercel + configurar webhook en Cal.com apuntando a `https://tulugarengalicia.com/api/webhooks/calcom` |
| 8 — Recordatorio Silvana 1h | ✅ Funciona | `INTERNAL_API_SECRET` en **GitHub Actions** secrets (Settings → Secrets → Actions) |
| 9 — Validación dinámica /agenda | ✅ Funciona | `AIRTABLE_API_KEY` + `AIRTABLE_BASE_ID` + `AIRTABLE_TABLE_NAME` en Vercel |

**Lo que activa el dominio `tulugarengalicia.com` cuando llegue:**
1. Cambiar remitente Resend de fallback a `silvana@tulugarengalicia.com` en `lib/admin/email.ts`
2. Actualizar `NEXT_PUBLIC_SITE_URL` en Vercel a `https://tulugarengalicia.com`
3. Configurar webhook Cal.com con la URL definitiva (Pieza 7)
4. Activar tracking de apertura de mails (Pieza 6) vía webhook Resend → campo `mailAbierto` en Airtable

**Campos Airtable que Silvana debe crear manualmente** (todos Single line text):
`citaAgendada` · `fechaCita` · `horaCita` · `plataformaVideollamada` · `codigoAgenda` · `fechaHabilitacion`

---

## 4 — Pendientes de Silvana

| # | Pendiente | Instrucción exacta | Urgencia |
|---|---|---|---|
| S1 | **Número de WhatsApp real** | Ir a `lib/config/site.ts` → constante `WHATSAPP_NUMBER` → reemplazar por número real con código de país sin espacios (ej: `34612345678`). Mismo archivo: `WHATSAPP_MESSAGE` | 🔴 Antes de lanzar |
| S2 | **Cuenta Cal.com + link** | Crear cuenta en cal.com → configurar evento "Videollamada 30 min" → copiar slug → pegar en `lib/config/site.ts` constante `CALCOM_LINK` (ej: `"https://cal.com/silvana-tu-lugar/videollamada"`) | 🔴 Antes de lanzar |
| S3 | **Variables de entorno en Vercel** | Vercel → proyecto → Settings → Environment Variables → agregar: `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_NAME`, `RESEND_API_KEY`, `SILVANA_EMAIL`, `INTERNAL_API_SECRET` (valor actual de `.env.local`), `CALCOM_WEBHOOK_SECRET` | 🔴 Antes de lanzar |
| S4 | **Secret INTERNAL_API_SECRET en GitHub Actions** | GitHub → repo → Settings → Secrets and variables → Actions → New repository secret → nombre: `INTERNAL_API_SECRET` → mismo valor que en `.env.local` | 🔴 Para que funcione el recordatorio horario |
| S5 | **Campos nuevos en Airtable** | En la tabla de leads de Airtable, crear 6 campos tipo "Single line text": `citaAgendada`, `fechaCita`, `horaCita`, `plataformaVideollamada`, `codigoAgenda`, `fechaHabilitacion` | 🔴 Para que funcione el flujo agenda |
| S6 | **Webhook en Cal.com** | Cal.com → Settings → Developer → Webhooks → Create Webhook → URL: `https://tu-lugar-en-galicia.vercel.app/api/webhooks/calcom` → Events: BOOKING_CREATED → copiar el secret → pegar en `CALCOM_WEBHOOK_SECRET` de Vercel | 🟠 Cuando Cal.com esté configurado |
| S7 | **Política de privacidad — datos fiscales** | Ir a `docs/legal-terminos-privacidad.md` → completar todos los campos marcados como `[COMPLETAR]`: nombre, NIF/CIF, dirección, email de contacto, email DPO | 🔴 Antes de lanzar (RGPD) |
| S8 | **Behold.so — feed Instagram** | Entrar a behold.so con cuenta Instagram Business → crear widget → copiar `BEHOLD_WIDGET_ID` → agregar en Vercel como `NEXT_PUBLIC_BEHOLD_WIDGET_ID` | 🟡 Antes de lanzar |
| S9 | **Google Sheet El Marcador** | Crear Sheet con 4 celdas: `anuncios_contactados`, `dijeron_no`, `familias_ubicadas`, `tiempo_medio` → copiar ID de la URL → pegar en Vercel como `SHEET_MARCADOR_ID`. Si es privada: Service Account en Google Cloud Console | 🟡 Antes de lanzar |
| S10 | **Dominio tulugarengalicia.com** | Registrar dominio → ir a Cloudflare DNS → agregar registro A `@` → `76.76.21.21` y CNAME `www` → `cname.vercel-dns.com` → en Vercel: Settings → Domains → Add → esperar "Valid Configuration" → activar proxy Cloudflare (nube naranja) → SSL Full (strict). Guía paso a paso en `docs/ARCHITECTURE.md §6` | 🟠 Cuando esté listo el dominio |
| S11 | **WhatsApp Business** | Migrar número a WhatsApp Business (app móvil) → configurar mensaje de bienvenida y horario → actualizar número en `lib/config/site.ts` (ítem S1) | 🟡 Recomendado antes de lanzar |

---

## 5 — Pendientes de infraestructura

### Upstash Redis
- **Estado:** variables `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` **no están en Vercel** (auditado en A11).
- **Qué desbloquea:** rate limiting de `/api/gina` (actualmente fail-closed — devuelve 503 si no hay Redis). Sin Redis, Gina no puede atender requests en producción.
- **Cómo activar:** crear cuenta en upstash.com → crear base de datos Redis → copiar las dos variables → agregarlas en Vercel.
- **Urgencia:** 🔴 Crítico antes de lanzar.

### Dominio propio `tulugarengalicia.com`
- **Estado:** pendiente de registro/apuntado. El sitio usa URL `.vercel.app`.
- **Qué desbloquea:** (1) remitentes propios en Resend (`silvana@tulugarengalicia.com`, `gina@tulugarengalicia.com`), (2) URL definitiva para webhook Cal.com, (3) tracking de apertura de mails (Pieza 6), (4) confianza del cliente.
- **Cómo activar:** seguir guía `docs/ARCHITECTURE.md §6` (paso a paso Cloudflare → Vercel).
- **Urgencia:** 🟠 Alto — no bloquea desarrollo pero sí el lanzamiento real.

### Behold.so (feed Instagram)
- **Estado:** `FeedInstagram.tsx` tiene el TODO preparado — cambio de 10 minutos una vez con el token.
- **Qué desbloquea:** feed dinámico de Instagram en la home (reemplaza placeholder).
- **Requisito:** cuenta Instagram Business o Creator.
- **Cómo activar:** behold.so → conectar cuenta IG → crear widget → copiar ID → `NEXT_PUBLIC_BEHOLD_WIDGET_ID` en Vercel.
- **Urgencia:** 🟡 Medio.

### INTERNAL_API_SECRET rotado
- **Estado:** rotado en `.env.local` (2026-06-28) pero **pendiente de actualizar en Vercel y GitHub Actions**.
- **Qué bloquea:** el endpoint de recordatorio-silvana y el cron de resumen-diario fallan en producción hasta actualizarlo.
- **Urgencia:** 🔴 Crítico.

---

## 6 — Herramientas activas del stack de Code

### ECC (Agentic OS para Claude Code)
- **Instalación:** `~/.claude/hooks/` (148 archivos: hooks runtime)
- **Rules:** `~/.claude/rules/ecc/common/` (10 reglas) + `~/.claude/rules/ecc/typescript/` (5 reglas)
- **Skills globales** (`~/.claude/skills/`):
  - `search-first` → buscar antes de escribir código nuevo
  - `security-review` → endpoints y datos sensibles
  - `verification-loop` → después de cada feature grande
  - `eval-harness` → gates de calidad antes de commits
  - `continuous-learning-v2` → extrae patrones al cerrar sesión
  - `frontend-patterns` → React/Next.js components
  - `backend-patterns` → APIs y rutas
  - `tdd-workflow` → TDD para nuevas features
- **Cómo usar:** se activan automáticamente según el tipo de tarea (ver §11 de CLAUDE.md)

### agency-agents (msitarzewski)
- **Instalación:** `~/.claude/agents/` — 222 agentes de dominio de negocio
- **Los más relevantes para este proyecto:**
  - `Frontend Developer` — componentes React/Next.js
  - `Backend Architect` — APIs y middleware
  - `Brand Guardian` — identidad de marca, paleta
  - `UI Designer` — tokens CSS, componentes visuales
  - `Security Engineer` — revisión de endpoints
  - `Accessibility Auditor` — WCAG
  - `Code Reviewer` — antes de commitear
  - `Reality Checker` — verificación final antes de push
  - `SEO Specialist` — páginas nuevas, metadata
  - `Content Creator` — copy y textos
- **Cómo usar:** invocar con la fórmula del §5 de CLAUDE.md

### DESIGN.md
- **Archivo:** `DESIGN.md` en la raíz del proyecto (commit `f9f4e97`)
- **Qué contiene:** paleta hex exacta, escala tipográfica, variantes de Button, estilos del Header, layout, shadows, do's/don'ts, breakpoints responsive, prompts listos para cada tipo de agente
- **Cómo usar:** leer SIEMPRE antes de crear o modificar cualquier componente visual

### Skills de proyecto
- **`voz-tu-lugar-en-galicia`** (`/.claude/skills/`): reglas de voz de marca — "tú" neutro, nunca "vos". Aplicar a TODO el copy visible sin excepción.

### §11 CLAUDE.md
- Flujos obligatorios por tipo de tarea (feature nueva, componente visual, endpoint, copy, commit)
- Mapa completo de agentes, skills globales, skills de proyecto y rules activas

---

## 7 — Roadmap próxima sesión — prioridades

**En este orden exacto:**

### Prioridad 1 — Rediseño páginas de ciudad: tabs + cámara MeteoGalicia
Las páginas de ciudad (`/ciudades/[ciudad]`) necesitan:
- Implementar tabs para secciones (Barrios, Clima, Colegios, Transporte, etc.)
- Integrar cámara en vivo de MeteoGalicia (verificar autorización legal con `Legal Compliance Checker` — auditado en A13 como `VistaEnVivo.tsx` Windy sin autorización)
- Revisar dark mode en tarjetas de ciudad (fix `2722e97` no resolvió todo)
- Agentes: `Frontend Developer` (tabs + layout) + `Legal Compliance Checker` (MeteoGalicia) + `Accessibility Auditor`

### Prioridad 2 — Motor del plan estratégico: completar PDF
Pendientes en `lib/plan/armador.ts` y `lib/plan/generarPdf.tsx`:
- Pasada final de tono Carnegie sobre textos fijos (introducción cálida, cierre, sección económica)
- Integrar `plan-estrategico.md` como fuente de los textos fijos del PDF
- Verificar que los 55 trámites del catálogo están todos mapeados correctamente
- Agentes: `AI Engineer` (lógica) + `Content Creator` (tono Carnegie) + `Code Reviewer`

### Prioridad 3 — Fixes 🟠 restantes de auditoría
| ID | Pendiente |
|---|---|
| A02 | Email de cliente en logs de producción (RGPD) — `app/api/webhooks/calcom/route.ts:241` |
| A03 | `/api/gina` sin rate limiting funcional hasta que Upstash esté configurado |
| A04 | Política de Privacidad con TODO sin completar — pendiente datos fiscales de Silvana (S7) |
| A07 | consentimientoRGPD — verificar que el fix `8fb5d7c` es suficiente |
| A08 | WhatsApp y Cal.com URL con placeholders — pendiente Silvana (S1, S2) |
| A09 | Token admin en query string — considerar mover a header o cookie httpOnly |
| A10 | Sanitización email en filterByFormula — reforzar validación |
| A14 | Imágenes placeholder en producción (Testimonios, Silvana, MuroLlaves) |
| A15 | TTL token admin a reducir de 72h a 24h |

### Prioridad 4 — Sección LoQueNoSomos
- Revisar el fix `2722e97` y verificar si el rediseño fue completo
- La sección debe comunicar claramente la propuesta diferencial de Silvana vs. portales genéricos
- Agentes: `Content Creator` + `Brand Guardian` + `Frontend Developer`

### Prioridad 5 — `/herramientas/contrato`
- Nueva página: traductor de contratos de alquiler en español jurídico → lenguaje simple
- IA mínima: Gemini para el parsing del texto legal
- Agentes: `AI Engineer` + `Frontend Developer` + `Legal Compliance Checker`

---

## 8 — Variables de entorno — estado completo

| Variable | Propósito | Vercel Prod | GitHub Actions | `.env.local.example` |
|---|---|---|---|---|
| `AIRTABLE_API_KEY` | Leads y flujo agenda | ⚠️ Verificar | — | ✅ |
| `AIRTABLE_BASE_ID` | ID de la base de Airtable | ⚠️ Verificar | — | ✅ |
| `AIRTABLE_TABLE_NAME` | Nombre de la tabla | ⚠️ Verificar | — | ✅ |
| `SHEET_MARCADOR_ID` | Google Sheets El Marcador | ⚠️ Verificar | — | ✅ |
| `GOOGLE_SHEETS_API_KEY` | Leer Sheets públicas | ⚠️ Verificar | — | ✅ |
| `GEMINI_API_KEY` | IA Gina (servidor only) | ⚠️ Verificar | — | ✅ |
| `INTERNAL_API_SECRET` | Auth endpoints admin + tokens HMAC | ⚠️ **Rotado — actualizar** | ❌ **Pendiente actualizar** | ✅ |
| `RESEND_API_KEY` | Envío de emails | ⚠️ Verificar | — | ✅ |
| `RESEND_FROM_EMAIL` | Remitente mails cliente | ⚠️ Verificar | — | ✅ |
| `SILVANA_EMAIL` | Destino mails internos | ❌ **Falta configurar** | — | ✅ |
| `CALCOM_API_KEY` | Cal.com gestión slots | ⚠️ Verificar | — | ✅ |
| `CALCOM_WEBHOOK_SECRET` | Firma HMAC webhook Cal.com | ❌ **Falta configurar** | — | ✅ |
| `CRON_SECRET` | Auth cron Vercel | ⚠️ Verificar | — | ✅ |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio | ⚠️ `.vercel.app` por ahora | — | ✅ |
| `AEMET_API_KEY` | Clima AEMET | ⚠️ Verificar | — | ✅ |
| `UPSTASH_REDIS_REST_URL` | Rate limiting Gina | ❌ **Falta configurar** | — | ❌ **No está en example** |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting Gina | ❌ **Falta configurar** | — | ❌ **No está en example** |
| `NEXT_PUBLIC_BEHOLD_WIDGET_ID` | Feed Instagram | ❌ Falta token | — | — |
| `DATABASE_URL` | BD (Fase 5 — no usar aún) | — | — | ✅ |
| `STRIPE_SECRET_KEY` | Pagos (Fase 6) | — | — | ✅ |

> ⚠️ `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` deben añadirse a `.env.local.example` (auditado en A11).

---

## 9 — Arquitectura clave actualizada

### Rutas API activas

| Ruta | Método | Auth | Propósito |
|---|---|---|---|
| `/api/lead` | POST | Origin check | Guardar lead de FormularioDiagnostico → Airtable |
| `/api/gina` | POST | Rate limit Upstash (30/10min) | IA Gina → Gemini, guarda lead en Airtable |
| `/api/marcador` | GET | — | Lee Google Sheets → métricas El Marcador |
| `/api/clima/[ciudad]` | GET | — | Clima por ciudad (AEMET) |
| `/api/plan/[recordId]/pdf` | GET | `verifyAdminToken(recordId, token)` HMAC-SHA256 | Genera PDF personalizado del plan estratégico |
| `/api/admin/resumen-diario` | GET | `Authorization: Bearer INTERNAL_API_SECRET` + x-vercel-cron | Cron diario 08:00 → mail a Silvana con leads |
| `/api/admin/habilitar-agenda/[recordId]` | POST | Token HMAC en query param | Genera código agenda, guarda en Airtable, mail al cliente |
| `/api/admin/recordatorio-silvana` | GET | `Authorization: Bearer INTERNAL_API_SECRET` | Cron horario → mail recordatorio 1h antes de cita |
| `/api/admin/expirar-codigos` | GET | `Authorization: Bearer INTERNAL_API_SECRET` | Expira códigos caducados en Airtable |
| `/api/webhooks/calcom` | POST | HMAC-SHA256 `X-Cal-Signature-256` | Webhook Cal.com → actualiza Airtable → mail Silvana |

### Componentes añadidos en sesiones recientes

| Componente | Archivo | Propósito |
|---|---|---|
| `AgendaPublica` | `components/agenda/AgendaPublica.tsx` | Página `/agenda?code=` con validación dinámica |
| `HabilitarAgendaButton` | `components/admin/HabilitarAgendaButton.tsx` | Botón en perfil admin → llama endpoint Pieza 4 |
| `GinaWidget` | `components/gina/GinaWidget.tsx` | Widget de chat Gina con focus trap, aria-hidden |
| `LoQueNoSomos` | `components/sections/LoQueNoSomos.tsx` | Sección diferencial de marca |

### Motor del plan estratégico

| Archivo | Propósito |
|---|---|
| `lib/plan/armador.ts` | Lógica pura: `RespuestasLead` → `PlanArmado` (items + advertencias). `FRASES_PUENTE` dict por número. 6 fases (A→F). |
| `lib/plan/generarPdf.tsx` | Renderer React-PDF. Lee `docs/contenido/tramites-galicia.md`. Barras contexto, sección económica personalizada. |
| `docs/contenido/tramites-galicia.md` | Catálogo de los 55 trámites (fuente de verdad) |
| `docs/frases-puente.md` | Frases puente por número de trámite |
| `docs/plan-estrategico.md` | Textos fijos + lógica de armado (este doc) |

### GitHub Actions

| Workflow | Archivo | Trigger | Propósito |
|---|---|---|---|
| Recordatorio Silvana | `.github/workflows/recordatorio-silvana.yml` | `cron: '0 * * * *'` | Llama `/api/admin/recordatorio-silvana` cada hora |

### Middleware de seguridad

| Configuración | Archivo | Qué protege |
|---|---|---|
| CSP completo | `middleware.ts` | Defensa en profundidad XSS |
| HSTS | `middleware.ts` + `vercel.json` | Fuerza HTTPS |
| Referrer-Policy no-referrer | `middleware.ts` | Rutas admin y webhooks |
| Rate limiting (Upstash) | `app/api/gina/route.ts`, `app/api/lead/route.ts` | Previene saturación Airtable |

---

## 10 — Instrucciones operativas (CLAUDE.md completo)

```
# CLAUDE.md — Reglas del proyecto "Tu Lugar en Galicia"

Este archivo lo lee Claude Code automáticamente al iniciar cualquier sesión en este repo.
Define el proyecto, el stack bloqueado, qué agente puede tocar qué, y las reglas para que
los agentes NO se pisen entre sí. Leer esto y /docs/roadmap.md antes de actuar.

---

## 1. Qué es este proyecto

Web de Tu Lugar en Galicia: el primer servicio de relocation especializado en Galicia
(fundadora: Silvana Lorenzo). El sitio capta familias emigrantes —principalmente de
Latinoamérica— que necesitan alquiler antes de llegar, las cualifica y agenda videollamadas.

Contexto completo del negocio, marca, competencia y producto en:
- /docs/roadmap.md — fases y orden de ejecución
- /docs/ARCHITECTURE.md — stack y decisiones técnicas
- /docs/PRD-fase-1.md — requisitos de la fase actual
- /docs/design-system.md — identidad visual y componentes
- /docs/gina-flujo.md — flujo conversacional de Gina (fuente de verdad del cuestionario)
- /docs/gina-barandas.md — reglas de control del system prompt y arquitectura del widget de Gina
- /docs/contexto-estrategico.md — contexto de negocio, marca y competencia
- /docs/gina-recursos-preparacion.md — material de apoyo y recursos del asistente Gina
- /docs/legal-terminos-privacidad.md — fuente de la política de privacidad real (datos fiscales pendientes)

---

## 2. Stack BLOQUEADO (no proponer alternativas sin un ADR)

- Framework: Next.js (App Router) + TypeScript + Tailwind CSS
- Deploy: Vercel (auto-deploy desde GitHub main)
- DNS / SSL / CDN / cron del scraper: Cloudflare (free)
- Leads / CRM (Fase 1): Airtable o Google Sheets — NO base de datos todavía
- IA (Gina): API de Gemini (Google) llamada desde API routes de Next.js (clave solo en servidor).
  Decisión vigente: Gemini por costo. NO volver a la API de Claude/Anthropic sin un ADR.
  La clave va en GEMINI_API_KEY (solo servidor) — nunca en el cliente ni en el repo.
- Base de datos: se introduce SOLO en Fase 5 (Vercel Postgres / Neon / Supabase)
- Agenda: Cal.com embebido — Pagos: Stripe (Fase 6)

⛔ No usar PHP / Laravel / Livewire / Filament. Vercel es nativo de JS/Next.js.
⛔ Si un agente sugiere PHP, está mal asignado.

---

## 3. El escuadrón (usar SOLO estos agentes)

La colección instalada tiene +200 agentes genéricos. En este repo se usan únicamente:

| Rol | Agente | Carril |
|---|---|---|
| Coordinador (UNO solo) | Agents Orchestrator | ninguno (reparte tareas) |
| Producto | Product Manager | /docs |
| Priorización | Sprint Prioritizer | /docs |
| Arquitectura | Software Architect | /docs (ADR), config raíz |
| API / datos | Backend Architect | /app/api, /lib |
| Base de datos (Fase 5) | Database Optimizer | /lib/db, migraciones |
| Marca | Brand Guardian | /docs/design-system.md |
| Diseño UI | UI Designer | /docs/design-system.md, globals.css (solo tokens) |
| Builder principal | Frontend Developer | /app, /components (excepto /app/api) |
| IA | AI Engineer | /app/api/gina, /lib/ai |
| Scraping | Data Engineer | /workers/scraper |
| Infra / deploy | DevOps Automator | vercel.json, /.github, config raíz, Cloudflare |
| Git | Git Workflow Master | define convención de ramas |
| SEO | SEO Specialist | app/sitemap.ts, app/robots.ts, /lib/seo, metadata |
| Contenido | Content Creator | /content |
| Seguridad | Security Engineer | solo revisa — no tiene carril propio |
| Legal / RGPD | Legal Compliance Checker | solo revisa — no tiene carril propio |
| Calidad | Code Reviewer, Reality Checker, Accessibility Auditor, Performance Benchmarker | solo revisan |

⛔ NO usar a la vez: Studio Producer, Project Shepherd, Studio Operations, Senior Project Manager.
⛔ NO usar: Senior Developer (es Laravel/PHP), Rapid Prototyper para producción.

---

## 4. Las 7 reglas anti-superposición

1. Un solo coordinador. Manda Agents Orchestrator o manda el humano. Nunca dos.
2. Una responsabilidad por invocación. Un agente = una tarea = un entregable. Luego para.
3. Carriles de propiedad. Cada agente escribe SOLO en las carpetas de su carril.
4. Relevo por artefacto. La salida de un agente es la entrada del siguiente.
5. Una rama por tarea. feature/<fase>-<tarea-corta>. Code Reviewer revisa antes de fusionar.
6. Definición de hecho. Ninguna tarea termina sin cumplir sus criterios (ver PRD de la fase).
7. Reality Checker cierra cada fase. No se avanza de fase sin su certificación.

---

## 5. Cómo invocar a un agente (fórmula fija)

"Activá el [agente], hacé [una tarea concreta], según /docs/[archivo],
tocando solo /[carpeta del carril]. Cuando termines, resumí qué cambiaste y para."

---

## 6. Convenciones de código

- Componentes en TypeScript (.tsx), nombres en inglés, copy de cara al usuario en español.
- Estilos solo con clases de Tailwind y los tokens de /docs/design-system.md. Nada de CSS suelto.
- Commits: Conventional Commits (feat:, fix:, docs:, chore:).
- Variables de entorno nunca en el código ni en el cliente: solo en .env.local y Vercel.

### 6.1. Voz de marca

Todo texto publicado: aplicar skill voz-tu-lugar-en-galicia. Cliente = "tú" neutro. Nunca "vos".
Idioma del sitio: español (futuro: + portugués + inglés en Fase 6).

---

## 7. Privacidad y RGPD (obligatorio, estás en la UE)

- Todo formulario que capta datos requiere consentimiento explícito y enlace a política de privacidad.
- El mapa de familias (Fase 5) solo muestra a quien dio permiso explícito.
- El scraping de supermercados (Fase 3) debe revisar términos de uso de cada sitio antes de activarse.
- Ante cualquier duda de datos personales, invocar al Legal Compliance Checker.

---

## 8. Modo de operación — Orquestador siempre activo

Antes de ejecutar cualquier tarea, el agente principal actúa como orquestador:
1. Evalúa qué combinación de subagentes, skills, MCP servers y herramientas es óptima
2. Invoca los recursos necesarios en paralelo cuando sea posible
3. Coordina los resultados y entrega la solución óptima

Esto aplica a todas las tareas sin excepción.

---

## 9. Inicio de sesión

Al abrir cada sesión, el hook SessionStart inyecta automáticamente el estado de docs/ y la memoria.
Ante ese mensaje [inicio-sesion]: invocar anthropic-skills:consolidate-memory y reportar en ≤3 líneas qué cambió.

---

## 10. Auditoría permanente (2026-06-28)

### Pendientes:

| ID | Severidad | Descripción | Archivo |
|---|---|---|---|
| A01 | ✅ Resuelto | /api/plan/[recordId]/pdf — auth HMAC-SHA256 implementada | app/api/plan/[recordId]/pdf/route.ts |
| A02 | 🔴 Crítico | Email de cliente en logs de producción (RGPD) | app/api/webhooks/calcom/route.ts:241 |
| A03 | 🔴 Crítico | /api/gina sin rate limiting — Upstash no configurado en Vercel | app/api/gina/route.ts |
| A04 | 🔴 Crítico | Política de Privacidad con TODO — datos fiscales de Silvana pendientes | app/politica-de-privacidad/page.tsx |
| A05 | ✅ Resuelto | CSP — implementado en middleware.ts y vercel.json (commit 8fb5d7c) | middleware.ts |
| A06 | ✅ Resuelto | HSTS — implementado en middleware.ts y vercel.json (commit 8fb5d7c) | vercel.json |
| A07 | ✅ Resuelto | consentimientoRGPD dinámico (commit 8fb5d7c) | app/api/gina/route.ts |
| A08 | 🟠 Alto | WhatsApp y Cal.com URL con placeholders — pendiente Silvana | lib/config/site.ts |
| A09 | 🟡 Medio | Token admin en query string (Referer leak) | lib/admin/tokens.ts |
| A10 | 🟡 Medio | Sanitización de email en filterByFormula por exclusión (frágil) | lib/admin/airtable.ts:122 |
| A11 | 🟡 Medio | UPSTASH vars no están en .env.local.example | .env.local.example |
| A12 | ✅ Resuelto | CALCOM_API_KEY y OPENWEATHER_API_KEY obsoletas eliminadas (commit 8fb5d7c) | .env.local.example |
| A13 | 🟡 Medio | VistaEnVivo widget Windy sin autorización legal de MeteoGalicia | components/ciudad/VistaEnVivo.tsx |
| A14 | 🟡 Medio | Imágenes placeholder en producción (Testimonios, Silvana, MuroLlaves) | múltiples |
| A15 | 🟡 Medio | TTL token admin 72h — reducir a 24h | lib/admin/tokens.ts:3 |

### Reglas para sesiones futuras:
- Ante cualquier endpoint nuevo: auth, rate limiting, no devolver más PII de lo necesario.
- Ante cualquier log nuevo: nunca loguear emails, nombres ni datos personales — usar hash/ID.
- Security Engineer debe revisar todos los cambios en /app/api/admin/ antes de merge.
- Política de Privacidad debe estar completa (sin TODO) antes del lanzamiento público.

---

## Simplificación automática post-implementación

Después de cada feature o refactor significativo, invocar /simplify sobre los archivos modificados.
Esto aplica automáticamente — sin que el usuario lo pida.

---

## 11. Orquestación permanente de recursos

### Activación automática de herramientas
El orquestador está SIEMPRE activo. Antes de ejecutar cualquier tarea evaluar:

Diseño y UI:
- Leer DESIGN.md antes de crear o modificar cualquier componente visual
- Consultar components/ui/ antes de crear componentes nuevos — reutilizar siempre
- Aplicar paleta mediterránea (sal, piedra, arena, tierra, dorado) — nunca inventar colores
- Verificar modo claro y oscuro en todo componente nuevo

Agentes disponibles (~/.claude/agents/):
- UI Designer, Brand Guardian → cualquier tarea visual o de componentes
- Frontend Developer → componentes React/Next.js
- Backend Architect → APIs, rutas, middleware
- Security Architect + Senior SecOps → cualquier endpoint nuevo
- SEO Specialist → páginas nuevas o cambios de metadata
- Accessibility Auditor → verificación WCAG en componentes nuevos
- Code Reviewer → antes de commitear
- Reality Checker → verificación final antes de push

Skills globales (~/.claude/skills/):
- search-first → buscar antes de escribir cualquier código nuevo
- security-review → todo endpoint o dato sensible
- verification-loop → después de cada feature grande
- eval-harness → gates de calidad antes de commits
- continuous-learning-v2 → extraer patrones al cerrar sesión
- frontend-patterns → componentes React/Next.js
- backend-patterns → APIs y rutas

Skills de proyecto (.claude/skills/):
- voz-tu-lugar-en-galicia → TODO el copy que se escribe — sin excepción

Rules activas (~/.claude/rules/ecc/):
- common/security.md → endpoints y datos
- common/testing.md → cobertura mínima
- common/git-workflow.md → commits y branches
- typescript/patterns.md → código TypeScript

### Flujo obligatorio por tipo de tarea

Feature nueva:
search-first → plan → agentes especializados → DESIGN.md → voz skill → verification-loop → eval-harness → commit

Componente visual:
DESIGN.md → UI Designer + Brand Guardian → frontend-patterns → Accessibility Auditor → modo claro/oscuro → commit

Endpoint o API:
search-first → backend-patterns → security-review → Security Architect → tsc → commit

Copy o texto:
voz-tu-lugar-en-galicia SIEMPRE → nunca escribir copy sin esta skill

Commit:
Code Reviewer → Reality Checker → tsc 0 → lint 0 → build exit 0 → push
```

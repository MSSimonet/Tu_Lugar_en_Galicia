# CLAUDE.md — Reglas del proyecto "Tu Lugar en Galicia"

> Este archivo lo lee Claude Code automáticamente al iniciar cualquier sesión en este repo.
> Define el proyecto, el stack bloqueado, qué agente puede tocar qué, y las reglas para que
> los agentes NO se pisen entre sí. **Leer esto y `/docs/roadmap.md` antes de actuar.**

---

## 1. Qué es este proyecto

Web de **Tu Lugar en Galicia**: el primer servicio de relocation especializado en Galicia
(fundadora: Silvana Lorenzo). El sitio capta familias emigrantes —principalmente de
Latinoamérica— que necesitan alquiler antes de llegar, las cualifica y agenda videollamadas.

Contexto completo del negocio, marca, competencia y producto en:
- `/docs/roadmap.md` — fases y orden de ejecución
- `/docs/ARCHITECTURE.md` — stack y decisiones técnicas
- `/docs/PRD-fase-1.md` — requisitos de la fase actual
- `/docs/design-system.md` — identidad visual y componentes
- `/docs/gina-flujo.md` — flujo conversacional de Gina (fuente de verdad del cuestionario)
- `/docs/gina-barandas.md` — reglas de control del system prompt y arquitectura del widget de Gina
- `/docs/contexto-estrategico.md` — contexto de negocio, marca y competencia
- `/docs/gina-recursos-preparacion.md` — material de apoyo y recursos del asistente Gina
- `/docs/legal-terminos-privacidad.md` — fuente de la política de privacidad real (datos fiscales pendientes de completar)

---

## 2. Stack BLOQUEADO (no proponer alternativas sin un ADR)

- **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Deploy:** Vercel (auto-deploy desde GitHub `main`)
- **DNS / SSL / CDN / cron del scraper:** Cloudflare (free)
- **Leads / CRM (Fase 1):** Airtable o Google Sheets — NO base de datos todavía
- **IA (Gina):** **API de Gemini (Google)** llamada desde API routes de Next.js (clave solo en servidor).
  Decisión vigente: Gemini por costo. NO volver a la API de Claude/Anthropic sin un ADR.
  La clave va en `GEMINI_API_KEY` (solo servidor) — nunca en el cliente ni en el repo.
- **Base de datos:** se introduce SOLO en Fase 5 (Vercel Postgres / Neon / Supabase)
- **Agenda:** Cal.com embebido — **Pagos:** Stripe (Fase 6)

> ⛔ **No usar PHP / Laravel / Livewire / Filament.** Vercel es nativo de JS/Next.js.
> Si un agente sugiere PHP, está mal asignado.

---

## 3. El escuadrón (usar SOLO estos agentes)

La colección instalada tiene +200 agentes genéricos. En este repo se usan únicamente:

| Rol | Agente | Carril (carpetas que puede tocar) |
|---|---|---|
| Coordinador (UNO solo) | `Agents Orchestrator` | ninguno (reparte tareas, no escribe código) |
| Producto | `Product Manager` | `/docs` |
| Priorización | `Sprint Prioritizer` | `/docs` |
| Arquitectura | `Software Architect` | `/docs` (ADR), config raíz |
| API / datos | `Backend Architect` | `/app/api`, `/lib` |
| Base de datos (Fase 5) | `Database Optimizer` | `/lib/db`, migraciones |
| Marca | `Brand Guardian` | `/docs/design-system.md` |
| Diseño UI | `UI Designer` | `/docs/design-system.md`, `tailwind.config.ts`, `app/globals.css` (solo tokens) |
| Builder principal | `Frontend Developer` | `/app`, `/components` (excepto `/app/api`) |
| IA | `AI Engineer` | `/app/api/gina`, `/lib/ai` |
| Scraping | `Data Engineer` | `/workers/scraper` |
| Infra / deploy | `DevOps Automator` | `vercel.json`, `/.github`, config raíz, Cloudflare |
| Git | `Git Workflow Master` | define convención de ramas (no toca features) |
| SEO | `SEO Specialist` | `app/sitemap.ts`, `app/robots.ts`, `/lib/seo`, metadata |
| Contenido | `Content Creator` | `/content` |
| Seguridad | `Security Engineer` | solo revisa — no tiene carril propio |
| Legal / RGPD | `Legal Compliance Checker` | solo revisa — no tiene carril propio |
| Calidad (puerta) | `Code Reviewer`, `Reality Checker`, `Accessibility Auditor`, `Performance Benchmarker` | solo revisan — no escriben features |

> ⛔ **NO usar a la vez** (se solapan): `Studio Producer`, `Project Shepherd`,
> `Studio Operations`, `Senior Project Manager` — su rol lo cubre `Agents Orchestrator`.
> ⛔ **NO usar** `Senior Developer` (es Laravel/PHP) ni `Rapid Prototyper` para producción.

---

## 4. Las 7 reglas anti-superposición

1. **Un solo coordinador.** Manda `Agents Orchestrator` o manda el humano. Nunca dos.
2. **Una responsabilidad por invocación.** Un agente = una tarea = un entregable. Luego para.
3. **Carriles de propiedad.** Cada agente escribe SOLO en las carpetas de su carril (tabla §3).
   Si una tarea necesita tocar dos carriles, se divide en dos tareas para dos agentes.
4. **Relevo por artefacto.** La salida de un agente es la entrada del siguiente (un archivo en
   `/docs` o código ya fusionado). El archivo es el "testigo de la carrera".
5. **Una rama por tarea.** `feature/<fase>-<tarea-corta>`. El `Code Reviewer` revisa antes de
   fusionar a `main`. El merge detecta cualquier choque antes de romper nada.
6. **Definición de hecho.** Ninguna tarea termina sin cumplir sus criterios (ver PRD de la fase).
7. **`Reality Checker` cierra cada fase.** No se avanza de fase sin su certificación.

---

## 5. Cómo invocar a un agente (fórmula fija)

> "Activá el **[agente]**, hacé **[una tarea concreta]**, según **`/docs/[archivo]`**,
> tocando solo **`/[carpeta del carril]`**. Cuando termines, resumí qué cambiaste y para."

Ejemplo real:
> "Activá el **Frontend Developer**, construí la página de Vigo, según `/docs/PRD-fase-1.md`
> y `/docs/design-system.md`, tocando solo `app/ciudades/vigo` y componentes ya existentes
> en `/components`. Cuando termines, resumí qué cambiaste y para."

---

## 6. Convenciones de código

- Componentes en TypeScript (`.tsx`), nombres en inglés, copy de cara al usuario en español.
- Estilos solo con clases de Tailwind y los tokens de `/docs/design-system.md`. Nada de CSS suelto.
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
- Variables de entorno (claves) nunca en el código ni en el cliente: solo en `.env.local` y
  en las variables de entorno de Vercel.

### 6.1. Voz de marca

Todo texto publicado: aplicar skill `voz-tu-lugar-en-galicia`. Cliente = **"tú" neutro**. Nunca "vos" con el cliente.

- Idioma del sitio: español (futuro: + portugués + inglés en Fase 6).

---

## 7. Privacidad y RGPD (obligatorio, estás en la UE)

- Todo formulario que capta datos requiere consentimiento explícito y enlace a política de privacidad.
- El mapa de familias (Fase 5) solo muestra a quien dio permiso explícito; nunca calle ni número exacto.
- El scraping de supermercados (Fase 3) debe revisar términos de uso de cada sitio antes de activarse.
- Ante cualquier duda de datos personales, invocar al `Legal Compliance Checker`.

---

## 8. Modo de operación — Orquestador siempre activo

Antes de ejecutar cualquier tarea, el agente principal actúa como **orquestador**:

1. Evalúa qué combinación de subagentes, skills, MCP servers y herramientas es óptima para la tarea
2. Invoca los recursos necesarios en paralelo cuando sea posible
3. Coordina los resultados y entrega la solución óptima

Esto aplica a **todas las tareas sin excepción** — sin necesidad de que el usuario lo pida cada vez.

## 9. Inicio de sesión

Al abrir cada sesión, el hook `SessionStart` inyecta automáticamente el estado de `docs/` y la memoria.
Ante ese mensaje `[inicio-sesion]`: invocar `anthropic-skills:consolidate-memory` y reportar en ≤3 líneas qué cambió.

---

## 10. Auditoría permanente (2026-06-28)

El 2026-06-28 se realizó la primera auditoría total del proyecto (código, seguridad, RGPD, WCAG, env vars, Airtable, Lighthouse). Las incidencias críticas identificadas y sus estados:

### Pendientes de corrección (abrir issue por cada uno antes de siguiente deploy):

| ID | Severidad | Descripción | Archivo |
|---|---|---|---|
| A01 | ✅ Resuelto | `/api/plan/[recordId]/pdf` — auth implementada con `verifyAdminToken` (token HMAC-SHA256 en query param) | `app/api/plan/[recordId]/pdf/route.ts` |
| A02 | 🔴 Crítico | Email de cliente en logs de producción (RGPD) | `app/api/webhooks/calcom/route.ts:241` |
| A03 | 🔴 Crítico | `/api/gina` sin rate limiting — Airtable puede saturarse | `app/api/gina/route.ts` |
| A04 | 🔴 Crítico | Política de Privacidad con TODO sin completar en producción | `app/politica-de-privacidad/page.tsx` |
| A05 | 🟠 Alto | CSP ausente — sin defensa en profundidad contra XSS | `middleware.ts`, `vercel.json` |
| A06 | 🟠 Alto | HSTS ausente | `vercel.json` |
| A07 | 🟠 Alto | consentimientoRGPD hardcodeado en Gina (no viene del usuario) | `app/api/gina/route.ts:190` |
| A08 | 🟠 Alto | WhatsApp y Cal.com URL con placeholders en config | `lib/config/site.ts` |
| A09 | 🟡 Medio | Token admin en query string (Referer leak) | `lib/admin/tokens.ts` |
| A10 | 🟡 Medio | Sanitización de email en filterByFormula por exclusión (frágil) | `lib/admin/airtable.ts:122` |
| A11 | 🟡 Medio | `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` no están en `.env.local.example` | `.env.local.example` |
| A12 | 🟡 Medio | `CALCOM_API_KEY` en example pero nunca usada; `OPENWEATHER_API_KEY` obsoleta | `.env.local.example` |
| A13 | 🟡 Medio | VistaEnVivo widget Windy sin autorización legal de MeteoGalicia | `components/ciudad/VistaEnVivo.tsx` |
| A14 | 🟡 Medio | Imágenes placeholder en producción (Testimonios, Silvana, MuroLlaves) | múltiples |
| A15 | 🟡 Medio | TTL token admin 72h — debería ser 24h para acción de alta sensibilidad | `lib/admin/tokens.ts:3` |

### Reglas de auditoría para sesiones futuras:
- Ante cualquier endpoint nuevo: verificar auth, rate limiting y que no devuelva más PII de lo necesario.
- Ante cualquier log nuevo: nunca loguear emails, nombres ni datos personales — usar hash/ID.
- El `Security Engineer` debe revisar todos los cambios en `/app/api/admin/` antes de merge.
- La `Política de Privacidad` debe estar completa (sin TodoBlock) antes del lanzamiento público.

---

## Simplificación automática post-implementación

Después de cada feature o refactor significativo, invocar `/simplify` sobre los archivos modificados para:
- Eliminar código innecesario
- Reducir abstracciones prematuras
- Asegurar que cada línea justifica su existencia

Esto aplica automáticamente — sin que el usuario lo pida.

---

## 11. Orquestación permanente de recursos

### Activación automática de herramientas
El orquestador está SIEMPRE activo. Antes de ejecutar cualquier tarea evaluar:

**Diseño y UI:**
- Leer `DESIGN.md` antes de crear o modificar cualquier componente visual
- Consultar `components/ui/` antes de crear componentes nuevos — reutilizar siempre
- Aplicar paleta mediterránea (sal, piedra, arena, tierra, dorado) — nunca inventar colores
- Verificar modo claro y oscuro en todo componente nuevo

**Agentes disponibles (~/.claude/agents/):**
- UI Designer, Brand Guardian → cualquier tarea visual o de componentes
- Frontend Developer → componentes React/Next.js
- Backend Architect → APIs, rutas, middleware
- Security Architect + Senior SecOps → cualquier endpoint nuevo
- SEO Specialist → páginas nuevas o cambios de metadata
- Accessibility Auditor → verificación WCAG en componentes nuevos
- Code Reviewer → antes de commitear
- Reality Checker → verificación final antes de push

**Skills globales (~/.claude/skills/):**
- `search-first` → buscar antes de escribir cualquier código nuevo
- `security-review` → todo endpoint o dato sensible
- `verification-loop` → después de cada feature grande
- `eval-harness` → gates de calidad antes de commits
- `continuous-learning-v2` → extraer patrones al cerrar sesión
- `frontend-patterns` → componentes React/Next.js
- `backend-patterns` → APIs y rutas

**Skills de proyecto (.claude/skills/):**
- `voz-tu-lugar-en-galicia` → TODO el copy que se escribe — sin excepción

**Rules activas (~/.claude/rules/ecc/):**
- `common/security.md` → endpoints y datos
- `common/testing.md` → cobertura mínima
- `common/git-workflow.md` → commits y branches
- `typescript/patterns.md` → código TypeScript

### Flujo obligatorio por tipo de tarea

**Feature nueva:**
search-first → plan → agentes especializados → DESIGN.md → voz skill → verification-loop → eval-harness → commit

**Componente visual:**
DESIGN.md → UI Designer + Brand Guardian → frontend-patterns → Accessibility Auditor → modo claro/oscuro → commit

**Endpoint o API:**
search-first → backend-patterns → security-review → Security Architect → tsc → commit

**Copy o texto:**
voz-tu-lugar-en-galicia SIEMPRE → nunca escribir copy sin esta skill

**Commit:**
Code Reviewer → Reality Checker → tsc 0 → lint 0 → build exit 0 → push

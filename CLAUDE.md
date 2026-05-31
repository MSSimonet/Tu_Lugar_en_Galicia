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
- `/docs/avoa-flujo.md` — flujo conversacional de Avoa (fuente de verdad del cuestionario)
- `/docs/avoa-barandas.md` — reglas de control del system prompt y arquitectura del widget de Avoa
- `/docs/contexto-estrategico.md` — contexto de negocio, marca y competencia
  (nota: la voz de marca descrita en ese doc usaba "vos" rioplatense; la decisión vigente es "tú" neutro — ver §6)
- `/docs/avoa-recursos-preparacion.md` — material de apoyo y recursos del asistente Avoa
- `/docs/legal-terminos-privacidad.md` — fuente de la política de privacidad real (datos fiscales pendientes de completar)

---

## 2. Stack BLOQUEADO (no proponer alternativas sin un ADR)

- **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Deploy:** Vercel (auto-deploy desde GitHub `main`)
- **DNS / SSL / CDN / cron del scraper:** Cloudflare (free)
- **Leads / CRM (Fase 1):** Airtable o Google Sheets — NO base de datos todavía
- **IA (Avoa):** API de Claude llamada desde API routes de Next.js (clave solo en servidor)
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
| IA | `AI Engineer` | `/app/api/avoa`, `/lib/ai` |
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
- Idioma del sitio: español (futuro: + portugués + inglés en Fase 6). Tono de marca: cálido,
  cercano, en "tú" neutro (español internacional). Nunca "vos", nunca "vosotros", nunca corporativo ni frío.
- Variables de entorno (claves) nunca en el código ni en el cliente: solo en `.env.local` y
  en las variables de entorno de Vercel.

---

## 7. Privacidad y RGPD (obligatorio, estás en la UE)

- Todo formulario que capta datos requiere consentimiento explícito y enlace a política de privacidad.
- El mapa de familias (Fase 5) solo muestra a quien dio permiso explícito; nunca calle ni número exacto.
- El scraping de supermercados (Fase 3) debe revisar términos de uso de cada sitio antes de activarse.
- Ante cualquier duda de datos personales, invocar al `Legal Compliance Checker`.

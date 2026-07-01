# Briefing — Tu Lugar en Galicia

> Pegá este archivo en un chat nuevo de Claude Code para orientarte al instante.

---

## 1. Qué es este proyecto

Web de **Tu Lugar en Galicia**: servicio de relocation especializado en Galicia para familias
emigrantes (principalmente de Latinoamérica) que necesitan alquiler antes de llegar.
Fundadora: **Silvana Lorenzo**. El sitio capta leads, los cualifica con la IA Gina y agenda
videollamadas con Silvana.

**Stack BLOQUEADO:** Next.js 16 App Router + TypeScript + Tailwind v4 + Vercel + Airtable.
IA: Gemini (no Claude). Sin base de datos hasta Fase 5.

---

## 2. Estado actual

| Área | Estado |
|---|---|
| Flujo de agenda completo (9 piezas) | ✅ Implementado |
| Gina (asistente IA) | ✅ Con rate limiting Upstash |
| PDF de plan estratégico | ✅ Auth + generación |
| Emails transaccionales (Resend) | ✅ |
| Recordatorio horario Silvana | ✅ GitHub Actions |
| Motor del plan estratégico | ✅ `lib/plan/armador.ts` |
| CSP + HSTS + Referrer-Policy | ✅ |
| Política de Privacidad | 🔴 4 TODOs sin completar |
| Rate limiting en `/api/lead` | ⚠️ Desactivado si no hay Upstash |

---

## 3. Flujo de negocio

1. Visita la web → rellena formulario de diagnóstico (`/api/lead`) o habla con Gina
2. Lead guardado en Airtable
3. Resumen diario llega a Silvana por email (`cron: 07:00 España`)
4. Silvana habilita agenda → lead recibe código + enlace Cal.com
5. Lead agenda videollamada
6. Cal.com dispara webhook → confirmación por email al lead + notificación a Silvana
7. Recordatorio automático 1 hora antes de cada videollamada
8. Silvana genera PDF del plan estratégico desde `/admin/lead/[id]`

---

## 4. Próximas prioridades

1. **Completar Política de Privacidad** (A04 — bloquea lanzamiento público)
   - Razón social, dirección postal, email de protección de datos
   - Archivo: `app/politica-de-privacidad/page.tsx`
2. **Completar env vars en producción** (Airtable, Cal.com, Resend, Upstash, AEMET)
3. **Test end-to-end** del flujo de agenda completo con datos reales
4. **Fase 3** — scraping de pisos (Idealista/Fotocasa) para cuadro comparativo

---

## 5. Pendientes de Silvana (no desbloqueables por código)

- Razón social y dirección para la Política de Privacidad
- Configurar webhook en Cal.com (URL: `/api/webhooks/calcom`)
- Crear tabla de Airtable con los campos del formulario
- Configurar dominio personalizado en Resend
- Subir env vars a Vercel (ver `.env.local.example`)
- Aprobar/desbloquear agenda de clientes manualmente desde el resumen diario

---

## 6. Cómo trabajar en este chat

- **Leer antes de tocar:** `CLAUDE.md`, `docs/roadmap.md`, `docs/ARCHITECTURE.md`
- **Nunca commitear sin que el usuario diga "commitear" / "aprobado, dale"**
- **Stack bloqueado:** no proponer PHP, base de datos antes de Fase 5, ni API de Anthropic
- **Tokens de Tailwind:** en `app/globals.css` (`@theme`), no en `tailwind.config.ts`
- **Agentes disponibles:** ver `CLAUDE.md §3`; usar en paralelo cuando sea posible
- **Auditoría permanente:** ver `CLAUDE.md §10` para incidencias abiertas
- **Voz de marca:** "tú" neutro para el cliente; "vos" solo en conversación interna con el equipo

---

## 7. Inventario completo de herramientas disponibles

### Agentes (`~/.claude/agents/`) — 100+ agentes por categoría

**Engineering**
`ai-engineer` · `backend-architect` · `code-reviewer` · `codebase-onboarding-engineer` · `data-engineer` · `database-optimizer` · `devops-automator` · `frontend-developer` · `git-workflow-master` · `incident-response-commander` · `minimal-change-engineer` · `mobile-app-builder` · `security-engineer` · `software-architect` · `sre` · `technical-writer` · `threat-detection-engineer` · `voice-ai-integration-engineer` · `ai-data-remediation-engineer` · `autonomous-optimization-architect` · `cms-developer` · `email-intelligence-engineer` · `embedded-firmware-engineer` · `feishu-integration-developer` · `filament-optimization-specialist` · `rapid-prototyper` · `senior-developer` · `solidity-smart-contract-engineer` · `wechat-mini-program-developer`

**Design**
`brand-guardian` · `ui-designer` · `ux-architect` · `ux-researcher` · `image-prompt-engineer` · `inclusive-visuals-specialist` · `visual-storyteller` · `whimsy-injector`

**Product**
`product-manager` · `sprint-prioritizer` · `behavioral-nudge-engine` · `feedback-synthesizer` · `trend-researcher`

**Testing / QA**
`accessibility-auditor` · `api-tester` · `evidence-collector` · `performance-benchmarker` · `reality-checker` · `test-results-analyzer` · `tool-evaluator` · `workflow-optimizer`

**Specialized (usados en TLeG)**
`agents-orchestrator` · `legal-compliance-checker` · `content-creator` · `seo-specialist` · `social-media-strategist`

**Project Management**
`project-shepherd` · `senior-project-manager` · `experiment-tracker` · `jira-workflow-steward` · `studio-operations` · `studio-producer`

**Strategy / Sales / Marketing / Finance / Support**
Ver `~/.claude/agents/{strategy,sales,marketing,finance,support,paid-media,specialized}/`

**Game Dev / Spatial / Academic**
Ver `~/.claude/agents/{game-development,spatial-computing,academic}/`

**Integrations** (wrappers para otras IAs/herramientas)
`aider` · `cursor` · `gemini-cli` · `github-copilot` · `windsurf` · `opencode` · `mcp-memory` · `openclaw` · `qwen` · `kimi`

---

### Skills globales (`~/.claude/skills/`)

| Skill | Cuándo usarla |
|---|---|
| `backend-patterns` | APIs, rutas Next.js, optimización DB |
| `frontend-patterns` | Componentes React/Next.js, estado, performance |
| `security-review` | Cualquier endpoint nuevo o dato sensible |
| `search-first` | Antes de escribir código nuevo (busca librerías/patrones) |
| `tdd-workflow` | Features nuevas o bugs (test primero) |
| `eval-harness` | Gates de calidad antes de commits |
| `verification-loop` | Verificación tras features grandes |
| `continuous-learning-v2` | Extraer patrones al cerrar sesión |

### Skills de proyecto (`.claude/skills/`)

| Skill | Cuándo usarla |
|---|---|
| `voz-tu-lugar-en-galicia` | **TODO el copy visible al cliente** — sin excepción |

---

### Rules (`~/.claude/rules/ecc/`)

**`common/`** — aplican a todos los proyectos
`agents.md` · `code-review.md` · `coding-style.md` · `development-workflow.md` · `git-workflow.md` · `hooks.md` · `patterns.md` · `performance.md` · `security.md` · `testing.md`

**`typescript/`** — aplican a archivos `.ts` / `.tsx`
`coding-style.md` · `hooks.md` · `patterns.md` · `security.md` · `testing.md`

---

### Hooks activos

| Evento | Origen | Descripción |
|---|---|---|
| `PreToolUse: Bash` | Plugin ECC (`ecc@ecc`) | Pre-bash dispatcher — quality, tmux, push y GateGuard checks |
| `PreToolUse: Write` | Plugin ECC | Validación antes de escribir archivos |
| `SessionStart` | Proyecto (`.claude/session-start.ps1`) | Inyecta estado de `docs/` y memoria al abrir sesión |

---

### Plugin instalado

| Plugin | Estado |
|---|---|
| `ecc@ecc` (Everything Claude Code) | ✅ Activo — registra hooks de calidad y orquestación |

---

### MCPs conectados (sesión actual)

| MCP | Herramientas clave |
|---|---|
| `Claude Preview` | `preview_start/stop/screenshot/snapshot/click/fill/inspect/logs` |
| `Claude in Chrome` | `navigate/find/form_input/javascript_tool/read_page/get_page_text` |
| `computer-use` | `screenshot/left_click/type/key/scroll/open_application` |
| `ccd_session` | `mark_chapter/spawn_task/dismiss_task/read_widget_context` |
| `ccd_session_mgmt` | `archive_session/search_session_transcripts/send_message` |
| `ccd_directory` | `request_directory` |
| `mcp-registry` | `list_connectors/search_mcp_registry/suggest_connectors` |
| `scheduled-tasks` | `create_scheduled_task/list_scheduled_tasks/update_scheduled_task` |

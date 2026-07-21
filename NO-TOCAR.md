# NO-TOCAR.md — Barrera de seguridad para la exploración de diseño

> Generado: 2026-07-17, rama `design/radical-explore`, antes de la Fase 2/3 de
> exploración radical de diseño. Lista completa de archivos con lógica funcional,
> verificada contra el código real (no solo por nombre de carpeta).

## Regla general

Todos los archivos listados abajo quedan **prohibidos para editar** durante este
trabajo, con una única excepción: **cambiar clases CSS/Tailwind de presentación
visual**. Eso significa:

- ✅ Permitido: cambiar `className="bg-po-areia"` por `className="bg-nueva-paleta"`, ajustar spacing, cambiar radios/sombras, agregar clases de animación ya definidas en `globals.css`/Tailwind.
- ❌ Prohibido: tocar lógica, imports, props, estructura de datos, llamadas a `fetch`/API, hooks de estado, validaciones, tipos, o cualquier `.ts`/`.json` que no sea de estilos.

Si en algún momento de la Fase 3-5 hace falta tocar algo de esta lista más allá de
clases visuales: **PARAR y preguntar**, según indica la Fase 4 del encargo.

---

## 1. Núcleo explícito (carpetas nombradas)

### `api/gina`
- `app/api/gina/route.ts` — endpoint serverless del motor de Gina (rate limiting, validación de origen, orquestación de sesión).

### `lib/gina`
- `lib/gina/flow.json` — árbol de conversación (fuente de verdad del flujo, ver `docs/gina-flujo.md`)
- `lib/gina/flowEngine.ts` — motor de ejecución del flujo
- `lib/gina/scoring.ts` — cálculo de calificación de leads (`calcularCalificacion`, usado también por `api/lead`)
- `lib/gina/session.ts` — manejo de sesión de conversación
- `lib/gina/sessionStorage.ts` — persistencia de sesión
- `lib/gina/transcripcion.ts` — generación de transcripción para el panel admin

### `api/lead`
- `app/api/lead/route.ts` — handler POST del formulario de diagnóstico (valida, construye `LeadData`, llama a `saveLead()`)
- `lib/leads.ts` — capa de guardado de leads (Supabase), consumida por `api/lead` y `scoring.ts`

### `api/clima`
- `app/api/clima/[ciudad]/route.ts` — conexión directa a AEMET (`AEMET_BASE`, `AEMET_CODIGOS`)

---

## 2. Hallazgos de la auditoría de conexiones (Airtable / Gemini / AEMET)

### Airtable — ✅ ya no existe conexión real
Se migró por completo a Supabase (2026-07-12 leads, 2026-07-16 Comunidad). Los
archivos abajo **conservan el nombre `AirtableRecord`** como tipo legacy, pero ya
no hablan con la API de Airtable — igual quedan protegidos porque son capa de
datos funcional de leads:
- `lib/admin/leadsRepo.ts` — capa de datos de leads sobre Supabase (tipo `AirtableRecord` es nombre heredado)
- `lib/leads.ts` (ya listado arriba en §1)

Uso de `lib/admin/leadsRepo.ts` (consumidores, también protegidos por depender de esta capa):
- `app/api/admin/resumen-diario/route.ts`
- `app/api/admin/recordatorio-silvana/route.ts`

### Gemini — ✅ no hay integración activa en el código
Búsqueda de `GEMINI_API_KEY` y llamadas a la API de Gemini en `/app` y `/lib`: **cero
resultados en código**. `.env.local.example` confirma que la variable fue eliminada
("ADR-008 superseded, 2026-07-16: se descartó integrar un LLM externo para Gina
para evitar alucinaciones en temas de visado/documentación migratoria. Gina es y
sigue siendo un motor de reglas determinista"). Esto contradice lo que dice
`CLAUDE.md` §2 sobre el stack de IA — **es una discrepancia de documentación, no
un archivo para proteger**, ya que no hay código que la implemente. Aviso aparte
al usuario, no se resuelve en este trabajo (fuera de alcance de una exploración
de diseño).

### AEMET — ✅ conexión real confirmada
- `app/api/clima/[ciudad]/route.ts` (ya listado en §1)
- `components/ciudad/ClimaActual.tsx` — hace `fetch('/api/clima/${slug}')` y renderiza el resultado. Contiene lógica de fetching + estado, no es solo presentación → protegido, con la excepción CSS/Tailwind de la regla general.

---

## 3. Widget de Gina — regla especial (forma/color/animación sí, funcionamiento no)

Estos componentes son la interfaz visual de Gina. Por instrucción explícita: se
puede tocar **forma, color y animación**, pero **nunca su funcionamiento interno**
(lógica de conversación, manejo de estado, llamadas a `/api/gina`).

- `components/gina/GinaWidget.tsx`
- `components/gina/GinaConversation.tsx`
- `components/gina/useGinaEditor.tsx`
- `components/gina/GinaButtons.tsx`
- `components/gina/GinaInput.tsx`
- `components/gina/GinaMessages.tsx`

En la práctica: cambiar `className`, agregar/cambiar animaciones GSAP en las
transiciones de apertura/cierre o de mensajes, cambiar la paleta del bubble —
sí. Cambiar cómo se arma el payload que se manda a `/api/gina`, el manejo de
`useState`/`useEffect` de la sesión, o los tipos del flujo — no.

---

## 4. Fuera de alcance de esta lista (no hace falta protegerlos, no tienen superficie visual)

Por completitud — estos archivos backend-only fueron revisados y **no aplica**
protegerlos explícitamente porque una exploración de diseño (CSS/componentes)
no tiene ninguna razón para tocarlos, no exponen JSX/estilos:
`lib/admin/*` (auth, tokens, email, codes, etc.), el resto de `app/api/admin/**`,
`app/api/webhooks/calcom/route.ts`, `app/api/comunidad/**`, `app/api/auth/**`.
Si en algún punto de la Fase 3-5 se detecta la necesidad de tocar alguno de estos,
igual aplica la regla de PARADA del encargo.

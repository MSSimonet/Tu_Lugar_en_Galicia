# Auditoría del Plan Estratégico — Pendientes

> **Fecha inicial:** 19 de junio de 2026
> **Segunda pasada:** 19 de junio de 2026 (volcado de mapeo-gina-plan.md)
> **Alcance:** sincronización completa entre `lib/gina/flow.json` (fuente de verdad del código),
> `docs/plan-estrategico.md`, `docs/tramites-galicia.md`, `docs/frases-puente.md` y
> `docs/mapeo-gina-plan.md`.
> **Método:** lectura exhaustiva de todas las fuentes, comparación campo por campo de todos los
> valores de Gina contra las reglas de inclusión del plan, y verificación uno a uno de los 55
> trámites, sus referencias cruzadas y sus frases puente.

---

## 1. Trámites sin fuente oficial verificada

**Resultado: 0 de 55.**

Los 55 trámites de `tramites-galicia.md` tienen ficha completa con fuente oficial. Ninguno está
marcado [SIN FUENTE OFICIAL — VERIFICAR]. La última revisión normativa incorporó el RD 1155/2024
(en vigor desde 20/05/2025) y corrigió los trámites 5, 10, 39, 44 y 45.

---

## 2. Discrepancias corregidas (historial completo)

### Primera pasada (commit `ce59d81`)

| # | Ubicación | Antes | Después |
|---|---|---|---|
| D1 | plan-estrategico.md, P8 | Label: "Visado / TIE / NIE ya aprobado" | "Residencia / TIE / NIE ya aprobado" *(value: `residencia-aprobada`)* |
| D2 | plan-estrategico.md, P8 | Rama `nacionalidad-en-tramite` no existía | Añadida con TODO-PLAN y lógica tentativa |
| D3 | plan-estrategico.md, P8 | Label: "Soy español/a (pasaporte español) sin DNI" | Eliminado "sin DNI" + nota de que Gina no pregunta si ya tiene DNI |
| D4 | plan-estrategico.md, P8 | Label: "En trámite de visado" | "En trámite de visado o residencia" *(value: `en-tramite`)* |
| D5 | plan-estrategico.md, P9 | Rama `jubilado` no existía | Añadida con TODO-PLAN y lógica tentativa |
| D6 | plan-estrategico.md, P9 | Label: "Otra / sin empleo aún" | "Otra / por el momento sin empleo" *(value: `busca-empleo`)* |
| D7 | plan-estrategico.md, P9 | Rentista decía "(ver P20)" | Eliminada referencia rota |
| D8 | plan-estrategico.md, P20 | Sección asumía que la pregunta existía en Gina | Añadida advertencia: pregunta P20 no existe en flow.json |
| D9 | plan-estrategico.md, header | "fichas de los 45 trámites" | "fichas de los 55 trámites" |
| D10 | plan-estrategico.md, Parte 3 | "nunca se muestran los 45" | "nunca se muestran los 55" |
| D11 | frases-puente.md, header | "catálogo (1–45)" | "catálogo (1–55)" |
| D12 | plan-estrategico.md, P8/P9 | Sin values de flow.json | Añadido *(value: `xxx`)* en cada fila |

### Segunda pasada — decisiones críticas (commit `968ca98`)

| # | Ubicación | Antes | Después |
|---|---|---|---|
| D13 | plan-estrategico.md, P8 | `nacionalidad-en-tramite` con TODO-PLAN | Regla definitiva: mantiene residencia + `[12]` renovación; al obtener → `[16]` Concordancia + `[46]`/`[47]` DNI |
| D14 | plan-estrategico.md, P9 | `jubilado` con TODO-PLAN | Regla definitiva: tratado como rentista, sin alta laboral, remite a sección Salud |
| D15 | plan-estrategico.md, P20 | Sección "P20" con advertencia de pregunta fantasma | Reemplazada por sección fija "Salud / SERGAS" con tabla de dos vías (pública + privada) y casos especiales |
| D16 | plan-estrategico.md, P9 | Rentista: nota temporal sobre P20 | Referencia a "sección Salud" |
| D17 | plan-estrategico.md, Fase E | "*(según P20)*" | "*(sección fija)*" |

### Segunda pasada — ajustes menores (commit `af7dae6`)

| # | Ubicación | Antes | Después |
|---|---|---|---|
| D18 | plan-estrategico.md, P7 | `[55]` PPP en tabla como trámite activable | Sacado de tabla; convertido en nota condicional fuera de la tabla |
| D19 | plan-estrategico.md, P6 | "Vienen niños/as en edad escolar" (conceptual) | Regla por conteo: `ninos ≥ 1` o `adolescentes ≥ 1` |
| D20 | plan-estrategico.md, Parte 3 | `[12]` y `[16]` listados solo como "de borde" | Anotados como activables por `nacionalidad-en-tramite` |

---

## 3. Puntos críticos — ✅ TODOS RESUELTOS

Los 3 TODO-PLAN de la primera pasada fueron resueltos en la segunda pasada con las reglas
definitivas de `mapeo-gina-plan.md`:

### 3.1 P8: `nacionalidad-en-tramite` — ✅ RESUELTO

- **Regla aplicada:** ya reside legalmente → mantiene residencia actual + `[12]` Renovación si está
  por vencer. Al obtener la nacionalidad → `[16]` Certificado de Concordancia + `[46]`/`[47]` primer
  DNI. No requiere ficha nueva.
- **Commit:** `968ca98`

### 3.2 P9: `jubilado` — ✅ RESUELTO

- **Regla aplicada:** sin alta laboral en España, tratado como rentista a efectos de SS. Cobertura
  sanitaria por convenio internacional de pensiones o seguro privado (remite a sección Salud). No
  requiere ficha nueva.
- **Commit:** `968ca98`

### 3.3 Salud (ex-"P20") — ✅ RESUELTO

- **Decisión aplicada:** opción (b) — no se añade pregunta a Gina. Se convierte en sección fija que
  el plan incluye siempre, con tabla de dos vías (pública SERGAS + privada) y casos especiales
  (`[31]` TSE, `[32]` Galicia Saúde Exterior). Eliminada toda referencia a "P20" como pregunta.
- **Commit:** `968ca98`

---

## 4. Estado de las frases puente

| Métrica | Resultado |
|---|---|
| Trámites con frase puente | **55 / 55** (100%) |
| Faltantes | **0** |
| Pasada final de tono (Carnegie + psicología/narrativa) | **Pendiente** — las frases están marcadas como "borradores funcionales" en el header |

---

## 5. Observaciones menores

### 5.1 P8 `espanol`: ambigüedad DNI — pendiente
Gina no distingue entre "español con DNI" y "español sin DNI". Si alguien con pasaporte español
Y DNI vigente selecciona `espanol`, el plan le incluiría `[46]`+`[47]` innecesariamente.
**Solución sugerida:** añadir una sub-pregunta en flow.json: "¿Ya tienes DNI español?" (Sí/No).

### 5.2 P6 menores — ✅ RESUELTO (commit `af7dae6`)
Regla reescrita por conteo real (`ninos ≥ 1` o `adolescentes ≥ 1`) con nota de que `p6b_menores`
solo enruta.

### 5.3 P7 PPP — ✅ RESUELTO (commit `af7dae6`)
`[55]` convertido en nota condicional dentro del bloque de mascotas. No depende de ningún dato del
cuestionario; se ofrece como aviso para que la persona lo verifique.

### 5.4 `mapeo-gina-plan.md` — ✅ RESUELTO
El archivo ahora existe en `docs/mapeo-gina-plan.md` y fue usado como fuente para la segunda pasada.

### 5.5 `brief-completar-tramites.md` — ✅ RESUELTO
El archivo ahora existe en `docs/brief-completar-tramites.md`.

---

## 6. Pendientes reales (lo que queda por hacer)

### Documentación
1. **Pasada final de tono** sobre las 55 frases puente y los textos fijos del plan (Carnegie +
   psicología/narrativa). Las frases están marcadas como "borradores funcionales".
2. **Sub-pregunta de DNI para españoles** (§5.1): decidir si se añade a flow.json para evitar
   incluir `[46]`+`[47]` innecesariamente a españoles que ya tienen DNI.

### Código (NO existe todavía — a implementar en sprints futuros)
3. **Módulo de armado del plan** — lógica en `/lib/plan/` que tome las respuestas del lead y
   ensamble el documento personalizado (fichas + frases puente + textos fijos).
4. **Generación de PDF** — renderizar el plan armado como PDF descargable o adjunto de email.
5. **Integración Resend** — envío del Plan Estratégico por email al lead. Actualmente Gina dice
   "en los próximos 2 días hábiles" porque no hay envío automático; el texto futuro con email ya
   está preparado en el campo `_texto_futuro_email` de `despedida` en flow.json.
6. **Integración Gemini** — para los microajustes de personalización mencionados en las notas de
   implementación del plan (`GEMINI_API_KEY` no configurada aún).

### Orden sugerido de ejecución
1. Pasada de tono de frases puente (Brand Guardian + Narratologist → 2-3 h)
2. Módulo de armado en código (Backend Architect + Frontend Developer → sprint)
3. Generación de PDF (Frontend Developer → sprint)
4. Integración Resend (Backend Architect → medio sprint)
5. Integración Gemini para microajustes (AI Engineer → sprint posterior)

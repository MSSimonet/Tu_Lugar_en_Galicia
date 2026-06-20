# Auditoría del Plan Estratégico — Pendientes

> **Fecha:** 19 de junio de 2026
> **Alcance:** sincronización completa entre `lib/gina/flow.json` (fuente de verdad del código),
> `docs/plan-estrategico.md`, `docs/tramites-galicia.md` y `docs/frases-puente.md`.
> **Método:** lectura exhaustiva de las cuatro fuentes, comparación campo por campo de todos los
> valores de Gina contra las reglas de inclusión del plan, y verificación uno a uno de los 55
> trámites, sus referencias cruzadas y sus frases puente.

---

## 1. Trámites sin fuente oficial verificada

**Resultado: 0 de 55.**

Los 55 trámites de `tramites-galicia.md` tienen ficha completa con fuente oficial. Ninguno está
marcado [SIN FUENTE OFICIAL — VERIFICAR]. La última revisión normativa incorporó el RD 1155/2024
(en vigor desde 20/05/2025) y corrigió los trámites 5, 10, 39, 44 y 45.

---

## 2. Discrepancias corregidas en esta auditoría (antes / después)

| # | Ubicación | Antes | Después |
|---|---|---|---|
| D1 | plan-estrategico.md, P8 | Label: "Visado / TIE / NIE ya aprobado" | "Residencia / TIE / NIE ya aprobado" *(value: `residencia-aprobada`)* — alineado con flow.json |
| D2 | plan-estrategico.md, P8 | Rama `nacionalidad-en-tramite` no existía | Añadida con TODO-PLAN y lógica tentativa |
| D3 | plan-estrategico.md, P8 | Label: "Soy español/a (pasaporte español) sin DNI" | Eliminado "sin DNI" + nota de que Gina no pregunta si ya tiene DNI |
| D4 | plan-estrategico.md, P8 | Label: "En trámite de visado" | "En trámite de visado o residencia" *(value: `en-tramite`)* |
| D5 | plan-estrategico.md, P9 | Rama `jubilado` no existía | Añadida con TODO-PLAN y lógica tentativa |
| D6 | plan-estrategico.md, P9 | Label: "Otra / sin empleo aún" | "Otra / por el momento sin empleo" *(value: `busca-empleo`)* |
| D7 | plan-estrategico.md, P9 | Rentista decía "(ver P20)" | Eliminada referencia rota; nota de que no hay pregunta de salud en Gina |
| D8 | plan-estrategico.md, P20 | Sección asumía que la pregunta existía en Gina | Añadida advertencia: pregunta P20 de salud NO existe en flow.json |
| D9 | plan-estrategico.md, header | "fichas de los 45 trámites" | "fichas de los 55 trámites" |
| D10 | plan-estrategico.md, Parte 3 | "nunca se muestran los 45" | "nunca se muestran los 55" |
| D11 | frases-puente.md, header | "catálogo (1–45)" | "catálogo (1–55)" |
| D12 | plan-estrategico.md, todas las filas P8/P9 | Sin values de flow.json | Añadido *(value: `xxx`)* en cada fila para trazabilidad |

**Commit:** `ce59d81` — `docs(plan): corregir discrepancias entre flow.json y plan-estrategico.md`

---

## 3. Valores de Gina sin rama definida en el plan (TODO-PLAN)

Estos valores existen en `lib/gina/flow.json` pero el plan no tiene reglas de inclusión completas
para ellos. Se marcaron con `// TODO-PLAN` en `plan-estrategico.md`.

### 3.1 P8: `nacionalidad-en-tramite`

- **Label en Gina:** "Tengo o estoy tramitando la nacionalidad española"
- **Estado:** TODO-PLAN añadido con lógica tentativa
- **Lógica sugerida (a confirmar):**
  - Si la nacionalidad ya se concedió → régimen español: `[46]` partida de nacimiento + `[47]` primer DNI (si falta)
  - Si sigue en trámite → mantiene la TIE vigente + `[12]` renovación hasta resolución
- **Acción requerida:** Silvana confirma el criterio en la videollamada; luego se escribe la regla definitiva

### 3.2 P9: `jubilado`

- **Label en Gina:** "Jubilado/a"
- **Estado:** TODO-PLAN añadido con lógica tentativa
- **Lógica sugerida (a confirmar):**
  - Sin alta laboral activa
  - Si cobra pensión de país con convenio bilateral de SS → `[24]` NUSS para cobrar la pensión; `[27]` SERGAS si acredita derecho por convenio
  - Si no hay convenio → seguro privado al inicio
- **Acción requerida:** Confirmar con un gestor de SS qué convenios dan acceso directo al SERGAS para jubilados

### 3.3 P20: pregunta de salud inexistente

- **Estado:** Sección P20 completa del plan referencia una pregunta que nunca se implementó en Gina
- **Impacto:** Los trámites `[27]` SERGAS, `[28]` Beneficiarios y `[32]` Galicia Saúde Exterior no tienen activación automática desde el cuestionario
- **Opciones:**
  - **(a)** Añadir una pregunta de salud al flujo de Gina (modificar flow.json)
  - **(b)** Inferir la activación automáticamente: quienes cotizan en SS (P9 = cuenta-ajena, autonomo, o teletrabajo con alta) ya tienen derecho → incluir `[27]`+`[28]` siempre que haya alta; para los demás, indicar "a resolver en la videollamada"
- **Acción requerida:** Decisión de producto sobre cuál opción tomar

---

## 4. Estado de las frases puente

| Métrica | Resultado |
|---|---|
| Trámites con frase puente | **55 / 55** (100%) |
| Faltantes | **0** |
| Pasada final de tono (Carnegie + psicología/narrativa) | **Pendiente** — las frases están marcadas como "borradores funcionales" en el header |

---

## 5. Otras observaciones menores

### 5.1 P8 `espanol`: ambigüedad DNI
Gina no distingue entre "español con DNI" y "español sin DNI". Si alguien con pasaporte español
Y DNI vigente selecciona `espanol`, el plan le incluiría `[46]`+`[47]` innecesariamente.
**Solución sugerida:** añadir una sub-pregunta en flow.json: "¿Ya tienes DNI español?" (Sí/No).

### 5.2 P6 menores: mapeo conceptual
El plan dice "Vienen niños/as en edad escolar" → `[37]`+`[38]` pero no especifica qué combinación
de valores de `p6b_menores` / `p6c_ninos` / `p6d_adolescentes` activa la regla.
**Solución sugerida:** la regla se activa si `p6b_menores = "si"` Y (`p6c_ninos > 0` O `p6d_adolescentes > 0`).

### 5.3 P7 PPP: sin criterio de activación
El plan dice `[55]` PPP "solo si es raza potencialmente peligrosa" pero Gina pregunta tipo
(perro/gato/otro) y peso (0-5/5-10/+10 kg), sin preguntar la raza directamente. No hay forma
automática de determinar PPP desde flow.json.
**Solución sugerida:** añadir una sub-pregunta en flow.json para perros: "¿Tu perro es de una raza
considerada potencialmente peligrosa (PPP)?" (Sí/No/No sé). Si "No sé" → nota en el plan de
verificarlo en la videollamada.

### 5.4 `mapeo-gina-plan.md` no existe
El briefing de la auditoría lo referencia como fuente, pero el archivo no está en el repositorio.
Si se creó en una sesión anterior sin commitear, se perdió. Las correcciones que habría contenido
se aplicaron directamente desde flow.json en esta auditoría.

### 5.5 `brief-completar-tramites.md` no existe
Referenciado en el briefing pero ausente del repositorio.

---

## 6. Próximos pasos para completar el Plan Estratégico end-to-end

### Documentación pendiente
1. **Resolver los 3 TODO-PLAN** (§3): nacionalidad-en-tramite, jubilado, pregunta de salud
2. **Pasada de tono** sobre las 55 frases puente (Carnegie + psicología/narrativa)
3. **Definir las 3 sub-preguntas sugeridas** (§5): DNI para españoles, criterio de menores, raza PPP

### Código pendiente (NO implementar en esta sesión)
4. **Módulo de armado del plan** — lógica en `/lib/plan/` que tome las respuestas del lead y ensamble el documento personalizado (fichas + frases puente + textos fijos)
5. **Generación de PDF** — renderizar el plan armado como PDF descargable o adjunto de email
6. **Integración Gemini** — para los microajustes de personalización mencionados en las notas de implementación del plan (`GEMINI_API_KEY` no configurada aún)
7. **Integración Resend** — envío del Plan Estratégico por email al lead (actualmente Gina dice "en los próximos 2 días hábiles" porque no hay envío automático; el texto futuro con email ya está preparado en el campo `_texto_futuro_email` de `despedida` en flow.json)
8. **Pregunta de salud en Gina** — si se opta por la opción (a) del §3.3, modificar flow.json

### Orden sugerido de ejecución
1. Resolver TODO-PLANs (decisión de producto → 30 min)
2. Pasada de tono de frases puente (Brand Guardian + Narratologist → 2-3 h)
3. Módulo de armado en código (Backend Architect + Frontend Developer → sprint)
4. Generación de PDF (Frontend Developer → sprint)
5. Integración Resend (Backend Architect → medio sprint)
6. Integración Gemini para microajustes (AI Engineer → sprint posterior)

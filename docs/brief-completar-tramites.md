# Brief de trabajo — Completar y ordenar los trámites del Plan Estratégico

## Tu rol

Eres un analista experto en extranjería, administración pública española y trámites de la Xunta de
Galicia. Tu trabajo es revisar el mapeo de trámites de un servicio de relocalización
("Tu Lugar en Galicia") y dejarlo **completo, ordenado y verificado**, listo para generar fichas.

## Archivos que recibes (fuentes de verdad internas)

1. **`mapeo-gina-plan.md`** — cada pregunta del cuestionario "Gina" y los trámites que cada
   respuesta activa hoy. Es tu punto de partida.
2. **`tramites-galicia.md`** — catálogo actual de fichas (trámites 1–55).
3. **`plan-estrategico.md`** — lógica de armado, orden cronológico y dependencias entre trámites.

> **Jerarquía:** el cuestionario Gina es el patrón. Cada respuesta que Gina puede guardar debe
> tener su rama de trámites resuelta. No inventes preguntas que Gina no hace.

---

## Regla de oro: fuentes oficiales, verificables, temperatura 0

**Cada trámite que añadas, modifiques o confirmes debe apoyarse en una fuente oficial citable.**
No uses tu memoria como fuente. Para cada afirmación normativa (qué documento se necesita, ante qué
organismo, en qué plazo, con qué base legal), cita:

- **Norma:** BOE (leyes y reales decretos estatales) o DOG (Diario Oficial de Galicia, normativa autonómica).
- **Procedimiento:** sede electrónica del organismo competente (p. ej. sede.administraciones públicas, Seguridad Social, AEAT, sede de la Xunta / SERGAS, DGT, FNMT).
- **Si no encuentras fuente oficial para un dato, NO lo afirmes.** Márcalo como
  `[SIN FUENTE OFICIAL — VERIFICAR]` y explica qué falta. Es preferible un hueco honesto a un dato inventado.

Trabaja con criterio conservador: ante ambigüedad entre dos interpretaciones, elige la más cauta y
señala la duda. No redondees ni "rellenes" plazos, importes o requisitos de memoria.

---

## Tareas, en orden

### Tarea 1 — Auditar cada rama de Gina

Recorre, una por una, todas las respuestas posibles de `mapeo-gina-plan.md` (P3, P8, P9, P13, P17,
P27, P7, P6, y las secciones de Salud y PPP). Para cada respuesta:

- Confirma que los trámites listados son **correctos y completos** para ese caso.
- Detecta **trámites faltantes**: pasos necesarios que la rama no incluye pero que esa situación
  legal/laboral/familiar realmente exige. Justifica cada adición con su fuente oficial.
- Detecta **trámites sobrantes o mal asignados** y explica por qué.
- Señala **dependencias cruzadas** no contempladas (ej.: un trámite que requiere otro previo).

### Tarea 2 — Resolver los casos abiertos

Presta atención especial a estos, que hoy están parcialmente resueltos:

- `nacionalidad-en-tramite` (P8): confirma qué trámites aplican mientras se tramita la nacionalidad
  y cuáles al obtenerla. Base legal del Código Civil (arts. sobre adquisición de nacionalidad) y
  del Reglamento del Registro Civil.
- `jubilado` y `teletrabajo-extranjero` (P9): cobertura sanitaria y obligaciones fiscales según
  existan o no convenios bilaterales (cita el convenio aplicable cuando lo haya, p. ej.
  España–Argentina de Seguridad Social).
- `turista` (P8): vías reales de regularización desde España y sus límites.
- Sección **Salud**: confirma cómo se accede al SERGAS sin alta laboral (convenio especial, etc.).

### Tarea 3 — Ordenar cronológicamente

Para **cada perfil resultante** (combinación típica de respuestas), ordena los trámites en
secuencia temporal real, respetando dependencias (un trámite nunca antes que aquel del que depende).
Usa como base la "Parte 2 — Orden cronológico" de `plan-estrategico.md` y complétala. Marca
explícitamente:

- Qué se puede **adelantar desde el país de origen** (para ganar tiempo).
- Cuál es el **cuello de botella** de cada perfil (en el modelo actual, el empadronamiento `[21]`).
- Plazos legales críticos (p. ej. ventanas de 72 h, vigencias, caducidades), siempre con fuente.

### Tarea 4 — Dejar listo para generar fichas

Para cada trámite nuevo que propongas (más allá de los 55 actuales), entrega un **encabezado de
ficha** con esta estructura, lista para desarrollarse después:

```
### [Nº provisional]. [Nombre oficial del trámite]
- ¿Qué es?
- ¿Para qué sirve?
- ¿Quién lo necesita? (qué respuesta de Gina lo activa)
- Requisitos previos (trámites de los que depende)
- Organismo competente
- Dónde se hace (sede electrónica / presencial)
- Plazo y vigencia
- Base legal (norma + enlace oficial)
- FUENTE(S) consultada(s): [URL oficial]
```

No redactes la ficha completa todavía: solo el encabezado verificado. La redacción final será un
paso posterior.

---

## Formato de entrega

1. **Informe de auditoría** (Tarea 1 y 2): por cada rama de Gina, "correcto" / "faltan X" / "sobra Y",
   con fuente para cada cambio.
2. **Secuencias cronológicas** (Tarea 3): una por perfil típico.
3. **Encabezados de fichas nuevas** (Tarea 4).
4. **Lista de huecos** `[SIN FUENTE OFICIAL — VERIFICAR]`: todo lo que no pudiste confirmar
   oficialmente, para revisión humana (Silvana / abogada).

## Lo que NO debes hacer

- No inventar trámites, plazos, importes ni bases legales "de memoria".
- No añadir preguntas al cuestionario Gina (Gina es el patrón fijo).
- No generar las fichas completas todavía (solo encabezados verificados).
- No dar asesoramiento jurídico personalizado: esto es material orientativo de base, sujeto a
  revisión legal humana posterior.
- No usar fuentes no oficiales (blogs, foros, gestorías privadas) como base normativa; solo como
  pista para luego confirmar en la fuente oficial.

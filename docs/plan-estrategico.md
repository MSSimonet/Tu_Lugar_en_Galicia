# Plan Estratégico — documento maestro de armado

> **Qué es:** la plantilla y la lógica con que se arma el **Plan Estratégico** personalizado que
> recibe cada persona. No contiene las fichas de los trámites (están en `tramites-galicia.md`) ni
> las frases puente (están en `frases-puente.md`): las **reúne** según las respuestas del cuestionario.
>
> **Fuentes:** `tramites-galicia.md` (fichas de los 55 trámites) · `frases-puente.md` (una frase por
> trámite) · este archivo (textos fijos + lógica de armado).
> Revisión: 19 de junio de 2026 (auditoría de sincronización con flow.json).

---

## Estructura del documento que recibe la persona

1. **Introducción cálida** (texto fijo, abajo).
2. **Trámites personalizados**, agrupados por etapa. Cada trámite se arma así:
   - su **frase puente** (de `frases-puente.md`, por número) +
   - su **ficha completa** (de `tramites-galicia.md`, por número).
   Qué trámites se incluyen y en qué orden lo define la "Lógica de armado" (sección siguiente).
3. **Preparación económica y de vivienda** (texto fijo, abajo).
4. **Cierre** (texto fijo, abajo).

---

## 1. Introducción cálida  *(texto fijo)*

Hola, {{NOMBRE}}. Antes de cualquier trámite, queremos reconocer algo: decidir mudarte a Galicia es un paso enorme, y el solo hecho de estar preparándolo con cuidado ya dice mucho de ti.

Este plan lo armamos a tu medida, con todo lo que nos contaste. Piénsalo como el mapa de tu propio camino: cada paso en su orden, sin nada que no necesites. Verás que buena parte ya la tienes encaminada —y eso es una ventaja real— y que lo que queda son etapas naturales que iremos recorriendo juntos. Tú llevas el rumbo; nosotros caminamos a tu lado.

*Esta es una guía orientativa, no asesoramiento jurídico. Para dudas concretas de tu caso, te recomendamos consultar con un abogado especialista en extranjería.*

---

## 2. Lógica de armado de los trámites

## Parte 1 — Reglas de inclusión por respuesta

### P3 · Origen

| Respuesta | Trámites que se activan |
|---|---|
| **Vengo de fuera** | `[1]` Antecedentes penales · `[2]` Apostilla · `[3]` Traducción oficial (jurada) · y la rama de visado/identidad según P8. Empieza el "Paso 0 — antes de salir". |
| **Ya vivo en España** | Se omite el "Paso 0 — antes de salir" (1–4) y la Declaración de entrada `[6]`. Se asume identidad/residencia ya resuelta; el plan se centra en lo que le falte (empadronamiento, sanidad, homologación, conducir…). |

### P8 · Situación legal (define la vía de identidad y residencia)

| Respuesta | Trámites que se activan |
|---|---|
| **Soy español/a (pasaporte español)** *(value: `espanol`)* | `[46]` Partida de nacimiento para primer DNI (desde origen) · `[47]` Expedición del primer DNI en Galicia. **NO** lleva CUE, NIE, TIE ni visado: como español entra y reside con plenos derechos. ⚠️ *Gina no pregunta si ya tiene DNI; si lo tiene, estos trámites no aplican — confirmar en videollamada.* |
| **Soy de otro país de la UE / EEE / Suiza** *(value: `ue-otro`)* | `[8]` CUE (Certificado de Registro UE). **NO** lleva NIE/TIE (régimen comunitario RD 240/2007). Si trae familiares extracomunitarios → `[9]` Tarjeta de familiar de UE. |
| **Residencia / TIE / NIE ya aprobado** *(value: `residencia-aprobada`)* | `[11]` Toma de huellas + TIE (si aún no la tiene físicamente). Más adelante: `[12]` Renovación cuando corresponda. |
| **En trámite de visado o residencia** *(value: `en-tramite`)* | `[5]` Visado tipo D · `[6]` Declaración de entrada (si aplica) · `[7]` NIE · `[11]` Toma de huellas + TIE. |
| **Entraré como turista** *(value: `turista`)* | Caso a analizar. Vía habitual: `[5]` Visado/autorización desde España (p. ej. Nómada Digital) · `[7]` NIE · `[11]` TIE. Nota interna: limita opciones; se estudia en videollamada. |
| **Tengo o estoy tramitando la nacionalidad española** *(value: `nacionalidad-en-tramite`)* | `// TODO-PLAN: definir trámites para este valor nuevo de Gina.` Posible lógica: si la nacionalidad ya se concedió → régimen español (`[46]`+`[47]` si falta DNI); si sigue en trámite → mantiene la TIE vigente + `[12]` renovación hasta resolución. *Confirmar criterio en la videollamada.* |

> *Familiar de ciudadano español* (no es opción directa del cuestionario, surge en P6/videollamada): `[10]` Autorización de residencia de familiares de españoles (régimen propio, RD 1155/2024).

### P9 · Situación laboral (define la vía de Seguridad Social)

| Respuesta | Trámites que se activan |
|---|---|
| **Cuenta ajena con nómina en España** *(value: `cuenta-ajena`)* | `[24]` Nº Seguridad Social (NUSS/NAF) · `[25]` Alta en Régimen General (la gestiona la empresa). |
| **Autónomo registrado en España** *(value: `autonomo`)* | `[23]` Alta censal AEAT (036/037) · `[24]` NUSS/NAF · `[26]` Alta en RETA. |
| **Teletrabajo para empresa extranjera** *(value: `teletrabajo-extranjero`)* | Depende del país de origen (convenio) y del tipo de contrato. Si hay **convenio bilateral** (Argentina, Colombia, etc.): puede cotizar en su país 1–2 años; sin alta en España al inicio. Si cotiza aquí como **autónomo** → `[23]` + `[24]` + `[26]`. Con **visado de nómada digital** puede acogerse al régimen fiscal especial (Ley Beckham). *Orientación inicial; el detalle se confirma con un gestor o la AEAT.* |
| **Rentista / fondos propios** *(value: `rentista`)* | Sin alta laboral. Cobertura sanitaria por convenio bilateral de Seguridad Social o seguro privado. *(No hay pregunta de salud en Gina — ver nota en la sección P20.)* |
| **Jubilado/a** *(value: `jubilado`)* | `// TODO-PLAN: definir trámites para "jubilado".` Posible lógica: sin alta laboral activa; si cobra pensión de país con convenio bilateral de SS → `[24]` NUSS para cobrar la pensión en España; `[27]` SERGAS si acredita derecho por convenio. Si no hay convenio → seguro privado al inicio. *Confirmar criterio en la videollamada.* |
| **Estudiante** *(value: `estudiante`)* | `[48]` Visado / estancia por estudios. Sin alta laboral (salvo trabajo parcial ≤30 h). Sanidad por el seguro del propio visado. |
| **Otra / por el momento sin empleo** *(value: `busca-empleo`)* | Tu situación laboral se irá definiendo; cuando tengas empleo o actividad, aplican los pasos de Seguridad Social correspondientes (`[24]` + `[25]`/`[26]` según el caso). |

### P13 · Cuenta bancaria en España

| Respuesta | Trámites que se activan |
|---|---|
| **No** | `[4]` Apertura de cuenta de no residente (se hace en el "Paso 0", antes de viajar). |
| **Sí** | Se omite `[4]`. |

### P17 · Licencia de conducir

| Respuesta | Trámites que se activan |
|---|---|
| **De mi país de origen** | `[43]` Examen psicofísico (CRC). Luego: si su país tiene convenio → `[44]` Canje; si no → `[45]` Exámenes DGT (permiso nuevo). |
| **Española / Europea** | Ninguno (válidas para conducir). |
| **No tengo** | Opcional `[45]` si quiere sacarse el permiso en España. |

### P20 · Cobertura de salud / sanidad

> ⚠️ **DISCREPANCIA DETECTADA (auditoría 19/06/2026):** Esta sección referencia una pregunta "P20"
> sobre cobertura de salud que **NO EXISTE en `lib/gina/flow.json`**. En flow.json, `p20a_objetivo`
> pregunta sobre "vivienda vs. integración", NO sobre salud. La tabla de abajo describe la lógica
> deseada pero no tiene pregunta de Gina que la active.
>
> **`// TODO-PLAN:`** Decidir si (a) se añade una pregunta de salud al flujo de Gina, o (b) se
> infiere la activación de `[27]`/`[28]` automáticamente a partir de P9 (quienes cotizan en SS
> ya tienen derecho a SERGAS) y se elimina esta sección como pregunta independiente.

| Respuesta *(sin pregunta activa en Gina)* | Trámites que se activan |
|---|---|
| **Sistema público** | `[27]` Tarjeta Sanitaria SERGAS · `[28]` Beneficiarios (si hay familiares a cargo). |
| **Seguro médico privado** | El seguro cubre al inicio; al darse de alta en SS → `[27]` SERGAS pasa a ser cobertura principal. |
| *Gallego de origen / descendiente* | Posible `[32]` Tarxeta Galicia Saúde Exterior. |

### P27 · Nivel de estudios (homologación)

| Respuesta | Trámites que se activan |
|---|---|
| **Bachillerato o equivalente** | `[38]` Homologación de ESO/Bachillerato (ED434A). |
| **Técnico / FP** | `[39]` Homologación de FP (ED434A autonómico). |
| **Universitario / Grado** o **Posgrado** | `[40]` Homologación (si profesión regulada) · `[41]` Declaración de equivalencia (si no regulada) · `[42]` Reconocimiento profesional directo (si título UE/EEE/Suiza). |
| **Sin estudios superiores** | Ninguno. |

### P7 · Mascotas

| Respuesta | Trámites que se activan |
|---|---|
| **Sí, viajo con mascota** | `[49]` Microchip · `[50]` Vacuna antirrábica · `[51]` Certificado de salud · `[52]` Certificado oficial de exportación · `[53]` Reserva de vuelo · `[54]` Permiso de embarque · y `[55]` Licencia PPP **solo si es raza potencialmente peligrosa**. |
| **No** | Ninguno. |

### P6 · Composición del hogar (si hay menores)

| Respuesta | Trámites que se activan |
|---|---|
| **Vienen niños/as en edad escolar** | `[37]` Escolarización de menores · y `[38]` Homologación de sus estudios previos si aplica. |

---

## Parte 2 — Orden cronológico y dependencias

El plan ordena los trámites incluidos respetando esta secuencia. Un trámite no puede ir antes de
aquel del que depende.

### FASE A — En el país de origen (antes de viajar)
1. `[1]` Antecedentes penales → **requisito de** `[5]` visado.
2. `[2]` Apostilla → **se aplica sobre** `[1]` y sobre títulos académicos.
3. `[3]` Traducción oficial (jurada) → **después de** apostillar.
4. `[4]` Cuenta bancaria de no residente *(si P13 = No)*.
4b. `[49]`→`[54]` Traslado de la mascota *(si P7 = Sí)* → empezar 3–4 meses antes por la secuencia microchip → vacuna → 21 días de espera → certificados. La licencia PPP `[55]` se tramita ya en España.
5. `[5]` Visado tipo D *(si aplica por P8)* → **requiere** `[1]`+`[2]`+`[3]`.
6. *(Iniciables ya desde origen si hay certificado digital: `[38]`/`[40]`/`[41]` homologaciones, porque tardan meses.)*

### FASE B — Llegada y residencia legal (primeras semanas en España)
7. `[6]` Declaración de entrada *(si aplica)* → en las primeras 72 h.
8. `[7]` NIE  /  `[8]` CUE *(según P8)* → base para casi todo lo demás.
9. `[21]` Empadronamiento → **requiere** domicilio; **es requisito de** TIE, sanidad y escolarización.
10. `[11]` Toma de huellas + TIE *(no UE)* → **requiere** `[7]` y `[21]`.
11. `[22]` Volante de empadronamiento → documento que se reutiliza en los pasos siguientes.
12. `[17]` **Baja consular** del país de origen *(si vienes de fuera)* → se tramita **ya en España, después del empadronamiento**, NO antes de salir. Hacerla antes te deja en un limbo administrativo (sin asistencia de emergencia, derecho al voto ni residencia oficial hasta empadronarte en España).

### FASE C — Identidad digital (habilita gestiones online)
12. `[18]` Certificado Digital FNMT  /  `[19]` Cl@ve  /  `[20]` Chave365 → **requieren** `[7]`/`[8]`. Habilitan trámites telemáticos posteriores.

### FASE D — Trabajo y Seguridad Social *(según P9)*
13. `[23]` Alta censal AEAT *(autónomos)* → **antes de** `[26]`.
14. `[24]` NUSS/NAF → **requiere** `[7]`/`[8]`; **es requisito de** alta laboral y sanidad.
15. `[25]` Régimen General *(cuenta ajena)*  /  `[26]` RETA *(autónomos)* → **requieren** `[24]`.

### FASE E — Sanidad (SERGAS) *(según P20)*
16. `[27]` Tarjeta Sanitaria SERGAS → **requiere** `[7]`/`[8]`, `[21]` y acreditación de derecho (alta SS o convenio/seguro).
17. `[28]` Beneficiarios *(si hay familiares a cargo)* → **requiere** `[27]` del titular.
18. *(Opcionales una vez en el SERGAS: `[33]` Sergas Móbil, `[34]` cambio de médico, `[35]` É-Saúde.)*

### FASE F — Familia, estudios y conducción
19. `[37]` Escolarización de menores *(si P6 trae niños)* → **requiere** `[21]` empadronamiento.
20. `[38]`/`[39]`/`[40]`/`[41]`/`[42]` Homologación de estudios *(según P27)* → conviene **iniciarla desde origen** por su duración.
21. `[43]` Psicofísico CRC → **antes de** `[44]`/`[45]`.
22. `[44]` Canje de licencia  /  `[45]` Exámenes DGT *(según P17 y convenio del país)* → **requieren** residencia legal (`[11]` TIE o `[8]` CUE).

---

## Parte 3 — Notas para el generador

- **Frase puente:** cada bloque incluido se introduce conectándolo con la respuesta de la persona
  (ej.: *"Como me contaste que entrarás con un visado en trámite, tu primer paso será…"*).
- **Solo lo que aplica:** nunca se muestran los 55. El plan incluye únicamente los trámites que las
  respuestas activan, en el orden de la Parte 2.
- **Trámites de borde** (no se incluyen salvo que la conversación lo indique): `[12]` renovación,
  `[13]` duplicado TIE, `[14]` larga duración, `[15]` cert. residente, `[16]` concordancia,
  `[29]` médico desplazados, `[30]` programa protección social, `[31]` TSE, `[36]` instrucciones previas.
- **Dependencia transversal clave:** `[21]` empadronamiento es el cuello de botella: lo necesitan
  TIE, sanidad y escolarización. Va siempre apenas se tiene domicilio.
- **Iniciar desde origen lo lento:** homologaciones `[38]/[40]/[41]` y cuenta `[4]` se marcan como
  "puedes adelantarlo desde tu país" para ganar tiempo.

---

## 3. Preparación económica y de vivienda  *(texto fijo, se incluye siempre)*

<!--
=========================================================================
NOTA INTERNA — NO SE MUESTRA AL USUARIO:
Filtro de calificación del servicio = liquidez equivalente a ~9 meses del alquiler que el cliente
declara poder pagar, honorarios de TLeG incluidos. Se usa SOLO para etiquetar internamente
"califica / no califica" y priorizar la atención de Silvana. NUNCA se menciona la cifra ni el
desglose de honorarios al usuario (los honorarios se explican en la videollamada). El mensaje de
cara al usuario es siempre cualitativo y alentador, como el de abajo.
=========================================================================
-->

### Tu colchón para una mudanza tranquila

Hablemos de un punto importante, {{NOMBRE}}, y lo hacemos con franqueza porque queremos lo mejor para ti: una mudanza internacional se vive con mucha más calma cuando cuentas con un colchón de ahorro para los primeros meses —la fianza, los primeros alquileres y los gastos de empezar de cero en una ciudad nueva—. Las familias que llegan con ese respaldo preparado encuentran su hogar antes y disfrutan mucho más del proceso.

Si todavía lo estás reuniendo, estás justo donde tienes que estar: es una etapa más del camino, no un obstáculo. Este plan te ayuda a organizarla con calma, y el día que la tengas encaminada, será un placer retomar juntos la búsqueda de tu hogar.

### Las garantías que pide el mercado

En España es habitual que se pidan garantías adicionales a quienes llegan de fuera, simplemente porque todavía no tienes un historial local —le ocurre a todo el mundo al principio—. La más común es contar con un avalista propietario de una vivienda en España.

Si hoy no lo tienes resuelto, tranquilo: es justo una de las cosas que miraremos juntos, para encontrar contigo la opción que mejor encaje con tu situación. No es algo que tengas que resolver hoy, ni en solitario; para eso estamos a tu lado.

---

## 4. Cierre  *(texto fijo)*

{{NOMBRE}}, este es tu mapa hacia Galicia. Visto de golpe puede parecer mucho, pero ningún camino se recorre de una sola zancada: paso a paso, en el orden de este plan, vas a llegar. Muchas familias hicieron este mismo viaje antes que tú, y tú también puedes.

Cuando quieras dar el siguiente paso, escríbenos. Tu nuevo hogar en Galicia te está esperando. 🌿

*Gina, asistente virtual de Tu Lugar en Galicia*

---

## Notas de implementación

- **IA mínima:** las fichas y las frases puente son texto precargado. La IA (Gemini) solo se usa, si
  acaso, para microajustes; el contenido legal nunca lo genera el modelo.
- **Fuentes únicas:** las fichas viven solo en `tramites-galicia.md` y las frases en
  `frases-puente.md`. Este documento no las duplica; las referencia por número. Así, actualizar una
  tasa o un dato se hace una sola vez en el catálogo.
- **Cuenta bancaria:** el trámite `[4]` del catálogo cubre la cuenta de no residente; si se quiere,
  puede añadirse el ejemplo concreto del Santander como nota dentro de esa ficha del catálogo.
- **Nunca exponer la nota interna** del filtro de 9 meses al usuario.
- **Pendiente:** pasada final de tono con los suavizadores (Carnegie + psicología/narrativa) sobre
  los textos fijos y las frases puente.

# Mapeo Gina → Plan Estratégico

> **Qué es:** tabla de referencia que conecta cada pregunta de **Gina** (el cuestionario) con los
> **trámites** que activa en el **Plan Estratégico**. Gina es el patrón: los valores de la columna
> "Respuesta (value)" son los que el motor guarda en Supabase (tabla `leads`), exactos.
>
> **Fuentes cruzadas:** `gina-flujo.md` (preguntas y values) · `plan-estrategico.md` (lógica de
> armado) · `tramites-galicia.md` (fichas 1–55).
> Revisión: 15 de junio de 2026.

---

## Cómo se lee

Cada fila es **una respuesta posible**. La columna "Trámites que activa" lista los números del
catálogo (`tramites-galicia.md`). Si una respuesta no activa ninguno, se indica "—".

El plan **nunca muestra los 55 trámites**: incluye solo los que las respuestas activan, en el orden
cronológico de la Parte 2 del Plan.

---

## P3 · Origen — `paisResidencia` / `origenResidencia`

| Respuesta (value) | Trámites que activa |
|---|---|
| `fuera` (vengo de fuera) | `[1]` Antecedentes penales · `[2]` Apostilla · `[3]` Traducción jurada · + rama visado/identidad según P8. Activa el "Paso 0 — antes de salir". |
| `en_espana` (ya vivo en España) | Omite "Paso 0" (`[1]`–`[4]`) y `[6]` Declaración de entrada. Se asume identidad/residencia resuelta; el plan se centra en lo que falte (empadronamiento, sanidad, homologación, conducir). |

---

## P8 · Documentación / situación legal — `documentacion`

Define la vía de identidad y residencia.

| Respuesta (value) | Trámites que activa |
|---|---|
| `espanol` (pasaporte español sin DNI) | `[46]` Partida de nacimiento para primer DNI · `[47]` Expedición del primer DNI en Galicia. **NO** lleva CUE/NIE/TIE/visado: como español entra y reside con plenos derechos. |
| `ue-otro` (otro país UE/EEE/Suiza) | `[8]` CUE (Certificado de Registro UE). **NO** lleva NIE/TIE (régimen comunitario). Si trae familiares extracomunitarios → `[9]` Tarjeta de familiar de UE. |
| `residencia-aprobada` (visado/TIE/NIE ya aprobado) | `[11]` Toma de huellas + TIE (si aún no la tiene física). Más adelante `[12]` Renovación cuando corresponda. |
| `en-tramite` (en trámite de visado) | `[5]` Visado tipo D · `[6]` Declaración de entrada (si aplica) · `[7]` NIE · `[11]` Toma de huellas + TIE. |
| `nacionalidad-en-tramite` (tramitando la nacionalidad española) | Ya reside legalmente: mantiene su residencia actual (`[12]` Renovación si está por vencer). Al **obtener** la nacionalidad → `[16]` Certificado de Concordancia (enlaza su historial de NIE con el nuevo DNI sin cabos sueltos) · `[46]`/`[47]` primer DNI. *Usa trámites ya existentes; no requiere ficha nueva.* |
| `turista` (entraré como turista) | Caso a analizar. Vía habitual: `[5]` Visado/autorización desde España (p. ej. Nómada Digital) · `[7]` NIE · `[11]` TIE. **Nota interna:** limita opciones; se estudia en videollamada. |

> *Familiar de ciudadano español* no es opción directa del cuestionario (surge en videollamada):
> `[10]` Autorización de residencia de familiares de españoles.

---

## P9 · Situación laboral — `situacionLaboral`

Define la vía de Seguridad Social.

| Respuesta (value) | Trámites que activa |
|---|---|
| `cuenta-ajena` (nómina en España) | `[24]` Nº Seguridad Social (NUSS/NAF) · `[25]` Alta en Régimen General (la gestiona la empresa). |
| `autonomo` (autónomo registrado) | `[23]` Alta censal AEAT (036/037) · `[24]` NUSS/NAF · `[26]` Alta en RETA. |
| `teletrabajo-extranjero` (teletrabajo para empresa extranjera) | Depende del país (convenio) y del contrato. Con **convenio bilateral** (Argentina, Colombia…): puede cotizar en su país 1–2 años, sin alta en España al inicio. Si cotiza aquí como autónomo → `[23]` + `[24]` + `[26]`. Con visado de nómada digital, posible régimen fiscal especial (Ley Beckham). *Orientación inicial; se confirma con gestor/AEAT.* |
| `rentista` (fondos propios) | Sin alta laboral. Cobertura sanitaria por convenio o seguro privado (ver sección Salud). |
| `jubilado` (pensionista) | Sin alta laboral en España. Cobertura sanitaria por convenio internacional de pensiones o seguro privado (ver sección Salud). *Tratado como rentista a efectos de Seguridad Social; no requiere ficha nueva.* |
| `estudiante` | `[48]` Visado / estancia por estudios. Sin alta laboral (salvo trabajo parcial ≤30 h). Sanidad por el seguro del propio visado. |
| `busca-empleo` (sin empleo aún) | — Por ahora ninguno. Tu situación se irá definiendo; cuando tengas empleo o actividad, aplican los pasos de Seguridad Social correspondientes (`[24]` + `[25]`/`[26]` según el caso). |

---

## P13 · Cuenta bancaria en España — `cuentaBancaria`

| Respuesta (value) | Trámites que activa |
|---|---|
| `no` | `[4]` Apertura de cuenta de no residente (se hace en el "Paso 0", antes de viajar). |
| `si` | Omite `[4]`. |

---

## P17 · Licencia de conducir — `tipoLicencia`

| Respuesta (value) | Trámites que activa |
|---|---|
| `origen` (de mi país de origen) | `[43]` Examen psicofísico (CRC). Luego: si su país tiene convenio → `[44]` Canje; si no → `[45]` Exámenes DGT (permiso nuevo). |
| `espanola` | — Ninguno (válida para conducir). |
| `europea` | — Ninguno (válida para conducir). |
| `no-tiene` | Opcional `[45]` si quiere sacarse el permiso en España. |

---

## P27 · Nivel de estudios — `nivelEstudios`

Homologación / convalidación.

| Respuesta (value) | Trámites que activa |
|---|---|
| `sin-estudios` | — Ninguno. |
| `bachillerato` | `[38]` Homologación de ESO/Bachillerato (ED434A). |
| `tecnico` (FP) | `[39]` Homologación de FP (ED434A autonómico). |
| `universitario` (Grado) | `[40]` Homologación (si profesión regulada) · `[41]` Declaración de equivalencia (si no regulada) · `[42]` Reconocimiento profesional directo (si título UE/EEE/Suiza). |
| `posgrado` | Igual que `universitario`: `[40]` / `[41]` / `[42]` según el caso. |

---

## P7 · Mascotas — `mascotas` / `mascotaTipo`

| Respuesta (value) | Trámites que activa |
|---|---|
| `mascotas = no` | — Ninguno. |
| `mascotas = si` | `[49]` Microchip · `[50]` Vacuna antirrábica · `[51]` Certificado de salud · `[52]` Certificado oficial de exportación · `[53]` Reserva de vuelo · `[54]` Permiso de embarque. **Empezar 3–4 meses antes** por la secuencia microchip → vacuna → 21 días de espera → certificados. |

> **Nota condicional sobre PPP `[55]`** (Gina no pregunta la raza): el plan incluye, dentro del
> bloque de mascotas, una nota del tipo *"Si tu perro pertenece a una raza considerada
> potencialmente peligrosa (PPP), necesitarás además tramitar la Licencia PPP `[55]` ya en
> España"*. No depende de ningún dato del cuestionario; se ofrece como aviso para que la persona lo
> verifique según su caso.

---

## P6 · Composición del hogar (menores) — `ninos` / `adolescentes`

| Condición | Trámites que activa |
|---|---|
| `ninos ≥ 1` **o** `adolescentes ≥ 1` | `[37]` Escolarización de menores (requiere `[21]` empadronamiento). Niños (0–12) y adolescentes (13–17) están todos en edad escolar. Si traen estudios previos a homologar → `[38]` según corresponda. |
| `ninos = 0` y `adolescentes = 0` | — Ninguno. |

> Recordatorio: `p6b_menores` (sí/no) solo enruta; el dato real para esta regla es el **conteo**
> de `ninos` y `adolescentes`.

---

## Salud / SERGAS — sección fija (Gina NO la pregunta)

El cuestionario **no incluye** una pregunta sobre cobertura sanitaria. Por eso el plan **no decide**
entre pública y privada: incluye **siempre** una sección que explica ambas vías para que la persona
elija con criterio.

| Vía | En qué consiste | Trámites asociados |
|---|---|---|
| **Pública (SERGAS)** | Sanidad pública gallega. Se accede al darse de alta en la Seguridad Social (trabajo) o por convenio. Cubre a titular y beneficiarios a cargo. | `[27]` Tarjeta Sanitaria SERGAS · `[28]` Beneficiarios (si hay familiares a cargo). Opcionales luego: `[33]` Sergas Móbil, `[34]` cambio de médico, `[35]` É-Saúde. |
| **Privada (seguro médico)** | Seguro contratado de forma particular. Suele exigirse al inicio (p. ej. con visados que piden cobertura) y mientras no haya alta en SS. Al darse de alta en SS, el SERGAS pasa a ser la cobertura principal. | Sin trámite de catálogo; es contratación privada. |

> Casos especiales (se ofrecen como nota): `[31]` Tarjeta Sanitaria Europea si mantiene derechos en
> otro país UE · `[32]` Tarxeta Galicia Saúde Exterior para gallegos de origen/descendientes.

---

## Resumen de sincronización aplicada

Frente a la versión anterior del Plan, esta sincronización con Gina:

1. **P3, P13, P17, P27** — nombres de valores ajustados a los que Gina guarda realmente.
2. **P8** — añadido `nacionalidad-en-tramite` (mapeado a `[12]`+`[16]`+`[46]`/`[47]`); valores renombrados a los de Gina.
3. **P9** — añadidos `jubilado` (tratado como rentista) y `busca-empleo` (sin empleo aún); valores renombrados.
4. **P6** — regla basada en el conteo de `ninos`/`adolescentes`, no en el sí/no de `p6b_menores`.
5. **P7 / PPP** — `[55]` convertido en nota condicional, ya que Gina no pregunta la raza.
6. **Salud** — convertida en sección fija con ambas vías explicadas, ya que Gina no pregunta cobertura.

Ninguno de los valores nuevos de Gina requirió generar fichas de trámite nuevas: todos se resuelven
con trámites que ya existen en `tramites-galicia.md`.

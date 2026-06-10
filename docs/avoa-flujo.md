# Avoa — Flujo conversacional (fuente de verdad)

> **Este documento refleja el `flow.json` y `flowEngine.ts` actuales.**
> Actualizar cada vez que se modifique el flujo. En caso de conflicto, el código manda.

---

## Arquitectura general

| Elemento | Detalle |
|---|---|
| Motor | `lib/avoa/flowEngine.ts` — puro, sin side effects |
| Flujo | `lib/avoa/flow.json` — array de pasos en JSON |
| API | `app/api/avoa/route.ts` — procesa respuesta, decide guardado |
| Widget | `components/avoa/AvoaWidget.tsx` — gestiona estado y mensajes |
| CRM | Airtable — tabla `Leads` |

**Tipos de paso:**
- `botones` — opciones fijas (puede ser multiselect, puede tener excluyente)
- `input` — texto libre con validación por regex (`texto`, `email`, `telefono`)
- `llm` — texto libre; en Etapa 1 se procesa igual que `input` (0 llamadas a IA)

**Pasos virtuales:** pasos con `texto: ""` y `opciones: []`. El widget los detecta y llama a `avanzarPasoVirtual` automáticamente. El motor resuelve su transición dentro del `flowEngine` sin mostrarlos al usuario.

---

## Guardado en Airtable

| Evento | Acción | Cuándo | Qué guarda |
|---|---|---|---|
| `guardar_nivel1` | **POST** — crea fila nueva | Al procesar `p15_telefono` | `nombreCompleto`, `email`, `telefono` |
| `guardar_lead_parcial` | **PATCH** — actualiza la misma fila | Al procesar `p11_lead_preparacion` | Todo lo capturado hasta ese punto (sin campos de nivel 2) |
| `guardar_lead_completo` | **PATCH** — actualiza la misma fila | Al procesar `atribucion` | Todos los campos del flujo completo |

- `guardar_nivel1` es **bloqueante** (await): la respuesta de Airtable devuelve el `recordId` que se almacena en la sesión.
- Los dos PATCH posteriores usan ese `recordId` para actualizar la misma fila.
- Si `guardar_nivel1` falla (red, etc.), el PATCH final hace **POST** como fallback — el lead no se pierde.
- `comprendeServicio: true` y `consentimientoRGPD: true` se añaden automáticamente en el mapper de `route.ts`; no hay paso que los pregunte.

---

## Flujo completo — paso a paso

### Bienvenida y consentimiento

---

#### `bienvenida` · `botones` · sin campo Airtable

> "¡Hola! Soy Avoa, tu asistente virtual del equipo de Tu Lugar en Galicia.
>
> En unos minutos te hago unas preguntas para entender tu situación y saber si podemos ayudarte a encontrar vivienda antes de llegar. Nada de formularios aburridos: esto es una conversación.
>
> ¿Empezamos?"

| Label | Value | Siguiente |
|---|---|---|
| Sí, empecemos | `empecemos` | → `rgpd` |

---

#### `rgpd` · `botones` · sin campo Airtable

> "Antes de continuar, quiero ser transparente contigo desde el principio: para poder ayudarte, voy a guardar las respuestas que me des (como tu nombre, tu contacto y lo que me cuentes de tu situación). Las usamos solo para preparar tu plan y para que el equipo de Tu Lugar en Galicia pueda contactarte. No se las damos a nadie más, y puedes pedirnos ver o borrar tus datos cuando quieras. ¿Te parece bien?"

| Label | Value | Siguiente |
|---|---|---|
| Sí, me parece bien | `acepto` | → `p1_nombre` |
| Ver más detalles | `ver_politica` | → `rgpd_politica` |

---

#### `rgpd_politica` · `botones` · sin campo Airtable

> "Puedes leer nuestra política en tulugarengalicia.com/privacidad. Cuando quieras, seguimos."

| Label | Value | Siguiente |
|---|---|---|
| Volver y continuar | `volver` | → `p1_nombre` |

---

### Nivel 1 — Datos básicos de contacto

---

#### `p1_nombre` · `input` · Airtable: `nombreCompleto`

> "Para empezar, ¿cómo te llamas? (nombre y apellido)"

- Validación: `texto`
- Efecto especial: extrae el primer token como `sesion.nombre` para personalizar `{{nombre}}` en pasos siguientes
- → `p2_email`

---

#### `p2_email` · `input` · Airtable: `email`

> "Encantada, {{nombre}}. ¿Me dejas un email que uses a menudo?"

- Validación: `email`
- → `p15_telefono`

---

#### `p15_telefono` · `input` · Airtable: `telefono` · **`guardar_nivel1` ← PRIMER GUARDADO**

> "Perfecto, {{nombre}}. ¿Me dejas también un teléfono de contacto con el prefijo de tu país?"

- Validación: `telefono`
- Al procesar esta respuesta: **POST a Airtable** (crea fila con `nombreCompleto`, `email`, `telefono`). Guarda `airtableRecordId` en sesión.
- → `p3_origen`

---

### Nivel 1 — Diagnóstico (todos los usuarios)

---

#### `p3_origen` · `botones` · Airtable: `paisResidencia` (guarda el value)

> "Para darte la guía adecuada, ¿ya vives en España, o estás planificando tu llegada desde otro país?"

| Label | Value | Siguiente |
|---|---|---|
| Ya vivo en España | `en_espana` | → `p4_plazo` |
| Vengo de fuera | `fuera` | → `p3b_pais` |

- Efecto especial: establece `sesion.origenResidencia` (`en_espana` o `fuera`) para la rama del Nivel 2.

---

#### `p3b_pais` · `input` · Airtable: `paisResidencia` *(solo si eligió "Vengo de fuera")*

> "¿Desde qué país nos escribes?"

- Validación: `texto`
- Sobreescribe `paisResidencia` con el texto del país
- → `p4_plazo`

---

#### `p4_plazo` · `botones` · Airtable: `fechaLlegada`

> "¿En qué plazo necesitas tener resuelta tu vivienda en Galicia?"

| Label | Value |
|---|---|
| En menos de 1 mes | `menos-1-mes` |
| En 1 a 3 meses | `1-3-meses` |
| En 3 a 6 meses | `3-6-meses` |
| En más de 6 meses | `mas-6-meses` |
| Aún no tengo fecha | `sin-fecha` |

- → `p5_ciudad`

---

#### `p5_ciudad` · `botones` · Airtable: `ciudadDestino`

> "¿A qué ciudad de Galicia te diriges? Nuestro foco principal es Vigo y A Coruña."

| Label | Value |
|---|---|
| Vigo | `vigo` |
| A Coruña | `a-coruna` |
| Santiago | `santiago` |
| Pontevedra | `pontevedra` |
| Lugo | `lugo` |
| Indiferente | `indiferente` |

- → `p6a_adultos`

---

#### `p6a_adultos` · `botones` · Airtable: `adultos`

> "¿Cuántos adultos se mudan? (incluyéndote)"

| Label | Value |
|---|---|
| 1 | `1` |
| 2 | `2` |
| 3 | `3` |
| 4 o más | `4+` |

- → `p6b_menores`

---

#### `p6b_menores` · `botones` · **sin campo Airtable** (solo enrutamiento)

> "¿Viajan menores de edad contigo?"

| Label | Value | Siguiente |
|---|---|---|
| No | `no` | → `p7_mascotas` |
| Sí | `si` | → `p6c_ninos` |

---

#### `p6c_ninos` · `botones` · Airtable: `ninos` *(solo si hay menores)*

> "¿Cuántos niños de 0 a 12 años?"

| Label | Value |
|---|---|
| 0 | `0` |
| 1 | `1` |
| 2 | `2` |
| 3 o más | `3+` |

- → `p6d_adolescentes`

---

#### `p6d_adolescentes` · `botones` · Airtable: `adolescentes` *(solo si hay menores)*

> "¿Y adolescentes de 13 a 17 años?"

| Label | Value |
|---|---|
| 0 | `0` |
| 1 | `1` |
| 2 | `2` |
| 3 o más | `3+` |

- → `p7_mascotas`

---

#### `p7_mascotas` · `botones` · Airtable: `mascotas`

> "Te pregunto por las mascotas porque cerca del 80% de los propietarios no las admite. ¿Viajas con alguna mascota?"

| Label | Value | Siguiente |
|---|---|---|
| No | `no` | → `p8_documentacion` |
| Sí | `si` | → `p7b_tipo` |

---

#### `p7b_tipo` · `botones` · **multiselect** · Airtable: `mascotaTipo` *(solo si hay mascotas)*

> "¿Qué tipo de mascota tienes? Puedes marcar más de una."

| Label | Value |
|---|---|
| Perro | `perro` |
| Gato | `gato` |
| Otro | `otro` |

- Condicional en `flowEngine`: si la selección **incluye `perro`** → `p7b_peso`; si no → `p8_documentacion`

---

#### `p7b_peso` · `botones` · Airtable: `mascotaPeso` *(solo si mascotaTipo incluye "perro")*

> "¿Cuánto pesa aproximadamente tu perro?"

| Label | Value |
|---|---|
| Menos de 5 kg | `0-5 kg` |
| Entre 5 y 10 kg | `5-10 kg` |
| Más de 10 kg | `+10 kg` |

- → `p8_documentacion`

---

#### `p8_documentacion` · `botones` · Airtable: `documentacion`

> "¿Cuál es tu situación para residir legalmente en España?"

| Label | Value |
|---|---|
| Soy español/a (pasaporte español) | `espanol` |
| Soy de otro país de la UE / EEE / Suiza | `ue-otro` |
| Residencia / TIE / NIE ya aprobado | `residencia-aprobada` |
| En trámite de visado o residencia | `en-tramite` |
| Tengo o estoy tramitando la nacionalidad española | `nacionalidad-en-tramite` |
| Entraré como turista | `turista` |

- → `p9_laboral`

---

#### `p9_laboral` · `botones` · Airtable: `situacionLaboral`

> "¿Cuál es o será tu situación laboral en España?"

| Label | Value |
|---|---|
| Cuenta ajena con nómina en España | `cuenta-ajena` |
| Autónomo registrado en España | `autonomo` |
| Teletrabajo para empresa extranjera | `teletrabajo-extranjero` |
| Rentista / fondos propios | `rentista` |
| Jubilado/a | `jubilado` |
| Estudiante | `estudiante` |
| Otra / por el momento sin empleo | `busca-empleo` |

- → `p10_ingresos`

---

#### `p10_ingresos` · `botones` · Airtable: `ingresosMensuales`

> "Para orientarte mejor y proponerte opciones realistas para tu búsqueda, ¿en qué rango de ingresos mensuales del hogar te ubicas?"

| Label | Value | Siguiente |
|---|---|---|
| Menos de 1.500 € | `menos-1500` | → `p11_garantias` |
| 1.500 – 2.500 € | `1500-2500` | → `p11_garantias` |
| 2.500 – 4.000 € | `2500-4000` | → `p11_garantias` |
| Más de 4.000 € | `mas-4000` | → `p11_garantias` |
| No tengo ingresos en España aún | `sin-ingresos` | → `p10_sin_ingresos_msg` |

---

#### `p10_sin_ingresos_msg` · `botones` · **sin campo Airtable** *(solo si eligió `sin-ingresos`)*

> "Sin problema, {{nombre}}: muchas familias llegan así y la solvencia se resuelve con otro tipo de respaldo (ahorros, aval o seguro). Lo vemos en la siguiente pregunta."

| Label | Value | Siguiente |
|---|---|---|
| Continuar | `continuar` | → `p11_garantias` |

---

#### `p11_garantias` · `botones` · **multiselect** · exclusivo: `ninguna` · Airtable: `garantias`

> "En España es habitual pedir garantías extra a perfiles internacionales. Marca las que podrías asumir:"

| Label | Value |
|---|---|
| Adelantar varios meses de alquiler (6–12) | `adelanto-6-12` |
| Aval bancario o avalista con ingresos en España | `aval` |
| Contratar un seguro de impago | `seguro-impago` |
| Ninguna de las anteriores *(excluyente)* | `ninguna` |

**Lógica de descalificación** (resuelta en `flowEngine`):

| Condición | Siguiente |
|---|---|
| `garantias` incluye `ninguna` **Y** `ingresosMensuales` es `menos-1500` o `sin-ingresos` | → `p11_lead_preparacion` |
| Cualquier otra combinación | → `p12_presupuesto` |

> *Nota técnica:* El flow.json define `"siguiente": "p11_check"` pero ese paso es **virtual** (texto vacío, sin opciones). El motor `flowEngine.ts` lo cortocircuita: la transición real se resuelve directamente en `procesarRespuesta` al procesar `p11_garantias`, sin pasar por `p11_check`.

---

#### `p11_lead_preparacion` · `botones` · etiqueta: `lead-en-preparacion` · **`guardar_lead_parcial`** *(rama de descalificación)*

> "Gracias por la sinceridad, {{nombre}}. Hoy el mercado en Galicia pide bastante respaldo para alquilar. Podemos enviarte recursos para irlo armando y, en cuanto lo tengas encaminado, retomamos encantados tu plan."

| Label | Value | Siguiente |
|---|---|---|
| Sí, gracias | `gracias` | → `despedida_preparacion` |

- **PATCH a Airtable** con todo lo capturado hasta aquí.
- Etiqueta CRM: `lead-en-preparacion`

---

#### `despedida_preparacion` · `botones` · **`fin`** *(rama de descalificación)*

> "¡Un saludo, {{nombre}}! Cuando estés listo/a, aquí estaremos."

| Label | Value |
|---|---|
| Cerrar | `cerrar` |

- Cierra el widget. Fin del flujo.

---

#### `p12_presupuesto` · `botones` · Airtable: `presupuestoMensual`

> "¿Cuál es tu presupuesto mensual máximo para el alquiler? Como referencia: un piso familiar adecuado suele partir de 700–800 €, suministros aparte."

| Label | Value |
|---|---|
| Menos de 700 € | `menos-700` |
| 700 – 1.000 € | `700-1000` |
| 1.000 – 1.400 € | `1000-1400` |
| Más de 1.400 € | `mas-1400` |

- → `p13_banco`

---

#### `p13_banco` · `botones` · **sin campo Airtable**

> "¿Ya tienes cuenta bancaria operativa en España?"

| Label | Value | Siguiente |
|---|---|---|
| Sí | `si` | → `p14_servicio` |
| No | `no` | → `p14_servicio` |

---

#### `p14_servicio` · `botones` · **sin campo Airtable**

> "¿Entiendes que somos un servicio de consultoría y búsqueda personalizada, con honorarios propios, aparte del alquiler y la fianza?"

| Label | Value | Siguiente |
|---|---|---|
| Sí, lo entiendo perfectamente | `si` | → `transicion_nivel2` |
| Me gustaría que me lo expliquen mejor | `explicar` | → `p14_explicacion` |

---

#### `p14_explicacion` · `botones` · **sin campo Airtable** *(solo si eligió "explicar")*

> "Claro, con gusto te explico. Somos una agencia de relocalización: nuestro trabajo es encontrar la vivienda adecuada para ti, gestionar la comunicación con propietarios, preparar tu candidatura y acompañarte en todo el proceso. Cobramos honorarios por ese servicio —separados del alquiler y la fianza—, igual que cualquier profesional. ¿Seguimos?"

| Label | Value | Siguiente |
|---|---|---|
| Continuar con las preguntas | `continuar` | → `transicion_nivel2` |

---

#### `transicion_nivel2` · `botones` · **sin campo Airtable**

> "¡Estupendo! Si tienes un par de minutos más, con unas preguntas extra el equipo podrá afinar tu Plan Estratégico. ¿Te animas?"

| Label | Value | Siguiente |
|---|---|---|
| Sí, continuemos | `si` | → `p16_accesibilidad` (Nivel 2) |
| No deseo continuar | `no` | → `despedida` |

---

### Nivel 2 — Perfil de búsqueda (opcional)

---

#### `p16_accesibilidad` · `botones` · Airtable: `necesidadesEspeciales`

> "¿Algún miembro del hogar tiene necesidades especiales o alguna discapacidad? (Lo veremos en detalle más adelante.)"

| Label | Value |
|---|---|
| No | `no` |
| Sí | `si` |

- → `p17_licencia`

---

#### `p17_licencia` · `botones` · **sin campo Airtable**

> "¿Tienes licencia de conducir?"

| Label | Value | Siguiente (resuelto en flowEngine) |
|---|---|---|
| Española | `espanola` | → `p18a_ciudad` (en España) / `p18b_tiempo` (fuera) |
| Europea | `europea` | → `p18a_ciudad` (en España) / `p18b_tiempo` (fuera) |
| De mi país de origen | `extranjera` | → `p17b_canje` |
| No tengo | `no` | → `p18a_ciudad` (en España) / `p18b_tiempo` (fuera) |

> *Nota técnica:* El flow.json apunta a `p18_check_origen` (paso virtual). El motor lo cortocircuita directamente al procesar `p17_licencia`: si `sesion.origenResidencia === 'en_espana'` → `p18a_ciudad`; si no → `p18b_tiempo`.

---

#### `p17b_canje` · `botones` · **sin campo Airtable** *(solo si eligió "extranjera")*

> "Si tu país tiene convenio con España, puedes canjear tu licencia. Te orientamos sobre los requisitos."

| Label | Value | Siguiente |
|---|---|---|
| Entendido, seguimos | `entendido` | → `p18a_ciudad` / `p18b_tiempo` (mismo cortocircuito) |

---

### Rama según origen de residencia (`sesion.origenResidencia`)

---

#### **Rama "ya vive en España"** (`origenResidencia === 'en_espana'`)

##### `p18a_ciudad` · `input` · **sin campo Airtable**

> "¿En qué ciudad o provincia vives actualmente?"

- Validación: `texto`
- → `p19a_tiempo`

---

##### `p19a_tiempo` · `botones` · **sin campo Airtable**

> "¿Cuánto tiempo llevas viviendo en España?"

| Label | Value |
|---|---|
| Menos de 1 año | `menos-1` |
| Entre 1 y 5 años | `1-5` |
| Más de 5 años | `mas-5` |

- → `p20a_objetivo`

---

##### `p20a_objetivo` · `botones` · **sin campo Airtable**

> "¿Estás buscando vivienda en Galicia, o ya tienes dónde vivir y buscas orientación para integrarte?"

| Label | Value | Siguiente |
|---|---|---|
| Busco vivienda | `busco` | → `p21_tipo_inmueble` |
| Ya tengo vivienda, quiero integrarme | `integrar` | → `p26_profesion` (salta vivienda) |

---

#### **Rama "viene de fuera"** (`origenResidencia === 'fuera'`)

##### `p18b_tiempo` · `botones` · **sin campo Airtable**

> "¿Cuánto tiempo llevas planificando la mudanza?"

| Label | Value |
|---|---|
| Menos de 1 año | `menos-1` |
| Entre 1 y 5 años | `1-5` |
| Más de 5 años | `mas-5` |

- → `p21_tipo_inmueble`

---

### Vivienda (quienes buscan; se salta si eligió "integrar" en p20a)

---

#### `p21_tipo_inmueble` · `botones` · Airtable: `tipoInmueble`

> "¿Qué tipo de vivienda buscas?"

| Label | Value | Siguiente |
|---|---|---|
| Habitación en piso compartido | `habitacion` | → `p22_habitaciones` |
| Estudio / Loft | `estudio` | → `p23_amueblado` *(salta habitaciones)* |
| Piso / Apartamento | `piso` | → `p22_habitaciones` |
| Casa | `casa` | → `p22_habitaciones` |

> *Nota:* `co-living` existe en `LeadData` y en el formulario web pero **no está en Avoa** en este flujo.

---

#### `p22_habitaciones` · `botones` · Airtable: `habitacionesMinimas` *(no aplica a estudio)*

> "¿Cuántas habitaciones mínimas necesitas?"

| Label | Value |
|---|---|
| 1 | `1` |
| 2 | `2` |
| 3 | `3` |
| 4 o más | `4+` |

- → `p23_amueblado`

---

#### `p23_amueblado` · `botones` · Airtable: `amueblado`

> "¿Prefieres la vivienda amueblada?"

| Label | Value |
|---|---|
| Sí, completamente amueblada | `si` |
| Sin muebles | `no` |
| Indiferente | `indiferente` |

- → `p24_imprescindibles`

---

#### `p24_imprescindibles` · `botones` · **multiselect** · exclusivo: `no` · Airtable: `imprescindibles`

> "¿Hay algo que sea imprescindible para la vivienda?"

| Label | Value |
|---|---|
| Ascensor | `ascensor` |
| Plaza de garaje | `garaje` |
| Calefacción central o gas | `calefaccion` |
| Terraza / exterior | `terraza` |
| Ninguno en particular *(excluyente)* | `no` |

- → `p24b_comodidades`

---

#### `p24b_comodidades` · `botones` · **multiselect** · exclusivo: `ninguna` · Airtable: `comodidades`

> "¿Hay alguna comodidad que sea imprescindible para tu día a día?"

| Label | Value |
|---|---|
| Cerca del transporte público | `transporte` |
| Zona tranquila / residencial | `zona-tranquila` |
| Cerca de colegios | `cerca-colegios` |
| Fibra óptica / buen internet | `internet` |
| Ninguna en particular *(excluyente)* | `ninguna` |

- → `p25_modalidad`

---

#### `p25_modalidad` · `botones` · Airtable: `modalidad`

> "¿Cómo prefieres que gestionemos la búsqueda?"

| Label | Value |
|---|---|
| Dejar el piso alquilado antes de viajar (100% a distancia) | `antes-de-viajar` |
| Llegar primero a un alojamiento temporal y buscar allí | `ya-estando` |

- → `p26_profesion`

---

### Perfil profesional (todos los que llegan a Nivel 2)

---

#### `p26_profesion` · **`llm`** *(Etapa 1: funciona como `input`)* · Airtable: `profesion`

> "Para completar tu perfil, ¿a qué te dedicas o cuál es tu profesión?"

- Validación: `texto`
- En Etapa 1: texto libre sin llamada a IA.
- **Etapa futura:** este paso usará la API de Claude para respuesta personalizada.
- → `p27_estudios`

---

#### `p27_estudios` · `botones` · **sin campo Airtable**

> "¿Cuál es tu nivel de estudios?"

| Label | Value |
|---|---|
| Sin estudios superiores | `sin-superiores` |
| Bachillerato o equivalente | `bachillerato` |
| Técnico / FP / Terciario | `fp` |
| Universitario / Grado | `universitario` |
| Posgrado / Máster / Doctorado | `posgrado` |

- → `atribucion`

---

### Cierre y guardado final

---

#### `atribucion` · `botones` · Airtable: `comoNosConociste` · **`guardar_lead_completo` ← SEGUNDO GUARDADO**

> "Una última, muy rápida, que nos ayuda a mejorar: ¿cómo nos conociste?"

| Label | Value |
|---|---|
| Instagram | `instagram` |
| Facebook | `facebook` |
| TikTok | `tiktok` |
| Google | `google` |
| Recomendación | `recomendacion` |
| Otro | `otro` |

- **PATCH a Airtable** con todos los campos del flujo completo.
- → `despedida`

---

#### `despedida` · `botones` · **`fin`**

> "¡Perfecto, {{nombre}}! En los próximos 2 días hábiles revisaremos tu caso con atención y te haremos llegar un plan a medida para tu situación. ¡Mucho ánimo, que este ya es un gran paso hacia Galicia!"

| Label | Value |
|---|---|
| Cerrar | `cerrar` |

- Cierra el widget. Fin del flujo principal.

> *Nota: hay un `_texto_futuro_email` en el JSON preparado para cuando se active el envío de Plan Estratégico por correo (Etapa 3). Hasta entonces, el texto activo es el de arriba.*

---

## Mapa de campos → Airtable

| Campo Airtable | Paso | Tipo Airtable | Notas |
|---|---|---|---|
| `nombreCompleto` | `p1_nombre` | Single line | Guardado en nivel1 |
| `email` | `p2_email` | Single line | Guardado en nivel1 |
| `telefono` | `p15_telefono` | Single line | Guardado en nivel1 |
| `paisResidencia` | `p3_origen` o `p3b_pais` | Single line | `en_espana` o el texto del país |
| `fechaLlegada` | `p4_plazo` | Single line | `menos-1-mes` \| `1-3-meses` \| `3-6-meses` \| `mas-6-meses` \| `sin-fecha` |
| `ciudadDestino` | `p5_ciudad` | Single select | `vigo` \| `a-coruna` \| `santiago` \| `pontevedra` \| `lugo` \| `indiferente` |
| `adultos` | `p6a_adultos` | Single select | `1` \| `2` \| `3` \| `4+` |
| `ninos` | `p6c_ninos` | Single select | `0` \| `1` \| `2` \| `3+` (solo si hay menores) |
| `adolescentes` | `p6d_adolescentes` | Single select | `0` \| `1` \| `2` \| `3+` (solo si hay menores) |
| `mascotas` | `p7_mascotas` | Single select | `si` \| `no` |
| `mascotaTipo` | `p7b_tipo` | Multiple select | `perro` \| `gato` \| `otro` (solo si mascotas=si) |
| `mascotaPeso` | `p7b_peso` | Single select | `0-5 kg` \| `5-10 kg` \| `+10 kg` (solo si mascotaTipo incluye perro) |
| `documentacion` | `p8_documentacion` | Single select | 6 opciones |
| `situacionLaboral` | `p9_laboral` | Single select | 7 opciones |
| `ingresosMensuales` | `p10_ingresos` | Single line | 5 opciones |
| `garantias` | `p11_garantias` | Multiple select | `adelanto-6-12` \| `aval` \| `seguro-impago` \| `ninguna` |
| `presupuestoMensual` | `p12_presupuesto` | Single select | `menos-700` \| `700-1000` \| `1000-1400` \| `mas-1400` |
| `necesidadesEspeciales` | `p16_accesibilidad` | Single line | `si` \| `no` |
| `tipoInmueble` | `p21_tipo_inmueble` | Single select | `habitacion` \| `estudio` \| `piso` \| `casa` |
| `habitacionesMinimas` | `p22_habitaciones` | Single select | `1` \| `2` \| `3` \| `4+` (no aplica a estudio) |
| `amueblado` | `p23_amueblado` | Single select | `si` \| `no` \| `indiferente` |
| `imprescindibles` | `p24_imprescindibles` | Multiple select | `ascensor` \| `garaje` \| `calefaccion` \| `terraza` \| `no` |
| `comodidades` | `p24b_comodidades` | Multiple select | `transporte` \| `zona-tranquila` \| `cerca-colegios` \| `internet` \| `ninguna` |
| `modalidad` | `p25_modalidad` | Single select | `antes-de-viajar` \| `ya-estando` |
| `profesion` | `p26_profesion` | Long text | Texto libre |
| `comoNosConociste` | `atribucion` | Single select | `instagram` \| `facebook` \| `tiktok` \| `google` \| `recomendacion` \| `otro` |
| `comprendeServicio` | *(automático)* | Checkbox | Siempre `true` — se añade en el mapper de `route.ts` |
| `consentimientoRGPD` | *(automático)* | Checkbox | Siempre `true` — se añade en el mapper de `route.ts` |

**Campos en Airtable que Avoa NO pregunta** (presentes en el formulario web `/conocernos`):
- `co-living` como opción de `tipoInmueble` — solo disponible en el formulario web.

**Campos que Avoa pregunta pero NO se guardan en Airtable** (enrutamiento puro):
- Respuesta a `p6b_menores` (si/no menores)
- Respuesta a `p13_banco` (cuenta bancaria)
- Respuesta a `p14_servicio` / `p14_explicacion` (comprensión del servicio → se guarda como `true`)
- Respuesta a `p17_licencia` y `p17b_canje` (tipo de licencia)
- Respuesta a `p18a_ciudad` (ciudad actual en España)
- Respuesta a `p19a_tiempo` y `p18b_tiempo` (tiempo en España / planificando)
- Respuesta a `p20a_objetivo` (busca vivienda o integración)
- Respuesta a `p27_estudios` (nivel de estudios)

---

## Pasos virtuales (resumen técnico)

| Paso | Comportamiento |
|---|---|
| `p11_check` | Definido en `flow.json` pero **nunca alcanzado en runtime**. `flowEngine` resuelve la transición directamente al procesar `p11_garantias`. |
| `p18_check_origen` | Definido en `flow.json` con texto vacío y sin opciones. Si el widget lo recibe, llama a `avanzarPasoVirtual` con respuesta `""`. `flowEngine` lo resuelve según `sesion.origenResidencia`. Sin embargo, el motor también cortocircuita este paso al procesar `p17_licencia` y `p17b_canje`, por lo que normalmente tampoco llega al widget. |

---

## Diagrama simplificado del flujo principal

```
bienvenida → rgpd → p1_nombre → p2_email → p15_telefono [SAVE-1]
  ↓
p3_origen ──── en_espana ──────────────────────────────┐
  └── fuera → p3b_pais                                  │
  ↓ (ambas ramas convergen)                             │
p4_plazo → p5_ciudad → p6a_adultos → p6b_menores        │
  ├── si → p6c_ninos → p6d_adolescentes ─┐             │
  └── no ─────────────────────────────────┤             │
  ↓                                       │             │
p7_mascotas ←───────────────────────────-┘             │
  ├── si → p7b_tipo ──── sin perro → p8               │
  │         └── con perro → p7b_peso → p8             │
  └── no ──────────────────────────────→ p8           │
  ↓                                                    │
p8_doc → p9_laboral → p10_ingresos                    │
  ├── sin-ingresos → p10_sin_ingresos_msg ─┐          │
  └── otros ────────────────────────────────┤          │
  ↓                                         │          │
p11_garantias ←──────────────────────────-┘          │
  ├── ninguna + ingresos riesgo → p11_lead → despedida_preparacion [FIN]
  └── resto → p12_presupuesto → p13_banco → p14_servicio
                ↓                                      │
         transicion_nivel2                             │
         ├── no → despedida [FIN]                     │
         └── si → p16_accesibilidad → p17_licencia    │
                    ↓ (via flowEngine)                 │
               origenResidencia ←─────────────────────┘
               ├── en_espana → p18a_ciudad → p19a → p20a_objetivo
               │                              ├── integrar → p26_profesion
               │                              └── busco → p21_tipo_inmueble
               └── fuera → p18b_tiempo → p21_tipo_inmueble
                              ↓
                      p21_tipo_inmueble
                      ├── estudio → p23_amueblado
                      └── resto → p22_habitaciones → p23_amueblado
                          ↓
                      p24_imprescindibles → p24b_comodidades → p25_modalidad
                          ↓
                      p26_profesion → p27_estudios → atribucion [SAVE-2]
                          ↓
                      despedida [FIN]
```

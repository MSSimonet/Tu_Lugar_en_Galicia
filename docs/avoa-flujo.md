# Avoa — Flujo Conversacional
### Tu Lugar En Galicia

**Etiquetas de paso (para el JSON del flujo):** `[botones]`, `[input]`, `[llm]`. La IA (`[llm]`) solo se activa en texto libre; el resto es 0 tokens.

---

## Bienvenida y permiso `[botones]`

> "¡Hola! Qué alegría saludarte. Soy **Avoa**, la representante virtual del equipo de **Tu Lugar En Galicia**. Sé que mudarse o establecerse aquí es un paso enorme, lleno de ilusión y también de dudas, y mi trabajo es acompañarte para que te sientas con seguridad en cada decisión. Para cuidar tu tiempo y ver cómo podemos ayudarte hoy, ¿te parece bien si te hago unas preguntas breves sobre tu situación?"

`[Sí, empecemos]`  `[Tengo una duda primero]`

---

## Consentimiento de datos (RGPD) `[botones]`

> "¡Genial! Antes de empezar: para preparar tu plan necesitaremos guardar tu nombre y datos de contacto. Al continuar, nos autorizas a tratarlos según nuestra Política de Privacidad, y podrás darte de baja cuando quieras."

`[Acepto y seguimos]`  `[Ver política de privacidad]`

*(Insertar aquí el enlace real a la política. Solo tras `Acepto y seguimos` se piden datos.)*

---

## NIVEL 1 — Calificación básica (todos)

**P1. Nombre** `[input]`
> "Para empezar, ¿cómo te llamas? (nombre y apellido)"

**P2. Email** `[input]`
> "Encantada, **[Nombre]**. ¿Me dejas un email que uses a menudo? Te prometemos no enviarte nada que no hayas solicitado."

**P3. Origen** `[botones]` *(+`[input]` si viene de fuera)*
> "Galicia es una tierra preciosa para recibirte, **[Nombre]**. Para darte la guía adecuada, ¿ya vives en España o estás planificando tu llegada desde otro país?"

`[Ya vivo en España]`  `[Vengo de fuera]`

- Si **Vengo de fuera** → "¿Desde qué país nos escribes?" `[input]`
  - *(Si responde Argentina u otro país con fuerte vínculo gallego: "¡Qué lindo país! Casi cada familia gallega tiene raíces allí.")*

*(Esta respuesta marca la RAMA del Nivel 2: España o Fuera.)*

**P4. Zona de destino** `[botones]`
> "¿A qué ciudad o zona de Galicia te diriges?"

`[Vigo]`  `[A Coruña]`  `[Santiago de Compostela]`  `[Otra zona]`  `[Aún no lo sé]`

**P5. Composición familiar** `[input]` `[llm]`
> "¿Quiénes formarían parte de esta mudanza contigo?"

**P6. Mascotas** `[botones]` *(+`[llm]` en detalles)*
> "Sabemos que los animales son de la familia, aunque aquí el alquiler suele poner restricciones. ¿Viajáis con alguna mascota?"

`[No]`  `[Sí]` → *(¿cuántas, de qué tipo, raza y tamaño aproximado?)*

**P7. Tipo de vivienda** `[botones]`
> "Vamos a perfilar el hogar que buscáis. ¿Qué tipo de vivienda tenéis en mente?"

`[Piso / apartamento]`  `[Casa]`  `[Indiferente]`

**P8. Presupuesto** `[input]`
> "¿Y cuál es vuestro presupuesto mensual real para el alquiler?"

> *(Micro-acuse de avance, antes del bloque práctico):*
> "Vas muy bien, **[Nombre]**. Con esto ya tenemos clara la imagen de tu hogar ideal. Ahora unas pocas sobre la parte práctica, que es justo donde más os acompañamos."

**P9. Filtro legal** `[botones]`
> "Para orientarte según tu caso, cuéntame cómo estás con los papeles, que para alquilar aquí piden bastante. ¿Cuentas con documentación para residir legalmente en España?"

`[Sí, tengo todo]`  `[Tengo algunos documentos]`  `[Aún no tengo]`

**P10. Ingresos / solvencia** `[botones]`
> "Para preparar bien tu llegada y que no haya sorpresas al alquilar, me ayuda saber cómo está hoy tu situación de ingresos. Así el equipo te orienta a tu medida. ¿Cuál encaja mejor?"

`[Sí, contrato de trabajo]` → *(¿indefinido, temporal o en periodo de prueba?)*
`[Sí, soy autónomo]`
`[Tengo avalista con contrato en Europa]`
`[Por el momento no]`

- Si **Por el momento no**:
  > "Gracias por la sinceridad, **[Nombre]**. Hoy el mercado en Galicia pide bastante respaldo para alquilar, así que conviene preparar bien ese punto antes de buscar. Podemos enviarte recursos para ir armándolo y, cuando lo tengas encaminado, retomamos encantados tu plan. ¿Te gustaría que el equipo te contacte igualmente para orientarte, sin compromiso?"
  >
  > `[Sí, que me contacten]`  `[Solo los recursos]` → etiqueta interna *"lead en preparación"*.

**P11. Cuenta bancaria** `[botones]`
> "¿Ya tienes cuenta bancaria en España?"

`[Sí]`  `[No]`

**P12. Teléfono** `[input]`
> "Ya tenemos lo esencial para saber cómo ayudarte, **[Nombre]**. Para que nuestro equipo analice tu caso y te prepare una **Hoja de Ruta de Integración** gratuita y a tu medida, ¿nos dejas un teléfono de contacto (con el prefijo de tu país)? Así avanzamos a la siguiente etapa de este camino a Galicia."

---

## Transición al Nivel 2 `[botones]`

> "¡Estupendo! Ya guardamos tus datos. Si tienes un par de minutos más, con unas preguntas extra nuestro equipo podrá incluir módulos totalmente personalizados en tu Hoja de Ruta. ¿Te animas a completarla ahora, **[Nombre]**?"

`[Sí, continuemos]`  `[No, prefiero que me contacten]`

- **No** → "Perfecto, **[Nombre]**, en breve el equipo se pondrá en contacto contigo. ¡Mucho ánimo con este gran paso!" *(salta al Cierre.)*

---

## NIVEL 2 — Plan personalizado (opcional)

### Bloque A — Familia ampliada (todos)

**P13. Hijos** `[input]` `[llm]`
> "¿Tienes hijos? ¿Qué edades tienen?"

**P14. Necesidades especiales / accesibilidad** `[input]` `[llm]`
> "¿Algún miembro del hogar tiene necesidades especiales o alguna discapacidad? Esto nos ayuda a buscar viviendas con las características adecuadas."

---

### Bloque B · RAMA "Ya vive en España" *(según P3)*

**P15. Ciudad/provincia actual** `[input]`
> "¿En qué ciudad o provincia vives actualmente?"

**P16. Tiempo en España** `[botones]`
> "¿Cuánto tiempo llevas viviendo en España?"
`[Menos de 1 año]`  `[Entre 1 y 5 años]`  `[Más de 5 años]`

**P17. Objetivo** `[botones]`
> "¿Estás buscando vivienda en Galicia o ya tienes dónde vivir y necesitas orientación para integrarte mejor?"
`[Busco vivienda]` → continúa  ·  `[Ya tengo vivienda, quiero integrarme]` → salta al **Bloque E**

**P18. Plazo para la vivienda** `[botones]`
> "¿Cuándo necesitarías tener la vivienda?"
`[Menos de 3 meses]`  `[Entre 3 y 6 meses]`  `[Más de 6 meses]`

**P19. Imprescindibles de la vivienda** `[botones]` *(multi)*
`[Ascensor]`  `[Plaza de garaje]`  `[Calefacción central o gas]`  `[Amueblada y equipada]`  `[Sin amueblar]`

**P20. Movilidad** `[botones]`
> "¿Tienes coche?"
`[Sí]` → *(incluir guía de canje de permiso en DGT)*
`[Compraré uno allí]` → "¿Tienes permiso de conducir extranjero?" → *(guía de canje DGT si aplica)*
`[No, usaré transporte público]`

→ continúa al **Bloque E**

---

### Bloque B · RAMA "Viene de fuera" *(según P3; el país ya se capturó en P3)*

**P15. Plazo para la vivienda** `[botones]`
> "¿En qué plazo necesitas tener vivienda?"
`[Menos de 3 meses]`  `[Entre 3 y 6 meses]`  `[Más de 6 meses]`

**P16. Tiempo planificando** `[botones]`
> "¿Cuánto tiempo llevas planificando esta mudanza?"
`[Menos de 1 año]`  `[Entre 1 y 5 años]`  `[Más de 5 años]`

**P17. Situación legal** `[botones]`
> "¿Cuál es tu situación legal para residir en España?"
`[Pasaporte de la UE]` → **Bloque C**
`[Residencia o visado aprobado]` → **Bloque C**
`[Tengo familiar español]` *(Reagrupación / TIE)* → **Bloque C**
`[Extracomunitario, necesito visado]` → abre sub-rama
`[Aún no lo sé]`

**Sub-rama — Perfil de visado extracomunitario** `[botones]`
> "¿Cuál será tu fuente de sustento en España?"
`[Trabajo remoto para empresa de fuera]` *(Visado Nómada Digital)*
`[Rentas, inversiones o jubilación]` *(Visado No Lucrativo)*
`[Voy a emprender un negocio]` *(Visado Emprendedor)*
`[Voy a estudiar]` *(Estancia por Estudios)*

**P18. Imprescindibles de la vivienda** `[botones]` *(multi)*
`[Ascensor]`  `[Plaza de garaje]`  `[Calefacción central o gas]`  `[Amueblada y equipada]`  `[Sin amueblar]` *(traigo mudanza o compro en destino)*

---

### Bloque C — Solvencia ampliada (viene de fuera) `[botones]`

**P19.** "¿Cómo acreditarás tu solvencia ante el propietario?"
`[Nómina]` → *(¿indefinido, temporal o en periodo de prueba?)*
`[Autónomo con historial de facturación]`
`[Fondos líquidos / aval bancario]` → *(¿podrías adelantar varios meses por adelantado si fuera necesario?)*
`[Avalista con ingresos demostrables en España o la UE]`

---

### Bloque D — Sanidad (viene de fuera) `[botones]`

**P20.** "¿Cómo gestionarás tu cobertura médica?"
`[Sistema público]` *(por contrato español o convenio bilateral)*
`[Seguro médico privado]` → *(para visado debe ser sin copagos, sin carencias y con cobertura completa)*

---

### Bloque E — Perfil profesional (todos)

**P21. Profesión** `[input]` `[llm]`
> "Para completar tu perfil, ¿a qué te dedicas o cuál es tu profesión?"

**P22. Nivel de estudios** `[botones]`
`[Sin estudios superiores]`
`[Bachillerato o equivalente]` *(orientar sobre homologación)*
`[Técnico / FP]` *(orientar sobre homologación)*
`[Universitario / Grado]` *(orientar sobre homologación)*
`[Posgrado / Máster / Doctorado]` *(orientar sobre homologación)*

---

## Cierre y entrega

**Canal de entrega** `[botones]`
> "Con todo lo que me has contado, **[Nombre]**, puedo preparar tu **Hoja de Ruta de Integración** personalizada. ¿Prefieres recibirla por email o por WhatsApp?"
`[Email]` *(ya registrado en P2)*  ·  `[WhatsApp]` *(ya registrado en P12)*

**Atribución** `[botones]`
> "Y una última muy rápida que nos ayuda a mejorar: ¿cómo nos conociste?"
`[Redes sociales]`  `[Recomendación]`  `[Búsqueda en Google]`  `[Otro]`

**Despedida**
> "¡Perfecto, **[Nombre]**! En breve recibirás tu Hoja de Ruta, y el equipo queda disponible para cualquier consulta. ¡Mucho ánimo, este es un gran paso hacia Galicia!"

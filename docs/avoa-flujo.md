# Avoa — Flujo Conversacional
### Tu Lugar En Galicia · Servicio de búsqueda de vivienda y relocation

**Etiquetas de paso (para el JSON del flujo):** `[botones]`, `[input]`, `[llm]`. La IA (`[llm]`) solo se activa en texto libre; el resto se resuelve con botones/validación (0 tokens).

---

## Bienvenida, naturaleza del servicio y permiso `[botones]`

> "¡Hola! Qué alegría saludarte. Soy **Avoa**, del equipo de **Tu Lugar En Galicia**. Sé que buscar hogar y mudarse aquí es un paso enorme, lleno de ilusión y también de dudas, y mi trabajo es acompañarte para que llegues con seguridad y tu nuevo hogar te esté esperando.
>
> Antes de empezar, quiero ser transparente contigo: **no somos una inmobiliaria con pisos propios**. Somos tu **Personal Shopper inmobiliario**: buscamos, filtramos y visitamos las mejores opciones del mercado trabajando **solo para ti** y defendiendo tus intereses, incluso a distancia. Es un servicio profesional con honorarios propios, aparte del alquiler y de la fianza —te lo explicamos todo con claridad más adelante.
>
> Para ver cómo podemos ayudarte y cuidar tu tiempo, ¿te parece bien si te hago unas preguntas breves sobre tu situación?"

`[Sí, empecemos]`

---

## Consentimiento de datos (RGPD) `[botones]`

> "¡Genial! Antes de empezar: para preparar tu plan necesitaremos tu nombre y datos de contacto. Al continuar, nos autorizas a tratarlos según nuestra Política de Privacidad, y podrás darte de baja cuando quieras."

`[Acepto y seguimos]`  `[Ver política de privacidad]`

*(Insertar aquí el enlace real a la política. Solo tras `Acepto y seguimos` se piden datos.)*

---

## NIVEL 1 — Viabilidad (todos)

> *Objetivo del Nivel 1: confirmar si podemos ayudar a esta persona y si encaja con nuestro servicio. Es el filtro comercial.*

**P1. Nombre** `[input]`
> "Para empezar, ¿cómo te llamas? (nombre y apellido)"

**P2. Email** `[input]`
> "Encantada, **[Nombre]**. ¿Me dejas un email que uses a menudo? Te prometemos no enviarte nada que no hayas solicitado."

**P3. Origen** `[botones]` *(+`[input]` si viene de fuera)*
> "Galicia es una tierra preciosa para recibirte, **[Nombre]**. Para darte la guía adecuada, ¿ya vives en España o estás planificando tu llegada desde otro país?"

`[Ya vivo en España]`  `[Vengo de fuera]`

- Si **Vengo de fuera** → "¿Desde qué país nos escribes?" `[input]`
  - *(Si responde un país con fuerte vínculo gallego, p. ej. Argentina: "¡Qué lindo país! Casi cada familia gallega tiene raíces allí.")*

*(Esta respuesta marca la RAMA del Nivel 2: España o Fuera.)*

**P4. Plazo / horizonte temporal** `[botones]` — *(pregunta filtro)*
> "¿En qué plazo necesitas tener resuelta tu vivienda en Galicia?"

`[En menos de 1 mes]` *(plazo muy ajustado; se gestiona como urgencia)*
`[En 1 a 3 meses]`
`[En 3 a 6 meses]`
`[En más de 6 meses]` *(aún no es accionable; etiqueta interna "seguimiento futuro")*
`[Aún no tengo fecha]`

> *(Ventana accionable ideal: 1 a 6 meses. "Menos de 1 mes" y "más de 6 meses" / "sin fecha" se gestionan con un mensaje y etiqueta de seguimiento, no se descartan.)*

**P5. Zona de destino** `[botones]`
> "¿A qué ciudad de Galicia te diriges? Nuestro foco de búsqueda principal es Vigo y A Coruña."

`[Vigo]`  `[A Coruña]`  `[Ambas / Indiferente]`  `[Otra zona de Galicia]`

**P6. Composición del hogar** `[input]` `[llm]`
> "¿Quiénes formarían parte de esta mudanza contigo? Cuéntame cuántos adultos y, si vienen niños, sus edades."

**P7. Mascotas** `[botones]` *(+`[llm]` en detalles)*
> "Te pregunto por las mascotas porque aquí marca mucho la búsqueda: cerca del 80% de los propietarios no las admite, así que necesitamos el dato real para filtrar bien por ti. ¿Viajas con alguna mascota?"

`[No]`  `[Sí]` → *(¿cuántas, de qué especie, raza y peso aproximado de cada una?)*

> *(Micro-acuse de avance, antes del bloque de viabilidad):*
> "Vas muy bien, **[Nombre]**. Con esto ya tengo clara la imagen de tu hogar. Ahora unas pocas sobre la parte práctica —papeles y números—, que es justo donde nuestro equipo más te defiende ante los propietarios."

**P8. Situación legal** `[botones]`
> "¿Cuál es tu situación para residir legalmente en España?"

`[Pasaporte UE o doble nacionalidad]`
`[Visado / TIE / NIE ya aprobado]`
`[En trámite de visado]`
`[Entraré como turista]` *(nota interna: limita opciones con algunos propietarios; se analiza el caso)*

**P9. Situación laboral** `[botones]`
> "¿Cómo será tu situación laboral al llegar (o ya estando) en España?"

`[Cuenta ajena con nómina en España]`
`[Autónomo registrado en España]`
`[Teletrabajo para empresa extranjera]`
`[Rentista / fondos propios]`
`[Estudiante]`
`[Otra / por el momento sin empleo]`

**P10. Ingresos del hogar** `[botones]`
> "Para defender bien tu candidatura ante los propietarios, me ayuda conocer de forma aproximada los ingresos mensuales de tu hogar. ¿En qué rango te ubicas?"

`[Menos de 1.500 €]`
`[1.500 – 2.500 €]`
`[2.500 – 4.000 €]`
`[Más de 4.000 €]`
`[No tengo ingresos en España aún]`

- Si elige un **rango en euros** → continúa a P11.
- Si elige **No tengo ingresos en España aún** → mostrar este mensaje y continuar a P11:
  > "Sin problema, **[Nombre]**: muchas familias llegan así y la solvencia se resuelve con otro tipo de respaldo (ahorros, aval o seguro). Lo vemos justo en la siguiente pregunta."
  → continúa a **P11 (Garantías)**, donde se evalúan ahorros, aval y seguro. *(No se descarta aquí: la viabilidad se decide en P11 según el respaldo disponible.)*

**P11. Garantías** `[botones]` *(multi)*
> "En España es muy habitual pedir garantías extra a perfiles internacionales, para suplir la falta de historial laboral aquí. No hace falta tenerlas todas; marca las que sí podrías asumir si un propietario las pidiera:"

`[Adelantar varios meses de alquiler (6–12)]`
`[Aval bancario o avalista con ingresos en España]`
`[Contratar un seguro de impago por mi cuenta]`
`[Ninguna de las anteriores]`

- Si marca **solo "Ninguna"** *(y además en P10 indicó "Menos de 1.500 €" o "No tengo ingresos en España aún")*:
  > "Gracias por la sinceridad, **[Nombre]**. Hoy el mercado en Galicia pide bastante respaldo para alquilar, así que conviene preparar ese punto antes de iniciar la búsqueda. Podemos enviarte recursos para irlo armando y, en cuanto lo tengas encaminado, retomamos encantados tu plan."
  >
  > `[Sí, gracias]` → etiqueta interna *"lead en preparación"*.

*(Si marca "Ninguna" pero en P10 declaró ingresos suficientes, no se activa la etiqueta: continúa el flujo con normalidad.)*

**P12. Presupuesto** `[botones]`
> "¿Cuál es tu presupuesto **mensual máximo** para el alquiler? Como referencia honesta: un piso familiar adecuado en estas ciudades suele partir de 700–800 €, y los suministros (agua, luz, gas) van aparte."

`[Menos de 700 €]` *(opciones muy limitadas para familias)*
`[700 – 900 €]`
`[900 – 1.200 €]`
`[Más de 1.200 €]`

**P13. Cuenta bancaria en España** `[botones]`
> "¿Ya tienes cuenta bancaria operativa en España?"

`[Sí]`  `[No]`

**P14. Entendimiento del servicio** `[botones]`
> "Una última importante para avanzar con total claridad, **[Nombre]**: ¿confirmas que entiendes que somos un servicio de consultoría y búsqueda personalizada de vivienda que trabaja en exclusiva para ti, con unos honorarios propios, aparte del alquiler y de la fianza?"

`[Sí, lo entiendo perfectamente]`
`[Me gustaría que me lo expliquen mejor]`

- Si **Me gustaría que me lo expliquen mejor** → mostrar este texto fijo (no generado por IA):
  > "Con gusto te lo explico, **[Nombre]**. Funcionamos como tu equipo de búsqueda de confianza: nos contratas para encontrar, filtrar y visitar por ti las mejores viviendas del mercado, y para negociar y defender tus intereses ante los propietarios, incluso si todavía estás fuera de España.
  >
  > Por eso tenemos honorarios propios, independientes del alquiler y de la fianza que pagarías de todos modos a cualquier arrendador. Ese pago cubre nuestro trabajo profesional buscando para ti; no es una comisión de intermediación inmobiliaria.
  >
  > ¿Qué ganas tú? Te ahorras semanas de búsqueda a distancia, evitas anuncios falsos y estafas habituales en el alquiler, llegas con un hogar ya resuelto y tienes a alguien que conoce el mercado gallego trabajando de tu lado.
  >
  > ¿Quieres que sigamos con las preguntas para preparar tu Plan Estratégico, o prefieres una videollamada con el equipo para verlo en detalle?"
  >
  > `[Continuar con las preguntas]`

**P15. Teléfono** `[input]`
> "Ya tengo lo esencial para saber cómo ayudarte, **[Nombre]**. Para que nuestro equipo analice tu viabilidad a fondo y te prepare un **Plan Estratégico** gratuito y a tu medida, ¿me dejas un teléfono de contacto (con el prefijo de tu país)? Así avanzamos a la siguiente etapa de este camino a Galicia."

---

## Transición al Nivel 2 `[botones]`

> "¡Estupendo! Ya tenemos tus datos. Si tienes un par de minutos más, con unas preguntas extra el equipo podrá afinar tu Plan Estratégico y el encargo de búsqueda con detalle. ¿Te animas a completarlo ahora, **[Nombre]**?"

`[Sí, continuemos]`  `[No, prefiero que me contacten]`

- **No** → "Perfecto, **[Nombre]**. Si tu perfil encaja con lo que exige hoy el mercado, te contactaremos en un plazo máximo de 48 h hábiles para una videollamada inicial. ¡Mucho ánimo con este gran paso!" *(salta al Cierre.)*

---

## NIVEL 2 — Encargo de búsqueda y Plan Estratégico (opcional)

### Bloque A — Hogar y movilidad (todos)

**P16. Necesidades especiales / accesibilidad** `[input]` `[llm]`
> "¿Algún miembro del hogar tiene necesidades especiales o alguna discapacidad? Esto nos ayuda a buscar viviendas con las características adecuadas."

**P17. Licencia de conducir** `[botones]`
> "¿Tienes licencia de conducir? ¿De qué tipo?"
`[Española]`  `[Europea]`  `[De mi país de origen]`  `[No tengo]`
- Si **De mi país de origen** → "Existe la posibilidad de canjearla por una licencia española si tu país tiene convenio con España; te orientamos sobre los requisitos."
- *(La licencia europea es válida para conducir en España.)*

---

### Bloque B · RAMA "Ya vive en España" *(según P3)*

**P18. Ciudad/provincia actual** `[input]`
> "¿En qué ciudad o provincia vives actualmente?"

**P19. Tiempo en España** `[botones]`
`[Menos de 1 año]`  `[Entre 1 y 5 años]`  `[Más de 5 años]`

**P20. Objetivo** `[botones]`
> "¿Estás buscando vivienda en Galicia o ya tienes dónde vivir y buscas orientación para integrarte mejor?"
`[Busco vivienda]` → continúa al Bloque D  ·  `[Ya tengo vivienda, quiero integrarme]` → salta al **Bloque F**

---

### Bloque C · RAMA "Viene de fuera" *(según P3; el país ya se capturó en P3)*

**P18. Tiempo planificando la mudanza** `[botones]`
`[Menos de 1 año]`  `[Entre 1 y 5 años]`  `[Más de 5 años]`

**P19. Perfil de visado** `[botones]` *(solo si P8 = "En trámite" o "Turista")*
> "¿Cuál será tu vía principal de estancia o tu fuente de sustento en España?"
`[Teletrabajo para empresa de fuera]` *(Nómada Digital)*
`[Rentas, inversiones o jubilación]` *(No Lucrativo)*
`[Voy a emprender un negocio]` *(Emprendedor)*
`[Voy a estudiar]` *(Estancia por Estudios)*

**P20. Cobertura de salud** `[botones]`
> "¿Cómo gestionarás tu cobertura médica?"
`[Sistema público]` *(por contrato español o convenio bilateral)*
`[Seguro médico privado]` → *(para visado debe ser sin copagos, sin carencias y con cobertura completa)*

→ continúa al Bloque D

---

### Bloque D — Encargo de búsqueda: la vivienda (quienes buscan vivienda)

**P21. Tipo de vivienda** `[botones]`
`[Piso / apartamento]`  `[Casa]`  `[Indiferente]`

**P22. Habitaciones mínimas** `[botones]`
`[1]`  `[2]`  `[3]`  `[4 o más]`

**P23. Amueblada** `[botones]`
`[Sí, completamente amueblada]`  `[Sin muebles]`  `[Indiferente]`

**P24. Imprescindibles** `[botones]` *(multi)*
`[Ascensor]`  `[Plaza de garaje]`  `[Calefacción central o gas]`  `[Terraza / exterior]`  `[Ninguno en particular]`
> *(Nota: la plaza de garaje es muy recomendable en el centro de A Coruña y en las zonas con cuestas de Vigo.)*

---

### Bloque E — Logística (quienes buscan vivienda)

**P25. Modo de gestión** `[botones]`
> "¿Cómo prefieres que gestionemos la búsqueda?"
`[Dejar el piso alquilado antes de viajar]` *(100% a distancia, con videovisitas e informes)*
`[Llegar primero a un alojamiento temporal y buscar el definitivo allí]` *(con apoyo presencial)*

---

### Bloque F — Perfil profesional (todos)

**P26. Profesión** `[input]` `[llm]`
> "Para completar tu perfil, ¿a qué te dedicas o cuál es tu profesión?"

**P27. Nivel de estudios** `[botones]`
`[Sin estudios superiores]`
`[Bachillerato o equivalente]` *(orientar sobre homologación)*
`[Técnico / FP]` *(orientar sobre homologación)*
`[Universitario / Grado]` *(orientar sobre homologación)*
`[Posgrado / Máster / Doctorado]` *(orientar sobre homologación)*

---

## Cierre y entrega

**Entrega del Plan Estratégico**
> "Con todo lo que me has contado, **[Nombre]**, puedo preparar tu **Plan Estratégico** personalizado. Te lo enviaremos por correo electrónico a la brevedad."

**Atribución** `[botones]`
> "Y una última muy rápida que nos ayuda a mejorar: ¿cómo nos conociste?"
`[Redes sociales]` → *(¿cuál?)*
`[Recomendación]` → *(¿de quién?)*
`[Búsqueda en Google]`
`[Otro]` → *(¿cuál?)*

**Despedida**
> "¡Perfecto, **[Nombre]**! Revisaremos tu caso con cuidado y, si tu perfil encaja con lo que exige hoy el mercado gallego, te contactaremos en un máximo de 48 h hábiles para una videollamada inicial. El equipo queda disponible para cualquier consulta. ¡Mucho ánimo, este es un gran paso hacia Galicia!"

---

## Notas para la implementación

- **Plan Estratégico:** nombre único del documento entregable (unifica las antiguas "Hoja de Ruta" y "Plan Migratorio"). Su contenido varía según las respuestas, pero el nombre es siempre el mismo.
- **Pregunta filtro de plazo (P4):** colocada al inicio a propósito. Plazo de 1 a 6 meses = accionable; menos de 1 mes = urgencia; más de 6 meses o sin fecha = seguimiento futuro (no se descarta).
- **Transparencia del modelo de pago:** se anuncia en la bienvenida y se confirma en P14 antes de pedir el teléfono. La explicación ampliada (botón "Me gustaría que me lo expliquen mejor") es un texto fijo, no generado por IA.
- **Bloque de viabilidad (P8–P14):** preguntas sensibles seguidas. Mantener las justificaciones y el micro-acuse previo; suavizan la sensación de "control bancario".
- **Teléfono al final (P15):** se pide tras aportar valor; no adelantarlo.
- **Ruta "lead en preparación":** quien no califica no se descarta en frío, pasa a seguimiento.
- **Eficiencia de tokens:** la IA solo interviene en pasos `[llm]`; el resto son botones, selectores y validación por regex.
- **Tono:** tuteo en español neutro, sin modismos regionales ni formas de "vosotros".

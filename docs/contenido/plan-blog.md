# Plan de contenidos del blog — Tu Lugar en Galicia

> Documento de referencia para el SEO Specialist y el Content Creator.
> Definido antes del inicio de Fase 2. Tocar SOLO `/docs`.

---

## 1. Estructura técnica del blog

### Esquema de URLs

Estructura elegida: `/blog/[categoria]/[slug]`

**Justificacion:** Las páginas de ciudad ya usan `/ciudades/[ciudad]` como namespace propio con keywords transaccionales. El blog necesita un espacio diferenciado que senale a Google la naturaleza informacional del contenido y permita crecer en topical authority sin contaminar las URLs de conversion. La subcategoria crea clusters semanticos rastreables (crawl budget eficiente) y facilita el filtrado por categoria en la UI de MDX.

Ejemplos de URLs resultantes:

```
/blog/vivir-en-galicia/cuanto-cuesta-vivir-en-vigo
/blog/documentacion/nie-espana-latinoamericanos
/blog/barrios/mejores-barrios-vigo-familias
/blog/mudanza/checklist-antes-de-viajar-galicia
```

### Categorias propuestas

| Categoria | Slug | Proposito SEO |
|---|---|---|
| Vivir en Galicia | `vivir-en-galicia` | Keywords informacionales sobre costo de vida, clima, cultura; captura busquedas de emigrantes en etapa "investigando". |
| Documentacion y tramites | `documentacion` | Keywords de alta urgencia sobre NIE, visados, empadronamiento; captura busquedas en etapa "decidiendo". |
| Barrios y zonas | `barrios` | Keywords de interes local por ciudad; complementa las paginas `/ciudades/*` sin duplicar su enfoque transaccional. |
| Mudanza y llegada | `mudanza` | Keywords sobre la logistica practica del traslado; captura etapa "mudandose". |
| Alquiler en Espana | `alquiler-en-espana` | Keywords sobre el mercado de alquiler, contratos y garantias; refuerza la autoridad tematica del servicio. |

### Convencion de slugs

- Todo en minusculas, sin tildes ni caracteres especiales.
- Palabras separadas por guiones medios (`-`), sin guiones bajos.
- Sin stopwords innecesarias (articulos, preposiciones cortas) salvo que sean parte inseparable de la keyword objetivo.
- Maximo 6 palabras por slug para mantener URLs limpias.
- Ejemplos correctos: `cuanto-cuesta-vivir-vigo`, `nie-extranjeros-espana`, `mejores-barrios-familias-a-coruna`.
- Ejemplos incorrectos: `como-es-que-podemos-vivir-en-la-ciudad-de-vigo`.

### Integracion con el SEO existente

**metadata.ts:** El helper `getNextMetadata()` en `/lib/seo/metadata.ts` debera extenderse para aceptar entradas dinamicas de MDX. Cada articulo del blog define su propio bloque de frontmatter (titulo, descripcion, keywords, canonical) que el helper lee en tiempo de build. Ningun articulo del blog declara en sus `keywords[]` los terminos ya registrados en `PAGE_METADATA` para las paginas existentes.

**sitemap.ts:** Al generar el blog con MDX, `app/sitemap.ts` debera incluir las rutas `/blog/*` con `changeFrequency: 'monthly'` y `priority: 0.7`. Los articulos del blog tienen prioridad inferior a las paginas de ciudad (0.9) y a las paginas de conversion (0.8) para senalar correctamente la jerarquia a los crawlers.

**robots.ts:** Sin cambios. El blog es contenido publico e indexable.

**Schema.org:** Cada articulo del blog implementara `Article` schema con `author` (Silvana Lorenzo, entidad ya definida en `/sobre-silvana`), `datePublished`, `dateModified` y `breadcrumb`. Las paginas de ciudad conservan `LocalBusiness` + `Service`. No se mezclan tipos de schema entre el blog y las paginas de conversion.

**Canonicals:** Cada articulo de blog se autocanonicaliza a su propia URL. Si en el futuro un articulo fuese fusionado o redirigido, el canonical apunta a la pagina destino. Ningun articulo del blog recibe un canonical que apunte a una pagina de ciudad o de conversion — eso crearia senales contradictorias.

---

## 2. Lista priorizada de articulos

### Articulo 1 — Prioridad MAXIMA

**Titulo:** Cuanto cuesta vivir en Galicia en 2025: alquiler, supermercado y transporte

**Palabra clave principal:** `cuanto cuesta vivir en galicia` — volumen estimado: 1.200–1.800 busq./mes (ES + LATAM combinados; la intencion es fuerte desde Argentina, Venezuela y Colombia donde "galicia" es sinonimo de destino migratorio).

**Keywords secundarias:** `costo de vida galicia`, `precio alquiler galicia`, `vivir en galicia presupuesto`

**Intencion de busqueda:** Informacional

**Etapa del emigrante:** Investigando

**Por que primero:** Es la pregunta numero uno de cualquier familia antes de tomar la decision. Alto volumen, baja competencia de calidad (los resultados actuales son articulos genericos de 2022 sin datos actualizados). Ademas, sienta las bases de contenido para la Fase 3 (calculadora de costo de vida). No compite con ninguna pagina existente.

**Riesgo de canibalizacion:** Ninguno. Ninguna pagina de `/ciudades/*` ni `/faq` apunta a esta keyword como primaria. La FAQ puede mencionar precios orientativos pero no rankea por esta query. Accion preventiva: verificar en Search Console (una vez el sitio tenga datos) que `/faq` no aparezca en el top 20 para esta query antes de publicar.

---

### Articulo 2 — Prioridad MAXIMA

**Titulo:** NIE en Espana para latinoamericanos: que es, como pedirlo y cuanto tarda

**Palabra clave principal:** `nie espana latinoamericanos` — volumen estimado: 800–1.400 busq./mes (query muy buscada desde LATAM, con picos en diciembre-enero cuando familias planifican el ano siguiente).

**Keywords secundarias:** `tramitar nie extranjero`, `nie o tie espana`, `documentacion alquiler espana`

**Intencion de busqueda:** Informacional (con urgencia practica)

**Etapa del emigrante:** Decidiendo

**Por que primero:** La documentacion es el mayor bloqueador percibido. Un articulo que resuelve esta duda posiciona a Tu Lugar en Galicia como autoridad de confianza (E-E-A-T) y captura una query que ningun competidor de relocation trabaja bien. Ademas alimenta el funnel: quien llega por esta query esta activamente planificando la mudanza.

**Riesgo de canibalizacion:** La pagina `/faq` tiene la keyword `documentacion alquiler espana extranjeros` en sus keywords[], pero apunta a la intencion "requisitos para alquilar", no a "tramitar el NIE". Accion preventiva: el articulo del blog NO incluye en su H1 ni titulo la frase "documentacion alquiler"; esa queda reservada para `/faq`. El articulo usa como H1 especificamente "NIE en Espana" y linkea a `/faq` con texto ancla contextual.

---

### Articulo 3 — Prioridad ALTA

**Titulo:** Los mejores barrios de Vigo para familias con hijos: guia por presupuesto

**Palabra clave principal:** `mejores barrios vigo familias` — volumen estimado: 400–700 busq./mes (query local de alta intencion; competencia baja).

**Keywords secundarias:** `barrios tranquilos vigo`, `donde vivir vigo con ninos`, `zona residencial vigo`

**Intencion de busqueda:** Informacional / Comercial investigation

**Etapa del emigrante:** Decidiendo

**Por que primero:** Vigo es la ciudad con mayor demanda del servicio (primera en el formulario de diagnostico). Este articulo capta a familias que ya saben que van a Vigo y estan investigando zonas. Es linkeable desde `/ciudades/vigo` con texto ancla "conoce los mejores barrios", lo que refuerza el link equity entre pillar (ciudad) y satelite (blog).

**Riesgo de canibalizacion:** `/ciudades/vigo` tiene como keywords primarias `relocation vigo`, `alquiler emigrantes vigo`, `mudarse a vigo`. Ninguna de esas frases aparece en el H1 ni titulo de este articulo. La pagina de ciudad habla del SERVICIO de relocation en Vigo; este articulo habla de los BARRIOS de Vigo. Fronteras semanticas claras. El articulo linkea a `/ciudades/vigo` con CTA "si ya decidiste Vigo, conoce como te ayudamos".

---

### Articulo 4 — Prioridad ALTA

**Titulo:** Como es el mercado de alquiler en Galicia: lo que nadie te cuenta antes de llegar

**Palabra clave principal:** `alquiler galicia emigrantes` — volumen estimado: 500–900 busq./mes.

**Keywords secundarias:** `mercado alquiler galicia`, `pisos en alquiler galicia`, `alquiler galicia particularidades`

**Intencion de busqueda:** Informacional

**Etapa del emigrante:** Investigando / Decidiendo

**Por que primero:** Explica las particularidades del mercado espanol (garantias, aval, seguro de impago, rechazo a extranjeros) que son desconocidas para familias latinoamericanas. Genera confianza y pre-cualifica leads. Refuerza el valor del servicio sin venderlo directamente. E-E-A-T alto porque Silvana tiene experiencia directa.

**Riesgo de canibalizacion:** La home tiene `alquiler emigrantes galicia` entre sus keywords[], pero la home apunta a la intencion "conoce el servicio / agenda una llamada" (transaccional). Este articulo apunta a la intencion "entender el mercado" (informacional). Accion preventiva: el titulo y H1 del articulo usan angulo editorial ("lo que nadie te cuenta"), no el angulo de servicio. No incluir en el articulo un H2 que diga "servicio de relocation en Galicia" — eso lo maneja la home y `/como-funciona`.

---

### Articulo 5 — Prioridad ALTA

**Titulo:** Checklist para mudarse a Galicia: todo lo que tenes que resolver antes de viajar

**Palabra clave principal:** `checklist mudarse espana` — volumen estimado: 600–1.000 busq./mes (desde LATAM).

**Keywords secundarias:** `que hacer antes de emigrar espana`, `preparar mudanza galicia`, `pasos para vivir en espana`

**Intencion de busqueda:** Informacional

**Etapa del emigrante:** Mudandose

**Por que primero:** Query de alta intencion que captura a familias con decision tomada. El checklist es un formato con alta tasa de featured snippet (listas ordenadas). Muy compartible en WhatsApp y redes entre comunidades emigrantes (link building organico).

**Riesgo de canibalizacion:** `/como-funciona` describe el proceso del SERVICIO de Tu Lugar en Galicia (6 pasos de la empresa). Este checklist describe lo que hace LA FAMILIA antes de viajar. Angulos completamente distintos. Accion preventiva: el checklist no usa la frase "como funciona el relocation" ni menciona pasos propios del servicio; linkea a `/como-funciona` con texto ancla "como te acompanamos en este proceso".

---

### Articulo 6 — Prioridad MEDIA-ALTA

**Titulo:** Vivir en A Coruna con familia: clima, barrios y calidad de vida real

**Palabra clave principal:** `vivir en a coruna` — volumen estimado: 350–600 busq./mes.

**Keywords secundarias:** `como es vivir en a coruna`, `a coruna para familias`, `calidad de vida a coruna`

**Intencion de busqueda:** Informacional

**Etapa del emigrante:** Investigando

**Por que primero:** A Coruna es la segunda ciudad mas solicitada. Este articulo captura busquedas de descubrimiento que las paginas de ciudad no cubren (la pagina de ciudad habla del servicio, no de "como es vivir ahi"). Enlazable desde `/ciudades/a-coruna`.

**Riesgo de canibalizacion:** `/ciudades/a-coruna` apunta a `relocation a coruna`, `alquiler a coruna emigrantes`. Este articulo apunta a `vivir en a coruna` (intencion informacional pura). Fronteras claras. El articulo no usa en su H1 las palabras "relocation" ni "alquiler".

---

### Articulo 7 — Prioridad MEDIA-ALTA

**Titulo:** Galicia o Madrid: donde conviene instalarse si emigras desde Latinoamerica

**Palabra clave principal:** `galicia o madrid para emigrantes` — volumen estimado: 300–500 busq./mes (muy especifico, pero altisima intencion).

**Keywords secundarias:** `diferencias galicia madrid vivir`, `donde vivir espana latinoamericanos`, `emigrar espana ciudad`

**Intencion de busqueda:** Informacional / Comercial investigation

**Etapa del emigrante:** Investigando

**Por que primero:** Captura una comparacion que muchas familias hacen antes de decidir destino. Posiciona a Tu Lugar en Galicia como referente objetivo, no solo promotor. Sin competencia directa de calidad. Genera trafico de top-of-funnel que se puede nutrir hacia las paginas de ciudad.

**Riesgo de canibalizacion:** Ninguno de los competidores internos habla de Madrid. Sin riesgo.

---

### Articulo 8 — Prioridad MEDIA-ALTA

**Titulo:** Como alquilar un piso en Espana desde el exterior: paso a paso

**Palabra clave principal:** `alquilar piso espana desde exterior` — volumen estimado: 400–700 busq./mes.

**Keywords secundarias:** `buscar piso espana sin estar`, `alquiler a distancia espana`, `contratar alquiler espana latinoamerica`

**Intencion de busqueda:** Informacional (con alta intencion de contratacion)

**Etapa del emigrante:** Decidiendo

**Por que primero:** Describe el proceso general (no el servicio especifico de Tu Lugar en Galicia) y establece por que es dificil hacerlo solo. Configura la necesidad que el servicio resuelve. Funnel muy directo hacia `/conocernos` y `/agenda`.

**Riesgo de canibalizacion:** `/como-funciona` describe el proceso de TU LUGAR EN GALICIA. Este articulo describe el proceso generico del mercado. Accion preventiva: el articulo incluye un bloque "por que hacerlo con ayuda profesional" que linkea a `/como-funciona` sin duplicar su contenido.

---

### Articulo 9 — Prioridad MEDIA

**Titulo:** Santiago de Compostela para vivir: mas alla del turismo, la ciudad del dia a dia

**Palabra clave principal:** `vivir en santiago de compostela` — volumen estimado: 300–500 busq./mes.

**Keywords secundarias:** `santiago de compostela ciudad para familias`, `barrios santiago compostela`, `calidad de vida santiago galicia`

**Intencion de busqueda:** Informacional

**Etapa del emigrante:** Investigando

**Por que primero:** Mucha gente conoce Santiago como destino turistico pero no como lugar para vivir. Este articulo rompe esa percepcion y captura busquedas de descubrimiento. Complementa `/ciudades/santiago-de-compostela`.

**Riesgo de canibalizacion:** Misma logica que el articulo de A Coruna. La pagina de ciudad apunta a "relocation santiago" (servicio); este articulo apunta a "vivir en santiago" (experiencia). Sin solapamiento en H1 ni title.

---

### Articulo 10 — Prioridad MEDIA

**Titulo:** Garantias para alquilar en Espana: que piden los propietarios a extranjeros

**Palabra clave principal:** `garantias alquiler espana extranjeros` — volumen estimado: 500–800 busq./mes.

**Keywords secundarias:** `aval alquiler espana`, `seguro impago alquiler`, `requisitos alquiler extranjeros espana`

**Intencion de busqueda:** Informacional

**Etapa del emigrante:** Decidiendo

**Por que primero:** El tema de garantias es el mayor dolor del publico objetivo. La keyword `garantias alquiler galicia` esta en `/faq`, pero este articulo va mas en profundidad con angulo explicativo (no FAQs cortas). Alta potencia de E-E-A-T porque Silvana negocia garantias a diario.

**Riesgo de canibalizacion:** `/faq` tiene `garantias alquiler galicia` como keyword. Accion preventiva: el articulo del blog apunta a la keyword `garantias alquiler espana extranjeros` (mas amplia y explicativa); en el articulo NO se usa "galicia" como modificador principal en el H1. El articulo linkea a `/faq` con texto ancla "preguntas frecuentes sobre el proceso". Se verifica en GSC que `/faq` no compita por la version amplia de la query antes de publicar.

---

### Articulo 11 — Prioridad MEDIA

**Titulo:** Empadronarse en Galicia: que es, para que sirve y como hacerlo al llegar

**Palabra clave principal:** `empadronarse espana extranjeros` — volumen estimado: 700–1.200 busq./mes.

**Keywords secundarias:** `empadronamiento galicia`, `tramites llegada espana`, `como empadronarse municipio`

**Intencion de busqueda:** Informacional (urgente)

**Etapa del emigrante:** Mudandose

**Por que primero:** El empadronamiento es obligatorio para acceder a sanidad, escuelas y otros servicios. Query muy buscada por recien llegados. Baja competencia de calidad. Captura visitas de familias ya instaladas o a punto de llegar, que luego pueden convertirse en recomendadoras.

**Riesgo de canibalizacion:** Ninguna pagina existente apunta a esta query. Sin riesgo.

---

### Articulo 12 — Prioridad MEDIA

**Titulo:** Colegios en Vigo: como funciona el sistema educativo en Galicia para recien llegados

**Palabra clave principal:** `colegios vigo emigrantes` — volumen estimado: 200–400 busq./mes (bajo volumen, alta intencion de conversion para familias con hijos).

**Keywords secundarias:** `sistema educativo galicia`, `matricular ninos espana`, `colegios concertados vigo`

**Intencion de busqueda:** Informacional

**Etapa del emigrante:** Decidiendo / Mudandose

**Por que primero:** Las familias con hijos son el perfil principal del servicio. Una guia sobre colegios es altamente relevante y buscada aunque el volumen sea bajo. Genera confianza y demuestra que Tu Lugar en Galicia entiende las necesidades reales de las familias, no solo el alquiler.

**Riesgo de canibalizacion:** Ninguno. Tema no cubierto en ninguna pagina existente.

---

### Articulo 13 — Prioridad MEDIA-BAJA

**Titulo:** Invierno en Galicia: como prepararse para el clima y no llevarse sorpresas

**Palabra clave principal:** `clima galicia invierno` — volumen estimado: 400–700 busq./mes.

**Keywords secundarias:** `lluvia galicia`, `temperatura galicia`, `como es el tiempo en galicia`

**Intencion de busqueda:** Informacional

**Etapa del emigrante:** Investigando

**Por que primero:** El clima galego es mencionado como preocupacion frecuente por emigrantes latinoamericanos (especialmente los de paises tropicales). Articulo de contenido evergreen, bajo esfuerzo de produccion, buena probabilidad de featured snippet por ser una pregunta directa.

**Riesgo de canibalizacion:** Ninguno.

---

### Articulo 14 — Prioridad MEDIA-BAJA

**Titulo:** Visa de larga estancia para Espana: opciones para familias latinoamericanas

**Palabra clave principal:** `visa larga estancia espana latinoamericanos` — volumen estimado: 600–1.000 busq./mes.

**Keywords secundarias:** `visado espana argentina`, `tipos de visa espana`, `como vivir legalmente espana`

**Intencion de busqueda:** Informacional

**Etapa del emigrante:** Investigando / Decidiendo

**Por que primero:** La situacion migratoria es un pre-requisito del servicio (el formulario de diagnostico lo pregunta). Un articulo sobre opciones de visa captura busquedas de muy top-of-funnel y genera autoridad tematica en el area de emigracion, no solo alquiler.

**Riesgo de canibalizacion:** Ninguno. Nota: no incluir asesoramiento legal especifico; remitir a fuentes oficiales (Ministerio del Interior, consulados). Legal Compliance Checker debe revisar este articulo antes de publicar.

---

### Articulo 15 — Prioridad BAJA (contenido de comunidad)

**Titulo:** La historia de [Familia]: como llegaron a Vigo desde [Ciudad LATAM] con Tu Lugar en Galicia

**Palabra clave principal:** `historia emigrantes galicia` — volumen estimado: 150–300 busq./mes por variante de ciudad.

**Keywords secundarias:** `testimonio relocation galicia`, `experiencia emigrante galicia`, `familia argentina galicia`

**Intencion de busqueda:** Informacional / Navegacional

**Etapa del emigrante:** Investigando (fase de confianza)

**Por que primero:** Formato de caso de exito. Baja prioridad SEO por volumen, pero alto valor de E-E-A-T y conversion. Las historias reales de familias son el activo de confianza mas potente del servicio. Una vez el blog este activo, estos casos se publican de forma recurrente (1 por mes).

**Riesgo de canibalizacion:** Ninguno con paginas existentes. Internamente, si se publican varios casos similares, se deben diferenciar por ciudad y pais de origen para evitar canibalizacion entre articulos de la misma categoria.

---

## 3. Criterios de priorizacion

### Logica aplicada

**1. Volumen vs. competencia realista**
Se priorizaron keywords con volumen medio (300–1.500 busq./mes) y competencia baja-media. Las keywords de volumen alto (ej. "alquiler espana") tienen competencia de portales como Idealista e Infocasa, contra los que no se puede competir en autoridad de dominio en Fase 2. El sweet spot es el nicho de intencion emigrante + destino Galicia, donde la competencia de calidad es casi inexistente.

**2. Etapa del funnel y urgencia de conversion**
Los articulos de etapa "decidiendo" se priorizan sobre los de etapa "investigando" porque estan mas cerca de la conversion. La excepcion son los articulos de costo de vida y NIE (posiciones 1 y 2), que aunque son "investigando", tienen un volumen y una densidad de intencion tan altos que justifican estar primeros.

**3. Riesgo de canibalizacion cero o controlado**
Ningun articulo del top 5 tiene riesgo real de canibalizar paginas existentes. Los articulos de barrios y vivir-en-ciudad (posiciones 3, 6, 9) tienen fronteras semanticas claras con las paginas de ciudad y se documentan explicitamente en cada articulo.

**4. Potencial de SERP features**
Se priorizaron formatos que capturan featured snippets (listas ordenadas, tablas, preguntas directas): checklist (articulo 5), NIE paso a paso (articulo 2), empadronamiento (articulo 11). Estos tienen probabilidad alta de aparecer en posicion 0 incluso con dominio nuevo si la estructura del contenido es correcta.

**5. Valor de E-E-A-T y linkabilidad**
Los articulos sobre garantias (10), mercado de alquiler (4) y casos de exito (15) refuerzan la experiencia y autoridad demostrable de Silvana. Son los mas linkables por medios de emigrantes, foros y grupos de WhatsApp — canal de link building organico sin costo.

**6. Secuencia de Fase 2**
Segun el roadmap, los primeros 3–5 articulos se producen en Fase 2 junto con el render del blog. El orden de ejecucion recomendado es: articulos 1, 2, 5 (mayor volumen + menor riesgo + mayor velocidad de posicionamiento), luego articulos 3, 4 en la misma fase.

---

> Ultima revision: 2026-05-30
> Responsable: SEO Specialist
> Proxima revision recomendada: al completar Fase 2 (incorporar datos reales de Search Console)

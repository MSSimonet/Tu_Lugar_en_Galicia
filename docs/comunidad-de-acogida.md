# Comunidad de Acogida — Especificación de Arquitectura

> **Estado: 🟢 Implementado y verificado end-to-end (2026-07-10).** Flujo completo probado con
> datos reales contra la infraestructura de producción (Supabase, Airtable, Resend): registro →
> geocoding → upsert en Supabase → réplica en Airtable → pin en el mapa con clustering →
> tooltip condicional (WhatsApp / mensaje privado) → entrega confirmada por Resend
> (`last_event: "delivered"`). Detalle completo de la verificación y de los 4 bugs reales
> encontrados y corregidos en el camino: §8.
>
> **Nota de alcance:** todo lo anterior se verificó contra `localhost:3000` (dev) hablándole
> directo a los servicios reales de Supabase/Airtable/Resend — no se hizo un deploy a Vercel
> todavía. Antes de anunciar la sección públicamente, desplegar a producción y repetir al menos
> el flujo de registro una vez contra el dominio real.

**Relación con el roadmap:** `docs/roadmap.md` Fase 5 ya menciona un "Mapa de familias ubicadas
(con consentimiento explícito; barrio, nunca dirección exacta)" como parte de "Comunidad con
base de datos". Este documento es la especificación detallada de esa pieza — la reemplaza como
fuente de verdad para el mapa de comunidad. Fase 5 también lista una "App de presupuesto
mensual" y un "CRM estructurado de leads" que **no** están cubiertos por este documento.

**Regla de privacidad ya vigente en CLAUDE.md §7:** "El mapa de familias (Fase 5) solo muestra
a quien dio permiso explícito; nunca calle ni número exacto." El radio de difuminado de 200m
descrito en la §2 de este documento es la implementación concreta de esa regla — mantenerla
sin excepciones.

---

## Implementación Híbrida: Frontend React + Supabase (Comunidad) + Airtable (Core Funcional)

## 1. Contexto y Objetivo

Nueva sección/página dentro de la web existente (React + Tailwind). Objetivo: mapa interactivo
de Galicia para conectar nuevos residentes con locales (café, caminatas, charlas).

Backend existente: Airtable, gestiona la info core del negocio.
Nueva necesidad: sección de comunidad bajo principio de reciprocidad obligatoria (el usuario
debe registrarse para ver el mapa).
Estrategia: arquitectura híbrida — Supabase exclusivo para lógica de comunidad, conectado a
Airtable para cruzar datos.

## 2. Flujo de Usuario y Lógica Oculta ("Upsert Silencioso")

**Paso 1 — Formulario de Registro Obligatorio (Acceso al Mapa):**

El cliente no debe saber que ya podríamos tener sus datos previos.

1. Identificador/Email: primer campo, correo electrónico.
2. Ubicación con Privacidad: dos calles (intersección/esquina). Frontend geocodifica, calcula
   radio de 200m, guarda lat/lng del centro del círculo difuso.
3. Perfil & Disponibilidad: Nombre/Alias, foto (opcional), checkboxes de actividades
   (`cafe_cerveza_mate`, `caminata`, `apoyo_emocional`).
4. Contacto: teléfono opcional (WhatsApp).

**Paso 2 — Confirmación del email, y recién después el upsert:**

> ⚠️ **Actualizado 2026-08-09.** Hasta esta fecha el Paso 2 escribía en Supabase directamente
> al enviar el formulario. Eso era el agujero §5.6 de `docs/arranque.md`: el email es la PK de
> la tabla y nadie verificaba que quien mandaba el POST fuera su dueño, así que sabiendo el
> email de una persona registrada se le pisaba la fila entera — incluida su ubicación en el
> mapa. El upsert descrito abajo sigue siendo exactamente el mismo; lo que cambió es **cuándo**
> se ejecuta.

1. `POST /api/comunidad/registro` valida, geocodifica, y guarda el perfil en un buffer
   temporal en Upstash (`comunidad:pendiente:<uuid>`, TTL 24 h). **No toca la tabla.**
2. Manda un mail a la dirección declarada con un link firmado
   (`/comunidad/confirmar?id=…&token=…`, HMAC-SHA256 vía `lib/admin/tokens.ts`).
3. El link abre una página; su botón llama a `POST /api/comunidad/confirmar`, que verifica la
   firma, consume el pendiente (`getdel`, atómico) y **recién ahí** hace el upsert.

El upsert en sí, sin cambios desde el diseño original (email como clave única):

- Usuario nuevo: crea registro.
- Usuario existente: no duplica fila, completa/actualiza campos faltantes (coordenadas,
  disponibilidad, contacto), mantiene datos previos intactos.

Consecuencia práctica: **actualizar tu propio perfil también pide confirmar por mail.** Esa
fricción es justamente la prueba de posesión, y es lo que habilita el toggle self-service de
teléfono que quedó pendiente en PII-01.

## 3. Puente Supabase → Airtable

Los datos de Supabase deben replicarse en Airtable vía Email como llave maestra. Dos vías a
definir por desarrollo:

- **Vía A (No-Code):** webhook de Supabase dispara Make/Zapier, aplica Upsert idéntico en
  Airtable.
- **Vía B (Código/Serverless):** función serverless hace doble envío en paralelo — Upsert en
  Supabase + PATCH a API REST de Airtable.

## 4. Pantalla del Mapa (Acceso Concedido)

Frontend consume directo de Supabase (velocidad, evita límite de 5 req/seg de Airtable).

- Marker Clustering (Leaflet.js o Mapbox GL JS + OpenStreetMap).
- Tooltip condicional: si Contacto tiene datos → tarjeta de perfil + link WhatsApp (wa.me/...);
  si Contacto es null → tarjeta de perfil + botón "Enviar mensaje privado".
- Mensajería privada asíncrona: botón abre formulario que dispara email automatizado
  (Make/Zapier) al destinatario, sin exponer su contacto.

## 5. Estructura de Datos (Tabla Comunidad en Supabase)

```json
{
  "email": "String (Primary Key)",
  "nombre": "String",
  "foto_url": "String_URL o Storage Bucket Path",
  "lat": "Float8 (centro del radio de 200m)",
  "lng": "Float8 (centro del radio de 200m)",
  "disponibilidad": "text[]",
  "contacto": "String o null",
  "updated_at": "Timestamp"
}
```

---

## 6. Código reutilizable ya existente en el repo

Relevamiento hecho antes de escribir esta especificación, para no asumir una hoja en blanco.

| Necesidad | Qué existe hoy | Archivo |
|---|---|---|
| Mapa / geolocalización | **Nada.** Sin Leaflet, Mapbox, react-leaflet ni ningún manejo de lat/lng en el repo. | — |
| Componente "vista en vivo" con lat/lon | Existe un placeholder estático de cámara en vivo que ya recibe `lat`/`lon`/`nombreCiudad` como props, pero no renderiza mapa ni usa ninguna librería — solo un ícono y texto "Próximamente". Pendiente de decisión de producto documentada en el propio archivo (ver también CLAUDE.md §9, ítem A13). | `components/ciudad/VistaEnVivo.tsx` |
| Patrón de formulario largo con estado tipado | El cuestionario de Gina (`FormularioDiagnostico`) usa un único objeto de estado (`useState<FormState>`, no `useReducer` ni Context) con ~35 campos, dividido visualmente en secciones (`<section>`), no en pasos/rutas separadas. Subcomponentes (`SeccionFamilia.tsx`, `SeccionVivienda.tsx`) reciben `form`/`errors`/setters como props. Validación en cliente vía estado `errors`, revalidada en el servidor. Patrón reutilizable para el nuevo formulario de registro. | `components/conocernos/useFormulario.ts`, `components/conocernos/FormularioDiagnostico.tsx`, `SeccionFamilia.tsx`, `SeccionVivienda.tsx`, `form-fields.tsx` |
| Patrón de formulario simple | Un `useState` por campo, un solo `handleSubmit`, POST a su API route. Más cercano en complejidad a lo que necesita el Paso 1 de este documento. | `components/contacto/FormularioContacto.tsx` |
| Buscar registro por email | `findLeadByEmail(email)` ya sanea el email y arma un `filterByFormula` contra Airtable — pero hoy solo lo usa la herramienta de admin, no el flujo público. | `lib/admin/airtable.ts:123-141` |
| Crear/actualizar registro en Airtable | `saveLead(data, recordId?)` hace POST si no hay `recordId`, PATCH si lo hay — pero ningún endpoint público busca por email antes de crear (`/api/lead` y `/api/contacto` siempre crean un registro nuevo). El "find-or-create por email" del Paso 2 de este documento habría que componerlo combinando estas dos piezas; no existe armado hoy. | `lib/leads.ts:148-192`, `app/api/lead/route.ts`, `app/api/contacto/route.ts` |
| Supabase | **Nada en código.** Solo dos menciones como opción futura: `CLAUDE.md:37` y un placeholder comentado en `.env.local.example:32`. Sin cliente, sin variables de entorno reales, sin esquema. | `CLAUDE.md`, `.env.local.example` |
| Subida de fotos de usuario | **No existe.** Todo campo "foto" hoy es una URL estática de `placehold.co` (testimonios, muro de llaves, etc. — ver también CLAUDE.md §9, ítem A14). Sin `<input type="file">`, sin SDK de storage, sin librería de procesamiento de imágenes en `package.json`. | `components/home/Testimonios.tsx:12,20,28` |
| Geocodificación (dirección → lat/lng) | **No existe** ninguna utilidad en `lib/` ni `app/api/`. Habrá que integrar un servicio externo (ver decisiones pendientes). | — |
| Link de WhatsApp (`wa.me/...`) | **No implementado actualmente.** Existió un componente `WhatsAppFlotante` y un `wa.me/...` hardcodeado en `CalEmbed.tsx`, documentados en `docs/archivo/certificacion-fase-1.md` y `docs/tareas-fase-1.md`, pero fueron retirados del código (CLAUDE.md §9, ítem A08: "WhatsApp ya no existe, reemplazado por formulario de contacto"). Habría que reconstruir el patrón `wa.me/{telefono}` desde cero. | — |

**Conclusión del relevamiento (previo a la implementación):** no había nada de mapa,
geocodificación, subida de imágenes ni Supabase para reutilizar. Lo único aprovechado fueron
los dos patrones de formulario (objeto de estado tipado + subcomponentes por sección) y el
patrón `findByEmail` + create/patch de Airtable, combinados en un verdadero flujo de upsert
que antes no existía (ver §8).

---

## 7. Decisiones — ya cerradas, tal como se implementaron

1. **Mapa: Leaflet.js + OpenStreetMap, con marker clustering (`leaflet.markercluster`).**
   Implementado en `components/comunidad/MapaComunidad.tsx`. Carga dinámica dentro de un
   `useEffect` (no `next/dynamic({ssr:false})`, que Next.js 16 no permite en Server
   Components) para evitar el error de SSR de Leaflet.

2. **Puente Supabase → Airtable: Vía B (serverless, doble escritura en paralelo).**
   Implementado en `app/api/comunidad/registro/route.ts` con `Promise.allSettled` — ambos
   upserts se disparan al mismo tiempo. Supabase es la fuente de verdad (si falla, el
   registro falla); Airtable es best-effort (si falla, se loguea sin bloquear al usuario,
   mismo criterio que la notificación por mail en `/api/contacto`).

3. **Geocodificador: Nominatim.** Implementado en `lib/comunidad/nominatim.ts`. Hallazgo real
   durante la implementación, no anticipado en la spec original: Nominatim **no** interpreta
   consultas de texto libre tipo `"calle1 esquina calle2, ciudad"` como una intersección real
   — devuelve vacío incluso con calles que existen (verificado en vivo con calles reales de
   Vigo). La solución fue geocodificar cada calle por separado (eso sí funciona de forma
   confiable) y promediar los dos puntos — sigue sirviendo como centro razonable del círculo
   de privacidad de 200m, y si solo una de las dos calles se ubica, se usa esa en vez de
   rechazar el registro. Las dos consultas van en serie con >1s de espera entre ellas, para
   respetar el límite de 1 req/seg de la política de uso de Nominatim.

4. **Supabase no estaba conectado en Vercel antes de esta sesión — sigue sin estarlo.**
   El código ya está listo para conectarse (`lib/comunidad/supabase.ts`,
   `lib/comunidad/supabaseBrowser.ts`), pero conectar el proyecto real es un paso manual — ver
   el checklist de infraestructura en §8.

---

## 8. Verificación end-to-end (2026-07-10)

### 8.1 Checklist de infraestructura — los 4 bloqueos de la sesión anterior

Los 4 quedaron resueltos por el usuario antes de esta verificación (claves cargadas, schema
corrido, tabla creada). Verificado que cada uno funciona de verdad, no solo que la variable
existe:

- [x] **1. Schema SQL ejecutado en Supabase.** La tabla `comunidad` responde a queries reales
      (confirmado con upserts y selects durante la prueba).
- [x] **2. `SUPABASE_SERVICE_ROLE_KEY` cargada y funcional.** `/api/comunidad/registro` escribe
      en Supabase real sin error de configuración.
- [x] **3. Tabla "Comunidad" existe en Airtable.** Confirmado además el nombre exacto de tabla
      (`Comunidad`) probando contra la API real, porque el token de `AIRTABLE_API_KEY` no tiene
      permiso de lectura de schema vía la Metadata API (`INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND`)
      — hubo que descubrir el nombre por prueba y error.
- [x] **4. `RESEND_API_KEY` cargada y funcional.** Envío real confirmado con
      `last_event: "delivered"` en el log de Resend.

**Restante:**
- [x] **Deploy a Vercel.** Completado — commit `28e2037` desplegado a Production, confirmado
      por el usuario (2026-07-10).
- MCP oficial de Supabase / login OAuth — el binario `claude` sigue sin estar disponible en el
  entorno de Bash usado para verificar. Sigue sin hacer falta: toda la verificación se hizo con
  `@supabase/supabase-js` + REST API directa.
- Revisión de `Legal Compliance Checker` sobre datos de ubicación (RGPD) — **pendiente de
  entrega por Silvana**, no es un bloqueo técnico: la revisión depende de que ella provea el
  material/decisión de negocio necesario para que el `Legal Compliance Checker` pueda evaluarla.
  Recomendado completarla antes de anunciar la sección públicamente (CLAUDE.md §7).

### 8.2 Flujo probado con datos reales — resultado de cada punto

| # | Paso | Resultado |
|---|---|---|
| a | Formulario `/comunidad`, 4 bloques | ✅ Renderiza y valida correctamente |
| b | Geocoding Nominatim | ✅ Funciona — ver bug #1 en §8.3, corregido |
| c | Upsert real en Supabase | ✅ Confirmado por query directa a la REST API (`id` estable entre envíos, sin duplicar) |
| d | Réplica en Airtable | ✅ Funciona tras corregir 3 diferencias de esquema — ver bug #2 en §8.3 |
| e | Pin en `/comunidad/mapa` con clustering | ✅ Confirmado visualmente — ver bug #3 en §8.3, corregido |
| f | Tooltip condicional (WhatsApp / mensaje privado) | ✅ Ambas ramas confirmadas: perfil con `contacto` → `href="https://wa.me/34600123456"` exacto; perfil sin `contacto` → botón "Enviar mensaje privado" |
| g | Mensaje privado → email por Resend | ✅ Entrega confirmada (`last_event: "delivered"`, `reply_to` apunta al remitente, asunto correcto) — ver bug #4 en §8.3 |
| — | Upsert no duplica fila | ✅ Reenviado el mismo email con `disponibilidad` distinta: mismo `id` en Supabase, mismo registro en Airtable actualizado, `contacto` previo conservado sin reenviarlo |

Los 3 perfiles de prueba creados durante la verificación (Supabase + Airtable) se borraron al
terminar — no quedan datos de prueba en las tablas de producción.

### 8.3 Bugs reales encontrados y corregidos durante esta verificación

Ninguno de estos existía en la especificación original — son hallazgos de probar contra
infraestructura real, no decisiones de producto reabiertas.

1. **Nominatim no geocodifica intersecciones de texto libre.** `"calle1 esquina calle2, ciudad"`
   devolvía vacío incluso con calles reales de Vigo. Fix en `lib/comunidad/nominatim.ts`:
   geocodificar cada calle por separado (sí funciona) y promediar los dos puntos, con >1s de
   espera entre las dos consultas para respetar el límite de 1 req/seg de Nominatim.
2. **La tabla Airtable real difiere del esquema asumido en 3 puntos**, ninguno documentable de
   antemano sin acceso al schema (el token no tiene permiso de lectura vía Metadata API):
   el nombre de la persona vive en el campo primario por defecto `"Name"` (no `"nombre"`);
   `lat`/`lng` son campos de texto, no numéricos; `disponibilidad` es texto plano separado por
   comas, no un campo de selección múltiple. Fix en `lib/comunidad/airtable.ts`
   (`mapearParaAirtable`), descubierto probando campo por campo contra la tabla real.
3. **Los íconos por defecto de Leaflet no cargaban bajo Turbopack.** El patrón estándar
   (`import png from 'leaflet/dist/images/...'` + `.src`) resuelve a `undefined` en este
   proyecto — cero pines se renderizaban, con el error silencioso "iconUrl not set in Icon
   options". Fix: copiar los 3 PNG a `public/leaflet/` y referenciarlos como rutas estáticas
   (`/leaflet/marker-icon.png`, etc.) en vez de depender del import.
4. **El upsert Supabase↔Airtable corría en serie, no en paralelo** como pide "Vía B" — corregido
   con `Promise.allSettled` (encontrado en la sesión de implementación anterior, confirmado que
   sigue corregido en esta verificación).

Ninguno de estos bugs era detectable sin probar contra la infraestructura real — es exactamente
la razón por la que esta verificación en producción era necesaria y no bastaba con `tsc`/`build`.

### 8.4 Revisión de seguridad independiente (2026-07-10)

Revisión de seguridad separada de la implementación original, enfocada en PII, validación de
inputs, rate limiting y manejo de errores sobre todo el diff del commit `28e2037`.

**🔴 CRÍTICO — email de todos los usuarios legible directo desde el navegador, sin pasar por
la app.** La policy RLS de `0001_comunidad_schema.sql` (`comunidad_select_public ... using
(true)`) es a nivel de fila, no de columna. Supabase otorga por defecto `GRANT SELECT` sobre
**todas** las columnas de las tablas de `public` a los roles `anon`/`authenticated`. El `select`
explícito de columnas en `components/comunidad/MapaComunidad.tsx` es una restricción de la UI,
no de la base de datos: con la anon key (pública, visible en el bundle del navegador) cualquiera
puede pedir `GET .../comunidad?select=email,nombre,lat,lng` directo a la REST API de Supabase y
obtener el email real de cada familia registrada. Fix escrito en
`supabase/migrations/0002_comunidad_restringir_email.sql` (revoca `SELECT` de tabla completa y
lo vuelve a otorgar columna por columna, excluyendo `email`).

**✅ Estado: RESUELTO y verificado contra producción el 2026-07-10.** Se hicieron dos rondas de
verificación real (no solo lectura de código) con la **anon key pública real**
(`NEXT_PUBLIC_SUPABASE_ANON_KEY`) contra el proyecto de producción:

- **Primera ronda (antes de aplicar `0003`):** `select=email` → `401/42501` (correcto), pero
  `select=id,nombre,foto_url,lat,lng,disponibilidad,contacto,updated_at` (las columnas que usa
  `components/comunidad/MapaComunidad.tsx`) también daba `401/42501` — el `grant select (...)`
  de `0002_comunidad_restringir_email.sql` no había surtido efecto (solo el `revoke` quedó
  aplicado), dejando el mapa público roto. Se creó
  `supabase/migrations/0003_comunidad_reparar_grant_columnas.sql` para reparar solo ese `GRANT`.
- **Segunda ronda (después de aplicar `0003`):** se insertó una fila de prueba
  (`test-verificacion-0003b-<timestamp>@example.invalid`) vía `service_role`. Con la anon key:
  `select=id,nombre,foto_url,lat,lng,disponibilidad,contacto,updated_at` filtrando por `id`
  (columna otorgada) → **`200 OK`** con los datos correctos de la fila de prueba. `select=email`
  → sigue dando `401/42501`. **Ambos hallazgos confirmados: el email nunca es legible y el mapa
  vuelve a funcionar.**

**Nota de método, para no repetir el hallazgo:** al filtrar por `email=eq.<valor>` (aunque no se
pida esa columna en el `select`), Postgres exige privilegio `SELECT` sobre `email` igual que si
se pidiera en el resultado — porque el filtro también "lee" esa columna para comparar. Como
`email` nunca fue otorgado a `anon`, cualquier filtro `?email=eq....` da `401/42501` sin importar
qué columnas se pidan en el `select`. Esto no es un bug: es un efecto colateral correcto y
deseable (nadie puede usar `email` ni siquiera como filtro/oráculo de existencia). La prueba de
"el mapa funciona" debe filtrar por una columna sí otorgada (por ejemplo `id`), no por `email`.

**Tercera ronda, re-confirmación (mismo día):** repetida una vez más con una fila de prueba
nueva (`test-verificacion-0003c-<timestamp>@example.invalid`) para dejar el hallazgo
completamente estable antes del commit — mismo resultado: `200 OK` con datos en las columnas del
mapa (filtrando por `id`), `401/42501` en `select=email`, fila de prueba borrada y confirmada en
0 filas restantes.

Se confirmó además, vía `service_role` (que bypassea RLS y grants), que cada fila de prueba
insertada existía con sus datos correctos — descartando errores de inserción como causa de los
resultados. Las 3 filas de prueba usadas en las dos rondas de esta verificación (`0002-<ts>`,
`0003-<ts>`, `0003b-<ts>`) se borraron al terminar cada una — confirmado con un `select` filtrado
por email vía `service_role` que devolvió `[]` (0 filas) en los tres casos.

**🟠 Alto — upsert sin verificación de dueño del email, documentado sin fix de código.**
Cualquiera puede registrarse con el email de otra persona (no hay verificación de propiedad del
correo). Como el upsert hace merge silencioso de `contacto`, un atacante que registre primero el
email de una víctima con su propio WhatsApp en `contacto` deja ese número pegado al perfil: si la
víctima se registra después sin completar `contacto`, su `undefined` cae al valor ya guardado del
atacante, no a `null`. Dado el perfil de usuario (familias inmigrantes vulnerables), es un vector
real de suplantación/acoso. Requiere una decisión de producto (verificación por email/magic link
antes de crear o modificar `contacto`/`fotoUrl`) — fuera del alcance de esta revisión.

**🟡 Medio — validación server-side insuficiente en campos libres, corregido.** `nombre`,
`calle1`, `calle2`, `contacto`, `fotoUrl` (registro) y `remitenteNombre`/`mensaje` (mensaje
privado) no tenían longitud máxima; `ciudad` solo estaba restringida por el `<select>` de la UI
(salteable llamando la API directo); `fotoUrl` no validaba protocolo/formato. Corregido en
`app/api/comunidad/registro/route.ts` y `app/api/comunidad/mensaje/route.ts`: allow-list
server-side de ciudades, topes de longitud, formato de teléfono, y `fotoUrl` debe ser una URL
`https://` válida.

**🟡 Medio — `/api/comunidad/mensaje` es un vector de acoso escalable, documentado sin fix.**
Los `destinatarioId` son intencionalmente públicos (vienen del propio query del mapa, para no
exponer el email — diseño correcto). Con el mapa público y el rate limit actual (5 req/10min por
IP), alguien puede scrapear todos los IDs y, con rotación de IP, mandar un email no solicitado a
cada persona registrada. Recomendado: límite por destinatario además del límite por IP, o
CAPTCHA en este formulario específico. No se implementó en esta pasada.

**Verificado como correcto, sin cambios:** logs sin PII (solo `err.name`), CSRF por
`Origin` fail-closed, rate limiting Upstash fail-closed en ambos endpoints, sanitización contra
inyección de fórmulas de Airtable (reutiliza el patrón de `lib/admin/airtable.ts`), HTML de los
emails escapado con `escapeHtml()`, `destinatarioId` resuelto solo server-side (sin IDOR),
querystring de Nominatim armado con `URLSearchParams` (sin inyección), y ninguna respuesta de
error filtra mensajes crudos de Supabase/Airtable/Resend/Nominatim al cliente.

Verificado con `npx tsc --noEmit` (limpio) y `npm run build` (limpio, 35 rutas compiladas).

---

## 9. Archivos de la implementación

**Nuevos:**
- `supabase/migrations/0001_comunidad_schema.sql` — schema + RLS
- `lib/comunidad/types.ts`, `supabase.ts`, `supabaseBrowser.ts`, `nominatim.ts`, `airtable.ts`, `perfil.ts`, `email.ts`
- `app/api/comunidad/registro/route.ts`, `app/api/comunidad/mensaje/route.ts`
- `app/comunidad/page.tsx`, `app/comunidad/mapa/page.tsx`
- `components/comunidad/FormularioComunidad.tsx`, `MapaComunidad.tsx`, `TarjetaPerfil.tsx`, `FormMensajePrivado.tsx`
- `public/leaflet/marker-icon.png`, `marker-icon-2x.png`, `marker-shadow.png` — íconos del mapa
  servidos como estáticos (ver bug #3 en §8.3)

**Modificados:**
- `middleware.ts` — CSP: `img-src` (tiles de OpenStreetMap) y `connect-src` (Supabase) no
  estaban permitidos y bloqueaban el mapa por completo hasta este cambio
- `.env.local.example` — nuevas variables documentadas
- `.env.local` — agregada `AIRTABLE_COMUNIDAD_TABLE_NAME="Comunidad"` (faltaba; descubierta
  probando contra la tabla real, ver §8.1)
- `package.json` — nuevas dependencias: `@supabase/supabase-js`, `leaflet`, `react-leaflet`, `leaflet.markercluster` (+ tipos)

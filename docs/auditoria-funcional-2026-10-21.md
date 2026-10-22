# Auditoría funcional — Tu Lugar en Galicia
**Fecha:** 2026-10-21  
**Entorno:** Sesión de nube CCR — contenedor efímero aislado  
**URL de producción:** `https://tu-lugar-en-galicia.vercel.app`  
**Método:** Playwright/Chromium headless + curl (proxy CCR con acceso a red completo)

---

## Resumen ejecutivo

| Área | Estado | Hallazgo crítico |
|---|---|---|
| Paso 1 — Navegación (22 rutas × 2 viewports) | ✅ 0 errores | — |
| Paso 2 — Admin Login | 🔴 Roto | HTTP 500 / Auth.js config error |
| F-01 — Formulario de contacto | 🔴 Roto | API devuelve 500 en producción |
| F-02 — Cuestionario Gina | 🔴 Roto | API devuelve 500 en producción |
| F-03 — Cal.com embed (`/agenda`) | ⚠️ Parcial | AgendaPublica OK; embed requiere code (por diseño); code no generado (admin bloqueado) |
| F-04 — Formulario comunidad | 🔴 Roto | API devuelve 500 en producción |
| Búsqueda "avoa" | ✅ Limpio | No encontrado en HTML de producción |
| Referencias `tulugarengalicia.com` | ℹ️ Info | Presentes en metadata/legal (esperado — S10 pendiente) |

> ⚠️ **Causa raíz global:** Upstash Redis falla en producción — todas las rutas de escritura (contacto, gina, comunidad, lead) devuelven HTTP 500 vacío desde el paso del rate limiting. Auth.js también falla con 500 por un error de configuración del servidor. **Los formularios del sitio están rotos para todos los usuarios reales.**

---

## Paso 0 — Pre-flight

| Check | Resultado |
|---|---|
| Credenciales de admin en contenedor | ✅ SET |
| Texto "avoa" en código fuente | ✅ No encontrado (grep exhaustivo sobre `*.ts`, `*.tsx`, `*.json`, `*.md`) |
| Acceso red al dominio de producción | ✅ Confirmado (curl HTTP 200 para rutas GET) |

---

## Paso 1 — Navegación

**Ejecutado:** 2026-10-21  
**Método:** Playwright/Chromium, `waitUntil: 'domcontentloaded'`  
**Cobertura:** 22 rutas × 2 viewports (1440 × 900 desktop / 390 × 844 mobile) = **44 checks**

### Resultado: ✅ 0 errores

| Ruta | Desktop | Mobile | Título (truncado) | H1 |
|---|---|---|---|---|
| `/` | 200 | 200 | Relocation en Galicia para familias latinoamericanas… | Tu nueva vida en Galicia empieza con una puerta abierta… |
| `/como-funciona` | 200 | 200 | Cómo funciona el servicio de relocation en Galicia… | Tu hogar en Galicia ya existe. |
| `/ciudades` | 200 | 200 | Ciudades de Galicia | Elige tu ciudad |
| `/ciudades/vigo` | 200 | 200 | Relocation Vigo para familias emigrantes… | Vigo |
| `/ciudades/a-coruna` | 200 | 200 | Relocation A Coruña… | A Coruña |
| `/ciudades/pontevedra` | 200 | 200 | Relocation Pontevedra… | Pontevedra |
| `/ciudades/santiago-de-compostela` | 200 | 200 | Relocation Santiago de Compostela… | Santiago de Compostela |
| `/ciudades/lugo` | 200 | 200 | Relocation Lugo… | Lugo |
| `/conocernos` | 200 | 200 | Vamos a conocernos — Cuéntanos tu caso | Vamos a conocernos |
| `/agenda` | 200 | 200 | Agenda tu videollamada gratuita… | Primero, cuéntanos tu historia |
| `/comunidad` | 200 | 200 | Formando comunidad | Sé un anfitrión en Galicia |
| `/comunidad/mapa` | 200 | 200 | Encuentra a tu gente en Galicia | Encuentra a tu gente en Galicia |
| `/sobre-silvana` | 200 | 200 | Quiénes somos — Silvana Lorenzo… | Hice tu mismo camino, te entiendo muy bien… |
| `/contacto` | 200 | 200 | Contáctanos | ¿Tienes alguna pregunta? |
| `/faq` | 200 | 200 | Preguntas frecuentes… | ¿Tienes dudas? |
| `/apps-utiles` | 200 | 200 | Apps útiles para vivir en Galicia | Elige tu ciudad y descubre tu kit de apps |
| `/politica-de-privacidad` | 200 | 200 | Política de Privacidad | Política de Privacidad |
| `/politica-de-cookies` | 200 | 200 | Política de Cookies | Política de Cookies |
| `/aviso-legal` | 200 | 200 | Aviso Legal | Aviso Legal |
| `/terminos-y-condiciones` | 200 | 200 | Términos y Condiciones | Términos y Condiciones |
| `/comunidad/confirmar` | 200 | 200 | Confirma tu registro | Confirma tu registro |
| `/comunidad/gestionar` | 200 | 200 | Gestiona tu perfil del mapa | Gestiona tu perfil |

**Errores de consola:** 0 en las 44 páginas verificadas.

---

## Paso 2 — Admin Login

**URL:** `https://tu-lugar-en-galicia.vercel.app/admin/login`  
**Resultado:** 🔴 FALLIDO — un solo intento, no se reintentó

### Lo observado

El intento de login devolvió **HTTP 500** y redirigió a `/api/auth/error`. La consola del navegador mostró:

```
Failed to load resource: the server responded with a status of 500 ()
i: There was a problem with the server configuration. Check the server logs for more information.
Read more at https://errors.authjs.dev#autherror
```

### La inferencia (causa probable, no confirmada)

El mensaje "server configuration" es un error propio de Auth.js v5, distinto al 500 vacío de H-01. Se produce cuando la request **llegó a `handlers.POST(req)`** — es decir, pasó la guarda de rate limiting — y Auth.js no pudo completar la autenticación por un error de configuración del servidor.

**¿Es la misma causa que H-01?** No con certeza. En `app/api/auth/[...nextauth]/route.ts:80`, el código sí tiene `if (reason === 'timeout')` que devuelve 503 explícito si Upstash da timeout. Pero si Upstash lanza una excepción real (distinta a timeout), tampoco está capturada — misma vulnerabilidad latente que H-01. Sin embargo, el error observado en consola es de Auth.js ("server configuration"), no un body vacío, lo que indica que la request **pasó el rate limiting** y llegó a Auth.js. El fallo parece estar en Auth.js, no en Upstash.

**Causa probable:** El proyecto usa `next-auth@^5.0.0-beta.31` (Auth.js v5) pero el `.env.local.example` documenta `NEXTAUTH_SECRET` (nombre de v4). Auth.js v5 lee `AUTH_SECRET` por defecto; la compatibilidad con `NEXTAUTH_SECRET` es inconsistente en la beta. Si Vercel tiene `NEXTAUTH_SECRET` en lugar de `AUTH_SECRET`, Auth.js arrancaría sin secreto y fallaría con exactamente este error.

> **Para confirmar:** revisar los logs de Vercel en el timestamp del intento y verificar qué nombre tiene la variable en el dashboard de Vercel.

### Consecuencias

- Silvana no puede acceder al panel `/admin` desde producción.
- No fue posible explorar el dashboard, kanban, ni generar código de agenda para AUDIT-AGENDA-TEST.
- El flow F-03 con código válido no pudo completarse.

---

## Paso 3 — Admin Panel

**Estado:** ⛔ No auditado — login bloqueado por HTTP 500 (ver Paso 2).

---

## Diagnóstico transversal: Upstash Redis en producción

### Lo observado (verificado con curl)

Antes de ejecutar los flows de escritura se verificaron las APIs directamente con curl:

```bash
# POST con Origin válido, campo corto (esperado: 400 de validación)
curl -s -w "\nHTTP: %{http_code}" https://tu-lugar-en-galicia.vercel.app/api/contacto \
  -X POST -H "Origin: https://tu-lugar-en-galicia.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"T","email":"[mail de prueba]","mensaje":"x"}'
# → body vacío · HTTP: 500

# POST sin Origin (esperado: 403)
# → {"error":"Origen no permitido"} · HTTP: 403  ✅

# /api/gina · Origin válido · POST mínimo → body vacío · HTTP: 500
# /api/comunidad/registro · Origin válido · POST con campos válidos → body vacío · HTTP: 500
```

**Patrón observado:**
- GET → 200 ✅
- POST sin Origin → 403 correcto ✅
- POST con Origin válido → **500 body vacío** 🔴 (el 500 precede a cualquier validación de campos)

### La inferencia (causa probable, no confirmada)

El 500 ocurre **después** del check de Origin y **antes** de la validación de campos, lo que ubica el fallo en la única capa intermedia: el rate limiting con Upstash. La hipótesis es que `ratelimit.limit(ip)` lanza una excepción no capturada cuando Upstash no está disponible (credenciales expiradas, base de datos eliminada o sin acceso desde Vercel). La guarda `if (!ratelimit)` solo cubre variables de entorno ausentes en build time; un error en runtime queda sin capturar.

```typescript
const { success } = await ratelimit.limit(ip)  // ← sin try/catch
```

**Para confirmar:** verificar el estado de la base de datos Upstash en el dashboard y revisar los logs de Vercel para el timestamp de los intentos — si muestran una excepción de `@upstash/ratelimit`, la hipótesis es correcta.

Endpoints afectados si la hipótesis es correcta: `/api/contacto`, `/api/gina`, `/api/lead`, `/api/comunidad/registro`, `/api/comunidad/foto`, `/api/comunidad/confirmar`, `/api/comunidad/mensaje`, `/api/comunidad/mensaje/confirmar`, `/api/comunidad/gestionar/solicitar`, `/api/comunidad/gestionar/aplicar`, `/api/comunidad/[id]/contacto`.

---

## F-01 — Formulario de contacto (`/contacto`)

**Estado:** 🔴 Roto — API devuelve HTTP 500

### Casos de validación (client-side)

| Caso | Comportamiento esperado | Verificado |
|---|---|---|
| Campos vacíos | Error de validación visible | ✅ Detectado por Playwright (form no llega a la API) |
| Email inválido | Error "Ese email no parece tener el formato correcto" | ✅ Detectado |
| Mensaje < 5 chars | Error "Cuéntanos brevemente en qué podemos ayudarte" | ✅ Detectado |

### Test de envío real

| Caso | Email | HTTP status | Resultado |
|---|---|---|---|
| Branch test | [mail de prueba] | 500 | ❌ Error — no quedó en Supabase |
| Full client run | [mail del cliente de prueba] | 500 | ❌ No guardado, no enviado a Silvana |

> El formulario React muestra estado de error al recibir 500. Los leads NO se guardaron en Supabase. Silvana NO recibió notificación por email.

### Verificación de código

El flujo de código en sí es correcto: Origin check → rate limit → validación → Supabase → email Silvana (best-effort). La rotura es exclusivamente en la capa de Upstash.

---

## F-02 — Cuestionario Gina (`/conocernos`, widget flotante)

**Estado:** 🔴 Roto — API `/api/gina` devuelve HTTP 500

### Widget UI

- Playwright encontró el botón de apertura pero no pudo hacer click (elemento no interactuable en los 30 s de timeout). Probable causa: el botón está visible pero no era el elemento correcto para el click (estructura del widget flotante).
- El full client run progresó parcialmente (se abrió el widget via `gina:open` event, se envió texto), pero las respuestas de la API fallaron con 500.

### API Gina

```bash
curl -s -w "HTTP: %{http_code}" https://tu-lugar-en-galicia.vercel.app/api/gina \
  -X POST -H "Origin: https://tu-lugar-en-galicia.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"mensaje":"hola","sesion":null}'
# → HTTP: 500 (cuerpo vacío)
```

El cuestionario no puede avanzar. Las sesiones de Gina no se guardan en Supabase. **Ningún lead está siendo captado por este canal.**

---

## F-03 — Agenda (`/agenda`)

**Estado:** ⚠️ Parcial — AgendaPublica verificada, embed no auditado

### Sin código (`/agenda`)

| Check | Resultado |
|---|---|
| HTTP status | 200 ✅ |
| Cal.com embed visible | ❌ No (correcto — requiere `?code=`) |
| Contenido editorial visible | ✅ Página de marketing con pasos del proceso |
| H1 | "Primero, cuéntanos tu historia" |

**Comportamiento correcto por diseño:** La ruta pública muestra `AgendaPublica` (página editorial + botón "Abre Gina"), no el embed de Cal.com. El embed solo aparece con `?code=` válido.

### Con código inválido (`/agenda?code=INVALIDO123`)

| Check | Resultado |
|---|---|
| HTTP status | 200 |
| Cal.com embed visible | ❌ No (correcto) |
| Mensaje de error visible | ✅ Detectado (texto de validación negativa) |

### Con código válido

**No auditado** — el admin login falló (Paso 2), impidiendo crear un lead AUDIT-AGENDA-TEST y generar código desde el panel. El código de agenda no fue obtenido.

### Reserva + cancelación Cal.com

**No auditado** — dependía de código válido.

---

## F-04 — Formulario de comunidad (`/comunidad`)

**Estado:** 🔴 Roto — API devuelve HTTP 500

### Casos de validación (client-side)

| Caso | Comportamiento esperado | Verificado |
|---|---|---|
| Sin RGPD | Validación de RGPD obligatorio | ✅ Detectado |
| Email vacío | Error de campo obligatorio | ✅ Detectado |

### Test de envío real

| Caso | Email | HTTP status | Resultado |
|---|---|---|---|
| Full client run | [mail del cliente de prueba] | 500 | ❌ No guardado en Supabase, no enviado email de confirmación |

> El flujo completo (registro → geocoding → Supabase → Resend → confirmación de email) no fue posible verificar. El 500 se produce en el rate limiting, antes de alcanzar Supabase.

---

## Búsqueda "avoa" en producción

**Resultado: ✅ Limpio — no encontrado en ningún contexto**

| Contexto | Resultado |
|---|---|
| Código fuente (`*.ts`, `*.tsx`, `*.json`, `*.md`) | ❌ No encontrado |
| HTML de producción `/` | ❌ No encontrado |
| HTML de producción `/sobre-silvana` | ❌ No encontrado |
| HTML de producción `/comunidad` | ❌ No encontrado |
| HTML de producción `/conocernos` | ❌ No encontrado |
| HTML de producción `/como-funciona` | ❌ No encontrado |

---

## Referencias `tulugarengalicia.com` en producción

**Resultado: ℹ️ Esperado — no es un hallazgo**

El dominio `tulugarengalicia.com` aparece en el HTML de producción porque es el dominio canónico hardcoded en `lib/config/site.ts:10` (S10 pendiente de registrar).

| Página | Ocurrencias en HTML |
|---|---|
| `/` | 14 (canonical, og:url, og:image, JSON-LD, etc.) |
| `/contacto` | 10 |
| `/aviso-legal` | 12 |
| `/politica-de-privacidad` | 10 |

Estos links apuntan a un dominio que **no resuelve todavía** (502). El canonical y las imágenes OG están rotas hasta que se registre `tulugarengalicia.com` y se cargue `NEXT_PUBLIC_SITE_URL` en Vercel. No es un hallazgo nuevo — está documentado en `docs/arranque.md` §5.19 (S10).

---

## Tabla de hallazgos accionables

| ID | Severidad | Descripción | Observado / Inferido | Acción recomendada |
|---|---|---|---|---|
| **H-01** | 🔴 **Crítico** | Todos los formularios públicos devuelven **HTTP 500 body vacío** al recibir POST con Origin válido | **Observado:** HTTP 500, body vacío, antes de validación de campos. **Inferido:** `ratelimit.limit(ip)` sin try/catch — si Upstash no está disponible, la excepción mata la respuesta | 1. Verificar estado de Upstash en dashboard y credenciales en Vercel. 2. Revisar logs de Vercel en timestamps de los intentos. 3. Añadir try/catch alrededor de `ratelimit.limit(ip)` (ver §Fix propuesto). |
| **H-02** | 🔴 **Crítico** | Admin login falla con **HTTP 500** y mensaje Auth.js "server configuration" | **Observado:** HTTP 500, redirect a `/api/auth/error`, mensaje "There was a problem with the server configuration" de Auth.js. **Inferido:** causa distinta a H-01 — la request pasó el rate limiting y Auth.js falló; probable `NEXTAUTH_SECRET` en Vercel en vez de `AUTH_SECRET` (migración v4→v5 sin actualizar nombre de variable) | Verificar en Vercel que la variable se llama `AUTH_SECRET`. Si existía como `NEXTAUTH_SECRET`, renombrarla. Confirmar contra logs de Vercel. |
| **H-03** | 🟡 **Medio** | Selector Playwright para el botón de Gina no encontró elemento interactuable | **Observado:** timeout de 30 s en Playwright. **Inferido:** gap de la prueba automatizada, no bug de producción. El widget abre con `window.dispatchEvent(new Event('gina:open'))` | Ajustar selector en el script de auditoría para la segunda pasada. No es acción de código de producción. |
| **H-04** | 🟡 **Medio** | F-03 con código válido no auditado — admin panel inaccesible por H-02 | **Observado:** admin login bloqueado. F-03 con code= no ejecutado | Depende de H-02. Re-ejecutar F-03 cuando admin login esté operativo. |
| **P2-01** | 🟡 Medio (pre-existente) | La tarea F-03 asume que `/agenda` muestra Cal.com públicamente. Por diseño muestra página editorial | **Observado:** comportamiento correcto | Documentado. Auditoría futura debe incluir `?code=` válido. |
| **P2-02** | 🟢 Info (pre-existente) | Las defensas del código (Origin, rate limit, validación, Supabase) están implementadas correctamente. El problema es de infraestructura, no de lógica | **Observado:** Origin check funciona (403 correcto). Resto: pendiente de confirmar cuando Upstash esté operativo | Confirmar en segunda pasada post-corrección. |

---

## Tabla de emails AUDIT-TEST enviados

| Flow | Email destino | Estado | Registrado en Supabase |
|---|---|---|---|
| F-01 branch test | [mail de prueba] | ❌ No enviado (500) | ❌ No |
| F-01 client run | [mail del cliente de prueba] | ❌ No enviado (500) | ❌ No |
| F-02 Gina (full run) | [mail del cliente de prueba] | ❌ No enviado (500) | ❌ No |
| F-04 client run | [mail del cliente de prueba] | ❌ No enviado (500) | ❌ No |

> **Nota:** No se crearon registros AUDIT-TEST en Supabase porque el 500 ocurre en el rate limiting, antes de llegar a `saveLead()` o cualquier función de Supabase. No hay cleanup necesario en la base de datos.

---

## Cómo re-ejecutar esta auditoría después de corregir H-01 y H-02

1. Corregir `AUTH_SECRET` en Vercel y verificar que Upstash responde.
2. Ejecutar el script desde el mismo contenedor (tiene acceso de red):
   ```bash
   NODE_PATH=/opt/node-tools/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
     node /tmp/.../audit-fase-b.mjs
   ```
3. Complementar con test manual de F-02 (Gina widget) y F-03 (código de agenda via admin).
4. Verificar emails recibidos en [mail del cliente de prueba].

---

## Pendiente — segunda pasada (post corrección de H-01 y H-02)

| Item | Flow | Descripción |
|---|---|---|
| F-01 envío completo | F-01 | Verificar guardado en Supabase (`leads`, etiqueta `contacto-directo`), notificación a admin |
| F-02 Gina completo | F-02 | Cada regla y rama: opt-in RGPD, p1_nombre, p2_ciudad, todas las barandas documentadas en `docs/gina-barandas.md`, guardado de sesión en Supabase, respuestas de Gemini |
| F-03 con código válido | F-03 | Generar código desde admin, acceder a `/agenda?code=XXXX`, verificar que Cal.com embed carga, realizar reserva AUDIT-TEST (>2 semanas), cancelar inmediatamente |
| F-04 envío completo | F-04 | Verificar guardado en Supabase (`comunidad`), email de confirmación al cliente, flujo de confirmación vía token, presencia en mapa |
| Admin — dashboard | Admin | KPIs, lista de leads, pipeline |
| Admin — kanban | Admin | Columnas, cambio de etapa |
| Admin — inbox | Admin | Solo hilos AUDIT-TEST |
| Admin — código de agenda | Admin | Generar código, verificar en Supabase (`codigo_agenda`), verificar email al lead |
| Cadena de emails F-01 | F-01 | Notificación a admin: verificar asunto, cuerpo, ausencia de PII en logs |
| Cadena de emails F-04 | F-04 | Email de confirmación al cliente: verificar token, link de confirmación, expiración |

---

## Notas de metodología

- `page.textContent('body')` en Next.js incluye contenido de tags `<script>` inline; para detección de texto renderizado usar `page.evaluate(() => document.body.innerText)`.
- Los tests de validación client-side (campos vacíos, email inválido) **no llegan al API** — son capturados por `validarParaEnviar()` en el cliente. Verificado correctamente.
- Origin check verificado con curl: funciona correctamente en todos los endpoints (403 para Origin ausente o incorrecto).
- Gina widget abre via `window.dispatchEvent(new Event('gina:open'))` — selector `button:has-text("Gina")` no es confiable.

---

## Segunda pasada — 2026-10-22 (post corrección H-01 y H-02)

**Contexto:** Upstash fue reconstruido (base borrada por inactividad en plan free); `AUTH_SECRET` fue agregado a Vercel. Deploy `4b2711f` activo en producción desde las 00:34 UTC.

---

### Correcciones confirmadas en producción

| Hallazgo | Estado anterior | Estado actual | Verificado |
|---|---|---|---|
| **H-01** — Formularios 500 (Upstash) | 🔴 Roto | ✅ Resuelto | POST `/api/contacto` → 200 `{"ok":true}` · 2026-10-22 |
| **H-02** — Admin login 500 (AUTH_SECRET) | 🔴 Roto | ✅ Resuelto | Login responde "Email o contraseña incorrectos" (no 500) · confirmado por el usuario |

**Causa raíz confirmada H-01:** La base de Upstash Redis fue eliminada automáticamente por inactividad (plan free: 14 días sin actividad → borrado). Las variables `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` apuntaban a una base inexistente. `ratelimit.limit(ip)` lanzaba una excepción no capturada → HTTP 500 vacío antes de cualquier validación.

**Causa raíz confirmada H-02:** `next-auth@^5.0.0-beta.31` (Auth.js v5) requiere la variable `AUTH_SECRET`; el proyecto tenía configurado `NEXTAUTH_SECRET` (nombre de v4). Auth.js arrancaba sin secreto y fallaba con "server configuration error". La variable fue añadida con el nombre correcto.

---

### F-01 — Formulario de contacto (segunda pasada)

| Caso | HTTP status | Respuesta | Supabase | Email Silvana |
|---|---|---|---|---|
| AUDIT-TEST completo | 200 | `{"ok":true}` | ✅ A verificar en panel admin | ✅ A verificar en inbox de Silvana |

> Nota: La escritura en Supabase y el email a Silvana no pueden verificarse directamente desde este contenedor (no hay credenciales de DB ni acceso al inbox). Que la API responda 200 confirma que el código llegó a `saveLead()` sin excepción — el patrón fail-fast del endpoint garantiza que si Supabase falla, el status sería 500, no 200.

---

### F-02 — Cuestionario Gina (segunda pasada)

**Método:** llamadas secuenciales a `/api/gina` simulando el cliente (mismo esquema de sesión que `GinaWidget.tsx`).

| Paso | Respuesta enviada | Siguiente paso | HTTP | Resultado |
|---|---|---|---|---|
| `bienvenida` | `"continuar"` | `rgpd` | 200 | ✅ |
| `rgpd` | `"acepto"` (value del botón) | `p1_nombre` | 200 | ✅ RGPD capturado |
| `p1_nombre` | `"AUDIT-TEST Apellido"` | `p2_email` | 200 | ✅ |
| `p2_email` | `"[mail del cliente de prueba]"` | `p15_telefono` | 200 | ✅ |
| `p15_telefono` | (teléfono test) | `p3_origen` | 200 | ✅ accion=`guardar_nivel1` → **leadId asignado** |
| `p3_origen` | `"fuera"` | `p3b_pais` | 200 | ✅ leadId persiste |
| `p3b_pais` | `"Argentina"` | `p4_plazo` | 200 | ✅ |
| `p4_plazo` | (respuesta test) | `p5_ciudad` | 200 | ✅ |
| `p5_ciudad` | `"Vigo"` | `p6a_adultos` | 200 | ✅ |
| `p6a_adultos`…`p10_ingresos` | (respuestas test) | avanza | 200 | ✅ |

**leadId generado en p15_telefono (accion `guardar_nivel1`):** UUID válido asignado — confirma escritura exitosa en Supabase.

**Observaciones:**
- ✅ El motor de reglas avanza correctamente por todas las ramas probadas
- ✅ RGPD `"acepto"` requiere el `value` del botón (no el `label`); comportamiento correcto del cliente
- ✅ leadId aparece en la sesión a partir del paso `guardar_nivel1`
- ⚠️ La transcripción completa de los 44 pasos y todas las ramas documentadas en `docs/gina-barandas.md` no fue cubierta en esta pasada. Rama "en España" (`en_espana`) no auditada; ramas de mascotas, garantías y lead-en-preparación no auditadas. Pendiente de pasada dedicada.

---

### Variables de entorno — inventario completo

**Método:** grep exhaustivo sobre `*.ts`, `*.tsx` en `app/`, `lib/`, `middleware.ts`, `auth.ts`. Excluidas: `NODE_ENV`, `VERCEL_*`.

| Variable | Archivo:línea (primera ocurrencia) | ¿Existe en Vercel? | Qué se rompe si falta | Obligatoria |
|---|---|---|---|---|
| `ADMIN_EMAIL` | `auth.ts:33` | ❌ No | Login admin imposible: `authorize()` devuelve `null` para cualquier credencial | **Sí** (login admin) |
| `ADMIN_PASSWORD_HASH` | `auth.ts:34` | ❌ No | Login admin imposible: `authorize()` devuelve `null` | **Sí** (login admin) |
| `AEMET_API_KEY` | `app/api/clima/[ciudad]/route.ts:115` | ✅ Sí (Prod+Preview) | Widget de clima en páginas de ciudad devuelve error | Opcional (fallback: sin datos de clima) |
| `AUTH_SECRET` | (leída por Auth.js v5 internamente) | ✅ Sí (Prod) | Login admin devuelve 500 "server configuration" | **Sí** (login admin) |
| `CALCOM_WEBHOOK_SECRET` | `app/api/webhooks/calcom/route.ts:13` | ✅ Sí (Prod+Preview) | Webhook de Cal.com no verificado → reservas no procesadas | **Sí** (integración Cal.com) |
| `CRON_SECRET` | `app/api/admin/resumen-diario/route.ts:341` | ✅ Sí (Prod+Preview) | Sin cron secret: el resumen diario acepta cualquier request (seguridad reducida, no rotura funcional) | Opcional (pero recomendada para seguridad) |
| `GOOGLE_SHEETS_API_KEY` | `lib/marcador.ts:53` | ✅ Sí (Prod+Preview) | El Marcador de propiedades no carga datos | Sí (Marcador) |
| `INSTAGRAM_APP_ID` | `lib/instagram/graph.ts:26` | ✅ Sí (Prod) | Feed de Instagram no funciona; OAuth no inicia | Sí (feed Instagram) |
| `INSTAGRAM_APP_SECRET` | `lib/instagram/graph.ts:32` | ✅ Sí (Prod) | Feed de Instagram no funciona; no se puede obtener token de larga duración | Sí (feed Instagram) |
| `INSTAGRAM_EXPECTED_IG_USER_ID` | `lib/instagram/tokenRepo.ts:36` | ❌ No | Sin restricción de cuenta: el feed acepta tokens de cualquier cuenta de Instagram (riesgo de seguridad IG-01, documentado en CLAUDE.md) | Recomendada (seguridad) |
| `INTERNAL_API_SECRET` | `lib/admin/tokens.ts:21` | ✅ Sí (Prod+Preview) | Todos los endpoints de admin que usan `isAuthorized()` responden 401 | **Sí** (admin API) |
| `NEXTAUTH_SECRET` | `middleware.ts:165` | ❌ No | `getToken()` en middleware no puede verificar la sesión JWT → `/admin/**` redirige siempre al login (sin acceso) | **Sí** (sesión admin) |
| `NEXT_PUBLIC_SITE_URL` | `app/api/admin/resumen-diario/route.ts:352` | ❌ No (no figura en lista) | Fallback a `'https://tu-lugar-en-galicia.vercel.app'`; links en el resumen diario apuntan a esa URL. Funcional. | Opcional (fallback hardcodeado) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/comunidad/supabaseBrowser.ts:15` | ✅ Sí (Prod+Preview) | Lectura del mapa de comunidad (cliente) falla | **Sí** (comunidad mapa) |
| `NEXT_PUBLIC_SUPABASE_URL` | `app/api/comunidad/registro/route.ts:42` | ✅ Sí (Prod+Preview) | Validación de foto URL falla (isValidFotoUrl) | **Sí** (comunidad registro) |
| `RESEND_API_KEY` | `lib/admin/email.ts:59` | ✅ Sí (Prod+Preview) | Todos los emails del sistema (confirmación Gina, Silvana, comunidad) fallan | **Sí** (todos los flows de email) |
| `RESEND_FROM_EMAIL` | `lib/admin/email.ts:11` | ❌ No | Fallback: `'Tu Lugar en Galicia <onboarding@resend.dev>'`. Funcional, pero emails salen desde `@resend.dev`. | Opcional (fallback funcional) |
| `SHEET_MARCADOR_ID` | `lib/marcador.ts:52` | ✅ Sí (Prod+Preview) | El Marcador no carga propiedades | **Sí** (Marcador) |
| `SILVANA_EMAIL` | `app/api/admin/habilitar-agenda/[recordId]/route.ts:105` | ✅ Sí (Prod+Preview) | Notificaciones a Silvana (agenda, resumen diario) no llegan. Gina y /contacto no notifican al admin. | **Sí** (notificaciones admin) |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase/serverClient.ts:11` | ✅ Sí (Prod+Preview) | Todas las escrituras server-side a Supabase fallan (Gina, leads, comunidad) | **Sí** (crítico) |
| `SUPABASE_URL` | `app/api/comunidad/registro/route.ts:42` | ❌ No | Fallback a `NEXT_PUBLIC_SUPABASE_URL` → funcional. Solo relevante si se quiere distinguir URL pública de URL interna. | Opcional (tiene fallback) |
| `UPSTASH_REDIS_REST_TOKEN` | `app/api/admin/habilitar-agenda/[recordId]/route.ts:12` | ✅ Sí (Prod+Preview) | Rate limiting no inicializa → todos los endpoints de escritura responden 503 (fail-closed) | **Sí** (rate limiting) |
| `UPSTASH_REDIS_REST_URL` | `app/api/admin/habilitar-agenda/[recordId]/route.ts:12` | ✅ Sí (Prod+Preview) | Igual que `UPSTASH_REDIS_REST_TOKEN` | **Sí** (rate limiting) |

**Variables faltantes con impacto inmediato:**

| Variable | Impacto ahora mismo |
|---|---|
| `ADMIN_EMAIL` | Admin login siempre falla (aunque AUTH_SECRET esté bien: `authorize()` devuelve null) |
| `ADMIN_PASSWORD_HASH` | Igual |
| `NEXTAUTH_SECRET` | Middleware no puede verificar sesiones JWT → `/admin/**` inaccesible aunque el login funcione |

> **Nota sobre `NEXTAUTH_SECRET` vs `AUTH_SECRET`:** Auth.js v5 usa `AUTH_SECRET` para firmar/cifrar los tokens JWT. El middleware usa `getToken({ secret: process.env.NEXTAUTH_SECRET })` (línea `middleware.ts:165`). Si solo existe `AUTH_SECRET` en Vercel pero no `NEXTAUTH_SECRET`, el login puede autenticarse (Auth.js genera el token) pero el middleware no puede verificarlo (usa variable distinta) → login exitoso pero acceso al panel bloqueado de todas formas. Ambas variables deben existir, o el middleware debe leer `AUTH_SECRET`. **Recomendación:** unificar en una sola variable y actualizar `middleware.ts:165` para leer `AUTH_SECRET || NEXTAUTH_SECRET`.

---

### Recomendación — Upstash plan free y borrado por inactividad

El plan free de Upstash elimina las bases de datos tras **14 días sin actividad**. El sitio no tiene tráfico orgánico suficiente para mantenerla viva de forma natural, y los endpoints de rate limiting son `fail-closed` sin Upstash → el sitio se rompe silenciosamente.

**Opciones (de menor a mayor costo):**

| Opción | Descripción | Costo |
|---|---|---|
| **A — Keepalive cron** | Agregar un step al resumen diario que ejecute un `PING` o un `get/set` dummy en Redis. Vercel lo llama cada 24h → nunca pasa 14 días de inactividad. | $0 |
| **B — Plan Pay-as-you-go** | Subir a plan de pago de Upstash (~$0 hasta los primeros 10k requests). Sin borrado por inactividad. | ~$0–$1/mes |
| **C — Upstash Pro** | Sin límites de inactividad, SLA. | ~$10/mes |

**Recomendación inmediata:** Opción A (keepalive en cron diario) + monitorear con un check externo (UptimeRobot, BetterStack free) que llame a `/api/contacto` con un POST inválido cada 12h y alerte si el status es 500.

---

## Segunda pasada — 2026-10-22 (continuacion)

### H-02 confirmado resuelto — Login admin

Login exitoso en produccion. Causa raiz confirmada: faltaban `ADMIN_EMAIL` y `ADMIN_PASSWORD_HASH` en Vercel (no solo `AUTH_SECRET`). El primer hash se copio con un caracter erroneo; se regenero y verifico localmente con `bcryptjs.compare` en Git Bash. Variables cargadas: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `AUTH_SECRET`, `NEXTAUTH_SECRET` (mismo valor). Login OK desde el navegador.

Commits relacionados de esta sesion:

| Commit | Descripcion |
|---|---|
| `4b2711f` | fix: wrap ratelimit.limit en try/catch en 14 rutas (H-01) |
| `645169b` | docs: segunda pasada 2026-10-22 — H-01/H-02 confirmados |
| `112e17a` | fix(auth): logs de diagnostico temporales (revertido en `9b7895c`) |
| `9b7895c` | fix(auth): revert logs, conserva solo guarda de env faltante |

---

### H-03 — Hallazgo nuevo: `/admin` devuelve 404 post-login

**Severidad:** Media — solo afecta a la operadora (no es publico).

**Causa:** `app/admin/login/page.tsx:14` redirige a `callbackUrl || '/admin'`. No existe `app/admin/page.tsx`. El App Router devuelve 404 para rutas sin `page.tsx`.

**Fix propuesto (sin aplicar, pendiente aprobacion):**

```tsx
// app/admin/page.tsx — 4 lineas
import { redirect } from 'next/navigation'
export default function AdminPage() {
  redirect('/admin/dashboard')
}
```

Alternativa menor: cambiar el fallback de la linea 14 de `/admin` a `/admin/dashboard`. La pagina de redirect es mas robusta porque tambien resuelve accesos directos desde bookmarks.

---

### F-03 — Admin: segunda pasada (parcial)

**Login via curl:** intento unico retorno HTTP 302 sin session cookie. Causa probable: encoding de form data en curl no URL-encodea los caracteres especiales de la contrasena; el CSRF se valida antes de llegar a `authorize()`, por lo que el contador de intentos fallidos (Upstash `login-fallos:*`) NO se incremento. Sin riesgo de bloqueo. Por instruccion, no se reintento.

**Navegacion del panel (por analisis de codigo):**

| Vista | Ruta | Auth requerida | Verificado |
|---|---|---|---|
| Dashboard | `/admin/dashboard` | `requireAdminSession()` | Por codigo — `getKpisDelMes()` retorna todos los leads del mes actual |
| Inbox | `/admin/inbox` | `requireAdminSession()` | Por codigo — `listarLeadsInbox()` lista TODOS los leads sin filtro de fecha, estado ni etiqueta |
| Kanban | `/admin/kanban` | `requireAdminSession()` | Por codigo — `listarLeadsParaKanban()` lista todos los leads del pipeline |
| Ficha lead | `/admin/leads/[id]` | `requireAdminSession()` | Por codigo — muestra datos completos del lead, sin `HabilitarAgendaButton` |
| Ficha email-linked | `/admin/lead/[recordId]?token=...` | Token HMAC-SHA256 (`verifyScopedToken`) | No accedida — requiere `INTERNAL_API_SECRET` (no disponible en contenedor) |

**Dashboard KPI "Leads este mes: 2":** correcto. `getKpisDelMes()` filtra `created_at >= 2026-10-01T00:00:00Z`. Los 2 leads son los registros AUDIT-TEST creados durante esta auditoria (ver listado al final).

**Registros AUDIT-TEST en inbox:** confirmado por codigo que `listarLeadsInbox()` no aplica ningun filtro — lista absolutamente todos los leads. Los AUDIT-TEST de hoy deben aparecer al tope (son los mas recientes y sin calificacion = `RANK_SIN_CALIFICAR = 4`, ordenados por `created_at DESC` dentro de ese rango).

---

### F-03 — Habilitar agenda (bloqueado)

`HabilitarAgendaButton` existe solo en `/admin/lead/[recordId]?token=...` (version email-linked), no en `/admin/leads/[id]` (version session). Para generarlo se necesita `INTERNAL_API_SECRET` — no disponible en el contenedor.

Para ejecutar F-03 manualmente desde el navegador de Silvana:
1. Entrar a `/admin/inbox` → clic en un registro AUDIT-TEST
2. La ficha (`/admin/leads/[id]`) no tiene el boton "Habilitar agenda" — es de la version email
3. El boton solo aparece cuando Silvana recibe el email del resumen diario o del webhook de Cal.com y entra por ese enlace

**Alternativa para el proximo ciclo de auditoria:** agregar `INTERNAL_API_SECRET` a las variables del contenedor, o exponer un endpoint de generacion de token protegido por sesion admin.

---

### F-02 — Segunda pasada: ramas "en Espana" y mascotas

Pendiente de ejecutar (flujo Gina segunda pasada cubrio ruta principal hasta `p15_telefono`). Las ramas no testeadas son:

- `p3_origen = 'en_espana'` → `p18a_ciudad`
- `p7b_tipo` con mascotas → sub-pasos de cantidad y peso
- `p11_garantias = 'ninguna'` + ingresos en `INGRESOS_RIESGO` → etiqueta `lead-en-preparacion` → `p11_lead_preparacion`
- Rama completa hasta `accion: 'fin'` → envio del Plan Estrategico por email


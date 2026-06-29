# Spec — Flujo de agenda completo
> Documento de referencia para Code. No borrar ni mover. Actualizar si cambia el flujo.

---

## Visión general

```
Gina (cuestionario completo)
  → Airtable guarda lead + calificación automática
  → Cron diario → mail resumen a Silvana
  → Silvana lee perfil completo → pulsa "Habilitar agenda"
  → Endpoint genera código único → mail cálido al cliente
  → Cliente entra a /agenda?code= → elige slot en Cal.com
  → Cal.com confirma → notifica a Silvana → bloquea slot
  → Recordatorios automáticos 24hs y 1h antes (Cal.com nativo)
  → Recordatorio a Silvana 1h antes con resumen del perfil
```

---

## Pieza 1 — Calificación en Airtable (ya implementado)

Gina guarda el lead completo en Airtable con todos los campos del flujo.
La calificación se almacena en el campo **`calificacion`** en Airtable con tres valores:
- `potencial-alto`
- `en-desarrollo`
- `no-califica`

No hay cambios en esta pieza.

---

## Pieza 2 — Mail diario a Silvana

**Cuándo:** cron job diario a las 08:00 hora España.
**Quién lo dispara:** GitHub Actions (cron) o Vercel Cron Jobs → llama a `/api/admin/resumen-diario`.
**Autenticación del endpoint:** header `Authorization: Bearer ${INTERNAL_API_SECRET}`.

### Contenido del mail

**Asunto:** `Tu Lugar en Galicia — Resumen de leads · [fecha]`

**Cuerpo:**

1. Leads `potencial-alto` — tarjeta por cada uno con:
   - Nombre completo
   - Ciudad de destino
   - País de origen
   - Plazo de llegada
   - Resumen de 2-3 líneas generado automáticamente desde los campos de Airtable
   - Días en Airtable sin respuesta (urgencia visual: > 3 días = naranja, > 7 días = rojo)
   - Botón **"Ver perfil completo"** → `/admin/lead/[recordId]` (página privada)
   - Botón **"Habilitar agenda"** → llama a `/api/admin/habilitar-agenda/[recordId]`

2. Leads `en-desarrollo` — mismo formato pero agrupados en una sección separada.

3. Leads `no-califica` — una sola línea: *"X personas consultaron esta semana y no califican de momento."* Sin nombres ni detalles.

**Remitente:** `gina@tulugarengalicia.com` (cuando el dominio esté activo), hasta entonces el dominio de Resend.
**Destinatario:** email de Silvana (variable de entorno `SILVANA_EMAIL`).

---

## Pieza 3 — Página de perfil completo `/admin/lead/[recordId]`

Página privada, solo accesible desde el link del mail (no indexada, no en el nav).
**Autenticación:** token firmado en el link (HMAC con `INTERNAL_API_SECRET` + recordId + fecha). Expira en 72 horas.

### Contenido
- Todos los campos que respondió en Gina, con etiquetas legibles (no los keys técnicos)
- Score / calificación con color
- Fecha y hora en que completó el cuestionario
- Días transcurridos desde entonces
- Historial de interacciones previas si las hay
- Botón **"Habilitar agenda"** — mismo que en el mail

---

## Pieza 4 — Endpoint `/api/admin/habilitar-agenda/[recordId]`

**Método:** POST
**Autenticación:** token del link (mismo sistema que el perfil).

**Qué hace:**
1. Verifica que el lead existe y no tiene código ya asignado
2. Genera un código único: 8 caracteres alfanuméricos en mayúsculas (ej: `X7KP2QNR`)
3. Guarda el código en Airtable en el campo `codigoAgenda`
4. Guarda `fechaHabilitacion` en Airtable
5. Dispara Resend → mail cálido al cliente (ver Pieza 5)
6. Responde con `{ ok: true }` → el botón en el mail/perfil muestra "✓ Habilitado"

---

## Pieza 5 — Mail al cliente cuando se habilita su agenda

**Asunto:** `Tu cita con Tu Lugar en Galicia está lista, [nombre]`

**Tono:** cálido, cercano, profesional. Voz de Silvana. No corporativo.

**Estructura del mail:**

```
Hola [nombre],

Revisé tu historia con atención y me alegra mucho decirte que 
creo que puedo acompañarte en este proceso. Lo que describes 
es exactamente el tipo de situación en la que más podemos ayudar.

El siguiente paso es una videollamada de unos 30 minutos para 
conocernos, entender mejor tu situación y explicarte cómo 
trabajamos. Sin compromisos.

Para agendar tu cita, solo necesitas:

  1. Entrar a tulugarengalicia.com/agenda
  2. Ingresar tu código personal: [CÓDIGO]
  3. Elegir el día y horario que mejor te quede

[BOTÓN: Ir a mi cita →]

Tu código es personal e intransferible. Tenés 7 días para 
usarlo antes de que expire.

Si tenés alguna pregunta antes de la llamada, podés escribirme 
directamente respondiendo este mail.

¡Nos vemos pronto!

Silvana
Tu Lugar en Galicia
```

**Remitente:** `silvana@tulugarengalicia.com` (cuando el dominio esté activo).

---

## Pieza 6 — Expiración de código y alerta de seguimiento

**Expiración:** 7 días desde `fechaHabilitacion`.
**Cron:** el mismo job diario verifica códigos expirados sin uso.

Si el código expiró sin que el cliente agendara:
- El campo `codigoAgenda` se marca como `expirado` en Airtable
- En el mail diario de Silvana aparece una sección "Seguimiento pendiente" con el nombre del cliente y un botón para regenerar el código o contactarlo manualmente

Si el cliente no abrió el mail en 48hs (detectable con Resend tracking):
- En el mail diario de Silvana aparece una alerta suave: *"[nombre] aún no abrió el mail con su código."*
- **Pendiente de activar con dominio propio:** requiere webhook de Resend (eventos `email.opened`).
  Crear campo `mailAbierto` (Single line text) en Airtable. El webhook escribe la fecha de apertura.
  El cron lee ese campo para incluir la alerta en el resumen.

---

## Pieza 7 — Webhook Cal.com ✅

**Archivo:** `app/api/webhooks/calcom/route.ts`

**Configuración en panel Cal.com (no requiere código):**
- Recordatorio automático 24hs antes → mail al cliente con fecha, hora y link
- Recordatorio automático 1 hora antes → mail breve al cliente
- Notificación a Silvana al confirmar cita → mail automático de Cal.com

**Webhook Cal.com → `POST /api/webhooks/calcom`:**
- Verifica firma HMAC-SHA256 via header `X-Cal-Signature-256` con `CALCOM_WEBHOOK_SECRET`
- Solo procesa eventos `BOOKING_CREATED`; devuelve `{ ok: true }` para el resto
- Extrae nombre, email, `startTime` y `location` del payload
- Busca el lead en Airtable por email (`findLeadByEmail`)
- PATCH: `citaAgendada: 'true'`, `fechaCita` (ISO timestamp), `horaCita`, `plataformaVideollamada`
- Envía mail de confirmación a Silvana con nombre, fecha, hora, plataforma y link al perfil
- Siempre devuelve `{ ok: true }` — nunca bloquea Cal.com ante errores internos

**Variable de entorno nueva:** `CALCOM_WEBHOOK_SECRET`
- Obtener en: Cal.com → Settings → Developer → Webhooks → crear webhook
- URL: `https://tulugarengalicia.com/api/webhooks/calcom`
- Eventos: `BOOKING_CREATED`

**Campos nuevos en Airtable** (Silvana los crea manualmente, tipo Single line text):
| Campo | Descripción |
|---|---|
| `citaAgendada` | `'true'` cuando el cliente reservó; vacío si no |
| `fechaCita` | ISO timestamp del `startTime` de Cal.com (para comparación en recordatorio) |
| `horaCita` | Hora formateada en hora España (ej: `10:00`) |
| `plataformaVideollamada` | Meet / Zoom / URL / WhatsApp — puede editarse en Airtable |

---

## Pieza 8 — Recordatorio a Silvana 1h antes ✅

**Archivo:** `app/api/admin/recordatorio-silvana/route.ts`

**Cuándo:** cron horario `0 * * * *` (minuto 0 de cada hora UTC).

> **Trigger:** GitHub Actions — `.github/workflows/recordatorio-silvana.yml`.
> El cron ya no vive en `vercel.json` (Vercel Hobby solo permite crons diarios).
> El secret `INTERNAL_API_SECRET` debe estar configurado en:
> GitHub → Settings → Secrets and variables → Actions → New repository secret.

**Lógica:**
- `getLeadsConCitaProxima()` en `lib/admin/airtable.ts`: filtra leads con `citaAgendada === 'true'` cuya `fechaCita` (ISO) cae entre `Date.now()` y `Date.now() + 75 minutos`
- Si no hay citas próximas: devuelve `{ ok: true, enviados: 0 }` sin enviar mail
- Si hay citas: envía mail a Silvana con tarjeta por cada lead

**Contenido de cada tarjeta:**
- Nombre del cliente, email
- Minutos exactos hasta la cita
- Fecha larga y hora (hora España)
- Ciudad destino, país origen, plazo de llegada, presupuesto
- Situación laboral
- Plataforma de videollamada (con link clicable si es URL)
- Botón "Ver perfil completo →" con token HMAC válido 72h

---

## Pieza 9 — `/agenda?code=` (ya implementado)

Sin cambios en el comportamiento actual. Solo actualizar:
- `AGENDA_VALID_CODES` en `lib/config/site.ts` pasa a ser dinámico: el endpoint de validación consulta Airtable en lugar del array hardcodeado
- Validación: código existe en Airtable + no está expirado + no está ya usado

---

## Variables de entorno necesarias

```
SILVANA_EMAIL                    — email de Silvana para mails internos
INTERNAL_API_SECRET              — ya existe, se reutiliza para auth de endpoints admin
RESEND_API_KEY                   — ya existe
CALCOM_API_KEY                   — para webhooks y configuración via API
CALCOM_WEBHOOK_SECRET            — nuevo (Pieza 7): firma HMAC del webhook de Cal.com
NEXT_PUBLIC_SITE_URL             — tulugarengalicia.com (cuando llegue el dominio)
CRON_SECRET                      — ya existe: Vercel lo inyecta en crons
```

---

## Orden de implementación recomendado

1. Pieza 4 — endpoint habilitar-agenda (núcleo del flujo)
2. Pieza 5 — mail al cliente (Resend, usa dominio actual como fallback)
3. Pieza 3 — página perfil completo `/admin/lead/[recordId]`
4. Pieza 2 — mail diario a Silvana + cron
5. Pieza 9 — validación dinámica contra Airtable (reemplaza array hardcodeado)
6. Pieza 6 — expiración de códigos
7. Pieza 7 — webhook Cal.com
8. Pieza 8 — recordatorio a Silvana

**Bloqueado hasta dominio `tulugarengalicia.com`:** remitentes con dominio propio en Resend.
**No bloqueado:** todo lo demás puede construirse con el dominio de Resend actual como fallback.

---

## Estado actual

| Pieza | Estado |
|---|---|
| 1 — Calificación Airtable | ✅ hecho |
| 2 — Mail diario Silvana | ✅ hecho |
| 3 — Página perfil `/admin/lead/` | ✅ hecho |
| 4 — Endpoint habilitar-agenda | ✅ hecho |
| 5 — Mail cálido al cliente | ✅ hecho (template en `lib/admin/email.ts`) |
| 6 — Expiración + alertas | ✅ hecho |
| 7 — Webhook Cal.com | ✅ hecho (`app/api/webhooks/calcom/route.ts`) |
| 8 — Recordatorio Silvana 1h antes | ✅ hecho (`app/api/admin/recordatorio-silvana/route.ts`) |
| 9 — Validación dinámica /agenda | ✅ hecho |

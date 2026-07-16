# Known Issues

Problemas conocidos del entorno/herramientas que no son bugs del producto — se documentan acá para no re-investigarlos de cero en cada sesión.

---

## Browser pane (Claude Code) — `preview_stop`/`preview_start` no mata el proceso Node real

**Estado:** sin resolver, causa raíz desconocida (herramienta, no producto).

Verificado en la sesión de debugging del login de NextAuth (Fase 2): tras editar `.env.local`
y llamar `preview_stop` seguido de `preview_start`, el proceso `next dev` seguía siendo el
mismo (mismo PID, mismo `StartTime`) — los cambios de variables de entorno nunca se
reflejaban, porque Next.js solo lee `.env.local` una vez al arrancar el proceso. `preview_start`
reportaba un servidor "nuevo" (`reused: false`, `serverId` distinto) pero el proceso `node`
subyacente era el mismo de antes.

**Workaround usado:** matar los procesos `node` a mano por PID (`Get-Process -Name node |
Stop-Process -Force`) antes de cada `preview_start`, confirmando con `Get-Process` que el
`StartTime` del proceso resultante es realmente nuevo antes de asumir que el servidor recargó
las variables de entorno.

**Impacto:** cualquier cambio a `.env.local` (o a cualquier variable de entorno) durante una
sesión con el Browser pane requiere este workaround — un `preview_stop`/`preview_start` normal
no alcanza.

---

## Pendiente legal: confirmar DPA/términos de Supabase Inc. antes de tráfico real

**Estado:** sin verificar — asumido, no confirmado.

Al reescribir la Política de Privacidad (sección 5, Destinatarios) tras la migración a
Supabase, se asumió que el DPA/términos estándar de tratamiento de datos de Supabase Inc.
ya están aceptados para este proyecto — mismo supuesto que ya se venía asumiendo para
Airtable, Inc. Nadie con criterio legal lo verificó formalmente.

**Acción pendiente:** confirmar antes de que la web reciba tráfico real (no solo datos de
test) que el DPA de Supabase está efectivamente aceptado para el proyecto usado en
producción.

---

## Pendiente técnico: `next-auth` en versión beta

**Estado:** decisión consciente, no un bug — pero requiere revisión antes de producción real.

El login de `/admin` (Fase 1 del CRM Supabase, ver `docs/crm-supabase-fase0.md` §6.1) usa
`next-auth@5.0.0-beta.31` (Auth.js v5), elegido por compatibilidad de peer-deps con Next.js 16
(`next-auth@4` no la declara). Sigue siendo software beta en la superficie más sensible del sitio
(login con acceso a PII completa de leads).

**Acción pendiente:** revisar/pinnear a una versión estable de NextAuth/Auth.js v5 antes de que
haya leads reales en producción (hoy solo hay datos de test). Confirmar en ese momento si ya
existe una release estable de v5, o si conviene bajar a v4 con el adapter/integración
correspondiente para App Router.

---

## Browser pane (Claude Code Desktop) — el preview no pinta cuando no está en foco (screenshot/IntersectionObserver no funcionan)

**Estado:** confirmado. Es un bug de **Claude Code Desktop** (capa Electron), no de este proyecto:
el `BrowserWindow`/`BrowserView` que renderiza el preview no pinta frames mientras no está "en
foco" dentro de la gestión interna de paneles de la app — independientemente de que la ventana de
Claude esté en foreground a nivel de sistema operativo. **No es resoluble desde este repo ni por
el usuario**; requiere un fix de Anthropic del lado de la herramienta. No hay ninguna acción
pendiente de nuestro lado sobre esto — no reintentar diagnosticarlo de nuevo en sesiones futuras.

**Síntoma:**
- `computer{action:"screenshot"}` da timeout a los 30s en cualquier página, incluso simples y sin video (ej. `/faq`).
- `IntersectionObserver` nunca dispara su callback, ni siquiera casos triviales (`document.body`, `threshold: 0`, que deberían disparar casi al instante).
- `document.visibilityState === "hidden"`, `document.hidden === true`, `document.hasFocus() === false` de forma persistente en la página del Browser pane.

**Descartado como causa (verificado, no supuesto):**
- Memoria del sistema — se liberó de 2.8GB a 8.1GB libres (cierre manual de pestañas de Chrome), sin cambio en los síntomas.
- Proceso de Chrome/GPU colgado — el Browser pane resultó ser un `BrowserView` embebido dentro de la propia app Claude Desktop (Electron), confirmado por el User-Agent (`Claude/1.20186.1 Electron/42.5.1`), no un proceso `chrome.exe` externo. Un intento de matar un proceso GPU de un Chrome externo (que resultó no tener relación con el Browser pane) tumbó ese Chrome sin ningún efecto sobre el bug real.
- Estado acumulado de sesión / proceso zombie — se hizo un **reboot completo del sistema operativo** (no solo cerrar Chrome) y el bug persistió exactamente igual.
- Foco de ventana de Windows — se confirmó que la ventana de Claude Desktop está en foreground y no minimizada; el problema no es a nivel de ventana de SO.
- `tabs_select` (frontear la pestaña dentro de la gestión propia del Browser pane) y `window.focus()` desde JS de la página — ninguno cambia el estado `hidden`.

**Conclusión:** el `BrowserView` nunca se marca como "shown"/en foco dentro de la gestión interna
de paneles de Claude Code Desktop, aunque el panel se vea correctamente en pantalla del lado del
usuario. Es un bug de la app, no del sistema operativo ni del proyecto.

**Impacto:** no se puede verificar visualmente (screenshots) ni depender de APIs que requieren que la página esté "visible" (`IntersectionObserver`, `requestAnimationFrame`-driven behavior) durante el testing con el Browser pane.

**Práctica permanente (no un workaround temporal):** en toda sesión, verificar siempre vía
`get_page_text`, `read_page` (árbol de accesibilidad), `javascript_tool` (DOM, computed styles,
`fetch` directo a APIs), `read_network_requests`, `read_console_messages` y `preview_logs`. No
volver a intentar `computer{action:"screenshot"}` como método de verificación, y no tratar este
comportamiento como algo "pendiente de arreglar" — es el modo de operar estándar del Browser pane
hasta que Anthropic libere un fix. Cubre lógica, validaciones, llamadas a API y contenido
renderizado real; no cubre verificación visual/pixel-perfect (layout, animaciones, contraste) —
para eso, pedirle al usuario que confirme manualmente.

### El mismo bug también impide que los clicks comprometan cambios de React al DOM

Verificado en sesión de testing exhaustivo (Gina/formularios): `computer{action:"left_click", ref}` sobre un botón real (cerrar el widget de Gina, `onClick={() => setAbierto(false)}`, sin ninguna lógica de reapertura en el código) **no cierra el widget**. Se probó también disparando el evento nativo directamente vía `element.click()` desde `javascript_tool`, con espera explícita de 1s antes de re-chequear — mismo resultado: el DOM sigue mostrando el estado anterior. Se revisó el código fuente (`GinaWidget.tsx`) y se descartó que sea un bug de producto (no hay ningún efecto que fuerce la reapertura).

Esto es consistente con la misma causa raíz (el `BrowserView` sin foco no pinta/ejecuta su ciclo de rendering): los re-renders de React no se comprometen al DOM visible mientras el panel no está "en foco" internamente.

**Consecuencia permanente para testing:** no confiar en "click en botón → verificar cambio de UI" como método de verificación, ni siquiera usando `.click()` nativo por DOM en lugar de clicks por coordenada. La navegación entre páginas (`navigate()` a una URL) sí funciona con normalidad — el problema es específico a cambios de estado in-page vía React. `read_page` en cambio SÍ refleja el DOM real correctamente (se había sospechado que devolvía snapshots viejos, pero se confirmó que no — el widget realmente seguía abierto, `read_page` tenía razón).

**Práctica permanente para este caso:** testing funcional vía llamadas directas a los API routes (`fetch()` desde `javascript_tool`, replicando el payload exacto que mandaría el cliente real) en vez de manejar la UI — verifica la misma lógica de servidor sin depender de que el click se refleje visualmente. Para confirmar que la UI responde a un click real, pedirle al usuario que lo pruebe manualmente.

**Precisión importante (acota el bug):** el toggle nativo de `<details>/<summary>` (acordeón de FAQ) **sí funciona** con `.click()` — `details.open` cambia correctamente. Esto confirma que el bug es específico al **commit de React al DOM real** (setState → re-render → commit), no un bloqueo universal de interacción del navegador. Comportamiento nativo del motor (details/summary, navegación de links, formularios HTML nativos) funciona con normalidad; lo que falla es cualquier cambio de UI que dependa de que React aplique un nuevo estado.

### Variante observada en Fase 3 (Kanban/campos custom) — mismo bug de fondo, síntoma distinto en `read_page`

**Síntoma:**
- `computer{action:"screenshot"}` da timeout — mismo síntoma superficial que arriba.
- `read_page` devuelve **"(empty page)"** específicamente en la ruta de la Ficha 360° (`/admin/leads/[id]`), incluso después de recargar. Esto es distinto del comportamiento general documentado arriba (donde `read_page` sí refleja el DOM real correctamente) — acá directamente no devuelve contenido para esa ruta puntual. No se probó si otras rutas de `/admin` también lo hacen.

**Práctica permanente para este caso:** igual que arriba — `javascript_tool` (DOM directo, `fetch()` autenticado replicando el payload real) y `read_network_requests` en vez de `read_page`/`screenshot` para rutas donde `read_page` falle. Permitió verificar creación de campos custom (POST 201) y guardado de valores (PATCH 200) con persistencia confirmada tras recarga, sin poder ver el árbol de accesibilidad ni una captura de esa página. No es necesario determinar el mecanismo exacto de esta variante — la práctica de verificación (evitar `read_page`/`screenshot`, usar `javascript_tool`/`fetch`/`read_network_requests`) es la misma independientemente de la causa puntual.

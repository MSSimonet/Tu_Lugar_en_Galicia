# Known Issues

Problemas conocidos del entorno/herramientas que no son bugs del producto — se documentan acá para no re-investigarlos de cero en cada sesión.

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

## Browser pane (Claude Code) — BrowserView queda en `hidden`, screenshot/IntersectionObserver no funcionan

**Estado:** sin resolver. Causa raíz desconocida.

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

**Hipótesis no descartada:** el `BrowserView` nunca se marca como "shown" dentro de la gestión interna de paneles de Claude Desktop, independientemente de que el panel se vea correctamente en pantalla del lado del usuario. Podría ser un bug de la herramienta en sí (no reproducible/arreglable desde el lado del repo o del sistema operativo).

**Impacto:** no se puede verificar visualmente (screenshots) ni depender de APIs que requieren que la página esté "visible" (`IntersectionObserver`, `requestAnimationFrame`-driven behavior) durante el testing con el Browser pane.

**Workaround usado:** verificación funcional vía `get_page_text`, `read_page` (árbol de accesibilidad), `javascript_tool` (DOM, computed styles, `fetch` directo a APIs), `read_network_requests`, `read_console_messages` y `preview_logs`. Cubre lógica, validaciones, llamadas a API y contenido renderizado real — no cubre verificación visual/pixel-perfect (layout, animaciones, contraste), que queda pendiente de confirmación manual por el usuario o de una sesión futura donde el bug esté resuelto.

**Próximo paso si se retoma:** confirmar del lado del usuario si el panel del Browser pane está realmente abierto/visible en su layout de Claude Desktop en el momento de la falla (posible causa: el panel no es el "activo" dentro de la UI de la app, aun estando la ventana de Claude en foreground a nivel de SO).

### Actualización — el bug es más profundo: los clicks no logran que React actualice el DOM

Verificado en sesión de testing exhaustivo (Gina/formularios): `computer{action:"left_click", ref}` sobre un botón real (cerrar el widget de Gina, `onClick={() => setAbierto(false)}`, sin ninguna lógica de reapertura en el código) **no cierra el widget**. Se probó también disparando el evento nativo directamente vía `element.click()` desde `javascript_tool`, con espera explícita de 1s antes de re-chequear — mismo resultado: el DOM sigue mostrando el estado anterior. Se revisó el código fuente (`GinaWidget.tsx`) y se descartó que sea un bug de producto (no hay ningún efecto que fuerce la reapertura).

Esto sugiere que los re-renders de React no se están **comprometiendo al DOM visible** en esta sesión — coherente con la misma causa raíz que bloquea IntersectanObserver/paint (probablemente ambos dependen del mismo scheduler de rendering interno del `BrowserView`).

**Consecuencia importante para testing futuro:** no se puede confiar en "click en botón → verificar cambio de UI" como método de verificación en sesiones afectadas por este bug, ni siquiera usando `.click()` nativo por DOM en lugar de clicks por coordenada. La navegación entre páginas (`navigate()` a una URL) sí funciona con normalidad — el problema es específico a cambios de estado in-page vía React. `read_page` en cambio SÍ parece reflejar el DOM real correctamente (se había sospechado que devolvía snapshots viejos, pero se confirmó que no — el widget realmente seguía abierto, `read_page` tenía razón).

**Workaround adicional para este caso:** testing funcional vía llamadas directas a los API routes (`fetch()` desde `javascript_tool`, replicando el payload exacto que mandaría el cliente real) en vez de manejar la UI — verifica la misma lógica de servidor sin depender de que el click se refleje visualmente. No reemplaza la verificación de que la UI realmente responde a un click de un usuario real — eso queda pendiente hasta que el bug se resuelva.

**Precisión importante (acota el bug):** el toggle nativo de `<details>/<summary>` (acordeón de FAQ) **sí funciona** con `.click()` — `details.open` cambia correctamente. Esto confirma que el bug es específico al **commit de React al DOM real** (setState → re-render → commit), no un bloqueo universal de interacción del navegador. Comportamiento nativo del motor (details/summary, navegación de links, formularios HTML nativos) funciona con normalidad; lo que falla es cualquier cambio de UI que dependa de que React aplique un nuevo estado.

# Known Issues

Problemas conocidos del entorno/herramientas que no son bugs del producto — se documentan acá para no re-investigarlos de cero en cada sesión.

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

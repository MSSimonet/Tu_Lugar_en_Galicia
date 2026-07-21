# Auditoría técnica hiper profunda — Tu Lugar en Galicia

**Fecha:** 2026-07-16
**Alcance:** producción real (`https://tu-lugar-en-galicia.vercel.app`) + repo completo (`app/`, `lib/`, `components/`, `scripts/`, `supabase/migrations/`, historial de git completo).
**Método:** 4 sub-auditorías en paralelo (Lighthouse/Unlighthouse/SEO/seguridad web; accesibilidad/diseño; código/contenido/lectura línea por línea; auditoría cruzada retrospectiva de agentes) + pruebas end-to-end reales ejecutadas directamente contra producción (Gina, formulario→PDF, Cal.com, Resend).
**Regla dura respetada en las 11 secciones:** ningún código del repo fue editado, borrado ni commiteado. Este documento no está commiteado — es un archivo de trabajo para que decidas qué implementar y cuándo.

---

## Resumen ejecutivo (los 8 hallazgos que más importan)

| # | Severidad | Hallazgo | Sección |
|---|---|---|---|
| 1 | 🔴 Crítico | `lib/plan/armador.ts:152` compara `paisResidencia` contra un valor centinela (`'en_espana'`) que **nadie escribe** desde un refactor posterior (hoy se guarda `'España'`). Resultado: el Plan Estratégico en PDF trata a **todos** los leads como si vinieran del extranjero, incluidos los que ya viven en España. | 11 |
| 2 | 🔴 Crítico | El dominio canónico del sitio (`SITE_URL` en `lib/config/site.ts:9` = `https://tulugarengalicia.com`) **no resuelve — falla DNS**. Ese valor roto alimenta todos los canonical, Open Graph, Twitter Card, JSON-LD y el propio `sitemap.xml`/`robots.txt` reales en producción. | 4 |
| 3 | 🔴 Crítico | **Resend está en modo sandbox** (sin dominio verificado, `RESEND_FROM_EMAIL` no configurada) — confirmado en vivo: Resend rechazó un envío real con `403 "You can only send testing emails to your own email address (tleg.business.web@gmail.com)"`. Esto implica que **cualquier email transaccional real a un cliente que no sea esa dirección probablemente esté fallando silenciosamente en producción hoy** (el código atrapa el error y no bloquea el flujo, así que nadie lo nota desde la UI). | 9.4 |
| 4 | 🔴 Crítico (ya conocido, reconfirmado con evidencia nueva) | ADR-008 dice "Accepted" y `docs/arranque.md` lo lista como vigente, pero **Gina nunca llamó a Gemini**: `lib/ai/` no existe, `GEMINI_API_KEY` no aparece en ningún `.ts`, y el propio comentario de cabecera de `flowEngine.ts` admite ser un "motor puro sin llamadas de IA". | 10 |
| 5 | 🟠 Alto | El schema de Supabase fue diseñado explícitamente para soportar el "derecho al olvido" RGPD, pero **no existe ningún endpoint ni botón en `/admin` que permita borrar un lead**. La promesa de "Supresión" en la política de privacidad no tiene vía de cumplimiento real. | 10 |
| 6 | 🟠 Alto | La navegación de escritorio completa (nav, "Agenda", "Hablar con Gina", toggle de tema) queda **oculta en cualquier viewport menor a 1536px** (`hidden 2xl:flex` en `Header.tsx`) — afecta laptops/monitores de 1280-1440px, las resoluciones de escritorio más comunes del mundo real. | 6 |
| 7 | 🟠 Alto | Origin allowlist duplicado en 5 endpoints, con una copia desincronizada: `/api/lead` es el único que no incluye la entrada de `VERCEL_URL` — el formulario principal de captación (`/conocernos`) responde 403 en cualquier preview de Vercel mientras los otros 4 endpoints funcionan bien desde el mismo preview. | 11 |
| 8 | 🟢 Confirmado positivo | Headers de seguridad, TLS, RLS de las 6 migraciones, sanitización de logs (42/43 casos), y ausencia de enlaces rotos: todo correcto y verificado contra producción real, no solo contra el código. | 1, 5, 10 |

---

## SECCIÓN 1 — PERFORMANCE (Lighthouse)

### Metodología y advertencia de interpretación

Lighthouse CLI corrió con su configuración por defecto: **emulación mobile + throttling "Slow 4G" simulado** (RTT 150ms, ~1.6 Mbps de bajada, CPU 4x más lento). Esto es un *stress test* estándar de la industria, no la experiencia de un usuario promedio en WiFi/4G real — pero es representativo del peor caso (el que más le importa a un emigrante que agenda desde el celular con datos limitados, que es exactamente el público del sitio). Todos los LCP reportados abajo son bajo esas condiciones.

### Tabla comparativa (10 rutas)

| Ruta | Performance | LCP | CLS | TBT | Peso total transferido |
|---|---|---|---|---|---|
| `/` | 76 | 7.0 s | 0 | 90 ms | 3609 KB |
| `/conocernos` | 71 | 6.0 s | 0 | 310 ms | 1036 KB |
| `/comunidad` | 77 | 6.2 s | 0 | 90 ms | 1027 KB |
| `/comunidad/mapa` | 73 | 9.2 s | 0 | 160 ms | 1454 KB |
| `/politica-de-privacidad` | 78 | 5.9 s | 0 | 100 ms | 1025 KB |
| `/ciudades/vigo` | 74 | 6.4 s | 0 | 180 ms | 3855 KB |
| `/ciudades/a-coruna` | 69 | 6.3 s | 0 | 360 ms | 3952 KB |
| `/agenda` | 76 | 6.5 s | 0 | 140 ms | 1116 KB |
| `/contacto` | 74 | 6.0 s | 0 | 180 ms | 1028 KB |
| `/faq` | 78 | 6.0 s | 0 | 80 ms | 1030 KB |

SEO y Best Practices: **100/100 en las 10 rutas**. Accessibility: 96-100. CLS ≈0 en todas — no hay layout shift. INP no se reportó (es una métrica de campo/CrUX; Lighthouse solo da TBT como proxy de interactividad en lab).

### Hallazgos

**[ALTO] Ninguna de las 10 rutas alcanza un Performance score "bueno" (90+); todas caen en 69-78**
Causa raíz común: video como LCP + exceso de fuentes precargadas (ver abajo). No es un bug puntual sino deuda de performance transversal.

**[ALTO] El elemento LCP de la home es un `<video>` (`hero-lanzada.mp4`, 2.3 MB), no una imagen**
- Aunque el `<video>` ya tiene `fetchpriority="high"`, Lighthouse no lo reconoce como "priority hinted" para LCP (esa API está pensada para `<img>`/`<link rel=preload>`, no `<video>`). Desglose de LCP: TTFB 194ms, resource load delay 255ms, resource load duration 152ms, **element render delay 417ms**.
- Mismo patrón en cada página de `/ciudades/*` (video propio de 2.7-3.3 MB cada una) — explica por qué esas páginas pesan 3.6-4 MB de transferencia total vs ~1 MB de las páginas sin video.
- Acción recomendada: usar el poster/imagen estática ya existente como elemento de LCP real (cargarla con prioridad alta y que el video la reemplace tras `loadeddata`), o evaluar si el hero necesita ser video para el público objetivo (conexiones lentas desde Latinoamérica).

**[ALTO] 29 archivos `.woff2` se precargan en TODAS las páginas — 11 familias tipográficas completas cargadas globalmente en `app/layout.tsx`**
- `app/layout.tsx:1-91` importa `Plus_Jakarta_Sans, Cormorant_Garamond, Syne, Nunito_Sans, Fraunces, DM_Sans, Jost, Playfair_Display, Lato, Lora, Work_Sans`, todas aplicadas en el `<html className>`, por lo que Next.js las precarga todas sin importar quién las use. Verificado con `curl -sD`: 29 entradas `rel=preload; as="font"`.
- Los propios comentarios del código (`/* Atlántico Editorial — tipografías (rama design/exploration) */`, etc.) confirman que la mayoría son remanentes de ramas de exploración de diseño nunca limpiadas.
- Acción recomendada: auditar qué familias usa realmente el sistema de diseño vigente (Pedra e Ouro) y eliminar las declaraciones `next/font/google` no usadas.

**[MEDIO] CSS render-blocking: un chunk de 16 KB bloquea el render inicial en todas las páginas**
- Evaluar critical-CSS inlining o code-splitting del CSS no crítico.

**[BAJO] JS no usado: ~24 KB en `/` y ~50 KB en `/comunidad/mapa`** (Leaflet + clustering, coherente con esa página).

**[BAJO] Ninguna imagen sin optimizar servida al cliente** — el pipeline de `next/image` está activo (`/_next/image?...`). Los originales en `public/images/ciudades/` sí son pesados (hasta 7.4 MB sin comprimir) pero solo afecta build/repo, no lo que baja el usuario.

---

## SECCIÓN 2 — UNLIGHTHOUSE (crawl completo)

### Alcance y restricción de seguridad aplicada

Se corrió `unlighthouse-ci --site https://tu-lugar-en-galicia.vercel.app` con `--exclude-urls "/contacto,/conocernos,/comunidad$,/admin.*,/api.*"`. Unlighthouse en modo por defecto **no llena ni envía formularios** — solo sigue `<a href>` y corre un audit Lighthouse pasivo por URL descubierta.

**Nota de transparencia:** el patrón `/comunidad$` se trató como substring, no regex-con-anclaje, así que `/comunidad` (formulario de registro) sí terminó crawleada — 1 de 17 rutas. No viola la restricción (el audit fue igual de pasivo, sin interacción con el formulario), pero se reporta por honestidad metodológica.

**Rutas NO cubiertas y por qué:** `/contacto`, `/conocernos` (excluidas a propósito, formularios); `/admin/*` (requieren sesión); `/comunidad/mapa` (**no descubierta por el crawler** — sin ningún link `<a>` que apunte a ella desde ninguna página pública, ver hallazgo Sección 4; el crawler solo sigue links, así que una página huérfana queda fuera automáticamente).

17 rutas auditadas: `/`, `/agenda`, `/apps-utiles`, `/aviso-legal`, `/ciudades`, `/ciudades/a-coruna`, `/ciudades/lugo`, `/ciudades/pontevedra`, `/ciudades/santiago-de-compostela`, `/ciudades/vigo`, `/como-funciona`, `/comunidad`, `/faq`, `/politica-de-cookies`, `/politica-de-privacidad`, `/sobre-silvana`, `/terminos-y-condiciones`.

### Promedios del sitio (17 rutas)

| Categoría | Score promedio |
|---|---|
| Performance | 77% (rango 68-79) |
| Accessibility | 98% (rango 96-100) |
| Best Practices | 100% |
| SEO | 100% |
| **Score general** | 94% |

LCP promedio: 6.3s · TBT promedio: 75ms · CLS promedio: 0.

### Patrones repetidos

**[ALTO] Contraste de color insuficiente — 3 componentes distintos, 7/17 rutas afectadas**
1. `components/ciudad/VistaEnVivo.tsx` — texto sobre fondo: **ratio 1.09** (mínimo 4.5:1) — texto prácticamente invisible. Afecta las 5 páginas de ciudad. Mismo componente marcado "A13 — Aceptado" en `CLAUDE.md` por ser placeholder sin decisión de producto, pero el problema de contraste en sí **no está resuelto**.
2. `components/home/ElMarcador.tsx` — "EN TIEMPO REAL": **ratio 3.29** (falla 4.5:1). Afecta `/`.
3. `app/como-funciona/ComoFuncionaStepper.tsx` — **ratio 4.33**, a un pelo del mínimo. Afecta `/como-funciona`.

Acción recomendada: ajustar los 3. `VistaEnVivo.tsx` es el más urgente (texto invisible en la práctica) y su fix de contraste es independiente de qué cámara se termine mostrando.

**[MEDIO] `bf-cache` deshabilitado en 17/17 rutas por `Cache-Control: no-store`**
- Causa raíz: `middleware.ts` genera un nonce criptográfico distinto en cada request para la CSP, lo que vuelve dinámica a toda página. Lighthouse marca esto como **"Not actionable"** — es un trade-off consciente (seguridad vía nonce sin `unsafe-inline`, ya documentado como A05). No tocar sin evaluar el trade-off con Security Engineer primero.

**[BAJO] LCP >5.7s en 17/17 rutas** — mismo hallazgo que Sección 1, confirmado a escala de sitio completo.

---

## SECCIÓN 3 — ACCESIBILIDAD

**Limitación de herramienta:** el Browser pane de esta sesión reproduce dos bugs ya documentados en `KNOWN-ISSUES.md` — `computer{screenshot}` da timeout siempre y los clicks reales no logran que React comprometa cambios de estado al DOM (confirmado: un click real sobre el botón hamburguesa no cambió `aria-expanded`). Se usó el workaround documentado: árbol de accesibilidad, `get_page_text`, `javascript_tool` (DOM real, `getComputedStyle`, cálculo manual de contraste WCAG), Tab-key real (que sí funciona) y lectura de código para lógica no disparable por click.

### A3-1 — Video hero autoplay/loop sin mecanismo de pausa (WCAG 2.2.2)
**Alto** · `components/home/HeroPedraEOuro.tsx` y `components/ciudades/CiudadLayout.tsx:84-89`
El `<video autoPlay muted loop playsInline>` de Vigo mide 10s y hace loop infinito, sin ningún botón de pausa/stop/ocultar. Contenido en movimiento automático de más de 5s que se repite indefinidamente sin control es violación directa de WCAG 2.2.2 nivel A.
Acción: agregar control de pausa visible, o respetar `prefers-reduced-motion` (ya existe el patrón en CSS para animaciones, extenderlo al `<video>`).

### A3-2 — `/admin/login` no tiene ningún encabezado
**Medio** · `app/admin/login/page.tsx:65-77`
El título visual "TU LUGAR EN GALICIA — ADMIN" es un `<p>`, no `<h1>`. `document.querySelectorAll('h1,h2,h3')` devuelve `[]`. Un usuario de lector de pantalla navegando por encabezados no tiene nada para orientarse.
Acción: convertir a `<h1>` (o uno visualmente oculto si el diseño no lo permite).

### A3-3 — Contraste insuficiente medido en "El Marcador"
**Medio** · `components/home/ElMarcador.tsx` líneas 44-53 y 143-155
Cálculo manual WCAG, no estimado: etiquetas de 9px dan **~3.2:1**; eyebrow "En tiempo real" (10px) da **~3.3:1** — ambos contra el mínimo 4.5:1. Números grandes (32px bold) sí pasan. Valores hardcodeados (no `var(--color-*)`), idéntico en claro/oscuro (confirmado alternando `.dark`).
Acción: oscurecer el fondo de la tarjeta o aclarar/subir opacidad del texto hasta 4.5:1.

### A3-4 — Carrusel de "El Marcador" en mobile/tablet no alcanzable por teclado
**Medio** · `components/home/ElMarcador.tsx:123-131`
En 375px, las 7 tarjetas se extienden a 1002px dentro de un contenedor `overflow-x: auto` sin `tabindex="0"` ni `role`. Un usuario solo-teclado no puede scrollear para llegar a las últimas estadísticas.
Acción: agregar `tabindex="0"` + `aria-label` descriptivo, o rediseñar sin scroll horizontal en mobile.

### A3-5 — Marcadores de Leaflet con nombre accesible genérico
**Medio** · `/comunidad/mapa`
Cada marcador es `<img role="button" tabindex="0" alt="Marker">` — el default de Leaflet, no personalizado. Un lector de pantalla anuncia "Marker, button" sin info de qué familia/ubicación representa.
Acción: personalizar `alt`/`aria-label` por marcador al crearlo.

### A3-6 — Contenedor del mapa sin rol/nombre accesible
**Bajo** · `.leaflet-container` — `tabindex="0"` pero `role`/`aria-label` nulos.
Acción: agregar `aria-label="Mapa de familias en Galicia"` tras inicializar.

### A3-7 — Nav principal depende solo del anillo de foco por defecto del navegador
**Bajo** · `components/layout/Header.tsx:182-219`
A diferencia del botón hamburguesa y del componente `Button` compartido (que sí definen `focus-visible` de marca), los links del nav no tienen estilo propio. Verificado con Tab real (funciona, no es bug funcional) — es inconsistencia de sistema de diseño.
Acción: aplicar la misma clase `focus-visible:outline-2 ... outline-[var(--color-laton-borde)]`.

### Verificado y correcto (sin hallazgos)
Widget de Gina (cerrado: `aria-hidden` + `inert`, sin trampa de foco); menú móvil (Escape + focus trap correctos, verificado por código); acordeón FAQ (23 `<details>/<summary>` nativos); formulario de diagnóstico (58 controles, todos con label real, incluyendo RGPD; manejo de error con `role="alert"`/`aria-live`); `/contacto` (6 campos, todos con nombre accesible); sin `alt` faltante, sin IDs duplicados, sin `tabindex` positivo; skip link funcional.

### Nota cruzada (no es hallazgo nuevo)
`/politica-de-privacidad` sigue mostrando en producción el texto literal "TODO: completar razón social/dirección/email de protección de datos" — ya trackeado como **A04 (🔴 Crítico)** en `CLAUDE.md`, confirmado vigente.

---

## SECCIÓN 4 — SEO

**[CRÍTICO] El dominio canónico (`SITE_URL` = `https://tulugarengalicia.com`) no resuelve — falla DNS**
- Ubicación: `lib/config/site.ts:9`; consumido por `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx:94` (`metadataBase`), `lib/seo/metadata.ts` (todos los `canonical`), `lib/seo/og.ts`, JSON-LD de `app/page.tsx`.
- Verificación: `curl -v https://tulugarengalicia.com/` → `Could not resolve host`. `openssl s_client` no conecta.
- Impacto real verificado en el HTML de producción: `<link rel="canonical" href="https://tulugarengalicia.com"/>`, `og:url`, `og:image` (imagen tampoco carga porque el dominio no existe), `twitter:image`, JSON-LD `LocalBusiness` con `@id`/`url` rotos.
- `sitemap.xml` real lista las 12 URLs con ese dominio roto — si se envía a Search Console, Google intenta crawlear un dominio inexistente. `robots.txt` apunta al mismo sitemap roto.
- El audit `canonical` de Lighthouse **no detecta esto** (solo valida sintaxis, no que el dominio resuelva) — por eso no salió como fallo automático en Sección 1.
- Acción recomendada (decisión de producto/infra, no solo código): definir si `tulugarengalicia.com` se compra/configura a futuro (y mientras tanto `SITE_URL` debería apuntar al dominio real de Vercel) o si fue un error y hay que corregir ya la constante.

**[ALTO] `/comunidad`, `/comunidad/mapa` y `/contacto` no usan el sistema central de metadata**
- `app/comunidad/page.tsx:4-8`, `app/comunidad/mapa/page.tsx:4-8`, `app/contacto/page.tsx:4-7` declaran su propio `export const metadata` mínimo (solo title+description), sin canonical/OG/Twitter — a diferencia del resto del sitio que usa `getNextMetadata()`.
- Acción: sumarlas a `PAGE_METADATA` en `lib/seo/metadata.ts`, una vez resuelto el hallazgo crítico del dominio.

**[MEDIO] `/comunidad/mapa` es una página huérfana**
- Cero `<a href="/comunidad/mapa">` en todo el sitio (verificado crawleando 20 páginas). Solo se llega vía `router.push()` client-side tras registro exitoso. Tampoco está en el sitemap. Responde 200 y es accesible por URL directa.
- Acción: si se quiere indexable, agregar link visible desde `/comunidad`/nav y sumarla al sitemap.

**[MEDIO] `app/sitemap.ts` solo lista 12 de ~19 rutas públicas reales**
- Faltan `/comunidad`, `/comunidad/mapa`, `/contacto`, `/aviso-legal`, `/terminos-y-condiciones`, `/politica-de-cookies`, `/ciudades` (índice).
- Acción: completar (una vez resuelto el dominio, para no publicar más URLs rotas).

**[BAJO] JSON-LD válido sintácticamente donde existe, sin validación externa contra Google Rich Results**
- 7 bloques (`LocalBusiness`, `Service`, 5×`FAQPage`) parseados con `JSON.parse` sin error. No se pudo validar contra un endpoint público de schema.org sin autenticación en este entorno.

**[BAJO] Enlaces internos rotos: ninguno** — 19 destinos únicos verificados con `curl`, las 19 responden 200.

**[OK] Mobile-friendliness:** viewport correcto en todas las rutas, sin tap-targets problemáticos. **[OK] `robots.ts`:** correcto (bloquea `/api/`, `/_next/`, declara sitemap aunque con URL rota).

---

## SECCIÓN 5 — BEST PRACTICES / SEGURIDAD WEB

### Headers de seguridad reales en producción (`curl -sD -`)

| Header | Valor real | Coincide con código |
|---|---|---|
| `Content-Security-Policy` | nonce + 9 hashes SHA-256, sin `unsafe-inline` en script-src | Sí, `middleware.ts:43-71` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | Sí, `vercel.json:29-31` |
| `X-Frame-Options` | `DENY` | Sí, sin duplicado |
| `X-Content-Type-Options` | `nosniff` | Sí, sin duplicado |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Sí, a propósito solo en `middleware.ts` (no pisa `no-referrer` en rutas admin) |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Sí |
| `X-XSS-Protection` | `1; mode=block` | Solo en `vercel.json`, header deprecado pero inofensivo |

**[BAJO]** `X-XSS-Protection` deprecado — opcional eliminar. **[BAJO]** CSP no declara `frame-ancestors` (redundante con `X-Frame-Options: DENY`, pero es el equivalente moderno — agregarlo no rompe nada).

**[OK]** Sin headers duplicados ni en conflicto entre `middleware.ts` y `vercel.json`.

### HTTPS / certificado
`openssl s_client` → válido. Emisor Google Trust Services (CN=WR1), subject `*.vercel.app`, vigencia 28 jun–26 sep 2026 (ciclo normal de renovación automática, no es alerta).

### Errores de consola
Verificado en `/`, `/comunidad/mapa`, `/ciudades/vigo`, `/agenda` (las 4 de mayor riesgo por integraciones de terceros). **Cero errores/warnings** en las 4.

### `npm audit`
2 vulnerabilidades moderadas, 0 altas/críticas — ambas la misma raíz (`postcss` <8.5.10 dentro de la copia interna de `next`, XSS en su propio tooling de build, no código servido al usuario). Ya evaluado y aceptado como M4 en `CLAUDE.md`, reverificado hoy sin cambios. `fixAvailable` exigiría downgradear `next` a 9.3.3 — no aplicar.

---

## SECCIÓN 6 — DISEÑO Y CONSISTENCIA VISUAL

### A6-1 — Navegación de escritorio oculta por debajo de 1536px
**Alto — el hallazgo de mayor impacto práctico de toda la auditoría**
`components/layout/Header.tsx:179,226` — `className="hidden 2xl:flex"` para el nav Y para el contenedor de "Agenda"/"Hablar con Gina"/toggle de tema. El proyecto usa el breakpoint `2xl` por defecto de Tailwind v4 = **1536px**, sin override.
Confirmado empíricamente en viewport 1280×720: `nav: display none, offsetParent null` / hamburguesa: `display flex, visible`.
**Cualquier laptop o monitor menor a 1536px** (1280×800, 1366×768, 1440×900 — las resoluciones de escritorio más comunes del mundo real) ve el menú hamburguesa de móvil en vez del nav completo, con todos los tamaños táctiles y comportamiento pensados para móvil.
Acción: bajar el breakpoint a `lg:` (1024px) o `xl:` (1280px), estándares de industria. Revisar si `2xl` se eligió para que quepan las 7 entradas del nav — resolver con espaciado/tamaño de fuente en vez de subir el breakpoint tan alto.

### A6-2 — Colores hardcodeados fuera del sistema de tokens en 10 archivos
**Medio** · `HeroPedraEOuro.tsx`, `ElMarcador.tsx` (×3), `CTAFinal.tsx`, `FormularioContacto.tsx`, `TarjetaPerfil.tsx`, `FormularioComunidad.tsx`, `FormMensajePrivado.tsx`, `CiudadLayout.tsx`, `SeccionEmergencias.tsx`, `AgendaPublica.tsx`
`CLAUDE.md` §6 exige solo tokens/Tailwind, pero estos usan hex directos. **Confirmado que rompe modo oscuro**: alternando `.dark` vía JS, el color de la etiqueta de `ElMarcador` no cambia, a diferencia de los textos que sí usan tokens.
Acción: migrar a `var(--color-*)`/`var(--po-*)`, o documentar explícitamente los que son intencionalmente fijos en ambos temas.

### A6-3 — `/admin/login` no usa el componente `Button` ni la escala de `border-radius`
**Medio** · `app/admin/login/page.tsx:91-173`
`borderRadius: '4px'` inline, no coincide con `--radius-card` (8px) ni `--radius-pill` (999px) documentados. El botón "Entrar" no reutiliza `Button.tsx` (que trae `focus-visible` de marca) — depende solo del outline por defecto del navegador.
Acción: reemplazar por el componente `Button` compartido y el radio documentado.

### A6-4 — Carrusel de "El Marcador" sin affordance visual de scroll
**Bajo** · Sin fade/flecha/dots que indiquen que hay 3 tarjetas más fuera de vista en mobile/tablet.

### Ya documentado, confirmado vigente (no recontado)
Divergencia tipográfica Fraunces (documentado) vs. Cormorant Garamond (real, `app/globals.css:62`) — ya registrada en `CLAUDE.md` §9, sigue vigente.

### Verificado y correcto (sin hallazgos)
Sin overflow horizontal en 375px/768px en las 5 páginas principales revisadas; sin clases Tailwind arbitrarias tipo `text-[#...]` (el bug histórico de 28 archivos no reapareció); el hero de home usa mitigación de contraste deliberada sobre el video (scrim, filtro CSS, text-shadow) — técnica correcta aunque no medible en su peor frame por limitación de tooling; componente `Button` bien construido (el problema es que no todos los botones lo usan, ver A6-3).

---

## SECCIÓN 7 — CALIDAD DE CÓDIGO (arquitectura)

### 7.1 Dependencias no usadas (`depcheck`)

| Severidad | Paquete | Detalle |
|---|---|---|
| Medio | `@dnd-kit/sortable` | Sin ningún import — candidato a eliminar o a usar si el Kanban necesita reordenar dentro de columna. |
| Bajo (falso positivo con nota) | `@fontsource/cormorant-garamond`, `@fontsource/plus-jakarta-sans` | Sí se usan, pero vía ruta de archivo cruda en `lib/plan/generarPdf.tsx:24-25`, no `import`. Patrón frágil: un cambio de resolución de `node_modules` (dedupe, pnpm) rompería el PDF en silencio. |
| Medio | `sharp` | Usado en `scripts/create-og-image.mjs` pero **no declarado en `package.json`** — `npm ci` en limpio da `Cannot find module 'sharp'`. Agregar a devDependencies. |

### 7.2 Dependencias desactualizadas
Parche/menor sin riesgo: `@supabase/supabase-js`, `@types/node` (dentro de v20), `@types/react`, `eslint`, `lucide-react`.
Riesgo major (evaluar antes de tocar): `typescript` 5.9.3→7.0.2 (2 majors), `eslint`→10.7.0 (verificar soporte de `eslint-config-next`). Nota: `next-auth` muestra "Wanted 5.0.0-beta.31, Latest 4.24.14" — es un artefacto de cómo npm compara canales beta vs. estable, no una alerta real.

### 7.3 `npm audit` — ver Sección 5, mismo resultado (2 moderadas, raíz conocida y aceptada).

### 7.4 Tamaño de bundle por ruta
**Gap de herramienta:** Next 16.2.10 + Turbopack ya no imprime la tabla clásica "Route/Size/First Load JS". No se pudo obtener el desglose exacto con las herramientas estándar de `next build` en esta versión.
**Hallazgo real detectado igual:** las **41 rutas de `app/` salen `ƒ` (server-rendered on demand)**, incluidas páginas 100% de marketing sin datos dinámicos (`/ciudades/vigo`, `/faq`, `/sobre-silvana`, etc.). Deberían poder prerenderizarse como `○` (estáticas). Candidato: `middleware.ts` (CSP con nonce por-request) o algún layout con `usePathname()` puede estar forzando dinamismo en todo el árbol. **Medio** — impacto de costo (funciones serverless de más) y latencia (sin caché CDN) en las páginas públicas de mayor tráfico.
Proxy razonable de rutas más pesadas por dependencias cliente: `/comunidad/mapa` (Leaflet+clustering), `/admin/dashboard` (Recharts ×3), `/admin/kanban` (`@dnd-kit`), `/admin/leads/[id]` y `/admin/lead/[recordId]` (ficha 360°), `/agenda` (script externo de Cal.com).

### 7.5 Código muerto a nivel arquitectura
324 exports cruzados contra uso real. 44 sin uso externo; 27 son `page.tsx`/`layout.tsx` (falso positivo esperado, Next los importa por convención). De los 17 restantes reales, 16 son tipos/funciones exportados pero solo consumidos dentro de su propio archivo (severidad baja, el `export` es superfluo, no el código). Excepción: **`lib/plan/armador.ts:502` `CASOS_FUERA_DE_ALCANCE`** — no se usa ni siquiera dentro de su propio archivo, es una constante puramente documental sin ninguna rama de lógica que dispare. Confirmar si debería usarse o bajarla a comentario.

*(`AirtableRecord` — ver Sección 8.2, propagación adicional encontrada.)*

### 7.6 Positivos verificados
**0 issues de ESLint** en todo el repo · **0 archivos huérfanos** (154 archivos cruzados) · **0 `console.log`** en código de producción (solo 2 en scripts CLI, aceptable) · `tsc`/build compilan limpios.

---

## SECCIÓN 8 — CONTENIDO

### 8.1 Enlace interno roto
**Medio** · `components/layout/Footer.tsx:11` — el link "Testimonios" apunta a `/#testimonios`, pero ese `id` no existe en ningún elemento (la sección real solo tiene `id="testimonios-heading"` en su `<h2>`). El click navega a `/` sin hacer scroll. Fix: agregar `id="testimonios"` al `<section>` contenedor, o cambiar el link.
Todos los demás links internos (nav, footer, formularios, páginas legales) resuelven correctamente.

### 8.2 Referencias a "Airtable"
Migración a Supabase (Fase 5) completa a nivel funcional — cero llamadas reales a la API de Airtable.

| Ubicación | Clasificación |
|---|---|
| `lib/admin/leadsRepo.ts:17` `interface AirtableRecord` | Nombre heredado ya conocido |
| `app/api/admin/resumen-diario/route.ts` (8 usos), `recordatorio-silvana/route.ts` (3 usos) | **Adicional no señalado antes**: ambos importan y usan `type AirtableRecord` — el nombre se propagó a 3 archivos, no 1. Irrelevante funcionalmente, pero relevante si algún día se decide renombrar. |
| `.env.local.example`, `lib/leads.ts:5`, `lib/admin/leadsRepo.ts:4,159-160` | Comentarios históricos legítimos, correctos |

### 8.3 TODO/FIXME/placeholder de cara al usuario
Confirmado sin novedad sobre lo ya trackeado (`CLAUDE.md` A04, A13, A14): política de privacidad con 4 `TodoBlock` visibles en producción; imagen de Silvana y 3 avatares de testimonios vía `placehold.co`; `VistaEnVivo.tsx` placeholder aceptado.
No listados antes explícitamente: `components/home/FeedInstagram.tsx:1` (`// TODO Fase 2: reemplazar con widget Behold`, el feed de Instagram hoy es estático) y `MuroLlavesPreview.tsx:54` (`// TODO Fase 2: crear página /muro-de-llaves`). Sin lorem ipsum literal en ningún archivo.

### 8.4 URLs de ejemplo/dummy
Sin URLs dummy nuevas más allá del ya conocido. Detalle: el comentario en `lib/config/site.ts:2` ("Reemplazar con la URL real de Silvana") sigue ahí, pero el **valor** ya no es el placeholder genérico — `CalEmbed.tsx` hoy pasa su chequeo `isConfigured`, es decir el widget se intenta cargar de verdad. Falta confirmar con el negocio si `tu-lugar-en-galicia/reunion` es la cuenta real de Silvana funcionando (confirmado en Sección 9.3 de este mismo informe: **sí es real** — se hizo y canceló una reserva de prueba contra ella).

---

## SECCIÓN 9 — PRUEBAS FUNCIONALES END-TO-END REALES

Todas las pruebas de esta sección se ejecutaron directamente contra producción real (`https://tu-lugar-en-galicia.vercel.app` + Supabase + Cal.com + Resend reales), no contra un entorno de test.

### 9.1 — Gina: 10 corridas completas

Se armaron 10 perfiles variando documentación (español, UE, residencia aprobada, en trámite ×2, nacionalidad en trámite/"pareja de español" ×2, turista ×2), hijos (con/sin), mascotas (sin/perro/gato/ambas), plazos, las 5 ciudades + indiferente, y un caso deliberado de "sin garantías + bajos ingresos" para probar la rama `lead-en-preparacion`. Emails `test-auditoria-01..10@tulugarengalicia.test`.

**Nota metodológica:** el rate limiter real de `/api/gina` (60 req/10min por IP, ya confirmado funcionando en la sesión de rotación de credenciales) cortó el primer intento a mitad de camino — se corrigió el driver para reintentar con backoff de 65s en vez de abortar, y se relanzó. Esto en sí mismo es una confirmación positiva más de que el rate limiter funciona correctamente bajo carga sostenida real.

**Las 10 corridas completaron.** Tabla final, con datos confirmados por query directa a la tabla `leads` en Supabase (no solo por la respuesta de la API):

| # | Perfil | Resultado | Documentación | Ingresos | Garantías | Calificación | Etiqueta |
|---|---|---|---|---|---|---|---|
| 01 | Sin visado, con hijos, Vigo, <1 mes | ✅ Completa (32 pasos) | `en-tramite` | 2500-4000 | seguro-impago | `bajo` | `seguimiento-futuro` |
| 02 | Residencia aprobada, sin hijos, A Coruña | ✅ Completa (29 pasos, tras 2 reintentos por 429) | `residencia-aprobada` | mas-4000 | aval-bancario | `potencial` | `califica` |
| 03 | "Pareja de español" (nacionalidad en trámite), con hijos, Santiago, ya en España | ✅ Completa (35 pasos) | `nacionalidad-en-tramite` | 1500-2500 | avalista | `bajo` | `seguimiento-futuro` |
| 04 | Turista, sin hijos, sin fecha, Pontevedra | ✅ Completa (31 pasos) | `turista` | menos-1500 | garantia-adicional | `bajo` | `seguimiento-futuro` |
| 05 | Española/o, con hijos, Lugo, ya en España | ✅ Completa (29 pasos) | `espanol` | 2500-4000 | ninguna | `en-desarrollo` | `seguimiento-futuro` |
| 06 | UE, sin hijos, ciudad indiferente, <1 mes | ✅ Completa (30 pasos) | `ue-otro` | mas-4000 | aval-bancario | `potencial` | `califica` |
| 07 | En trámite, con hijos + perro, Vigo | ✅ Completa (36 pasos) | `en-tramite` | 1500-2500 | seguro-impago | `bajo` | `seguimiento-futuro` |
| 08 | Residencia aprobada, sin hijos + gato, A Coruña | ✅ Completa (31 pasos) | `residencia-aprobada` | 1500-2500 | avalista | `en-desarrollo` | `seguimiento-futuro` |
| 09 | Turista, con hijos, sin garantías + bajos ingresos | ✅ Completa vía rama `lead-en-preparacion` (19 pasos, terminó en `despedida_preparacion` — por diseño, no llega a `atribucion`) | `turista` | menos-1500 | ninguna | `bajo` | **`lead-en-preparacion`** |
| 10 | "Pareja de español" caso 2, sin hijos + perro y gato, Lugo, ya en España | ✅ Completa (36 pasos) | `nacionalidad-en-tramite` | mas-4000 | garantia-adicional | `bajo` | `seguimiento-futuro` |

**Verificado en las 10 corridas:** guardado correcto en Supabase en el 100% de los casos, incluyendo la rama combinada de mascotas (perfil 10, `mascota_tipo: ["perro","gato"]` guardado correctamente como array) y la rama de salida temprana `lead-en-preparacion` (perfil 09, diseñada a propósito para probarla: sin garantías + ingresos de riesgo → etiqueta `lead-en-preparacion` en vez de llegar a `atribucion`, exactamente como especifica `flowEngine.ts`). Sin datos alucinados en ningún campo comparado contra las respuestas enviadas.

**Único resultado que vale la pena marcar para que lo mires vos, no un bug de mi prueba:** perfil 10 tiene ingresos altos (`mas-4000`) y sí aportó una garantía (`garantia-adicional`), pero salió `calificacion: bajo` — más bajo que perfiles con menos ingresos pero mejor documentación (ej. perfil 02, `residencia-aprobada` → `potencial`). Consistente con que `documentacion: nacionalidad-en-tramite` pesa fuerte en el motor de scoring (`lib/gina/scoring.ts`) independientemente del ingreso — puede ser la regla de negocio correcta (un trámite migratorio no resuelto es más riesgo que la solvencia económica) o puede valer la pena que lo confirmes con Silvana si es el comportamiento esperado.

**Nota de higiene de datos:** por una particularidad del primer intento fallido del driver (el proceso no murió del todo pese a que su log se cortó), quedaron **2 leads duplicados para el perfil 01** (mismo email, ambos completos y con el mismo scoring — no es un bug de la app, es un artefacto de mi propio tooling de prueba) y **1 lead incompleto abandonado para el perfil 02** (`8951678c…`, etiqueta `incompleto` — es en sí una prueba realista extra no planeada de "qué pasa si alguien abandona Gina a medio camino y reintenta con el mismo email": Supabase lo permitió sin error, consistente con que `email` no es `unique` por diseño). Recomiendo borrar estos leads de prueba junto con el resto al cerrar la auditoría.

### 9.2 — Formulario de diagnóstico → PDF del plan estratégico

Email `test-auditoria-form@tulugarengalicia.test`. Flujo completo probado de punta a punta contra producción:

1. `POST /api/lead` → `200 {"success":true}`
2. Lead confirmado en Supabase: `calificacion: "bajo"`, `etiqueta: "seguimiento-futuro"` (coherente con el perfil enviado: documentación en trámite, sin cuenta bancaria, presupuesto medio).
3. Token admin HMAC generado y `GET /api/plan/{id}/pdf?token=...` → `200 application/pdf`, 51.246 bytes, header `%PDF-1.3` válido.
4. **Contenido del PDF extraído y verificado contra los datos originales, sin alucinaciones**: "Preparado para Auditoria Formulario", "Destino: Vigo · Plazo: 1 a 3 meses", "tu camino empieza aquí mismo, en Argentina", "tu situación laboral (teletrabajo para empresa extranjera)", "tu presupuesto máximo... es de 1.000–1.400 €/mes", "podrías aportar: seguro de impago" — todo coincide exactamente con lo enviado. Ningún dato inventado.
5. Falso positivo descartado: la primera extracción con `pdftotext` mostró caracteres corruptos (`Galicia � 16 de julio`); se confirmó que era un problema de encoding de mi herramienta de extracción (`pdftotext` sin `-enc UTF-8`), no del PDF real — con la codificación correcta el texto sale limpio (`Galicia · 16 de julio de 2026`).

Copia del PDF guardada en el scratchpad de esta sesión (`plan-auditoria-form.pdf`) — decime si la querés en algún otro lado.

### 9.3 — Agenda (Cal.com), flujo completo real

**Limitación de tooling encontrada y documentada, no forzada:** el iframe embebido en `/agenda` nunca cargó en el Browser pane de esta sesión — reproduce exactamente el bug ya documentado en `KNOWN-ISSUES.md` (screenshot con timeout a 30s, cero requests de red a `cal.com` tras 8+ segundos de espera). Navegando **directo** a `cal.com/tu-lugar-en-galicia/reunion` (fuera del iframe embebido) sí funcionó con normalidad.

Confirmado que la URL de Cal.com configurada en `lib/config/site.ts` **es una cuenta real y funcional** de Silvana (`tleg.business.web@gmail.com` aparece como anfitrión real):

- **Reserva creada:** jueves 16 de julio de 2026, 9:00–11:00 a.m. (hora Argentina) / `2026-07-16T12:00:00Z`–`14:00:00Z`. Timestamp de creación (`DTSTAMP` del ICS real): `2026-07-16T06:01:00Z`.
- **Cancelada:** `2026-07-16T06:03:20Z` (~2 min 20s después), con motivo registrado: "Prueba tecnica de auditoria E2E — reserva de prueba, se cancela inmediatamente por diseño".
- Invitado: `marcelosurfshark@gmail.com` (autorizado explícitamente por vos para esta prueba puntual).
- Confirmado en pantalla: "Este evento se canceló" — sin ambigüedad.

Esto valida que la infraestructura real de reserva (Cal.com, Google Meet, notificación de calendario) funciona correctamente de punta a punta. Lo que **no** se pudo probar por la limitación de tooling de arriba es el flujo completo integrado (código de agenda → `/agenda?code=` → iframe embebido → webhook `/api/webhooks/calcom` actualizando el lead en Supabase) — sí se generó un código real vía `habilitar-agenda` (`RPG3JEI1`) y la página `/agenda?code=RPG3JEI1` cargó y pasó la validación del código (renderizó el layout normal en vez de un error de código inválido), pero el iframe en sí nunca llegó a montarse para completar la reserva *a través* de ese flujo integrado.

### 9.4 — Reenvío de PDF por email (prueba de infraestructura)

**Bloqueo real, no un error de mi prueba:** esta funcionalidad **no existe en el producto todavía**. Confirmado en `lib/gina/flow.json:581-583` — el mensaje de despedida con envío por email está literalmente marcado `_texto_futuro_email`, comentado como "Etapa 3, cuando el sistema de envío... esté construido". No hay ningún endpoint ni soporte de adjuntos en `lib/admin/email.ts`.

Con tu autorización, se hizo en su lugar una **prueba de infraestructura**: enviar el PDF real de 9.2 como adjunto vía la API de Resend directamente, usando la misma `RESEND_API_KEY` que usa la app, a `marcelosurfshark@gmail.com`.

**Resultado — hallazgo crítico no buscado (ver también resumen ejecutivo, #3):**
```
403 validation_error
"You can only send testing emails to your own email address (tleg.business.web@gmail.com).
To send emails to other recipients, please verify a domain at resend.com/domains..."
```
La cuenta de Resend está en **modo sandbox** (sin `RESEND_FROM_EMAIL` configurada, sin dominio verificado, cae al fallback `onboarding@resend.dev`). Esto significa que **cualquier email transaccional real de la app a un cliente que no sea `tleg.business.web@gmail.com` probablemente esté fallando en producción ahora mismo** — y el código lo atrapa silenciosamente (ver el `"warning":"Código generado pero el mail no pudo enviarse"` que ya se observó en la prueba de 9.3, que en ese momento atribuí solo al dominio `.test` del email de prueba, pero esta prueba confirma que la causa real y más grave es el sandbox de Resend, que bloquearía igual a un cliente real con un email real). Acción recomendada (no implementada, decisión de negocio/infra): verificar un dominio propio en Resend y configurar `RESEND_FROM_EMAIL` antes de que haya clientes reales dependiendo de estos emails.

No se envió ningún otro email de prueba a otras direcciones para evitar seguir estirando la autorización puntual que diste para `marcelosurfshark@gmail.com`.

### 9.5 — Notificaciones internas disparadas hacia el email de admin

**Resultado: 0 emails se dispararon hacia Silvana/admin como efecto directo de las pruebas de 9.1/9.2.** Verificado en código: ni `app/api/gina/route.ts` ni `app/api/lead/route.ts` llaman a `sendEmail()` en ningún punto — ambos solo escriben en Supabase. Las únicas rutas que notifican al admin (`/api/admin/resumen-diario`, cron diario 07:00 hora España; `/api/admin/recordatorio-silvana`, GitHub Action horaria) no se invocaron manualmente durante esta auditoría.

**Aviso importante para Silvana, igual:** los ~13 leads de prueba (`test-auditoria-*@tulugarengalicia.test`) que quedaron en la tabla `leads` real van a aparecer mezclados con leads reales en el **próximo resumen diario automático** (la próxima vez que corra el cron de las 07:00 hora España), agrupados según su calificación real. No es un email extra — es el mismo email de siempre, pero con datos de prueba adentro hasta que se limpien. Recomiendo borrar los leads de prueba antes de la próxima corrida del cron, o avisarle a Silvana que los ignore si ya salió.

---

## SECCIÓN 10 — AUDITORÍA CRUZADA DE AGENTES

**Método:** `git log`/`git show`/`git blame` sobre el historial completo (300+ commits), lectura de toda la documentación de arquitectura y las 6 migraciones de Supabase contra el código real. Solo lectura.

### 1. Security Engineer revisa a Backend Architect / Database Optimizer

**1.1 🟡 Medio** — `merge_campos_custom` (migración 0006): el `revoke ... from anon, authenticated` no cierra el privilegio `EXECUTE` que Postgres otorga a `PUBLIC` por defecto en toda función nueva (a diferencia de las tablas, que no reciben grant a `PUBLIC`). En la práctica **no permite escribir datos igual**: la función es `language sql` sin `SECURITY DEFINER`, así que el `UPDATE leads` interno corre con los privilegios de quien invoca, y `anon`/`authenticated` nunca tuvieron `UPDATE` en `leads` (lo bloquea la migración 0004 un nivel más abajo). Hallazgo de higiene válido igual — el comentario del propio archivo 0006 sugiere una garantía que en realidad da otra migración, no él mismo.

**1.2 ✅ Sin hallazgo** — `campos_custom` jsonb sí se valida en el borde (`clave` debe existir en `campos_custom_definiciones`, `valor` se tipa según definición). No hay una segunda vía de escritura sin pasar por esa validación.

**1.3 ✅ Sin hallazgo** — el trigger de `lead_actividad` solo bloquea `UPDATE`, no `DELETE` — permite correctamente el `ON DELETE CASCADE` RGPD, diseño consistente con lo documentado.

**1.4 🟢 Bajo** — `findLeadByEmail` usa `.ilike()` con el email del webhook de Cal.com sin escapar wildcards (`%`, `_`). Mitigado en la práctica por la verificación de firma HMAC que corre antes, pero es defensa en profundidad incompleta.

**1.5 🟠 Alto** — el schema está listo para el derecho al olvido RGPD, pero cero endpoint lo ejecuta (ver 4.1, mismo hallazgo desde el ángulo Legal).

### 2. Reality Checker revisa certificaciones previas

**2.1 🔴 Crítico** (ya sospechado, confirmado con evidencia de código nueva) — ADR-008 "Accepted" pero Gemini nunca se integró: `lib/ai/` no existe, cero coincidencias de `GEMINI_API_KEY`/`GoogleGenerativeAI` en TypeScript, y `flowEngine.ts` admite en su propio comentario de cabecera ser "motor puro sin llamadas de IA". `docs/arranque.md` (la fuente de handoff obligatoria de `CLAUDE.md` §8) lo sigue listando como estado vigente.

**2.2 🟡 Medio** — "el proyecto ya no usa Airtable en ningún código" es cierto funcionalmente, pero el nombre `AirtableRecord` persiste como tipo canónico en 3 archivos (ver Sección 8.2) — una afirmación absoluta que no captura ese matiz.

**2.3 🟡 Medio** — `docs/arranque.md` dice "Actualizado 2026-07-04" pero son 12 días y ~2 fases de trabajo real después (NextAuth, migración completa a Supabase, Dashboard, Kanban, campos custom, retiro de Airtable, rotación de credenciales de hoy) — el propio mecanismo de "leer esto antes de actuar" depende de un documento desalineado.

**2.4 ✅ Sin hallazgo** — TTL de token admin (24h, A15) se sostiene, verificado en código.

**2.5 ✅ Sin hallazgo** — `docs/comunidad-de-acogida.md` documenta honestamente 2 gaps de seguridad como "sin fix" — verificado que efectivamente no tienen fix aplicado. Patrón correcto de honestidad, sin contradicción.

### 3. Code Reviewer revisa a Frontend Developer

**3.1 🟡 Medio** — 4 convenciones distintas de mutación de datos coexisten sin capa compartida: Gina (`useState` + `localStorage` manual), Kanban (`fetch` directo + rollback optimista manual, divergencia autodocumentada), Ficha 360° (hook compartido `useAdminAction`), Comunidad (único componente que llama a Supabase directo desde el cliente, sin pasar por `/api`). Ninguna es incorrecta aislada, pero no hay capa de datos compartida entre paneles de fases distintas.

**3.2 ✅ Sin hallazgo** — la convención visual (`style={{}}` inline + tokens `var(--po-*)`) sí es consistente entre fases distintas (Kanban y Comunidad).

**3.3 🟢 Bajo** — manejo de estado de error visualmente distinto entre 3 componentes (forma, no bug).

### 4. Legal Compliance Checker — ciclo de vida completo del dato personal

**4.1 🟠 Alto** — "Supresión (derecho al olvido)" prometido en la política de privacidad, sin ningún endpoint/botón de borrado en `/admin`. La única vía real es un `DELETE` SQL manual fuera de la aplicación.

**4.2 🟡 Medio** — retención "máximo 5 años" prometida, sin ningún cron/job que la aplique (revisado `vercel.json` y `.github/workflows/` — solo existen los crons de resumen/recordatorio, ninguno de purga).

**4.3 🟢 Bajo** — "Última actualización: mayo 2026" hardcodeado en la política de privacidad pese a 2 ediciones de contenido reales en julio (`5ce9365`, `f0dd9bc`).

**4.4 ✅ Sin hallazgo** — 42 de 43 `console.error`/`warn` en `app/`+`lib/` sanean correctamente PII (patrón `err.name`, nunca email/nombre crudo).

**4.5 🟡 Medio** — la excepción: `app/api/admin/resumen-diario/route.ts:382` loguea el objeto `err` completo, no `err.name` — quedó fuera del barrido de saneamiento A02 (que cubrió calcom webhook + gina retry, no este archivo). Riesgo real hoy acotado (el único dato en ese `try` es `codigoAgenda`, no PII), pero es un hueco real en una afirmación de "logs saneados" presentada como completa.

**4.6 ✅ Sin hallazgo** — la política de privacidad refleja correctamente el retiro de Airtable de hoy, sin residuos.

**4.7 🔴 Crítico** (ya conocido, reconfirmado) — TODO sin completar en producción (A04).

### 5. Database Optimizer revisa las 6 migraciones como conjunto

**5.1 ✅ Sin hallazgo** — el orden 0001→0006 es ejecutable de punta a punta sobre una base nueva, sin referencias hacia adelante.

**5.2 🟡 Medio** — mismo hallazgo que 1.1 desde el ángulo de conjunto: de las 6 migraciones, 0006 es la única que opera sobre una función (el único tipo de objeto con grant a `PUBLIC` por defecto) y la única que no incluye el `revoke ... from public` correspondiente — el patrón de seguridad de las otras 5 no se replicó correctamente en el único caso con semántica distinta.

**5.3 ✅ Sin hallazgo** — nada quedó huérfano entre 0001/0002/0003 (0003 es una reaplicación idempotente y aditiva del grant de 0002 que no llegó a aplicarse la primera vez en producción).

**5.4 🟢 Bajo** — ninguna migración usa transacciones explícitas, y su aplicación real es manual (pegar en el SQL Editor del dashboard) — **no es una preocupación teórica**: es la causa raíz ya documentada del incidente real 0002/0003 (el grant "no quedó aplicado" en producción, dejando el mapa público roto hasta que se detectó).

### Qué no se pudo rastrear o verificar
La rotación de credenciales de hoy no deja rastro en git (vive en Vercel/`.env.local`); el estado real de RLS/grants en la Supabase de producción viva (sin credenciales en el entorno de este agente — aunque sí las tuve yo en el resto de esta auditoría); si los commits de hoy ya están desplegados en Vercel (sí lo están, confirmado en la sesión de rotación de credenciales, pero este agente en particular no tenía ese contexto).

---

## SECCIÓN 11 — LECTURA LÍNEA POR LÍNEA Y CANDIDATOS A LIMPIEZA

**Alcance cubierto:** ~34 de 154 archivos `.ts`/`.tsx` leídos línea por línea o casi completos — priorizados por impacto de negocio: `lib/leads.ts`, todo `lib/admin/*` (12 archivos), todo `lib/gina/*` salvo `flow.json`, todo `lib/comunidad/*`, `lib/utils/*`, 6 endpoints de `app/api/*`. El resto se cubrió con lecturas dirigidas + herramientas automáticas sobre el 100% del árbol (`depcheck`, `eslint`, cruce export↔import, grep exhaustivo).

### 🔴 CRÍTICO

**`lib/plan/armador.ts:152`** (función `vieneDeFuera`) — lógica de negocio rota con efecto real en un entregable de cara al cliente.

```ts
function vieneDeFuera(r: RespuestasLead): boolean {
  return r.paisResidencia !== 'en_espana'
}
```

El comentario de `armador.ts:22-27` afirma que `paisResidencia === 'en_espana'` es "la forma correcta de detectar que la persona ya reside en España" — ya no es cierto. Los dos únicos puntos de escritura de `paisResidencia` en todo el repo (`app/api/gina/route.ts:356-361` y `app/api/lead/route.ts:357`) guardan el string `'España'` (con mayúscula, sin guion bajo), no `'en_espana'` — cambio hecho a propósito en un refactor posterior ("usamos `origenResidencia` como decisor para evitar guardar los valores sentinel del flujo", según el propio comentario de `gina/route.ts`), pero `armador.ts` no se actualizó cuando eso pasó.

**Resultado: `vieneDeFuera()` devuelve `true` siempre, para el 100% de los leads**, incluidos los que ya viven en España. El PDF del Plan Estratégico (`/api/plan/[recordId]/pdf`) siempre toma la rama "viene de fuera" — un lead que ya vive en España recibe pasos de llegada/visado que no le corresponden.

La forma correcta ya existe en otro punto del mismo repo: `lib/admin/inboxRepo.ts:119` → `esNacional: lead.modalidad === 'ya-en-espana'`. Sugerencia: pasar `modalidad` (o un booleano ya resuelto por el caller) a `armarPlan()`/`vieneDeFuera()` en vez de re-derivarlo de `paisResidencia`.

### 🟠 ALTO

**Origin allowlist duplicado 5 veces, con una copia desincronizada** — `app/api/lead/route.ts:74-78`, `app/api/gina/route.ts:66-71`, `app/api/contacto/route.ts:31-36`, `app/api/comunidad/registro/route.ts:55-60`, `app/api/comunidad/mensaje/route.ts:34-39`.

Los 5 endpoints repiten el mismo bloque de ~15 líneas. 4 de 5 incluyen `process.env.VERCEL_URL && \`https://${process.env.VERCEL_URL}\`` — **`app/api/lead/route.ts` es el único que no la tiene**. Efecto concreto: en un deploy de preview de Vercel, el formulario de `/conocernos` responde 403 "Origen no permitido" mientras Gina/contacto/comunidad funcionan bien desde el mismo preview — "funciona en producción, está roto en el link de preview que le mandé al cliente para revisar". Sugerencia: extraer a un helper compartido `lib/utils/origin.ts` → `isAllowedOrigin(req)`.

### 🟡 MEDIO

1. **Validación de email duplicada e inconsistente en 4 lugares** (`contacto`, `comunidad/registro`, `comunidad/mensaje`, `useFormulario.ts`) con regex laxo (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, acepta TLD de 1 char), mientras `lib/validation.ts` ya exporta `EMAIL_REGEX` más estricto que solo usa `/api/lead`. Consolidar sobre `lib/validation.ts`.

2. **`lib/utils/ip.ts:14-25`** (`getRealIp`) — el propio docstring advierte que confiar en `X-Forwarded-For` sin validar permite evadir el rate limiting, y el código lo hace igual como fallback cuando falta `cf-connecting-ip` (que falta si alguien pega directo al dominio `*.vercel.app` sin pasar por Cloudflare). Riesgo real dado que hoy hay stack Cloudflare-delante-de-Vercel. Sugerencia: bloquear acceso directo al dominio de Vercel, o tratar la ausencia de `cf-connecting-ip` como IP anónima en vez de confiar en XFF.

3. **Identificador con homoglifos cirílicos** — `lib/plan/generarPdf.tsx:445,558`: el componente `BloqueTramiте` usa "т"/"е" cirílicas (U+0442/U+0435) en vez de latinas. Compila y corre bien (consistente internamente) pero es visualmente indistinguible del tipo `BloqueTramite` (100% latino) que recibe como prop — un grep de texto plano por "BloqueTramite" no lo encuentra. Renombrar a ASCII puro.

4. **`lib/gina/scoring.ts:43`** — compara `documentacion === 'estancia-estudios'`, valor que no existe en ningún union real del repo (`ScoringInput.documentacion` está tipado `string` genérico, por eso TypeScript no lo detecta). La regla "cap a en-desarrollo para estancia por estudios" nunca se aplica — rama muerta, o falta un valor real que debería mapear a esto.

5. **Estilo de comillas/`;` inconsistente aislado a `app/page.tsx` y `app/layout.tsx`** (comillas dobles + `;`) vs. el resto del repo (comillas simples, sin `;`). ESLint no lo marca porque `eslint-config-next` no trae esas reglas activadas.

6. **`lib/plan/armador.ts:502`** `CASOS_FUERA_DE_ALCANCE` — constante puramente documental sin ningún consumidor (ver Sección 7.5).

### 🟢 BAJO

7. **`app/api/lead/route.ts:47`** — `const COMMON_HEADERS = {}` se spread en cada respuesta pero es un objeto vacío. Resto de un header que se sacó sin limpiar la variable.

8. **`lib/admin/codes.ts:10-15`** (`generateAgendaCode`) — mapea byte aleatorio (0-255) a alfabeto de 36 chars con `% 36`; como 256 no es múltiplo de 36, hay ~12% de sesgo hacia los primeros 32 caracteres. No explotable en la práctica para un código de un solo uso de 8 caracteres, pero `crypto.randomInt(0,36)` lo eliminaría sin costo.

9. ~15 exports "solo consumidos internamente" (tipos y una función, ver Sección 7.5) y la propagación de `AirtableRecord` a 2 archivos más (Sección 8.2) — agrupados acá para no duplicar detalle.

### Positivos verificados
0 issues de ESLint · 0 archivos huérfanos · 0 `console.log` en producción · documentación inline inusualmente completa en `lib/admin`, `lib/gina`, `lib/comunidad`.

### No cubierto en esta pasada (honesto, por límite de tiempo/alcance)
`components/gina/*` (solo grep puntual), `FormularioDiagnostico.tsx` (688 líneas, el archivo más grande del repo), `components/admin/*` completo (kanban/ficha/dashboard/inbox), todas las páginas `app/admin/*`, la mayoría de `app/api/admin/*` (campos-custom, expirar-codigos, habilitar-agenda, leads/[id]/*, pipeline/*), `lib/seo/*`, `lib/config/appsUtiles.ts`, `lib/gina/flow.json` (el archivo de datos del cuestionario en sí), y verificación en vivo de enlaces externos (Facebook, Instagram, AEPD, OpenStreetMap — se asume correctos por convención, no confirmado con request real). Tamaño exacto de bundle por ruta — gap de la propia herramienta `next build` con Turbopack en Next 16.2.10 (ver Sección 7.4).

---

## Cierre — qué hacer con este documento

Este archivo **no está commiteado**. Es un documento de trabajo con 8 hallazgos críticos/altos de impacto real (resumen ejecutivo arriba) y ~45 hallazgos adicionales de severidad media/baja, todos con ubicación exacta y acción recomendada — sin que se haya implementado ninguno. La siguiente sesión debería:

1. Decidir con vos el orden de prioridad (sugerido: #3 Resend sandbox y #1 armador.ts primero, por impacto directo en clientes reales; #2 dominio SEO roto y #6 nav oculto en desktop después, por visibilidad/alcance; el resto por categoría).
2. Limpiar los 13 leads de prueba (`test-auditoria-*@tulugarengalicia.test`) de Supabase antes del próximo resumen diario a Silvana (ver 9.5) — 10 corridas de Gina + 2 duplicados/incompletos de prueba (perfil 01 ×2, perfil 02 abandonado) + 1 del formulario.

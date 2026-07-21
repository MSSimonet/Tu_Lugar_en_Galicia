# /design-drafts — Fase 2: exploración radical de diseño

12 direcciones visuales aisladas, independientes del código real (HTML autocontenido,
Tailwind vía CDN solo para estas páginas de prueba + GSAP vía CDN para animación).
Ninguna toca `/app`, `/components` ni `app/globals.css`. Se puede abrir cada
`index.html` directo en el navegador.

Ninguna reutiliza paleta, tipografía ni tratamiento de los 5 sistemas ya existentes
en el proyecto (ver `DESIGN-BACKUP.md`): ni Pedra e Ouro (dorado/Playfair+Lato), ni
Atlántico Editorial (Jost+DM Sans), ni Mar Abierto (teal/Syne+Nunito), ni Apps Útiles
(Lora+Work Sans), ni el sistema laton/atlántico documentado (Fraunces+Plus Jakarta).
Tampoco se repite paleta/tipografía entre ninguna de las 10 direcciones nuevas.

> ⭐ **Guardadas por el usuario:** Dirección A (Néboa Nocturna), D (Camelia en
> Invernada) y E (Cantiga de Taberna) — candidatas confirmadas.

---

## ⭐ A — Néboa Nocturna (`direccion-a-neboa-nocturna/`)

Galicia de noche: faros, tormentas atlánticas, ferris. Fondo casi negro,
un único acento eléctrico (lima) como haz de faro. Técnico pero cálido en el
detalle. El más audaz de los tres en contraste.

- **Paleta:** `#0B0D12` (vacío) · `#14171F` (tinta) · `#C6FF3D` (acento lima) · `#6E7BFF` (señal violeta)
- **Tipografía:** Space Grotesk (display) + Inter (UI) + IBM Plex Mono (etiquetas/datos)
- **Animación:** barrido de faro en el hero, glow magnético en CTAs, blur→foco al hacer scroll, tarjetas con tilt 3D sutil

## B — Cerámica de Sargadelos (`direccion-b-ceramica-sargadelos/`)

Loza gallega: cobalto y blanco, motivos pintados a mano, calidez artesanal
en vez de fotografía. El más cálido y juguetón de los tres.

- **Paleta:** `#1B4F8C` (cobalto) · `#FBFAF6` (loza) · `#C1522E` (terracota) · `#6B7A3A` (oliva)
- **Tipografía:** Bitter (display, slab serif) + Karla (UI)
- **Animación:** trazos de patrón que se dibujan al hacer scroll, tarjetas con "bamboleo" cerámico, subrayados a mano alzada en hover

## C — Hórreo Brutalista (`direccion-c-horreo-brutalista/`)

El hórreo y la piedra de granito: estructura expuesta, honestidad de
materiales, un solo color de choque (óxido). El más crudo y editorial.

- **Paleta:** `#1A1A18` (granito) · `#C9C6BE` (hormigón) · `#D6461F` (óxido) · `#4A5240` (musgo)
- **Tipografía:** Anton (display, condensada de impacto) + Archivo (UI)
- **Animación:** bloques que entran con corte duro (sin ease suave), sombras offset tipo cartel serigrafiado, inversión instantánea de color en hover de CTA

## ⭐ D — Camelia en Invernada (`direccion-d-camelia-en-invernada/`)

Camelias de los pazos gallegos, floreciendo en pleno invierno. Elegante,
sereno, casi de hotel boutique — el más delicado y menos urgente de los cinco.

- **Paleta:** `#E8EDE6` (niebla) · `#2F3D30` (musgo) · `#7A1F3D` (camelia, vino profundo) · `#FBF7F0` (marfil)
- **Tipografía:** Newsreader (display, serif editorial itálica) + Manrope (UI)
- **Animación:** aparición lenta tipo floración (sine.out, sin prisa), formas botánicas difuminadas de fondo, panel de Gina se abre con un giro suave tipo pétalo

## ⭐ E — Cantiga de Taberna (`direccion-e-cantiga-de-taberna/`)

Tabernas gallegas, luces cálidas, cantigas de noche. Cálido, social, nocturno
pero acogedor — el opuesto exacto de la frialdad técnica de Néboa Nocturna.

- **Paleta:** `#241512` (noite) · `#D9A62E` (mostaza) · `#6B1E23` (viño) · `#2C6E8E` (azulejo)
- **Tipografía:** Spectral (display, serif cálida) + Figtree (UI)
- **Animación:** puntos de luz parpadeantes en el hero (como velas), glow tipo farol en el widget de Gina, CTA con resplandor dorado en hover

## F — Marea Alta (`direccion-f-marea-alta/`)

Rías Baixas, bateas, luz plateada del Atlántico. Frío pero no duro —
minimalismo costero, casi escandinavo. Distinto del negro/lima de A: acá
todo es gris perla y verde petróleo, sin negro puro.

- **Paleta:** `#DCE1E0` (perla) · `#1F3A3D` (petróleo) · `#E8836B` (coral) · `#F4F6F5` (nácar)
- **Tipografía:** Petrona (display, serif suave) + Sora (UI)
- **Animación:** anillos concéntricos tipo onda en el hero, tarjetas con elevación sutil, ícono del widget de Gina rota como una ola

## G — Festa da Romaría (`direccion-g-festa-da-romaria/`)

Verbena, banderines, cantigas de feria. El único maximalista y multicolor
de los ocho — tres acentos vivos a la vez en vez de uno solo. Opuesto
directo de la contención de Pedra e Liquen.

- **Paleta:** `#FFF8EC` (crema) · `#E63462` (frambuesa) · `#3AAED8` (cielo) · `#F4B740` (sol)
- **Tipografía:** Baloo 2 (display, redondeada festiva) + Outfit (UI)
- **Animación:** tarjetas con sombra offset de color y rebote elástico, CTA con sombra dura tipo cartel, widget de Gina "flota" con bob continuo

## H — Fin da Terra (`direccion-h-fin-da-terra/`)

Cabo Fisterra, faro, atardecer sobre el océano. El más pictórico y
dramático — degradado real de noche a ocaso, no un color plano.

- **Paleta:** `#10233A` (navy) · `#FF7A45` (ocaso) · `#F2C572` (oro frío) · `#EDEDE4` (bruma)
- **Tipografía:** Instrument Serif (display, itálica editorial) + Schibsted Grotesk (UI)
- **Animación:** sol con resplandor real (box-shadow difuso), scroll con blur→foco, widget de Gina como un pequeño sol

## I — Pedra e Liquen (`direccion-i-pedra-e-liquen/`)

Piedra de granito con liquen — minimalismo casi arquitectónico, un único
acento verde muy contenido. El más silencioso y lujoso de los ocho,
opuesto a la fiesta de G.

- **Paleta:** `#8C877D` (pedra) · `#D8D4C8` (pedra clara) · `#8FA662` (liquen) · `#FAF9F6` (branco)
- **Tipografía:** Literata (display, serif literaria) + Public Sans (UI)
- **Animación:** casi ninguna — fade sutil sin rebote, tarjetas separadas por líneas finas en vez de bordes gruesos, widget de Gina discreto

## J — Cunca de Estaño (`direccion-j-cunca-de-estano/`)

Vino albariño de las Rías Baixas, sobremesa larga. Elegante y cálido,
dorado + uva + peltre — distinto del dorado ya usado en Pedra e Ouro
porque acá el protagonista es el violeta uva, no el dorado.

- **Paleta:** `#E8C468` (albariño) · `#9CA3A8` (estaño) · `#4A2545` (uva) · `#F7F3EC` (marfil)
- **Tipografía:** Marcellus (display, clásica elegante) + Albert Sans (UI)
- **Animación:** franja degradada albariño→uva en el borde superior de cada tarjeta, panel de Gina con easing suave tipo "decantado"

---

## K — Caderno de Campo (`direccion-k-caderno-de-campo/`) · registro cálido, anti-plantilla

No es un reskin de color — rompe la estructura que repitieron A-J (header→hero
centrado→3 tarjetas iguales→sección Gina→specimen). Masthead asimétrico 1.4:1
en vez de hero centrado, una ciudad destacada (A Coruña, 2/3 del ancho) + lista
de texto compacta para las otras dos en vez de 3 tarjetas idénticas, ritmo
vertical irregular en "cómo funciona" (el paso 1 pesa más porque es el que más
fricción genera), datos reales no redondos ("14 pisos evaluados", no "+50"),
mensaje de validación con voz propia, `<title>`/meta específicos del contenido
real, comentarios de código solo donde la decisión no es obvia.

- **Paleta:** `#F6F1E7` (papel) · `#1C2B22` (tinta) · `#8B4A3C` (ferro, óxido apagado)
- **Tipografía:** Domine (serif de libro de campo) + IBM Plex Sans (UI)
- **Widget de Gina:** pestaña vertical fija al borde derecho ("G." + texto), no burbuja flotante genérica

## L — Expediente Vigo (`direccion-l-expediente-vigo/`) · registro frío, anti-plantilla

Estructura distinta de K a propósito (para no crear una segunda plantilla):
tira de estado tipo dossier en vez de header con nav, columna de cifra grande
+ titular en vez de hero centrado, tabla real de 5 ciudades en vez de tarjetas
con foto/ícono, perfil de una sola ciudad con cita textual real, sección
"Lo que no hacemos" (contenido diferenciador, no lista de features con
iconos). Nota de Gina como sello inclinado, no burbuja.

- **Paleta:** `#121212` (carbón) · `#EDEAE3` (hueso) · `#4C6B7A` (acero)
- **Tipografía:** Bricolage Grotesque (grotesk variable con detalles de tinta) + Hanken Grotesk (UI)

---

## Cómo revisar

Abrí cada `index.html` en el navegador. Cada mockup incluye: header, hero,
3 tarjetas de ciudad (A Coruña / Vigo / Santiago), y el widget de Gina
(solo forma/color/animación — el contenido del chat es de relleno, no funcional).
Al final de cada página hay una franja con la paleta y la tipografía en crudo,
a modo de specimen rápido.

**Elegí una y avisame — a partir de ahí sigo con la Fase 3.**

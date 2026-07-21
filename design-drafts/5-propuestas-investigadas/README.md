# 5 propuestas basadas en investigación real (Awwwards / Bento / Land-book)

A diferencia de las tandas anteriores, estas 5 no parten de una paleta inventada
y después se les busca una excusa — cada una replica un **patrón real y
verificable** de un sitio premiado o de una tendencia documentada de 2026.
Todas mantienen la arquitectura real del sitio: Gina como widget pequeño
(nunca protagonista), copy real del hero (`localhost:3000`), ciudades y
cifras reales. Un solo acento de color por propuesta, una sola sombra en
todo el sitio, ningún gradiente "de moda".

## Fuentes

- **Awwwards** — [The Real Estate Fund por DD.NYC®](https://www.awwwards.com/sites/the-real-estate-fund-dd-nyc-r), mención honorífica 2026: hero editorial secundario, marco "claro, autoritativo, escalable" para inversores.
- **Tendencia Bento Grid 2026** ("Bento 2.0"): esquinas squircle 12-24px, un tile más grande o con color señala jerarquía, micro-interacción real al hover. Popularizada por Apple (iPhone 15) y Linear.app. +23% scroll depth medido. — [Mockuuups Studio](https://mockuuups.studio/blog/post/best-bento-grid-design-examples/), [Superfiles](https://superfiles.in/bento-grid-ui-design-trend.php)
- **Agate Luxury Residence / Hous Luxe Woningen** (vía [DesignRush](https://www.designrush.com/best-designs/websites/trends/best-real-estate-website-designs)): paleta mínima con un solo acento dorado, dos modos de navegación (Layout/Lista), parallax sutil.
- **Traçat: Architecture 360** (vía DesignRush): UI oscura, galería en "conveyor" de scroll lateral, diseño single-page.
- **Soflo Home Realty** (vía DesignRush): hero en carrusel, layout claro y organizado, CTA prominente.

## Las 5 propuestas

| Archivo | Patrón real | Acento único | Tipografía |
|---|---|---|---|
| `1-editorial-autoridad.html` | DD.NYC / The Real Estate Fund | Bronce `#8A6A3A` | Fraunces + Inter |
| `2-bento-2026.html` | Bento Grid 2026 (Apple/Linear) | Verde atlántico `#1F5C4E` | Fraunces + Inter |
| `3-luxury-minimal-dorado.html` | Agate (dual-mode Mapa/Lista) | Dorado `#9C7A34` | Fraunces + Inter |
| `4-cinematic-oscuro.html` | Traçat (conveyor lateral) | Ámbar `#C9822E` | Fraunces + Inter |
| `5-carrusel-confianza.html` | Soflo Home Realty (hero carrusel) | Verde territorial `#2E6B57` | Fraunces + Inter |

## Qué cambió respecto a las tandas anteriores

- **Un solo acento**, no 3-4 colores compitiendo.
- **Una sola sombra** en todo el sitio (la de `--shadow`), no `shadow` repetida en cada tarjeta.
- **El ritmo de sección lo da la alternancia de fondo** (claro/oscuro), no una pila de módulos con distinto borde cada uno — excepto en Bento 2026, donde el ritmo lo da la variación de tamaño del grid mismo.
- **Fotografía simulada con capas de gradiente + textura de grano**, no gradientes CSS planos de 2 colores.
- **Gina sigue siendo un widget pequeño de esquina** en las 5 — nunca el protagonista de la página.

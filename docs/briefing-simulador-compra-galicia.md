# Briefing Técnico: Simulador de Compra — Gadis & Froiz

**Versión:** 1.0 — MVP  
**Ámbito geográfico:** Galicia  
**Cadenas incluidas:** Gadis, Froiz  
**Modelo de datos:** Feed oficial por acuerdo directo con cada cadena

---

## 1. Objetivo

Integrar en la web corporativa una sección interactiva que permita al usuario simular su cesta de la compra semanal y ver el coste total estimado en Gadis o en Froiz, eligiendo él mismo el supermercado. **No hay comparativa explícita entre cadenas en pantalla.**

---

## 2. Flujo de Usuario (UX)

```
1. Usuario accede a la sección "Simulador de Compra"
2. Selecciona supermercado mediante radio button: ○ Gadis  ○ Froiz
3. Introduce su código postal (para precios zonales si aplica)
4. Busca productos con barra de búsqueda con autocompletado
5. Añade productos y cantidades a su cesta
6. Ve el total actualizado en tiempo real
7. Puede cambiar de supermercado en cualquier momento → la cesta se recalcula
8. Indicador de frescura: "Precios actualizados el [jueves]. Próxima actualización en X días"
```

---

## 3. Arquitectura Técnica

### 3.1 Visión general

```
[Jueves 04:00h]
GitHub Actions
      │
      ▼
Script de ingestión
(recibe feed CSV/JSON de Gadis y Froiz)
      │
      ▼
Genera archivos estáticos:
  gadis-precios.json
  froiz-precios.json
      │
      ▼
Sube a CDN (Cloudflare R2 / Vercel Blob / S3 gratuito)
      │
      ▼
[Usuario en la web]
Navegador descarga JSON de la cadena seleccionada
Toda la lógica corre en cliente (JavaScript)
```

### 3.2 Stack tecnológico

| Capa | Tecnología | Coste |
|------|-----------|-------|
| Frontend | React + Tailwind o HTML/JS vanilla | 0 € |
| Búsqueda en cliente | MiniSearch.js | 0 € |
| Hosting web | Vercel / Netlify (free tier) | 0 € |
| Almacenamiento JSON | Cloudflare R2 (10 GB gratis) | 0 € |
| Scheduler semanal | GitHub Actions (cron) | 0 € |
| Feed de datos | Acuerdo directo con Gadis y Froiz | 0 € |

**Coste total infraestructura post-lanzamiento: ~0 €/mes**

---

## 4. Estructura de Datos

### 4.1 Formato del JSON por cadena

```json
{
  "cadena": "gadis",
  "actualizado": "2025-10-16T04:00:00Z",
  "productos": [
    {
      "id": "gadis-001",
      "ean": "8410376091015",
      "nombre": "Leche Entera Larsa 1L",
      "nombre_generico": "leche entera 1L",
      "categoria": "lacteos",
      "precio": 0.89,
      "unidad": "1L",
      "imagen_url": "https://cdn.gadis.es/img/001.jpg",
      "disponible": true
    }
  ]
}
```

### 4.2 Campos obligatorios por producto

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | ID único interno |
| `ean` | string | Código de barras EAN-13 (si existe) |
| `nombre` | string | Nombre comercial exacto |
| `nombre_generico` | string | Etiqueta genérica para búsqueda |
| `categoria` | string | Categoría (lacteos, panadería, frescos…) |
| `precio` | float | Precio en EUR con IVA |
| `unidad` | string | Unidad de venta (1L, 1kg, ud…) |
| `disponible` | boolean | Si está en stock |

### 4.3 Motor de equivalencias

Para que el usuario pueda cambiar de cadena sin perder su cesta, se mantiene un archivo `equivalencias.json` central:

```json
{
  "leche entera 1L": {
    "gadis": "gadis-001",
    "froiz": "froiz-047"
  },
  "aceite oliva virgen extra 1L": {
    "gadis": "gadis-082",
    "froiz": "froiz-103"
  }
}
```

Cuando el usuario cambia de cadena, el sistema mapea cada `nombre_generico` al producto equivalente de la nueva cadena.

---

## 5. Catálogo MVP

**150 productos iniciales** distribuidos en estas categorías:

| Categoría | Nº productos |
|-----------|-------------|
| Lácteos | 20 |
| Panadería y cereales | 15 |
| Aceites y condimentos | 10 |
| Pasta, arroz y legumbres | 15 |
| Frescos (fruta y verdura básica) | 25 |
| Carnes y pescados básicos | 20 |
| Bebidas | 15 |
| Limpieza del hogar | 15 |
| Higiene personal | 15 |

**Criterio de selección:** productos de consumo frecuente con presencia garantizada en ambas cadenas.

---

## 6. Componentes Frontend a Desarrollar

### 6.1 Lista de componentes

```
SimuladorCompra/
├── SupermarketSelector      → Radio buttons Gadis / Froiz
├── PostalCodeInput          → Input código postal con validación Galicia
├── SearchBar                → Barra búsqueda con autocompletado (MiniSearch)
├── ProductCard              → Tarjeta de producto con precio y botón añadir
├── CartSidebar              → Panel lateral con cesta y cantidades editables
├── CartTotal                → Total dinámico en EUR
├── FreshnessIndicator       → "Precios actualizados el [fecha]"
└── EmptyCartPrompt          → Estado vacío con sugerencias
```

### 6.2 Comportamiento del cambio de cadena

```
Usuario cambia de Gadis → Froiz:
  1. Se descarga froiz-precios.json (si no está en caché)
  2. Cada producto de la cesta busca su equivalente en equivalencias.json
  3. Si hay equivalente → actualiza precio con el de Froiz
  4. Si no hay equivalente → muestra aviso "No disponible en Froiz"
  5. El total se recalcula automáticamente
```

---

## 7. Pipeline de Datos Semanal

### 7.1 GitHub Actions — cron job

```yaml
# .github/workflows/actualizar-precios.yml
name: Actualizar precios semanales
on:
  schedule:
    - cron: '0 4 * * 4'  # Jueves a las 04:00 UTC

jobs:
  update-prices:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Ejecutar script de ingestión
        run: node scripts/ingest-prices.js
        env:
          GADIS_FEED_URL: ${{ secrets.GADIS_FEED_URL }}
          FROIZ_FEED_URL: ${{ secrets.FROIZ_FEED_URL }}
          CDN_UPLOAD_KEY: ${{ secrets.CDN_UPLOAD_KEY }}
      - name: Subir JSONs a CDN
        run: node scripts/upload-cdn.js
```

### 7.2 Script de ingestión (`ingest-prices.js`)

Responsabilidades:
- Consumir el feed entregado por Gadis y Froiz (CSV o JSON acordado)
- Validar campos obligatorios
- Normalizar precios y nombres
- Generar `gadis-precios.json` y `froiz-precios.json`
- Actualizar `equivalencias.json` si hay productos nuevos
- Subir a CDN

---

## 8. Acuerdo de Datos con Cadenas

### 8.1 Qué solicitar a Gadis y Froiz

Formato de entrega preferido (en orden de preferencia):
1. **Feed JSON** semanal en URL autenticada (más limpio)
2. **Feed CSV** semanal con campos mapeados
3. **Acceso a API** de su e-commerce (si tienen)

Campos mínimos necesarios del feed:
- Nombre del producto
- EAN (si disponible)
- Precio con IVA
- Categoría
- Unidad de venta
- Disponibilidad

### 8.2 Propuesta de valor para las cadenas

> "Os integramos en un simulador de compra embebido en nuestra web. El usuario elige vuestro supermercado, simula su compra con vuestros precios reales y eso genera tráfico cualificado hacia vuestras tiendas. Solo necesitamos un feed de precios semanal. Sin scraping, sin riesgo legal, con control total por vuestra parte."

---

## 9. Requisitos No Funcionales

| Requisito | Objetivo |
|-----------|---------|
| Carga inicial | < 1.5s (JSON ligero + lógica en cliente) |
| Tamaño JSON por cadena | < 2 MB para 150-200 productos |
| Compatibilidad | Chrome, Safari, Firefox, móvil iOS y Android |
| Accesibilidad | WCAG 2.1 AA mínimo |
| SEO | Sección indexable, meta tags con keywords locales Galicia |
| Sin dependencia de servidor | 100% client-side tras descarga del JSON |

---

## 10. Definición de Hecho (DoD) — MVP

- [ ] Feed de datos acordado con Gadis y operativo
- [ ] Feed de datos acordado con Froiz y operativo
- [ ] 150 productos catalogados con equivalencias mapeadas
- [ ] GitHub Action funcionando en cron de jueves
- [ ] JSONs en CDN accesibles públicamente
- [ ] Componentes frontend implementados y testeados
- [ ] Búsqueda por nombre genérico funcionando con MiniSearch
- [ ] Cambio de cadena recalcula cesta correctamente
- [ ] Indicador de frescura muestra fecha correcta
- [ ] Test en móvil iOS y Android
- [ ] Integrado en web corporativa en ruta `/simulador`

---

## 11. Fuera de Alcance (MVP)

- Comparativa de precios lado a lado entre cadenas
- Scraping automatizado
- Login o guardado de cestas entre sesiones
- Más de 2 cadenas
- Integración con e-commerce o compra directa
- Localización por GPS

---

## 12. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Cadena no acepta el acuerdo | Media | Empezar solo con la que acepte; lanzar con 1 cadena es viable |
| Feed llega en formato no estándar | Alta | Acordar el esquema por escrito antes del desarrollo |
| Producto sin equivalente al cambiar cadena | Media | Aviso claro en UI; no bloquea el uso |
| Cambio de precios intradía | Baja | Aceptado: actualización semanal es suficiente para el MVP |

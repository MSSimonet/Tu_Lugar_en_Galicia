import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, '..', 'public', 'og-default.jpg')

const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1A1B1E"/>
      <stop offset="100%" style="stop-color:#2A2B2E"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#8F722B;stop-opacity:0"/>
      <stop offset="40%" style="stop-color:#D4AF6A"/>
      <stop offset="100%" style="stop-color:#8F722B;stop-opacity:0"/>
    </linearGradient>
  </defs>

  <!-- Fondo -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Línea decorativa superior -->
  <rect x="0" y="0" width="1200" height="3" fill="url(#accent)" opacity="0.6"/>

  <!-- Círculo decorativo fondo derecha -->
  <circle cx="950" cy="315" r="320" fill="none" stroke="#8F722B" stroke-width="1" opacity="0.12"/>
  <circle cx="950" cy="315" r="220" fill="none" stroke="#8F722B" stroke-width="1" opacity="0.08"/>

  <!-- Logo principal -->
  <text
    x="100"
    y="240"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="88"
    font-weight="400"
    fill="#FFFFFF"
    letter-spacing="-1"
  >Tu Lugar</text>

  <text
    x="100"
    y="340"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="88"
    font-weight="300"
    font-style="italic"
    fill="#D4AF6A"
    letter-spacing="-1"
  >en Galicia</text>

  <!-- Línea bajo el logo -->
  <rect x="100" y="358" width="380" height="2" fill="#8F722B" opacity="0.7"/>

  <!-- Tagline -->
  <text
    x="100"
    y="420"
    font-family="Arial, Helvetica, sans-serif"
    font-size="24"
    font-weight="300"
    fill="rgba(255,255,255,0.65)"
    letter-spacing="1"
  >Relocation especializado en Galicia</text>

  <!-- URL -->
  <text
    x="100"
    y="570"
    font-family="Arial, Helvetica, sans-serif"
    font-size="18"
    font-weight="400"
    fill="rgba(255,255,255,0.35)"
    letter-spacing="2"
  >tulugarengalicia.com</text>

  <!-- Línea decorativa inferior -->
  <rect x="0" y="627" width="1200" height="3" fill="url(#accent)" opacity="0.4"/>
</svg>
`

const buffer = await sharp(Buffer.from(svg))
  .jpeg({ quality: 90, mozjpeg: true })
  .toBuffer()

writeFileSync(outPath, buffer)
console.log(`OG image creada: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`)

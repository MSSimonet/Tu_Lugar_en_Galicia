// @react-pdf/renderer — pure-JS, no binary deps, compatible con Vercel serverless
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Font,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { LeadData } from '../leads'
import type { PlanArmado, Fase, BloqueTramite, NotaEspecial } from './armador'

// ─── Fonts ────────────────────────────────────────────────────────────────────
// WOFF1 local (node_modules) — fontkit 2.0.4 produce glyph data corrupta desde
// WOFF2 (glyphs de 44KB en vez de ~200 bytes): la reconstrucción de tablas loca/glyf
// del formato WOFF2 está rota en esta versión. WOFF1 usa deflate simple sin esa
// transformación y produce fonts embebidos correctos.

const CG = (file: string) => join(process.cwd(), 'node_modules/@fontsource/cormorant-garamond/files', file)
const MU = (file: string) => join(process.cwd(), 'node_modules/@fontsource/mulish/files', file)

Font.register({
  family: 'Cormorant',
  fonts: [
    { src: CG('cormorant-garamond-latin-400-normal.woff'), fontWeight: 400 },
    { src: CG('cormorant-garamond-latin-400-italic.woff'), fontWeight: 400, fontStyle: 'italic' },
    { src: CG('cormorant-garamond-latin-500-normal.woff'), fontWeight: 500 },
  ],
})

Font.register({
  family: 'Mulish',
  fonts: [
    { src: MU('mulish-latin-300-normal.woff'), fontWeight: 300 },
    { src: MU('mulish-latin-400-normal.woff'), fontWeight: 400 },
    { src: MU('mulish-latin-600-normal.woff'), fontWeight: 600 },
  ],
})

// Sin separación silábica — el español se ve mejor sin guiones automáticos
Font.registerHyphenationCallback((word) => [word])

// ─── Paleta ───────────────────────────────────────────────────────────────────

const C = {
  laton:     '#8F722B',
  latonClaro:'#D4B96A',
  atlantico: '#1A5247',
  granito:   '#2A2B2E',
  pizarra:   '#4A4E54',
  niebla:    '#F2F0EB',
  arena:     '#E5DDD0',
  blanco:    '#FFFFFF',
} as const

// ─── Etiquetas de fase ────────────────────────────────────────────────────────

const FASES: Record<Fase, string> = {
  'fase-a-antes-viajar':               'ANTES DE VIAJAR',
  'fase-b-llegada-residencia':          'AL LLEGAR A ESPAÑA',
  'fase-c-identidad-digital':           'IDENTIDAD DIGITAL',
  'fase-d-trabajo-ss':                  'TRABAJO Y SEGURIDAD SOCIAL',
  'fase-e-salud':                       'SALUD',
  'fase-f-familia-estudios-conduccion': 'FAMILIA, ESTUDIOS Y CONDUCCIÓN',
}

// ─── Parser de trámites ───────────────────────────────────────────────────────

type TramiteInfo = { nombre: string; resumen: string }
let _tramiteCache: Map<number, TramiteInfo> | null = null

function getTramites(): Map<number, TramiteInfo> {
  if (_tramiteCache) return _tramiteCache

  const raw = readFileSync(join(process.cwd(), 'docs', 'tramites-galicia.md'), 'utf-8')
    .replace(/\r\n/g, '\n')
  const map = new Map<number, TramiteInfo>()
  const sections = raw.split(/\n(?=### \d+\.)/)

  for (const section of sections) {
    const firstLine = section.split('\n')[0]
    const hm = firstLine.match(/^### (\d+)\.\s+(.+)$/)
    if (!hm) continue

    const numero = parseInt(hm[1], 10)
    const nombre = hm[2].replace(/\s*\*\([^)]*\)\*\s*$/, '').trim()

    let queEs = ''
    let paraQue = ''
    for (const line of section.split('\n')) {
      if (!queEs && line.includes('**¿Qué es?**')) {
        queEs = line.replace(/^.*\*\*¿Qué es\?\*\*\s*/, '').trim()
      }
      if (!paraQue && line.includes('**¿Para qué sirve?**')) {
        paraQue = line.replace(/^.*\*\*¿Para qué sirve\?\*\*\s*/, '').trim()
      }
      if (queEs && paraQue) break
    }

    map.set(numero, { nombre, resumen: [queEs, paraQue].filter(Boolean).join(' ') })
  }

  _tramiteCache = map
  return map
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

let _logoSrc: string | null = null

function getLogoSrc(): string {
  if (_logoSrc !== null) return _logoSrc
  try {
    const buf = readFileSync(join(process.cwd(), 'public', 'Logo TLG.jpeg'))
    _logoSrc = `data:image/jpeg;base64,${buf.toString('base64')}`
  } catch {
    _logoSrc = ''
  }
  return _logoSrc
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  // Páginas
  pageCover: {
    backgroundColor: C.granito,
  },
  pageBody: {
    fontFamily: 'Mulish',
    fontSize: 11,
    color: C.granito,
    backgroundColor: C.blanco,
    paddingTop: 48,
    paddingBottom: 72,
    paddingLeft: 48,
    paddingRight: 48,
  },

  // Portada
  coverInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 64,
  },
  coverLogo: {
    width: 140,
    height: 90,
    marginBottom: 36,
  },
  coverBar: {
    width: 56,
    height: 2,
    backgroundColor: C.laton,
    marginBottom: 24,
  },
  coverTitle: {
    fontFamily: 'Cormorant',
    fontSize: 32,
    fontWeight: 500,
    color: C.latonClaro,
    textAlign: 'center',
    marginBottom: 14,
  },
  coverNombre: {
    fontFamily: 'Cormorant',
    fontSize: 13,
    fontWeight: 400,
    color: C.arena,
    textAlign: 'center',
    marginBottom: 4,
  },
  coverFecha: {
    fontFamily: 'Cormorant',
    fontSize: 9,
    fontWeight: 400,
    color: C.pizarra,
    textAlign: 'center',
    marginTop: 32,
  },

  // Pie de página (fijo, aparece en todas las páginas de contenido)
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: C.arena,
    paddingTop: 6,
  },
  footerBrand: {
    fontSize: 7.5,
    fontWeight: 400,
    color: C.pizarra,
  },
  footerPage: {
    fontSize: 7.5,
    fontWeight: 400,
    color: C.pizarra,
  },

  // Encabezados de sección
  sectionTitle: {
    fontFamily: 'Cormorant',
    fontSize: 22,
    fontWeight: 500,
    color: C.atlantico,
    marginTop: 28,
    marginBottom: 3,
  },
  sectionLine: {
    height: 1.5,
    backgroundColor: C.latonClaro,
    marginBottom: 14,
  },

  // Etiqueta de fase
  phaseBadge: {
    backgroundColor: C.atlantico,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 22,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  phaseBadgeText: {
    fontFamily: 'Cormorant',
    fontSize: 8.5,
    fontWeight: 500,
    color: C.blanco,
    letterSpacing: 0.7,
  },

  // Bloque de trámite
  tramiteWrap: {
    marginBottom: 14,
    paddingLeft: 12,
    borderLeftWidth: 2.5,
    borderLeftColor: C.latonClaro,
  },
  tramiteNum: {
    fontFamily: 'Mulish',
    fontSize: 8,
    fontWeight: 600,
    color: C.laton,
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  tramiteName: {
    fontFamily: 'Cormorant',
    fontSize: 14,
    fontWeight: 500,
    color: C.granito,
    lineHeight: 1.25,
    marginBottom: 3,
  },
  tramitePuente: {
    fontFamily: 'Cormorant',
    fontSize: 10.5,
    fontWeight: 400,
    fontStyle: 'italic',
    color: C.pizarra,
    lineHeight: 1.4,
    marginBottom: 4,
  },
  tramiteResumen: {
    fontSize: 9.5,
    fontWeight: 400,
    color: C.granito,
    lineHeight: 1.55,
  },

  // Nota especial
  notaWrap: {
    backgroundColor: C.niebla,
    borderLeftWidth: 3,
    borderLeftColor: C.laton,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  notaText: {
    fontSize: 9,
    fontWeight: 400,
    color: C.pizarra,
    lineHeight: 1.5,
  },

  // Cuerpo de texto
  bodyText: {
    fontSize: 10,
    fontWeight: 400,
    color: C.granito,
    lineHeight: 1.6,
    marginBottom: 9,
  },
  bodyDisclaimer: {
    fontSize: 8.5,
    fontWeight: 400,
    color: C.pizarra,
    lineHeight: 1.5,
    marginBottom: 10,
  },

  // Sub-encabezado (prep económica)
  subTitle: {
    fontFamily: 'Cormorant',
    fontSize: 14,
    fontWeight: 500,
    color: C.laton,
    marginTop: 12,
    marginBottom: 6,
  },

  // Firma del cierre
  firma: {
    marginTop: 24,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: C.arena,
  },
  firmaNombre: {
    fontFamily: 'Cormorant',
    fontSize: 13,
    fontWeight: 500,
    color: C.atlantico,
    marginBottom: 2,
  },
  firmaWeb: {
    fontSize: 8.5,
    fontWeight: 400,
    color: C.pizarra,
  },
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function primerNombre(nombreCompleto: string): string {
  return nombreCompleto.trim().split(/\s+/)[0]
}

function groupByFase(items: PlanArmado['items']): Map<Fase, PlanArmado['items']> {
  const map = new Map<Fase, PlanArmado['items']>()
  for (const item of items) {
    if (!map.has(item.fase)) map.set(item.fase, [])
    map.get(item.fase)!.push(item)
  }
  return map
}

function fechaHoy(): string {
  return new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ─── Componentes internos ─────────────────────────────────────────────────────

function PieDePagina() {
  return (
    <View fixed style={S.footer}>
      <Text style={S.footerBrand}>Tu Lugar en Galicia · tulugarengalicia.com</Text>
      <Text
        style={S.footerPage}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  )
}

function stripMd(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1')
}

function BloqueTramiте({
  item,
  tramites,
  paisOrigen,
}: {
  item: BloqueTramite
  tramites: Map<number, TramiteInfo>
  paisOrigen: string
}) {
  const info = tramites.get(item.numero)
  if (!info) return null
  const puente = item.frasePuente.replace(/\{\{PAIS_ORIGEN\}\}/g, paisOrigen)
  return (
    <View style={S.tramiteWrap} wrap={false}>
      <Text style={S.tramiteNum}>TRÁMITE {item.numero}</Text>
      <Text style={S.tramiteName}>{info.nombre}</Text>
      <Text style={S.tramitePuente}>{puente}</Text>
      <Text style={S.tramiteResumen}>{stripMd(info.resumen)}</Text>
    </View>
  )
}

function BloqueNota({ item }: { item: NotaEspecial }) {
  return (
    <View style={S.notaWrap} wrap={false}>
      <Text style={S.notaText}>{item.texto}</Text>
    </View>
  )
}

// ─── Documento principal ──────────────────────────────────────────────────────

function PlanDocument({
  lead,
  planArmado,
}: {
  lead: LeadData
  planArmado: PlanArmado
}) {
  const nombre = primerNombre(lead.nombreCompleto)
  const tramites = getTramites()
  const byFase = groupByFase(planArmado.items)
  const logo = getLogoSrc()

  return (
    <Document
      title={`Plan hacia Galicia · ${lead.nombreCompleto}`}
      author="Tu Lugar en Galicia"
      creator="Tu Lugar en Galicia"
    >
      {/* ── Portada ── */}
      <Page size="A4" style={S.pageCover}>
        <View style={S.coverInner}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          {logo ? <Image src={logo} style={S.coverLogo} /> : null}
          <View style={S.coverBar} />
          <Text style={S.coverTitle}>Tu Plan hacia Galicia</Text>
          <Text style={S.coverNombre}>Preparado para {lead.nombreCompleto}</Text>
          <Text style={S.coverFecha}>Tu Lugar en Galicia · {fechaHoy()}</Text>
        </View>
      </Page>

      {/* ── Páginas de contenido ── */}
      <Page size="A4" style={S.pageBody}>
        <PieDePagina />

        {/* Intro cálida */}
        <Text style={S.sectionTitle}>Tu camino a Galicia</Text>
        <View style={S.sectionLine} />
        <Text style={S.bodyText}>
          Hola, {nombre}. Antes de cualquier trámite, queremos reconocer algo: decidir
          mudarte a Galicia es un paso enorme, y el solo hecho de estar preparándolo con
          cuidado ya dice mucho de ti.
        </Text>
        <Text style={S.bodyText}>
          Este plan lo armamos a tu medida, con todo lo que nos contaste. Piénsalo como
          el mapa de tu propio camino: cada paso en su orden, sin nada que no necesites.
          Verás que buena parte ya la tienes encaminada —y eso es una ventaja real— y que
          lo que queda son etapas naturales que iremos recorriendo juntos. Tú llevas el
          rumbo; nosotros caminamos a tu lado.
        </Text>
        <Text style={S.bodyDisclaimer}>
          Esta es una guía orientativa, no asesoramiento jurídico. Para dudas concretas
          de tu caso, te recomendamos consultar con un abogado especialista en extranjería.
        </Text>

        {/* Trámites por fase */}
        <Text style={S.sectionTitle}>Tus trámites paso a paso</Text>
        <View style={S.sectionLine} />

        {[...byFase.entries()].map(([fase, items]) => (
          <View key={fase}>
            <View style={S.phaseBadge}>
              <Text style={S.phaseBadgeText}>{FASES[fase]}</Text>
            </View>
            {items.map((item, i) =>
              item.tipo === 'tramite' ? (
                <BloqueTramiте key={i} item={item} tramites={tramites} paisOrigen={lead.paisResidencia} />
              ) : (
                <BloqueNota key={i} item={item} />
              )
            )}
          </View>
        ))}

        {/* Preparación económica y de vivienda */}
        <Text style={S.sectionTitle}>Preparación económica y de vivienda</Text>
        <View style={S.sectionLine} />
        <Text style={S.subTitle}>Tu colchón para una mudanza tranquila</Text>
        <Text style={S.bodyText}>
          Hablemos de un punto importante, {nombre}, y lo hacemos con franqueza porque
          queremos lo mejor para ti: una mudanza internacional se vive con mucha más calma
          cuando cuentas con un colchón de ahorro para los primeros meses —la fianza, los
          primeros alquileres y los gastos de empezar de cero en una ciudad nueva—. Las
          familias que llegan con ese respaldo preparado encuentran su hogar antes y
          disfrutan mucho más del proceso.
        </Text>
        <Text style={S.bodyText}>
          Si todavía lo estás reuniendo, estás justo donde tienes que estar: es una etapa
          más del camino, no un obstáculo. Este plan te ayuda a organizarla con calma, y
          el día que la tengas encaminada, será un placer retomar juntos la búsqueda de
          tu hogar.
        </Text>
        <Text style={S.subTitle}>Las garantías que pide el mercado</Text>
        <Text style={S.bodyText}>
          En España es habitual que se pidan garantías adicionales a quienes llegan de
          fuera, simplemente porque todavía no tienes un historial local —le ocurre a
          todo el mundo al principio—. La más común es contar con un avalista propietario
          de una vivienda en España.
        </Text>
        <Text style={S.bodyText}>
          Si hoy no lo tienes resuelto, tranquilo: es justo una de las cosas que miraremos
          juntos, para encontrar contigo la opción que mejor encaje con tu situación. No es
          algo que tengas que resolver hoy, ni en solitario; para eso estamos a tu lado.
        </Text>

        {/* Cierre */}
        <Text style={S.sectionTitle}>Hasta pronto</Text>
        <View style={S.sectionLine} />
        <Text style={S.bodyText}>
          {nombre}, este es tu mapa hacia Galicia. Visto de golpe puede parecer mucho,
          pero ningún camino se recorre de una sola zancada: paso a paso, en el orden de
          este plan, vas a llegar. Muchas familias hicieron este mismo viaje antes que tú,
          y tú también puedes.
        </Text>
        <Text style={S.bodyText}>
          Cuando quieras dar el siguiente paso, escríbenos. Tu nuevo hogar en Galicia te
          está esperando.
        </Text>
        <View style={S.firma}>
          <Text style={S.firmaNombre}>Tu Lugar en Galicia</Text>
          <Text style={S.firmaWeb}>tulugarengalicia.com</Text>
        </View>
      </Page>
    </Document>
  )
}

// ─── API pública ──────────────────────────────────────────────────────────────

export async function generarPlanPdf(
  lead: LeadData,
  planArmado: PlanArmado,
): Promise<Buffer> {
  return renderToBuffer(<PlanDocument lead={lead} planArmado={planArmado} />)
}

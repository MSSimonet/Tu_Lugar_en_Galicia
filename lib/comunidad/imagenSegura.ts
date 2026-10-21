/**
 * Validación y saneado de las fotos de perfil que sube la gente desde su dispositivo (B2).
 *
 * DOS PROBLEMAS DISTINTOS, Y NINGUNO LO RESUELVE EL NAVEGADOR:
 *
 * 1. QUÉ ES EL ARCHIVO. Ni la extensión ni el `Content-Type` del multipart sirven: los dos los
 *    escribe el cliente y los dos se falsifican con una línea de `curl`. Lo único que dice de
 *    verdad qué hay dentro son los primeros bytes, así que el tipo se decide ahí y todo lo que
 *    no sea JPEG, PNG o WebP se rechaza — incluidos SVG (que es XML y puede traer <script>) y
 *    todo lo que no sea una imagen.
 *
 * 2. QUÉ TRAE ADENTRO. Una foto sacada con el móvil lleva EXIF, y el EXIF lleva GPS: latitud y
 *    longitud del lugar exacto donde se tomó, con precisión de metros. Publicarla tal cual
 *    tiraría por la borda todo el trabajo de privacidad de esta sección — el círculo de 200m de
 *    la intersección, el "nunca calle ni número" del §7 de CLAUDE.md, la migración 0010 de
 *    PII-01 — porque cualquiera que descargue la foto del perfil lee dónde vive esa persona.
 *    También hay que sacar XMP e IPTC, que llevan los mismos datos por otra vía, y los bloques
 *    de texto arbitrario.
 *
 * POR QUÉ A MANO Y NO CON UNA LIBRERÍA: el candidato natural era `sharp`, pero en este repo es
 * una devDependency (package.json) y esto corre en producción. Moverla a `dependencies` mete un
 * binario nativo en el runtime para hacer una tarea que es recortar bytes de un contenedor.
 * Los tres formatos aceptados son contenedores de estructura simple y documentada, así que se
 * recorren y se copian sólo los tramos que hacen falta para dibujar la imagen. Efecto lateral
 * bueno: al no recodificar, la foto no pierde calidad.
 */

export type FormatoImagen = 'image/jpeg' | 'image/png' | 'image/webp'

export type ResultadoImagen =
  | { ok: true; bytes: Uint8Array; formato: FormatoImagen; extension: 'jpg' | 'png' | 'webp' }
  | { ok: false; motivo: 'formato' | 'corrupto' }

const EXTENSIONES: Record<FormatoImagen, 'jpg' | 'png' | 'webp'> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const FIRMA_PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

function empiezaCon(bytes: Uint8Array, firma: number[], desde = 0): boolean {
  if (bytes.length < desde + firma.length) return false
  return firma.every((valor, i) => bytes[desde + i] === valor)
}

function textoAscii(bytes: Uint8Array, desde: number, largo: number): string {
  return String.fromCharCode(...bytes.subarray(desde, desde + largo))
}

/** Detecta el formato por los primeros bytes. `null` = no es ninguno de los tres aceptados. */
export function detectarFormato(bytes: Uint8Array): FormatoImagen | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (empiezaCon(bytes, FIRMA_PNG)) return 'image/png'
  if (bytes.length >= 12 && textoAscii(bytes, 0, 4) === 'RIFF' && textoAscii(bytes, 8, 4) === 'WEBP') {
    return 'image/webp'
  }
  return null
}

/**
 * JPEG: cadena de segmentos `FF marcador [largo] datos` desde el byte 2 hasta SOS (FFDA), y
 * después los datos comprimidos hasta el final.
 *
 * Se descartan enteros los APPn (FFE0–FFEF) y los COM (FFFE). Ahí viven EXIF (APP1), XMP
 * (APP1 con otro namespace), IPTC/Photoshop (APP13) y los comentarios. Todo lo demás
 * —tablas de cuantización, Huffman, cabeceras de trama— se copia tal cual porque sin eso la
 * imagen no se decodifica.
 *
 * También se cae el perfil de color ICC (APP2). Es una pérdida real pero menor: sin perfil el
 * navegador asume sRGB, que es lo que ya son en la práctica las fotos de un móvil.
 */
function limpiarJpeg(bytes: Uint8Array): Uint8Array | null {
  const tramos: Uint8Array[] = [bytes.subarray(0, 2)] // SOI
  let i = 2

  while (i < bytes.length) {
    if (bytes[i] !== 0xff) return null // desincronizado: no es un JPEG bien formado
    // Los 0xFF de relleno entre segmentos son legales; se saltan.
    let marcadorPos = i
    while (marcadorPos < bytes.length && bytes[marcadorPos] === 0xff) marcadorPos++
    if (marcadorPos >= bytes.length) return null
    const marcador = bytes[marcadorPos]

    // SOS: a partir de acá vienen los datos comprimidos, que no están segmentados. Se copia
    // el resto del archivo sin tocar y se termina.
    if (marcador === 0xda) {
      tramos.push(bytes.subarray(i))
      return concatenar(tramos)
    }
    // Marcadores sin payload (RSTn, SOI, EOI): 2 bytes y nada más.
    if (marcador === 0xd8 || marcador === 0xd9 || (marcador >= 0xd0 && marcador <= 0xd7)) {
      tramos.push(bytes.subarray(i, marcadorPos + 1))
      i = marcadorPos + 1
      continue
    }

    const inicioLargo = marcadorPos + 1
    if (inicioLargo + 1 >= bytes.length) return null
    const largo = (bytes[inicioLargo] << 8) | bytes[inicioLargo + 1]
    if (largo < 2) return null
    const fin = inicioLargo + largo
    if (fin > bytes.length) return null

    const esMetadato = (marcador >= 0xe0 && marcador <= 0xef) || marcador === 0xfe
    if (!esMetadato) tramos.push(bytes.subarray(i, fin))
    i = fin
  }

  return concatenar(tramos)
}

/**
 * PNG: firma de 8 bytes y después cadenas `largo(4) tipo(4) datos crc(4)`.
 *
 * Va por lista blanca y no por lista negra: se conservan los chunks que hacen falta para
 * dibujar (y para animar, en el caso de APNG) y se tira todo lo demás. Con lista negra, un
 * chunk nuevo o poco común —el estándar deja inventarlos— pasaría sin que nadie lo mirara.
 * Los que caen incluyen `eXIf` (el EXIF completo, GPS incluido), `tEXt`/`zTXt`/`iTXt` (texto
 * libre, donde también viaja el XMP) y `tIME`.
 */
const CHUNKS_PNG_PERMITIDOS = new Set([
  'IHDR', 'PLTE', 'IDAT', 'IEND', // críticos
  'tRNS', 'gAMA', 'cHRM', 'sRGB', 'bKGD', 'pHYs', 'sBIT', 'hIST', 'sPLT', // render
  'acTL', 'fcTL', 'fdAT', // APNG
])

function limpiarPng(bytes: Uint8Array): Uint8Array | null {
  const tramos: Uint8Array[] = [bytes.subarray(0, 8)]
  const vista = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let i = 8

  while (i + 8 <= bytes.length) {
    const largo = vista.getUint32(i)
    const tipo = textoAscii(bytes, i + 4, 4)
    const fin = i + 12 + largo
    if (fin > bytes.length) return null

    if (CHUNKS_PNG_PERMITIDOS.has(tipo)) tramos.push(bytes.subarray(i, fin))
    i = fin
    if (tipo === 'IEND') break
  }

  return concatenar(tramos)
}

/**
 * WebP: contenedor RIFF — `RIFF largo(4, little-endian) WEBP` y después chunks
 * `fourcc(4) largo(4, LE) datos` con relleno a byte par.
 *
 * Se tiran los chunks `EXIF` y `XMP `. Hay un paso extra que es fácil de olvidar y rompe el
 * archivo si falta: en un WebP extendido el chunk `VP8X` lleva un byte de flags que ANUNCIA
 * qué metadatos hay. Si se borran los chunks pero se dejan los flags puestos, el archivo queda
 * declarando algo que ya no está. Así que se limpian también esos dos bits. Y como el archivo
 * encoge, hay que reescribir el tamaño total de la cabecera RIFF.
 */
const FLAG_EXIF = 0x08
const FLAG_XMP = 0x04

function limpiarWebp(bytes: Uint8Array): Uint8Array | null {
  const vista = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const tramos: Uint8Array[] = []
  let i = 12

  while (i + 8 <= bytes.length) {
    const fourcc = textoAscii(bytes, i, 4)
    const largo = vista.getUint32(i + 4, true)
    const conRelleno = largo + (largo % 2)
    const fin = i + 8 + conRelleno
    if (fin > bytes.length) return null

    if (fourcc === 'EXIF' || fourcc === 'XMP ') {
      i = fin
      continue
    }

    if (fourcc === 'VP8X' && largo >= 1) {
      const copia = bytes.slice(i, fin)
      copia[8] = copia[8] & ~(FLAG_EXIF | FLAG_XMP)
      tramos.push(copia)
    } else {
      tramos.push(bytes.subarray(i, fin))
    }
    i = fin
  }

  const cuerpo = concatenar(tramos)
  const cabecera = new Uint8Array(12)
  cabecera.set(bytes.subarray(0, 12))
  // Tamaño RIFF = todo lo que sigue a esos 4 bytes de tamaño, o sea "WEBP" (4) + el cuerpo.
  new DataView(cabecera.buffer).setUint32(4, cuerpo.length + 4, true)
  return concatenar([cabecera, cuerpo])
}

function concatenar(tramos: Uint8Array[]): Uint8Array {
  const total = tramos.reduce((suma, tramo) => suma + tramo.length, 0)
  const salida = new Uint8Array(total)
  let offset = 0
  for (const tramo of tramos) {
    salida.set(tramo, offset)
    offset += tramo.length
  }
  return salida
}

/**
 * Punto de entrada: decide el formato por los bytes reales y devuelve la imagen sin metadatos.
 * Devuelve `{ ok: false }` en vez de lanzar — el llamador traduce el motivo a un mensaje.
 */
export function sanearImagen(bytes: Uint8Array): ResultadoImagen {
  const formato = detectarFormato(bytes)
  if (!formato) return { ok: false, motivo: 'formato' }

  const limpia =
    formato === 'image/jpeg' ? limpiarJpeg(bytes)
    : formato === 'image/png' ? limpiarPng(bytes)
    : limpiarWebp(bytes)

  // Un archivo con la firma correcta pero el contenedor roto llega acá. Se rechaza en vez de
  // subir algo que no se puede decodificar.
  if (!limpia || limpia.length === 0) return { ok: false, motivo: 'corrupto' }

  return { ok: true, bytes: limpia, formato, extension: EXTENSIONES[formato] }
}

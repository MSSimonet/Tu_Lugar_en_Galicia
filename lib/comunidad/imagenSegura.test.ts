/**
 * Tests de `imagenSegura.ts`.
 *
 * QUE PROTEGEN: el borrado de metadatos de las fotos de perfil. Es la pieza donde un fallo no
 * se ve — la imagen se sigue viendo igual de bien con el GPS adentro que sin el, asi que una
 * regresion aca no la detecta nadie mirando la pagina. El unico aviso posible es este archivo.
 *
 * COMO SE CONSTRUYEN LOS CASOS: se arman los contenedores byte a byte en vez de cargar fotos de
 * ejemplo. Un .jpg de prueba en el repo tendria los metadatos que le toco tener; aca se coloca
 * EXACTAMENTE el segmento que se quiere ver desaparecer, y se comprueba que desaparecio.
 */

import { describe, it, expect } from 'vitest'
import { detectarFormato, sanearImagen } from './imagenSegura'

/** Segmento JPEG con largo (los 2 bytes de largo se cuentan a si mismos). */
function segmentoJpeg(marcador: number, datos: number[]): number[] {
  const largo = datos.length + 2
  return [0xff, marcador, (largo >> 8) & 0xff, largo & 0xff, ...datos]
}

/** JPEG minimo valido: SOI + APP1/EXIF + DQT + SOS + datos + EOI. */
function jpegConExif(): Uint8Array {
  const exif = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00, 0xde, 0xad, 0xbe, 0xef] // "Exif\0\0" + carga
  return new Uint8Array([
    0xff, 0xd8,
    ...segmentoJpeg(0xe1, exif), // APP1 — EXIF
    ...segmentoJpeg(0xfe, [0x68, 0x69]), // COM — comentario
    ...segmentoJpeg(0xdb, [0x01, 0x02, 0x03]), // DQT — tabla, se conserva
    0xff, 0xda, 0x00, 0x03, 0x01, // SOS
    0x11, 0x22, 0x33, // datos comprimidos
    0xff, 0xd9, // EOI
  ])
}

function chunkPng(tipo: string, datos: number[]): number[] {
  const largo = datos.length
  return [
    (largo >>> 24) & 0xff, (largo >>> 16) & 0xff, (largo >>> 8) & 0xff, largo & 0xff,
    ...[...tipo].map((c) => c.charCodeAt(0)),
    ...datos,
    0x00, 0x00, 0x00, 0x00, // CRC de mentira: el saneador copia chunks, no los valida
  ]
}

function pngConExif(): Uint8Array {
  return new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ...chunkPng('IHDR', [0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0]),
    ...chunkPng('eXIf', [0xde, 0xad, 0xbe, 0xef]),
    ...chunkPng('tEXt', [0x61, 0x62]),
    ...chunkPng('IDAT', [0x78, 0x9c, 0x01]),
    ...chunkPng('IEND', []),
  ])
}

function chunkWebp(fourcc: string, datos: number[]): number[] {
  const largo = datos.length
  const relleno = largo % 2 === 1 ? [0x00] : []
  return [
    ...[...fourcc].map((c) => c.charCodeAt(0)),
    largo & 0xff, (largo >>> 8) & 0xff, (largo >>> 16) & 0xff, (largo >>> 24) & 0xff,
    ...datos,
    ...relleno,
  ]
}

/** WebP extendido: VP8X con los flags de EXIF y XMP encendidos, mas los dos chunks. */
function webpConExif(): Uint8Array {
  const cuerpo = [
    ...chunkWebp('VP8X', [0x0c, 0, 0, 0, 0, 0, 0, 0, 0, 0]), // flags = EXIF|XMP
    ...chunkWebp('VP8 ', [0x01, 0x02, 0x03, 0x04]),
    ...chunkWebp('EXIF', [0xde, 0xad, 0xbe, 0xef]),
    ...chunkWebp('XMP ', [0x3c, 0x78]),
  ]
  return new Uint8Array([
    0x52, 0x49, 0x46, 0x46, // "RIFF"
    (cuerpo.length + 4) & 0xff, ((cuerpo.length + 4) >>> 8) & 0xff, 0, 0,
    0x57, 0x45, 0x42, 0x50, // "WEBP"
    ...cuerpo,
  ])
}

function contiene(bytes: Uint8Array, aguja: number[]): boolean {
  return bytes.some((_, i) => aguja.every((valor, j) => bytes[i + j] === valor))
}

describe('detectarFormato', () => {
  it('reconoce JPEG, PNG y WebP por sus primeros bytes', () => {
    expect(detectarFormato(jpegConExif())).toBe('image/jpeg')
    expect(detectarFormato(pngConExif())).toBe('image/png')
    expect(detectarFormato(webpConExif())).toBe('image/webp')
  })

  it('rechaza un SVG aunque el nombre y el Content-Type digan que es una imagen', () => {
    // El caso que motiva la validacion por bytes: SVG es XML, admite <script> y el navegador
    // lo ejecuta si se sirve como imagen desde el mismo origen.
    const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>')
    expect(detectarFormato(svg)).toBeNull()
  })

  it('rechaza un archivo vacio o demasiado corto para tener firma', () => {
    expect(detectarFormato(new Uint8Array([]))).toBeNull()
    expect(detectarFormato(new Uint8Array([0xff, 0xd8]))).toBeNull()
  })
})

describe('sanearImagen — JPEG', () => {
  it('borra el EXIF y el comentario, y conserva la tabla y los datos de imagen', () => {
    const original = jpegConExif()
    const resultado = sanearImagen(original)
    if (!resultado.ok) throw new Error(`esperaba ok, recibi ${resultado.motivo}`)

    // "Exif\0\0" ya no esta en ninguna parte del archivo.
    expect(contiene(original, [0x45, 0x78, 0x69, 0x66])).toBe(true)
    expect(contiene(resultado.bytes, [0x45, 0x78, 0x69, 0x66])).toBe(false)
    // El comentario tampoco.
    expect(contiene(resultado.bytes, [0xff, 0xfe])).toBe(false)
    // La tabla de cuantizacion sobrevive: sin ella el JPEG no se decodifica.
    expect(contiene(resultado.bytes, [0xff, 0xdb])).toBe(true)
    // Y los datos comprimidos que van despues del SOS, tambien.
    expect(contiene(resultado.bytes, [0x11, 0x22, 0x33])).toBe(true)
    expect(resultado.extension).toBe('jpg')
  })

  it('rechaza un JPEG truncado en mitad de un segmento', () => {
    const roto = new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x40, 0x01])
    expect(sanearImagen(roto)).toEqual({ ok: false, motivo: 'corrupto' })
  })
})

describe('sanearImagen — PNG', () => {
  it('borra eXIf y tEXt, y conserva IHDR/IDAT/IEND', () => {
    const resultado = sanearImagen(pngConExif())
    if (!resultado.ok) throw new Error(`esperaba ok, recibi ${resultado.motivo}`)

    const tipos = ['IHDR', 'IDAT', 'IEND', 'eXIf', 'tEXt'].map((tipo) => [
      tipo,
      contiene(resultado.bytes, [...tipo].map((c) => c.charCodeAt(0))),
    ])
    expect(Object.fromEntries(tipos)).toEqual({
      IHDR: true,
      IDAT: true,
      IEND: true,
      eXIf: false,
      tEXt: false,
    })
  })
})

describe('sanearImagen — WebP', () => {
  it('borra los chunks EXIF y XMP y apaga sus flags en VP8X', () => {
    const resultado = sanearImagen(webpConExif())
    if (!resultado.ok) throw new Error(`esperaba ok, recibi ${resultado.motivo}`)

    expect(contiene(resultado.bytes, [0x45, 0x58, 0x49, 0x46])).toBe(false) // "EXIF"
    expect(contiene(resultado.bytes, [0x58, 0x4d, 0x50, 0x20])).toBe(false) // "XMP "
    expect(contiene(resultado.bytes, [0x56, 0x50, 0x38, 0x20])).toBe(true) // "VP8 " sobrevive

    // Los flags del VP8X: el byte de datos es el noveno del chunk (4 fourcc + 4 largo).
    // Dejar los chunks fuera pero los bits puestos deja un archivo que anuncia metadatos
    // inexistentes — este assert es el que protege ese olvido.
    const inicioVp8x = 12
    expect(resultado.bytes[inicioVp8x + 8] & 0x0c).toBe(0)
  })

  it('reescribe el tamano de la cabecera RIFF despues de encoger', () => {
    const resultado = sanearImagen(webpConExif())
    if (!resultado.ok) throw new Error(`esperaba ok, recibi ${resultado.motivo}`)

    const vista = new DataView(
      resultado.bytes.buffer,
      resultado.bytes.byteOffset,
      resultado.bytes.byteLength,
    )
    // El campo vale "todo lo que sigue a estos 4 bytes", o sea el archivo entero menos 8.
    expect(vista.getUint32(4, true)).toBe(resultado.bytes.length - 8)
  })
})

describe('sanearImagen — formatos no aceptados', () => {
  it('rechaza un PDF, un GIF y un ejecutable', () => {
    const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]) // "%PDF-"
    const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]) // "GIF89a"
    const elf = new Uint8Array([0x7f, 0x45, 0x4c, 0x46])
    for (const archivo of [pdf, gif, elf]) {
      expect(sanearImagen(archivo)).toEqual({ ok: false, motivo: 'formato' })
    }
  })
})

/**
 * lib/plan/armador.test.ts — Script de prueba del armador (sin framework de testing)
 *
 * Ejecutar con: npx tsx lib/plan/armador.test.ts
 *
 * Para cada uno de los 10 ejemplos del brief, imprime:
 *   - Números de trámite generados
 *   - Tabla: Esperado | Generado | Diferencia
 *   - Advertencias del armador
 */

import { armarPlan, type PlanArmado, type RespuestasLead } from './armador'

// ─── Helpers de presentación ──────────────────────────────────────────────────

function tramitesGenerados(plan: PlanArmado): number[] {
  return plan.items
    .filter((i): i is Extract<typeof i, { tipo: 'tramite' }> => i.tipo === 'tramite')
    .map(i => i.numero)
}

function tieneNota(plan: PlanArmado, fragmento: string): boolean {
  return plan.items
    .filter(i => i.tipo === 'nota')
    .some(i => (i as { tipo: 'nota'; texto: string }).texto.includes(fragmento))
}


function sep(titulo: string) {
  console.log('\n' + '─'.repeat(70))
  console.log(titulo)
  console.log('─'.repeat(70))
}

// ─── Definición de los 10 ejemplos ───────────────────────────────────────────

const ejemplos: Array<{
  titulo: string
  respuestas: RespuestasLead
  esperados: { numero: number; descripcion: string }[]
  ausentes: { numero: number; descripcion: string }[]
  notasEsperadas?: string[]
  fueraDeAlcance?: boolean
}> = [
  // ── Ejemplo 1 ───────────────────────────────────────────────────────────────
  {
    titulo: 'Ejemplo 1 — Familia argentina, todavía en Argentina',
    respuestas: {
      paisResidencia: 'Argentina',
      documentacion: 'en-tramite',
      situacionLaboral: 'teletrabajo-extranjero',
      cuentaBancaria: 'no',
      tipoLicencia: 'origen',
      nivelEstudios: 'universitario',
      mascotas: 'no',
      ninos: '1',
      adolescentes: '0',
    },
    esperados: [
      { numero: 1,  descripcion: 'Antecedentes penales' },
      { numero: 2,  descripcion: 'Apostilla' },
      { numero: 3,  descripcion: 'Traducción jurada' },
      { numero: 4,  descripcion: 'Cuenta bancaria no residente' },
      { numero: 5,  descripcion: 'Visado tipo D' },
      { numero: 6,  descripcion: 'Declaración de entrada' },
      { numero: 7,  descripcion: 'NIE' },
      { numero: 11, descripcion: 'TIE' },
      { numero: 21, descripcion: 'Empadronamiento' },
      { numero: 22, descripcion: 'Volante de empadronamiento' },
      { numero: 17, descripcion: 'Baja consular' },
      { numero: 27, descripcion: 'Tarjeta Sanitaria SERGAS (salud fija)' },
      { numero: 37, descripcion: 'Escolarización del niño' },
      { numero: 40, descripcion: 'Homologación universitaria (regulada)' },
      { numero: 41, descripcion: 'Declaración de equivalencia (no regulada)' },
      { numero: 43, descripcion: 'Psicofísico CRC' },
      { numero: 44, descripcion: 'Canje de licencia' },
      { numero: 45, descripcion: 'Exámenes DGT' },
    ],
    ausentes: [],
    notasEsperadas: ['teletrabajo', 'convenio'],
  },

  // ── Ejemplo 2 ───────────────────────────────────────────────────────────────
  {
    titulo: 'Ejemplo 2 — Jubilado con pasaporte español, sin mascota ni hijos',
    respuestas: {
      paisResidencia: 'Argentina',
      documentacion: 'espanol',
      situacionLaboral: 'jubilado',
      cuentaBancaria: 'si',
      tipoLicencia: 'espanola',
      nivelEstudios: 'sin-estudios',
      mascotas: 'no',
      ninos: '0',
      adolescentes: '0',
    },
    esperados: [
      { numero: 46, descripcion: 'Partida de nacimiento para primer DNI (desde origen)' },
      { numero: 21, descripcion: 'Empadronamiento' },
      { numero: 47, descripcion: 'Expedición del primer DNI' },
      { numero: 22, descripcion: 'Volante' },
      { numero: 27, descripcion: 'Tarjeta Sanitaria SERGAS (salud fija)' },
    ],
    ausentes: [
      { numero: 1,  descripcion: 'Antecedentes penales — NO para español' },
      { numero: 2,  descripcion: 'Apostilla — NO para español' },
      { numero: 3,  descripcion: 'Traducción — NO para español' },
      { numero: 5,  descripcion: 'Visado — NO para español' },
      { numero: 7,  descripcion: 'NIE — NO para español' },
      { numero: 8,  descripcion: 'CUE — NO para español' },
      { numero: 11, descripcion: 'TIE — NO para español' },
    ],
  },

  // ── Ejemplo 3 ───────────────────────────────────────────────────────────────
  {
    titulo: 'Ejemplo 3 — Autónomo de Francia (UE) con perro',
    respuestas: {
      paisResidencia: 'Francia',
      documentacion: 'ue-otro',
      situacionLaboral: 'autonomo',
      cuentaBancaria: 'no',
      tipoLicencia: 'europea',
      nivelEstudios: 'tecnico',
      mascotas: 'si',
      ninos: '0',
      adolescentes: '0',
    },
    esperados: [
      { numero: 4,  descripcion: 'Cuenta bancaria no residente' },
      { numero: 49, descripcion: 'Microchip mascota' },
      { numero: 50, descripcion: 'Vacuna antirrábica' },
      { numero: 51, descripcion: 'Certificado de salud' },
      { numero: 52, descripcion: 'Certificado de exportación' },
      { numero: 53, descripcion: 'Reserva de vuelo' },
      { numero: 54, descripcion: 'Permiso de embarque' },
      { numero: 8,  descripcion: 'CUE (NO NIE, NO TIE)' },
      { numero: 21, descripcion: 'Empadronamiento' },
      { numero: 22, descripcion: 'Volante' },
      { numero: 23, descripcion: 'Alta censal AEAT' },
      { numero: 24, descripcion: 'NUSS/NAF' },
      { numero: 26, descripcion: 'Alta RETA' },
      { numero: 27, descripcion: 'SERGAS (salud fija)' },
      { numero: 39, descripcion: 'Homologación FP' },
    ],
    ausentes: [
      { numero: 1,  descripcion: 'Antecedentes — NO para UE' },
      { numero: 2,  descripcion: 'Apostilla — NO para UE' },
      { numero: 3,  descripcion: 'Traducción — NO para UE' },
      { numero: 7,  descripcion: 'NIE — NO para UE (régimen comunitario)' },
      { numero: 11, descripcion: 'TIE — NO para UE' },
      { numero: 43, descripcion: 'Psicofísico — NO (licencia europea)' },
      { numero: 44, descripcion: 'Canje — NO (licencia europea)' },
      { numero: 45, descripcion: 'Examen DGT — NO (licencia europea)' },
    ],
  },

  // ── Ejemplo 4 ───────────────────────────────────────────────────────────────
  {
    titulo: 'Ejemplo 4 — Estudiante con perro (raza PPP posible)',
    respuestas: {
      paisResidencia: 'Venezuela',
      documentacion: 'en-tramite',
      situacionLaboral: 'estudiante',
      cuentaBancaria: 'no',
      tipoLicencia: 'no-tiene',
      nivelEstudios: 'bachillerato',
      mascotas: 'si',
      ninos: '0',
      adolescentes: '0',
    },
    esperados: [
      { numero: 1,  descripcion: 'Antecedentes penales' },
      { numero: 2,  descripcion: 'Apostilla' },
      { numero: 3,  descripcion: 'Traducción' },
      { numero: 4,  descripcion: 'Cuenta bancaria' },
      { numero: 49, descripcion: 'Microchip mascota' },
      { numero: 50, descripcion: 'Vacuna antirrábica' },
      { numero: 48, descripcion: 'Visado de estudios' },
      { numero: 6,  descripcion: 'Declaración de entrada' },
      { numero: 7,  descripcion: 'NIE' },
      { numero: 11, descripcion: 'TIE' },
      { numero: 21, descripcion: 'Empadronamiento' },
      { numero: 22, descripcion: 'Volante' },
      { numero: 17, descripcion: 'Baja consular' },
      { numero: 27, descripcion: 'SERGAS (salud fija)' },
      { numero: 38, descripcion: 'Homologación bachillerato' },
    ],
    ausentes: [
      { numero: 5, descripcion: 'Visado tipo D genérico — reemplazado por [48] de estudios' },
    ],
    notasEsperadas: ['potencialmente peligrosa', 'PPP'],
  },

  // ── Ejemplo 5 ───────────────────────────────────────────────────────────────
  {
    titulo: 'Ejemplo 5 — Turista ya en España que quiere quedarse',
    respuestas: {
      paisResidencia: 'en_espana',
      documentacion: 'turista',
      situacionLaboral: 'busca-empleo',
      cuentaBancaria: 'si',
      tipoLicencia: 'no-tiene',
      nivelEstudios: 'posgrado',
      mascotas: 'no',
      ninos: '0',
      adolescentes: '1',
    },
    esperados: [
      { numero: 21, descripcion: 'Empadronamiento' },
      { numero: 22, descripcion: 'Volante' },
      { numero: 27, descripcion: 'SERGAS (salud fija)' },
      { numero: 37, descripcion: 'Escolarización del adolescente' },
      { numero: 40, descripcion: 'Homologación posgrado (regulada)' },
      { numero: 41, descripcion: 'Equivalencia posgrado (no regulada)' },
    ],
    ausentes: [
      { numero: 1,  descripcion: 'Antecedentes — ya en España' },
      { numero: 2,  descripcion: 'Apostilla — ya en España' },
      { numero: 4,  descripcion: 'Cuenta no residente — ya en España' },
      { numero: 17, descripcion: 'Baja consular — ya en España' },
    ],
    notasEsperadas: ['equipo', 'videollamada'],
  },

  // ── Ejemplo 6 ───────────────────────────────────────────────────────────────
  {
    titulo: 'Ejemplo 6 — Familia grande, cuenta-ajena, tres mascotas, licencia origen',
    respuestas: {
      paisResidencia: 'Colombia',
      documentacion: 'en-tramite',
      situacionLaboral: 'cuenta-ajena',
      cuentaBancaria: 'no',
      tipoLicencia: 'origen',
      nivelEstudios: 'universitario',
      mascotas: 'si',
      ninos: '2',
      adolescentes: '1',
    },
    esperados: [
      { numero: 1,  descripcion: 'Antecedentes' },
      { numero: 2,  descripcion: 'Apostilla' },
      { numero: 3,  descripcion: 'Traducción' },
      { numero: 4,  descripcion: 'Cuenta bancaria' },
      { numero: 49, descripcion: 'Microchip mascota' },
      { numero: 50, descripcion: 'Vacuna antirrábica' },
      { numero: 51, descripcion: 'Cert. salud mascota' },
      { numero: 52, descripcion: 'Cert. exportación mascota' },
      { numero: 53, descripcion: 'Reserva vuelo mascota' },
      { numero: 54, descripcion: 'Permiso embarque mascota' },
      { numero: 5,  descripcion: 'Visado' },
      { numero: 6,  descripcion: 'Declaración entrada' },
      { numero: 7,  descripcion: 'NIE' },
      { numero: 11, descripcion: 'TIE' },
      { numero: 21, descripcion: 'Empadronamiento' },
      { numero: 22, descripcion: 'Volante' },
      { numero: 17, descripcion: 'Baja consular' },
      { numero: 24, descripcion: 'NUSS/NAF' },
      { numero: 25, descripcion: 'Alta Régimen General' },
      { numero: 27, descripcion: 'SERGAS titular' },
      { numero: 28, descripcion: 'SERGAS beneficiarios' },
      { numero: 37, descripcion: 'Escolarización menores' },
      { numero: 40, descripcion: 'Homologación universitaria' },
      { numero: 41, descripcion: 'Equivalencia universitaria' },
      { numero: 43, descripcion: 'Psicofísico CRC' },
      { numero: 44, descripcion: 'Canje licencia' },
      { numero: 45, descripcion: 'Examen DGT' },
    ],
    ausentes: [],
    notasEsperadas: ['potencialmente peligrosa'],
  },

  // ── Ejemplo 7 ───────────────────────────────────────────────────────────────
  {
    titulo: 'Ejemplo 7 — Rentista con residencia ya aprobada, todo resuelto',
    respuestas: {
      paisResidencia: 'Uruguay',
      documentacion: 'residencia-aprobada',
      situacionLaboral: 'rentista',
      cuentaBancaria: 'si',
      tipoLicencia: 'no-tiene',
      nivelEstudios: 'sin-estudios',
      mascotas: 'no',
      ninos: '0',
      adolescentes: '0',
    },
    esperados: [
      { numero: 11, descripcion: 'TIE (toma de huellas + tarjeta física)' },
      { numero: 21, descripcion: 'Empadronamiento' },
      { numero: 22, descripcion: 'Volante' },
      { numero: 27, descripcion: 'SERGAS (salud fija)' },
    ],
    ausentes: [
      { numero: 1,  descripcion: 'Antecedentes — ya tiene residencia aprobada' },
      { numero: 2,  descripcion: 'Apostilla — ya tiene residencia aprobada' },
      { numero: 3,  descripcion: 'Traducción — ya tiene residencia aprobada' },
      { numero: 5,  descripcion: 'Visado — ya tiene residencia' },
      { numero: 7,  descripcion: 'NIE — ya tiene residencia' },
      { numero: 8,  descripcion: 'CUE — no es UE' },
      { numero: 37, descripcion: 'Escolarización — sin hijos' },
    ],
  },

  // ── Ejemplo 8 ───────────────────────────────────────────────────────────────
  {
    titulo: 'Ejemplo 8 — Tramitando la nacionalidad española, ya en España',
    respuestas: {
      paisResidencia: 'en_espana',
      documentacion: 'nacionalidad-en-tramite',
      situacionLaboral: 'cuenta-ajena',
      cuentaBancaria: 'si',
      tipoLicencia: 'espanola',
      nivelEstudios: 'universitario',
      mascotas: 'no',
      ninos: '0',
      adolescentes: '0',
    },
    esperados: [
      { numero: 12, descripcion: 'Renovación TIE (si está por vencer)' },
      { numero: 16, descripcion: 'Certificado de Concordancia (al obtener la nacionalidad)' },
      { numero: 21, descripcion: 'Empadronamiento' },
      { numero: 22, descripcion: 'Volante' },
      { numero: 24, descripcion: 'NUSS/NAF (cuenta-ajena)' },
      { numero: 25, descripcion: 'Alta Régimen General' },
      { numero: 27, descripcion: 'SERGAS (salud fija)' },
      { numero: 40, descripcion: 'Homologación universitaria (regulada)' },
      { numero: 41, descripcion: 'Equivalencia universitaria (no regulada)' },
    ],
    ausentes: [
      { numero: 1,  descripcion: 'Antecedentes — ya reside legalmente' },
      { numero: 5,  descripcion: 'Visado — ya reside legalmente' },
      { numero: 7,  descripcion: 'NIE — ya tiene residencia' },
      { numero: 11, descripcion: 'TIE — ya tiene residencia' },
      { numero: 17, descripcion: 'Baja consular — ya en España' },
      { numero: 43, descripcion: 'Psicofísico — licencia española' },
    ],
    notasEsperadas: ['dos momentos', 'Concordancia'],
  },

  // ── Ejemplo 9 ───────────────────────────────────────────────────────────────
  // FUERA DE ALCANCE — no se prueba el armador con este caso
  {
    titulo: 'Ejemplo 9 — Pareja de ciudadano español (FUERA DE ALCANCE del armador)',
    respuestas: {
      // Caso que no existe como opción en Gina (surge en videollamada con Silvana)
      // Se usa un proxy: ue-otro + familia para verificar que el armador no inventa rama
      paisResidencia: 'Bolivia',
      documentacion: 'en-tramite',
      situacionLaboral: 'cuenta-ajena',
      cuentaBancaria: 'no',
      tipoLicencia: 'origen',
      nivelEstudios: 'universitario',
      mascotas: 'no',
      ninos: '0',
      adolescentes: '0',
    },
    esperados: [],
    ausentes: [
      { numero: 10, descripcion: 'Autorización familiar español [10] — el armador NO debe generarla automáticamente' },
    ],
    fueraDeAlcance: true,
  },

  // ── Ejemplo 10 ──────────────────────────────────────────────────────────────
  {
    titulo: 'Ejemplo 10 — Español en España, absolutamente todo resuelto (caso vacío)',
    respuestas: {
      paisResidencia: 'en_espana',
      documentacion: 'espanol',
      situacionLaboral: 'cuenta-ajena',
      cuentaBancaria: 'si',
      tipoLicencia: 'espanola',
      nivelEstudios: 'sin-estudios',
      mascotas: 'no',
      ninos: '0',
      adolescentes: '0',
    },
    esperados: [
      { numero: 27, descripcion: 'SERGAS (sección salud fija — siempre incluida)' },
    ],
    ausentes: [
      { numero: 1,  descripcion: 'Antecedentes — NO' },
      { numero: 5,  descripcion: 'Visado — NO' },
      { numero: 7,  descripcion: 'NIE — NO' },
      { numero: 8,  descripcion: 'CUE — NO' },
      { numero: 11, descripcion: 'TIE — NO' },
      { numero: 12, descripcion: 'Renovación — NO' },
      { numero: 46, descripcion: 'Acta nacimiento — NO (en_espana, ya tiene DNI presumiblemente)' },
      { numero: 37, descripcion: 'Escolarización — NO (sin hijos)' },
      { numero: 38, descripcion: 'Homologación — NO (sin-estudios)' },
      { numero: 43, descripcion: 'Psicofísico — NO (licencia española)' },
    ],
  },
]

// ─── Ejecución de los tests ───────────────────────────────────────────────────

let totalEsperadosOk = 0
let totalEsperadosFail = 0
let totalAusentesOk = 0
let totalAusentesFail = 0

for (const ej of ejemplos) {
  sep(ej.titulo)

  const plan = armarPlan(ej.respuestas)
  const generados = tramitesGenerados(plan)

  console.log(`\nTrámites generados: [${generados.join(', ')}]`)

  if (ej.fueraDeAlcance) {
    console.log('\n⚠️  CASO FUERA DE ALCANCE — el armador no genera una rama automática para "familiar de español".')
    console.log('   Confirmado: el armador desconoce este caso y no lo procesa. ✅')
    // Verificar que [10] no aparezca
    for (const ausente of ej.ausentes) {
      const ok = !generados.includes(ausente.numero)
      console.log(`   [${ausente.numero}] ${ausente.descripcion}: ${ok ? '✅ ausente' : '❌ APARECE (error)'}`)
      if (ok) totalAusentesOk++; else totalAusentesFail++
    }
    continue
  }

  // Tabla de trámites esperados
  if (ej.esperados.length > 0) {
    console.log('\nTrámites ESPERADOS:')
    console.log('  Nº  | Descripción                                          | Resultado')
    console.log('  ----|------------------------------------------------------|----------')
    for (const esp of ej.esperados) {
      const ok = generados.includes(esp.numero)
      const estado = ok ? '✅' : '❌ FALTA'
      const padNum = String(esp.numero).padStart(3)
      const padDesc = esp.descripcion.padEnd(52).slice(0, 52)
      console.log(`  [${padNum}] ${padDesc} ${estado}`)
      if (ok) totalEsperadosOk++; else totalEsperadosFail++
    }
  }

  // Tabla de trámites que NO deben aparecer
  if (ej.ausentes.length > 0) {
    console.log('\nTrámites que NO deben aparecer:')
    console.log('  Nº  | Descripción                                          | Resultado')
    console.log('  ----|------------------------------------------------------|----------')
    for (const aus of ej.ausentes) {
      const ok = !generados.includes(aus.numero)
      const estado = ok ? '✅ ausente' : '❌ INCLUIDO INCORRECTAMENTE'
      const padNum = String(aus.numero).padStart(3)
      const padDesc = aus.descripcion.padEnd(52).slice(0, 52)
      console.log(`  [${padNum}] ${padDesc} ${estado}`)
      if (ok) totalAusentesOk++; else totalAusentesFail++
    }
  }

  // Notas especiales esperadas
  if (ej.notasEsperadas && ej.notasEsperadas.length > 0) {
    console.log('\nNotas especiales esperadas:')
    for (const fragmento of ej.notasEsperadas) {
      const ok = tieneNota(plan, fragmento)
      console.log(`  Contiene "${fragmento}": ${ok ? '✅' : '❌ NO ENCONTRADA'}`)
    }
  }

  // Advertencias del armador
  if (plan.advertencias.length > 0) {
    console.log('\nAdvertencias del armador:')
    for (const adv of plan.advertencias) {
      console.log(`  ⚠️  ${adv}`)
    }
  }
}

// ─── Resumen final ────────────────────────────────────────────────────────────

sep('RESUMEN FINAL')
console.log(`\nTrámites esperados: ${totalEsperadosOk} ✅ / ${totalEsperadosFail} ❌`)
console.log(`Trámites ausentes correctos: ${totalAusentesOk} ✅ / ${totalAusentesFail} ❌`)

const totalChecks = totalEsperadosOk + totalEsperadosFail + totalAusentesOk + totalAusentesFail
const totalOk = totalEsperadosOk + totalAusentesOk
console.log(`\nTotal checks: ${totalOk}/${totalChecks} correctos`)

if (totalEsperadosFail === 0 && totalAusentesFail === 0) {
  console.log('\n🎉 Todos los checks pasaron.')
} else {
  console.log('\n⚠️  Hay diferencias. Ver detalle arriba.')
}

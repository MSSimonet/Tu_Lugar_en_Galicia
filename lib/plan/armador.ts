/**
 * lib/plan/armador.ts — Armador del Plan Estratégico personalizado
 *
 * Toma las respuestas relevantes de un lead (capturadas por Gina) y produce
 * una lista ordenada de trámites (con su frase puente y fase) lista para
 * renderizar el Plan Estratégico.
 *
 * Reglas de negocio: docs/mapeo-gina-plan.md (fuente de verdad)
 * Orden cronológico: docs/plan-estrategico.md (Parte 2)
 * Frases puente: docs/frases-puente.md (embebidas abajo en FRASES_PUENTE)
 *
 * NO genera HTML, PDF ni email — eso corresponde a piezas 2 y 3.
 */

import type { LeadData } from '../leads'

// ─── Tipos de entrada ──────────────────────────────────────────────────────────

/**
 * Subconjunto de LeadData relevante para armar el plan.
 * Usa los nombres exactos de campo que Gina guarda en Supabase (tabla `leads`).
 *
 * Nota sobre `modalidad`: es el campo correcto para detectar si la persona ya
 * reside en España ('ya-en-espana') o viene de fuera ('antes-de-viajar') — lo
 * setean explícitamente tanto Gina como el formulario web, sin re-derivarlo de
 * `paisResidencia` (que para quien ya vive en España vale el string 'España',
 * no un valor centinela).
 */
export type RespuestasLead = Pick<LeadData,
  | 'paisResidencia'
  | 'documentacion'
  | 'situacionLaboral'
  | 'mascotas'
> & {
  modalidad?: LeadData['modalidad']
  cuentaBancaria?: LeadData['cuentaBancaria']
  tipoLicencia?: LeadData['tipoLicencia']
  nivelEstudios?: LeadData['nivelEstudios']
  ninos?: LeadData['ninos']
  adolescentes?: LeadData['adolescentes']
  presupuestoMensual?: LeadData['presupuestoMensual']
  garantias?: LeadData['garantias']
  fechaLlegada?: string
  necesidadesEspeciales?: LeadData['necesidadesEspeciales']
  adultos?: LeadData['adultos']
}

// ─── Tipos de salida ───────────────────────────────────────────────────────────

export type Fase =
  | 'fase-a-antes-viajar'
  | 'fase-b-llegada-residencia'
  | 'fase-c-identidad-digital'
  | 'fase-d-trabajo-ss'
  | 'fase-e-salud'
  | 'fase-f-familia-estudios-conduccion'

export type BloqueTramite = {
  tipo: 'tramite'
  numero: number
  frasePuente: string
  fase: Fase
}

export type NotaEspecial = {
  tipo: 'nota'
  texto: string
  fase: Fase
}

type ItemPlan = BloqueTramite | NotaEspecial

export type PlanArmado = {
  items: ItemPlan[]
  /** Casos ambiguos que requieren definición de producto o verificación humana */
  advertencias: string[]
}

// ─── Frases puente (fuente: docs/frases-puente.md) ────────────────────────────

const FRASES_PUENTE: Record<number, string> = {
  1:  'Tu camino empieza aquí mismo, en {{PAIS_ORIGEN}}, con un primer paso sencillo de conseguir:',
  2:  'Con ese documento en mano, el siguiente paso es darle validez para España:',
  3:  'Y para que la administración española los acepte sin contratiempos, conviene traducirlos oficialmente:',
  4:  'Como todavía no tienes cuenta en España, este paso puedes adelantarlo desde casa y llegar con terreno ganado:',
  5:  'Tu situación de visado marca el punto de partida; es el paso que te abre las puertas de España:',
  6:  'Ya en España, si tu pasaporte no trae sello de entrada, este trámite rápido lo resuelve:',
  7:  'Este número será tu llave para casi todo lo que venga después, así que conviene tenerlo pronto:',
  8:  'Como ciudadano de la UE, tu camino es más directo: en lugar del NIE, te corresponde el CUE:',
  9:  'Y para que tus familiares que no son de la UE queden igual de cubiertos:',
  10: 'Tu vínculo con un ciudadano español te abre una vía propia, más favorable para ti:',
  11: 'Con el NIE y el empadronamiento ya resueltos, llega el momento de tu tarjeta física de residencia:',
  12: 'Cuando tu tarjeta se acerque al vencimiento, renovarla será un trámite de rutina:',
  13: 'Si en algún momento extravías la TIE, recuperarla es sencillo:',
  14: 'Tras varios años echando raíces aquí, podrás dar el salto a la residencia de larga duración:',
  15: 'Si necesitas demostrar oficialmente tu situación de residencia, este certificado lo acredita:',
  16: 'Y si llegas a obtener la nacionalidad española, este paso enlazará tu historial sin cabos sueltos:',
  17: 'Ya instalado y empadronado, conviene cerrar tu antiguo registro consular (mejor en este momento, no antes):',
  18: 'Para resolver tus trámites por internet, sin colas ni desplazamientos, te conviene el certificado digital:',
  19: 'Y si prefieres algo todavía más simple para identificarte ante el Estado:',
  20: 'Para los trámites propios de Galicia —incluida tu salud online— este es el sistema de la Xunta:',
  21: 'Este es uno de los pasos clave de todo tu camino: lo necesitarás para la sanidad, el colegio y tu residencia:',
  22: 'Y este pequeño documento lo reutilizarás una y otra vez, así que ten siempre uno a mano:',
  23: 'Como trabajarás por cuenta propia, tu primer paso es presentarte ante Hacienda:',
  24: 'Para empezar a cotizar en España y activar tus derechos, necesitas tu número de Seguridad Social:',
  25: 'Con tu contrato por cuenta ajena, tu alta la gestiona la empresa por esta vía:',
  26: 'Como serás autónomo, este es el paso que pone tu actividad en regla:',
  27: 'Para que tú y los tuyos tengáis médico y atención en Galicia desde el primer día:',
  28: 'Y para que tu familia tenga también su propia tarjeta sanitaria:',
  31: 'Si planeas viajar por Europa, esta tarjeta te mantiene cubierto en esos trayectos:',
  32: 'Tus raíces gallegas te dan derecho a una tarjeta sanitaria especial:',
  33: 'Para llevar tu tarjeta y tus recetas siempre contigo, en el móvil:',
  34: 'Y si quieres elegir o cambiar de médico o pediatra, estás en tu derecho:',
  35: 'Para consultar tu historial y tus informes médicos cuando lo necesites:',
  37: 'Como en la mudanza vienen niños, asegurar su plaza en el colegio es de lo primero:',
  38: 'Para que los estudios que ya cursaron tengan plena validez aquí:',
  39: 'Para que tu título de Formación Profesional sea reconocido en España:',
  40: 'Si tu profesión en España está regulada, la homologación del título universitario es el trámite obligatorio:',
  41: 'Y si tu profesión no está regulada, la declaración de equivalencia es más ágil y suficiente:',
  42: 'Al ser tu título de la UE, el reconocimiento es todavía más directo:',
  43: 'Como traes tu licencia de conducir, el primer paso es un sencillo examen médico:',
  44: 'Y como tu país tiene convenio con España, podrás canjearla sin volver a examinarte:',
  45: 'Como tu país no tiene convenio (o prefieres sacarlo aquí), este es el camino por la DGT:',
  46: 'Como eres español pero aún sin DNI, tu primer documento a conseguir desde {{PAIS_ORIGEN}} es tu partida de nacimiento:',
  47: 'Y ya en Galicia, tras empadronarte, podrás estrenar por fin tu primer DNI:',
  48: 'Como vienes a formarte, esta es la vía que te permite estudiar y residir con tranquilidad:',
  49: 'Como viajas con tu mascota, conviene empezar pronto: su preparación es de las cosas que más se demoran. El primer paso es identificarla:',
  50: 'Con el microchip puesto, el siguiente paso es su vacuna antirrábica:',
  51: 'Cerca del viaje, necesitarás un certificado veterinario que la declare sana y apta:',
  52: 'Y el documento oficial que autoriza su salida del país:',
  53: 'No olvides reservar su lugar en el vuelo con tiempo, porque los cupos son limitados:',
  54: 'El mismo día del viaje, el último paso antes de volar:',
  55: 'Y como tu perro es de una raza considerada potencialmente peligrosa, ya en España necesitarás una licencia especial:',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function t(numero: number, fase: Fase): BloqueTramite {
  return {
    tipo: 'tramite',
    numero,
    frasePuente: FRASES_PUENTE[numero] ?? `[Frase puente del trámite ${numero} — pendiente]`,
    fase,
  }
}

function n(texto: string, fase: Fase): NotaEspecial {
  return { tipo: 'nota', texto, fase }
}

/** true si el lead viene de fuera de España (no seleccionó "ya vivo en España") */
function vieneDeFuera(r: RespuestasLead): boolean {
  return r.modalidad !== 'ya-en-espana'
}

/**
 * true si hay al menos un menor (niño 0–12 o adolescente 13–17).
 * ninos/adolescentes son strings '0'|'1'|'2'|'3+' o undefined.
 */
function tieneHijos(r: RespuestasLead): boolean {
  return (r.ninos ?? '0') !== '0' || (r.adolescentes ?? '0') !== '0'
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function armarPlan(r: RespuestasLead): PlanArmado {
  const items: ItemPlan[] = []
  const advertencias: string[] = []

  const fuera = vieneDeFuera(r)
  const doc   = r.documentacion
  const lab   = r.situacionLaboral

  // ────────────────────────────────────────────────────────────────────────────
  // FASE A — En el país de origen (solo si viene de fuera)
  // Regla P3: fuera → activa "Paso 0". Excepciones por P8 abajo.
  // ────────────────────────────────────────────────────────────────────────────

  if (fuera) {
    // [1][2][3] Antecedentes + Apostilla + Traducción
    // Solo para quienes necesitan tramitar un visado (en-tramite).
    // Espanol: entra con plenos derechos, sin visado → NO lleva [1][2][3].
    // UE-otro: régimen comunitario, sin visado D → NO.
    // Residencia-aprobada: ya tramitó el visado → NO.
    // Turista: caso especial (ver nota obligatoria más abajo) → omitir [1][2][3].
    // Nacionalidad-en-tramite: ya reside legalmente → NO.
    if (doc === 'en-tramite') {
      items.push(t(1, 'fase-a-antes-viajar'))
      items.push(t(2, 'fase-a-antes-viajar'))
      items.push(t(3, 'fase-a-antes-viajar'))
    }

    // [4] Cuenta bancaria de no residente (si aún no tiene)
    if (r.cuentaBancaria === 'no') {
      items.push(t(4, 'fase-a-antes-viajar'))
    }

    // [49–54] Traslado de mascotas (empezar 3–4 meses antes)
    if (r.mascotas === 'si') {
      items.push(t(49, 'fase-a-antes-viajar'))
      items.push(t(50, 'fase-a-antes-viajar'))
      items.push(t(51, 'fase-a-antes-viajar'))
      items.push(t(52, 'fase-a-antes-viajar'))
      items.push(t(53, 'fase-a-antes-viajar'))
      items.push(t(54, 'fase-a-antes-viajar'))
      // Nota condicional PPP [55]: Gina no pregunta la raza → siempre se incluye como aviso
      items.push(n(
        'Si tu perro pertenece a una raza considerada potencialmente peligrosa (PPP), ' +
        'necesitarás además tramitar la Licencia PPP [55] ya en España. ' +
        'Verifica si aplica a tu caso según la raza de tu perro.',
        'fase-a-antes-viajar',
      ))
    }

    // [5] Visado tipo D: solo en-tramite y NO estudiante
    // (Para estudiante, [48] es el visado específico y reemplaza a [5])
    if (doc === 'en-tramite' && lab !== 'estudiante') {
      items.push(t(5, 'fase-a-antes-viajar'))
    }

    // [48] Visado de estudios: solo estudiante viniendo de fuera
    if (lab === 'estudiante') {
      items.push(t(48, 'fase-a-antes-viajar'))
    }

    // [46] Partida de nacimiento para primer DNI: solo espanol viniendo de fuera
    if (doc === 'espanol') {
      items.push(t(46, 'fase-a-antes-viajar'))
    }
  } else {
    // Ya en España: solo la nota PPP si tiene mascotas (licencia se tramita aquí)
    if (r.mascotas === 'si') {
      items.push(n(
        'Si tu perro pertenece a una raza considerada potencialmente peligrosa (PPP), ' +
        'necesitarás tramitar la Licencia PPP [55] en España. ' +
        'Verifica si aplica a tu caso según la raza de tu perro.',
        'fase-a-antes-viajar',
      ))
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // FASE B — Llegada y residencia legal
  // ────────────────────────────────────────────────────────────────────────────

  // Alerta de urgencia: plazo menor a 1 mes
  if (r.fechaLlegada === 'menos-1-mes') {
    items.push(n(
      '⚠️ PLAZO URGENTE — Tienes menos de 1 mes para tu llegada. ' +
      'Te recomendamos gestionar alojamiento temporal para las primeras semanas ' +
      '(hotel, apartamento o familiar) mientras se resuelve el contrato de alquiler definitivo. ' +
      'Prioriza los trámites de las primeras fases: cada día cuenta.',
      'fase-b-llegada-residencia',
    ))
  }

  // Nota obligatoria TURISTA: caso que requiere conversación con Silvana
  if (doc === 'turista') {
    items.push(n(
      '⚠️ ATENCIÓN — Este caso requiere conversación directa con nuestro equipo. ' +
      'Como entrarás como turista, las vías de regularización son limitadas y dependen de tu situación concreta ' +
      '(visado de nómada digital, arraigo, Ley Beckham, etc.). ' +
      'No es posible generar un plan automático completo; el equipo lo estudiará contigo en la videollamada.',
      'fase-b-llegada-residencia',
    ))
  }

  // Nota explicativa NACIONALIDAD EN TRÁMITE: dos escenarios según fase de la tramitación
  if (doc === 'nacionalidad-en-tramite') {
    items.push(n(
      'Tu situación tiene dos momentos distintos que el plan cubre:\n\n' +
      '**Mientras se resuelve la tramitación de la nacionalidad:** ya residís legalmente, ' +
      'así que mantenés tu residencia actual. Si tu TIE o autorización está próxima a vencer, ' +
      'incluí la Renovación [12] a tiempo.\n\n' +
      '**Al obtener la nacionalidad española:** tramitás el Certificado de Concordancia [16] ' +
      '(enlaza tu historial de NIE con el nuevo DNI sin cabos sueltos) y luego el primer DNI [46]/[47].',
      'fase-b-llegada-residencia',
    ))
    // Incluir renovacion, concordancia y primer DNI como trámites del plan
    items.push(t(12, 'fase-b-llegada-residencia'))
    items.push(t(16, 'fase-b-llegada-residencia'))
    items.push(t(46, 'fase-b-llegada-residencia'))
    items.push(t(47, 'fase-b-llegada-residencia'))
  }

  // [6] Declaración de entrada: en-tramite viniendo de fuera (primeras 72 h)
  if (doc === 'en-tramite' && fuera) {
    items.push(t(6, 'fase-b-llegada-residencia'))
  }

  // [7] NIE: solo en-tramite (turista no debe generar trámites adicionales, solo la nota)
  if (doc === 'en-tramite') {
    items.push(t(7, 'fase-b-llegada-residencia'))
  }

  // [8] CUE: solo ue-otro (régimen comunitario; NO lleva NIE ni TIE)
  if (doc === 'ue-otro') {
    items.push(t(8, 'fase-b-llegada-residencia'))
  }

  // [9] Nota familias mixtas UE/extracomunitario: si hay más de 1 adulto en el grupo
  // es posible que alguno no tenga pasaporte UE/EEE/Suiza y necesite Tarjeta Familiar [9]
  if (doc === 'ue-otro' && r.adultos && r.adultos !== '1') {
    items.push(n(
      'Si alguno de los adultos de tu grupo familiar no tiene pasaporte de la UE, EEE o Suiza, ' +
      'necesitará tramitar la Tarjeta de Residencia de Familiar de Ciudadano de la UE [9]. ' +
      'Este trámite se realiza en España una vez instalado el núcleo familiar y les permite ' +
      'residir, estudiar y trabajar con las mismas condiciones que un ciudadano comunitario. ' +
      'El equipo puede orientarte en la videollamada.',
      'fase-b-llegada-residencia',
    ))
  }

  // [11] TIE: en-tramite, residencia-aprobada (si no tiene física aún)
  if (doc === 'en-tramite' || doc === 'residencia-aprobada') {
    items.push(t(11, 'fase-b-llegada-residencia'))
  }

  // [12] Renovación TIE: residencia-aprobada (borde item — a futuro cuando venza)
  // Para nacionalidad-en-tramite ya se incluyó arriba en la nota.
  if (doc === 'residencia-aprobada') {
    items.push(t(12, 'fase-b-llegada-residencia'))
  }

  // [21] Empadronamiento: SIEMPRE — requisito de TIE, sanidad y escolarización
  items.push(t(21, 'fase-b-llegada-residencia'))

  // [22] Volante de empadronamiento: SIEMPRE (se reutiliza en muchos trámites)
  items.push(t(22, 'fase-b-llegada-residencia'))

  // [17] Baja consular: solo si viene de fuera (se tramita YA EN ESPAÑA tras empadronarse)
  if (fuera) {
    items.push(t(17, 'fase-b-llegada-residencia'))
  }

  // [47] Primer DNI: espanol viniendo de fuera, tras empadronamiento
  // Si ya está en España (en_espana + espanol): se asume que ya tiene algún DNI o ID vigente;
  // confirmar en videollamada si aplican [46]/[47].
  if (doc === 'espanol' && fuera) {
    items.push(t(47, 'fase-b-llegada-residencia'))
  }

  // ────────────────────────────────────────────────────────────────────────────
  // FASE C — Identidad digital (habilita gestiones online con la administración)
  // ────────────────────────────────────────────────────────────────────────────

  items.push(t(18, 'fase-c-identidad-digital'))
  items.push(t(19, 'fase-c-identidad-digital'))
  items.push(t(20, 'fase-c-identidad-digital'))

  // ────────────────────────────────────────────────────────────────────────────
  // FASE D — Trabajo y Seguridad Social (según P9)
  // ────────────────────────────────────────────────────────────────────────────

  if (lab === 'cuenta-ajena') {
    items.push(t(24, 'fase-d-trabajo-ss'))
    items.push(t(25, 'fase-d-trabajo-ss'))
  } else if (lab === 'autonomo') {
    items.push(t(23, 'fase-d-trabajo-ss'))
    items.push(t(24, 'fase-d-trabajo-ss'))
    items.push(t(26, 'fase-d-trabajo-ss'))
  } else if (lab === 'teletrabajo-extranjero') {
    // AMBIGUO: depende del convenio bilateral entre España y el país del lead, y del tipo de contrato.
    // Con convenio (Argentina, Colombia…): puede cotizar en su país 1–2 años, sin alta en España.
    // Sin convenio o si prefiere darse de alta aquí como autónomo → [23]+[24]+[26].
    // Con visado de nómada digital puede acogerse a régimen fiscal especial (Ley Beckham).
    // Requiere definición de producto o consulta con gestor/AEAT.
    advertencias.push(
      'AMBIGUO — situacionLaboral=teletrabajo-extranjero: la situación de Seguridad Social ' +
      'depende del convenio bilateral con el país de origen y del tipo de contrato. ' +
      'El armador no puede determinar automáticamente los trámites; se incluye nota orientativa.',
    )
    items.push(n(
      '⚠️ Tu situación laboral (teletrabajo para empresa extranjera) requiere análisis específico. ' +
      'Las obligaciones de Seguridad Social dependen del convenio bilateral entre España y tu país, ' +
      'y del tipo de contrato que tengas. Si hay convenio (Argentina, Colombia…), puedes mantener ' +
      'tu cotización en origen hasta 1–2 años. Si cotizas aquí como autónomo, aplican los pasos ' +
      '[23]+[24]+[26]. Con visado de nómada digital, puede existir un régimen fiscal especial ' +
      '(Ley Beckham). El equipo te orientará en la videollamada.',
      'fase-d-trabajo-ss',
    ))
  }
  // rentista, jubilado, busca-empleo: sin trámites de SS (solo sección Salud)
  // estudiante: sin alta laboral

  // ────────────────────────────────────────────────────────────────────────────
  // FASE E — Salud / SERGAS (sección fija — SIEMPRE se incluye)
  // Gina no pregunta cobertura sanitaria → el plan explica ambas vías.
  // ────────────────────────────────────────────────────────────────────────────

  items.push(t(27, 'fase-e-salud'))

  // [28] Beneficiarios: si hay menores a cargo (dato disponible del cuestionario)
  if (tieneHijos(r)) {
    items.push(t(28, 'fase-e-salud'))
  }

  // Nota TSE [31] para ciudadanos UE que mantienen derechos en su país de origen
  if (doc === 'ue-otro') {
    items.push(n(
      'Si mantienes derechos sanitarios en tu país de origen de la UE, puedes solicitar ' +
      'la Tarjeta Sanitaria Europea [31], que cubre atención durante viajes temporales ' +
      'por Europa.',
      'fase-e-salud',
    ))
  }

  // Nota Tarxeta Galicia Saúde Exterior [32] para gallegos de origen/descendientes
  // Gina no captura este dato → se incluye siempre como aviso informativo
  items.push(n(
    'Si eres de origen gallego o descendiente de gallegos, puedes solicitar la ' +
    'Tarxeta Galicia Saúde Exterior [32], que da acceso a atención sanitaria en Galicia ' +
    'incluso sin alta en la Seguridad Social española.',
    'fase-e-salud',
  ))

  // [33][34][35] Herramientas digitales de salud — disponibles tras activar la tarjeta SERGAS [27]
  items.push(n(
    'Una vez con tu tarjeta sanitaria activa, tres herramientas digitales del SERGAS te ayudarán ' +
    'a gestionar tu salud desde el móvil o desde casa — todas gratuitas:',
    'fase-e-salud',
  ))
  items.push(t(33, 'fase-e-salud'))
  items.push(t(34, 'fase-e-salud'))
  items.push(t(35, 'fase-e-salud'))

  // ────────────────────────────────────────────────────────────────────────────
  // FASE F — Familia, estudios y conducción
  // ────────────────────────────────────────────────────────────────────────────

  // [37] Escolarización: si ninos ≥ 1 o adolescentes ≥ 1 (todos en edad escolar)
  if (tieneHijos(r)) {
    items.push(t(37, 'fase-f-familia-estudios-conduccion'))
  }

  // Homologación según nivel de estudios
  const est = r.nivelEstudios
  if (est === 'bachillerato') {
    items.push(t(38, 'fase-f-familia-estudios-conduccion'))
  } else if (est === 'tecnico') {
    items.push(t(39, 'fase-f-familia-estudios-conduccion'))
  } else if (est === 'universitario' || est === 'posgrado') {
    // La vía depende de si la profesión es regulada, dato que Gina no captura.
    // Se incluyen [40] y [41] como alternativas con nota orientativa.
    // [42] solo si el título es de la UE/EEE/Suiza (implícito en doc === 'ue-otro').
    items.push(n(
      'La homologación de tu título universitario/posgrado sigue una de estas vías, ' +
      'según si tu profesión es regulada en España. El equipo verificará cuál aplica:',
      'fase-f-familia-estudios-conduccion',
    ))
    items.push(t(40, 'fase-f-familia-estudios-conduccion'))
    items.push(t(41, 'fase-f-familia-estudios-conduccion'))
    if (doc === 'ue-otro') {
      items.push(t(42, 'fase-f-familia-estudios-conduccion'))
    }
  }

  // Licencia de conducir
  const lic = r.tipoLicencia
  if (lic === 'origen') {
    items.push(t(43, 'fase-f-familia-estudios-conduccion'))
    // El canje vs. examen DGT depende de si el país tiene convenio con España.
    // Gina no captura el país específico de la licencia → se incluyen ambas opciones con nota.
    items.push(n(
      'El siguiente paso depende de si tu país tiene convenio de canje con España: ' +
      'si lo tiene → [44] Canje de licencia (sin examen); si no → [45] Exámenes DGT (permiso nuevo). ' +
      'El equipo verificará cuál aplica según tu país.',
      'fase-f-familia-estudios-conduccion',
    ))
    items.push(t(44, 'fase-f-familia-estudios-conduccion'))
    items.push(t(45, 'fase-f-familia-estudios-conduccion'))
  } else if (lic === 'no-tiene') {
    items.push(n(
      'Si en algún momento decides obtener el permiso de conducir en España, el trámite ' +
      'es [45] (Exámenes DGT). Es opcional.',
      'fase-f-familia-estudios-conduccion',
    ))
  }
  // espanola / europea: nada (válidas para conducir en España)

  if (r.necesidadesEspeciales === 'si') {
    items.push(n(
      'Uno o más miembros de tu hogar tiene necesidades especiales o discapacidad. ' +
      'En Galicia, el reconocimiento oficial del grado de discapacidad se solicita ante la ' +
      'Consellería de Política Social da Xunta de Galicia. Este reconocimiento abre el acceso a ' +
      'ayudas, prestaciones y recursos específicos. Te recomendamos iniciarlo en cuanto estés ' +
      'empadronado. El equipo puede orientarte en la videollamada.',
      'fase-f-familia-estudios-conduccion',
    ))
  }

  return { items, advertencias }
}

/**
 * Caso fuera de alcance del armador automático:
 *
 * "Familiar de ciudadano español" — surge en la conversación con Silvana
 * (no hay campo en Gina que lo capture). Trámite asociado: [10] Autorización
 * de residencia de familiares de españoles (régimen RD 1155/2024, Título X).
 * El armador NO genera una rama automática para este caso.
 */
export const CASOS_FUERA_DE_ALCANCE = [
  'familiar-de-espanol',
] as const

'use client'

import { useCallback, useState } from 'react'

/**
 * Validación híbrida: silenciosa hasta el primer envío, reactiva después.
 *
 * EL PROBLEMA QUE RESUELVE — y por qué ninguno de los dos extremos sirve solo:
 *
 *   · Validar SOLO al enviar (lo que había) deja que la persona rellene el formulario
 *     entero antes de enterarse de nada. En /conocernos son 58 campos repartidos en seis
 *     pantallas de scroll: el momento en que te avisan es el peor posible, porque para
 *     entonces ya invertiste todo el esfuerzo y el error puede estar cinco pantallas atrás.
 *
 *   · Validar SIEMPRE onBlur es peor al principio. Marca en rojo el email a medio escribir
 *     por el simple hecho de haber saltado al campo siguiente, y regaña por campos que la
 *     persona todavía no llegó a tocar. Es hostil justo cuando aún no hizo nada mal.
 *
 * EL HÍBRIDO: nada se marca hasta que se intenta enviar. A partir de ese momento la persona
 * ya sabe que hay errores y está corrigiéndolos, así que cada campo que abandona se
 * revalida al vuelo — y el error desaparece en cuanto queda bien, sin esperar a otro envío.
 * El aviso llega cuando es útil y calla cuando sería ruido.
 *
 * SOLO SE VALIDA EL CAMPO QUE SE ABANDONA, nunca el formulario entero: al salir del primer
 * campo no deben aparecer de golpe los errores de los otros 57. Se recalcula todo por
 * dentro —es barato y evita mantener un validador por campo— pero se aplica un solo error.
 *
 * `validarParaEnviar` y `validarCampo` NO van memoizados a propósito. Cierran sobre
 * `validarTodo`, que a su vez cierra sobre el estado del formulario: memoizarlos los dejaría
 * validando contra los valores del render en que se crearon, y marcarían como vacío un campo
 * que la persona acaba de escribir. Son manejadores de evento, así que recrearlos en cada
 * render no cuesta nada — y la alternativa (guardar `validarTodo` en una ref y refrescarla)
 * es escribir en una ref durante el render, que es justo lo que React desaconseja.
 */
// `E extends object` y no `Record<string, unknown>`: los formularios declaran sus errores como
// `interface FormErrors { email?: string; ... }`, y una interface NO satisface un Record por
// índice — TypeScript solo le da firma de índice implícita a los type alias. Con `object` los
// tres formularios encajan sin tener que reescribir sus tipos.
export function useValidacionHibrida<E extends object>(validarTodo: () => E) {
  const [errores, setErrores] = useState<E>({} as E)
  const [huboIntentoFallido, setHuboIntentoFallido] = useState(false)

  /**
   * Para el submit. Devuelve los errores encontrados: vacío significa que se puede enviar.
   * Es quien enciende el modo reactivo — de ahí en adelante el onBlur empieza a hablar.
   */
  function validarParaEnviar(): E {
    const encontrados = validarTodo()
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) setHuboIntentoFallido(true)
    return encontrados
  }

  /**
   * Para el onBlur de cada campo. No hace nada mientras no haya habido un envío fallido.
   */
  function validarCampo(campo: keyof E) {
    if (!huboIntentoFallido) return
    const todos = validarTodo()
    setErrores((prev) => {
      const siguiente = { ...prev }
      if (todos[campo] === undefined) delete siguiente[campo]
      else siguiente[campo] = todos[campo]
      return siguiente
    })
  }

  /**
   * Para el onChange. Borra el error del campo en cuanto se toca, sin esperar al blur:
   * dejar el mensaje en rojo mientras la persona ya está corrigiendo es puro ruido.
   */
  const limpiarError = useCallback((campo: keyof E) => {
    setErrores((prev) => {
      if (prev[campo] === undefined) return prev
      const siguiente = { ...prev }
      delete siguiente[campo]
      return siguiente
    })
  }, [])

  /** Para el envío exitoso, o para reiniciar el formulario. */
  const limpiarTodo = useCallback(() => {
    setErrores({} as E)
    setHuboIntentoFallido(false)
  }, [])

  return { errores, setErrores, huboIntentoFallido, validarParaEnviar, validarCampo, limpiarError, limpiarTodo }
}

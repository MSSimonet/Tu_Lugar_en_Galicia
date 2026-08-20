'use client'

// ─── Shared field styles ───────────────────────────────────────────────────────

// El borde coral del estado de error no se pintó NUNCA en /conocernos: del error solo se
// veía el mensaje, con el campo en su borde neutro. Eran DOS causas apiladas, y hay que
// quitar las dos — arreglar una sola deja el síntoma igual (comprobado en ese orden).
//
//  1. CHOQUE DE UTILIDADES. `inputBase` traía `border-[var(--dz-borde-input)]` e
//     `inputError` añadía `border-[var(--color-coral)]` encima. Dos utilidades de
//     border-color con la MISMA especificidad: no decide el orden del className sino el
//     de la hoja generada, y ahí el neutro va DESPUÉS del coral (líneas 1524 y 1512 del
//     CSS compilado, medido el 2026-08-19). El neutro ganaba siempre. Por eso el color
//     del borde ya no vive aquí: lo pone `inputBorde` o `inputError`, exactamente uno de
//     los dos. OJO si se vuelve a añadir una utilidad de border-color a `inputBase`.
//
//  2. TRANSICIÓN QUE CONGELA. Sin `transition-all duration-150`. Chromium deja clavado el
//     valor computado de una propiedad transicionada cuando el valor nuevo es un var() —
//     y `border-[var(--color-coral)]` lo es. Aislado con dos elementos idénticos salvo por
//     esa clase, cambiándoles la clase de borde en caliente: el que la tiene se queda en
//     rgb(141,137,127) y el que no, pasa a rgb(184,73,47). Es el mismo mecanismo que
//     congelaba la banda del header al cambiar de tema (ver app/layout.tsx) y el borde de
//     Contacto y Comunidad. Un elemento RECIÉN creado sí pinta coral aunque tenga la
//     transición: solo congela el cambio, no el primer render — de ahí que el bug fuera
//     invisible en cualquier revisión estática del marcado.
export const inputBase =
  'w-full border bg-[var(--color-blanco)] ' +
  'rounded-[var(--dz-radius-input)] px-[var(--space-4)] py-[var(--space-3)] ' +
  'font-[family-name:var(--font-dz-ui)] [font-size:var(--text-sm)] [color:var(--dz-ink)] ' +
  'outline-none focus:ring-2 focus:ring-[var(--color-laton)] focus:border-transparent ' +
  'placeholder:[color:var(--dz-muted)]'

/** El borde en reposo. Va SIEMPRE que no haya error — nunca junto a `inputError`. */
export const inputBorde = 'border-[var(--dz-borde-input)]'

export const inputError = 'border-[var(--color-coral)] focus:ring-[var(--color-coral)]'

export const labelClass =
  'block font-[family-name:var(--font-dz-ui)] font-medium [font-size:var(--text-sm)] ' +
  '[color:var(--dz-ink)] mb-1.5'

export const errorClass = 'mt-[var(--space-1)] [font-size:var(--text-xs)] [color:var(--color-coral)]'

export const sectionTitleClass =
  'font-[family-name:var(--font-dz-display)] [font-size:var(--text-lg)] ' +
  '[color:var(--dz-ink)] font-semibold mb-[var(--space-6)]'

export const sectionClass = 'flex flex-col gap-[var(--space-6)]'

// ─── FieldWrapper ──────────────────────────────────────────────────────────────

export function FieldWrapper({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="[color:var(--color-coral)] ml-1" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className={errorClass} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// ─── RadioGroup ───────────────────────────────────────────────────────────────

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  error,
  labelId,
}: {
  name: string
  options: { value: string; label: string }[]
  value: string
  onChange: (val: string) => void
  error?: string
  labelId?: string
}) {
  // El id del mensaje sale de `name`, que ya es la clave del campo en `errors` en los 17
  // grupos de radio del formulario. Mismo patrón `{campo}-error` que los inputs sueltos,
  // así que no hace falta un prop nuevo ni inventar otra convención.
  const errorId = `${name}-error`
  return (
    <div>
      {/* aria-describedby y aria-invalid van en el contenedor con role=radiogroup, que es
          el que expone el grupo al lector de pantalla — no en cada radio: puestos en las
          opciones, el mismo error se anunciaría una vez por opción. Es el mismo criterio
          que ya sigue el fieldset de disponibilidad en el formulario de Comunidad.
          Antes el <p> del error no tenía id y nadie lo referenciaba: se oía al aparecer
          por su role="alert", pero al tabular hasta las opciones quedaba huérfano. */}
      <div
        className="flex flex-col gap-[var(--space-2)]"
        role="radiogroup"
        aria-labelledby={labelId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      >
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-[var(--space-3)] cursor-pointer font-[family-name:var(--font-dz-ui)] [font-size:var(--text-sm)] [color:var(--dz-muted)]"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="accent-[var(--color-laton)] w-4 h-4 cursor-pointer"
            />
            {opt.label}
          </label>
        ))}
      </div>
      {error && <p id={errorId} className={errorClass} role="alert">{error}</p>}
    </div>
  )
}

// ─── CheckboxGroup ────────────────────────────────────────────────────────────

export function CheckboxGroup<T extends string>({
  name,
  options,
  selected,
  onToggle,
  exclusivaValue,
  error,
  labelId,
}: {
  /** Clave del campo en `errors`. De aquí sale el id del mensaje, igual que en RadioGroup.
   *  Es obligatorio a propósito: así TypeScript obliga a pasarlo en cada sitio de uso y no
   *  se puede añadir un grupo nuevo que se quede sin la referencia al error. */
  name: string
  options: { value: T; label: string }[]
  selected: T[]
  onToggle: (val: T) => void
  exclusivaValue?: T
  error?: string
  labelId?: string
}) {
  const exclusivaActiva = !!exclusivaValue && selected.includes(exclusivaValue)
  const hayNoExclusiva = !!exclusivaValue && selected.some((v) => v !== exclusivaValue)
  const errorId = `${name}-error`

  return (
    <div>
      {/* `aria-describedby` sí va en el contenedor (es global y el error describe al grupo
          entero), pero `aria-invalid` NO: ARIA no lo admite en role="group" — a diferencia
          de role="radiogroup", que sí, por eso RadioGroup lo lleva arriba y este no. Un
          lector de pantalla lo ignoraría aquí. Va en cada <input type="checkbox">, donde
          sí está soportado y donde además se anuncia justo cuando el foco entra en la
          opción, que es el momento en que hace falta. */}
      <div
        className="flex flex-col gap-[var(--space-2)]"
        role="group"
        aria-labelledby={labelId}
        aria-describedby={error ? errorId : undefined}
      >
        {options.map((opt) => {
          const bloqueado =
            (exclusivaActiva && opt.value !== exclusivaValue) ||
            (hayNoExclusiva && opt.value === exclusivaValue)
          return (
            <label
              key={opt.value}
              className={`flex items-center gap-[var(--space-3)] font-[family-name:var(--font-dz-ui)] [font-size:var(--text-sm)] [color:var(--dz-muted)] ${bloqueado ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <input
                type="checkbox"
                value={opt.value}
                checked={selected.includes(opt.value)}
                onChange={() => !bloqueado && onToggle(opt.value)}
                disabled={bloqueado}
                aria-invalid={error ? true : undefined}
                className="accent-[var(--color-laton)] w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
              />
              {opt.label}
            </label>
          )
        })}
      </div>
      {error && <p id={errorId} className={errorClass} role="alert">{error}</p>}
    </div>
  )
}

'use client'

// ─── Shared field styles ───────────────────────────────────────────────────────

export const inputBase =
  'w-full border border-[var(--color-arena)] bg-[var(--color-blanco)] ' +
  'rounded-[var(--radius-card)] px-[var(--space-4)] py-[var(--space-3)] ' +
  'font-[family-name:var(--font-ui)] [font-size:var(--text-sm)] [color:var(--color-granito)] ' +
  'outline-none focus:ring-2 focus:ring-[var(--color-laton)] focus:border-transparent ' +
  'transition-all duration-150 placeholder:[color:var(--color-pizarra)]'

export const inputError = 'border-[var(--color-coral)] focus:ring-[var(--color-coral)]'

export const labelClass =
  'block font-[family-name:var(--font-ui)] font-medium [font-size:var(--text-sm)] ' +
  '[color:var(--color-granito)] mb-1.5'

export const errorClass = 'mt-[var(--space-1)] [font-size:var(--text-xs)] [color:var(--color-coral)]'

export const sectionTitleClass =
  'font-[family-name:var(--font-titular)] [font-size:var(--text-lg)] ' +
  '[color:var(--color-granito)] font-semibold mb-[var(--space-6)]'

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
  return (
    <div>
      <div className="flex flex-col gap-[var(--space-2)]" role="radiogroup" aria-labelledby={labelId}>
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-[var(--space-3)] cursor-pointer font-[family-name:var(--font-ui)] [font-size:var(--text-sm)] [color:var(--color-pizarra)]"
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
      {error && <p className={errorClass} role="alert">{error}</p>}
    </div>
  )
}

// ─── CheckboxGroup ────────────────────────────────────────────────────────────

export function CheckboxGroup<T extends string>({
  options,
  selected,
  onToggle,
  exclusivaValue,
  error,
  labelId,
}: {
  options: { value: T; label: string }[]
  selected: T[]
  onToggle: (val: T) => void
  exclusivaValue?: T
  error?: string
  labelId?: string
}) {
  const exclusivaActiva = !!exclusivaValue && selected.includes(exclusivaValue)
  const hayNoExclusiva = !!exclusivaValue && selected.some((v) => v !== exclusivaValue)

  return (
    <div>
      <div className="flex flex-col gap-[var(--space-2)]" role="group" aria-labelledby={labelId}>
        {options.map((opt) => {
          const bloqueado =
            (exclusivaActiva && opt.value !== exclusivaValue) ||
            (hayNoExclusiva && opt.value === exclusivaValue)
          return (
            <label
              key={opt.value}
              className={`flex items-center gap-[var(--space-3)] font-[family-name:var(--font-ui)] [font-size:var(--text-sm)] [color:var(--color-pizarra)] ${bloqueado ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <input
                type="checkbox"
                value={opt.value}
                checked={selected.includes(opt.value)}
                onChange={() => !bloqueado && onToggle(opt.value)}
                disabled={bloqueado}
                className="accent-[var(--color-laton)] w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
              />
              {opt.label}
            </label>
          )
        })}
      </div>
      {error && <p className={errorClass} role="alert">{error}</p>}
    </div>
  )
}

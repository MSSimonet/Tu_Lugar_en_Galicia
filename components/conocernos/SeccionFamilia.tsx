'use client'

import type { FormState, FormErrors } from './useFormulario'
import { RadioGroup, CheckboxGroup, labelClass, sectionTitleClass, sectionClass } from './form-fields'

type Props = {
  form: Pick<FormState, 'adultos' | 'hayMenores' | 'ninos' | 'adolescentes' | 'mascotas' | 'mascotaTipo' | 'cantidadPerros' | 'cantidadGatos' | 'mascotaPeso'>
  errors: FormErrors
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void
  setHayMenores: (v: 'si' | 'no') => void
  setMascotas: (v: 'si' | 'no') => void
  toggleMascotaTipo: (val: 'perro' | 'gato' | 'otro') => void
}

export function SeccionFamilia({ form, errors, set, setHayMenores, setMascotas, toggleMascotaTipo }: Props) {
  return (
    <section aria-labelledby="seccion-familia">
      <h2 id="seccion-familia" className={sectionTitleClass}>Tu familia</h2>
      <div className={sectionClass}>

        {/* Adultos */}
        <div>
          <fieldset>
            <legend id="rg-adultos" className={`${labelClass} mb-[var(--space-2)]`}>
              ¿Cuántos adultos se mudan? (incluyéndote)
              <span className="[color:var(--color-coral)] ml-1" aria-hidden="true">*</span>
            </legend>
            <RadioGroup
              name="adultos"
              options={[
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4+', label: '4 o más' },
              ]}
              value={form.adultos}
              onChange={(v) => set('adultos', v as FormState['adultos'])}
              error={errors.adultos}
              labelId="rg-adultos"
            />
          </fieldset>
        </div>

        {/* ¿Hay menores? */}
        <div>
          <fieldset>
            <legend id="rg-hayMenores" className={`${labelClass} mb-[var(--space-2)]`}>
              ¿Viajan menores de edad contigo?
              <span className="[color:var(--color-coral)] ml-1" aria-hidden="true">*</span>
            </legend>
            <RadioGroup
              name="hayMenores"
              options={[
                { value: 'no', label: 'No' },
                { value: 'si', label: 'Sí' },
              ]}
              value={form.hayMenores}
              onChange={(v) => setHayMenores(v as 'si' | 'no')}
              error={errors.hayMenores}
              labelId="rg-hayMenores"
            />
          </fieldset>

          {form.hayMenores === 'si' && (
            <div className="mt-[var(--space-4)] flex flex-col gap-[var(--space-4)]">
              <div>
                <fieldset>
                  <legend id="rg-ninos" className={`${labelClass} mb-[var(--space-2)]`}>
                    Niños de 0 a 12 años
                    <span className="[color:var(--color-coral)] ml-1" aria-hidden="true">*</span>
                  </legend>
                  <RadioGroup
                    name="ninos"
                    options={[
                      { value: '0', label: '0' },
                      { value: '1', label: '1' },
                      { value: '2', label: '2' },
                      { value: '3+', label: '3 o más' },
                    ]}
                    value={form.ninos}
                    onChange={(v) => set('ninos', v as FormState['ninos'])}
                    error={errors.ninos}
                    labelId="rg-ninos"
                  />
                </fieldset>
              </div>
              <div>
                <fieldset>
                  <legend id="rg-adolescentes" className={`${labelClass} mb-[var(--space-2)]`}>
                    Adolescentes de 13 a 17 años
                    <span className="[color:var(--color-coral)] ml-1" aria-hidden="true">*</span>
                  </legend>
                  <RadioGroup
                    name="adolescentes"
                    options={[
                      { value: '0', label: '0' },
                      { value: '1', label: '1' },
                      { value: '2', label: '2' },
                      { value: '3+', label: '3 o más' },
                    ]}
                    value={form.adolescentes}
                    onChange={(v) => set('adolescentes', v as FormState['adolescentes'])}
                    error={errors.adolescentes}
                    labelId="rg-adolescentes"
                  />
                </fieldset>
              </div>
            </div>
          )}
        </div>

        {/* Mascotas */}
        <div>
          <fieldset>
            <legend id="rg-mascotas" className={`${labelClass} mb-[var(--space-2)]`}>
              ¿Viajan con mascotas? (cerca del 80% de propietarios no las admite)
              <span className="[color:var(--color-coral)] ml-1" aria-hidden="true">*</span>
            </legend>
            <RadioGroup
              name="mascotas"
              options={[
                { value: 'no', label: 'No' },
                { value: 'si', label: 'Sí' },
              ]}
              value={form.mascotas}
              onChange={(v) => setMascotas(v as 'si' | 'no')}
              error={errors.mascotas}
              labelId="rg-mascotas"
            />
          </fieldset>

          {form.mascotas === 'si' && (
            <div className="mt-[var(--space-4)] flex flex-col gap-[var(--space-4)]">
              <div>
                <fieldset>
                  <legend id="rg-mascotaTipo" className={`${labelClass} mb-[var(--space-2)]`}>
                    Tipo de mascota (puedes marcar varias)
                    <span className="[color:var(--color-coral)] ml-1" aria-hidden="true">*</span>
                  </legend>
                  {/* El error se le pasa al componente en vez de pintarlo aquí fuera: así
                      sale con id y el grupo lo referencia por aria-describedby, como los
                      otros 20. Suelto aquí, el <p> quedaba sin id y sin nadie que lo
                      apuntara. El aspecto no cambia — es el mismo errorClass. */}
                  <CheckboxGroup
                    name="mascotaTipo"
                    options={[
                      { value: 'perro' as const, label: 'Perro' },
                      { value: 'gato' as const, label: 'Gato' },
                      { value: 'otro' as const, label: 'Otro' },
                    ]}
                    selected={form.mascotaTipo}
                    onToggle={toggleMascotaTipo}
                    error={errors.mascotaTipo}
                    labelId="rg-mascotaTipo"
                  />
                </fieldset>
              </div>

              {form.mascotaTipo.includes('perro') && (
                <div>
                  <fieldset>
                    <legend id="rg-cantidadPerros" className={`${labelClass} mb-[var(--space-2)]`}>
                      ¿Cuántos perros tienes?
                      <span className="[color:var(--color-coral)] ml-1" aria-hidden="true">*</span>
                    </legend>
                    <RadioGroup
                      name="cantidadPerros"
                      options={[
                        { value: '1', label: '1' },
                        { value: '2', label: '2' },
                        { value: '3+', label: '3 o más' },
                      ]}
                      value={form.cantidadPerros}
                      onChange={(v) => set('cantidadPerros', v as FormState['cantidadPerros'])}
                      error={errors.cantidadPerros}
                      labelId="rg-cantidadPerros"
                    />
                  </fieldset>
                </div>
              )}

              {form.mascotaTipo.includes('gato') && (
                <div>
                  <fieldset>
                    <legend id="rg-cantidadGatos" className={`${labelClass} mb-[var(--space-2)]`}>
                      ¿Cuántos gatos tienes?
                      <span className="[color:var(--color-coral)] ml-1" aria-hidden="true">*</span>
                    </legend>
                    <RadioGroup
                      name="cantidadGatos"
                      options={[
                        { value: '1', label: '1' },
                        { value: '2', label: '2' },
                        { value: '3+', label: '3 o más' },
                      ]}
                      value={form.cantidadGatos}
                      onChange={(v) => set('cantidadGatos', v as FormState['cantidadGatos'])}
                      error={errors.cantidadGatos}
                      labelId="rg-cantidadGatos"
                    />
                  </fieldset>
                </div>
              )}

              {form.mascotaTipo.includes('perro') && (
                <div>
                  <fieldset>
                    <legend id="rg-mascotaPeso" className={`${labelClass} mb-[var(--space-2)]`}>
                      Peso aproximado de tu perro
                      <span className="[color:var(--color-coral)] ml-1" aria-hidden="true">*</span>
                    </legend>
                    <RadioGroup
                      name="mascotaPeso"
                      options={[
                        { value: '0-5 kg', label: 'Menos de 5 kg' },
                        { value: '5-10 kg', label: 'Entre 5 y 10 kg' },
                        { value: '+10 kg', label: 'Más de 10 kg' },
                      ]}
                      value={form.mascotaPeso}
                      onChange={(v) => set('mascotaPeso', v as FormState['mascotaPeso'])}
                      error={errors.mascotaPeso}
                      labelId="rg-mascotaPeso"
                    />
                  </fieldset>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  )
}

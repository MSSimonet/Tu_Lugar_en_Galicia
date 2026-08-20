'use client'

import type { LeadData } from '@/lib/leads'
import type { FormState, FormErrors } from './useFormulario'
import { RadioGroup, CheckboxGroup, labelClass, errorClass, inputBase, inputBorde, inputError, sectionTitleClass, sectionClass } from './form-fields'

type Props = {
  form: Pick<FormState, 'ciudadDestino' | 'tipoInmueble' | 'habitacionesMinimas' | 'presupuestoMensual' | 'amueblado' | 'imprescindibles' | 'comodidades'>
  errors: FormErrors
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void
  setTipoInmueble: (v: 'habitacion' | 'estudio' | 'piso' | 'casa' | 'co-living') => void
  toggleImprescindible: (val: FormState['imprescindibles'][number]) => void
  toggleComodidad: (val: FormState['comodidades'][number]) => void
  /** true cuando el usuario ya vive en España y solo busca integrarse (igual que Gina p20a_objetivo="integrarse") */
  ocultarBusquedaVivienda?: boolean
}

export function SeccionVivienda({ form, errors, set, setTipoInmueble, toggleImprescindible, toggleComodidad, ocultarBusquedaVivienda = false }: Props) {
  return (
    <section aria-labelledby="seccion-vivienda">
      <h2 id="seccion-vivienda" className={sectionTitleClass}>La vivienda que buscas</h2>
      <div className={sectionClass}>

        {/* Ciudad destino */}
        <div>
          <label htmlFor="ciudadDestino" className={labelClass}>
            Ciudad de destino
            <span className="[color:var(--color-coral)] ml-1" aria-hidden="true">*</span>
          </label>
          <select
            id="ciudadDestino"
            value={form.ciudadDestino}
            onChange={(e) => set('ciudadDestino', e.target.value as LeadData['ciudadDestino'])}
            className={`${inputBase} ${errors.ciudadDestino ? inputError : inputBorde}`}
            aria-invalid={errors.ciudadDestino ? true : undefined}
            aria-describedby={errors.ciudadDestino ? 'ciudadDestino-error' : undefined}
          >
            <option value="" disabled>Selecciona una ciudad</option>
            <option value="vigo">Vigo</option>
            <option value="a-coruna">A Coruña</option>
            <option value="santiago">Santiago de Compostela</option>
            <option value="pontevedra">Pontevedra</option>
            <option value="lugo">Lugo</option>
            <option value="indiferente">Me es indiferente</option>
          </select>
          {errors.ciudadDestino && (
            <p id="ciudadDestino-error" className={errorClass} role="alert">{errors.ciudadDestino}</p>
          )}
        </div>

        {/* Presupuesto mensual — siempre visible, Gina lo pregunta antes de la rama "integrarse" */}
        <div>
          <fieldset>
            <legend id="rg-presupuestoMensual" className={`${labelClass} mb-[var(--space-2)]`}>
              Presupuesto mensual de alquiler
              <span className="[color:var(--color-coral)] ml-1" aria-hidden="true">*</span>
            </legend>
            <RadioGroup
              name="presupuestoMensual"
              options={[
                { value: 'menos-700', label: 'Menos de 700 €' },
                { value: '700-1000', label: '700 € a 1.000 €' },
                { value: '1000-1400', label: '1.000 € a 1.400 €' },
                { value: 'mas-1400', label: 'Más de 1.400 €' },
              ]}
              value={form.presupuestoMensual}
              onChange={(v) => set('presupuestoMensual', v as LeadData['presupuestoMensual'])}
              error={errors.presupuestoMensual}
              labelId="rg-presupuestoMensual"
            />
          </fieldset>
        </div>

        {/* Búsqueda de vivienda — oculta si ya vive en España y solo busca integrarse (Gina p20a_objetivo="integrarse") */}
        {!ocultarBusquedaVivienda && (
          <>
            {/* Tipo de inmueble */}
            <div>
              <label htmlFor="tipoInmueble" className={labelClass}>
                Tipo de vivienda
                <span className="[color:var(--color-coral)] ml-1" aria-hidden="true">*</span>
              </label>
              <select
                id="tipoInmueble"
                value={form.tipoInmueble}
                onChange={(e) => setTipoInmueble(e.target.value as 'habitacion' | 'estudio' | 'piso' | 'casa' | 'co-living')}
                className={`${inputBase} ${errors.tipoInmueble ? inputError : inputBorde}`}
                aria-invalid={errors.tipoInmueble ? true : undefined}
                aria-describedby={errors.tipoInmueble ? 'tipoInmueble-error' : undefined}
              >
                <option value="" disabled>Selecciona una opción</option>
                <option value="habitacion">Habitación en piso compartido</option>
                <option value="estudio">Estudio / Loft</option>
                <option value="piso">Piso / Apartamento</option>
                <option value="casa">Casa</option>
                <option value="co-living">Co-living</option>
              </select>
              {errors.tipoInmueble && (
                <p id="tipoInmueble-error" className={errorClass} role="alert">{errors.tipoInmueble}</p>
              )}
            </div>

            {/* Habitaciones — oculto para estudio */}
            {form.tipoInmueble !== 'estudio' && (
              <div>
                <fieldset>
                  <legend id="rg-habitacionesMinimas" className={`${labelClass} mb-[var(--space-2)]`}>
                    Habitaciones mínimas
                    {form.tipoInmueble !== '' && <span className="[color:var(--color-coral)] ml-1" aria-hidden="true">*</span>}
                  </legend>
                  <RadioGroup
                    name="habitacionesMinimas"
                    options={[
                      { value: '1', label: '1' },
                      { value: '2', label: '2' },
                      { value: '3', label: '3' },
                      { value: '4+', label: '4 o más' },
                    ]}
                    value={form.habitacionesMinimas}
                    onChange={(v) => set('habitacionesMinimas', v as FormState['habitacionesMinimas'])}
                    error={errors.habitacionesMinimas}
                    labelId="rg-habitacionesMinimas"
                  />
                </fieldset>
              </div>
            )}

            {/* Amueblado */}
            <div>
              <fieldset>
                <legend id="rg-amueblado" className={`${labelClass} mb-[var(--space-2)]`}>
                  ¿Prefieres la vivienda amueblada?
                  <span className="[color:var(--color-coral)] ml-1" aria-hidden="true">*</span>
                </legend>
                <RadioGroup
                  name="amueblado"
                  options={[
                    { value: 'si', label: 'Sí, completamente amueblada' },
                    { value: 'no', label: 'Sin muebles' },
                    { value: 'indiferente', label: 'Indiferente' },
                  ]}
                  value={form.amueblado}
                  onChange={(v) => set('amueblado', v as LeadData['amueblado'])}
                  error={errors.amueblado}
                  labelId="rg-amueblado"
                />
              </fieldset>
            </div>

            {/* Imprescindibles — "Ninguno" excluyente */}
            <div>
              <fieldset>
                <legend id="rg-imprescindibles" className={`${labelClass} mb-[var(--space-2)]`}>
                  ¿Hay algo imprescindible para la vivienda? (opcional)
                </legend>
                <CheckboxGroup
                  name="imprescindibles"
                  options={[
                    { value: 'ascensor' as const, label: 'Ascensor' },
                    { value: 'garaje' as const, label: 'Plaza de garaje' },
                    { value: 'calefaccion' as const, label: 'Calefacción central o gas' },
                    { value: 'terraza' as const, label: 'Terraza / exterior' },
                    { value: 'no' as const, label: 'Ninguno en particular' },
                  ]}
                  selected={form.imprescindibles}
                  onToggle={toggleImprescindible}
                  exclusivaValue="no"
                  labelId="rg-imprescindibles"
                />
              </fieldset>
            </div>

            {/* Comodidades — "Ninguna" excluyente */}
            <div>
              <fieldset>
                <legend id="rg-comodidades" className={`${labelClass} mb-[var(--space-2)]`}>
                  ¿Alguna comodidad del entorno es importante para ti? (opcional)
                </legend>
                <CheckboxGroup
                  name="comodidades"
                  options={[
                    { value: 'transporte' as const, label: 'Cerca del transporte público' },
                    { value: 'zona-tranquila' as const, label: 'Zona tranquila / residencial' },
                    { value: 'cerca-colegios' as const, label: 'Cerca de colegios' },
                    { value: 'internet' as const, label: 'Fibra óptica / buen internet' },
                    { value: 'ninguna' as const, label: 'Ninguna en particular' },
                  ]}
                  selected={form.comodidades}
                  onToggle={toggleComodidad}
                  exclusivaValue="ninguna"
                  labelId="rg-comodidades"
                />
              </fieldset>
            </div>
          </>
        )}

      </div>
    </section>
  )
}

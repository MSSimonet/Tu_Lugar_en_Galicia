'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import type { LeadData } from '@/lib/leads'
import { useFormulario } from './useFormulario'
import { SeccionFamilia } from './SeccionFamilia'
import { SeccionVivienda } from './SeccionVivienda'
import {
  FieldWrapper,
  RadioGroup,
  CheckboxGroup,
  inputBase,
  inputError,
  labelClass,
  errorClass,
  sectionTitleClass,
  sectionClass,
} from './form-fields'

// ─── Main Component ────────────────────────────────────────────────────────────

export function FormularioDiagnostico() {
  const {
    form,
    errors,
    status,
    set,
    setHayMenores,
    setMascotas,
    setTipoInmueble,
    toggleGarantia,
    toggleMascotaTipo,
    toggleImprescindible,
    toggleComodidad,
    handleSubmit,
    whatsappUrl,
    formRef,
  } = useFormulario()

  // ── Success ────────────────────────────────────────────────────────────────

  if (status === 'success') {
    return (
      <div
        className="rounded-[var(--radius-card)] bg-[var(--color-niebla)] border border-[var(--color-arena)] p-[var(--space-12)] text-center flex flex-col items-center gap-[var(--space-6)]"
        role="status"
        aria-live="polite"
      >
        <div className="text-4xl" aria-hidden="true">🏡</div>
        <h2 className="font-[family-name:var(--font-titular)] text-[var(--text-xl)] text-[var(--color-granito)] font-semibold">
          ¡Recibimos tu consulta!
        </h2>
        <p className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] max-w-md leading-[var(--leading-cuerpo)]">
          Te respondemos en <strong>48 horas hábiles</strong>. Pronto tendrás noticias nuestras.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center font-[family-name:var(--font-ui)] font-medium rounded-[var(--radius-pill)] transition-all duration-150 bg-[var(--color-laton)] text-white hover:bg-[var(--color-laton-oscuro)] tracking-[var(--tracking-ui)] uppercase px-[var(--space-6)] py-[var(--space-3)] text-[var(--text-sm)]"
        >
          Volver al inicio
        </Link>
      </div>
    )
  }

  // ── Partial (503) ──────────────────────────────────────────────────────────

  if (status === 'partial') {
    return (
      <div
        className="rounded-[var(--radius-card)] bg-[var(--color-niebla)] border border-[var(--color-arena)] p-[var(--space-12)] text-center flex flex-col items-center gap-[var(--space-6)]"
        role="status"
        aria-live="polite"
      >
        <div className="text-4xl" aria-hidden="true">🙏</div>
        <h2 className="font-[family-name:var(--font-titular)] text-[var(--text-xl)] text-[var(--color-granito)] font-semibold">
          Recibimos tu consulta
        </h2>
        <p className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] max-w-md leading-[var(--leading-cuerpo)]">
          Anotamos tus datos y nuestro equipo se va a comunicar contigo a la brevedad.
          Si no recibes noticias en <strong>48 horas hábiles</strong>, escríbenos
          directamente por WhatsApp.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center font-[family-name:var(--font-ui)] font-medium rounded-[var(--radius-pill)] transition-all duration-150 bg-[var(--color-laton)] text-white hover:bg-[var(--color-laton-oscuro)] tracking-[var(--tracking-ui)] uppercase px-[var(--space-6)] py-[var(--space-3)] text-[var(--text-sm)]"
        >
          Escríbenos por WhatsApp
        </a>
        <Link
          href="/"
          className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-mar)] underline-offset-4 hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-[var(--space-12)]"
      aria-label="Formulario de diagnóstico"
      aria-busy={status === 'loading'}
    >
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {status === 'loading' && 'Enviando tu consulta...'}
        {status === 'error' && 'Hubo un error al enviar. Por favor intenta de nuevo.'}
      </div>

      {status === 'error' && (
        <div
          className="rounded-[var(--radius-card)] border border-[var(--color-coral)] bg-[#FDF3F1] p-[var(--space-4)] text-[var(--text-sm)] text-[#922B21]"
          role="alert"
          aria-live="assertive"
        >
          <strong>Algo salió mal al enviar tu consulta.</strong> Por favor intenta de nuevo o{' '}
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
            escríbenos por WhatsApp
          </a>.
        </div>
      )}

      {/* ── Sección 1: Tu contacto ────────────────────────────────────────── */}
      <section aria-labelledby="seccion-contacto">
        <h2 id="seccion-contacto" className={sectionTitleClass}>Tu contacto</h2>
        <div className={sectionClass}>

          <FieldWrapper id="nombreCompleto" label="Nombre completo" required error={errors.nombreCompleto}>
            <input
              id="nombreCompleto"
              type="text"
              value={form.nombreCompleto}
              onChange={(e) => set('nombreCompleto', e.target.value)}
              className={`${inputBase} ${errors.nombreCompleto ? inputError : ''}`}
              autoComplete="name"
              required
              aria-required="true"
              aria-describedby={errors.nombreCompleto ? 'nombreCompleto-error' : undefined}
            />
          </FieldWrapper>

          <FieldWrapper id="email" label="Email" required error={errors.email}>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className={`${inputBase} ${errors.email ? inputError : ''}`}
              autoComplete="email"
              required
              aria-required="true"
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </FieldWrapper>

          <FieldWrapper id="telefono" label="Teléfono con código internacional" required error={errors.telefono}>
            <input
              id="telefono"
              type="tel"
              value={form.telefono}
              onChange={(e) => set('telefono', e.target.value)}
              placeholder="+54 9 11 1234-5678"
              className={`${inputBase} ${errors.telefono ? inputError : ''}`}
              autoComplete="tel"
              required
              aria-required="true"
              aria-describedby={errors.telefono ? 'telefono-error' : undefined}
            />
          </FieldWrapper>

          <FieldWrapper id="paisResidencia" label="País de residencia actual" required error={errors.paisResidencia}>
            <input
              id="paisResidencia"
              type="text"
              value={form.paisResidencia}
              onChange={(e) => set('paisResidencia', e.target.value)}
              className={`${inputBase} ${errors.paisResidencia ? inputError : ''}`}
              autoComplete="country-name"
              required
              aria-required="true"
              aria-describedby={errors.paisResidencia ? 'paisResidencia-error' : undefined}
            />
          </FieldWrapper>

        </div>
      </section>

      <hr className="border-[var(--color-arena)]" />

      {/* ── Sección 2: Tu familia ─────────────────────────────────────────── */}
      <SeccionFamilia
        form={form}
        errors={errors}
        set={set}
        setHayMenores={setHayMenores}
        setMascotas={setMascotas}
        toggleMascotaTipo={toggleMascotaTipo}
      />

      <hr className="border-[var(--color-arena)]" />

      {/* ── Sección 3: Situación legal y económica ────────────────────────── */}
      <section aria-labelledby="seccion-legal">
        <h2 id="seccion-legal" className={sectionTitleClass}>Tu situación legal y económica</h2>
        <div className={sectionClass}>

          {/* Documentación */}
          <div>
            <label htmlFor="documentacion" className={labelClass}>
              Documentación para residir legalmente en España
              <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
            </label>
            <select
              id="documentacion"
              value={form.documentacion}
              onChange={(e) => set('documentacion', e.target.value as LeadData['documentacion'])}
              className={`${inputBase} ${errors.documentacion ? inputError : ''}`}
              aria-describedby={errors.documentacion ? 'documentacion-error' : undefined}
            >
              <option value="" disabled>Selecciona una opción</option>
              <option value="espanol">Soy español/a (pasaporte o DNI español)</option>
              <option value="ue-otro">Soy ciudadano/a de la UE, EEE o Suiza</option>
              <option value="residencia-aprobada">Tengo residencia, TIE o NIE aprobado</option>
              <option value="en-tramite">Mi visado o residencia está en trámite</option>
              <option value="nacionalidad-en-tramite">Tengo o estoy tramitando la nacionalidad española</option>
              <option value="turista">Viajaría como turista</option>
            </select>
            {errors.documentacion && (
              <p id="documentacion-error" className={errorClass} role="alert">{errors.documentacion}</p>
            )}
          </div>

          {/* Situación laboral */}
          <div>
            <label htmlFor="situacionLaboral" className={labelClass}>
              Situación laboral al llegar
              <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
            </label>
            <select
              id="situacionLaboral"
              value={form.situacionLaboral}
              onChange={(e) => set('situacionLaboral', e.target.value as LeadData['situacionLaboral'])}
              className={`${inputBase} ${errors.situacionLaboral ? inputError : ''}`}
              aria-describedby={errors.situacionLaboral ? 'situacionLaboral-error' : undefined}
            >
              <option value="" disabled>Selecciona una opción</option>
              <option value="cuenta-ajena">Trabajo por cuenta ajena con nómina en España</option>
              <option value="teletrabajo-extranjero">Teletrabajo para empresa extranjera</option>
              <option value="autonomo">Trabajo por cuenta propia / autónomo</option>
              <option value="rentista">Rentista / fondos propios</option>
              <option value="jubilado">Jubilado/a</option>
              <option value="estudiante">Estudiante</option>
              <option value="busca-empleo">Otra / por el momento sin empleo</option>
            </select>
            {errors.situacionLaboral && (
              <p id="situacionLaboral-error" className={errorClass} role="alert">{errors.situacionLaboral}</p>
            )}
          </div>

          {/* Ingresos mensuales */}
          <div>
            <label htmlFor="ingresosMensuales" className={labelClass}>
              Ingresos netos mensuales del hogar
              <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
            </label>
            <select
              id="ingresosMensuales"
              value={form.ingresosMensuales}
              onChange={(e) => set('ingresosMensuales', e.target.value)}
              className={`${inputBase} ${errors.ingresosMensuales ? inputError : ''}`}
              aria-describedby={errors.ingresosMensuales ? 'ingresosMensuales-error' : undefined}
            >
              <option value="" disabled>Selecciona una opción</option>
              <option value="menos-1500">Menos de 1.500 €</option>
              <option value="1500-2500">1.500 – 2.500 €</option>
              <option value="2500-4000">2.500 – 4.000 €</option>
              <option value="mas-4000">Más de 4.000 €</option>
              <option value="sin-ingresos">No tengo ingresos en España aún</option>
            </select>
            {errors.ingresosMensuales && (
              <p id="ingresosMensuales-error" className={errorClass} role="alert">{errors.ingresosMensuales}</p>
            )}
          </div>

          {/* Garantías — con excluyente "ninguna" */}
          <div>
            <fieldset>
              <legend id="rg-garantias" className={`${labelClass} mb-[var(--space-2)]`}>
                Garantías que puedes ofrecer
                <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
              </legend>
              <CheckboxGroup
                options={[
                  { value: 'garantia-adicional' as const, label: 'Aportes de meses de garantía adicional (6–12)' },
                  { value: 'aval-bancario' as const, label: 'Aval bancario' },
                  { value: 'avalista' as const, label: 'Avalista con ingresos en España' },
                  { value: 'seguro-impago' as const, label: 'Contratar un seguro de impago' },
                  { value: 'ninguna' as const, label: 'Ninguna de las anteriores' },
                ]}
                selected={form.garantias}
                onToggle={toggleGarantia}
                exclusivaValue="ninguna"
                error={errors.garantias}
                labelId="rg-garantias"
              />
            </fieldset>
          </div>

        </div>
      </section>

      <hr className="border-[var(--color-arena)]" />

      {/* ── Sección 4: La vivienda que buscas ────────────────────────────── */}
      <SeccionVivienda
        form={form}
        errors={errors}
        set={set}
        setTipoInmueble={setTipoInmueble}
        toggleImprescindible={toggleImprescindible}
        toggleComodidad={toggleComodidad}
      />

      <hr className="border-[var(--color-arena)]" />

      {/* ── Sección 5: Tu perfil y plazos ─────────────────────────────────── */}
      <section aria-labelledby="seccion-perfil">
        <h2 id="seccion-perfil" className={sectionTitleClass}>Tu perfil y plazos</h2>
        <div className={sectionClass}>

          {/* Necesidades especiales — opcional */}
          <div>
            <fieldset>
              <legend id="rg-necesidadesEspeciales" className={`${labelClass} mb-[var(--space-2)]`}>
                ¿Algún miembro del hogar tiene necesidades especiales o discapacidad? (opcional)
              </legend>
              <RadioGroup
                name="necesidadesEspeciales"
                options={[
                  { value: 'no', label: 'No' },
                  { value: 'si', label: 'Sí' },
                ]}
                value={form.necesidadesEspeciales}
                onChange={(v) => set('necesidadesEspeciales', v as 'si' | 'no')}
                labelId="rg-necesidadesEspeciales"
              />
            </fieldset>
          </div>

          {/* Profesión — opcional */}
          <FieldWrapper id="profesion" label="Profesión u ocupación (opcional)" error={errors.profesion}>
            <input
              id="profesion"
              type="text"
              value={form.profesion}
              onChange={(e) => set('profesion', e.target.value)}
              placeholder="Ej: Ingeniera, docente, enfermero..."
              className={`${inputBase} ${errors.profesion ? inputError : ''}`}
              aria-describedby={errors.profesion ? 'profesion-error' : undefined}
            />
          </FieldWrapper>

          {/* Fecha de llegada */}
          <div>
            <label htmlFor="fechaLlegada" className={labelClass}>
              ¿En qué plazo necesitas tener resuelta tu vivienda?
              <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
            </label>
            <select
              id="fechaLlegada"
              value={form.fechaLlegada}
              onChange={(e) => set('fechaLlegada', e.target.value)}
              className={`${inputBase} ${errors.fechaLlegada ? inputError : ''}`}
              aria-describedby={errors.fechaLlegada ? 'fechaLlegada-error' : undefined}
            >
              <option value="" disabled>Selecciona una opción</option>
              <option value="menos-1-mes">En menos de 1 mes</option>
              <option value="1-3-meses">En 1 a 3 meses</option>
              <option value="3-6-meses">En 3 a 6 meses</option>
              <option value="mas-6-meses">En más de 6 meses</option>
              <option value="sin-fecha">Aún no tengo fecha</option>
            </select>
            {errors.fechaLlegada && (
              <p id="fechaLlegada-error" className={errorClass} role="alert">{errors.fechaLlegada}</p>
            )}
          </div>

        </div>
      </section>

      <hr className="border-[var(--color-arena)]" />

      {/* ── Sección 6: Para terminar ──────────────────────────────────────── */}
      <section aria-labelledby="seccion-final">
        <h2 id="seccion-final" className={sectionTitleClass}>Para terminar</h2>
        <div className={sectionClass}>

          {/* ¿Cómo nos conociste? — opcional */}
          <div>
            <label htmlFor="comoNosConociste" className={labelClass}>
              ¿Cómo nos conociste? (opcional)
            </label>
            <select
              id="comoNosConociste"
              value={form.comoNosConociste}
              onChange={(e) => set('comoNosConociste', e.target.value as typeof form.comoNosConociste)}
              className={inputBase}
            >
              <option value="">Selecciona una opción</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
              <option value="google">Google</option>
              <option value="recomendacion">Recomendación</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Comprensión del servicio */}
          <div>
            <label className="flex items-start gap-[var(--space-3)] cursor-pointer">
              <input
                id="comprendeServicio"
                type="checkbox"
                required
                aria-required="true"
                checked={form.comprendeServicio}
                onChange={(e) => set('comprendeServicio', e.target.checked)}
                className="accent-[var(--color-laton)] w-4 h-4 mt-[2px] cursor-pointer flex-shrink-0"
                aria-describedby={errors.comprendeServicio ? 'comprendeServicio-error' : undefined}
              />
              <span className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] leading-[var(--leading-cuerpo)]">
                Entiendo que Tu Lugar en Galicia es un servicio de consultoría y búsqueda personalizada, con honorarios propios aparte del alquiler y la fianza. Tu Lugar en Galicia actúa en nombre de mi familia, no del propietario.
                <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
              </span>
            </label>
            {errors.comprendeServicio && (
              <p id="comprendeServicio-error" className={`${errorClass} mt-[var(--space-2)]`} role="alert">
                {errors.comprendeServicio}
              </p>
            )}
          </div>

          {/* Consentimiento RGPD */}
          <div>
            <label className="flex items-start gap-[var(--space-3)] cursor-pointer">
              <input
                id="consentimientoRGPD"
                type="checkbox"
                required
                aria-required="true"
                checked={form.consentimientoRGPD}
                onChange={(e) => set('consentimientoRGPD', e.target.checked)}
                className="accent-[var(--color-laton)] w-4 h-4 mt-[2px] cursor-pointer flex-shrink-0"
                aria-describedby={errors.consentimientoRGPD ? 'consentimientoRGPD-error' : undefined}
              />
              <span className="font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-pizarra)] leading-[var(--leading-cuerpo)]">
                Acepto el tratamiento de mis datos personales según la{' '}
                <Link
                  href="/politica-de-privacidad"
                  className="text-[var(--color-mar)] underline hover:no-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  política de privacidad
                </Link>.
                <span className="text-[var(--color-coral)] ml-1" aria-hidden="true">*</span>
              </span>
            </label>
            {errors.consentimientoRGPD && (
              <p id="consentimientoRGPD-error" className={`${errorClass} mt-[var(--space-2)]`} role="alert">
                {errors.consentimientoRGPD}
              </p>
            )}
          </div>

        </div>
      </section>

      {/* Submit */}
      <div className="pt-[var(--space-4)]">
        <Button
          type="submit"
          size="lg"
          variant="primario"
          disabled={status === 'loading'}
          className="w-full sm:w-auto"
        >
          {status === 'loading' ? (
            <span className="flex items-center gap-[var(--space-2)]">
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Enviando...
            </span>
          ) : (
            'Enviar mi consulta'
          )}
        </Button>
        <p className="mt-[var(--space-3)] text-[var(--text-xs)] text-[var(--color-pizarra)] font-[family-name:var(--font-ui)]">
          Los campos marcados con <span className="text-[var(--color-coral)]">*</span> son obligatorios.
        </p>
      </div>
    </form>
  )
}

import { getNextMetadata } from '@/lib/seo/metadata'

export const metadata = getNextMetadata('politicaPrivacidad')

// Bloque visual para los TODO pendientes de configuración
function TodoBlock({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-[var(--color-arena)] border-l-4 border-[var(--color-coral)] px-4 py-2 font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-granito)]">
      {children}
    </span>
  )
}

export default function PoliticaDePrivacidadPage() {
  return (
    <>
      {/* Hero pequeño */}
      <section className="bg-[var(--color-granito)] pb-[var(--space-16)] px-[var(--space-6)]" style={{ paddingTop: 'calc(64px + 60px)' }}>
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--font-titular)] [font-size:var(--text-2xl)] leading-[var(--leading-titulo)] [color:var(--color-niebla)] md:[font-size:var(--text-3xl)]">
            Política de Privacidad
          </h1>
          <p className="mt-[var(--space-4)] font-[family-name:var(--font-ui)] leading-[var(--leading-cuerpo)]" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-arena)' }}>
            Última actualización: mayo 2026
          </p>
        </div>
      </section>

      {/* Contenido */}
      <article className="mx-auto max-w-3xl px-[var(--space-6)] py-[var(--space-16)]">
        <div className="flex flex-col gap-[var(--space-12)] font-[family-name:var(--font-ui)] text-[var(--text-sm)] text-[var(--color-granito)] leading-[var(--leading-cuerpo)]">

          {/* 1. Responsable del tratamiento */}
          <section aria-labelledby="responsable">
            <h2
              id="responsable"
              className="font-[family-name:var(--font-titular)] [font-size:var(--text-xl)] [color:var(--color-laton)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
            >
              1. Responsable del tratamiento
            </h2>
            <div className="flex flex-col gap-[var(--space-3)]">
              <p>
                <strong>Nombre / Razón social:</strong>{' '}
                <TodoBlock>{'TODO: completar razón social (ej: "Silvana Lorenzo Lorenzo" o nombre comercial registrado)'}</TodoBlock>
              </p>
              <p>
                <strong>Dirección:</strong>{' '}
                <TodoBlock>TODO: completar dirección postal en Galicia, España</TodoBlock>
              </p>
              <p>
                <strong>Email de contacto (protección de datos):</strong>{' '}
                <TodoBlock>TODO: completar email dedicado a consultas de protección de datos</TodoBlock>
              </p>
              <p>
                <strong>Actividad:</strong> Servicio de relocalización residencial especializado en
                Galicia, España, orientado a familias emigrantes latinoamericanas.
              </p>
            </div>
          </section>

          <hr className="border-[var(--color-arena)]" />

          {/* 2. Finalidad del tratamiento */}
          <section aria-labelledby="finalidad">
            <h2
              id="finalidad"
              className="font-[family-name:var(--font-titular)] [font-size:var(--text-xl)] [color:var(--color-laton)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
            >
              2. Finalidad del tratamiento
            </h2>
            <p className="mb-[var(--space-3)]">
              Los datos personales que nos proporcionás se utilizan para:
            </p>
            <ul className="list-disc pl-[var(--space-6)] flex flex-col gap-[var(--space-2)]">
              <li>
                Gestión de consultas y solicitudes de información sobre el servicio de relocalización.
              </li>
              <li>
                Evaluación de la viabilidad del proceso de relocalización según tu situación personal,
                económica y documental.
              </li>
              <li>
                Comunicación comercial relacionada con el servicio, exclusivamente cuando hayas
                dado tu consentimiento explícito.
              </li>
              <li>
                Coordinación y seguimiento del proceso de búsqueda de vivienda en Galicia.
              </li>
            </ul>
          </section>

          <hr className="border-[var(--color-arena)]" />

          {/* 3. Base legal */}
          <section aria-labelledby="base-legal">
            <h2
              id="base-legal"
              className="font-[family-name:var(--font-titular)] [font-size:var(--text-xl)] [color:var(--color-laton)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
            >
              3. Base legal del tratamiento
            </h2>
            <ul className="list-disc pl-[var(--space-6)] flex flex-col gap-[var(--space-2)]">
              <li>
                <strong>Consentimiento explícito del interesado</strong> (Art. 6.1.a RGPD): cuando
                marcás la casilla de consentimiento en el formulario de contacto.
              </li>
              <li>
                <strong>Ejecución de un contrato o medidas precontractuales</strong> (Art. 6.1.b
                RGPD): cuando la recogida de datos es necesaria para evaluar y gestionar tu
                solicitud de servicio.
              </li>
            </ul>
          </section>

          <hr className="border-[var(--color-arena)]" />

          {/* 4. Conservación de los datos */}
          <section aria-labelledby="conservacion">
            <h2
              id="conservacion"
              className="font-[family-name:var(--font-titular)] [font-size:var(--text-xl)] [color:var(--color-laton)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
            >
              4. Conservación de los datos
            </h2>
            <p className="mb-[var(--space-3)]">
              Los datos personales se conservarán mientras dure la relación comercial y durante el
              plazo legalmente exigido.
            </p>
            <p>
              Una vez finalizada la relación, los datos serán bloqueados y eliminados tras el
              período de prescripción de acciones legales aplicable (con un máximo de 5 años), salvo
              que una obligación legal exija su conservación por un período mayor.
            </p>
          </section>

          <hr className="border-[var(--color-arena)]" />

          {/* 5. Destinatarios */}
          <section aria-labelledby="destinatarios">
            <h2
              id="destinatarios"
              className="font-[family-name:var(--font-titular)] [font-size:var(--text-xl)] [color:var(--color-laton)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
            >
              5. Destinatarios de los datos
            </h2>
            <p className="mb-[var(--space-3)]">
              Los datos personales no se ceden a terceros salvo obligación legal.
            </p>
            <p>
              Se utilizan servicios de almacenamiento en la nube (Airtable, Inc.) como encargados
              del tratamiento, con quienes existen garantías contractuales adecuadas de conformidad
              con el RGPD. Airtable procesa los datos en servidores ubicados en los Estados Unidos,
              al amparo de las garantías establecidas en las Cláusulas Contractuales Tipo aprobadas
              por la Comisión Europea.
            </p>
          </section>

          <hr className="border-[var(--color-arena)]" />

          {/* 6. Derechos */}
          <section aria-labelledby="derechos">
            <h2
              id="derechos"
              className="font-[family-name:var(--font-titular)] [font-size:var(--text-xl)] [color:var(--color-laton)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
            >
              6. Tus derechos
            </h2>
            <p className="mb-[var(--space-3)]">
              Puedes ejercer en cualquier momento los siguientes derechos reconocidos por el RGPD y
              la Ley Orgánica de Protección de Datos (LOPDGDD):
            </p>
            <ul className="list-disc pl-[var(--space-6)] flex flex-col gap-[var(--space-2)] mb-[var(--space-4)]">
              <li><strong>Acceso:</strong> conocer qué datos tuyos tenemos.</li>
              <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
              <li><strong>Supresión:</strong> solicitar que eliminemos tus datos (&quot;derecho al olvido&quot;).</li>
              <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos.</li>
              <li><strong>Limitación:</strong> solicitar que restrinjamos el uso de tus datos.</li>
              <li><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado y legible.</li>
            </ul>
            <p className="mb-[var(--space-3)]">
              Para ejercer cualquiera de estos derechos, envía un email a{' '}
              <TodoBlock>TODO: completar email de protección de datos</TodoBlock>{' '}
              con el asunto <strong>&quot;Protección de datos&quot;</strong> e indicando el derecho que
              quieres ejercer y tus datos de identificación.
            </p>
            <p>
              Si consideras que el tratamiento de tus datos no es conforme a la normativa, puedes
              presentar una reclamación ante la{' '}
              <strong>Agencia Española de Protección de Datos (AEPD)</strong>:{' '}
              <a
                href="https://www.aepd.es"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-mar)] underline-offset-4 hover:no-underline underline"
              >
                aepd.es<span className="sr-only">(abre en nueva pestaña)</span>
              </a>
              .
            </p>
          </section>

          <hr className="border-[var(--color-arena)]" />

          {/* 7. Cambios en la política */}
          <section aria-labelledby="cambios">
            <h2
              id="cambios"
              className="font-[family-name:var(--font-titular)] [font-size:var(--text-xl)] [color:var(--color-laton)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
            >
              7. Cambios en esta política
            </h2>
            <p>
              Esta política de privacidad puede actualizarse para reflejar cambios legales o en
              nuestras prácticas de tratamiento de datos. La versión vigente siempre está disponible
              en esta página, con la fecha de última actualización indicada al inicio.
            </p>
          </section>

        </div>
      </article>
    </>
  )
}

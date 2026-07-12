import { getNextMetadata } from '@/lib/seo/metadata'

export const metadata = getNextMetadata('politicaPrivacidad')

// Bloque visual para los TODO pendientes de configuración
function TodoBlock({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block px-4 py-2 [font-size:var(--text-sm)]"
      style={{ fontFamily: 'var(--font-lato)', backgroundColor: 'var(--po-borde)', borderLeft: '4px solid var(--color-coral)', color: 'var(--po-pedra)' }}
    >
      {children}
    </span>
  )
}

export default function PoliticaDePrivacidadPage() {
  return (
    <>
      {/* Hero pequeño — bookend fijo oscuro (Pedra e Ouro) */}
      <section className="pb-[var(--space-16)] px-[var(--space-6)]" style={{ backgroundColor: 'var(--po-hero-bg)', paddingTop: 'calc(64px + 60px)' }}>
        <div className="mx-auto max-w-3xl">
          <h1
            className="[font-size:var(--text-2xl)] leading-[var(--leading-titulo)] md:[font-size:var(--text-3xl)]"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--po-hero-text)' }}
          >
            Política de Privacidad
          </h1>
          <p
            className="mt-[var(--space-4)] leading-[var(--leading-cuerpo)]"
            style={{ fontFamily: 'var(--font-lato)', fontSize: 'var(--text-sm)', color: 'var(--po-hero-muted)' }}
          >
            Última actualización: mayo 2026
          </p>
        </div>
      </section>

      {/* Contenido */}
      <article className="mx-auto max-w-3xl px-[var(--space-6)] py-[var(--space-16)]" style={{ backgroundColor: 'var(--po-luz)' }}>
        <div
          className="flex flex-col gap-[var(--space-12)] [font-size:var(--text-sm)] leading-[var(--leading-cuerpo)]"
          style={{ fontFamily: 'var(--font-lato)', color: 'var(--po-pedra)' }}
        >

          {/* 1. Responsable del tratamiento */}
          <section aria-labelledby="responsable">
            <h2
              id="responsable"
              className="[font-size:var(--text-xl)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--po-ouro-text)' }}
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

          <hr style={{ borderColor: 'var(--po-borde)' }} />

          {/* 2. Finalidad del tratamiento */}
          <section aria-labelledby="finalidad">
            <h2
              id="finalidad"
              className="[font-size:var(--text-xl)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--po-ouro-text)' }}
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

          <hr style={{ borderColor: 'var(--po-borde)' }} />

          {/* 3. Base legal */}
          <section aria-labelledby="base-legal">
            <h2
              id="base-legal"
              className="[font-size:var(--text-xl)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--po-ouro-text)' }}
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

          <hr style={{ borderColor: 'var(--po-borde)' }} />

          {/* 4. Conservación de los datos */}
          <section aria-labelledby="conservacion">
            <h2
              id="conservacion"
              className="[font-size:var(--text-xl)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--po-ouro-text)' }}
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

          <hr style={{ borderColor: 'var(--po-borde)' }} />

          {/* 5. Destinatarios */}
          <section aria-labelledby="destinatarios">
            <h2
              id="destinatarios"
              className="[font-size:var(--text-xl)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--po-ouro-text)' }}
            >
              5. Destinatarios de los datos
            </h2>
            <p className="mb-[var(--space-3)]">
              Los datos personales no se ceden a terceros salvo obligación legal.
            </p>
            <p className="mb-[var(--space-3)]">
              Los datos personales recabados a través del asistente conversacional, el formulario
              de diagnóstico y el formulario de contacto se almacenan en una base de datos
              gestionada por Supabase Inc., que actúa como encargado del tratamiento al amparo de
              un contrato de encargo conforme al RGPD. Supabase aloja estos datos en servidores
              ubicados en Alemania, dentro de la Unión Europea, por lo que el tratamiento se
              realiza íntegramente dentro del Espacio Económico Europeo.
            </p>
            <p>
              Adicionalmente, los datos facilitados por quienes se registran en la sección
              &quot;Comunidad de Acogida&quot; (nombre, correo electrónico, ubicación aproximada y,
              en su caso, teléfono de contacto) se replican en una tabla de Airtable, Inc., que
              actúa como encargado del tratamiento para esta finalidad específica, con garantías
              contractuales adecuadas de conformidad con el RGPD. Airtable procesa estos datos en
              servidores ubicados en los Estados Unidos, al amparo de las Cláusulas Contractuales
              Tipo aprobadas por la Comisión Europea.
            </p>
          </section>

          <hr style={{ borderColor: 'var(--po-borde)' }} />

          {/* 6. Derechos */}
          <section aria-labelledby="derechos">
            <h2
              id="derechos"
              className="[font-size:var(--text-xl)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--po-ouro-text)' }}
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
                className="underline-offset-4 hover:no-underline underline"
                style={{ color: 'var(--po-ouro-text)' }}
              >
                aepd.es<span className="sr-only">(abre en nueva pestaña)</span>
              </a>
              .
            </p>
          </section>

          <hr style={{ borderColor: 'var(--po-borde)' }} />

          {/* 7. Cambios en la política */}
          <section aria-labelledby="cambios">
            <h2
              id="cambios"
              className="[font-size:var(--text-xl)] leading-[var(--leading-titulo)] mb-[var(--space-4)]"
              style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--po-ouro-text)' }}
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

// TODO Fase 2: reemplazar con widget Behold (T5.2)

export function FeedInstagram() {
  const cuadros = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
    <section
      className="bg-[var(--color-arena)] px-[var(--space-6)] py-[var(--space-16)] md:py-[var(--space-24)]"
      aria-labelledby="instagram-heading"
    >
      <div className="mx-auto max-w-4xl">
        <h2
          id="instagram-heading"
          className="mb-[var(--space-2)] text-center font-[family-name:var(--font-ui)] text-[var(--text-xs)] tracking-[var(--tracking-ui)] text-[var(--color-pizarra)] uppercase"
        >
          Seguinos
        </h2>
        <p className="mb-[var(--space-12)] text-center font-[family-name:var(--font-titular)] text-[var(--text-xl)] text-[var(--color-granito)] md:text-[var(--text-2xl)]">
          @tulugarengalicia en Instagram
        </p>

        <ul
          className="grid grid-cols-3 gap-[var(--space-3)]"
          aria-label="Próximamente: feed de Instagram"
        >
          {cuadros.map((n) => (
            <li
              key={n}
              className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-pizarra)] opacity-40"
              aria-hidden="true"
            >
              {/* Ícono de Instagram centrado */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="absolute inset-0 m-auto h-8 w-8 text-[var(--color-niebla)]"
                aria-hidden="true"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </li>
          ))}
        </ul>

        <p className="mt-[var(--space-8)] text-center font-[family-name:var(--font-ui)] text-[var(--text-xs)] text-[var(--color-pizarra)] opacity-70">
          Feed de Instagram — se conecta en Fase 2
        </p>
      </div>
    </section>
  );
}

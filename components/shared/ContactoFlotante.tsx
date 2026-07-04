import Link from 'next/link'

export function ContactoFlotante() {
  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      <span
        aria-hidden="true"
        className="absolute right-16 bottom-1/2 translate-y-1/2 whitespace-nowrap bg-[var(--color-granito)] [color:var(--color-niebla)] [font-size:var(--text-xs)] font-[family-name:var(--font-ui)] px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-card)] shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200"
      >
        Contáctanos
      </span>

      <Link
        href="/contacto"
        aria-label="Contáctanos"
        className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform duration-200 hover:scale-110 active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-laton)]"
        style={{ backgroundColor: 'var(--color-laton)' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="26"
          height="26"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </Link>
    </div>
  )
}

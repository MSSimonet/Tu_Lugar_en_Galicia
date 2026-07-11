type Props = {
  esOscuro: boolean
  onToggle: () => void
}

export function ToggleTema({ esOscuro, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={esOscuro ? 'Activar modo claro' : 'Activar modo oscuro'}
      className="relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        backgroundColor: esOscuro ? 'var(--au-toggle-track-off)' : 'var(--au-toggle-track-on)',
        outlineColor: 'var(--au-accent)',
      }}
    >
      <span
        aria-hidden="true"
        className="absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[11px] transition-[left] duration-200"
        style={{ left: esOscuro ? '2px' : '22px', backgroundColor: 'var(--au-accent)' }}
      >
        {esOscuro ? '🌙' : '☀️'}
      </span>
    </button>
  )
}

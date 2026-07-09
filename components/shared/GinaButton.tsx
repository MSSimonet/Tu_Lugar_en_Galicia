'use client'

interface GinaButtonProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function GinaButton({ children, className, style }: GinaButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('gina:open'))}
      className={className}
      style={style}
    >
      {children}
    </button>
  )
}

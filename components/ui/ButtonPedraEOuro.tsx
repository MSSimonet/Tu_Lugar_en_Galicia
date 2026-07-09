'use client'

interface ButtonPedraEOuroProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primario' | 'contorno'
}

export function ButtonPedraEOuro({
  children,
  onClick,
  className = '',
  type = 'button',
  variant = 'primario',
}: ButtonPedraEOuroProps) {
  const styles: Record<string, React.CSSProperties> = {
    primario: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '13px 32px',
      borderRadius: '4px',
      border: 'none',
      background: 'var(--po-ouro)',
      color: '#1A1410',
      fontFamily: 'var(--font-lato)',
      fontSize: '12px',
      fontWeight: 700,
      letterSpacing: '0.10em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
    },
    contorno: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px 32px',
      borderRadius: '4px',
      border: '1.5px solid var(--po-ouro)',
      background: 'transparent',
      color: 'var(--po-ouro)',
      fontFamily: 'var(--font-lato)',
      fontSize: '12px',
      fontWeight: 700,
      letterSpacing: '0.10em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'background 0.15s ease, transform 0.15s ease',
    },
  }

  const hoverIn: Record<string, Partial<React.CSSProperties>> = {
    primario: {
      background: 'var(--po-ouro-hover)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 14px rgba(200,155,60,0.30)',
    },
    contorno: {
      background: 'rgba(200,155,60,0.10)',
      transform: 'translateY(-1px)',
    },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={className}
      style={styles[variant]}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverIn[variant])}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles[variant])}
      onFocus={(e) => {
        e.currentTarget.style.outline = '2px solid var(--po-ouro)'
        e.currentTarget.style.outlineOffset = '3px'
      }}
      onBlur={(e) => { e.currentTarget.style.outline = 'none' }}
    >
      {children}
    </button>
  )
}

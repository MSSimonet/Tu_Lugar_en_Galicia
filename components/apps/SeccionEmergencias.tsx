import { NUMEROS_EMERGENCIA } from '@/lib/config/appsUtiles'

export function SeccionEmergencias() {
  return (
    <details
      className="group relative left-1/2 w-screen -translate-x-1/2 overflow-hidden rounded-[10px] box-border"
      style={{ border: '1px solid var(--au-border-strong)', backgroundColor: 'var(--au-card)', maxWidth: '1100px' }}
      open
    >
      <summary
        className="flex cursor-pointer list-none items-center justify-between gap-3 px-[18px] py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: 'var(--au-accent)' }}
      >
        <span className="flex items-center gap-2.5">
          <h2
            className="text-[15.5px] font-semibold"
            style={{ fontFamily: 'var(--font-au-display)', color: 'var(--au-heading)' }}
          >
            Números de emergencia
          </h2>
          <span className="text-[10.5px] font-semibold tracking-[0.06em]" style={{ color: 'var(--au-accent-text)' }}>
            {NUMEROS_EMERGENCIA.length}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 text-[13px] transition-transform duration-150 group-open:rotate-180"
          style={{ color: 'var(--au-accent-text)' }}
        >
          ▾
        </span>
      </summary>
      <div
        className="flex flex-wrap gap-2.5 px-[18px] pb-3.5 pt-2.5"
        style={{ borderTop: '1px solid var(--au-border)' }}
      >
        {NUMEROS_EMERGENCIA.map((num) => (
          <div
            key={num.numero}
            className="flex items-center gap-2.5 rounded-full py-2 pl-2 pr-3.5"
            style={{ backgroundColor: 'rgba(58,110,196,0.1)', border: '1px solid rgba(58,110,196,0.3)' }}
          >
            <span
              aria-hidden="true"
              className="au-emerg-pulse flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: '#3a6ec4' }}
            >
              <span className="text-[11.5px] font-bold text-white" style={{ fontFamily: 'var(--font-au-display)' }}>
                {num.numero}
              </span>
            </span>
            <span className="whitespace-nowrap text-xs" style={{ color: 'var(--au-hero-body)' }}>
              {num.servicio}
            </span>
          </div>
        ))}
      </div>
    </details>
  )
}

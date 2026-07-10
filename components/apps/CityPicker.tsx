import Image from 'next/image'
import { CIUDADES, type CiudadKey } from '@/lib/config/appsUtiles'

type Props = {
  seleccionada: CiudadKey | null
  onSelect: (ciudad: CiudadKey) => void
}

export function CityPicker({ seleccionada, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-[18px] lg:grid-cols-5">
      {CIUDADES.map((ciudad) => {
        const activa = ciudad.key === seleccionada
        return (
          <button
            key={ciudad.key}
            type="button"
            onClick={() => onSelect(ciudad.key)}
            aria-pressed={activa}
            className="flex flex-col items-center gap-3 rounded-2xl p-3 text-left transition-brand md:gap-[14px] md:p-4 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              border: `2px solid ${activa ? 'var(--au-accent)' : 'rgba(201,162,55,0.2)'}`,
              backgroundColor: activa ? 'color-mix(in srgb, var(--au-accent) 12%, transparent)' : 'var(--au-card)',
              outlineColor: 'var(--au-accent)',
            }}
          >
            <span className="relative block aspect-square w-full overflow-hidden rounded-xl">
              <Image
                src={ciudad.imagen}
                alt=""
                fill
                sizes="(max-width: 768px) 45vw, 200px"
                className="object-cover"
              />
            </span>
            <span
              className="text-base font-semibold md:text-lg"
              style={{
                fontFamily: 'var(--font-au-display)',
                color: activa ? 'var(--au-accent)' : 'var(--au-text)',
              }}
            >
              {ciudad.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

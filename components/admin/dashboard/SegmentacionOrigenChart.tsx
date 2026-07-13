'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CHART_COLORS, CHART_TOOLTIP_STYLE, EmptyState } from '@/components/admin/ui/AdminPrimitives'

type SegmentoOrigen = 'Nacional' | 'Comunitario' | 'Extracomunitario' | 'Sin clasificar'

interface PuntoSegmentacion {
  segmento: SegmentoOrigen
  cantidad: number
}

interface Props {
  data: PuntoSegmentacion[]
}

const COLOR_POR_SEGMENTO: Record<SegmentoOrigen, string> = {
  Nacional:          CHART_COLORS.verde,
  Comunitario:       CHART_COLORS.azul,
  Extracomunitario:  CHART_COLORS.dorado,
  'Sin clasificar':  CHART_COLORS.neutro,
}

export function SegmentacionOrigenChart({ data }: Props) {
  const conDatos = data.filter(d => d.cantidad > 0)

  if (!conDatos.length) {
    return <EmptyState mensaje="Todavía no hay datos suficientes." />
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={conDatos}
          dataKey="cantidad"
          nameKey="segmento"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          stroke="var(--color-blanco)"
          strokeWidth={2}
        >
          {conDatos.map(d => (
            <Cell key={d.segmento} fill={COLOR_POR_SEGMENTO[d.segmento]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={CHART_TOOLTIP_STYLE}
          formatter={(value, name) => [`${value} leads`, name]}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-pizarra)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

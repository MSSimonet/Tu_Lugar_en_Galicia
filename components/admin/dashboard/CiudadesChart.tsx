'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CHART_COLORS, CHART_GRID_COLOR, CHART_TEXT_COLOR, CHART_TOOLTIP_STYLE, EmptyState } from '@/components/admin/ui/AdminPrimitives'

interface PuntoCiudad {
  ciudad: string
  cantidad: number
}

interface Props {
  data: PuntoCiudad[]
}

export function CiudadesChart({ data }: Props) {
  if (!data.length) {
    return <EmptyState mensaje="Todavía no hay datos suficientes." />
  }

  // Recharts dibuja barras horizontales de abajo hacia arriba en el orden del
  // array — invertimos para que la ciudad con más leads quede arriba.
  const ordenadas = [...data].reverse()
  const altura = Math.max(220, ordenadas.length * 44)

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={ordenadas} layout="vertical" margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART_GRID_COLOR} horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fill: CHART_TEXT_COLOR, fontSize: 12, fontFamily: 'var(--font-ui)' }}
          axisLine={{ stroke: CHART_GRID_COLOR }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="ciudad"
          tick={{ fill: CHART_TEXT_COLOR, fontSize: 12, fontFamily: 'var(--font-ui)' }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip
          contentStyle={CHART_TOOLTIP_STYLE}
          formatter={(value) => [`${value} leads`, '']}
          cursor={{ fill: 'var(--color-niebla)' }}
        />
        <Bar dataKey="cantidad" fill={CHART_COLORS.dorado} radius={[0, 4, 4, 0]} barSize={22} />
      </BarChart>
    </ResponsiveContainer>
  )
}

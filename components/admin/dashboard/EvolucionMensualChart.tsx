'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  CHART_COLORS, CHART_GRID_COLOR, CHART_TEXT_COLOR, CHART_TOOLTIP_STYLE, EmptyState,
} from '@/components/admin/ui/AdminPrimitives'

interface PuntoEvolucionMensual {
  mes: string
  leads: number
}

interface Props {
  data: PuntoEvolucionMensual[]
}

export function EvolucionMensualChart({ data }: Props) {
  if (!data.length) {
    return <EmptyState mensaje="Todavía no hay datos suficientes." />
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="evolucionMensualFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.dorado} stopOpacity={0.35} />
            <stop offset="100%" stopColor={CHART_COLORS.dorado} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="mes"
          tick={{ fill: CHART_TEXT_COLOR, fontSize: 12, fontFamily: 'var(--font-ui)' }}
          axisLine={{ stroke: CHART_GRID_COLOR }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: CHART_TEXT_COLOR, fontSize: 12, fontFamily: 'var(--font-ui)' }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          contentStyle={CHART_TOOLTIP_STYLE}
          labelStyle={{ color: 'var(--color-granito)', fontWeight: 500 }}
          formatter={(value) => [`${value} leads`, '']}
        />
        <Area
          type="monotone"
          dataKey="leads"
          stroke={CHART_COLORS.dorado}
          strokeWidth={2}
          fill="url(#evolucionMensualFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

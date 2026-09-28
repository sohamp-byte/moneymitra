'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const chartConfig: ChartConfig = {
  low: { label: 'Low estimate', color: 'var(--chart-3)' },
  high: { label: 'High estimate', color: 'var(--chart-1)' },
}

export function ForecastRangeChart({
  data,
}: {
  data: { name: string; low: number; high: number }[]
}) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis hide />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="low" fill="var(--chart-3)" radius={4} />
        <Bar dataKey="high" fill="var(--chart-1)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

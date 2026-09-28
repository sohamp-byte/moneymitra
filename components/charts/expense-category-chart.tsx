'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const chartConfig: ChartConfig = {
  total: { label: 'Spent', color: 'var(--chart-2)' },
}

export function ExpenseCategoryChart({ data }: { data: { category: string; total: number }[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis dataKey="category" type="category" tickLine={false} axisLine={false} fontSize={12} width={80} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Bar dataKey="total" fill="var(--chart-2)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

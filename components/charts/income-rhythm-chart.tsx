'use client'

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const chartConfig: ChartConfig = {
  amount: { label: 'Income', color: 'var(--chart-1)' },
}

export function IncomeRhythmChart({ data }: { data: { day: string; amount: number }[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  }))

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
      <AreaChart data={formatted} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={3}
          fontSize={11}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Area dataKey="amount" type="monotone" fill="url(#fillIncome)" stroke="var(--chart-1)" strokeWidth={2} />
      </AreaChart>
    </ChartContainer>
  )
}

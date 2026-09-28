'use client'

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { WorkEconomicsEntry } from '@/lib/types'

const chartConfig: ChartConfig = {
  netPerHour: { label: 'Net per hour', color: 'var(--chart-1)' },
}

export function WorkEconomicsChart({ data }: { data: WorkEconomicsEntry[] }) {
  const sorted = [...data].sort((a, b) => b.netPerHour - a.netPerHour)
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
      <BarChart data={sorted} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 0 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis dataKey="streamName" type="category" tickLine={false} axisLine={false} width={110} fontSize={12} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="netPerHour" fill="var(--chart-1)" radius={4}>
          <LabelList dataKey="netPerHour" position="right" fontSize={12} formatter={(v: number) => `₹${Math.round(v)}`} />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

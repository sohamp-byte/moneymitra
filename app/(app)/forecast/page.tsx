'use client'

import { useMemo, useState } from 'react'
import { AlertCircleIcon, CalendarClockIcon, TrendingDownIcon } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { EvidencePopover } from '@/components/evidence-popover'
import { ForecastRangeChart } from '@/components/charts/forecast-range-chart'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useMoneyMitraState } from '@/lib/domain/use-store'
import { calculateForecast, calculateRunway } from '@/lib/calculations'
import { formatDate, formatINR } from '@/lib/format'

export default function ForecastPage() {
  const state = useMoneyMitraState()
  const [horizon, setHorizon] = useState<'7' | '30'>('7')

  const forecast = useMemo(() => calculateForecast(state, Number(horizon) as 7 | 30), [state, horizon])
  const runway = useMemo(() => calculateRunway(state), [state])

  const chartData = [
    { name: 'Income', low: forecast.expectedIncomeLow, high: forecast.expectedIncomeHigh },
    { name: 'Essentials', low: forecast.expectedEssentialOutflowLow, high: forecast.expectedEssentialOutflowHigh },
    { name: 'Flexible left', low: forecast.projectedFlexibleLow, high: forecast.projectedFlexibleHigh },
  ]

  const upcomingObligations = state.obligations
    .filter((o) => o.status !== 'paid')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Forecast & runway"
        description="Projections, not promises — based on your recent income rhythm and obligations. Ranges widen the further out you look."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">Projected range</CardTitle>
                <CardDescription>Next {horizon} days</CardDescription>
              </div>
              <ToggleGroup type="single" variant="outline" value={horizon} onValueChange={(v) => v && setHorizon(v as '7' | '30')}>
                <ToggleGroupItem value="7">7 days</ToggleGroupItem>
                <ToggleGroupItem value="30">30 days</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ForecastRangeChart data={chartData} />
            <div className="flex items-center gap-2">
              <Badge variant="outline">Forecast</Badge>
              <EvidencePopover
                classification={forecast.classification}
                assumptions={[
                  ...forecast.assumptions,
                  `Horizon: ${forecast.horizonDays} days. Expected income: ${formatINR(forecast.expectedIncomeLow)} – ${formatINR(forecast.expectedIncomeHigh)}.`,
                ]}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Runway</CardTitle>
            <CardDescription>How long you&apos;d last with no new income</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tabular-nums">{runway.currentResilienceDays}</span>
              <span className="text-sm text-muted-foreground">days of resilience</span>
            </div>
            <Alert>
              <TrendingDownIcon />
              <AlertTitle>If income stopped for 5 days</AlertTitle>
              <AlertDescription>
                Your Safe-to-Spend would drop by {formatINR(Math.abs(runway.safeToSpendChangeIfStop5Days))}, an impact of{' '}
                {formatINR(Math.abs(runway.impactIfStop5Days))} overall.
              </AlertDescription>
            </Alert>
            <EvidencePopover
              classification={runway.classification}
              assumptions={[...runway.assumptions, `Current resilience: ${runway.currentResilienceDays} days.`]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming obligations</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {upcomingObligations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming obligations recorded.</p>
          ) : (
            upcomingObligations.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {o.status === 'overdue' ? (
                      <AlertCircleIcon className="size-4 text-destructive" />
                    ) : (
                      <CalendarClockIcon className="size-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{o.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Due {formatDate(o.dueDate)} {o.recurring && '· recurring'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium tabular-nums">{formatINR(o.amount)}</span>
                  <Badge variant={o.status === 'overdue' ? 'destructive' : 'outline'} className="capitalize">
                    {o.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

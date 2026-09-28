'use client'

import Link from 'next/link'
import { ArrowRightIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { SafeToSpendCard } from '@/components/safe-to-spend-card'
import { AddIncomeDialog } from '@/components/add-income-dialog'
import { AddExpenseDialog } from '@/components/add-expense-dialog'
import { IncomeRhythmChart } from '@/components/charts/income-rhythm-chart'
import { RecommendationsList } from '@/components/recommendations-list'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useMoneyMitraState } from '@/lib/domain/use-store'
import { calculateIncomeRhythm, calculateTodaySummary } from '@/lib/calculations'
import { formatINR, pct } from '@/lib/format'

export default function DashboardPage() {
  const state = useMoneyMitraState()
  const today = calculateTodaySummary(state)
  const rhythm = calculateIncomeRhythm(state)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Good to see you, ${state.profile.name}`}
        description="Here's where your money stands right now, based on your confirmed income and expenses."
        actions={
          <>
            <AddExpenseDialog />
            <AddIncomeDialog />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SafeToSpendCard />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Net earned</span>
              <span className="flex items-center gap-1 text-sm font-medium tabular-nums text-foreground">
                <TrendingUpIcon className="size-3.5 text-primary" />
                {formatINR(today.net)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Spent</span>
              <span className="flex items-center gap-1 text-sm font-medium tabular-nums text-foreground">
                <TrendingDownIcon className="size-3.5 text-destructive" />
                {formatINR(today.expenses)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Allocated to jars</span>
              <span className="text-sm font-medium tabular-nums">{formatINR(today.allocatedToday)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t pt-3">
              <span className="text-xs font-medium text-muted-foreground">Net change today</span>
              <Badge variant={today.safeToSpendChange >= 0 ? 'secondary' : 'destructive'} className="tabular-nums">
                {formatINR(today.safeToSpendChange, { signed: true })}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Income rhythm · last 28 days</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/income">
                  Details
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <IncomeRhythmChart data={rhythm.dailySeries} />
            <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-4 text-center">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground">Weekly average</span>
                <span className="text-sm font-medium tabular-nums">{formatINR(rhythm.averageWeekly)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground">Best earning day</span>
                <span className="text-sm font-medium">{rhythm.bestEarningDay}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground">Longest gap</span>
                <span className="text-sm font-medium tabular-nums">{rhythm.incomeGapDays} days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Jars</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/jars">
                  All jars
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {state.jars.slice(0, 4).map((jar) => (
              <div key={jar.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{jar.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatINR(jar.current)} / {formatINR(jar.target)}
                  </span>
                </div>
                <Progress value={pct(jar.current, jar.target)} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <RecommendationsList />
    </div>
  )
}

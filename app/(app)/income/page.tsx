'use client'

import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { AddIncomeDialog } from '@/components/add-income-dialog'
import { IncomeRhythmChart } from '@/components/charts/income-rhythm-chart'
import { EvidencePopover } from '@/components/evidence-popover'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { WalletIcon } from 'lucide-react'
import { useMoneyMitraState } from '@/lib/domain/use-store'
import { calculateIncomeRhythm } from '@/lib/calculations'
import { formatDateTime, formatINR } from '@/lib/format'

const STATUS_VARIANT: Record<string, 'secondary' | 'outline' | 'destructive'> = {
  confirmed: 'secondary',
  'pending-sync': 'outline',
  corrected: 'outline',
  'needs-review': 'destructive',
}

export default function IncomePage() {
  const state = useMoneyMitraState()
  const rhythm = calculateIncomeRhythm(state)
  const [streamFilter, setStreamFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    const events = streamFilter === 'all' ? state.incomeEvents : state.incomeEvents.filter((e) => e.stream === streamFilter)
    return events.slice(0, 40)
  }, [state.incomeEvents, streamFilter])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Income"
        description="Every earning event across your work streams, and the rhythm they form over time."
        actions={<AddIncomeDialog />}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Weekly average" value={formatINR(rhythm.averageWeekly)} />
        <StatCard label="Recent range" value={`${formatINR(rhythm.recentRangeLow)} – ${formatINR(rhythm.recentRangeHigh)}`} />
        <StatCard label="Best earning day" value={rhythm.bestEarningDay} />
        <StatCard label="Longest gap" value={`${rhythm.incomeGapDays} days`} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">28-day rhythm</CardTitle>
            <EvidencePopover
              classification={rhythm.classification}
              assumptions={[
                'Daily totals are summed from all confirmed and pending income events in the last 28 days.',
                `Main income stream: ${rhythm.mainStream}. Secondary: ${rhythm.secondaryStream}.`,
              ]}
            />
          </div>
        </CardHeader>
        <CardContent>
          <IncomeRhythmChart data={rhythm.dailySeries} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Income events</CardTitle>
            <ToggleGroup type="single" variant="outline" value={streamFilter} onValueChange={(v) => v && setStreamFilter(v)}>
              <ToggleGroupItem value="all">All</ToggleGroupItem>
              {state.workStreams.map((s) => (
                <ToggleGroupItem key={s.id} value={s.id}>
                  {s.name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <WalletIcon />
                </EmptyMedia>
                <EmptyTitle>No income events</EmptyTitle>
                <EmptyDescription>Try a different work stream filter or log a new income event.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Stream</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => {
                  const streamName = state.workStreams.find((s) => s.id === e.stream)?.name ?? e.stream
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="text-muted-foreground">{formatDateTime(e.date)}</TableCell>
                      <TableCell className="font-medium">{streamName}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatINR(e.gross)}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{formatINR(e.workCost)}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{formatINR(e.net)}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[e.status] ?? 'outline'} className="capitalize">
                          {e.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-lg font-semibold tabular-nums">{value}</span>
      </CardContent>
    </Card>
  )
}

'use client'

import { useMemo } from 'react'
import { TrophyIcon } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { WorkEconomicsChart } from '@/components/charts/work-economics-chart'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useMoneyMitraState } from '@/lib/domain/use-store'
import { calculateWorkEconomics } from '@/lib/calculations'
import { formatINR } from '@/lib/format'

export default function WorkEconomicsPage() {
  const state = useMoneyMitraState()
  const entries = useMemo(() => calculateWorkEconomics(state), [state])
  const best = entries.length ? entries.reduce((a, b) => (b.netPerHour > a.netPerHour ? b : a)) : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Work economics"
        description="What each income stream actually pays you per hour, after work-related costs like fuel, platform fees, or materials."
      />

      {best && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <TrophyIcon className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{best.streamName} is your most efficient stream</p>
              <p className="text-sm text-muted-foreground">{formatINR(best.netPerHour)} net per hour, over the last 28 days</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Net pay per hour, by stream</CardTitle>
          <CardDescription>Last 28 days</CardDescription>
        </CardHeader>
        <CardContent>
          <WorkEconomicsChart data={entries} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stream</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Work cost</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Net / hour</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.streamId}>
                  <TableCell className="font-medium">{e.streamName}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatINR(e.gross)}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">-{formatINR(e.workCost)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatINR(e.net)}</TableCell>
                  <TableCell className="text-right tabular-nums">{e.hours}h</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={e === best ? 'default' : 'secondary'}>{formatINR(e.netPerHour)}/hr</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import { AlertTriangleIcon, ReceiptIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { AddExpenseDialog } from '@/components/add-expense-dialog'
import { ExpenseCategoryChart } from '@/components/charts/expense-category-chart'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMoneyMitraState, useMoneyMitraStore } from '@/lib/domain/use-store'
import { formatDateTime, formatINR } from '@/lib/format'
import type { ExpenseCategory } from '@/lib/types'

const KIND_VARIANT: Record<string, 'secondary' | 'outline' | 'destructive'> = {
  essential: 'secondary',
  work: 'outline',
  discretionary: 'outline',
}

export default function ExpensesPage() {
  const state = useMoneyMitraState()
  const store = useMoneyMitraStore()
  const [kindFilter, setKindFilter] = useState<string>('all')

  const byCategory = useMemo(() => {
    const totals = new Map<string, number>()
    for (const e of state.expenseEvents) {
      totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount)
    }
    return Array.from(totals.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
  }, [state.expenseEvents])

  const needsReview = state.expenseEvents.filter((e) => e.status === 'needs-review')

  const filtered = useMemo(() => {
    const events = kindFilter === 'all' ? state.expenseEvents : state.expenseEvents.filter((e) => e.kind === kindFilter)
    return events.slice(0, 40)
  }, [state.expenseEvents, kindFilter])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Expenses"
        description="Everything you've spent, split by category and by whether it was essential, work-related, or discretionary."
        actions={<AddExpenseDialog />}
      />

      {needsReview.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangleIcon className="size-4 shrink-0 text-amber-600" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{needsReview.length} expense{needsReview.length > 1 ? 's' : ''} need review</span>
                <span className="text-xs text-muted-foreground">
                  Auto-categorized with low confidence. Confirm the category to improve future suggestions.
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                needsReview.forEach((e) => store.correctExpenseCategory(e.id, e.aiSuggestedCategory ?? e.category))
                toast.success('All categories confirmed')
              }}
            >
              Confirm all
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Spend by category</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseCategoryChart data={byCategory} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Top categories</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {byCategory.slice(0, 5).map((c) => (
              <div key={c.category} className="flex items-center justify-between text-sm">
                <span>{c.category}</span>
                <span className="font-medium tabular-nums">{formatINR(c.total)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expense events</CardTitle>
            <ToggleGroup type="single" variant="outline" value={kindFilter} onValueChange={(v) => v && setKindFilter(v)}>
              <ToggleGroupItem value="all">All</ToggleGroupItem>
              <ToggleGroupItem value="essential">Essential</ToggleGroupItem>
              <ToggleGroupItem value="work">Work</ToggleGroupItem>
              <ToggleGroupItem value="discretionary">Discretionary</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ReceiptIcon />
                </EmptyMedia>
                <EmptyTitle>No expenses</EmptyTitle>
                <EmptyDescription>Try a different filter or log a new expense.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-muted-foreground">{formatDateTime(e.date)}</TableCell>
                    <TableCell>
                      {e.status === 'needs-review' ? (
                        <Select
                          defaultValue={e.aiSuggestedCategory ?? e.category}
                          onValueChange={(v) => store.correctExpenseCategory(e.id, v as ExpenseCategory)}
                        >
                          <SelectTrigger size="sm" className="h-7 w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {(['Fuel', 'Food', 'Rent', 'Phone', 'Transport', 'Family', 'Health', 'Shopping', 'Other'] as ExpenseCategory[]).map(
                                (c) => (
                                  <SelectItem key={c} value={c}>
                                    {c}
                                  </SelectItem>
                                ),
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="font-medium">{e.category}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={KIND_VARIANT[e.kind] ?? 'outline'} className="capitalize">
                        {e.kind}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-40 truncate text-muted-foreground">{e.note ?? '—'}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatINR(e.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={e.status === 'needs-review' ? 'destructive' : 'outline'} className="capitalize">
                        {e.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

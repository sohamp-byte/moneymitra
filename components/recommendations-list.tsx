'use client'

import { LightbulbIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClassificationBadge } from '@/components/classification-badge'
import { useMoneyMitraState, useMoneyMitraStore } from '@/lib/domain/use-store'
import { formatINR } from '@/lib/format'

export function RecommendationsList() {
  const state = useMoneyMitraState()
  const store = useMoneyMitraStore()

  const recommendations = state.jars
    .filter((j) => j.suggestedContribution && j.suggestedContribution > 0)
    .slice(0, 3)
    .map((j) => ({
      id: j.id,
      title: `Add ${formatINR(j.suggestedContribution ?? 0)} to ${j.name}`,
      reason: j.suggestionReason ?? 'Keeps this jar on pace toward its target.',
      jarId: j.id,
      amount: j.suggestedContribution ?? 0,
    }))

  if (recommendations.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <LightbulbIcon className="size-4" />
          Recommended for you
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {recommendations.map((r) => (
          <div key={r.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{r.title}</span>
                <ClassificationBadge classification="ESTIMATED" />
              </div>
              <p className="text-xs text-muted-foreground">{r.reason}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                store.allocateToJar(r.jarId, r.amount)
                toast.success('Allocated', { description: `${formatINR(r.amount)} moved into the jar.` })
              }}
            >
              Apply
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

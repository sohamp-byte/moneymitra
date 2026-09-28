'use client'

import { ShieldIcon, LockIcon, LayersIcon, WalletIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClassificationBadge } from '@/components/classification-badge'
import { EvidencePopover } from '@/components/evidence-popover'
import { useMoneyMitraState } from '@/lib/domain/use-store'
import { calculateSafeToSpend } from '@/lib/calculations'
import { formatINR } from '@/lib/format'

export function SafeToSpendCard() {
  const state = useMoneyMitraState()
  const result = calculateSafeToSpend(state)

  const breakdown = [
    { label: 'Protected (jar minimums)', amount: result.protectedAmount, icon: LockIcon },
    { label: 'Allocated this cycle', amount: result.allocatedAmount, icon: LayersIcon },
    { label: 'Resilience buffer', amount: result.resilienceBuffer, icon: ShieldIcon },
  ]

  return (
    <Card className="bg-primary text-primary-foreground">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary-foreground/90">
            <WalletIcon className="size-4" />
            Safe to spend
          </CardTitle>
          <div className="flex items-center gap-1">
            <ClassificationBadge
              classification={result.classification}
              className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
            />
            <div className="text-primary-foreground/80 [&_svg]:text-primary-foreground/80">
              <EvidencePopover
                classification={result.classification}
                assumptions={result.assumptions}
                evidence={result.evidence}
                sourceStateTimestamp={result.sourceStateTimestamp}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <p className="text-4xl font-semibold tabular-nums tracking-tight">{formatINR(result.safeToSpend)}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {breakdown.map((b) => (
            <div key={b.label} className="flex items-center gap-2 rounded-lg bg-primary-foreground/10 p-2.5">
              <b.icon className="size-3.5 shrink-0 text-primary-foreground/70" />
              <div className="flex flex-col">
                <span className="text-[11px] text-primary-foreground/70">{b.label}</span>
                <span className="text-sm font-medium tabular-nums">{formatINR(b.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

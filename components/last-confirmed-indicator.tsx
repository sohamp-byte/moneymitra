'use client'

import { CheckCircle2Icon, ClockIcon } from 'lucide-react'
import { useMoneyMitraState } from '@/lib/domain/use-store'
import { formatDateTime } from '@/lib/format'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function LastConfirmedIndicator() {
  const state = useMoneyMitraState()
  const Icon = state.demoMode === 'offline' ? ClockIcon : CheckCircle2Icon

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="size-3.5" />
          <span>Last confirmed {formatDateTime(state.lastConfirmedAt)}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        All figures are calculated from data confirmed as of this timestamp.
      </TooltipContent>
    </Tooltip>
  )
}

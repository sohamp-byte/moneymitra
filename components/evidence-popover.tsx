import { InfoIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ClassificationBadge } from '@/components/classification-badge'
import { formatDateTime } from '@/lib/format'

export function EvidencePopover({
  classification,
  assumptions,
  evidence,
  sourceStateTimestamp,
}: {
  classification: 'CALCULATED' | 'FORECAST' | 'CONFIRMED' | 'ESTIMATED' | 'PENDING'
  assumptions: string[]
  evidence?: string[]
  sourceStateTimestamp?: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="size-6 text-muted-foreground">
          <InfoIcon />
          <span className="sr-only">Show how this number was calculated</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">How this was calculated</span>
            <ClassificationBadge classification={classification} />
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground">Assumptions</p>
            <ul className="flex flex-col gap-1 text-xs text-foreground/90">
              {assumptions.map((a, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-muted-foreground">•</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
          {evidence && evidence.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-muted-foreground">Evidence</p>
              <ul className="flex flex-col gap-1 text-xs text-foreground/90">
                {evidence.map((e, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span className="text-muted-foreground">•</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {sourceStateTimestamp ? (
            <p className="text-[11px] text-muted-foreground">Based on data confirmed {formatDateTime(sourceStateTimestamp)}</p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}

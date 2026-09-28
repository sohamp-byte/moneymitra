import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Classification = 'CALCULATED' | 'FORECAST' | 'CONFIRMED' | 'ESTIMATED' | 'PENDING'

const STYLES: Record<Classification, string> = {
  CALCULATED: 'bg-primary/10 text-primary border-primary/20',
  FORECAST: 'bg-accent text-accent-foreground border-accent',
  CONFIRMED: 'bg-secondary text-secondary-foreground border-secondary',
  ESTIMATED: 'bg-muted text-muted-foreground border-border',
  PENDING: 'bg-muted text-muted-foreground border-border',
}

export function ClassificationBadge({ classification, className }: { classification: Classification; className?: string }) {
  return (
    <Badge variant="outline" className={cn('font-mono text-[10px] tracking-wide uppercase', STYLES[classification], className)}>
      {classification}
    </Badge>
  )
}

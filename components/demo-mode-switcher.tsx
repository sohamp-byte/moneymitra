'use client'

import { CheckIcon, FlaskConicalIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useMoneyMitraState, useMoneyMitraStore } from '@/lib/domain/use-store'
import type { DemoModeState } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const MODES: { value: DemoModeState; label: string; description: string }[] = [
  { value: 'online', label: 'Online', description: 'Everything syncs normally.' },
  { value: 'offline', label: 'Offline', description: 'Simulate no network connection.' },
  { value: 'low-confidence', label: 'Low confidence', description: 'Simulate stale or thin data.' },
  { value: 'expired-consent', label: 'Expired consent', description: 'Simulate a lapsed data-sharing consent.' },
  { value: 'permission-denied', label: 'Permission denied', description: 'Simulate a scope-restricted API client.' },
]

export function DemoModeSwitcher() {
  const state = useMoneyMitraState()
  const store = useMoneyMitraStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <FlaskConicalIcon data-icon="inline-start" />
          Demo mode
          <span className="hidden sm:inline text-muted-foreground">· {MODES.find((m) => m.value === state.demoMode)?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Simulate a system state</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {MODES.map((mode) => (
            <DropdownMenuItem
              key={mode.value}
              onSelect={() => {
                store.setDemoMode(mode.value)
                toast(`Demo mode: ${mode.label}`, { description: mode.description })
              }}
            >
              <div className="flex w-full items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className={cn('text-sm', state.demoMode === mode.value && 'font-medium')}>{mode.label}</span>
                  <span className="text-xs text-muted-foreground">{mode.description}</span>
                </div>
                {state.demoMode === mode.value ? <CheckIcon className="mt-0.5 size-4 shrink-0" /> : null}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

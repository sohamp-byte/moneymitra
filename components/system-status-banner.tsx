'use client'

import { AlertTriangleIcon, ShieldOffIcon, SignalZeroIcon, WifiOffIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useMoneyMitraState, useMoneyMitraStore } from '@/lib/domain/use-store'
import { formatDateTime } from '@/lib/format'

export function SystemStatusBanner() {
  const state = useMoneyMitraState()
  const store = useMoneyMitraStore()

  if (state.demoMode === 'online') return null

  if (state.demoMode === 'offline') {
    return (
      <Alert variant="destructive">
        <WifiOffIcon />
        <AlertTitle>You&apos;re offline</AlertTitle>
        <AlertDescription>
          Showing your last confirmed numbers from {formatDateTime(state.lastConfirmedAt)}. New income and expenses are
          saved on this device and will sync automatically once you&apos;re back online.
        </AlertDescription>
      </Alert>
    )
  }

  if (state.demoMode === 'low-confidence') {
    return (
      <Alert>
        <SignalZeroIcon />
        <AlertTitle>Low confidence estimate</AlertTitle>
        <AlertDescription>
          Recent data is thinner than usual, so figures below are labeled ESTIMATED rather than CALCULATED. Confirm a
          few more income or expense events to sharpen this estimate.
        </AlertDescription>
      </Alert>
    )
  }

  if (state.demoMode === 'expired-consent') {
    return (
      <Alert variant="destructive">
        <ShieldOffIcon />
        <AlertTitle>A data-sharing consent has expired</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
          <span>Some income events may be missing until you renew consent with the connected data partner.</span>
          <Button size="sm" variant="outline" asChild>
            <a href="/consent">Review consent</a>
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (state.demoMode === 'permission-denied') {
    return (
      <Alert variant="destructive">
        <AlertTriangleIcon />
        <AlertTitle>Permission denied on API request</AlertTitle>
        <AlertDescription>
          The active API client is missing a required scope. Requests that write data will be rejected until scopes
          are updated in Developers → API Explorer.
        </AlertDescription>
      </Alert>
    )
  }

  return null
}

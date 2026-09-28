'use client'

import { useSyncExternalStore } from 'react'
import { moneyMitraStore } from './store'
import type { AppState } from '@/lib/mock/seed'
import { createSeedState } from '@/lib/mock/seed'

const SERVER_SNAPSHOT: AppState = createSeedState()

export function useMoneyMitraState(): AppState {
  return useSyncExternalStore(
    (cb) => moneyMitraStore.subscribe(cb),
    () => moneyMitraStore.getState(),
    () => SERVER_SNAPSHOT,
  )
}

export function useMoneyMitraStore() {
  return moneyMitraStore
}

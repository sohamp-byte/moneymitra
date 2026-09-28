'use client'

// A single in-memory source of truth for the whole demo. The dashboard UI and
// the mock API client both read and write through this store, which is what
// guarantees the numbers shown in the UI are identical to what the API
// Explorer returns. State persists to localStorage for the session only —
// this stands in for the real MoneyMitra backend.
import type { AppState } from '@/lib/mock/seed'
import { createSeedState } from '@/lib/mock/seed'
import type {
  Consent,
  DemoModeState,
  ExpenseCategory,
  ExpenseEvent,
  ExpenseKind,
  Goal,
  Jar,
  Profile,
  SyncOperation,
} from '@/lib/types'

const STORAGE_KEY = 'moneymitra-state-v2'

type Listener = () => void

function loadPersisted(): AppState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AppState
  } catch {
    return null
  }
}

class MoneyMitraStore {
  private state: AppState
  private listeners = new Set<Listener>()

  constructor() {
    this.state = loadPersisted() ?? createSeedState()
  }

  getState(): AppState {
    return this.state
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private set(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
    const next = typeof patch === 'function' ? patch(this.state) : patch
    this.state = { ...this.state, ...next }
    this.persist()
    this.listeners.forEach((l) => l())
  }

  private persist() {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
    } catch {
      // storage unavailable (private mode, quota) — demo continues in-memory only
    }
  }

  resetDemo() {
    this.state = createSeedState()
    this.persist()
    this.listeners.forEach((l) => l())
  }

  completeOnboarding(profile: Profile, resilienceBufferTarget?: number) {
    this.set({ onboarded: true, profile, ...(resilienceBufferTarget ? { resilienceBufferTarget } : {}) })
  }

  setDemoMode(mode: DemoModeState) {
    this.set({ demoMode: mode })
  }

  confirmNow() {
    this.set({ lastConfirmedAt: new Date().toISOString() })
  }

  addIncomeEvent(input: { stream: string; gross: number; workCost: number; note?: string; hours?: number }) {
    const now = new Date().toISOString()
    const id = `inc_manual_${Date.now()}`
    const isOffline = this.state.demoMode === 'offline'
    const event = {
      id,
      amount: input.gross,
      currency: 'INR' as const,
      date: now,
      stream: input.stream,
      source: 'Manual entry',
      gross: input.gross,
      workCost: input.workCost,
      net: input.gross - input.workCost,
      hours: input.hours,
      note: input.note,
      status: isOffline ? ('pending-sync' as const) : ('confirmed' as const),
      provenance: 'user-entered' as const,
      createdAt: now,
      updatedAt: now,
      idempotencyKey: `idem_${id}`,
    }
    const syncOp: SyncOperation = {
      id: `sync_${id}`,
      kind: 'income',
      description: `Income · ${input.gross.toLocaleString('en-IN')}`,
      amount: input.gross,
      status: isOffline ? 'pending' : 'synced',
      createdAt: now,
      idempotencyKey: event.idempotencyKey,
    }
    this.set((s) => ({
      incomeEvents: [event, ...s.incomeEvents],
      recordedResources: s.recordedResources + event.net,
      syncQueue: isOffline ? [syncOp, ...s.syncQueue] : s.syncQueue,
    }))
    return event
  }

  addExpenseEvent(input: { amount: number; category: ExpenseCategory; kind: ExpenseKind; note?: string }) {
    const now = new Date().toISOString()
    const id = `exp_manual_${Date.now()}`
    const isOffline = this.state.demoMode === 'offline'
    const event: ExpenseEvent = {
      id,
      amount: input.amount,
      currency: 'INR',
      date: now,
      category: input.category,
      kind: input.kind,
      note: input.note,
      status: isOffline ? 'pending-sync' : 'confirmed',
      provenance: 'user-entered',
      createdAt: now,
      updatedAt: now,
      idempotencyKey: `idem_${id}`,
    }
    const syncOp: SyncOperation = {
      id: `sync_${id}`,
      kind: 'expense',
      description: `${input.category} expense · ${input.amount.toLocaleString('en-IN')}`,
      amount: input.amount,
      status: isOffline ? 'pending' : 'synced',
      createdAt: now,
      idempotencyKey: event.idempotencyKey,
    }
    this.set((s) => ({
      expenseEvents: [event, ...s.expenseEvents],
      recordedResources: s.recordedResources - event.amount,
      syncQueue: isOffline ? [syncOp, ...s.syncQueue] : s.syncQueue,
    }))
    return event
  }

  correctExpenseCategory(id: string, category: ExpenseCategory) {
    this.set((s) => ({
      expenseEvents: s.expenseEvents.map((e) => (e.id === id ? { ...e, category, status: 'corrected', provenance: 'user-entered' } : e)),
    }))
  }

  allocateToJar(jarId: string, amount: number) {
    this.set((s) => ({
      jars: s.jars.map((j) => (j.id === jarId ? { ...j, current: j.current + amount, allocatedThisCycle: Math.max(0, j.allocatedThisCycle - amount) } : j)),
      recordedResources: s.recordedResources - 0, // moving between protected buckets, not spendable resources
    }))
  }

  createJar(input: Omit<Jar, 'id' | 'current' | 'allocatedThisCycle' | 'createdAt'>) {
    const jar: Jar = {
      ...input,
      id: `jar_${Date.now()}`,
      current: 0,
      allocatedThisCycle: 0,
      createdAt: new Date().toISOString(),
    }
    this.set((s) => ({ jars: [...s.jars, jar] }))
    return jar
  }

  updateJarRule(jarId: string, patch: Partial<Pick<Jar, 'contributionRule' | 'contributionValue' | 'priority' | 'protectedMinimum'>>) {
    this.set((s) => ({ jars: s.jars.map((j) => (j.id === jarId ? { ...j, ...patch } : j)) }))
  }

  createGoal(input: Omit<Goal, 'id'>) {
    const goal: Goal = { ...input, id: `goal_${Date.now()}` }
    this.set((s) => ({ goals: [...s.goals, goal] }))
    return goal
  }

  revokeConsent(id: string) {
    this.set((s) => ({ consents: s.consents.map((c) => (c.id === id ? { ...c, status: 'revoked' as Consent['status'] } : c)) }))
  }

  retrySync() {
    this.set((s) => ({
      syncQueue: [],
      incomeEvents: s.incomeEvents.map((e) => (e.status === 'pending-sync' ? { ...e, status: 'confirmed' } : e)),
      expenseEvents: s.expenseEvents.map((e) => (e.status === 'pending-sync' ? { ...e, status: 'confirmed' } : e)),
    }))
  }

  setApiClientStatus(id: string, status: 'active' | 'suspended') {
    this.set((s) => ({ apiClients: s.apiClients.map((c) => (c.id === id ? { ...c, status } : c)) }))
  }
}

export const moneyMitraStore = new MoneyMitraStore()

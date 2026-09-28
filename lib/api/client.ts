'use client'

// A mock implementation of the MoneyMitra Protocol API. It reads and writes
// through the exact same store the dashboard UI uses, so every response the
// API Explorer shows is guaranteed to match what's on screen elsewhere in
// the app. In production this class would be swapped for a real HTTP client
// hitting api.moneymitra.dev — every method signature below mirrors a real
// documented endpoint.
import { moneyMitraStore } from '@/lib/domain/store'
import {
  calculateForecast,
  calculateIncomeRhythm,
  calculateRunway,
  calculateSafeToSpend,
  calculateWorkEconomics,
} from '@/lib/calculations'

export interface ApiEnvelope<T> {
  data: T
  meta: {
    requestId: string
    timestamp: string
    classification: string
  }
}

const NETWORK_DELAY_MS = 260

function envelope<T>(data: T, classification = 'CALCULATED'): ApiEnvelope<T> {
  return {
    data,
    meta: {
      requestId: `req_${Math.random().toString(36).slice(2, 10)}`,
      timestamp: new Date().toISOString(),
      classification,
    },
  }
}

async function delay<T>(value: T): Promise<T> {
  await new Promise((r) => setTimeout(r, NETWORK_DELAY_MS))
  return value
}

export const moneyMitraApi = {
  async getSafeToSpend() {
    const state = moneyMitraStore.getState()
    if (state.demoMode === 'offline') throw new ApiError('OFFLINE', 'No network connection. Showing last confirmed value.')
    return delay(envelope(calculateSafeToSpend(state), 'CALCULATED'))
  },

  async getIncomeRhythm() {
    const state = moneyMitraStore.getState()
    return delay(envelope(calculateIncomeRhythm(state), 'CALCULATED'))
  },

  async getRunway() {
    const state = moneyMitraStore.getState()
    return delay(envelope(calculateRunway(state), 'FORECAST'))
  },

  async getWorkEconomics(days = 28) {
    const state = moneyMitraStore.getState()
    return delay(envelope(calculateWorkEconomics(state, days), 'CALCULATED'))
  },

  async getForecast(horizonDays: 7 | 30) {
    const state = moneyMitraStore.getState()
    return delay(envelope(calculateForecast(state, horizonDays), 'FORECAST'))
  },

  async listIncomeEvents(limit = 20) {
    const state = moneyMitraStore.getState()
    return delay(envelope(state.incomeEvents.slice(0, limit), 'CONFIRMED'))
  },

  async listExpenseEvents(limit = 20) {
    const state = moneyMitraStore.getState()
    return delay(envelope(state.expenseEvents.slice(0, limit), 'CONFIRMED'))
  },

  async listJars() {
    const state = moneyMitraStore.getState()
    return delay(envelope(state.jars, 'CONFIRMED'))
  },

  async postIncomeEvent(input: { stream: string; gross: number; workCost: number; note?: string }) {
    const state = moneyMitraStore.getState()
    if (state.demoMode === 'permission-denied') {
      throw new ApiError('PERMISSION_DENIED', 'This API client does not have the write:income-events scope.')
    }
    const event = moneyMitraStore.addIncomeEvent(input)
    return delay(envelope(event, 'CONFIRMED'))
  },
} as const

export class ApiError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

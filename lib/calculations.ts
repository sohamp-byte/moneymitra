// The MoneyMitra Deterministic Financial Engine.
//
// Every number shown in the product is produced by one of these pure
// functions operating on the current AppState. Nothing here is random or
// hardcoded per-screen — the Dashboard, Income, Work Economics, Forecast,
// Runway and Assistant screens all call the same functions, which is what
// keeps every number consistent across the whole app.
import type { AppState } from '@/lib/mock/seed'
import type {
  ForecastRange,
  IncomeEvent,
  IncomeRhythm,
  Runway,
  SafeToSpendResult,
  WorkEconomicsEntry,
} from '@/lib/types'
import { STREAM_META } from '@/lib/mock/generators'

function eventsWithinDays(events: { date: string }[], days: number): typeof events {
  const cutoff = Date.now() - days * 86_400_000
  return events.filter((e) => new Date(e.date).getTime() >= cutoff)
}

function isSameLocalDay(iso: string, ref: Date): boolean {
  const d = new Date(iso)
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate()
}

export function sumJarProtected(state: AppState): number {
  return state.jars.reduce((acc, j) => acc + j.protectedMinimum, 0)
}

export function sumJarAllocated(state: AppState): number {
  return state.jars.reduce((acc, j) => acc + j.allocatedThisCycle, 0)
}

export function calculateSafeToSpend(state: AppState): SafeToSpendResult {
  const protectedAmount = sumJarProtected(state)
  const allocatedAmount = sumJarAllocated(state)
  const resilienceBuffer = state.resilienceBufferTarget
  const safeToSpend = Math.max(0, state.recordedResources - protectedAmount - allocatedAmount - resilienceBuffer)

  return {
    safeToSpend,
    protectedAmount,
    allocatedAmount,
    resilienceBuffer,
    confidence: state.demoMode === 'low-confidence' ? 'low' : 'high',
    calculationTimestamp: new Date().toISOString(),
    sourceStateTimestamp: state.lastConfirmedAt,
    assumptions: [
      'Recorded resources reflect confirmed income and expense events synced up to the last confirmation timestamp.',
      'Protected amounts cover jar minimums tied to upcoming obligations (rent, phone, bike maintenance).',
      'Allocated amounts are contributions already earmarked this cycle but not yet moved into jars.',
      `A resilience buffer of ${resilienceBuffer.toLocaleString('en-IN')} is held back to absorb a slow-income day.`,
    ],
    evidence: [
      `${state.jars.length} jars contributing ${protectedAmount.toLocaleString('en-IN')} in protected minimums.`,
      `${state.incomeEvents.filter((e) => e.status === 'confirmed').length} confirmed income events considered.`,
    ],
    classification: 'CALCULATED',
  }
}

export function calculateTodaySummary(state: AppState) {
  const today = new Date()
  const incomeToday = state.incomeEvents.filter((e) => isSameLocalDay(e.date, today))
  const expenseToday = state.expenseEvents.filter((e) => isSameLocalDay(e.date, today))
  const gross = incomeToday.reduce((a, e) => a + e.gross, 0)
  const workCost = incomeToday.reduce((a, e) => a + e.workCost, 0)
  const net = gross - workCost
  const expenses = expenseToday.reduce((a, e) => a + e.amount, 0)
  const allocatedToday = Math.round(sumJarAllocated(state) / 7)
  const safeToSpendChange = net - expenses - allocatedToday
  return { gross, workCost, net, expenses, allocatedToday, safeToSpendChange, incomeToday, expenseToday }
}

export function calculateIncomeRhythm(state: AppState): IncomeRhythm {
  const days = 28
  const recent = eventsWithinDays(state.incomeEvents, days) as IncomeEvent[]
  const byDay = new Map<string, number>()
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    byDay.set(d.toDateString(), 0)
  }
  for (const e of recent) {
    const key = new Date(e.date).toDateString()
    byDay.set(key, (byDay.get(key) ?? 0) + e.gross)
  }
  const dailySeries = Array.from(byDay.entries())
    .map(([key, amount]) => ({ day: key, amount }))
    .reverse()

  // Weekly buckets (7-day windows) for average / range.
  const weeklyTotals: number[] = []
  for (let w = 0; w < 4; w++) {
    const start = w * 7
    const slice = dailySeries.slice(days - start - 7 < 0 ? 0 : days - start - 7, days - start)
    weeklyTotals.push(slice.reduce((a, s) => a + s.amount, 0))
  }
  const averageWeekly = Math.round(weeklyTotals.reduce((a, b) => a + b, 0) / weeklyTotals.length)
  const recentRangeLow = Math.min(...weeklyTotals)
  const recentRangeHigh = Math.max(...weeklyTotals)

  const byWeekday = new Map<number, number>()
  for (const e of recent) {
    const wd = new Date(e.date).getDay()
    byWeekday.set(wd, (byWeekday.get(wd) ?? 0) + e.gross)
  }
  const bestWeekdayIdx = Array.from(byWeekday.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 6
  const bestEarningDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][bestWeekdayIdx]

  let gapDays = 0
  let currentGap = 0
  for (const s of dailySeries) {
    if (s.amount === 0) {
      currentGap += 1
      gapDays = Math.max(gapDays, currentGap)
    } else {
      currentGap = 0
    }
  }

  const streamTotals = new Map<string, number>()
  for (const e of recent) streamTotals.set(e.stream, (streamTotals.get(e.stream) ?? 0) + e.gross)
  const ranked = Array.from(streamTotals.entries()).sort((a, b) => b[1] - a[1])
  const mainStream = STREAM_META[ranked[0]?.[0]]?.name ?? 'Delivery'
  const secondaryStream = STREAM_META[ranked[1]?.[0]]?.name ?? 'Freelance'

  return {
    averageWeekly,
    recentRangeLow,
    recentRangeHigh,
    bestEarningDay,
    incomeGapDays: gapDays,
    mainStream,
    secondaryStream,
    dailySeries,
    classification: 'CALCULATED',
  }
}

export function calculateRunway(state: AppState): Runway {
  const rhythm = calculateIncomeRhythm(state)
  const sts = calculateSafeToSpend(state)
  const avgDaily = rhythm.averageWeekly / 7
  const currentResilienceDays = avgDaily > 0 ? Math.round((sts.safeToSpend + sts.resilienceBuffer) / avgDaily) : 0
  const impactIfStop5Days = Math.round(avgDaily * 5)
  const safeToSpendChangeIfStop5Days = -impactIfStop5Days
  return {
    currentResilienceDays,
    impactIfStop5Days,
    safeToSpendChangeIfStop5Days,
    assumptions: [
      'Assumes essential obligations and jar contributions continue at the current pace.',
      'Based on your average daily net income over the last 28 days.',
      'Does not account for one-time expenses outside your recorded categories.',
    ],
    classification: 'FORECAST',
  }
}

export function calculateWorkEconomics(state: AppState, days = 28): WorkEconomicsEntry[] {
  const recent = eventsWithinDays(state.incomeEvents, days) as IncomeEvent[]
  return state.workStreams.map((stream) => {
    const events = recent.filter((e) => e.stream === stream.id)
    const gross = events.reduce((a, e) => a + e.gross, 0)
    const workCost = events.reduce((a, e) => a + e.workCost, 0)
    const net = gross - workCost
    const hours = events.reduce((a, e) => a + (e.hours ?? 0), 0)
    return {
      streamId: stream.id,
      streamName: stream.name,
      gross,
      workCost,
      net,
      hours: Math.round(hours * 10) / 10,
      netPerHour: hours > 0 ? Math.round(net / hours) : 0,
    }
  })
}

export function calculateForecast(state: AppState, horizonDays: 7 | 30): ForecastRange {
  const rhythm = calculateIncomeRhythm(state)
  const avgDaily = rhythm.averageWeekly / 7
  const essentialDaily =
    state.expenseEvents
      .filter((e) => e.kind === 'essential')
      .reduce((a, e) => a + e.amount, 0) / 28

  const incomeLow = Math.round(avgDaily * horizonDays * 0.82)
  const incomeHigh = Math.round(avgDaily * horizonDays * 1.18)
  const essentialLow = Math.round(essentialDaily * horizonDays * 0.9)
  const essentialHigh = Math.round(essentialDaily * horizonDays * 1.1)

  return {
    horizonDays,
    expectedIncomeLow: incomeLow,
    expectedIncomeHigh: incomeHigh,
    expectedEssentialOutflowLow: essentialLow,
    expectedEssentialOutflowHigh: essentialHigh,
    projectedFlexibleLow: Math.max(0, incomeLow - essentialHigh),
    projectedFlexibleHigh: Math.max(0, incomeHigh - essentialLow),
    assumptions: [
      `Projected from your average daily net income over the last 28 days (₹${Math.round(avgDaily).toLocaleString('en-IN')}/day).`,
      'Essential outflow projection is based on your recorded rent, phone, family and health expenses.',
      'Ranges widen for the 30-day horizon to reflect greater uncertainty further out.',
    ],
    classification: 'FORECAST',
  }
}

export function jarRequiredPace(jarCurrent: number, jarTarget: number, dueDateIso?: string): { perDay: number; daysLeft: number } {
  if (!dueDateIso) return { perDay: 0, daysLeft: 0 }
  const daysLeft = Math.max(1, Math.ceil((new Date(dueDateIso).getTime() - Date.now()) / 86_400_000))
  const remaining = Math.max(0, jarTarget - jarCurrent)
  return { perDay: Math.round(remaining / daysLeft), daysLeft }
}

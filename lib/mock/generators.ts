import type { ExpenseCategory, ExpenseEvent, ExpenseKind, IncomeEvent } from '@/lib/types'
import { isoDaysAgo, mulberry32 } from './rng'

const SEED = 42_017

export const STREAM_META: Record<string, { name: string; workCostRatio: number }> = {
  delivery: { name: 'Delivery', workCostRatio: 0.185 },
  freelance: { name: 'Freelance', workCostRatio: 0.03 },
  other: { name: 'Side Work', workCostRatio: 0.06 },
}

function round(n: number) {
  return Math.round(n / 10) * 10
}

export function generateIncomeEvents(daysBack: number): IncomeEvent[] {
  const rand = mulberry32(SEED)
  const events: IncomeEvent[] = []

  // Today is authored explicitly so the "Today" card tells one exact story.
  events.push(
    makeIncomeEvent({
      daysAgo: 0,
      stream: 'delivery',
      gross: 2150,
      workCost: 420,
      hours: 6.5,
      status: 'confirmed',
      provenance: 'confirmed',
    }),
  )

  for (let d = 1; d < daysBack; d++) {
    const date = new Date()
    date.setDate(date.getDate() - d)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const skip = rand() < 0.09 // occasional rest / gap day
    if (skip) continue

    const roll = rand()
    const stream: keyof typeof STREAM_META = roll < 0.62 ? 'delivery' : roll < 0.85 ? 'freelance' : 'other'
    const base = stream === 'delivery' ? 1500 : stream === 'freelance' ? 1650 : 700
    const weekendBoost = isWeekend && stream === 'delivery' ? 1.35 : 1
    const variance = 0.72 + rand() * 0.56
    const gross = round(base * weekendBoost * variance)
    const workCost = stream === 'delivery' ? round(gross * STREAM_META[stream].workCostRatio) : Math.round(gross * STREAM_META[stream].workCostRatio)
    const hours = stream === 'delivery' ? Math.round((5 + rand() * 3) * 10) / 10 : Math.round((2 + rand() * 4) * 10) / 10

    events.push(
      makeIncomeEvent({
        daysAgo: d,
        stream,
        gross,
        workCost,
        hours,
        status: d < 3 ? 'confirmed' : 'confirmed',
        provenance: d === 1 ? 'ai-suggested' : 'confirmed',
      }),
    )

    // Occasional second income event on a strong delivery day.
    if (stream === 'delivery' && isWeekend && rand() < 0.4) {
      events.push(
        makeIncomeEvent({
          daysAgo: d,
          stream: 'freelance',
          gross: round(500 + rand() * 700),
          workCost: round(20 + rand() * 40),
          hours: Math.round((1 + rand() * 2) * 10) / 10,
          status: 'confirmed',
          provenance: 'confirmed',
        }),
      )
    }
  }

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

let incomeCounter = 0
function makeIncomeEvent(input: {
  daysAgo: number
  stream: string
  gross: number
  workCost: number
  hours: number
  status: IncomeEvent['status']
  provenance: IncomeEvent['provenance']
}): IncomeEvent {
  incomeCounter += 1
  const date = isoDaysAgo(input.daysAgo)
  const net = input.gross - input.workCost
  return {
    id: `inc_${input.daysAgo}_${incomeCounter}`,
    amount: input.gross,
    currency: 'INR',
    date,
    stream: input.stream,
    source: input.daysAgo === 0 ? 'Confirmed' : 'App sync',
    gross: input.gross,
    workCost: input.workCost,
    net,
    hours: input.hours,
    status: input.status,
    provenance: input.provenance,
    createdAt: date,
    updatedAt: date,
    idempotencyKey: `idem_inc_${input.daysAgo}_${incomeCounter}`,
  }
}

const EXPENSE_CATEGORIES: { category: ExpenseCategory; kind: ExpenseKind; weight: number; base: number }[] = [
  { category: 'Fuel', kind: 'work', weight: 0.22, base: 220 },
  { category: 'Food', kind: 'discretionary', weight: 0.2, base: 160 },
  { category: 'Transport', kind: 'work', weight: 0.1, base: 90 },
  { category: 'Rent', kind: 'essential', weight: 0.03, base: 12000 },
  { category: 'Phone', kind: 'essential', weight: 0.05, base: 349 },
  { category: 'Family', kind: 'essential', weight: 0.08, base: 1200 },
  { category: 'Health', kind: 'essential', weight: 0.05, base: 450 },
  { category: 'Shopping', kind: 'discretionary', weight: 0.15, base: 500 },
  { category: 'Other', kind: 'discretionary', weight: 0.12, base: 220 },
]

export function generateExpenseEvents(daysBack: number): ExpenseEvent[] {
  const rand = mulberry32(SEED + 7)
  const events: ExpenseEvent[] = []

  events.push(
    makeExpenseEvent({ daysAgo: 0, category: 'Fuel', kind: 'work', amount: 340, status: 'confirmed', provenance: 'confirmed' }),
  )
  events.push(
    makeExpenseEvent({ daysAgo: 0, category: 'Food', kind: 'discretionary', amount: 310, status: 'confirmed', provenance: 'confirmed' }),
  )

  for (let d = 1; d < daysBack; d++) {
    const numEvents = rand() < 0.15 ? 2 : rand() < 0.85 ? 1 : 0
    for (let i = 0; i < numEvents; i++) {
      const roll = rand()
      let acc = 0
      const entry = EXPENSE_CATEGORIES.find((c) => {
        acc += c.weight
        return roll <= acc
      }) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1]

      if (entry.category === 'Rent' && d % 30 !== 3) continue // rent lands once per cycle
      const amount = entry.category === 'Rent' ? entry.base : round(entry.base * (0.55 + rand() * 0.9))
      const needsReview = d === 2 && i === 0
      events.push(
        makeExpenseEvent({
          daysAgo: d,
          category: entry.category,
          kind: entry.kind,
          amount,
          status: needsReview ? 'needs-review' : 'confirmed',
          provenance: needsReview ? 'ai-suggested' : 'user-entered',
          aiSuggestedCategory: needsReview ? entry.category : undefined,
        }),
      )
    }
  }

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

let expenseCounter = 0
function makeExpenseEvent(input: {
  daysAgo: number
  category: ExpenseCategory
  kind: ExpenseKind
  amount: number
  status: ExpenseEvent['status']
  provenance: ExpenseEvent['provenance']
  aiSuggestedCategory?: ExpenseCategory
}): ExpenseEvent {
  expenseCounter += 1
  const date = isoDaysAgo(input.daysAgo)
  return {
    id: `exp_${input.daysAgo}_${expenseCounter}`,
    amount: input.amount,
    currency: 'INR',
    date,
    category: input.category,
    kind: input.kind,
    relatedStream: input.kind === 'work' ? 'delivery' : undefined,
    status: input.status,
    provenance: input.provenance,
    aiSuggestedCategory: input.aiSuggestedCategory,
    createdAt: date,
    updatedAt: date,
    idempotencyKey: `idem_exp_${input.daysAgo}_${expenseCounter}`,
  }
}

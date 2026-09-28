import type { AppState } from '@/lib/mock/seed'
import { calculateSafeToSpend, calculateRunway, calculateForecast, calculateWorkEconomics, calculateIncomeRhythm } from '@/lib/calculations'
import { formatINR } from '@/lib/format'

function topExpenseCategories(state: AppState) {
  const totals = new Map<string, number>()
  for (const e of state.expenseEvents) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount)
  }
  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}

export interface AssistantSuggestion {
  id: string
  label: string
}

export interface AssistantReply {
  text: string
  suggestions?: AssistantSuggestion[]
}

const GREETINGS = ['hi', 'hello', 'hey', 'namaste', 'yo']

export function generateAssistantReply(input: string, state: AppState): AssistantReply {
  const q = input.trim().toLowerCase()

  if (GREETINGS.some((g) => q === g || q.startsWith(g + ' '))) {
    return {
      text: `Hi! I'm your MoneyMitra assistant. I can only answer from what's already recorded in your account — I never guess. Ask me about what's safe to spend, your runway, or which income stream pays best.`,
      suggestions: [
        { id: 'safe', label: 'How much can I spend today?' },
        { id: 'runway', label: 'How long will my money last?' },
      ],
    }
  }

  if (/safe.?to.?spend|spend today|can i spend|afford/.test(q)) {
    const s = calculateSafeToSpend(state)
    return {
      text: `You have ${formatINR(s.safeToSpend)} safe to spend right now. This is your recorded resources minus money already committed to jars, upcoming bills, and your safety buffer. Classification: ${s.classification}.`,
      suggestions: [{ id: 'why-safe', label: 'Why this amount?' }, { id: 'runway', label: "What's my runway?" }],
    }
  }

  if (/runway|how long|last/.test(q)) {
    const r = calculateRunway(state)
    return {
      text: `At your current pace, your money is estimated to last ${r.currentResilienceDays} days without new income. ${r.assumptions[0] ?? ''}`,
      suggestions: [{ id: 'forecast', label: 'Show my 30-day forecast' }],
    }
  }

  if (/forecast|next month|next week|30.day|7.day/.test(q)) {
    const days = /7.day|next week/.test(q) ? 7 : 30
    const f = calculateForecast(state, days)
    return {
      text: `Over the next ${days} days, I expect income between ${formatINR(f.expectedIncomeLow)} and ${formatINR(f.expectedIncomeHigh)}, based on your recent activity. This is a ${f.classification.toLowerCase()} estimate, not a guarantee.`,
    }
  }

  if (/best stream|which (stream|job|work)|net.?per.?hour|hourly|efficient/.test(q)) {
    const entries = calculateWorkEconomics(state)
    if (!entries.length) return { text: "I don't have enough recorded income events yet to compare your streams." }
    const best = entries.reduce((a, b) => (b.netPerHour > a.netPerHour ? b : a))
    return {
      text: `${best.streamName} is your most efficient stream at ${formatINR(best.netPerHour)} net per hour over the last 28 days, after work-related costs.`,
      suggestions: [{ id: 'work-econ', label: 'Show full breakdown' }],
    }
  }

  if (/income|earn|made|rhythm/.test(q)) {
    const rhythm = calculateIncomeRhythm(state)
    return {
      text: `Your average weekly income is ${formatINR(rhythm.averageWeekly)}, mainly from ${rhythm.mainStream}, recently ranging from ${formatINR(rhythm.recentRangeLow)} to ${formatINR(rhythm.recentRangeHigh)} per week. Classification: ${rhythm.classification}.`,
    }
  }

  if (/expense|spending|spent|category/.test(q)) {
    const breakdown = topExpenseCategories(state)
    if (!breakdown.length) return { text: "I don't see any recorded expenses in the current window." }
    const top = breakdown[0]
    return {
      text: `Your largest expense category recently is ${top.category} at ${formatINR(top.total)}. I can only report categories you've recorded or confirmed — nothing is inferred beyond that.`,
    }
  }

  if (/jar|goal|save/.test(q)) {
    const jars = state.jars
    if (!jars.length) return { text: "You haven't created any jars yet. Jars help you set aside money for specific goals." }
    const lines = jars.map((j) => `${j.name}: ${formatINR(j.current)} of ${formatINR(j.target)}`).join('; ')
    return { text: `Here's where your jars stand: ${lines}.` }
  }

  return {
    text: "I can only answer using what's recorded in your MoneyMitra account — income events, expenses, jars, and the calculations built from them. Try asking about your safe-to-spend amount, runway, forecast, or which stream pays best.",
    suggestions: [
      { id: 'safe', label: 'How much can I spend today?' },
      { id: 'best-stream', label: 'Which stream pays best?' },
      { id: 'runway', label: "What's my runway?" },
    ],
  }
}

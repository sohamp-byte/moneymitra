// Core MoneyMitra Protocol domain types.
// These types describe the shape of data that will eventually be served by the
// real MoneyMitra API. The reference client only ever depends on these types
// and on the MoneyMitraApiClient interface — never on how the data was produced.

export type Currency = 'INR'

export type Provenance =
  | 'confirmed'
  | 'user-entered'
  | 'imported'
  | 'ai-suggested'
  | 'calculated'
  | 'estimated'
  | 'forecast'
  | 'recommendation'

export type OutputClassification =
  | 'CONFIRMED'
  | 'CALCULATED'
  | 'ESTIMATED'
  | 'FORECAST'
  | 'RECOMMENDATION'

export type EventStatus = 'confirmed' | 'pending-sync' | 'needs-review' | 'corrected'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface Profile {
  name: string
  workType: string
  city: string
  currency: Currency
  language: 'English' | 'Hindi' | 'Marathi'
  voiceEnabled: boolean
  incomeVariability: 'Almost every day' | 'Every week' | 'Somewhat variable' | 'Very unpredictable'
}

export interface WorkStream {
  id: string
  name: string
  kind: 'delivery' | 'ride-hailing' | 'freelance' | 'other'
  color: string
}

export interface IncomeEvent {
  id: string
  amount: number
  currency: Currency
  date: string // ISO date
  stream: string // WorkStream id
  source: string
  gross: number
  workCost: number
  net: number
  hours?: number
  note?: string
  status: EventStatus
  provenance: Provenance
  createdAt: string
  updatedAt: string
  idempotencyKey: string
}

export type ExpenseCategory =
  | 'Fuel'
  | 'Food'
  | 'Rent'
  | 'Phone'
  | 'Transport'
  | 'Family'
  | 'Health'
  | 'Shopping'
  | 'Other'

export type ExpenseKind = 'essential' | 'work' | 'discretionary'

export interface ExpenseEvent {
  id: string
  amount: number
  currency: Currency
  date: string
  category: ExpenseCategory
  kind: ExpenseKind
  relatedStream?: string
  note?: string
  status: EventStatus
  provenance: Provenance
  aiSuggestedCategory?: ExpenseCategory
  createdAt: string
  updatedAt: string
  idempotencyKey: string
}

export type ObligationStatus = 'protected' | 'on-track' | 'needs-attention'

export interface Obligation {
  id: string
  name: string
  amount: number
  dueDate: string
  recurring: boolean
  status: ObligationStatus
}

export type JarPriority = 'high' | 'medium' | 'low'
export type ContributionRule = 'fixed' | 'percentage' | 'adaptive' | 'manual'

export interface Jar {
  id: string
  name: string
  current: number
  target: number
  dueDate?: string
  priority: JarPriority
  protectedMinimum: number
  allocatedThisCycle: number
  contributionRule: ContributionRule
  contributionValue?: number // fixed amount or percentage
  suggestedContribution?: number
  suggestionReason?: string
  createdAt?: string
}

export interface Goal {
  id: string
  name: string
  current: number
  target: number
  dueDate?: string
  category: 'Emergency buffer' | 'Rent' | 'Debt' | 'Travel' | 'Education' | 'Business' | 'Other'
  linkedJarId?: string
}

export interface SafeToSpendResult {
  safeToSpend: number
  protectedAmount: number
  allocatedAmount: number
  resilienceBuffer: number
  confidence: ConfidenceLevel
  calculationTimestamp: string
  sourceStateTimestamp: string
  assumptions: string[]
  evidence: string[]
  classification: OutputClassification
}

export interface IncomeRhythm {
  averageWeekly: number
  recentRangeLow: number
  recentRangeHigh: number
  bestEarningDay: string
  incomeGapDays: number
  mainStream: string
  secondaryStream: string
  dailySeries: { day: string; amount: number }[]
  classification: OutputClassification
}

export interface Runway {
  currentResilienceDays: number
  impactIfStop5Days: number
  safeToSpendChangeIfStop5Days: number
  assumptions: string[]
  classification: OutputClassification
}

export interface WorkEconomicsEntry {
  streamId: string
  streamName: string
  gross: number
  workCost: number
  net: number
  hours: number
  netPerHour: number
}

export interface ForecastRange {
  horizonDays: 7 | 30
  expectedIncomeLow: number
  expectedIncomeHigh: number
  expectedEssentialOutflowLow: number
  expectedEssentialOutflowHigh: number
  projectedFlexibleLow: number
  projectedFlexibleHigh: number
  assumptions: string[]
  classification: OutputClassification
}

export interface Consent {
  id: string
  provider: string
  purpose: string
  dataScope: string[]
  grantedDate: string
  expiryDate: string
  status: 'active' | 'expired' | 'revoked'
}

export interface Recommendation {
  id: string
  title: string
  reason: string
  targetJarId?: string
  amount?: number
  classification: OutputClassification
}

export interface FinancialMemoryItem {
  id: string
  type:
    | 'Income stream'
    | 'Income rhythm'
    | 'Expense pattern'
    | 'Obligation'
    | 'Goal'
    | 'Jar rule'
    | 'User preference'
    | 'Historical correction'
    | 'Forecast history'
    | 'Recommendation feedback'
  summary: string
  createdAt: string
}

export interface SyncOperation {
  id: string
  kind: 'income' | 'expense' | 'jar-allocation'
  description: string
  amount: number
  status: 'pending' | 'syncing' | 'synced' | 'failed'
  createdAt: string
  idempotencyKey: string
}

export interface ApiClient {
  id: string
  name: string
  status: 'active' | 'suspended'
  scopes: string[]
  lastUsed: string
  requestCount: number
}

export type DemoModeState = 'online' | 'offline' | 'low-confidence' | 'expired-consent' | 'permission-denied'

export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  createdAt: string
  card?: {
    kind: 'safe-to-spend' | 'confirmation' | 'work-economics' | 'plain'
    payload?: Record<string, unknown>
  }
}

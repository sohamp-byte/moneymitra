import type {
  ApiClient,
  Consent,
  DemoModeState,
  FinancialMemoryItem,
  Goal,
  Jar,
  Obligation,
  Profile,
  SyncOperation,
  WorkStream,
} from '@/lib/types'
import { generateExpenseEvents, generateIncomeEvents } from './generators'
import { isoDaysAgo } from './rng'

export interface AppState {
  onboarded: boolean
  profile: Profile
  workStreams: WorkStream[]
  incomeEvents: ReturnType<typeof generateIncomeEvents>
  expenseEvents: ReturnType<typeof generateExpenseEvents>
  obligations: Obligation[]
  jars: Jar[]
  goals: Goal[]
  consents: Consent[]
  apiClients: ApiClient[]
  financialMemory: FinancialMemoryItem[]
  syncQueue: SyncOperation[]
  recordedResources: number
  resilienceBufferTarget: number
  demoMode: DemoModeState
  lastConfirmedAt: string
}

export const WORK_STREAMS: WorkStream[] = [
  { id: 'delivery', name: 'Delivery', kind: 'delivery', color: 'var(--chart-1)' },
  { id: 'freelance', name: 'Freelance', kind: 'freelance', color: 'var(--chart-2)' },
  { id: 'other', name: 'Side Work', kind: 'other', color: 'var(--chart-3)' },
]

export function createSeedState(): AppState {
  const now = new Date().toISOString()
  return {
    onboarded: true,
    profile: {
      name: 'Aarav',
      workType: 'Delivery Partner',
      city: 'Mumbai',
      currency: 'INR',
      language: 'English',
      voiceEnabled: true,
      incomeVariability: 'Every week',
    },
    workStreams: WORK_STREAMS,
    incomeEvents: generateIncomeEvents(60),
    expenseEvents: generateExpenseEvents(60),
    obligations: [
      { id: 'ob_rent', name: 'Rent', amount: 12000, dueDate: isoDaysAgo(-6), recurring: true, status: 'protected' },
      { id: 'ob_phone', name: 'Phone', amount: 699, dueDate: isoDaysAgo(-3), recurring: true, status: 'on-track' },
      { id: 'ob_bike', name: 'Bike maintenance', amount: 1500, dueDate: isoDaysAgo(-12), recurring: false, status: 'needs-attention' },
    ],
    jars: [
      {
        id: 'jar_rent',
        name: 'Rent',
        current: 7400,
        target: 12000,
        dueDate: isoDaysAgo(-6),
        priority: 'high',
        protectedMinimum: 4600,
        contributionRule: 'adaptive',
        allocatedThisCycle: 1200,
        suggestedContribution: 450,
        suggestionReason: 'Your rent deadline is 6 days away and current progress is below the required pace.',
      },
      {
        id: 'jar_emergency',
        name: 'Emergency',
        current: 4800,
        target: 10000,
        priority: 'high',
        protectedMinimum: 2000,
        contributionRule: 'percentage',
        contributionValue: 8,
        allocatedThisCycle: 900,
        suggestedContribution: 300,
        suggestionReason: 'Based on your recent income rhythm, a small weekly contribution keeps your buffer growing.',
      },
      {
        id: 'jar_bike',
        name: 'Bike Maintenance',
        current: 1200,
        target: 3000,
        dueDate: isoDaysAgo(-12),
        priority: 'medium',
        protectedMinimum: 1000,
        contributionRule: 'fixed',
        contributionValue: 200,
        allocatedThisCycle: 610,
        suggestedContribution: 200,
        suggestionReason: 'Your bike service is due in 12 days and current savings are below target.',
      },
      {
        id: 'jar_family',
        name: 'Family',
        current: 2500,
        target: 5000,
        priority: 'medium',
        protectedMinimum: 500,
        contributionRule: 'manual',
        allocatedThisCycle: 400,
        suggestedContribution: 250,
        suggestionReason: 'A steady contribution keeps this goal on pace without affecting other jars.',
      },
    ],
    goals: [
      { id: 'goal_emergency', name: 'Emergency buffer', current: 4800, target: 10000, category: 'Emergency buffer', linkedJarId: 'jar_emergency' },
      { id: 'goal_bike', name: 'Bike Maintenance', current: 1200, target: 3000, dueDate: isoDaysAgo(-12), category: 'Other', linkedJarId: 'jar_bike' },
    ],
    consents: [
      {
        id: 'consent_app',
        provider: 'MoneyMitra App',
        purpose: 'Financial planning and Safe-to-Spend estimation',
        dataScope: ['Income events', 'Expense events', 'Jars & goals'],
        grantedDate: isoDaysAgo(90),
        expiryDate: isoDaysAgo(-275),
        status: 'active',
      },
      {
        id: 'consent_partner',
        provider: 'Authorized financial-data partner',
        purpose: 'Import confirmed income events from delivery platform',
        dataScope: ['Income events'],
        grantedDate: isoDaysAgo(44),
        expiryDate: isoDaysAgo(-45),
        status: 'active',
      },
      {
        id: 'consent_manual',
        provider: 'Manual entry',
        purpose: 'User-entered income and expenses',
        dataScope: ['Income events', 'Expense events'],
        grantedDate: isoDaysAgo(120),
        expiryDate: isoDaysAgo(-999),
        status: 'active',
      },
    ],
    apiClients: [
      { id: 'client_app', name: 'MoneyMitra App', status: 'active', scopes: ['read:safe-to-spend', 'read:income', 'write:income', 'read:jars', 'write:jars'], lastUsed: isoDaysAgo(0), requestCount: 18240 },
      { id: 'client_payroll', name: 'Partner Payroll Platform', status: 'active', scopes: ['read:income-rhythm', 'read:work-economics'], lastUsed: isoDaysAgo(1), requestCount: 4120 },
      { id: 'client_gig', name: 'Gig Platform', status: 'active', scopes: ['write:income-events'], lastUsed: isoDaysAgo(0), requestCount: 9875 },
      { id: 'client_demo', name: 'Demo Developer', status: 'suspended', scopes: ['read:capabilities'], lastUsed: isoDaysAgo(14), requestCount: 32 },
    ],
    financialMemory: [
      { id: 'mem_1', type: 'Income stream', summary: 'Delivery identified as primary income stream (62% of income events).', createdAt: isoDaysAgo(60) },
      { id: 'mem_2', type: 'Income rhythm', summary: 'Weekend income is consistently higher than weekdays.', createdAt: isoDaysAgo(30) },
      { id: 'mem_3', type: 'Obligation', summary: 'Rent of ₹12,000 recorded as a recurring monthly obligation.', createdAt: isoDaysAgo(88) },
      { id: 'mem_4', type: 'Jar rule', summary: 'Emergency jar set to an adaptive 8% of confirmed income.', createdAt: isoDaysAgo(40) },
      { id: 'mem_5', type: 'Historical correction', summary: 'Expense category corrected from "Other" to "Fuel" on 3 occasions.', createdAt: isoDaysAgo(12) },
    ],
    syncQueue: [],
    recordedResources: 18450,
    resilienceBufferTarget: 2000,
    demoMode: 'online',
    lastConfirmedAt: now,
  }
}

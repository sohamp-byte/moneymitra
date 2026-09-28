'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BikeIcon,
  BriefcaseIcon,
  CircleDollarSignIcon,
  LayersIcon,
  ShieldCheckIcon,
  StoreIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { useMoneyMitraStore } from '@/lib/domain/use-store'
import type { Profile } from '@/lib/types'
import { formatINR } from '@/lib/format'
import { cn } from '@/lib/utils'

const WORK_TYPES: { value: Profile['workType']; label: string; description: string; icon: typeof BikeIcon }[] = [
  { value: 'gig-delivery', label: 'Delivery & rides', description: 'Food delivery, ride-hailing, courier work', icon: BikeIcon },
  { value: 'freelance', label: 'Freelance services', description: 'Tailoring, tutoring, repairs, salon work', icon: BriefcaseIcon },
  { value: 'small-trader', label: 'Small trade or stall', description: 'Street vendor, kirana shop, market stall', icon: StoreIcon },
  { value: 'mixed', label: 'A mix of these', description: 'Multiple income streams across the week', icon: LayersIcon },
]

const SOURCES = [
  { id: 'upi', label: 'UPI transactions', description: 'PhonePe, GPay, Paytm income and payouts' },
  { id: 'delivery-app', label: 'Delivery / gig platform', description: 'Daily payout summaries from your work app' },
  { id: 'cash', label: 'Cash sales', description: "You'll log these manually as they happen" },
]

const CONSENTS = [
  { id: 'income-sync', label: 'Sync income events', description: 'Read confirmed payouts to calculate Safe-to-Spend.' },
  { id: 'expense-categorize', label: 'Auto-categorize expenses', description: 'Suggest categories for transactions you log.' },
  { id: 'assistant-context', label: 'Assistant access to your data', description: 'Let the assistant reference your jars, income and goals when answering.' },
]

const STEPS = ['Welcome', 'Work profile', 'Income sources', 'Consent', 'Resilience buffer', 'Done']

export default function OnboardingPage() {
  const router = useRouter()
  const store = useMoneyMitraStore()
  const [step, setStep] = useState(0)

  const [name, setName] = useState('Rekha')
  const [workType, setWorkType] = useState<Profile['workType']>('gig-delivery')
  const [sources, setSources] = useState<Record<string, boolean>>({ upi: true, 'delivery-app': true, cash: false })
  const [consents, setConsents] = useState<Record<string, boolean>>({ 'income-sync': false, 'expense-categorize': false, 'assistant-context': false })
  const [buffer, setBuffer] = useState(1500)

  const allConsented = Object.values(consents).every(Boolean)
  const progress = ((step + 1) / STEPS.length) * 100

  function next() {
    setStep((s) => Math.min(STEPS.length - 1, s + 1))
  }
  function back() {
    setStep((s) => Math.max(0, s - 1))
  }
  function finish() {
    store.completeOnboarding(
      {
        name,
        workType,
        city: 'Pune',
        currency: 'INR',
        language: 'English',
        voiceEnabled: false,
        incomeVariability: 'Somewhat variable',
      },
      buffer,
    )
    router.replace('/dashboard')
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CircleDollarSignIcon className="size-5" />
          </div>
          <div>
            <p className="font-semibold leading-none">MoneyMitra</p>
            <p className="text-xs text-muted-foreground">Setting up your financial OS</p>
          </div>
        </div>

        <Progress value={progress} className="mb-6" />

        <Card>
          {step === 0 && (
            <>
              <CardHeader>
                <CardTitle>Welcome to MoneyMitra</CardTitle>
                <CardDescription>
                  Built for people with income that changes day to day — delivery, freelance, and trading work.
                  We&apos;ll help you always know what&apos;s safe to spend.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">
                  This is a demo experience with realistic sample data — nothing here connects to real bank accounts.
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={next}>
                  Get started
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              </CardFooter>
            </>
          )}

          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Tell us about your work</CardTitle>
                <CardDescription>This helps us tune Safe-to-Spend and Work Economics for your situation.</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Your name</FieldLabel>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel>What best describes your work?</FieldLabel>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {WORK_TYPES.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setWorkType(t.value)}
                          className={cn(
                            'flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-colors hover:bg-accent',
                            workType === t.value && 'border-primary bg-primary/5',
                          )}
                        >
                          <t.icon className="size-4 text-primary" />
                          <span className="text-sm font-medium">{t.label}</span>
                          <span className="text-xs text-muted-foreground">{t.description}</span>
                        </button>
                      ))}
                    </div>
                  </Field>
                </FieldGroup>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="ghost" onClick={back}>
                  <ArrowLeftIcon data-icon="inline-start" />
                  Back
                </Button>
                <Button onClick={next} disabled={!name.trim()}>
                  Continue
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              </CardFooter>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Connect income sources</CardTitle>
                <CardDescription>Choose what to include. You can add or remove sources later in Settings.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {SOURCES.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{s.label}</span>
                      <span className="text-xs text-muted-foreground">{s.description}</span>
                    </div>
                    <Switch checked={sources[s.id]} onCheckedChange={(v) => setSources((prev) => ({ ...prev, [s.id]: v }))} />
                  </div>
                ))}
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="ghost" onClick={back}>
                  <ArrowLeftIcon data-icon="inline-start" />
                  Back
                </Button>
                <Button onClick={next}>
                  Continue
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              </CardFooter>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Your data, your control</CardTitle>
                <CardDescription>Review and approve each way MoneyMitra uses your data. You can revoke any of these later.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {CONSENTS.map((c) => (
                  <label key={c.id} className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer">
                    <Checkbox
                      checked={consents[c.id]}
                      onCheckedChange={(v) => setConsents((prev) => ({ ...prev, [c.id]: Boolean(v) }))}
                      className="mt-0.5"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{c.label}</span>
                      <span className="text-xs text-muted-foreground">{c.description}</span>
                    </div>
                  </label>
                ))}
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="ghost" onClick={back}>
                  <ArrowLeftIcon data-icon="inline-start" />
                  Back
                </Button>
                <Button onClick={next} disabled={!allConsented}>
                  Agree and continue
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              </CardFooter>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Set your resilience buffer</CardTitle>
                <CardDescription>
                  An amount we&apos;ll always hold back from Safe-to-Spend, so a slow day doesn&apos;t leave you short.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Buffer amount</span>
                  <span className="text-2xl font-semibold tabular-nums">{formatINR(buffer)}</span>
                </div>
                <Slider value={[buffer]} onValueChange={([v]) => setBuffer(v)} min={500} max={5000} step={100} />
                <FieldDescription>Recommended: 3–5 days of your typical income. You can change this anytime.</FieldDescription>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="ghost" onClick={back}>
                  <ArrowLeftIcon data-icon="inline-start" />
                  Back
                </Button>
                <Button onClick={next}>
                  Continue
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              </CardFooter>
            </>
          )}

          {step === 5 && (
            <>
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheckIcon className="size-5" />
                </div>
                <CardTitle className="mt-2">You&apos;re all set, {name}</CardTitle>
                <CardDescription>Here&apos;s what we&apos;ve configured. Everything is editable later.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <span className="text-muted-foreground">Work profile</span>
                  <Badge variant="secondary">{WORK_TYPES.find((t) => t.value === workType)?.label}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <span className="text-muted-foreground">Income sources</span>
                  <span className="font-medium">{Object.values(sources).filter(Boolean).length} connected</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <span className="text-muted-foreground">Resilience buffer</span>
                  <span className="font-medium">{formatINR(buffer)}</span>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={finish}>
                  Enter dashboard
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              </CardFooter>
            </>
          )}
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>
      </div>
    </div>
  )
}

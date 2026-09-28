'use client'

import { useState } from 'react'
import { LandmarkIcon, LockIcon, SparklesIcon, TargetIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { CreateJarDialog } from '@/components/create-jar-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import { useMoneyMitraState, useMoneyMitraStore } from '@/lib/domain/use-store'
import { formatINR } from '@/lib/format'
import type { Jar } from '@/lib/types'

const PRIORITY_VARIANT = { high: 'default', medium: 'secondary', low: 'outline' } as const

function AllocateDialog({ jar, open, onOpenChange }: { jar: Jar | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const store = useMoneyMitraStore()
  const [amount, setAmount] = useState('')

  if (!jar) return null

  const handleAllocate = () => {
    const amt = Number(amount)
    if (!amt || amt <= 0) {
      toast.error('Enter an amount to move')
      return
    }
    store.allocateToJar(jar.id, amt)
    toast.success(`${formatINR(amt)} moved into ${jar.name}`)
    setAmount('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move money into {jar.name}</DialogTitle>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="allocate-amount">Amount (INR)</FieldLabel>
          <Input id="allocate-amount" type="number" autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleAllocate}>Move funds</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function JarsPage() {
  const state = useMoneyMitraState()
  const [allocatingJar, setAllocatingJar] = useState<Jar | null>(null)

  const totalProtected = state.jars.reduce((sum, j) => sum + j.current, 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Jars & goals"
        description="Money set aside for a purpose is protected — it's held out of your Safe-to-Spend number until you need it."
        actions={<CreateJarDialog />}
      />

      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <LockIcon className="size-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total protected across {state.jars.length} jars</p>
              <p className="text-xl font-semibold tabular-nums">{formatINR(totalProtected)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {state.jars.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LandmarkIcon />
            </EmptyMedia>
            <EmptyTitle>No jars yet</EmptyTitle>
            <EmptyDescription>Create a jar to start protecting money for rent, EMIs, or a goal.</EmptyDescription>
          </EmptyHeader>
          <CreateJarDialog />
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.jars.map((jar) => {
            const pct = jar.target > 0 ? Math.min(100, Math.round((jar.current / jar.target) * 100)) : 0
            return (
              <Card key={jar.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{jar.name}</CardTitle>
                    <Badge variant={PRIORITY_VARIANT[jar.priority]} className="capitalize shrink-0">
                      {jar.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-semibold tabular-nums">{formatINR(jar.current)}</span>
                    <span className="text-sm text-muted-foreground">of {formatINR(jar.target)}</span>
                  </div>
                  <Progress value={pct} />
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {jar.protectedMinimum > 0 && (
                      <span className="flex items-center gap-1">
                        <LockIcon className="size-3" /> Min {formatINR(jar.protectedMinimum)}
                      </span>
                    )}
                    {jar.dueDate && <span>Due {new Date(jar.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                  {jar.suggestedContribution && jar.suggestionReason && (
                    <div className="flex items-start gap-1.5 rounded-md bg-muted/60 p-2 text-xs text-muted-foreground">
                      <SparklesIcon className="mt-0.5 size-3 shrink-0" />
                      <span>
                        Suggested +{formatINR(jar.suggestedContribution)}/cycle — {jar.suggestionReason}
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="gap-2">
                  <Button size="sm" variant="outline" className="w-full" onClick={() => setAllocatingJar(jar)}>
                    Move funds
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {state.goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Long-term goals</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {state.goals.map((goal) => {
              const pct = goal.target > 0 ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0
              return (
                <div key={goal.id} className="flex flex-col gap-2 rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <TargetIcon className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{goal.name}</span>
                  </div>
                  <Progress value={pct} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatINR(goal.current)}</span>
                    <span>{formatINR(goal.target)}</span>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {goal.category}
                  </Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <AllocateDialog jar={allocatingJar} open={!!allocatingJar} onOpenChange={(v) => !v && setAllocatingJar(null)} />
    </div>
  )
}

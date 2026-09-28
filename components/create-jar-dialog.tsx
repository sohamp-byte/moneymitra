'use client'

import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMoneyMitraStore } from '@/lib/domain/use-store'
import type { ContributionRule, JarPriority } from '@/lib/types'

export function CreateJarDialog() {
  const store = useMoneyMitraStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [protectedMinimum, setProtectedMinimum] = useState('')
  const [priority, setPriority] = useState<JarPriority>('medium')
  const [contributionRule, setContributionRule] = useState<ContributionRule>('percentage')
  const [contributionValue, setContributionValue] = useState('10')

  const reset = () => {
    setName('')
    setTarget('')
    setProtectedMinimum('')
    setPriority('medium')
    setContributionRule('percentage')
    setContributionValue('10')
  }

  const handleSubmit = () => {
    const targetNum = Number(target)
    if (!name.trim() || !targetNum || targetNum <= 0) {
      toast.error('Give the jar a name and a target amount')
      return
    }
    store.createJar({
      name: name.trim(),
      target: targetNum,
      protectedMinimum: Number(protectedMinimum) || 0,
      priority,
      contributionRule,
      contributionValue: Number(contributionValue) || undefined,
    })
    toast.success(`${name.trim()} jar created`)
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon data-icon="inline-start" />
          New jar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a jar</DialogTitle>
          <DialogDescription>Jars protect money for a specific purpose before it counts as safe to spend.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="jar-name">Jar name</FieldLabel>
            <Input id="jar-name" placeholder="Bike EMI" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="jar-target">Target amount (INR)</FieldLabel>
            <Input id="jar-target" type="number" placeholder="20000" value={target} onChange={(e) => setTarget(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="jar-min">Protected minimum (INR)</FieldLabel>
            <Input
              id="jar-min"
              type="number"
              placeholder="0"
              value={protectedMinimum}
              onChange={(e) => setProtectedMinimum(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="jar-priority">Priority</FieldLabel>
              <Select value={priority} onValueChange={(v) => setPriority(v as JarPriority)}>
                <SelectTrigger id="jar-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="jar-rule">Contribution</FieldLabel>
              <Select value={contributionRule} onValueChange={(v) => setContributionRule(v as ContributionRule)}>
                <SelectTrigger id="jar-rule">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="percentage">% of income</SelectItem>
                    <SelectItem value="fixed">Fixed amount</SelectItem>
                    <SelectItem value="adaptive">Adaptive</SelectItem>
                    <SelectItem value="manual">Manual only</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>
          {contributionRule !== 'manual' && contributionRule !== 'adaptive' && (
            <Field>
              <FieldLabel htmlFor="jar-value">
                {contributionRule === 'percentage' ? 'Percentage of each income event' : 'Fixed amount per cycle (INR)'}
              </FieldLabel>
              <Input id="jar-value" type="number" value={contributionValue} onChange={(e) => setContributionValue(e.target.value)} />
            </Field>
          )}
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Create jar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

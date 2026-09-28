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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useMoneyMitraStore } from '@/lib/domain/use-store'
import type { ExpenseCategory, ExpenseKind } from '@/lib/types'

const CATEGORIES: ExpenseCategory[] = ['Fuel', 'Food', 'Rent', 'Phone', 'Transport', 'Family', 'Health', 'Shopping', 'Other']

export function AddExpenseDialog({ trigger }: { trigger?: React.ReactNode }) {
  const store = useMoneyMitraStore()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('Fuel')
  const [kind, setKind] = useState<ExpenseKind>('work')
  const [note, setNote] = useState('')

  function submit() {
    const a = Number(amount)
    if (!a || a <= 0) return
    store.addExpenseEvent({ amount: a, category, kind, note: note || undefined })
    toast.success('Expense recorded', { description: `${category} · ₹${a.toLocaleString('en-IN')}` })
    setAmount('')
    setNote('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline">
            <PlusIcon data-icon="inline-start" />
            Log expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log expense</DialogTitle>
          <DialogDescription>Record a spend. This updates Safe-to-Spend immediately.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="amount">Amount (₹)</FieldLabel>
              <Input id="amount" type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="340" />
            </Field>
            <Field>
              <FieldLabel>Category</FieldLabel>
              <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field>
            <FieldLabel>Type</FieldLabel>
            <ToggleGroup type="single" variant="outline" value={kind} onValueChange={(v) => v && setKind(v as ExpenseKind)} className="justify-start">
              <ToggleGroupItem value="essential">Essential</ToggleGroupItem>
              <ToggleGroupItem value="work">Work cost</ToggleGroupItem>
              <ToggleGroupItem value="discretionary">Discretionary</ToggleGroupItem>
            </ToggleGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="note">Note (optional)</FieldLabel>
            <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Petrol at HP pump" />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={submit} disabled={!amount || Number(amount) <= 0}>
            Save expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMoneyMitraState, useMoneyMitraStore } from '@/lib/domain/use-store'

export function AddIncomeDialog({ trigger }: { trigger?: React.ReactNode }) {
  const state = useMoneyMitraState()
  const store = useMoneyMitraStore()
  const [open, setOpen] = useState(false)
  const [stream, setStream] = useState(state.workStreams[0]?.id ?? 'delivery')
  const [gross, setGross] = useState('')
  const [workCost, setWorkCost] = useState('')
  const [note, setNote] = useState('')

  function submit() {
    const g = Number(gross)
    if (!g || g <= 0) return
    store.addIncomeEvent({ stream, gross: g, workCost: Number(workCost) || 0, note: note || undefined })
    toast.success('Income recorded', { description: `${state.workStreams.find((s) => s.id === stream)?.name} · earnings logged.` })
    setGross('')
    setWorkCost('')
    setNote('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button size="sm">
              <PlusIcon data-icon="inline-start" />
              Log income
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log income</DialogTitle>
          <DialogDescription>Record earnings from a work stream. This updates Safe-to-Spend immediately.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>Work stream</FieldLabel>
            <Select value={stream} onValueChange={(v) => v && setStream(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {state.workStreams.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="gross">Gross earnings (₹)</FieldLabel>
              <Input id="gross" type="number" inputMode="decimal" value={gross} onChange={(e) => setGross(e.target.value)} placeholder="1500" />
            </Field>
            <Field>
              <FieldLabel htmlFor="workCost">Work cost (₹)</FieldLabel>
              <Input id="workCost" type="number" inputMode="decimal" value={workCost} onChange={(e) => setWorkCost(e.target.value)} placeholder="220" />
              <FieldDescription>Fuel, platform fees, etc.</FieldDescription>
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="note">Note (optional)</FieldLabel>
            <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Evening shift, extra tips" />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button onClick={submit} disabled={!gross || Number(gross) <= 0}>
            Save income
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

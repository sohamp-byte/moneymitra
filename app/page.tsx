'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMoneyMitraState } from '@/lib/domain/use-store'
import { Spinner } from '@/components/ui/spinner'

export default function RootPage() {
  const state = useMoneyMitraState()
  const router = useRouter()

  useEffect(() => {
    router.replace(state.onboarded ? '/dashboard' : '/onboarding')
  }, [state.onboarded, router])

  return (
    <div className="flex min-h-svh items-center justify-center">
      <Spinner className="size-6" />
    </div>
  )
}

import type { ReactNode } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { DemoModeSwitcher } from '@/components/demo-mode-switcher'
import { SystemStatusBanner } from '@/components/system-status-banner'
import { LastConfirmedIndicator } from '@/components/last-confirmed-indicator'

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <LastConfirmedIndicator />
          </div>
          <DemoModeSwitcher />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <SystemStatusBanner />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

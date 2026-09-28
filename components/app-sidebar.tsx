'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ActivityIcon,
  BotMessageSquareIcon,
  CircleDollarSignIcon,
  CodeIcon,
  LayoutDashboardIcon,
  PiggyBankIcon,
  ReceiptTextIcon,
  SettingsIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  WalletIcon,
  WrenchIcon,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useMoneyMitraState } from '@/lib/domain/use-store'
import { Badge } from '@/components/ui/badge'

const primaryNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { href: '/income', label: 'Income', icon: WalletIcon },
  { href: '/expenses', label: 'Expenses', icon: ReceiptTextIcon },
  { href: '/jars', label: 'Jars & Goals', icon: PiggyBankIcon },
  { href: '/forecast', label: 'Forecast & Runway', icon: TrendingUpIcon },
  { href: '/work-economics', label: 'Work Economics', icon: WrenchIcon },
  { href: '/assistant', label: 'Assistant', icon: BotMessageSquareIcon },
]

const systemNav = [
  { href: '/activity', label: 'Activity & Sync', icon: ActivityIcon },
  { href: '/consent', label: 'Consent & Data', icon: ShieldCheckIcon },
  { href: '/developers', label: 'Developers', icon: CodeIcon },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
]

export function AppSidebar() {
  const pathname = usePathname()
  const state = useMoneyMitraState()
  const pendingSync = state.syncQueue.length

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <CircleDollarSignIcon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">MoneyMitra</span>
                  <span className="text-xs text-muted-foreground">Financial OS</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Money</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.href === '/activity' && pendingSync > 0 ? (
                    <SidebarMenuBadge>{pendingSync}</SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground">
              <span>{state.profile.name} · {state.profile.workType}</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

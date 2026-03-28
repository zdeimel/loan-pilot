'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, FileText, MessageSquare, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/borrowers', label: 'Borrowers', icon: Users },
  { href: '/dashboard/documents', label: 'Docs', icon: FileText },
  { href: '/dashboard/scenarios', label: 'Scenarios', icon: BarChart3 },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
]

export function MobileTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                isActive ? 'text-pilot-600' : 'text-slate-400 active:text-slate-600'
              )}
            >
              <tab.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.75} />
              <span className={cn('text-[10px] font-medium', isActive ? 'text-pilot-600' : 'text-slate-400')}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-pilot-600 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

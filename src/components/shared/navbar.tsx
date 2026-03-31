'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Plane, Bell, ChevronDown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Navbar({ variant = 'default' }: { variant?: 'default' | 'transparent' | 'dashboard' }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isDashboard = variant === 'dashboard'

  // Dashboard navbar — desktop only (mobile uses MobileTabBar)
  if (isDashboard) {
    return (
      <header className="hidden lg:block sticky top-0 z-50 w-full bg-white border-b border-border">
        <div className="max-w-full mx-auto flex h-16 items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group mr-2">
              <div className="w-8 h-8 rounded-xl bg-pilot-600 flex items-center justify-center shadow-sm">
                <Plane className="w-4 h-4 text-white -rotate-45" />
              </div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">LoanPilot</span>
            </Link>
            <nav className="flex items-center gap-1">
              {[
                { href: '/dashboard', label: 'Overview', exact: true },
                { href: '/dashboard/borrowers', label: 'Borrowers' },
                { href: '/dashboard/conditions', label: 'Conditions' },
                { href: '/dashboard/documents', label: 'Documents' },
                { href: '/dashboard/analytics', label: 'Analytics' },
                { href: '/dashboard/scenarios', label: 'Scenarios' },
                { href: '/dashboard/messages', label: 'Messages' },
              ].map((link) => {
                const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-3.5 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive ? 'text-pilot-600 bg-pilot-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pilot-600 rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-pilot-600 flex items-center justify-center text-white text-sm font-semibold">DC</div>
              <span className="text-sm font-medium text-slate-700">David Chen</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </header>
    )
  }

  // Marketing navbar
  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-border">
      <div
        className="max-w-7xl mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-pilot-600 flex items-center justify-center shadow-sm group-hover:bg-pilot-700 transition-colors">
            <Plane className="w-4 h-4 text-white -rotate-45" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">LoanPilot</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: '/how-it-works', label: 'How It Works' },
            { href: '/apply', label: 'Apply Now' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'text-pilot-600 bg-pilot-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link href="/calculator" className="hidden md:block">
            <Button variant="ghost" size="sm" className="text-slate-500">Calculator</Button>
          </Link>
          <Link href="/dashboard" className="hidden md:block">
            <Button variant="ghost" size="sm" className="text-slate-500">Loan Officers</Button>
          </Link>
          <Link href="/sign-in" className="hidden md:block">
            <Button variant="ghost" size="sm" className="text-slate-600">Sign In</Button>
          </Link>
          <Link href="/apply">
            <Button size="sm" className="hidden sm:flex gap-1.5">
              Start Application
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Mobile full-screen menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-14 animate-fade-in">
          <div className="flex flex-col h-full px-5 pt-6 pb-8">
            <nav className="flex flex-col gap-1">
              {[
                { href: '/', label: 'Home' },
                { href: '/how-it-works', label: 'How It Works' },
                { href: '/apply', label: 'Apply Now' },
                { href: '/dashboard', label: 'Loan Officer Login' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-4 rounded-2xl text-lg font-semibold text-slate-800 hover:bg-slate-50 active:bg-slate-100 border-b border-border last:border-0"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile CTA */}
            <div className="mt-auto">
              <Link href="/apply" onClick={() => setMobileOpen(false)}>
                <Button size="xl" className="w-full gap-2">
                  Start My Application
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <p className="text-center text-xs text-slate-400 mt-4">
                No hard credit pull · Free · 15 minutes
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

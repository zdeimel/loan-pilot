import { MobileTabBar } from '@/components/shared/mobile-tab-bar'
import { Navbar } from '@/components/shared/navbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar variant="dashboard" />
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-border px-4 h-14 flex items-center justify-between"
           style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-pilot-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">LP</span>
          </div>
          <span className="font-bold text-slate-900">LoanPilot</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-pilot-600 flex items-center justify-center text-white text-xs font-bold">DC</div>
            <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
        </div>
      </div>

      {/* Page content — extra bottom padding on mobile for tab bar + safe area */}
      <div className="pb-safe-nav lg:pb-0">
        {children}
      </div>

      {/* Mobile bottom tab bar */}
      <MobileTabBar />
    </>
  )
}

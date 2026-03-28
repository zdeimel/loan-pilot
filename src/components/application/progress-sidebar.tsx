'use client'

import { CheckCircle2, Circle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { applicationSteps } from '@/lib/mock-data'
import Link from 'next/link'

interface ProgressSidebarProps {
  currentStepId: string
  completedSteps: string[]
}

export function ProgressSidebar({ currentStepId, completedSteps }: ProgressSidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <div className="sticky top-24">
        <div className="bg-white rounded-2xl border border-border shadow-card p-5">
          <div className="mb-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Your Progress</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-pilot-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((completedSteps.length / applicationSteps.length) * 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {Math.round((completedSteps.length / applicationSteps.length) * 100)}%
              </span>
            </div>
          </div>

          <nav className="space-y-0.5">
            {applicationSteps.map((step, i) => {
              const isComplete = completedSteps.includes(step.id)
              const isActive = step.id === currentStepId
              const isAccessible = isComplete || isActive || (i > 0 && completedSteps.includes(applicationSteps[i - 1].id))

              return (
                <div key={step.id}>
                  {isAccessible && !step.isLocked ? (
                    <Link
                      href={`/apply/${step.id}`}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150',
                        isActive
                          ? 'bg-pilot-50 text-pilot-700'
                          : isComplete
                          ? 'text-slate-600 hover:bg-slate-50'
                          : 'text-slate-400 hover:bg-slate-50'
                      )}
                    >
                      <StepIcon isComplete={isComplete} isActive={isActive} index={i + 1} isLocked={false} />
                      <span className="text-sm font-medium truncate">{step.label}</span>
                    </Link>
                  ) : (
                    <div
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-xl',
                        step.isLocked || !isAccessible ? 'opacity-40 cursor-not-allowed' : ''
                      )}
                    >
                      <StepIcon isComplete={isComplete} isActive={isActive} index={i + 1} isLocked={!!step.isLocked} />
                      <span className="text-sm font-medium text-slate-400 truncate">{step.label}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Autosave Indicator */}
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Progress auto-saved
            </div>
          </div>
        </div>

        {/* Help Card */}
        <div className="mt-3 bg-pilot-50 rounded-2xl border border-pilot-100 p-4">
          <p className="text-sm font-semibold text-pilot-900 mb-1">Need help?</p>
          <p className="text-xs text-pilot-600 mb-3">Our AI assistant can answer any question about your application.</p>
          <button className="text-xs font-medium text-pilot-700 hover:text-pilot-900 transition-colors">
            Ask a question →
          </button>
        </div>
      </div>
    </aside>
  )
}

function StepIcon({
  isComplete,
  isActive,
  index,
  isLocked,
}: {
  isComplete: boolean
  isActive: boolean
  index: number
  isLocked: boolean
}) {
  if (isLocked) {
    return <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" />
  }
  if (isComplete) {
    return <CheckCircle2 className="w-4 h-4 text-pilot-600 flex-shrink-0" />
  }
  if (isActive) {
    return (
      <div className="w-4 h-4 rounded-full bg-pilot-600 flex-shrink-0 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
      </div>
    )
  }
  return <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
}

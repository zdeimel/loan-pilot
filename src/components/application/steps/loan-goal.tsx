'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home, RefreshCw, DollarSign, FileCheck, CheckCircle2 } from 'lucide-react'
import { StepLayout } from '@/components/application/step-layout'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { cn } from '@/lib/utils'
import type { LoanPurpose } from '@/lib/types'

const options: { value: LoanPurpose; label: string; description: string; icon: React.ElementType; detail: string }[] = [
  {
    value: 'purchase',
    label: 'Buy a Home',
    description: 'Purchase a new primary home, vacation home, or investment property.',
    icon: Home,
    detail: 'You\'ll need a pre-approval or full application. We\'ll guide you through both options.',
  },
  {
    value: 'pre-approval',
    label: 'Get Pre-Approved',
    description: 'Get a pre-approval letter to shop with confidence — no property needed yet.',
    icon: FileCheck,
    detail: 'Takes about 15 minutes. We\'ll give you a solid estimate of what you can borrow.',
  },
  {
    value: 'refinance',
    label: 'Refinance My Home',
    description: 'Lower your interest rate or change your loan term on your current home.',
    icon: RefreshCw,
    detail: 'We\'ll compare your current mortgage against new options and show you your savings.',
  },
  {
    value: 'cash-out',
    label: 'Cash-Out Refinance',
    description: 'Use your home equity for home improvements, debt payoff, or other needs.',
    icon: DollarSign,
    detail: 'You can typically borrow up to 80% of your home\'s value minus what you owe.',
  },
]

const completedSteps = ['loan-goal']

export function LoanGoalStep() {
  const router = useRouter()
  const { currentApplication, updateApplication } = useApplicationStore()
  const [selected, setSelected] = useState<LoanPurpose | undefined>(
    currentApplication.loanDetails?.purpose
  )

  const handleNext = () => {
    if (!selected) return
    updateApplication({ loanDetails: { ...currentApplication.loanDetails, purpose: selected } })
    router.push('/apply/state-income')
  }

  return (
    <StepLayout
      stepId="loan-goal"
      completedSteps={[]}
      onNext={handleNext}
      isNextDisabled={!selected}
      helpText="This helps us personalize your application flow and show you the most relevant loan products."
    >
      <div className="bg-white rounded-2xl border border-border shadow-card p-6 sm:p-8">
        <div className="space-y-3">
          {options.map((opt) => {
            const isSelected = selected === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                className={cn(
                  'w-full text-left rounded-xl border-2 p-4 transition-all duration-150',
                  isSelected
                    ? 'border-pilot-600 bg-pilot-50'
                    : 'border-border bg-white hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                      isSelected ? 'bg-pilot-600 text-white' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    <opt.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('font-semibold', isSelected ? 'text-pilot-900' : 'text-slate-900')}>
                        {opt.label}
                      </p>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-pilot-600 flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{opt.description}</p>
                    {isSelected && (
                      <p className="text-sm text-pilot-600 mt-2 font-medium">{opt.detail}</p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </StepLayout>
  )
}

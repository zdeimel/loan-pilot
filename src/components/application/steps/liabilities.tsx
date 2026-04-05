'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StepLayout } from '@/components/application/step-layout'
import { Input } from '@/components/ui/input'
import { useApplicationStore } from '@/lib/store/applicationStore'
import type { Liability } from '@/lib/types'
import { cn } from '@/lib/utils'

export function LiabilitiesStep() {
  const router = useRouter()
  const { currentApplication, updateApplication, isSaving } = useApplicationStore()

  const existing = currentApplication.liabilities ?? []

  // Undisclosed debts
  const [hasUndisclosed, setHasUndisclosed] = useState<boolean | null>(
    existing.some((l) => l.type === 'other') ? true : existing.length > 0 ? false : null
  )
  const [undisclosedDesc, setUndisclosedDesc] = useState(
    existing.find((l) => l.type === 'other')?.creditor ?? ''
  )
  const [undisclosedMonthly, setUndisclosedMonthly] = useState(
    existing.find((l) => l.type === 'other')?.monthlyPayment?.toString() ?? ''
  )

  // Child support
  const [hasChildSupport, setHasChildSupport] = useState<boolean | null>(
    existing.some((l) => l.type === 'child-support') ? true : existing.length > 0 ? false : null
  )
  const [childSupportMonthly, setChildSupportMonthly] = useState(
    existing.find((l) => l.type === 'child-support')?.monthlyPayment?.toString() ?? ''
  )

  // Alimony
  const [hasAlimony, setHasAlimony] = useState<boolean | null>(
    existing.some((l) => l.type === 'alimony') ? true : existing.length > 0 ? false : null
  )
  const [alimonyMonthly, setAlimonyMonthly] = useState(
    existing.find((l) => l.type === 'alimony')?.monthlyPayment?.toString() ?? ''
  )

  const allAnswered =
    hasUndisclosed !== null && hasChildSupport !== null && hasAlimony !== null

  const handleNext = () => {
    const liabilities: Liability[] = []

    if (hasUndisclosed && undisclosedDesc) {
      liabilities.push({
        id: `lib-undisclosed-${Date.now()}`,
        type: 'other',
        creditor: undisclosedDesc,
        monthlyPayment: Number(undisclosedMonthly) || 0,
        unpaidBalance: 0,
      })
    }

    if (hasChildSupport && childSupportMonthly) {
      liabilities.push({
        id: `lib-child-support-${Date.now()}`,
        type: 'child-support',
        creditor: 'Child support order',
        monthlyPayment: Number(childSupportMonthly) || 0,
        unpaidBalance: 0,
      })
    }

    if (hasAlimony && alimonyMonthly) {
      liabilities.push({
        id: `lib-alimony-${Date.now()}`,
        type: 'alimony',
        creditor: 'Alimony obligation',
        monthlyPayment: Number(alimonyMonthly) || 0,
        unpaidBalance: 0,
      })
    }

    updateApplication({ liabilities })
    router.push('/apply/real-estate')
  }

  return (
    <StepLayout
      stepId="liabilities"
      completedSteps={['loan-goal', 'state-income', 'liquid-cash', 'disclosures', 'credit-consent', 'personal-info', 'co-borrower', 'employment', 'other-income', 'assets']}
      onNext={handleNext}
      isNextDisabled={!allAnswered}
      isSaving={isSaving}
      whyWeAsk="Your credit report already shows most debts. We only need to know about obligations that may not appear there."
    >
      <div className="space-y-5">

        {/* Undisclosed debts */}
        <Question
          question="Do you have any debts not already showing on your credit report?"
          hint="Examples: private loans, informal payment arrangements, obligations to family members."
          value={hasUndisclosed}
          onChange={setHasUndisclosed}
        >
          {hasUndisclosed && (
            <div className="mt-4 space-y-3 pt-4 border-t border-border">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Brief description</label>
                <Input
                  value={undisclosedDesc}
                  onChange={(e) => setUndisclosedDesc(e.target.value)}
                  placeholder="e.g. Personal loan from family member"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Monthly payment</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <Input
                    type="number"
                    className="pl-7"
                    value={undisclosedMonthly}
                    onChange={(e) => setUndisclosedMonthly(e.target.value)}
                    placeholder="500"
                  />
                </div>
              </div>
            </div>
          )}
        </Question>

        {/* Child support */}
        <Question
          question="Do you pay child support?"
          hint="Court-ordered child support payments must be counted in your debt-to-income ratio."
          value={hasChildSupport}
          onChange={setHasChildSupport}
        >
          {hasChildSupport && (
            <div className="mt-4 pt-4 border-t border-border">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Monthly child support amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <Input
                  type="number"
                  className="pl-7"
                  value={childSupportMonthly}
                  onChange={(e) => setChildSupportMonthly(e.target.value)}
                  placeholder="750"
                />
              </div>
            </div>
          )}
        </Question>

        {/* Alimony */}
        <Question
          question="Do you pay alimony or spousal support?"
          hint="Court-ordered alimony payments are included in your monthly debt obligations."
          value={hasAlimony}
          onChange={setHasAlimony}
        >
          {hasAlimony && (
            <div className="mt-4 pt-4 border-t border-border">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Monthly alimony amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <Input
                  type="number"
                  className="pl-7"
                  value={alimonyMonthly}
                  onChange={(e) => setAlimonyMonthly(e.target.value)}
                  placeholder="1,000"
                />
              </div>
            </div>
          )}
        </Question>
      </div>
    </StepLayout>
  )
}

function Question({
  question,
  hint,
  value,
  onChange,
  children,
}: {
  question: string
  hint?: string
  value: boolean | null
  onChange: (v: boolean) => void
  children?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-card p-5">
      <p className="text-sm font-semibold text-slate-900 mb-1">{question}</p>
      {hint && <p className="text-xs text-slate-400 mb-4">{hint}</p>}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Yes', val: true },
          { label: 'No', val: false },
        ].map((opt) => (
          <button
            key={String(opt.val)}
            type="button"
            onClick={() => onChange(opt.val)}
            className={cn(
              'py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
              value === opt.val
                ? opt.val
                  ? 'border-amber-400 bg-amber-50 text-amber-800'
                  : 'border-emerald-400 bg-emerald-50 text-emerald-800'
                : 'border-border text-slate-600 hover:border-slate-300'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {children}
    </div>
  )
}

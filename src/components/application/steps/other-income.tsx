'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, DollarSign } from 'lucide-react'
import { StepLayout } from '@/components/application/step-layout'
import { Input } from '@/components/ui/input'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { OtherIncome } from '@/lib/types'

const incomeTypes: { value: OtherIncome['type']; label: string; description: string }[] = [
  { value: 'rental', label: 'Rental Income', description: 'Income from rental properties you own' },
  { value: 'social-security', label: 'Social Security', description: 'SSA retirement, disability, or survivor benefits' },
  { value: 'pension', label: 'Pension / Retirement', description: 'Defined benefit pension payments' },
  { value: 'disability', label: 'Disability', description: 'Short-term or long-term disability benefits' },
  { value: 'child-support', label: 'Child Support', description: 'Court-ordered child support received' },
  { value: 'alimony', label: 'Alimony', description: 'Court-ordered spousal support received' },
  { value: 'investment', label: 'Investment Income', description: 'Dividends, interest, capital gains' },
  { value: 'military', label: 'Military / VA Benefits', description: 'Active duty pay, VA disability, BAH' },
  { value: 'trust', label: 'Trust Income', description: 'Distributions from a trust or estate' },
  { value: 'other', label: 'Other', description: 'Any other regular income source' },
]

function IncomeCard({
  income,
  onChange,
  onRemove,
  index,
}: {
  income: Partial<OtherIncome>
  onChange: (data: Partial<OtherIncome>) => void
  onRemove: () => void
  index: number
}) {
  return (
    <div className="border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="font-semibold text-slate-800">Income Source {index + 1}</span>
        </div>
        <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors p-1">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Type selector */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Income type</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {incomeTypes.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange({ ...income, type: type.value })}
              className={cn(
                'text-left px-3 py-2.5 rounded-xl border-2 text-sm transition-all',
                income.type === type.value
                  ? 'border-pilot-600 bg-pilot-50 text-pilot-700 font-medium'
                  : 'border-border text-slate-600 hover:border-slate-300'
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
        {income.type && (
          <p className="text-xs text-slate-400 mt-2">
            {incomeTypes.find(t => t.value === income.type)?.description}
          </p>
        )}
      </div>

      {income.type && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Monthly amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <Input
                type="number"
                value={income.monthlyAmount ?? ''}
                onChange={e => onChange({ ...income, monthlyAmount: Number(e.target.value) })}
                className="pl-7"
                placeholder="1,200"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <Input
              value={income.description ?? ''}
              onChange={e => onChange({ ...income, description: e.target.value })}
              placeholder="Brief description"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function OtherIncomeStep() {
  const router = useRouter()
  const { currentApplication, updateApplication, isSaving } = useApplicationStore()

  const [hasOtherIncome, setHasOtherIncome] = useState<boolean | undefined>(
    (currentApplication.otherIncome?.length ?? 0) > 0 ? true : undefined
  )
  const [incomes, setIncomes] = useState<Partial<OtherIncome>[]>(
    currentApplication.otherIncome?.length
      ? currentApplication.otherIncome
      : [{ id: `oi-${Date.now()}` }]
  )

  const updateIncome = (index: number, data: Partial<OtherIncome>) => {
    const updated = [...incomes]; updated[index] = data; setIncomes(updated)
  }
  const removeIncome = (index: number) => {
    const updated = incomes.filter((_, i) => i !== index)
    setIncomes(updated.length ? updated : [{ id: `oi-${Date.now()}` }])
  }
  const addIncome = () => setIncomes([...incomes, { id: `oi-${Date.now()}` }])

  const total = incomes.reduce((s, i) => s + (i.monthlyAmount ?? 0), 0)

  const handleNext = () => {
    updateApplication({
      otherIncome: (hasOtherIncome ? incomes.filter(i => i.type && i.monthlyAmount) : []) as OtherIncome[],
    })
    router.push('/apply/assets')
  }

  const isValid = hasOtherIncome === false || (hasOtherIncome === true && incomes.some(i => i.type && i.monthlyAmount && i.monthlyAmount > 0))

  return (
    <StepLayout
      stepId="other-income"
      completedSteps={['loan-goal', 'personal-info', 'co-borrower', 'employment']}
      onNext={handleNext}
      isNextDisabled={!isValid}
      isSaving={isSaving}
      whyWeAsk="Additional income sources can significantly improve your qualifying income. Social Security, rental income, and pension payments are all counted by lenders — include everything you receive regularly."
    >
      <div className="space-y-4">
        {/* Yes/No cards */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Do you have income beyond your primary employment?</h3>
          <p className="text-sm text-slate-400 mb-5">Rental income, Social Security, pension, disability, child support, investment income, etc.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { value: true, label: 'Yes', description: 'I have additional income to report' },
              { value: false, label: 'No', description: 'My employment income is all I have' },
            ].map(opt => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setHasOtherIncome(opt.value)}
                className={cn(
                  'text-left p-4 rounded-xl border-2 transition-all',
                  hasOtherIncome === opt.value
                    ? 'border-pilot-600 bg-pilot-50'
                    : 'border-border hover:border-slate-300'
                )}
              >
                <p className="font-semibold text-slate-900 mb-0.5">{opt.label}</p>
                <p className="text-sm text-slate-500">{opt.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Income cards */}
        {hasOtherIncome === true && (
          <div className="space-y-4 animate-slide-up">
            {incomes.map((income, i) => (
              <IncomeCard
                key={income.id ?? i}
                income={income}
                onChange={data => updateIncome(i, data)}
                onRemove={() => removeIncome(i)}
                index={i}
              />
            ))}

            <button
              onClick={addIncome}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-border text-slate-400 hover:border-pilot-300 hover:text-pilot-600 transition-all flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add another income source
            </button>

            {/* Running total */}
            {total > 0 && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-800">Total additional monthly income</span>
                  <span className="text-xl font-bold text-emerald-700">{formatCurrency(total)}</span>
                </div>
                <p className="text-xs text-emerald-600 mt-1">This will be added to your qualifying income total</p>
              </div>
            )}
          </div>
        )}
      </div>
    </StepLayout>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, CreditCard, Car, GraduationCap, Home } from 'lucide-react'
import { StepLayout } from '@/components/application/step-layout'
import { Input } from '@/components/ui/input'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { formatCurrency, cn } from '@/lib/utils'
import type { Liability } from '@/lib/types'

const debtTypes: { value: Liability['type']; label: string; icon: React.ElementType }[] = [
  { value: 'mortgage', label: 'Mortgage', icon: Home },
  { value: 'heloc', label: 'HELOC', icon: Home },
  { value: 'auto-loan', label: 'Auto Loan', icon: Car },
  { value: 'student-loan', label: 'Student Loan', icon: GraduationCap },
  { value: 'credit-card', label: 'Credit Card', icon: CreditCard },
  { value: 'personal-loan', label: 'Personal Loan', icon: CreditCard },
  { value: 'child-support', label: 'Child Support', icon: CreditCard },
  { value: 'alimony', label: 'Alimony', icon: CreditCard },
  { value: 'medical', label: 'Medical Debt', icon: CreditCard },
  { value: 'other', label: 'Other', icon: CreditCard },
]

function LiabilityCard({
  liability,
  onChange,
  onRemove,
}: {
  liability: Partial<Liability>
  onChange: (data: Partial<Liability>) => void
  onRemove: () => void
}) {
  const typeDef = debtTypes.find(t => t.value === liability.type) ?? debtTypes[4]
  const Icon = typeDef.icon

  // Student loan note: if $0 payment, lender will use 0.5-1% of balance
  const showStudentLoanNote = liability.type === 'student-loan' && (liability.monthlyPayment ?? 0) === 0 && (liability.unpaidBalance ?? 0) > 0

  return (
    <div className="border border-border rounded-2xl p-5 space-y-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <Icon className="w-4 h-4 text-red-500" />
          </div>
          <span className="font-medium text-slate-800 text-sm">{typeDef.label}</span>
        </div>
        <button onClick={onRemove} className="text-slate-300 hover:text-red-400 transition-colors p-1">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {debtTypes.map(dt => (
          <label
            key={dt.value}
            className={cn(
              'flex items-center justify-center px-2 py-2 rounded-lg border-2 cursor-pointer text-xs text-center transition-all',
              liability.type === dt.value
                ? 'border-red-400 bg-red-50 text-red-700 font-medium'
                : 'border-border text-slate-500 hover:border-slate-300'
            )}
          >
            <input type="radio" className="sr-only" checked={liability.type === dt.value} onChange={() => onChange({ ...liability, type: dt.value })} />
            {dt.label}
          </label>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Creditor / lender name</label>
          <Input value={liability.creditor ?? ''} onChange={e => onChange({ ...liability, creditor: e.target.value })} placeholder="Chase, Toyota Financial..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Account # (last 4) <span className="text-slate-400 font-normal">(optional)</span></label>
          <Input
            value={liability.accountLastFour ?? ''}
            onChange={e => onChange({ ...liability, accountLastFour: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            placeholder="3391"
            maxLength={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Monthly payment</label>
          <Input type="number" value={liability.monthlyPayment ?? ''} onChange={e => onChange({ ...liability, monthlyPayment: Number(e.target.value) })} placeholder="350" prefix="$" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Unpaid balance</label>
          <Input type="number" value={liability.unpaidBalance ?? ''} onChange={e => onChange({ ...liability, unpaidBalance: Number(e.target.value) })} placeholder="15,000" prefix="$" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Months remaining <span className="text-slate-400 font-normal">(optional)</span></label>
          <Input type="number" value={liability.monthsRemaining ?? ''} onChange={e => onChange({ ...liability, monthsRemaining: Number(e.target.value) })} placeholder="48" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Will you pay this off?</label>
          <div className="flex gap-2">
            {[{ value: true, label: 'Yes' }, { value: false, label: 'No' }].map(opt => (
              <label
                key={String(opt.value)}
                className={cn(
                  'flex-1 text-center py-2.5 rounded-xl border-2 cursor-pointer text-sm transition-all',
                  liability.willPayOff === opt.value ? 'border-pilot-600 bg-pilot-50 text-pilot-700 font-medium' : 'border-border text-slate-500'
                )}
              >
                <input type="radio" className="sr-only" checked={liability.willPayOff === opt.value} onChange={() => onChange({ ...liability, willPayOff: opt.value })} />
                {opt.label}
              </label>
            ))}
          </div>
          {liability.willPayOff && <p className="text-xs text-emerald-600 mt-1">This will improve your DTI ratio.</p>}
        </div>
      </div>

      {/* Student loan $0 payment note */}
      {showStudentLoanNote && (
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
          <p className="text-xs text-amber-700">
            <strong>Note:</strong> If your student loan payment is $0 (income-driven plan), lenders will use 0.5%–1% of your balance
            ({formatCurrency((liability.unpaidBalance ?? 0) * 0.005)}–{formatCurrency((liability.unpaidBalance ?? 0) * 0.01)}/mo) depending on loan program.
          </p>
        </div>
      )}

      {/* Child support / alimony note */}
      {(liability.type === 'child-support' || liability.type === 'alimony') && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
          <p className="text-xs text-blue-700">
            Court-ordered {liability.type === 'child-support' ? 'child support' : 'alimony'} is always included in DTI calculations. You'll need to provide the court order.
          </p>
        </div>
      )}
    </div>
  )
}

export function LiabilitiesStep() {
  const router = useRouter()
  const { currentApplication, updateApplication, isSaving } = useApplicationStore()
  const [liabilities, setLiabilities] = useState<Partial<Liability>[]>(
    currentApplication.liabilities?.length ? currentApplication.liabilities : []
  )
  const [hasDebts, setHasDebts] = useState<boolean | undefined>(
    currentApplication.liabilities?.length ? true : undefined
  )

  const updateLiability = (index: number, data: Partial<Liability>) => {
    const updated = [...liabilities]; updated[index] = data; setLiabilities(updated)
  }

  const handleNext = () => {
    updateApplication({ liabilities: liabilities as Liability[] })
    router.push('/apply/real-estate')
  }

  const totalMonthly = liabilities.reduce((sum, l) => sum + (l.willPayOff ? 0 : (l.monthlyPayment ?? 0)), 0)
  const grossMonthly = (currentApplication.employment ?? []).reduce((sum, e) => sum + (e.monthlyIncome ?? 0), 0)
  const dti = grossMonthly > 0 ? Math.round((totalMonthly / grossMonthly) * 1000) / 10 : null

  return (
    <StepLayout
      stepId="liabilities"
      completedSteps={['loan-goal', 'personal-info', 'co-borrower', 'employment', 'other-income', 'assets']}
      onNext={handleNext}
      isNextDisabled={hasDebts === undefined}
      isSaving={isSaving}
      whyWeAsk="Lenders calculate your debt-to-income (DTI) ratio by comparing monthly debt payments to gross monthly income. Most conventional loans require DTI under 43%; FHA allows up to 50% with compensating factors."
    >
      <div className="space-y-4">
        {hasDebts === undefined && (
          <div className="bg-white rounded-2xl border border-border shadow-card p-6">
            <h3 className="font-semibold text-slate-900 mb-2">Do you have any monthly debt obligations?</h3>
            <p className="text-sm text-slate-500 mb-5">Car loans, student loans, credit cards, child support, alimony, personal loans, medical debt.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[{ value: true, label: 'Yes, I have debts', emoji: '📋' }, { value: false, label: 'No outstanding debts', emoji: '✨' }].map(opt => (
                <button
                  key={String(opt.value)}
                  onClick={() => { setHasDebts(opt.value); if (opt.value && !liabilities.length) setLiabilities([{ id: `lib-${Date.now()}`, type: 'credit-card' }]) }}
                  className="p-5 rounded-xl border-2 border-border hover:border-pilot-300 text-left transition-all"
                >
                  <div className="text-2xl mb-2">{opt.emoji}</div>
                  <p className="font-semibold text-slate-900">{opt.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {hasDebts === false && (
          <div className="bg-white rounded-2xl border border-border shadow-card p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Great news!</h3>
            <p className="text-sm text-slate-500 mb-4">No monthly debt obligations means an excellent DTI ratio — a strong qualification factor.</p>
            <button onClick={() => { setHasDebts(true); setLiabilities([{ id: `lib-${Date.now()}`, type: 'credit-card' }]) }} className="text-sm text-slate-400 hover:text-slate-600 underline">
              Wait — I do have some debts
            </button>
          </div>
        )}

        {hasDebts === true && (
          <>
            {/* DTI preview */}
            {dti !== null && totalMonthly > 0 && (
              <div className="bg-white rounded-2xl border border-border shadow-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700">Current back-end DTI (debts only, pre-mortgage)</span>
                  <span className={`text-lg font-bold ${dti < 20 ? 'text-emerald-600' : dti < 36 ? 'text-blue-600' : dti < 43 ? 'text-amber-500' : 'text-red-500'}`}>{dti}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                  <div className={`h-2 rounded-full transition-all duration-500 ${dti < 36 ? 'bg-emerald-500' : dti < 43 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${Math.min(dti, 60)}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>0%</span><span className="text-emerald-600">Excellent &lt;36%</span><span className="text-amber-500">Max 43%</span><span>60%+</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Your proposed mortgage payment will be added on top of this</p>
              </div>
            )}

            {liabilities.map((liability, i) => (
              <LiabilityCard
                key={liability.id ?? i}
                liability={liability}
                onChange={data => updateLiability(i, data)}
                onRemove={() => setLiabilities(liabilities.filter((_, idx) => idx !== i))}
              />
            ))}

            <button
              onClick={() => setLiabilities([...liabilities, { id: `lib-${Date.now()}`, type: 'credit-card' }])}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-border text-slate-400 hover:border-red-300 hover:text-red-500 transition-all flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add another debt
            </button>
          </>
        )}
      </div>
    </StepLayout>
  )
}

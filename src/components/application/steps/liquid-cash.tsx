'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { StepLayout } from '@/components/application/step-layout'
import { Input } from '@/components/ui/input'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { formatCurrency } from '@/lib/utils'

interface FormData {
  liquidCash: string
}

function CashTip({ loanAmount, cash }: { loanAmount: number; cash: number }) {
  if (!cash || !loanAmount) return null
  const pct = (cash / loanAmount) * 100
  if (pct >= 20) return <p className="text-xs text-emerald-600 mt-2">Great — this covers a 20% down payment with room for closing costs.</p>
  if (pct >= 10) return <p className="text-xs text-pilot-600 mt-2">This covers a 10% down payment. You may qualify for conventional or FHA financing.</p>
  if (pct >= 3.5) return <p className="text-xs text-amber-600 mt-2">This covers a minimum FHA down payment. Reserves may be tight — your loan officer will review.</p>
  return <p className="text-xs text-red-500 mt-2">This may not be enough to cover closing costs plus a minimum down payment.</p>
}

export function LiquidCashStep() {
  const router = useRouter()
  const { currentApplication, updateApplication, isSaving } = useApplicationStore()
  const loanAmount = currentApplication.loanDetails?.loanAmount ?? 0

  const { register, watch } = useForm<FormData>({
    defaultValues: {
      liquidCash: currentApplication.liquidCash ? String(currentApplication.liquidCash) : '',
    },
  })

  const cashValue = Number((watch('liquidCash') ?? '').replace(/[^0-9.]/g, '')) || 0

  const saveAndContinue = () => {
    const raw = watch('liquidCash')
    const amount = raw ? Number(raw.replace(/[^0-9.]/g, '')) : undefined
    updateApplication({ liquidCash: amount })
    router.push('/apply/disclosures')
  }

  return (
    <StepLayout
      stepId="liquid-cash"
      completedSteps={['loan-goal', 'state-income']}
      onNext={saveAndContinue}
      isSaving={isSaving}
      whyWeAsk="Your available cash determines which loan programs you're eligible for and affects how much you'll need to bring to closing."
    >
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            How much liquid cash do you have available for down payment and closing costs?
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <Input
              {...register('liquidCash')}
              type="number"
              className="pl-7"
              placeholder="50,000"
              min={0}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">Include checking, savings, and any funds you plan to use at closing.</p>
          {loanAmount > 0 && cashValue > 0 && (
            <CashTip loanAmount={loanAmount} cash={cashValue} />
          )}
        </div>

        {loanAmount > 0 && (
          <div className="bg-slate-50 rounded-2xl border border-border p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Estimated Cash Needed</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Minimum down payment (3.5% FHA)</span>
                <span className="font-medium text-slate-900">{formatCurrency(loanAmount * 0.035)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Est. closing costs (3–4%)</span>
                <span className="font-medium text-slate-900">{formatCurrency(loanAmount * 0.035)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold">
                <span className="text-slate-700">Estimated total needed</span>
                <span className="text-slate-900">{formatCurrency(loanAmount * 0.07)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </StepLayout>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StepLayout } from '@/components/application/step-layout'
import { Input } from '@/components/ui/input'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { formatCurrency, cn } from '@/lib/utils'

const downPaymentSources = [
  { value: 'own-funds', label: 'Own Savings', description: 'Checking, savings, or investment accounts' },
  { value: 'gift', label: 'Gift Funds', description: 'From family — requires a gift letter' },
  { value: 'sale-of-asset', label: 'Asset Sale', description: 'Proceeds from selling a property or investment' },
  { value: 'borrowed', label: 'Borrowed Funds', description: 'Bridge loan or 401k loan (impacts DTI)' },
  { value: 'mixed', label: 'Mixed Sources', description: 'Combination of the above' },
] as const

type DownPaymentSource = typeof downPaymentSources[number]['value']

export function DownPaymentStep() {
  const router = useRouter()
  const { currentApplication, updateApplication, isSaving } = useApplicationStore()

  const ld = currentApplication.loanDetails ?? {}
  const sp = currentApplication.subjectProperty ?? {}
  const purchasePrice = sp.purchasePrice ?? 0

  const [downPaymentAmount, setDownPaymentAmount] = useState<string>(ld.downPaymentAmount?.toString() ?? '')
  const [source, setSource] = useState<DownPaymentSource | undefined>(ld.downPaymentSource as DownPaymentSource | undefined)
  const [giftAmount, setGiftAmount] = useState<string>(ld.giftAmount?.toString() ?? '')
  const [earnestMoney, setEarnestMoney] = useState<string>(ld.earnestMoneyDeposit?.toString() ?? '')
  const [sellerConcessions, setSellerConcessions] = useState<string>(ld.sellerConcessions?.toString() ?? '')

  const dp = Number(downPaymentAmount) || 0
  const dpPercent = purchasePrice > 0 ? Math.round((dp / purchasePrice) * 1000) / 10 : 0
  const loanAmount = purchasePrice > 0 ? purchasePrice - dp : (ld.loanAmount ?? 0)

  // Estimated closing costs: ~2.5–3% of purchase price
  const estimatedClosingCosts = Math.round((purchasePrice || loanAmount) * 0.03)
  const earnestNum = Number(earnestMoney) || 0
  const sellerNum = Number(sellerConcessions) || 0
  const cashToClose = dp + estimatedClosingCosts - earnestNum - sellerNum

  // LTV warnings
  const ltv = loanAmount > 0 && purchasePrice > 0 ? Math.round((loanAmount / purchasePrice) * 1000) / 10 : null
  const needsPMI = ltv !== null && ltv > 80
  const veryLowDown = dpPercent > 0 && dpPercent < 3.5

  const handleNext = () => {
    const dpPercCalc = purchasePrice > 0 ? dp / purchasePrice : 0
    updateApplication({
      loanDetails: {
        ...currentApplication.loanDetails,
        downPaymentAmount: dp,
        downPaymentPercent: Math.round(dpPercCalc * 1000) / 10,
        downPaymentSource: source,
        giftAmount: giftAmount ? Number(giftAmount) : undefined,
        earnestMoneyDeposit: earnestMoney ? Number(earnestMoney) : undefined,
        sellerConcessions: sellerConcessions ? Number(sellerConcessions) : undefined,
        loanAmount: loanAmount > 0 ? loanAmount : ld.loanAmount,
      },
    })
    router.push('/apply/declarations')
  }

  const isValid = dp > 0 && source !== undefined

  return (
    <StepLayout
      stepId="down-payment"
      completedSteps={['loan-goal', 'personal-info', 'co-borrower', 'employment', 'other-income', 'assets', 'liabilities', 'real-estate', 'property']}
      onNext={handleNext}
      isNextDisabled={!isValid}
      isSaving={isSaving}
      whyWeAsk="Your down payment determines your loan-to-value ratio (LTV), which affects your rate, PMI requirement, and eligible programs. We also need to verify the source of funds per federal lending guidelines."
    >
      <div className="space-y-4">
        {/* Down payment amount */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Down payment amount</h3>

          {purchasePrice > 0 && (
            <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-border text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Purchase price</span>
                <span className="font-semibold text-slate-800">{formatCurrency(purchasePrice)}</span>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Down payment amount</label>
              <Input
                type="number"
                value={downPaymentAmount}
                onChange={e => setDownPaymentAmount(e.target.value)}
                placeholder="57,500"
                prefix="$"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Down payment %</label>
              <div className="relative">
                <Input
                  type="number"
                  value={dpPercent > 0 ? dpPercent : ''}
                  onChange={e => {
                    if (purchasePrice > 0) {
                      const pct = Number(e.target.value) / 100
                      setDownPaymentAmount(String(Math.round(purchasePrice * pct)))
                    }
                  }}
                  placeholder="20"
                  step={0.5}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
              </div>
            </div>
          </div>

          {/* Quick % shortcuts */}
          {purchasePrice > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {[3, 3.5, 5, 10, 20, 25].map(pct => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDownPaymentAmount(String(Math.round(purchasePrice * pct / 100)))}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    dpPercent === pct
                      ? 'border-pilot-600 bg-pilot-50 text-pilot-700'
                      : 'border-border text-slate-500 hover:border-slate-300'
                  )}
                >
                  {pct}%
                </button>
              ))}
            </div>
          )}

          {/* LTV / PMI notice */}
          {dp > 0 && purchasePrice > 0 && (
            <div className={cn('mt-4 p-3 rounded-xl border text-xs', needsPMI ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700')}>
              {needsPMI ? (
                <>
                  <strong>PMI required</strong> — with {dpPercent}% down, your LTV is {ltv}%. PMI is typically 0.5–1.5% of the loan annually and drops off at 80% LTV. Consider 20% down to avoid it.
                </>
              ) : (
                <>
                  <strong>No PMI</strong> — {dpPercent}% down puts your LTV at {ltv}%. You avoid private mortgage insurance.
                </>
              )}
            </div>
          )}

          {veryLowDown && (
            <div className="mt-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
              Down payments below 3.5% are only available on VA (0%) and USDA (0%) loans. FHA requires a minimum of 3.5%.
            </div>
          )}
        </div>

        {/* Source of funds */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Source of down payment funds</h3>
          <div className="space-y-2">
            {downPaymentSources.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSource(opt.value)}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-xl border-2 transition-all',
                  source === opt.value ? 'border-pilot-600 bg-pilot-50' : 'border-border hover:border-slate-300'
                )}
              >
                <p className={cn('font-medium text-sm', source === opt.value ? 'text-pilot-800' : 'text-slate-800')}>{opt.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{opt.description}</p>
              </button>
            ))}
          </div>

          {(source === 'gift' || source === 'mixed') && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Gift amount</label>
                <Input
                  type="number"
                  value={giftAmount}
                  onChange={e => setGiftAmount(e.target.value)}
                  placeholder="15,000"
                  prefix="$"
                />
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-xs text-amber-700">
                  A <strong>gift letter</strong> signed by the donor is required, stating the funds are a gift (not a loan). Gift funds must be in your account and documented with a bank statement showing the deposit.
                </p>
              </div>
            </div>
          )}

          {source === 'borrowed' && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-xs text-amber-700">
                Borrowed down payment funds (bridge loans, 401k loans) require the monthly payment to be included in your DTI. Discuss with your loan officer before proceeding.
              </p>
            </div>
          )}
        </div>

        {/* Earnest money & seller concessions */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Other funds</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Earnest money deposit <span className="text-slate-400 font-normal">(optional)</span></label>
              <Input
                type="number"
                value={earnestMoney}
                onChange={e => setEarnestMoney(e.target.value)}
                placeholder="5,000"
                prefix="$"
              />
              <p className="text-xs text-slate-400 mt-1">Paid at contract — applied toward cash to close</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Seller concessions <span className="text-slate-400 font-normal">(optional)</span></label>
              <Input
                type="number"
                value={sellerConcessions}
                onChange={e => setSellerConcessions(e.target.value)}
                placeholder="8,500"
                prefix="$"
              />
              <p className="text-xs text-slate-400 mt-1">Seller paying closing costs reduces your cash needed</p>
            </div>
          </div>
        </div>

        {/* Funds-needed summary */}
        {dp > 0 && (
          <div className="bg-white rounded-2xl border border-border shadow-card p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Estimated funds needed to close</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Down payment</span>
                <span className="font-medium text-slate-900">{formatCurrency(dp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Est. closing costs (~3%)</span>
                <span className="font-medium text-slate-900">{formatCurrency(estimatedClosingCosts)}</span>
              </div>
              {earnestNum > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Earnest money (already paid)</span>
                  <span className="font-medium">− {formatCurrency(earnestNum)}</span>
                </div>
              )}
              {sellerNum > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Seller concessions</span>
                  <span className="font-medium">− {formatCurrency(sellerNum)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-slate-900">Estimated cash to close</span>
                <span className="font-bold text-xl text-pilot-700">{formatCurrency(cashToClose)}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Closing costs are an estimate. Your Loan Estimate will show exact figures within 3 business days of application.</p>
          </div>
        )}
      </div>
    </StepLayout>
  )
}

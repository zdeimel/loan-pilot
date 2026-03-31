'use client'

import { useState, useMemo } from 'react'
import { Navbar } from '@/components/shared/navbar'
import { Input } from '@/components/ui/input'
import { formatCurrency, cn } from '@/lib/utils'
import { calculateRate } from '@/lib/engines/rateEngine'
import { Calculator, Home, TrendingUp, DollarSign, Info } from 'lucide-react'

const PROGRAMS = [
  { value: 'conventional', label: 'Conventional', minDown: 3 },
  { value: 'fha', label: 'FHA', minDown: 3.5 },
  { value: 'va', label: 'VA', minDown: 0 },
  { value: 'usda', label: 'USDA', minDown: 0 },
] as const

export default function CalculatorPage() {
  const [grossMonthly, setGrossMonthly] = useState('8500')
  const [monthlyDebts, setMonthlyDebts] = useState('650')
  const [downPayment, setDownPayment] = useState('57500')
  const [fico, setFico] = useState('740')
  const [program, setProgram] = useState<'conventional' | 'fha' | 'va' | 'usda'>('conventional')
  const [term, setTerm] = useState<30 | 15>(30)

  const results = useMemo(() => {
    const income = Number(grossMonthly)
    const debts = Number(monthlyDebts)
    const dp = Number(downPayment)
    const score = Number(fico)

    if (!income || score < 300) return null

    // Max DTI by program
    const maxDTI = program === 'fha' ? 0.50 : program === 'va' ? 0.55 : 0.45
    const maxHousingDTI = program === 'fha' ? 0.31 : 0.28

    // Max housing payment (back-end constraint)
    const maxFromBack = income * maxDTI - debts
    // Max housing payment (front-end constraint)
    const maxFromFront = income * maxHousingDTI

    const maxPITI = Math.min(maxFromBack, maxFromFront)
    // Estimate taxes + insurance at ~0.25% of loan / 12
    const estimatedTI = 400 // property taxes + insurance estimate
    const maxPI = Math.max(0, maxPITI - estimatedTI)

    // Solve for max loan: P = PI / (r(1+r)^n / ((1+r)^n - 1))
    const rates = calculateRate({ program, fico: score, ltv: 90, loanAmount: 400000, loanTerm: term, propertyUse: 'primary' })
    if (!rates.eligible) return null

    const r = rates.rate / 100 / 12
    const n = term * 12
    const factor = r > 0 ? (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : 1 / n
    const maxLoanFromPayment = factor > 0 ? Math.floor(maxPI / factor) : 0
    const maxPurchasePrice = dp > 0 ? Math.floor(maxLoanFromPayment + dp) : maxLoanFromPayment

    const ltv = maxPurchasePrice > 0 ? Math.round((maxLoanFromPayment / maxPurchasePrice) * 100) : 0
    const dtiIfMax = income > 0 ? Math.round(((maxPI + estimatedTI + debts) / income) * 1000) / 10 : 0

    return {
      maxLoan: maxLoanFromPayment,
      maxPurchase: maxPurchasePrice,
      maxMonthlyPayment: Math.round(maxPI + estimatedTI),
      rate: rates.rate,
      ltv,
      dti: dtiIfMax,
      pmi: rates.pmi,
      // Conservative range: -15% to +5%
      rangeMin: Math.floor(maxPurchasePrice * 0.85),
      rangeMax: Math.floor(maxPurchasePrice * 1.05),
    }
  }, [grossMonthly, monthlyDebts, downPayment, fico, program, term])

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-pilot-600 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Affordability Calculator</h1>
            </div>
            <p className="text-slate-500">Find out how much home you can afford based on your income and debts.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-4">
                <h2 className="font-semibold text-slate-900">Your finances</h2>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Gross monthly income (before taxes)</label>
                  <Input type="number" value={grossMonthly} onChange={e => setGrossMonthly(e.target.value)} prefix="$" placeholder="8,500" />
                  {Number(grossMonthly) > 0 && <p className="text-xs text-slate-400 mt-1">≈ {formatCurrency(Number(grossMonthly) * 12)}/year</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Existing monthly debt payments</label>
                  <Input type="number" value={monthlyDebts} onChange={e => setMonthlyDebts(e.target.value)} prefix="$" placeholder="650" />
                  <p className="text-xs text-slate-400 mt-1">Car loans, student loans, credit cards, etc. (not housing)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Down payment available</label>
                  <Input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} prefix="$" placeholder="57,500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Estimated credit score</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[{ label: 'Poor', range: '580–619', val: '600' }, { label: 'Fair', range: '620–659', val: '640' }, { label: 'Good', range: '660–719', val: '690' }, { label: 'Very Good', range: '720–759', val: '740' }, { label: 'Excellent', range: '760+', val: '780' }].map(s => (
                      <button key={s.val} type="button" onClick={() => setFico(s.val)}
                        className={cn('py-2 rounded-lg border-2 text-xs text-center transition-all', Number(fico) >= Number(s.val) - 20 && Number(fico) <= Number(s.val) + 20 ? 'border-pilot-600 bg-pilot-50 text-pilot-700 font-medium' : 'border-border text-slate-500 hover:border-slate-300')}>
                        <div className="font-medium">{s.label}</div>
                        <div className="text-slate-400">{s.range}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-4">
                <h2 className="font-semibold text-slate-900">Loan options</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Loan program</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROGRAMS.map(p => (
                      <button key={p.value} type="button" onClick={() => setProgram(p.value)}
                        className={cn('py-2.5 rounded-xl border-2 text-sm font-medium transition-all', program === p.value ? 'border-pilot-600 bg-pilot-50 text-pilot-700' : 'border-border text-slate-600 hover:border-slate-300')}>
                        {p.label}
                        <span className="block text-xs font-normal opacity-75">{p.minDown}% min down</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Loan term</label>
                  <div className="flex gap-2">
                    {([30, 15] as const).map(t => (
                      <button key={t} type="button" onClick={() => setTerm(t)}
                        className={cn('flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all', term === t ? 'border-pilot-600 bg-pilot-50 text-pilot-700' : 'border-border text-slate-600 hover:border-slate-300')}>
                        {t}-year
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              {results ? (
                <>
                  {/* Main result */}
                  <div className="bg-pilot-600 rounded-2xl p-6 text-white">
                    <p className="text-pilot-200 text-sm mb-1">Estimated max purchase price</p>
                    <p className="text-4xl font-bold mb-1">{formatCurrency(results.maxPurchase)}</p>
                    <p className="text-pilot-200 text-sm">Range: {formatCurrency(results.rangeMin)} – {formatCurrency(results.rangeMax)}</p>
                  </div>

                  {/* Breakdown */}
                  <div className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-4">
                    <h3 className="font-semibold text-slate-900">Breakdown</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Max loan amount', value: formatCurrency(results.maxLoan), icon: Home },
                        { label: 'Down payment', value: formatCurrency(Number(downPayment)), icon: DollarSign },
                        { label: 'Est. monthly payment (PITI)', value: formatCurrency(results.maxMonthlyPayment), icon: TrendingUp },
                        { label: 'Interest rate', value: `${results.rate}%`, icon: TrendingUp },
                        { label: 'Back-end DTI at max', value: `${results.dti}%`, icon: TrendingUp },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                          <span className="text-sm text-slate-600">{item.label}</span>
                          <span className="font-semibold text-slate-900">{item.value}</span>
                        </div>
                      ))}
                      {results.pmi && (
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-amber-700">+ PMI (LTV {results.ltv}%)</span>
                          <span className="font-semibold text-amber-700">+ {formatCurrency(results.pmi)}/mo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* DTI visualization */}
                  <div className="bg-white rounded-2xl border border-border shadow-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-700">Back-end DTI</span>
                      <span className={cn('font-bold text-lg', results.dti < 36 ? 'text-emerald-600' : results.dti < 43 ? 'text-amber-500' : 'text-red-500')}>{results.dti}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                      <div className={cn('h-2 rounded-full transition-all', results.dti < 36 ? 'bg-emerald-500' : results.dti < 43 ? 'bg-amber-400' : 'bg-red-500')}
                        style={{ width: `${Math.min(results.dti / 60 * 100, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>0%</span><span className="text-emerald-600">Ideal &lt;36%</span><span className="text-amber-500">Max 43–50%</span><span>60%+</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl border border-border p-4 flex gap-2">
                    <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500">This is an estimate based on general DTI guidelines. Actual qualification depends on credit score, employment history, reserves, and the specific lender's guidelines. Property taxes, HOA fees, and insurance will affect your final payment.</p>
                  </div>

                  <a href="/apply" className="block w-full py-4 bg-pilot-600 hover:bg-pilot-700 text-white text-center rounded-2xl font-semibold transition-colors">
                    Start My Application →
                  </a>
                </>
              ) : (
                <div className="bg-white rounded-2xl border border-border shadow-card p-10 text-center">
                  <Calculator className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400">Fill in your income and finances to see your buying power.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

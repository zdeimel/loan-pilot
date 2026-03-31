'use client'

import { Navbar } from '@/components/shared/navbar'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { formatCurrency } from '@/lib/utils'
import { calculateRate } from '@/lib/engines/rateEngine'
import { Printer, Info, AlertCircle } from 'lucide-react'

function LERow({ label, amount, sublabel, bold, shade }: { label: string; amount?: number; sublabel?: string; bold?: boolean; shade?: boolean }) {
  return (
    <div className={`flex items-start justify-between py-2 px-3 rounded-lg ${shade ? 'bg-slate-50' : ''}`}>
      <div>
        <p className={`text-sm ${bold ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>{label}</p>
        {sublabel && <p className="text-xs text-slate-400">{sublabel}</p>}
      </div>
      {amount !== undefined && (
        <span className={`text-sm ${bold ? 'font-bold text-slate-900' : 'text-slate-700'}`}>{formatCurrency(amount)}</span>
      )}
    </div>
  )
}

export default function LoanEstimatePage() {
  const { currentApplication } = useApplicationStore()
  const ld = currentApplication.loanDetails ?? {}
  const sp = currentApplication.subjectProperty ?? {}
  const borrower = currentApplication.borrower ?? {}

  const loanAmount = ld.loanAmount ?? 480000
  const purchasePrice = sp.purchasePrice ?? 600000
  const program = (ld.loanProduct ?? 'conventional') as 'conventional' | 'fha' | 'va' | 'usda' | 'jumbo'
  const term = (ld.loanTerm ?? 30) as 30 | 20 | 15 | 10
  const ltv = purchasePrice > 0 ? Math.round((loanAmount / purchasePrice) * 100) : 80

  const rate = calculateRate({ program, fico: 720, ltv, loanAmount, loanTerm: term, propertyUse: 'primary' })

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const expiryDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  // Closing costs breakdown (standard estimates)
  const origFee = Math.round(loanAmount * 0.01)           // 1% origination
  const discountPoints = 0
  const appraisalFee = 600
  const creditReportFee = 75
  const floodCertFee = 12
  const taxServiceFee = 85
  const titleSearch = 250
  const titleInsurance = Math.round(loanAmount * 0.004)   // ~0.4%
  const settlementFee = 800
  const recordingFee = 150
  const transferTax = Math.round(purchasePrice * 0.001)   // ~0.1% (varies by state)

  // Prepaid items
  const prepaidInterest = Math.round(rate.monthlyPayment / 30 * 15) // ~15 days
  const homeownersInsurance = Math.round(purchasePrice * 0.0055 / 12) // monthly
  const prepaidHOI = homeownersInsurance * 12
  const escrowSetup = (homeownersInsurance * 2) + Math.round(purchasePrice * 0.012 / 12 * 2) // 2 mo each

  const totalOrigination = origFee + discountPoints
  const totalServices = appraisalFee + creditReportFee + floodCertFee + taxServiceFee + titleSearch + titleInsurance + settlementFee + recordingFee + transferTax
  const totalPrepaid = prepaidInterest + prepaidHOI + escrowSetup
  const totalClosingCosts = totalOrigination + totalServices + totalPrepaid
  const cashToClose = (ld.downPaymentAmount ?? purchasePrice - loanAmount) + totalClosingCosts - (ld.earnestMoneyDeposit ?? 0) - (ld.sellerConcessions ?? 0)

  const totalPITI = rate.monthlyPayment + Math.round(purchasePrice * 0.012 / 12) + homeownersInsurance + (rate.pmi ?? 0) + (rate.mip ?? 0)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-6 print:hidden">
            <h1 className="text-2xl font-bold text-slate-900">Loan Estimate</h1>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-border text-slate-600 hover:border-slate-300 text-sm font-medium transition-all">
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 flex gap-2 print:hidden">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">This is an estimated Loan Estimate for planning purposes. Your official, legally-binding Loan Estimate will be delivered within 3 business days of submitting a complete application per RESPA requirements.</p>
          </div>

          <div className="bg-white border border-border rounded-2xl shadow-card print:shadow-none print:border-0 overflow-hidden">
            {/* Header — Page 1 */}
            <div className="bg-slate-800 text-white p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-slate-300 mb-1">Loan Estimate</p>
                  <p className="text-xs text-slate-400">Save this Loan Estimate to compare with your Closing Disclosure</p>
                </div>
                <div className="text-right text-sm text-slate-300">
                  <p>Date Issued: {today}</p>
                  <p>Applicant: {borrower.firstName} {borrower.lastName}</p>
                  <p>NMLS #2234567</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Loan Term', value: `${term} years` },
                  { label: 'Purpose', value: ld.purpose?.charAt(0).toUpperCase() + (ld.purpose?.slice(1) ?? '') },
                  { label: 'Product', value: `${program.toUpperCase()} Fixed` },
                  { label: 'Loan Type', value: program.toUpperCase() },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-xs text-slate-400">{item.label}</p>
                    <p className="font-semibold text-white">{item.value ?? '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Loan Terms */}
            <div className="p-6 border-b border-border">
              <h2 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Loan Terms</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Loan Amount</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(loanAmount)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Interest Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{rate.rate}%</p>
                  <p className="text-xs text-slate-400 mt-0.5">APR {rate.apr}%</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Monthly P&I</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(rate.monthlyPayment)}</p>
                </div>
              </div>
            </div>

            {/* Projected Payments */}
            <div className="p-6 border-b border-border">
              <h2 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Projected Monthly Payment (PITI)</h2>
              <div className="space-y-1">
                <LERow label="Principal & Interest" amount={rate.monthlyPayment} />
                <LERow label="Mortgage Insurance" amount={rate.pmi ?? rate.mip} sublabel={rate.pmi ? 'PMI — drops at 80% LTV' : rate.mip ? 'FHA MIP' : undefined} />
                <LERow label="Est. Property Taxes" amount={Math.round(purchasePrice * 0.012 / 12)} sublabel="Based on 1.2% annual rate" />
                <LERow label="Homeowners Insurance" amount={homeownersInsurance} />
                <LERow label="Total Monthly Payment" amount={totalPITI} bold shade />
              </div>
            </div>

            {/* Closing Costs */}
            <div className="p-6 border-b border-border">
              <h2 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Closing Cost Details</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">A. Origination Charges</p>
                  <LERow label="Origination Fee (1%)" amount={origFee} />
                  <LERow label="Total Origination" amount={totalOrigination} bold shade />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">B–H. Services & Fees</p>
                  <LERow label="Appraisal" amount={appraisalFee} />
                  <LERow label="Credit Report" amount={creditReportFee} />
                  <LERow label="Flood Certification" amount={floodCertFee} />
                  <LERow label="Tax Service Fee" amount={taxServiceFee} />
                  <LERow label="Title Search" amount={titleSearch} />
                  <LERow label="Title Insurance (Lender)" amount={titleInsurance} />
                  <LERow label="Settlement / Closing Fee" amount={settlementFee} />
                  <LERow label="Recording Fee" amount={recordingFee} />
                  <LERow label="Transfer Tax" amount={transferTax} />
                  <LERow label="Total Services" amount={totalServices} bold shade />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">F. Prepaids</p>
                  <LERow label="Prepaid Interest (~15 days)" amount={prepaidInterest} />
                  <LERow label="Homeowners Insurance (12 mo)" amount={prepaidHOI} />
                  <LERow label="Initial Escrow Setup" amount={escrowSetup} />
                  <LERow label="Total Prepaids" amount={totalPrepaid} bold shade />
                </div>
              </div>
            </div>

            {/* Cash to Close */}
            <div className="p-6 bg-pilot-50">
              <div className="space-y-2">
                <LERow label="Total Closing Costs" amount={totalClosingCosts} />
                <LERow label="Down Payment" amount={ld.downPaymentAmount ?? purchasePrice - loanAmount} />
                {(ld.earnestMoneyDeposit ?? 0) > 0 && <LERow label="Earnest Money (already paid)" amount={-(ld.earnestMoneyDeposit ?? 0)} />}
                {(ld.sellerConcessions ?? 0) > 0 && <LERow label="Seller Concessions" amount={-(ld.sellerConcessions ?? 0)} />}
                <div className="flex items-center justify-between py-3 px-3 bg-white rounded-xl border-2 border-pilot-200 mt-2">
                  <div>
                    <p className="font-bold text-slate-900">Estimated Cash to Close</p>
                    <p className="text-xs text-slate-400">Amount due at closing table</p>
                  </div>
                  <span className="text-2xl font-bold text-pilot-700">{formatCurrency(cashToClose)}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4">This estimate expires {expiryDate}. Rates are subject to change. Contact your loan officer to lock your rate.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

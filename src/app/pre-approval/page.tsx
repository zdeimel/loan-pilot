'use client'

import { useRef } from 'react'
import { Navbar } from '@/components/shared/navbar'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { formatCurrency } from '@/lib/utils'
import { Printer, Download, Send, CheckCircle, Shield } from 'lucide-react'
import { logAudit } from '@/lib/audit'

export default function PreApprovalPage() {
  const { currentApplication } = useApplicationStore()
  const printRef = useRef<HTMLDivElement>(null)

  const borrower = currentApplication.borrower ?? {}
  const ld = currentApplication.loanDetails ?? {}
  const sp = currentApplication.subjectProperty ?? {}

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const expiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const maxLoan = ld.loanAmount ?? 480000
  const maxPurchase = maxLoan + (ld.downPaymentAmount ?? 96000)
  const program = ld.loanProduct?.toUpperCase() ?? 'CONVENTIONAL'

  const handlePrint = () => {
    logAudit({ userId: 'current-user', applicationId: currentApplication.id, action: 'VIEW_PRE_APPROVAL', entityType: 'pre-approval', entityId: currentApplication.id ?? 'new' })
    window.print()
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          {/* Actions */}
          <div className="flex items-center justify-between mb-6 print:hidden">
            <h1 className="text-2xl font-bold text-slate-900">Pre-Approval Letter</h1>
            <div className="flex gap-3">
              <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-border text-slate-600 hover:border-slate-300 text-sm font-medium transition-all">
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pilot-600 hover:bg-pilot-700 text-white text-sm font-medium transition-colors">
                <Send className="w-4 h-4" />
                Email to Agent
              </button>
            </div>
          </div>

          {/* Letter */}
          <div ref={printRef} className="bg-white rounded-2xl border border-border shadow-card p-8 sm:p-12 print:shadow-none print:border-0 print:rounded-none">
            {/* Letterhead */}
            <div className="flex items-start justify-between mb-8 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-pilot-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">LP</span>
                  </div>
                  <span className="text-xl font-bold text-slate-900">LoanPilot</span>
                </div>
                <p className="text-sm text-slate-400">NMLS #2234567</p>
                <p className="text-sm text-slate-400">contact@loanpilot.com</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Date: {today}</p>
                <p className="text-sm text-slate-500">Valid through: {expiry}</p>
                <div className="flex items-center gap-1 mt-2 justify-end">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-emerald-600 font-medium">Pre-Approved</span>
                </div>
              </div>
            </div>

            {/* Salutation */}
            <p className="text-slate-600 mb-6">To Whom It May Concern:</p>

            {/* Body */}
            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p>
                This letter certifies that <strong>{borrower.firstName ?? 'Borrower'} {borrower.lastName ?? ''}</strong>
                {currentApplication.hasCoBorrower && currentApplication.coBorrower ? ` and ${currentApplication.coBorrower.firstName} ${currentApplication.coBorrower.lastName}` : ''}
                {' '}has been pre-approved for a <strong>{program}</strong> mortgage loan in the amount of:
              </p>

              {/* Amount box */}
              <div className="my-6 p-6 bg-pilot-50 rounded-2xl border-2 border-pilot-200 text-center">
                <p className="text-sm text-pilot-600 mb-1 font-medium">Maximum Loan Amount</p>
                <p className="text-4xl font-bold text-pilot-700">{formatCurrency(maxLoan)}</p>
                <p className="text-sm text-pilot-500 mt-1">Maximum Purchase Price: {formatCurrency(maxPurchase)}</p>
              </div>

              <p>
                This pre-approval is based upon a thorough review of the borrower{currentApplication.hasCoBorrower ? 's\'' : '\'s'} financial information,
                including income, assets, debts, and credit profile. This pre-approval is subject to the following conditions:
              </p>

              <ul className="list-none space-y-2 ml-0">
                {[
                  'Satisfactory appraisal of the subject property at or above the purchase price',
                  'Title insurance commitment acceptable to LoanPilot',
                  'Verification of all income, asset, and employment information provided',
                  'No material change in borrower financial condition prior to closing',
                  'Property must meet all applicable program guidelines and minimum property standards',
                  `Loan program: ${program} | Interest rate type: ${ld.interestRateType?.toUpperCase() ?? 'FIXED'} | Term: ${ld.loanTerm ?? 30} years`,
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="text-sm text-slate-500 border-t border-slate-100 pt-4 mt-6">
                This letter does not represent a commitment to lend or a guarantee of loan approval. Final approval is
                subject to underwriting review, property appraisal, and title search. This pre-approval is valid for
                90 days from the date of issuance and is subject to the borrower maintaining current financial status.
              </p>
            </div>

            {/* Signature */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <div className="h-12 border-b-2 border-slate-300 mb-1" />
                  <p className="text-sm font-medium text-slate-700">Loan Officer Signature</p>
                  <p className="text-sm text-slate-500">LoanPilot Mortgage</p>
                  <p className="text-xs text-slate-400 mt-1">NMLS #2234567 | Equal Housing Lender</p>
                </div>
                <div>
                  <div className="h-12 border-b-2 border-slate-300 mb-1" />
                  <p className="text-sm font-medium text-slate-700">Date</p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <img src="/equal-housing-logo.png" alt="" className="h-8 opacity-50" onError={e => (e.currentTarget.style.display = 'none')} />
                <p className="text-xs text-slate-400">
                  LoanPilot Mortgage is an Equal Housing Lender. NMLS #2234567. Licensed in NC, SC, VA, FL, TX, GA.
                  Rates and terms are subject to change without notice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          nav, .print\\:hidden { display: none !important; }
          body { background: white; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}</style>
    </>
  )
}

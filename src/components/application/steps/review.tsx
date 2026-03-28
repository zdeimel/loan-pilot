'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle2, Edit2, Send, User, Briefcase, PiggyBank, Home, FileText } from 'lucide-react'
import { StepLayout } from '@/components/application/step-layout'
import { Button } from '@/components/ui/button'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { formatCurrency, getLoanPurposeLabel } from '@/lib/utils'

export function ReviewStep() {
  const router = useRouter()
  const { currentApplication, isSaving } = useApplicationStore()
  const b = currentApplication.borrower ?? {}
  const emp = currentApplication.employment ?? []
  const assets = currentApplication.assets ?? []
  const liabilities = currentApplication.liabilities ?? []
  const sp = currentApplication.subjectProperty ?? {}
  const ld = currentApplication.loanDetails ?? {}

  const totalIncome = emp.reduce((s, e) => s + (e.monthlyIncome ?? 0), 0)
  const totalAssets = assets.reduce((s, a) => s + (a.currentValue ?? 0), 0)
  const totalDebt = liabilities.filter((l) => !l.willPayOff).reduce((s, l) => s + (l.monthlyPayment ?? 0), 0)

  const handleSubmit = () => {
    router.push('/results')
  }

  const completedAll = [
    'loan-goal', 'personal-info', 'co-borrower', 'employment',
    'other-income', 'assets', 'liabilities', 'real-estate',
    'property', 'down-payment', 'declarations',
  ]

  return (
    <StepLayout
      stepId="review"
      completedSteps={completedAll}
      onNext={handleSubmit}
      nextLabel="Submit Application"
      isSaving={isSaving}
    >
      <div className="space-y-5">
        {/* Confirmation Banner */}
        <div className="bg-gradient-to-br from-pilot-600 to-pilot-700 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">You&apos;re almost done!</h3>
              <p className="text-pilot-200 text-sm leading-relaxed">
                Review your information below and hit Submit. We&apos;ll generate your pre-qualification results instantly and match you with the best loan options.
              </p>
            </div>
          </div>
        </div>

        {/* Loan Goal */}
        <SectionCard
          title="Loan Goal"
          icon={FileText}
          onEdit={() => router.push('/apply/loan-goal')}
        >
          <Row label="Loan purpose" value={ld.purpose ? getLoanPurposeLabel(ld.purpose) : '—'} />
          {ld.loanProduct && <Row label="Preferred product" value={ld.loanProduct.toUpperCase()} />}
        </SectionCard>

        {/* Borrower */}
        <SectionCard
          title="Personal Information"
          icon={User}
          onEdit={() => router.push('/apply/personal-info')}
        >
          <Row label="Name" value={b.firstName ? `${b.firstName} ${b.lastName}` : '—'} />
          <Row label="Email" value={b.email ?? '—'} />
          <Row label="Phone" value={b.phone ?? '—'} />
          <Row label="Current address" value={b.address ? `${b.address.street}, ${b.address.city}, ${b.address.state}` : '—'} />
          {currentApplication.hasCoBorrower && currentApplication.coBorrower && (
            <Row
              label="Co-borrower"
              value={`${currentApplication.coBorrower.firstName} ${currentApplication.coBorrower.lastName}`}
            />
          )}
        </SectionCard>

        {/* Employment */}
        <SectionCard
          title="Employment & Income"
          icon={Briefcase}
          onEdit={() => router.push('/apply/employment')}
        >
          {emp.length > 0 ? (
            emp.map((e, i) => (
              <div key={i} className="py-1">
                <Row label={e.employerName ?? 'Employer'} value={formatCurrency(e.monthlyIncome ?? 0) + '/mo'} />
              </div>
            ))
          ) : (
            <Row label="Employment" value="Not provided" />
          )}
          {totalIncome > 0 && (
            <div className="pt-2 mt-1 border-t border-border">
              <Row label="Total monthly income" value={formatCurrency(totalIncome)} highlight />
            </div>
          )}
        </SectionCard>

        {/* Assets */}
        <SectionCard
          title="Assets"
          icon={PiggyBank}
          onEdit={() => router.push('/apply/assets')}
        >
          {assets.length > 0 ? (
            assets.map((a, i) => (
              <Row key={i} label={`${a.institution ?? 'Account'} (${a.type})`} value={formatCurrency(a.currentValue ?? 0)} />
            ))
          ) : (
            <Row label="Assets" value="Not provided" />
          )}
          {totalAssets > 0 && (
            <div className="pt-2 mt-1 border-t border-border">
              <Row label="Total assets" value={formatCurrency(totalAssets)} highlight />
            </div>
          )}
        </SectionCard>

        {/* Debts */}
        {liabilities.length > 0 && (
          <SectionCard
            title="Monthly Debts"
            icon={FileText}
            onEdit={() => router.push('/apply/liabilities')}
          >
            {liabilities.map((l, i) => (
              <Row
                key={i}
                label={`${l.creditor ?? l.type} ${l.willPayOff ? '(paying off)' : ''}`}
                value={formatCurrency(l.monthlyPayment ?? 0) + '/mo'}
              />
            ))}
            <div className="pt-2 mt-1 border-t border-border">
              <Row label="Total monthly obligations" value={formatCurrency(totalDebt) + '/mo'} highlight />
            </div>
          </SectionCard>
        )}

        {/* Property */}
        <SectionCard
          title="Property"
          icon={Home}
          onEdit={() => router.push('/apply/property')}
        >
          {sp.isAddressKnown && sp.address ? (
            <Row label="Address" value={`${sp.address.street}, ${sp.address.city}, ${sp.address.state}`} />
          ) : (
            <Row label="Address" value="Still shopping" />
          )}
          {sp.propertyType && <Row label="Type" value={sp.propertyType.replace('-', ' ')} />}
          {sp.propertyUse && <Row label="Use" value={sp.propertyUse} />}
          {sp.purchasePrice && <Row label="Purchase price" value={formatCurrency(sp.purchasePrice)} />}
          {ld.loanAmount && <Row label="Loan amount" value={formatCurrency(ld.loanAmount)} highlight />}
        </SectionCard>

        {/* Consent */}
        <div className="bg-slate-50 rounded-2xl border border-border p-5">
          <p className="text-xs text-slate-500 leading-relaxed">
            By submitting this application, you certify that all information provided is accurate and complete to the best of your knowledge.
            You authorize LoanPilot to obtain a credit report and verify the information provided. This does not constitute a binding loan commitment.
            LoanPilot is an Equal Housing Lender. NMLS #0000000.
          </p>
        </div>

        {/* Submit */}
        <Button size="lg" className="w-full gap-2 h-14 text-base" onClick={handleSubmit}>
          <Send className="w-5 h-5" />
          Submit Application
        </Button>
      </div>
    </StepLayout>
  )
}

function SectionCard({
  title,
  icon: Icon,
  onEdit,
  children,
}: {
  title: string
  icon: React.ElementType
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-800">{title}</span>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-pilot-600 hover:text-pilot-700 font-medium"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>
      <div className="px-5 py-4 space-y-2">{children}</div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={highlight ? 'font-semibold text-slate-900' : 'text-slate-700 text-right'}>{value}</span>
    </div>
  )
}

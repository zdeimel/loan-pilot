'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, HelpCircle } from 'lucide-react'
import { StepLayout } from '@/components/application/step-layout'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { cn } from '@/lib/utils'

const declarationQuestions = [
  {
    id: 'hasOutstandingJudgments',
    question: 'Are there any outstanding judgments against you?',
    help: 'Court-ordered financial judgments that haven\'t been paid. This does not include parking tickets or minor fines.',
  },
  {
    id: 'isBankrupt',
    question: 'Have you declared bankruptcy within the past 7 years?',
    help: 'Any Chapter 7, 11, or 13 bankruptcy filings. Note: many people qualify for loans after bankruptcy with the right documentation.',
  },
  {
    id: 'hasForeclosed',
    question: 'Have you had a property foreclosed upon or given a deed-in-lieu in the past 7 years?',
    help: 'A foreclosure is when a lender repossesses a home due to missed payments. A deed-in-lieu is when you voluntarily transfer ownership.',
  },
  {
    id: 'isPartyToLawsuit',
    question: 'Are you currently a party to a lawsuit?',
    help: 'Active civil lawsuits as a plaintiff or defendant. Routine small claims may not be relevant — disclose if unsure.',
  },
  {
    id: 'hasObligatedOnFederalLoan',
    question: 'Have you directly or indirectly been obligated on any loan that resulted in foreclosure or judgment?',
    help: 'This includes federal student loans, FHA loans, VA loans, or any government-backed mortgage.',
  },
  {
    id: 'hasDelinquentFederalDebt',
    question: 'Are you presently delinquent or in default on any federal debt?',
    help: 'Federal student loans, SBA loans, or other government-backed debts. IRS payment plans generally don\'t count.',
  },
  {
    id: 'isDownPaymentBorrowed',
    question: 'Is any part of your down payment borrowed?',
    help: 'Lenders want to know if your down payment is truly your own funds. Gift funds are OK but must be documented.',
  },
  {
    id: 'isCoSignerOnDebt',
    question: 'Are you a co-signer or guarantor on any debt not listed in this application?',
    help: 'Even if you don\'t make payments, co-signed debts may count against your DTI ratio.',
  },
]

type DeclarationAnswers = Record<string, boolean | undefined>

export function DeclarationsStep() {
  const router = useRouter()
  const { currentApplication, updateApplication, isSaving } = useApplicationStore()
  const [answers, setAnswers] = useState<DeclarationAnswers>(
    (currentApplication.declarations as DeclarationAnswers) ?? {}
  )

  const allAnswered = declarationQuestions.every((q) => answers[q.id] !== undefined)

  const handleNext = () => {
    updateApplication({ declarations: answers })
    router.push('/apply/review')
  }

  const yesCount = Object.values(answers).filter(Boolean).length

  return (
    <StepLayout
      stepId="declarations"
      completedSteps={['loan-goal', 'personal-info', 'co-borrower', 'employment', 'other-income', 'assets', 'liabilities', 'real-estate', 'property', 'down-payment']}
      onNext={handleNext}
      isNextDisabled={!allAnswered}
      isSaving={isSaving}
      nextLabel="Continue to Review"
      helpText="These yes/no questions are required by federal law (URLA/Fannie Mae). Answer honestly — a 'yes' doesn't automatically disqualify you, and we can often work through it together."
    >
      <div className="space-y-5">
        {/* Trust Header */}
        <div className="bg-pilot-50 rounded-2xl border border-pilot-100 p-5 flex gap-4">
          <Shield className="w-8 h-8 text-pilot-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-pilot-900 mb-1">Your honest answers are protected</p>
            <p className="text-sm text-pilot-700">
              A &quot;Yes&quot; answer doesn&apos;t automatically disqualify you. Many people get mortgages after bankruptcy, foreclosure, or other financial events.
              What matters is the full picture — including what&apos;s changed since then.
            </p>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-2xl border border-border shadow-card divide-y divide-border">
          {declarationQuestions.map((q, i) => (
            <div key={q.id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">{q.question}</p>
                  {q.help && (
                    <div className="flex items-start gap-1.5 mt-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-400 leading-relaxed">{q.help}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {[
                    { value: true, label: 'Yes' },
                    { value: false, label: 'No' },
                  ].map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => setAnswers({ ...answers, [q.id]: opt.value })}
                      className={cn(
                        'w-16 py-2 rounded-xl border-2 text-sm font-semibold transition-all',
                        answers[q.id] === opt.value
                          ? opt.value
                            ? 'border-amber-400 bg-amber-50 text-amber-700'
                            : 'border-emerald-400 bg-emerald-50 text-emerald-700'
                          : 'border-border text-slate-500 hover:border-slate-300'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {answers[q.id] === true && (
                <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 animate-slide-up">
                  <p className="text-xs text-amber-700">
                    You answered &quot;Yes.&quot; We&apos;ll need some additional documentation to explain the circumstances. Your loan officer will follow up — this doesn&apos;t mean you won&apos;t qualify.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        {allAnswered && (
          <div className={cn(
            'rounded-2xl border p-4 flex items-center gap-3 animate-slide-up',
            yesCount === 0
              ? 'bg-emerald-50 border-emerald-100'
              : yesCount <= 2
              ? 'bg-amber-50 border-amber-100'
              : 'bg-orange-50 border-orange-100'
          )}>
            <span className="text-xl">
              {yesCount === 0 ? '✅' : yesCount <= 2 ? '⚠️' : '📋'}
            </span>
            <div>
              <p className={cn(
                'text-sm font-semibold',
                yesCount === 0 ? 'text-emerald-800' : 'text-amber-800'
              )}>
                {yesCount === 0
                  ? 'All clear — no concerning declarations'
                  : `${yesCount} item${yesCount > 1 ? 's' : ''} to follow up on`}
              </p>
              <p className={cn('text-xs mt-0.5', yesCount === 0 ? 'text-emerald-600' : 'text-amber-600')}>
                {yesCount === 0
                  ? 'Your declarations look strong. Let\'s move to the final review.'
                  : 'Your loan officer will review these items. Many situations are workable.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </StepLayout>
  )
}

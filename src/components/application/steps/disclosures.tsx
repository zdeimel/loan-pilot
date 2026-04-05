'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Brain, ShieldCheck, Upload, ChevronRight } from 'lucide-react'
import { StepLayout } from '@/components/application/step-layout'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { cn } from '@/lib/utils'

interface Disclosure {
  id: 'documentUpload' | 'aiReading' | 'softCreditPull'
  icon: React.ElementType
  title: string
  body: string
  optional?: boolean
}

const DISCLOSURES: Disclosure[] = [
  {
    id: 'documentUpload',
    icon: Upload,
    title: 'Document Upload (Optional)',
    body: 'You may upload financial documents such as pay stubs, W-2s, and bank statements to automatically fill in your application. Uploading is entirely optional and can be skipped — you can enter your information manually at any time.',
    optional: true,
  },
  {
    id: 'aiReading',
    icon: Brain,
    title: 'AI Document Reading',
    body: 'If you choose to upload documents, they will be processed by an AI system (Azure Document Intelligence) to extract your financial information. You will be able to review and correct all extracted data before it is submitted. No data is used to train AI models.',
  },
  {
    id: 'softCreditPull',
    icon: ShieldCheck,
    title: 'Soft Credit Inquiry',
    body: 'To help match you with the right loan programs, we will request a soft credit inquiry through iSoftPull. A soft pull does not affect your credit score and will not appear to other lenders on your credit report.',
  },
]

export function DisclosuresStep() {
  const router = useRouter()
  const { currentApplication, updateApplication, isSaving } = useApplicationStore()

  const existing = currentApplication.disclosuresAccepted
  const [accepted, setAccepted] = useState({
    documentUpload: existing?.documentUpload ?? false,
    aiReading: existing?.aiReading ?? false,
    softCreditPull: existing?.softCreditPull ?? false,
  })

  const allRequired = accepted.aiReading && accepted.softCreditPull

  const toggle = (id: Disclosure['id']) => {
    setAccepted((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleContinue = () => {
    updateApplication({
      disclosuresAccepted: {
        ...accepted,
        acceptedAt: new Date().toISOString(),
      },
    })
    router.push('/apply/credit-consent')
  }

  return (
    <StepLayout
      stepId="disclosures"
      completedSteps={['loan-goal', 'state-income', 'liquid-cash']}
      onNext={handleContinue}
      isNextDisabled={!allRequired}
      nextLabel="I Agree — Continue"
      isSaving={isSaving}
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          Please review and acknowledge the following before we continue. The two required items are marked below.
        </p>

        {DISCLOSURES.map((d) => {
          const Icon = d.icon
          const isChecked = accepted[d.id]
          const isRequired = !d.optional

          return (
            <button
              key={d.id}
              type="button"
              onClick={() => toggle(d.id)}
              className={cn(
                'w-full text-left rounded-2xl border-2 p-5 transition-all duration-150',
                isChecked
                  ? 'border-pilot-500 bg-pilot-50/60'
                  : 'border-border bg-white hover:border-slate-300'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                  isChecked ? 'bg-pilot-600 border-pilot-600' : 'border-slate-300 bg-white'
                )}>
                  {isChecked && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                {/* Icon */}
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                  isChecked ? 'bg-pilot-100' : 'bg-slate-100'
                )}>
                  <Icon className={cn('w-4 h-4', isChecked ? 'text-pilot-600' : 'text-slate-500')} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-900">{d.title}</p>
                    {d.optional
                      ? <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">Optional</span>
                      : <span className="text-[10px] font-semibold text-pilot-600 bg-pilot-50 px-1.5 py-0.5 rounded-full">Required</span>
                    }
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{d.body}</p>
                </div>
              </div>
            </button>
          )
        })}

        {/* Upload docs shortcut */}
        <div className="mt-2 rounded-2xl bg-amber-50 border border-amber-100 p-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Want to upload documents now?</p>
              <p className="text-xs text-amber-700 mt-0.5">Skip ahead to upload your pay stubs, W-2s, and bank statements to auto-fill the application.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push('/apply/document-upload')}
            className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 flex-shrink-0"
          >
            Upload <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {!allRequired && (
          <p className="text-xs text-center text-slate-400">
            Please acknowledge the AI document reading and soft credit inquiry disclosures to continue.
          </p>
        )}
      </div>
    </StepLayout>
  )
}

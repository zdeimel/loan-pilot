'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, User, Info } from 'lucide-react'
import { StepLayout } from '@/components/application/step-layout'
import { Input } from '@/components/ui/input'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { cn } from '@/lib/utils'

export function CoBorrowerStep() {
  const router = useRouter()
  const { currentApplication, updateApplication, isSaving } = useApplicationStore()
  const [hasCo, setHasCo] = useState<boolean | undefined>(currentApplication.hasCoBorrower)
  const [firstName, setFirstName] = useState(currentApplication.coBorrower?.firstName ?? '')
  const [lastName, setLastName] = useState(currentApplication.coBorrower?.lastName ?? '')
  const [email, setEmail] = useState(currentApplication.coBorrower?.email ?? '')
  const [phone, setPhone] = useState(currentApplication.coBorrower?.phone ?? '')

  const handleNext = () => {
    updateApplication({
      hasCoBorrower: hasCo ?? false,
      coBorrower: hasCo ? { firstName, lastName, email, phone } : undefined,
    })
    router.push('/apply/employment')
  }

  const isValid = hasCo === false || (hasCo === true && firstName.trim() && lastName.trim() && email.trim())

  return (
    <StepLayout
      stepId="co-borrower"
      completedSteps={['loan-goal', 'personal-info']}
      onNext={handleNext}
      isNextDisabled={!isValid}
      isSaving={isSaving}
      whyWeAsk="Adding a co-borrower with additional income can strengthen your application and qualify you for a larger loan or better rate. Co-borrowers are equally responsible for the loan."
    >
      <div className="space-y-4">
        {/* Option Cards */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-semibold text-slate-900 mb-5">Will anyone else be on the loan?</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                value: false,
                icon: User,
                title: 'Just me',
                description: 'I\'m applying individually. My income and assets alone.',
              },
              {
                value: true,
                icon: UserPlus,
                title: 'Me + a co-borrower',
                description: 'A spouse, partner, or family member will be on the loan too.',
              },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setHasCo(opt.value)}
                className={cn(
                  'text-left p-5 rounded-xl border-2 transition-all duration-150',
                  hasCo === opt.value
                    ? 'border-pilot-600 bg-pilot-50'
                    : 'border-border hover:border-slate-300'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
                    hasCo === opt.value ? 'bg-pilot-600 text-white' : 'bg-slate-100 text-slate-500'
                  )}
                >
                  <opt.icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-slate-900 mb-1">{opt.title}</p>
                <p className="text-sm text-slate-500">{opt.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tip Card */}
        {hasCo === false && (
          <div className="bg-slate-50 rounded-xl border border-border p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-500">
              No problem! You can always add a co-borrower later if it helps your qualification. We&apos;ll continue with your information only for now.
            </p>
          </div>
        )}

        {/* Co-Borrower Form */}
        {hasCo === true && (
          <div className="bg-white rounded-2xl border border-border shadow-card p-6 animate-slide-up">
            <h3 className="font-semibold text-slate-900 mb-1">Co-borrower&apos;s basic info</h3>
            <p className="text-sm text-slate-400 mb-5">
              They&apos;ll receive an invitation to complete their own section of the application.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">First name</label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="James" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Last name</label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Mitchell" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="james@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="(555) 000-0000" />
              </div>
            </div>
            <div className="mt-4 p-3 bg-pilot-50 rounded-xl border border-pilot-100">
              <p className="text-xs text-pilot-700">
                <strong>Invite link:</strong> We&apos;ll send James an email to complete their portion — employment, income, and assets. You can continue without waiting.
              </p>
            </div>
          </div>
        )}
      </div>
    </StepLayout>
  )
}

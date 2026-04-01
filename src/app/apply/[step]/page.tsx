'use client'

import { notFound } from 'next/navigation'
import { Navbar } from '@/components/shared/navbar'
import { AIAssistantWidget } from '@/components/shared/ai-assistant-widget'
import { DocumentUploadStep } from '@/components/application/steps/document-upload'
import { LoanGoalStep } from '@/components/application/steps/loan-goal'
import { PersonalInfoStep } from '@/components/application/steps/personal-info'
import { CoBorrowerStep } from '@/components/application/steps/co-borrower'
import { EmploymentStep } from '@/components/application/steps/employment'
import { OtherIncomeStep } from '@/components/application/steps/other-income'
import { AssetsStep } from '@/components/application/steps/assets'
import { LiabilitiesStep } from '@/components/application/steps/liabilities'
import { RealEstateStep } from '@/components/application/steps/real-estate'
import { PropertyStep } from '@/components/application/steps/property'
import { DownPaymentStep } from '@/components/application/steps/down-payment'
import { DeclarationsStep } from '@/components/application/steps/declarations'
import { DemographicsStep } from '@/components/application/steps/demographics'
import { CreditConsentStep } from '@/components/application/steps/credit-consent'
import { ReviewStep } from '@/components/application/steps/review'
import { GenericStep } from '@/components/application/steps/generic'
import { orderedStepIds } from '@/lib/mock-data'

const stepComponents: Record<string, React.ComponentType> = {
  'document-upload': DocumentUploadStep,
  'loan-goal': LoanGoalStep,
  'personal-info': PersonalInfoStep,
  'co-borrower': CoBorrowerStep,
  'employment': EmploymentStep,
  'other-income': OtherIncomeStep,
  'assets': AssetsStep,
  'liabilities': LiabilitiesStep,
  'real-estate': RealEstateStep,
  'property': PropertyStep,
  'down-payment': DownPaymentStep,
  'declarations': DeclarationsStep,
  'demographics': DemographicsStep,
  'credit-consent': CreditConsentStep,
  'review': ReviewStep,
}

// The document-upload step gets a wider, centered layout — no sidebar
const FULL_WIDTH_STEPS = new Set(['document-upload'])

export default function StepPage({ params }: { params: { step: string } }) {
  const { step } = params

  if (!orderedStepIds.includes(step)) {
    notFound()
  }

  const StepComponent = stepComponents[step] ?? (() => <GenericStep stepId={step} title={step} description="" />)

  if (FULL_WIDTH_STEPS.has(step)) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
            <StepComponent />
          </div>
        </div>
        <AIAssistantWidget />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <StepComponent />
      <AIAssistantWidget />
    </>
  )
}

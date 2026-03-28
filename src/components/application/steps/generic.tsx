'use client'

import { useRouter } from 'next/navigation'
import { StepLayout } from '@/components/application/step-layout'
import { orderedStepIds } from '@/lib/mock-data'

export function GenericStep({ stepId, title, description }: { stepId: string; title: string; description: string }) {
  const router = useRouter()

  const idx = orderedStepIds.indexOf(stepId)
  const completedSteps = orderedStepIds.slice(0, idx)

  const handleNext = () => {
    const next = orderedStepIds[idx + 1]
    if (next) router.push(`/apply/${next}`)
    else router.push('/results')
  }

  return (
    <StepLayout
      stepId={stepId}
      completedSteps={completedSteps}
      onNext={handleNext}
    >
      <div className="bg-white rounded-2xl border border-border shadow-card p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-pilot-50 flex items-center justify-center mx-auto mb-5">
          <span className="text-3xl">📋</span>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
          {description || 'This section is ready for your input. Click Continue to proceed.'}
        </p>
        <p className="text-xs text-slate-300 italic">
          Full implementation stub — this step collects additional URLA data.
        </p>
      </div>
    </StepLayout>
  )
}

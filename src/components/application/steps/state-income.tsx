'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { StepLayout } from '@/components/application/step-layout'
import { Input } from '@/components/ui/input'
import { useApplicationStore } from '@/lib/store/applicationStore'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

interface FormData {
  propertyState: string
  annualIncome: string
}

export function StateIncomeStep() {
  const router = useRouter()
  const { currentApplication, updateApplication, isSaving } = useApplicationStore()

  const { register, watch } = useForm<FormData>({
    defaultValues: {
      propertyState: currentApplication.loanDetails?.propertyState ?? '',
      annualIncome: currentApplication.borrower?.annualIncome
        ? String(currentApplication.borrower.annualIncome)
        : '',
    },
  })

  const saveAndContinue = () => {
    const data = watch()
    updateApplication({
      loanDetails: {
        ...currentApplication.loanDetails,
        propertyState: data.propertyState,
      },
      borrower: {
        ...currentApplication.borrower,
        annualIncome: data.annualIncome ? Number(data.annualIncome.replace(/[^0-9.]/g, '')) : undefined,
      },
    })
    router.push('/apply/liquid-cash')
  }

  return (
    <StepLayout
      stepId="state-income"
      completedSteps={['loan-goal']}
      onNext={saveAndContinue}
      isSaving={isSaving}
      whyWeAsk="The state helps us determine which loan programs you're eligible for. Your income helps us estimate how much you may qualify to borrow."
    >
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              What state will the property be in?
            </label>
            <select {...register('propertyState')} className="input-base h-10 w-full">
              <option value="">Select a state…</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              What is your gross annual income?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <Input
                {...register('annualIncome')}
                type="number"
                className="pl-7"
                placeholder="95,000"
                min={0}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Include all sources — salary, self-employment, rental income, etc.</p>
          </div>
        </div>
      </div>
    </StepLayout>
  )
}

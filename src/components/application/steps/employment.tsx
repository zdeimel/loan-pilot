'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Briefcase, Building2 } from 'lucide-react'
import { StepLayout } from '@/components/application/step-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Employment } from '@/lib/types'

const employmentTypes = [
  { value: 'employed', label: 'Employed (W-2)' },
  { value: 'self-employed', label: 'Self-employed' },
  { value: 'retired', label: 'Retired' },
  { value: 'unemployed', label: 'Not currently employed' },
]

function EmploymentForm({
  employment,
  onChange,
  onRemove,
  index,
}: {
  employment: Partial<Employment>
  onChange: (data: Partial<Employment>) => void
  onRemove?: () => void
  index: number
}) {
  const monthly = employment.monthlyIncome ?? 0
  const annual = monthly * 12

  return (
    <div className="border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pilot-50 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-pilot-600" />
          </div>
          <span className="font-semibold text-slate-800">
            {index === 0 ? 'Primary Employment' : `Additional Employment ${index}`}
          </span>
        </div>
        {onRemove && (
          <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors p-1">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Employment Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Employment type</label>
        <div className="grid grid-cols-2 gap-2">
          {employmentTypes.map((et) => (
            <label
              key={et.value}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer text-sm transition-all',
                employment.employmentType === et.value
                  ? 'border-pilot-600 bg-pilot-50 text-pilot-700 font-medium'
                  : 'border-border text-slate-600 hover:border-slate-300'
              )}
            >
              <input
                type="radio"
                className="sr-only"
                checked={employment.employmentType === et.value}
                onChange={() => onChange({ ...employment, employmentType: et.value as Employment['employmentType'] })}
              />
              {et.label}
            </label>
          ))}
        </div>
      </div>

      {employment.employmentType !== 'unemployed' && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Employer name</label>
              <Input
                value={employment.employerName ?? ''}
                onChange={(e) => onChange({ ...employment, employerName: e.target.value })}
                placeholder="Acme Corporation"
                prefix={<Building2 className="w-4 h-4" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Your job title</label>
              <Input
                value={employment.position ?? ''}
                onChange={(e) => onChange({ ...employment, position: e.target.value })}
                placeholder="Senior Analyst"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Start date</label>
              <Input
                type="date"
                value={employment.startDate ?? ''}
                onChange={(e) => onChange({ ...employment, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Monthly gross income
                <span className="text-slate-400 font-normal ml-1">(before taxes)</span>
              </label>
              <Input
                type="number"
                value={employment.monthlyIncome ?? ''}
                onChange={(e) =>
                  onChange({ ...employment, monthlyIncome: Number(e.target.value), annualIncome: Number(e.target.value) * 12 })
                }
                placeholder="8,500"
                prefix="$"
              />
              {monthly > 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  ≈ {formatCurrency(annual)} per year
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {employment.employmentType === 'self-employed' && (
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
          <p className="text-sm font-medium text-amber-800 mb-1">Self-employed income documentation</p>
          <p className="text-xs text-amber-700">
            We&apos;ll need 2 years of personal and business tax returns to calculate your qualifying income.
            Self-employed income is averaged over 24 months using Schedule C, K-1, or Form 1120-S.
          </p>
        </div>
      )}
    </div>
  )
}

export function EmploymentStep() {
  const router = useRouter()
  const { currentApplication, updateApplication, isSaving } = useApplicationStore()
  const [jobs, setJobs] = useState<Partial<Employment>[]>(
    currentApplication.employment?.length
      ? currentApplication.employment
      : [{ id: `emp-${Date.now()}`, isCurrent: true, employmentType: 'employed' }]
  )

  const updateJob = (index: number, data: Partial<Employment>) => {
    const updated = [...jobs]
    updated[index] = data
    setJobs(updated)
  }

  const removeJob = (index: number) => {
    setJobs(jobs.filter((_, i) => i !== index))
  }

  const addJob = () => {
    setJobs([...jobs, { id: `emp-${Date.now()}`, isCurrent: true, employmentType: 'employed' }])
  }

  const handleNext = () => {
    updateApplication({ employment: jobs as Employment[] })
    router.push('/apply/other-income')
  }

  const totalMonthly = jobs.reduce((sum, j) => sum + (j.monthlyIncome ?? 0), 0)
  const hasValidJob = jobs.some(
    (j) => j.employmentType === 'unemployed' || (j.employerName && j.monthlyIncome && j.monthlyIncome > 0)
  )

  return (
    <StepLayout
      stepId="employment"
      completedSteps={['loan-goal', 'personal-info', 'co-borrower']}
      onNext={handleNext}
      isNextDisabled={!hasValidJob}
      isSaving={isSaving}
      whyWeAsk="Lenders verify your income to make sure your monthly loan payments are affordable. They look at employment history, stability, and consistent earnings."
    >
      <div className="space-y-4">
        {jobs.map((job, i) => (
          <EmploymentForm
            key={job.id ?? i}
            employment={job}
            onChange={(data) => updateJob(i, data)}
            onRemove={jobs.length > 1 ? () => removeJob(i) : undefined}
            index={i}
          />
        ))}

        <button
          onClick={addJob}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-border text-slate-400 hover:border-pilot-300 hover:text-pilot-600 transition-all flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add another job or income source
        </button>

        {totalMonthly > 0 && (
          <div className="bg-white rounded-2xl border border-border shadow-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Total monthly income</span>
              <span className="text-lg font-bold text-slate-900">{formatCurrency(totalMonthly)}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-slate-400">Annual</span>
              <span className="text-sm text-slate-500">{formatCurrency(totalMonthly * 12)}</span>
            </div>
          </div>
        )}
      </div>
    </StepLayout>
  )
}

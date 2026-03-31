'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Briefcase, Building2, ChevronDown, ChevronUp } from 'lucide-react'
import { StepLayout } from '@/components/application/step-layout'
import { Input } from '@/components/ui/input'
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

const businessTypes = [
  { value: 'sole-proprietor', label: 'Sole Proprietor' },
  { value: 'llc', label: 'LLC' },
  { value: 's-corp', label: 'S-Corp' },
  { value: 'c-corp', label: 'C-Corp' },
  { value: 'partnership', label: 'Partnership' },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

function EmploymentForm({
  employment,
  onChange,
  onRemove,
  index,
  isPrior = false,
}: {
  employment: Partial<Employment>
  onChange: (data: Partial<Employment>) => void
  onRemove?: () => void
  index: number
  isPrior?: boolean
}) {
  const [showEmployerAddress, setShowEmployerAddress] = useState(!!employment.employerAddress?.street)
  const monthly = employment.monthlyIncome ?? 0

  const label = isPrior
    ? `Prior Employer ${index + 1}`
    : index === 0
    ? 'Primary Employment'
    : `Additional Employment ${index + 1}`

  return (
    <div className="border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pilot-50 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-pilot-600" />
          </div>
          <span className="font-semibold text-slate-800">{label}</span>
        </div>
        {onRemove && (
          <button onClick={onRemove} className="text-slate-400 hover:text-red-500 transition-colors p-1">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Employment type */}
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
          {/* Current job toggle */}
          {!isPrior && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={employment.isCurrent ?? true}
                onChange={e => onChange({ ...employment, isCurrent: e.target.checked })}
                className="w-4 h-4 rounded border-border text-pilot-600"
              />
              <span className="text-sm text-slate-700">This is my current job</span>
            </label>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Employer name</label>
              <Input
                value={employment.employerName ?? ''}
                onChange={e => onChange({ ...employment, employerName: e.target.value })}
                placeholder="Acme Corporation"
                prefix={<Building2 className="w-4 h-4" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Your job title</label>
              <Input
                value={employment.position ?? ''}
                onChange={e => onChange({ ...employment, position: e.target.value })}
                placeholder="Senior Analyst"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Start date</label>
              <Input
                type="date"
                value={employment.startDate ?? ''}
                onChange={e => onChange({ ...employment, startDate: e.target.value })}
              />
            </div>
            {(!isPrior ? employment.isCurrent === false : true) && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">End date</label>
                <Input
                  type="date"
                  value={employment.endDate ?? ''}
                  onChange={e => onChange({ ...employment, endDate: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Monthly gross income <span className="text-slate-400 font-normal">(before taxes)</span>
              </label>
              <Input
                type="number"
                value={employment.monthlyIncome ?? ''}
                onChange={e => onChange({ ...employment, monthlyIncome: Number(e.target.value), annualIncome: Number(e.target.value) * 12 })}
                placeholder="8,500"
                prefix="$"
              />
              {monthly > 0 && <p className="text-xs text-slate-400 mt-1">≈ {formatCurrency(monthly * 12)} per year</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Employer phone <span className="text-slate-400 font-normal">(optional)</span></label>
              <Input
                type="tel"
                value={employment.employerPhone ?? ''}
                onChange={e => onChange({ ...employment, employerPhone: e.target.value })}
                placeholder="(555) 000-0000"
              />
            </div>
          </div>

          {/* Employer address — collapsible */}
          <button
            type="button"
            onClick={() => setShowEmployerAddress(v => !v)}
            className="flex items-center gap-1.5 text-sm text-pilot-600 hover:text-pilot-700 font-medium"
          >
            {showEmployerAddress ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showEmployerAddress ? 'Hide' : 'Add'} employer address
          </button>

          {showEmployerAddress && (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Street address</label>
                <Input
                  value={employment.employerAddress?.street ?? ''}
                  onChange={e => onChange({ ...employment, employerAddress: { ...(employment.employerAddress ?? { city: '', state: '', zip: '' }), street: e.target.value } })}
                  placeholder="100 Corporate Blvd"
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
                  <Input
                    value={employment.employerAddress?.city ?? ''}
                    onChange={e => onChange({ ...employment, employerAddress: { ...(employment.employerAddress ?? { street: '', state: '', zip: '' }), city: e.target.value } })}
                    placeholder="Raleigh"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
                  <select
                    value={employment.employerAddress?.state ?? ''}
                    onChange={e => onChange({ ...employment, employerAddress: { ...(employment.employerAddress ?? { street: '', city: '', zip: '' }), state: e.target.value } })}
                    className="input-base h-10"
                  >
                    <option value="">Select...</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">ZIP</label>
                  <Input
                    value={employment.employerAddress?.zip ?? ''}
                    onChange={e => onChange({ ...employment, employerAddress: { ...(employment.employerAddress ?? { street: '', city: '', state: '' }), zip: e.target.value } })}
                    placeholder="27601"
                    maxLength={5}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Self-employed extras */}
          {employment.employmentType === 'self-employed' && (
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 space-y-3">
              <p className="text-sm font-medium text-amber-800">Self-employment details</p>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-amber-800 mb-1">Years self-employed</label>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    value={employment.selfEmployedYears ?? ''}
                    onChange={e => onChange({ ...employment, selfEmployedYears: Number(e.target.value) })}
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-amber-800 mb-1">Business type</label>
                  <select
                    value={employment.businessType ?? ''}
                    onChange={e => onChange({ ...employment, businessType: e.target.value as Employment['businessType'] })}
                    className="input-base h-10"
                  >
                    <option value="">Select...</option>
                    {businessTypes.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-amber-800 mb-1">Ownership share (%)</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={employment.ownershipShare ?? ''}
                    onChange={e => onChange({ ...employment, ownershipShare: Number(e.target.value) })}
                    placeholder="100"
                  />
                </div>
              </div>
              <p className="text-xs text-amber-700">We'll need 2 years of personal and business tax returns to calculate qualifying income (24-month average).</p>
            </div>
          )}
        </>
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
  const [priorJobs, setPriorJobs] = useState<Partial<Employment>[]>(
    currentApplication.previousEmployment?.length
      ? currentApplication.previousEmployment
      : []
  )

  const updateJob = (index: number, data: Partial<Employment>) => {
    const updated = [...jobs]; updated[index] = data; setJobs(updated)
  }
  const removeJob = (index: number) => setJobs(jobs.filter((_, i) => i !== index))
  const addJob = () => setJobs([...jobs, { id: `emp-${Date.now()}`, isCurrent: true, employmentType: 'employed' }])

  const updatePrior = (index: number, data: Partial<Employment>) => {
    const updated = [...priorJobs]; updated[index] = data; setPriorJobs(updated)
  }
  const removePrior = (index: number) => setPriorJobs(priorJobs.filter((_, i) => i !== index))
  const addPrior = () => setPriorJobs([...priorJobs, { id: `emp-prior-${Date.now()}`, isCurrent: false, employmentType: 'employed' }])

  const handleNext = () => {
    updateApplication({
      employment: jobs as Employment[],
      previousEmployment: priorJobs as Employment[],
    })
    router.push('/apply/other-income')
  }

  const totalMonthly = jobs.reduce((sum, j) => sum + (j.monthlyIncome ?? 0), 0)
  const hasValidJob = jobs.some(j => j.employmentType === 'unemployed' || (j.employerName && j.monthlyIncome && j.monthlyIncome > 0))

  return (
    <StepLayout
      stepId="employment"
      completedSteps={['loan-goal', 'personal-info', 'co-borrower']}
      onNext={handleNext}
      isNextDisabled={!hasValidJob}
      isSaving={isSaving}
      whyWeAsk="Lenders verify your income to confirm loan payments are affordable. They look at employment history, stability, and consistent earnings across at least 24 months."
    >
      <div className="space-y-4">
        {/* Current / active jobs */}
        {jobs.map((job, i) => (
          <EmploymentForm
            key={job.id ?? i}
            employment={job}
            onChange={data => updateJob(i, data)}
            onRemove={jobs.length > 1 ? () => removeJob(i) : undefined}
            index={i}
          />
        ))}

        <button
          onClick={addJob}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-border text-slate-400 hover:border-pilot-300 hover:text-pilot-600 transition-all flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add another current job
        </button>

        {/* Previous employment */}
        <div className="pt-2">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="font-semibold text-slate-900">Previous Employment</h3>
            <span className="text-xs text-slate-400">(lenders look at 2-year history)</span>
          </div>

          {priorJobs.length === 0 && (
            <p className="text-sm text-slate-400 mb-3">No prior employers added. If you've been with your current employer for 2+ years, you're all set.</p>
          )}

          {priorJobs.map((job, i) => (
            <div key={job.id ?? i} className="mb-4">
              <EmploymentForm
                employment={job}
                onChange={data => updatePrior(i, data)}
                onRemove={() => removePrior(i)}
                index={i}
                isPrior
              />
            </div>
          ))}

          <button
            onClick={addPrior}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add prior employer
          </button>
        </div>

        {/* Income summary */}
        {totalMonthly > 0 && (
          <div className="bg-white rounded-2xl border border-border shadow-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Total current monthly income</span>
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

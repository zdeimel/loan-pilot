'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Info } from 'lucide-react'
import { StepLayout } from '@/components/application/step-layout'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { cn } from '@/lib/utils'

// HMDA-required ethnicity categories
const ethnicityOptions = [
  {
    value: 'hispanic-or-latino',
    label: 'Hispanic or Latino',
    subcategories: ['Mexican', 'Mexican American', 'Chicano', 'Puerto Rican', 'Cuban', 'Other Hispanic or Latino'],
  },
  { value: 'not-hispanic-or-latino', label: 'Not Hispanic or Latino', subcategories: [] },
  { value: 'prefer-not-to-say', label: 'I do not wish to provide this information', subcategories: [] },
]

const raceOptions = [
  {
    value: 'american-indian',
    label: 'American Indian or Alaska Native',
    subcategories: [],
    hasTextInput: true,
  },
  {
    value: 'asian',
    label: 'Asian',
    subcategories: ['Asian Indian', 'Chinese', 'Filipino', 'Japanese', 'Korean', 'Vietnamese', 'Other Asian'],
  },
  {
    value: 'black',
    label: 'Black or African American',
    subcategories: [],
  },
  {
    value: 'pacific-islander',
    label: 'Native Hawaiian or Other Pacific Islander',
    subcategories: ['Native Hawaiian', 'Guamanian or Chamorro', 'Samoan', 'Other Pacific Islander'],
  },
  {
    value: 'white',
    label: 'White',
    subcategories: [],
  },
  {
    value: 'prefer-not-to-say',
    label: 'I do not wish to provide this information',
    subcategories: [],
  },
]

const sexOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'prefer-not-to-say', label: 'I do not wish to provide this information' },
]

export function DemographicsStep() {
  const router = useRouter()
  const { currentApplication, updateApplication, isSaving } = useApplicationStore()

  const existing = currentApplication.demographics ?? {}

  const [ethnicity, setEthnicity] = useState<string[]>(existing.ethnicity ?? [])
  const [ethnicitySubcategories, setEthnicitySubcategories] = useState<string[]>(existing.ethnicitySubcategories ?? [])
  const [race, setRace] = useState<string[]>(existing.race ?? [])
  const [raceSubcategories, setRaceSubcategories] = useState<string[]>(existing.raceSubcategories ?? [])
  const [sex, setSex] = useState<string>(existing.sex ?? '')

  const toggleEthnicity = (value: string) => {
    if (value === 'prefer-not-to-say') {
      setEthnicity(['prefer-not-to-say'])
      setEthnicitySubcategories([])
      return
    }
    const current = ethnicity.filter(v => v !== 'prefer-not-to-say')
    setEthnicity(current.includes(value) ? current.filter(v => v !== value) : [...current, value])
  }

  const toggleEthnicitySubcat = (sub: string) => {
    setEthnicitySubcategories(prev => prev.includes(sub) ? prev.filter(v => v !== sub) : [...prev, sub])
  }

  const toggleRace = (value: string) => {
    if (value === 'prefer-not-to-say') {
      setRace(['prefer-not-to-say'])
      setRaceSubcategories([])
      return
    }
    const current = race.filter(v => v !== 'prefer-not-to-say')
    setRace(current.includes(value) ? current.filter(v => v !== value) : [...current, value])
  }

  const toggleRaceSubcat = (sub: string) => {
    setRaceSubcategories(prev => prev.includes(sub) ? prev.filter(v => v !== sub) : [...prev, sub])
  }

  const handleNext = () => {
    updateApplication({
      demographics: {
        ethnicity,
        ethnicitySubcategories,
        race,
        raceSubcategories,
        sex,
        collectionMethod: 'internet',
      },
    })
    router.push('/apply/review')
  }

  const isValid = ethnicity.length > 0 && race.length > 0 && sex !== ''

  return (
    <StepLayout
      stepId="demographics"
      completedSteps={['loan-goal', 'personal-info', 'co-borrower', 'employment', 'other-income', 'assets', 'liabilities', 'real-estate', 'property', 'down-payment', 'declarations']}
      onNext={handleNext}
      isNextDisabled={!isValid}
      isSaving={isSaving}
      nextLabel="Continue to Review"
      whyWeAsk="Federal law (HMDA) requires lenders to collect this information to ensure fair lending practices. You may choose not to provide it — your loan decision is never based on these characteristics."
    >
      <div className="space-y-5">
        {/* Legal notice */}
        <div className="bg-slate-50 rounded-2xl border border-border p-5 flex gap-3">
          <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-1">Required by federal law (HMDA)</p>
            <p className="text-sm text-slate-500">
              The Home Mortgage Disclosure Act requires us to collect this data. This information is used to monitor fair lending compliance — it does not affect your loan decision in any way.
              If you choose not to provide it, we are required by law to note it based on visual observation or surname.
            </p>
          </div>
        </div>

        {/* Ethnicity */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Ethnicity</h3>
          <p className="text-sm text-slate-400 mb-4">Select all that apply.</p>
          <div className="space-y-2">
            {ethnicityOptions.map(opt => {
              const isSelected = ethnicity.includes(opt.value)
              return (
                <div key={opt.value}>
                  <button
                    type="button"
                    onClick={() => toggleEthnicity(opt.value)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm',
                      isSelected ? 'border-pilot-600 bg-pilot-50 text-pilot-800 font-medium' : 'border-border text-slate-700 hover:border-slate-300'
                    )}
                  >
                    {opt.label}
                  </button>
                  {isSelected && opt.subcategories.length > 0 && (
                    <div className="ml-4 mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 animate-slide-up">
                      {opt.subcategories.map(sub => (
                        <label
                          key={sub}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer text-xs transition-all',
                            ethnicitySubcategories.includes(sub) ? 'border-pilot-400 bg-pilot-50 text-pilot-700 font-medium' : 'border-border text-slate-500 hover:border-slate-300'
                          )}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={ethnicitySubcategories.includes(sub)}
                            onChange={() => toggleEthnicitySubcat(sub)}
                          />
                          {sub}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Race */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Race</h3>
          <p className="text-sm text-slate-400 mb-4">Select all that apply.</p>
          <div className="space-y-2">
            {raceOptions.map(opt => {
              const isSelected = race.includes(opt.value)
              return (
                <div key={opt.value}>
                  <button
                    type="button"
                    onClick={() => toggleRace(opt.value)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm',
                      isSelected ? 'border-pilot-600 bg-pilot-50 text-pilot-800 font-medium' : 'border-border text-slate-700 hover:border-slate-300'
                    )}
                  >
                    {opt.label}
                  </button>
                  {isSelected && opt.subcategories && opt.subcategories.length > 0 && (
                    <div className="ml-4 mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 animate-slide-up">
                      {opt.subcategories.map(sub => (
                        <label
                          key={sub}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer text-xs transition-all',
                            raceSubcategories.includes(sub) ? 'border-pilot-400 bg-pilot-50 text-pilot-700 font-medium' : 'border-border text-slate-500 hover:border-slate-300'
                          )}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={raceSubcategories.includes(sub)}
                            onChange={() => toggleRaceSubcat(sub)}
                          />
                          {sub}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Sex */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Sex</h3>
          <div className="space-y-2">
            {sexOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSex(opt.value)}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm',
                  sex === opt.value ? 'border-pilot-600 bg-pilot-50 text-pilot-800 font-medium' : 'border-border text-slate-700 hover:border-slate-300'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </StepLayout>
  )
}

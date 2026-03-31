'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, User, Info } from 'lucide-react'
import { StepLayout } from '@/components/application/step-layout'
import { Input } from '@/components/ui/input'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { cn } from '@/lib/utils'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

function formatSSN(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

export function CoBorrowerStep() {
  const router = useRouter()
  const { currentApplication, updateApplication, isSaving } = useApplicationStore()
  const co = currentApplication.coBorrower ?? {}

  const [hasCo, setHasCo] = useState<boolean | undefined>(currentApplication.hasCoBorrower)
  const [showSSN, setShowSSN] = useState(false)

  // Basic info
  const [firstName, setFirstName] = useState(co.firstName ?? '')
  const [lastName, setLastName] = useState(co.lastName ?? '')
  const [email, setEmail] = useState(co.email ?? '')
  const [phone, setPhone] = useState(co.phone ?? '')
  // Extended profile
  const [dob, setDob] = useState(co.dob ?? '')
  const [ssn, setSsn] = useState(co.ssn ?? '')
  const [maritalStatus, setMaritalStatus] = useState(co.maritalStatus ?? 'unmarried')
  const [citizenshipStatus, setCitizenshipStatus] = useState(co.citizenshipStatus ?? 'us-citizen')
  // Address
  const [street, setStreet] = useState(co.address?.street ?? '')
  const [city, setCity] = useState(co.address?.city ?? '')
  const [state, setState] = useState(co.address?.state ?? '')
  const [zip, setZip] = useState(co.address?.zip ?? '')
  const [housingStatus, setHousingStatus] = useState<'own' | 'rent' | 'rent-free' | 'other'>(
    (co.address?.housingStatus as 'own' | 'rent' | 'rent-free' | 'other') ?? 'rent'
  )

  const handleNext = () => {
    updateApplication({
      hasCoBorrower: hasCo ?? false,
      coBorrower: hasCo ? {
        firstName, lastName, email, phone,
        dob, ssn,
        maritalStatus: maritalStatus as 'married' | 'separated' | 'unmarried',
        citizenshipStatus: citizenshipStatus as 'us-citizen' | 'permanent-resident' | 'non-permanent-resident',
        address: { street, city, state, zip, housingStatus },
      } : undefined,
    })
    router.push('/apply/employment')
  }

  const isValid = hasCo === false || (
    hasCo === true &&
    firstName.trim() && lastName.trim() && email.trim() && dob.trim()
  )

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
              { value: false, icon: User, title: 'Just me', description: 'I\'m applying individually — my income and assets alone.' },
              { value: true, icon: UserPlus, title: 'Me + a co-borrower', description: 'A spouse, partner, or family member will be on the loan too.' },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setHasCo(opt.value)}
                className={cn(
                  'text-left p-5 rounded-xl border-2 transition-all duration-150',
                  hasCo === opt.value ? 'border-pilot-600 bg-pilot-50' : 'border-border hover:border-slate-300'
                )}
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', hasCo === opt.value ? 'bg-pilot-600 text-white' : 'bg-slate-100 text-slate-500')}>
                  <opt.icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-slate-900 mb-1">{opt.title}</p>
                <p className="text-sm text-slate-500">{opt.description}</p>
              </button>
            ))}
          </div>
        </div>

        {hasCo === false && (
          <div className="bg-slate-50 rounded-xl border border-border p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-500">No problem! You can always add a co-borrower later if it strengthens your application.</p>
          </div>
        )}

        {hasCo === true && (
          <div className="space-y-5 animate-slide-up">
            {/* Basic info */}
            <div className="bg-white rounded-2xl border border-border shadow-card p-6">
              <h3 className="font-semibold text-slate-900 mb-5">Co-borrower&apos;s name &amp; contact</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First name">
                  <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="James" />
                </Field>
                <Field label="Last name">
                  <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Mitchell" />
                </Field>
                <Field label="Email">
                  <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="james@email.com" />
                </Field>
                <Field label="Phone">
                  <Input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="(555) 000-0000" />
                </Field>
              </div>
            </div>

            {/* Identity */}
            <div className="bg-white rounded-2xl border border-border shadow-card p-6">
              <h3 className="font-semibold text-slate-900 mb-5">Personal details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Date of birth">
                  <Input value={dob} onChange={e => setDob(e.target.value)} type="date" />
                </Field>
                <Field label="Social Security Number" optional>
                  <div className="relative">
                    <Input
                      value={ssn}
                      type={showSSN ? 'text' : 'password'}
                      placeholder="XXX-XX-XXXX"
                      onChange={e => setSsn(formatSSN(e.target.value))}
                      autoComplete="off"
                    />
                    <button type="button" onClick={() => setShowSSN(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600">
                      {showSSN ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </Field>
                <Field label="Marital status">
                  <select value={maritalStatus} onChange={e => setMaritalStatus(e.target.value as 'married' | 'separated' | 'unmarried')} className="input-base h-10">
                    <option value="unmarried">Unmarried / Single</option>
                    <option value="married">Married</option>
                    <option value="separated">Separated</option>
                  </select>
                </Field>
                <Field label="Citizenship">
                  <select value={citizenshipStatus} onChange={e => setCitizenshipStatus(e.target.value as 'us-citizen' | 'permanent-resident' | 'non-permanent-resident')} className="input-base h-10">
                    <option value="us-citizen">U.S. Citizen</option>
                    <option value="permanent-resident">Permanent Resident</option>
                    <option value="non-permanent-resident">Non-Permanent Resident Alien</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl border border-border shadow-card p-6">
              <h3 className="font-semibold text-slate-900 mb-5">Current address</h3>
              <div className="space-y-4">
                <Field label="Street address">
                  <Input value={street} onChange={e => setStreet(e.target.value)} placeholder="123 Main Street" />
                </Field>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="City">
                    <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Raleigh" />
                  </Field>
                  <Field label="State">
                    <select value={state} onChange={e => setState(e.target.value)} className="input-base h-10">
                      <option value="">Select...</option>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="ZIP">
                    <Input value={zip} onChange={e => setZip(e.target.value)} placeholder="27601" maxLength={5} />
                  </Field>
                </div>
                <Field label="Housing situation">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'rent', label: 'Renting' },
                      { value: 'own', label: 'Own' },
                      { value: 'rent-free', label: 'Rent-free' },
                      { value: 'other', label: 'Other' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setHousingStatus(opt.value as typeof housingStatus)}
                        className={cn(
                          'px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                          housingStatus === opt.value ? 'border-pilot-600 bg-pilot-50 text-pilot-700' : 'border-border text-slate-600 hover:border-slate-300'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </div>

            {/* Info note */}
            <div className="bg-pilot-50 border border-pilot-100 rounded-xl p-4">
              <p className="text-sm text-pilot-700">
                <strong>Note:</strong> Co-borrower employment, income, and assets will be collected in the next steps alongside yours.
              </p>
            </div>
          </div>
        )}
      </div>
    </StepLayout>
  )
}

function Field({ label, children, optional }: { label: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{optional && <span className="text-slate-400 font-normal ml-1">(optional)</span>}
      </label>
      {children}
    </div>
  )
}

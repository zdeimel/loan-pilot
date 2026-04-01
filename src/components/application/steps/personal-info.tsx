'use client'

import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { StepLayout } from '@/components/application/step-layout'
import { Input } from '@/components/ui/input'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { cn } from '@/lib/utils'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  suffix: z.string().optional(),
  alternateName: z.string().optional(),
  ssn: z.string().optional().refine(v => !v || /^\d{3}-\d{2}-\d{4}$/.test(v), 'Format: XXX-XX-XXXX'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  dob: z.string().min(1, 'Date of birth is required'),
  maritalStatus: z.enum(['married', 'separated', 'unmarried']),
  citizenshipStatus: z.enum(['us-citizen', 'permanent-resident', 'non-permanent-resident']),
  dependents: z.coerce.number().min(0).max(10),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(5, 'ZIP code is required'),
  county: z.string().optional(),
  housingStatus: z.enum(['own', 'rent', 'rent-free', 'other']),
  monthlyRent: z.coerce.number().optional(),
  yearsAtAddress: z.coerce.number().min(0).max(50),
  // Prior address (shown when yearsAtAddress < 2)
  priorStreet: z.string().optional(),
  priorCity: z.string().optional(),
  priorState: z.string().optional(),
  priorZip: z.string().optional(),
  priorFromDate: z.string().optional(),
  priorToDate: z.string().optional(),
  // Mailing address
  mailingAddressSame: z.boolean(),
  mailStreet: z.string().optional(),
  mailCity: z.string().optional(),
  mailState: z.string().optional(),
  mailZip: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const maritalOptions = [
  { value: 'married', label: 'Married' },
  { value: 'unmarried', label: 'Unmarried / Single' },
  { value: 'separated', label: 'Separated' },
]

const citizenshipOptions = [
  { value: 'us-citizen', label: 'U.S. Citizen' },
  { value: 'permanent-resident', label: 'Permanent Resident' },
  { value: 'non-permanent-resident', label: 'Non-Permanent Resident Alien' },
]

const housingOptions = [
  { value: 'rent', label: 'Renting' },
  { value: 'own', label: 'Own (with mortgage)' },
  { value: 'rent-free', label: 'Rent-free / Family' },
  { value: 'other', label: 'Other' },
]

const suffixOptions = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV']

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

// Format SSN as user types: 123456789 → 123-45-6789
function formatSSN(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

export function PersonalInfoStep() {
  const router = useRouter()
  const { currentApplication, updateApplication, isSaving } = useApplicationStore()
  const b = currentApplication.borrower ?? {}
  const [showSSN, setShowSSN] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      firstName: b.firstName ?? '',
      middleName: b.middleName ?? '',
      lastName: b.lastName ?? '',
      suffix: b.suffix ?? '',
      alternateName: b.alternateName ?? '',
      ssn: b.ssn ?? '',
      email: b.email ?? '',
      phone: b.phone ?? '',
      dob: b.dob ?? '',
      maritalStatus: b.maritalStatus ?? 'unmarried',
      citizenshipStatus: b.citizenshipStatus ?? 'us-citizen',
      dependents: b.dependents ?? 0,
      street: b.address?.street ?? '',
      city: b.address?.city ?? '',
      state: b.address?.state ?? '',
      zip: b.address?.zip ?? '',
      county: b.address?.county ?? '',
      housingStatus: b.address?.housingStatus ?? 'rent',
      monthlyRent: b.address?.monthlyRent ?? undefined,
      yearsAtAddress: b.address?.yearsAtAddress ?? 3,
      priorStreet: b.priorAddresses?.[0]?.address?.street ?? '',
      priorCity: b.priorAddresses?.[0]?.address?.city ?? '',
      priorState: b.priorAddresses?.[0]?.address?.state ?? '',
      priorZip: b.priorAddresses?.[0]?.address?.zip ?? '',
      priorFromDate: b.priorAddresses?.[0]?.fromDate ?? '',
      priorToDate: b.priorAddresses?.[0]?.toDate ?? '',
      mailingAddressSame: b.mailingAddressSame ?? true,
      mailStreet: b.mailingAddress?.street ?? '',
      mailCity: b.mailingAddress?.city ?? '',
      mailState: b.mailingAddress?.state ?? '',
      mailZip: b.mailingAddress?.zip ?? '',
    },
  })

  const housingStatus = watch('housingStatus')
  const yearsAtAddress = watch('yearsAtAddress')
  const mailingAddressSame = watch('mailingAddressSame')
  const showPriorAddress = Number(yearsAtAddress) < 2

  const saveAndContinue = () => {
    const data = watch()
    const priorAddresses = showPriorAddress && data.priorStreet ? [{
      address: { street: data.priorStreet, city: data.priorCity ?? '', state: data.priorState ?? '', zip: data.priorZip ?? '' },
      fromDate: data.priorFromDate ?? '',
      toDate: data.priorToDate ?? '',
    }] : []

    updateApplication({
      borrower: {
        ...b,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        suffix: data.suffix,
        alternateName: data.alternateName,
        ssn: data.ssn,
        email: data.email,
        phone: data.phone,
        dob: data.dob,
        maritalStatus: data.maritalStatus,
        citizenshipStatus: data.citizenshipStatus,
        dependents: data.dependents,
        priorAddresses,
        mailingAddressSame: data.mailingAddressSame,
        mailingAddress: !data.mailingAddressSame ? {
          street: data.mailStreet ?? '',
          city: data.mailCity ?? '',
          state: data.mailState ?? '',
          zip: data.mailZip ?? '',
        } : undefined,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zip: data.zip,
          county: data.county,
          housingStatus: data.housingStatus,
          monthlyRent: data.housingStatus === 'rent' ? data.monthlyRent : undefined,
          yearsAtAddress: data.yearsAtAddress,
        },
      },
    })
    router.push('/apply/co-borrower')
  }

  return (
    <StepLayout
      stepId="personal-info"
      completedSteps={['loan-goal']}
      onNext={saveAndContinue}
      isSaving={isSaving}
      whyWeAsk="Lenders use your personal information to verify your identity, pull your credit report, and confirm your eligibility for a loan. This is standard for all mortgage applications."
    >
      <form onSubmit={(e) => { e.preventDefault(); saveAndContinue() }} className="space-y-6">

        {/* Name */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-semibold text-slate-900 mb-5">Your name</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="First name" error={errors.firstName?.message}>
              <Input {...register('firstName')} placeholder="Sarah" className={cn(errors.firstName && 'border-red-300')} />
            </Field>
            <Field label="Middle name" error={errors.middleName?.message} optional>
              <Input {...register('middleName')} placeholder="Anne" />
            </Field>
            <Field label="Last name" error={errors.lastName?.message}>
              <Input {...register('lastName')} placeholder="Mitchell" className={cn(errors.lastName && 'border-red-300')} />
            </Field>
            <Field label="Suffix" optional>
              <select {...register('suffix')} className="input-base h-10">
                {suffixOptions.map(s => <option key={s} value={s}>{s || '— None —'}</option>)}
              </select>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Alternate name (maiden name, previous name)" optional>
              <Input {...register('alternateName')} placeholder="Previous last name if applicable" />
            </Field>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-semibold text-slate-900 mb-5">Contact information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email address" error={errors.email?.message}>
              <Input {...register('email')} type="email" placeholder="sarah@email.com" />
            </Field>
            <Field label="Phone number" error={errors.phone?.message}>
              <Input {...register('phone')} type="tel" placeholder="(555) 000-0000" />
            </Field>
          </div>
        </div>

        {/* Personal details */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-semibold text-slate-900 mb-5">Personal details</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <Field label="Date of birth" error={errors.dob?.message}>
              <Input {...register('dob')} type="date" />
            </Field>
            <Field label="Social Security Number" error={errors.ssn?.message} optional>
              <div className="relative">
                <Input
                  {...register('ssn')}
                  type={showSSN ? 'text' : 'password'}
                  placeholder="XXX-XX-XXXX"
                  onChange={(e) => {
                    const formatted = formatSSN(e.target.value)
                    setValue('ssn', formatted)
                  }}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowSSN(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  {showSSN ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Used only for credit verification — stored encrypted</p>
            </Field>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Marital status" error={errors.maritalStatus?.message}>
              <select {...register('maritalStatus')} className="input-base h-10">
                {maritalOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Citizenship" error={errors.citizenshipStatus?.message}>
              <select {...register('citizenshipStatus')} className="input-base h-10">
                {citizenshipOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Dependents" error={errors.dependents?.message}>
              <Input {...register('dependents')} type="number" min={0} max={10} placeholder="0" />
            </Field>
          </div>
        </div>

        {/* Current address */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-semibold text-slate-900 mb-1">Current address</h3>
          <p className="text-sm text-slate-400 mb-5">Where do you currently live?</p>
          <div className="space-y-4">
            <Field label="Street address" error={errors.street?.message}>
              <Input {...register('street')} placeholder="123 Main Street" />
            </Field>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="City" error={errors.city?.message}>
                <Input {...register('city')} placeholder="Raleigh" />
              </Field>
              <Field label="State" error={errors.state?.message}>
                <select {...register('state')} className="input-base h-10">
                  <option value="">Select...</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="ZIP code" error={errors.zip?.message}>
                <Input {...register('zip')} placeholder="27601" maxLength={5} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="County" optional>
                <Input {...register('county')} placeholder="Wake County" />
              </Field>
              <Field label="Years at this address" error={errors.yearsAtAddress?.message}>
                <Input {...register('yearsAtAddress')} type="number" min={0} max={50} placeholder="3" />
              </Field>
            </div>

            <Field label="Housing situation" error={errors.housingStatus?.message}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {housingOptions.map(opt => (
                  <label
                    key={opt.value}
                    className={cn(
                      'flex items-center justify-center px-3 py-2.5 rounded-xl border-2 text-sm font-medium cursor-pointer transition-all',
                      watch('housingStatus') === opt.value
                        ? 'border-pilot-600 bg-pilot-50 text-pilot-700'
                        : 'border-border text-slate-600 hover:border-slate-300'
                    )}
                  >
                    <input type="radio" value={opt.value} {...register('housingStatus')} className="sr-only" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </Field>

            {housingStatus === 'rent' && (
              <Field label="Monthly rent amount" error={errors.monthlyRent?.message}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <Input {...register('monthlyRent')} type="number" className="pl-7" placeholder="2,400" />
                </div>
              </Field>
            )}
          </div>
        </div>

        {/* Prior address — shown when < 2 years at current address */}
        {showPriorAddress && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h3 className="font-semibold text-slate-900 mb-1">Prior address</h3>
            <p className="text-sm text-amber-700 mb-5">Since you've been at your current address less than 2 years, lenders require a prior address.</p>
            <div className="space-y-4">
              <Field label="Street address">
                <Input {...register('priorStreet')} placeholder="456 Oak Avenue" />
              </Field>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="City">
                  <Input {...register('priorCity')} placeholder="Durham" />
                </Field>
                <Field label="State">
                  <select {...register('priorState')} className="input-base h-10">
                    <option value="">Select...</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="ZIP">
                  <Input {...register('priorZip')} placeholder="27701" maxLength={5} />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="From (month/year)">
                  <Input {...register('priorFromDate')} type="month" />
                </Field>
                <Field label="To (month/year)">
                  <Input {...register('priorToDate')} type="month" />
                </Field>
              </div>
            </div>
          </div>
        )}

        {/* Mailing address toggle */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('mailingAddressSame')}
              defaultChecked
              className="w-4 h-4 rounded border-border text-pilot-600 focus:ring-pilot-600/20"
            />
            <span className="text-sm font-medium text-slate-700">My mailing address is the same as my current address</span>
          </label>

          {!mailingAddressSame && (
            <div className="mt-5 space-y-4">
              <h4 className="font-medium text-slate-800 text-sm">Mailing address</h4>
              <Field label="Street address">
                <Input {...register('mailStreet')} placeholder="PO Box 123 or street address" />
              </Field>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="City">
                  <Input {...register('mailCity')} placeholder="Raleigh" />
                </Field>
                <Field label="State">
                  <select {...register('mailState')} className="input-base h-10">
                    <option value="">Select...</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="ZIP">
                  <Input {...register('mailZip')} placeholder="27601" maxLength={5} />
                </Field>
              </div>
            </div>
          )}
        </div>
      </form>
    </StepLayout>
  )
}

function Field({
  label,
  error,
  children,
  help,
  optional,
}: {
  label: string
  error?: string
  children: React.ReactNode
  help?: string
  optional?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {optional && <span className="text-slate-400 font-normal ml-1">(optional)</span>}
      </label>
      {children}
      {help && <p className="text-xs text-slate-400 mt-1">{help}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

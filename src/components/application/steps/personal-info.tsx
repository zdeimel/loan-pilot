'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { StepLayout } from '@/components/application/step-layout'
import { Input } from '@/components/ui/input'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { cn } from '@/lib/utils'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  dob: z.string().min(1, 'Date of birth is required'),
  maritalStatus: z.enum(['married', 'separated', 'unmarried']),
  citizenshipStatus: z.enum(['us-citizen', 'permanent-resident', 'non-permanent-resident']),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(5, 'ZIP code is required'),
  housingStatus: z.enum(['own', 'rent', 'rent-free', 'other']),
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
  { value: 'rent-free', label: 'Rent-free / Living with family' },
  { value: 'other', label: 'Other' },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

export function PersonalInfoStep() {
  const router = useRouter()
  const { currentApplication, updateApplication, isSaving } = useApplicationStore()
  const b = currentApplication.borrower ?? {}

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      firstName: b.firstName ?? '',
      lastName: b.lastName ?? '',
      email: b.email ?? '',
      phone: b.phone ?? '',
      dob: b.dob ?? '',
      maritalStatus: b.maritalStatus ?? 'unmarried',
      citizenshipStatus: b.citizenshipStatus ?? 'us-citizen',
      street: b.address?.street ?? '',
      city: b.address?.city ?? '',
      state: b.address?.state ?? '',
      zip: b.address?.zip ?? '',
      housingStatus: b.address?.housingStatus ?? 'rent',
    },
  })

  const onSubmit = (data: FormData) => {
    updateApplication({
      borrower: {
        ...b,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dob: data.dob,
        maritalStatus: data.maritalStatus,
        citizenshipStatus: data.citizenshipStatus,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zip: data.zip,
          housingStatus: data.housingStatus,
        },
      },
    })
    router.push('/apply/co-borrower')
  }

  return (
    <StepLayout
      stepId="personal-info"
      completedSteps={['loan-goal']}
      onNext={handleSubmit(onSubmit)}
      isSaving={isSaving}
      whyWeAsk="Lenders use your personal information to verify your identity, pull your credit report, and confirm your eligibility for a loan. This is standard for all mortgage applications."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-semibold text-slate-900 mb-5">Your name</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="First name" error={errors.firstName?.message}>
              <Input {...register('firstName')} placeholder="Sarah" className={cn(errors.firstName && 'border-red-300')} />
            </Field>
            <Field label="Last name" error={errors.lastName?.message}>
              <Input {...register('lastName')} placeholder="Mitchell" className={cn(errors.lastName && 'border-red-300')} />
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

        {/* Personal */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-semibold text-slate-900 mb-5">Personal details</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Date of birth" error={errors.dob?.message}>
              <Input {...register('dob')} type="date" />
            </Field>
            <Field label="Marital status" error={errors.maritalStatus?.message}>
              <select
                {...register('maritalStatus')}
                className="input-base h-10"
              >
                {maritalOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Citizenship" error={errors.citizenshipStatus?.message}>
              <select {...register('citizenshipStatus')} className="input-base h-10">
                {citizenshipOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Address */}
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
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="ZIP code" error={errors.zip?.message}>
                <Input {...register('zip')} placeholder="27601" maxLength={5} />
              </Field>
            </div>
            <Field label="Housing situation" error={errors.housingStatus?.message}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {housingOptions.map((opt) => {
                  const val = watch('housingStatus')
                  return (
                    <label
                      key={opt.value}
                      className={cn(
                        'flex items-center justify-center px-3 py-2.5 rounded-xl border-2 text-sm font-medium cursor-pointer transition-all',
                        val === opt.value
                          ? 'border-pilot-600 bg-pilot-50 text-pilot-700'
                          : 'border-border text-slate-600 hover:border-slate-300'
                      )}
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        {...register('housingStatus')}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  )
                })}
              </div>
            </Field>
          </div>
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
}: {
  label: string
  error?: string
  children: React.ReactNode
  help?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
      {help && <p className="text-xs text-slate-400 mt-1">{help}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

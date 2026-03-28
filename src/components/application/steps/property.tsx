'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home, HelpCircle } from 'lucide-react'
import { StepLayout } from '@/components/application/step-layout'
import { Input } from '@/components/ui/input'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { cn, formatCurrency } from '@/lib/utils'
import type { PropertyType, PropertyUse } from '@/lib/types'

const propertyTypes: { value: PropertyType; label: string; emoji: string }[] = [
  { value: 'single-family', label: 'Single-Family Home', emoji: '🏠' },
  { value: 'condo', label: 'Condo', emoji: '🏢' },
  { value: 'townhouse', label: 'Townhouse', emoji: '🏘️' },
  { value: 'multi-unit', label: '2-4 Unit', emoji: '🏗️' },
  { value: 'manufactured', label: 'Manufactured', emoji: '🏡' },
]

const propertyUses: { value: PropertyUse; label: string; description: string }[] = [
  { value: 'primary', label: 'Primary Residence', description: 'You\'ll live here full-time' },
  { value: 'secondary', label: 'Vacation / Second Home', description: 'Part-time occupancy' },
  { value: 'investment', label: 'Investment Property', description: 'Rental or income-producing' },
]

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

export function PropertyStep() {
  const router = useRouter()
  const { currentApplication, updateApplication, isSaving } = useApplicationStore()
  const sp = currentApplication.subjectProperty ?? {}

  const [addressKnown, setAddressKnown] = useState<boolean>(sp.isAddressKnown ?? false)
  const [street, setStreet] = useState(sp.address?.street ?? '')
  const [city, setCity] = useState(sp.address?.city ?? '')
  const [state, setState] = useState(sp.address?.state ?? '')
  const [zip, setZip] = useState(sp.address?.zip ?? '')
  const [propertyType, setPropertyType] = useState<PropertyType | undefined>(sp.propertyType)
  const [propertyUse, setPropertyUse] = useState<PropertyUse | undefined>(sp.propertyUse)
  const [purchasePrice, setPurchasePrice] = useState<string>(sp.purchasePrice?.toString() ?? '')
  const [yearBuilt, setYearBuilt] = useState<string>(sp.yearBuilt?.toString() ?? '')

  const loanPurpose = currentApplication.loanDetails?.purpose
  const isPurchase = loanPurpose === 'purchase'

  const handleNext = () => {
    updateApplication({
      subjectProperty: {
        isAddressKnown: addressKnown,
        address: addressKnown ? { street, city, state, zip } : undefined,
        propertyType,
        propertyUse,
        purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
        yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
      },
      loanDetails: {
        ...currentApplication.loanDetails,
        loanAmount: purchasePrice
          ? Number(purchasePrice) - (currentApplication.loanDetails?.downPaymentAmount ?? 0)
          : currentApplication.loanDetails?.loanAmount,
      },
    })
    router.push('/apply/down-payment')
  }

  const downPayment = currentApplication.loanDetails?.downPaymentAmount ?? 0
  const estimatedLoan = purchasePrice && downPayment ? Number(purchasePrice) - downPayment : null

  return (
    <StepLayout
      stepId="property"
      completedSteps={['loan-goal', 'personal-info', 'co-borrower', 'employment', 'other-income', 'assets', 'liabilities', 'real-estate']}
      onNext={handleNext}
      isSaving={isSaving}
      isNextDisabled={!propertyType || !propertyUse}
      whyWeAsk="The property details determine which loan programs you qualify for and how the property will be appraised. Investment properties and condos have different requirements than primary residences."
    >
      <div className="space-y-5">
        {/* Address Known? */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-semibold text-slate-900 mb-1">
            {isPurchase ? 'Have you found a property?' : 'Property address'}
          </h3>
          <p className="text-sm text-slate-400 mb-5">
            {isPurchase
              ? 'If you have a specific property in mind, great! If you\'re still shopping, that\'s fine too.'
              : 'Enter the address of your current home.'}
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { value: true, label: isPurchase ? 'Yes, I have a specific address' : 'Enter address', emoji: '📍' },
              { value: false, label: isPurchase ? 'Still shopping' : 'I\'ll add it later', emoji: '🔍' },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setAddressKnown(opt.value)}
                className={cn(
                  'text-left p-4 rounded-xl border-2 transition-all',
                  addressKnown === opt.value ? 'border-pilot-600 bg-pilot-50' : 'border-border hover:border-slate-300'
                )}
              >
                <div className="text-xl mb-2">{opt.emoji}</div>
                <p className="text-sm font-medium text-slate-800">{opt.label}</p>
              </button>
            ))}
          </div>

          {addressKnown && (
            <div className="mt-5 space-y-4 animate-slide-up">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Street address</label>
                <Input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="1402 Oak Creek Dr" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
                  <select value={state} onChange={(e) => setState(e.target.value)} className="input-base h-10">
                    <option value="">State</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">ZIP</label>
                  <Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="27519" maxLength={5} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Property Type */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Property type</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {propertyTypes.map((pt) => (
              <button
                key={pt.value}
                onClick={() => setPropertyType(pt.value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center',
                  propertyType === pt.value
                    ? 'border-pilot-600 bg-pilot-50'
                    : 'border-border hover:border-slate-300'
                )}
              >
                <span className="text-2xl">{pt.emoji}</span>
                <span className={cn('text-xs font-medium', propertyType === pt.value ? 'text-pilot-700' : 'text-slate-600')}>
                  {pt.label}
                </span>
              </button>
            ))}
          </div>
          {propertyType === 'condo' && (
            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-2">
              <HelpCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Condos require HOA review and approval. We&apos;ll need the HOA questionnaire and budget. FHA and VA have additional condo approval requirements.
              </p>
            </div>
          )}
        </div>

        {/* Property Use */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">How will you use this property?</h3>
          <div className="space-y-2">
            {propertyUses.map((pu) => (
              <button
                key={pu.value}
                onClick={() => setPropertyUse(pu.value)}
                className={cn(
                  'w-full text-left flex items-start gap-4 p-4 rounded-xl border-2 transition-all',
                  propertyUse === pu.value ? 'border-pilot-600 bg-pilot-50' : 'border-border hover:border-slate-300'
                )}
              >
                <Home className={cn('w-5 h-5 mt-0.5 flex-shrink-0', propertyUse === pu.value ? 'text-pilot-600' : 'text-slate-400')} />
                <div>
                  <p className={cn('font-medium', propertyUse === pu.value ? 'text-pilot-900' : 'text-slate-800')}>
                    {pu.label}
                  </p>
                  <p className="text-sm text-slate-400">{pu.description}</p>
                </div>
              </button>
            ))}
          </div>
          {propertyUse === 'investment' && (
            <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs text-amber-700">
                Investment properties typically require a higher down payment (15–25%) and slightly higher rates. You may be able to count projected rental income toward qualification.
              </p>
            </div>
          )}
        </div>

        {/* Price + Loan Calc */}
        {isPurchase && (
          <div className="bg-white rounded-2xl border border-border shadow-card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Purchase price</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Purchase price</label>
                <Input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="575,000"
                  prefix="$"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Year built <span className="text-slate-400 font-normal">(optional)</span></label>
                <Input
                  type="number"
                  value={yearBuilt}
                  onChange={(e) => setYearBuilt(e.target.value)}
                  placeholder="2015"
                  maxLength={4}
                />
              </div>
            </div>
            {estimatedLoan && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-border">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Purchase price</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(Number(purchasePrice))}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Down payment</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(downPayment)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Loan amount</p>
                    <p className="font-semibold text-pilot-700">{formatCurrency(estimatedLoan)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </StepLayout>
  )
}

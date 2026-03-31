'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Home, MapPin } from 'lucide-react'
import { StepLayout } from '@/components/application/step-layout'
import { Input } from '@/components/ui/input'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { formatCurrency, cn } from '@/lib/utils'
import type { RealEstateOwned, PropertyType, PropertyUse } from '@/lib/types'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: 'single-family', label: 'Single Family' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'multi-unit', label: 'Multi-Unit' },
  { value: 'manufactured', label: 'Manufactured' },
  { value: 'co-op', label: 'Co-op' },
]

const propertyUses: { value: PropertyUse; label: string; description: string }[] = [
  { value: 'primary', label: 'Primary', description: 'You live here full-time' },
  { value: 'secondary', label: 'Second Home', description: 'Vacation or occasional use' },
  { value: 'investment', label: 'Investment', description: 'Rental or income property' },
]

function RealEstateCard({
  property,
  onChange,
  onRemove,
  index,
}: {
  property: Partial<RealEstateOwned>
  onChange: (data: Partial<RealEstateOwned>) => void
  onRemove: () => void
  index: number
}) {
  const equity = (property.propertyValue ?? 0) - (property.mortgageBalance ?? 0)
  const isInvestment = property.propertyUse === 'investment'

  return (
    <div className="border border-border rounded-2xl p-5 space-y-5 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Home className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-medium text-slate-800 text-sm">Property {index + 1}</span>
        </div>
        <button onClick={onRemove} className="text-slate-300 hover:text-red-400 transition-colors p-1">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Property address */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Property address</span>
        </div>
        <div className="space-y-3">
          <Input
            value={property.address?.street ?? ''}
            onChange={e => onChange({ ...property, address: { ...(property.address ?? { city: '', state: '', zip: '' }), street: e.target.value } })}
            placeholder="123 Oak Street"
          />
          <div className="grid sm:grid-cols-3 gap-3">
            <Input
              value={property.address?.city ?? ''}
              onChange={e => onChange({ ...property, address: { ...(property.address ?? { street: '', state: '', zip: '' }), city: e.target.value } })}
              placeholder="Raleigh"
            />
            <select
              value={property.address?.state ?? ''}
              onChange={e => onChange({ ...property, address: { ...(property.address ?? { street: '', city: '', zip: '' }), state: e.target.value } })}
              className="input-base h-10"
            >
              <option value="">State</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <Input
              value={property.address?.zip ?? ''}
              onChange={e => onChange({ ...property, address: { ...(property.address ?? { street: '', city: '', state: '' }), zip: e.target.value } })}
              placeholder="27601"
              maxLength={5}
            />
          </div>
        </div>
      </div>

      {/* Property type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Property type</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {propertyTypes.map(pt => (
            <label
              key={pt.value}
              className={cn(
                'flex items-center justify-center px-2 py-2 rounded-lg border-2 cursor-pointer text-xs text-center transition-all',
                property.propertyType === pt.value
                  ? 'border-blue-400 bg-blue-50 text-blue-700 font-medium'
                  : 'border-border text-slate-500 hover:border-slate-300'
              )}
            >
              <input
                type="radio"
                className="sr-only"
                checked={property.propertyType === pt.value}
                onChange={() => onChange({ ...property, propertyType: pt.value })}
              />
              {pt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Property use */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">How do you use this property?</label>
        <div className="grid sm:grid-cols-3 gap-2">
          {propertyUses.map(pu => (
            <label
              key={pu.value}
              className={cn(
                'flex flex-col px-3 py-3 rounded-xl border-2 cursor-pointer text-sm transition-all',
                property.propertyUse === pu.value
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-border text-slate-600 hover:border-slate-300'
              )}
            >
              <input
                type="radio"
                className="sr-only"
                checked={property.propertyUse === pu.value}
                onChange={() => onChange({ ...property, propertyUse: pu.value })}
              />
              <span className="font-medium">{pu.label}</span>
              <span className="text-xs mt-0.5 opacity-75">{pu.description}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Financials */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Estimated market value</label>
          <Input
            type="number"
            value={property.propertyValue ?? ''}
            onChange={e => onChange({ ...property, propertyValue: Number(e.target.value) })}
            placeholder="450,000"
            prefix="$"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Mortgage balance</label>
          <Input
            type="number"
            value={property.mortgageBalance ?? ''}
            onChange={e => onChange({ ...property, mortgageBalance: Number(e.target.value) })}
            placeholder="320,000"
            prefix="$"
          />
          {(property.propertyValue ?? 0) > 0 && (property.mortgageBalance ?? 0) > 0 && (
            <p className={`text-xs mt-1 font-medium ${equity >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              Equity: {formatCurrency(equity)}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Monthly mortgage payment</label>
          <Input
            type="number"
            value={property.monthlyMortgage ?? ''}
            onChange={e => onChange({ ...property, monthlyMortgage: Number(e.target.value) })}
            placeholder="2,100"
            prefix="$"
          />
        </div>
        {isInvestment && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Monthly rental income</label>
            <Input
              type="number"
              value={property.monthlyRentalIncome ?? ''}
              onChange={e => onChange({ ...property, monthlyRentalIncome: Number(e.target.value) })}
              placeholder="2,800"
              prefix="$"
            />
            <p className="text-xs text-slate-400 mt-1">Lenders typically count 75% of rental income for qualifying</p>
          </div>
        )}
      </div>

      {/* Sell / retain toggle */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">What will you do with this property?</label>
        <div className="flex gap-2">
          {[
            { sell: true, retain: false, label: 'Selling it' },
            { sell: false, retain: true, label: 'Keeping it' },
            { sell: false, retain: false, label: 'Undecided' },
          ].map(opt => {
            const isActive = property.willSell === opt.sell && property.willRetain === opt.retain
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => onChange({ ...property, willSell: opt.sell, willRetain: opt.retain })}
                className={cn(
                  'flex-1 text-center py-2.5 rounded-xl border-2 text-sm transition-all',
                  isActive ? 'border-pilot-600 bg-pilot-50 text-pilot-700 font-medium' : 'border-border text-slate-500 hover:border-slate-300'
                )}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
        {property.willSell && (
          <p className="text-xs text-emerald-600 mt-1.5">Sale proceeds can be applied toward your down payment and closing costs.</p>
        )}
        {property.willRetain && property.propertyUse === 'primary' && (
          <div className="mt-2 rounded-xl bg-amber-50 border border-amber-100 p-3">
            <p className="text-xs text-amber-700">
              Retaining a primary residence and purchasing a new one requires strong reserves. Your existing mortgage payment will be included in your DTI.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function RealEstateStep() {
  const router = useRouter()
  const { currentApplication, updateApplication, isSaving } = useApplicationStore()
  const [properties, setProperties] = useState<Partial<RealEstateOwned>[]>(
    currentApplication.realEstate?.length ? currentApplication.realEstate : []
  )
  const [ownsProperty, setOwnsProperty] = useState<boolean | undefined>(
    currentApplication.realEstate?.length ? true : undefined
  )

  const updateProperty = (index: number, data: Partial<RealEstateOwned>) => {
    const updated = [...properties]; updated[index] = data; setProperties(updated)
  }

  const handleNext = () => {
    updateApplication({ realEstate: ownsProperty ? (properties as RealEstateOwned[]) : [] })
    router.push('/apply/property')
  }

  // Monthly obligations from retained properties
  const totalMonthly = properties.reduce((sum, p) => sum + (p.willSell ? 0 : (p.monthlyMortgage ?? 0)), 0)
  const totalEquity = properties.reduce((sum, p) => sum + Math.max(0, (p.propertyValue ?? 0) - (p.mortgageBalance ?? 0)), 0)

  return (
    <StepLayout
      stepId="real-estate"
      completedSteps={['loan-goal', 'personal-info', 'co-borrower', 'employment', 'other-income', 'assets', 'liabilities']}
      onNext={handleNext}
      isNextDisabled={ownsProperty === undefined}
      isSaving={isSaving}
      whyWeAsk="Lenders need to know about all properties you own. Retained properties add to your monthly obligations (DTI), while properties you're selling may provide down payment funds. Rental income can help qualify you for a larger loan."
    >
      <div className="space-y-4">
        {/* Yes/No */}
        {ownsProperty === undefined && (
          <div className="bg-white rounded-2xl border border-border shadow-card p-6">
            <h3 className="font-semibold text-slate-900 mb-2">Do you currently own any real estate?</h3>
            <p className="text-sm text-slate-500 mb-5">Primary home, investment properties, vacation homes, land.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { value: true, label: 'Yes, I own property', emoji: '🏠' },
                { value: false, label: 'No, I don\'t own property', emoji: '🚫' },
              ].map(opt => (
                <button
                  key={String(opt.value)}
                  onClick={() => {
                    setOwnsProperty(opt.value)
                    if (opt.value && !properties.length) {
                      setProperties([{ id: `reo-${Date.now()}`, propertyType: 'single-family', propertyUse: 'primary' }])
                    }
                  }}
                  className="p-5 rounded-xl border-2 border-border hover:border-pilot-300 text-left transition-all"
                >
                  <div className="text-2xl mb-2">{opt.emoji}</div>
                  <p className="font-semibold text-slate-900">{opt.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No properties — confirmation */}
        {ownsProperty === false && (
          <div className="bg-white rounded-2xl border border-border shadow-card p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-pilot-50 flex items-center justify-center mx-auto mb-4">
              <Home className="w-6 h-6 text-pilot-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Got it — no existing properties</h3>
            <p className="text-sm text-slate-500 mb-4">This means no additional monthly mortgage obligations on your application.</p>
            <button
              onClick={() => {
                setOwnsProperty(true)
                setProperties([{ id: `reo-${Date.now()}`, propertyType: 'single-family', propertyUse: 'primary' }])
              }}
              className="text-sm text-slate-400 hover:text-slate-600 underline"
            >
              Wait — I do own a property
            </button>
          </div>
        )}

        {/* Properties list */}
        {ownsProperty === true && (
          <>
            {/* Summary banner */}
            {properties.length > 0 && (properties.some(p => (p.propertyValue ?? 0) > 0)) && (
              <div className="bg-white rounded-2xl border border-border shadow-card p-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Properties owned</p>
                    <p className="text-xl font-bold text-slate-900">{properties.length}</p>
                  </div>
                  {totalEquity > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Total equity</p>
                      <p className="text-xl font-bold text-emerald-700">{formatCurrency(totalEquity)}</p>
                    </div>
                  )}
                  {totalMonthly > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Monthly obligations</p>
                      <p className="text-xl font-bold text-slate-900">{formatCurrency(totalMonthly)}</p>
                      <p className="text-xs text-slate-400">Added to your DTI</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {properties.map((property, i) => (
              <RealEstateCard
                key={property.id ?? i}
                property={property}
                onChange={data => updateProperty(i, data)}
                onRemove={() => setProperties(properties.filter((_, idx) => idx !== i))}
                index={i}
              />
            ))}

            <button
              onClick={() => setProperties([...properties, { id: `reo-${Date.now()}`, propertyType: 'single-family', propertyUse: 'primary' }])}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-border text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add another property
            </button>
          </>
        )}
      </div>
    </StepLayout>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, PiggyBank, TrendingUp, Wallet } from 'lucide-react'
import { StepLayout } from '@/components/application/step-layout'
import { Input } from '@/components/ui/input'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { formatCurrency, cn } from '@/lib/utils'
import type { Asset } from '@/lib/types'

const assetTypes: { value: Asset['type']; label: string; icon: React.ElementType; category: string }[] = [
  { value: 'checking', label: 'Checking Account', icon: Wallet, category: 'Bank' },
  { value: 'savings', label: 'Savings Account', icon: PiggyBank, category: 'Bank' },
  { value: 'money-market', label: 'Money Market', icon: PiggyBank, category: 'Bank' },
  { value: 'retirement-401k', label: '401(k)', icon: TrendingUp, category: 'Retirement' },
  { value: 'retirement-ira', label: 'IRA / Roth IRA', icon: TrendingUp, category: 'Retirement' },
  { value: 'stocks', label: 'Stocks / Brokerage', icon: TrendingUp, category: 'Investment' },
  { value: 'gift', label: 'Gift Funds', icon: Wallet, category: 'Other' },
  { value: 'other', label: 'Other Asset', icon: Wallet, category: 'Other' },
]

function AssetCard({
  asset,
  onChange,
  onRemove,
}: {
  asset: Partial<Asset>
  onChange: (data: Partial<Asset>) => void
  onRemove: () => void
}) {
  const assetDef = assetTypes.find((t) => t.value === asset.type) ?? assetTypes[0]
  const Icon = assetDef.icon

  return (
    <div className="border border-border rounded-2xl p-5 space-y-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Icon className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="font-medium text-slate-800 text-sm">
            {assetDef.label}
          </span>
        </div>
        <button onClick={onRemove} className="text-slate-300 hover:text-red-400 transition-colors p-1">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Account type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {assetTypes.map((at) => (
            <label
              key={at.value}
              className={cn(
                'flex items-center justify-center px-2 py-2 rounded-lg border-2 cursor-pointer text-xs transition-all text-center',
                asset.type === at.value
                  ? 'border-pilot-600 bg-pilot-50 text-pilot-700 font-medium'
                  : 'border-border text-slate-500 hover:border-slate-300'
              )}
            >
              <input
                type="radio"
                className="sr-only"
                checked={asset.type === at.value}
                onChange={() => onChange({ ...asset, type: at.value })}
              />
              {at.label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Institution name</label>
          <Input
            value={asset.institution ?? ''}
            onChange={(e) => onChange({ ...asset, institution: e.target.value })}
            placeholder="Bank of America"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Current balance
          </label>
          <Input
            type="number"
            value={asset.currentValue ?? ''}
            onChange={(e) => onChange({ ...asset, currentValue: Number(e.target.value) })}
            placeholder="50,000"
            prefix="$"
          />
        </div>
      </div>

      {asset.type === 'gift' && (
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
          <p className="text-xs font-semibold text-amber-700 mb-1">Gift funds require documentation</p>
          <p className="text-xs text-amber-600">
            You&apos;ll need a gift letter from the donor stating the funds are a gift, not a loan. We&apos;ll help you with this in the documents section.
          </p>
        </div>
      )}
    </div>
  )
}

export function AssetsStep() {
  const router = useRouter()
  const { currentApplication, updateApplication, isSaving } = useApplicationStore()
  const [assets, setAssets] = useState<Partial<Asset>[]>(
    currentApplication.assets?.length
      ? currentApplication.assets
      : [{ id: `ast-${Date.now()}`, type: 'checking', institution: '', currentValue: 0 }]
  )

  const updateAsset = (index: number, data: Partial<Asset>) => {
    const updated = [...assets]
    updated[index] = data
    setAssets(updated)
  }

  const removeAsset = (index: number) => {
    setAssets(assets.filter((_, i) => i !== index))
  }

  const addAsset = () => {
    setAssets([...assets, { id: `ast-${Date.now()}`, type: 'checking' }])
  }

  const handleNext = () => {
    updateApplication({ assets: assets as Asset[] })
    router.push('/apply/liabilities')
  }

  const totalAssets = assets.reduce((sum, a) => sum + (a.currentValue ?? 0), 0)
  const loanAmount = currentApplication.loanDetails?.loanAmount ?? 0
  const downPayment = currentApplication.loanDetails?.downPaymentAmount ?? 0
  const needed = downPayment + (loanAmount * 0.03) // rough closing costs estimate

  return (
    <StepLayout
      stepId="assets"
      completedSteps={['loan-goal', 'personal-info', 'co-borrower', 'employment', 'other-income']}
      onNext={handleNext}
      isSaving={isSaving}
      whyWeAsk="Lenders want to confirm you have enough for your down payment and closing costs, plus reserves after closing. They don't count retirement accounts dollar-for-dollar — typically at 60%."
    >
      <div className="space-y-4">
        {/* Summary Banner */}
        {totalAssets > 0 && (
          <div className="bg-white rounded-2xl border border-border shadow-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total documented assets</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalAssets)}</p>
              </div>
              {needed > 0 && (
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-1">Est. funds needed</p>
                  <p className="text-lg font-semibold text-slate-700">{formatCurrency(needed)}</p>
                  <p className={`text-xs mt-0.5 font-medium ${totalAssets >= needed ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {totalAssets >= needed ? '✓ Sufficient' : 'May need more'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {assets.map((asset, i) => (
          <AssetCard
            key={asset.id ?? i}
            asset={asset}
            onChange={(data) => updateAsset(i, data)}
            onRemove={() => removeAsset(i)}
          />
        ))}

        <button
          onClick={addAsset}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-border text-slate-400 hover:border-emerald-300 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add another account or asset
        </button>
      </div>
    </StepLayout>
  )
}

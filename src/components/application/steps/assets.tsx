'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, PiggyBank, TrendingUp, Wallet } from 'lucide-react'
import { StepLayout } from '@/components/application/step-layout'
import { Input } from '@/components/ui/input'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { formatCurrency, cn } from '@/lib/utils'
import type { Asset } from '@/lib/types'

const RETIREMENT_TYPES: Asset['type'][] = ['retirement-401k', 'retirement-ira']

const assetTypes: { value: Asset['type']; label: string; icon: React.ElementType; category: string }[] = [
  { value: 'checking', label: 'Checking', icon: Wallet, category: 'Bank' },
  { value: 'savings', label: 'Savings', icon: PiggyBank, category: 'Bank' },
  { value: 'money-market', label: 'Money Market', icon: PiggyBank, category: 'Bank' },
  { value: 'cd', label: 'CD', icon: PiggyBank, category: 'Bank' },
  { value: 'retirement-401k', label: '401(k)', icon: TrendingUp, category: 'Retirement' },
  { value: 'retirement-ira', label: 'IRA / Roth IRA', icon: TrendingUp, category: 'Retirement' },
  { value: 'stocks', label: 'Stocks / Brokerage', icon: TrendingUp, category: 'Investment' },
  { value: 'bonds', label: 'Bonds', icon: TrendingUp, category: 'Investment' },
  { value: 'mutual-funds', label: 'Mutual Funds', icon: TrendingUp, category: 'Investment' },
  { value: 'business', label: 'Business Assets', icon: Wallet, category: 'Other' },
  { value: 'proceeds', label: 'Asset Sale Proceeds', icon: Wallet, category: 'Other' },
  { value: 'gift', label: 'Gift Funds', icon: Wallet, category: 'Other' },
  { value: 'other', label: 'Other', icon: Wallet, category: 'Other' },
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
  const assetDef = assetTypes.find(t => t.value === asset.type) ?? assetTypes[0]
  const Icon = assetDef.icon
  const isRetirement = RETIREMENT_TYPES.includes(asset.type as Asset['type'])

  return (
    <div className="border border-border rounded-2xl p-5 space-y-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Icon className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="font-medium text-slate-800 text-sm">{assetDef.label}</span>
        </div>
        <button onClick={onRemove} className="text-slate-300 hover:text-red-400 transition-colors p-1">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Type selector */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Account / asset type</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {assetTypes.map(at => (
            <label
              key={at.value}
              className={cn(
                'flex items-center justify-center px-2 py-2 rounded-lg border-2 cursor-pointer text-xs transition-all text-center',
                asset.type === at.value
                  ? 'border-pilot-600 bg-pilot-50 text-pilot-700 font-medium'
                  : 'border-border text-slate-500 hover:border-slate-300'
              )}
            >
              <input type="radio" className="sr-only" checked={asset.type === at.value} onChange={() => onChange({ ...asset, type: at.value })} />
              {at.label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Institution name</label>
          <Input
            value={asset.institution ?? ''}
            onChange={e => onChange({ ...asset, institution: e.target.value })}
            placeholder="Bank of America"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Account # (last 4) <span className="text-slate-400 font-normal">(optional)</span></label>
          <Input
            value={asset.accountLastFour ?? ''}
            onChange={e => onChange({ ...asset, accountLastFour: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            placeholder="4521"
            maxLength={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Current balance</label>
          <Input
            type="number"
            value={asset.currentValue ?? ''}
            onChange={e => onChange({ ...asset, currentValue: Number(e.target.value) })}
            placeholder="50,000"
            prefix="$"
          />
        </div>
      </div>

      {/* Retirement account note */}
      {isRetirement && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
          <p className="text-xs font-semibold text-blue-700 mb-0.5">Retirement account note</p>
          <p className="text-xs text-blue-600">
            Lenders typically count retirement accounts at <strong>60% of their value</strong> for qualification purposes due to early withdrawal penalties and taxes.
            {(asset.currentValue ?? 0) > 0 && (
              <> Your qualifying amount: <strong>{formatCurrency((asset.currentValue ?? 0) * 0.6)}</strong></>
            )}
          </p>
        </div>
      )}

      {/* Gift funds */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={asset.isGift ?? false}
            onChange={e => onChange({ ...asset, isGift: e.target.checked, giftSource: e.target.checked ? asset.giftSource : undefined })}
            className="w-4 h-4 rounded border-border text-pilot-600"
          />
          <span className="text-sm text-slate-700">These are gift funds from a donor</span>
        </label>
        {asset.isGift && (
          <div className="mt-3 space-y-2">
            <Input
              value={asset.giftSource ?? ''}
              onChange={e => onChange({ ...asset, giftSource: e.target.value })}
              placeholder="Gift donor relationship (e.g. parent, grandparent)"
            />
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
              <p className="text-xs text-amber-700">
                A <strong>gift letter</strong> will be required from the donor stating the funds are a gift, not a loan. Gift funds cannot be used as post-closing reserves.
              </p>
            </div>
          </div>
        )}
      </div>

      {asset.type === 'gift' && !asset.isGift && (
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
          <p className="text-xs text-amber-700">Be sure to check "gift funds" above so we know a gift letter will be needed.</p>
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
    const updated = [...assets]; updated[index] = data; setAssets(updated)
  }
  const removeAsset = (index: number) => setAssets(assets.filter((_, i) => i !== index))
  const addAsset = () => setAssets([...assets, { id: `ast-${Date.now()}`, type: 'checking' }])

  const handleNext = () => {
    updateApplication({ assets: assets as Asset[] })
    router.push('/apply/liabilities')
  }

  const totalAssets = assets.reduce((s, a) => s + (a.currentValue ?? 0), 0)
  // Qualifying = liquid at 100% + retirement at 60%
  const qualifying = assets.reduce((s, a) => {
    const v = a.currentValue ?? 0
    return s + (RETIREMENT_TYPES.includes(a.type as Asset['type']) ? v * 0.6 : v)
  }, 0)
  const loanAmount = currentApplication.loanDetails?.loanAmount ?? 0
  const downPayment = currentApplication.loanDetails?.downPaymentAmount ?? 0
  const needed = downPayment + (loanAmount * 0.03)

  return (
    <StepLayout
      stepId="assets"
      completedSteps={['loan-goal', 'personal-info', 'co-borrower', 'employment', 'other-income']}
      onNext={handleNext}
      isSaving={isSaving}
      whyWeAsk="Lenders verify you have enough for your down payment, closing costs, and reserves after closing. Retirement accounts count at 60% of value due to withdrawal penalties."
    >
      <div className="space-y-4">
        {/* Summary banner */}
        {totalAssets > 0 && (
          <div className="bg-white rounded-2xl border border-border shadow-card p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Total documented</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(totalAssets)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Qualifying amount</p>
                <p className="text-xl font-bold text-pilot-700">{formatCurrency(qualifying)}</p>
                <p className="text-xs text-slate-400">Retirement haircut applied</p>
              </div>
              {needed > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Est. cash needed</p>
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(needed)}</p>
                  <p className={`text-xs mt-0.5 font-medium ${qualifying >= needed ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {qualifying >= needed ? '✓ Sufficient' : 'May need more'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {assets.map((asset, i) => (
          <AssetCard key={asset.id ?? i} asset={asset} onChange={data => updateAsset(i, data)} onRemove={() => removeAsset(i)} />
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

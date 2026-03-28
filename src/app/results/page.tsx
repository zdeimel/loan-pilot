'use client'

import Link from 'next/link'
import { CheckCircle2, AlertCircle, ArrowRight, TrendingUp, DollarSign, BarChart3, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { Navbar } from '@/components/shared/navbar'
import { AIAssistantWidget } from '@/components/shared/ai-assistant-widget'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { mockQualificationResult } from '@/lib/mock-data'
import { formatCurrency, formatPercent, getPreQualLabel } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { LoanProductMatch } from '@/lib/types'

const result = mockQualificationResult

function ScoreRing({ score }: { score: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-90">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />
        <circle
          cx="72" cy="72" r={radius} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900">{score}</span>
        <span className="text-xs text-slate-400 font-medium">/ 100</span>
      </div>
    </div>
  )
}

function ProductCard({ product, isRecommended }: { product: LoanProductMatch; isRecommended?: boolean }) {
  const [expanded, setExpanded] = useState(false)

  const eligibilityColors: Record<string, string> = {
    eligible: 'success',
    'likely-eligible': 'info',
    'needs-review': 'warning',
    ineligible: 'destructive',
  }

  return (
    <div
      className={cn(
        'rounded-2xl border-2 bg-white transition-all',
        isRecommended ? 'border-pilot-600 shadow-elevated' : 'border-border shadow-card'
      )}
    >
      {isRecommended && (
        <div className="bg-pilot-600 text-white text-xs font-bold px-4 py-1.5 rounded-t-[14px] flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5" />
          Recommended for you
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">{product.name}</h3>
            <Badge variant={eligibilityColors[product.eligibility] as 'success' | 'info' | 'warning' | 'destructive' | 'default'} className="mt-1">
              {product.eligibility.replace('-', ' ')}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(product.monthlyPayment)}<span className="text-sm font-normal text-slate-400">/mo</span></p>
            <p className="text-xs text-slate-400 mt-0.5">{formatPercent(product.rate)} APR</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-0.5">Min. Down Payment</p>
            <p className="font-semibold text-slate-800 text-sm">{formatCurrency(product.downPaymentRequired)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-0.5">Est. Rate</p>
            <p className="font-semibold text-slate-800 text-sm">{formatPercent(product.rate)}</p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <span>See pros &amp; cons</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="mt-4 space-y-4 animate-slide-up">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Pros</p>
              <ul className="space-y-1.5">
                {product.pros.map((pro) => (
                  <li key={pro} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Cons</p>
              <ul className="space-y-1.5">
                {product.cons.map((con) => (
                  <li key={con} className="flex items-start gap-2 text-sm text-slate-500">
                    <AlertCircle className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const qualLabel = getPreQualLabel(result.preQualStatus)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">

        {/* Hero Result */}
        <div className="bg-white rounded-3xl border border-border shadow-elevated p-5 sm:p-8 lg:p-10 mb-8 animate-slide-up">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Score */}
            <div className="flex-shrink-0 flex flex-col items-center text-center">
              <ScoreRing score={result.overallScore} />
              <p className="text-sm font-semibold text-slate-700 mt-3">Qualification Score</p>
              <p className={`text-sm font-semibold mt-1 ${qualLabel.color}`}>{qualLabel.label}</p>
            </div>

            {/* Summary */}
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                  {result.preQualStatus === 'strong' ? 'Great news — you\'re well-positioned!' : 'Here\'s where you stand'}
                </h1>
                <p className="text-slate-500">
                  Based on the information provided, here&apos;s your preliminary pre-qualification picture. This is not a final approval — a full underwriting review is required.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-pilot-600" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Max Loan</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(result.estimatedMaxLoan)}</p>
                  <p className="text-xs text-slate-400 mt-1">Purchase price potential</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Monthly Payment</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(result.estimatedMonthlyPayment)}</p>
                  <p className="text-xs text-slate-400 mt-1">30-yr fixed, estimated</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-violet-600" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">DTI Ratio</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{formatPercent(result.dtiRatio)}</p>
                  <p className={`text-xs mt-1 font-medium ${result.dtiRatio < 36 ? 'text-emerald-600' : result.dtiRatio < 43 ? 'text-amber-500' : 'text-red-500'}`}>
                    {result.dtiRatio < 36 ? 'Excellent' : result.dtiRatio < 43 ? 'Good' : 'Needs attention'}
                  </p>
                </div>
              </div>

              {/* Affordability Range */}
              <div className="mt-5 bg-pilot-50 border border-pilot-100 rounded-2xl p-4">
                <p className="text-sm font-semibold text-pilot-900 mb-3">Estimated Affordability Range</p>
                <div className="relative">
                  <div className="w-full bg-pilot-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-pilot-400 to-pilot-600 h-3 rounded-full"
                      style={{ width: '70%' }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm font-semibold text-pilot-700">
                    <span>{formatCurrency(result.estimatedAffordabilityRange.min, true)}</span>
                    <span>{formatCurrency(result.estimatedAffordabilityRange.max, true)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-pilot-400">
                    <span>Conservative</span>
                    <span>Strong stretch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            {/* Matched Products */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Matched Loan Products</h2>
              <div className="space-y-4">
                {result.matchedProducts.map((product, i) => (
                  <ProductCard key={product.name} product={product} isRecommended={i === 0} />
                ))}
              </div>
            </div>

            {/* Strength Factors */}
            <div className="bg-white rounded-2xl border border-border shadow-card p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Your Strengths</h3>
              <div className="space-y-3">
                {result.strengthFactors.map((factor) => (
                  <div key={factor} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700">{factor}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors */}
            {result.riskFactors.length > 0 && (
              <div className="bg-white rounded-2xl border border-border shadow-card p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Areas to Address</h3>
                <div className="space-y-3">
                  {result.riskFactors.map((factor) => (
                    <div key={factor} className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700">{factor}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-5 order-1 lg:order-2">
            {/* Next Steps */}
            <div className="bg-white rounded-2xl border border-border shadow-card p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Next Steps</h3>
              <div className="space-y-3">
                {result.nextActions.map((action, i) => (
                  <div key={action} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-pilot-50 text-pilot-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Items */}
            {result.missingItems.length > 0 && (
              <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
                <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Still Needed
                </h3>
                <div className="space-y-2">
                  {result.missingItems.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-2" />
                      <p className="text-sm text-amber-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-gradient-to-br from-pilot-600 to-pilot-700 rounded-2xl p-5 text-white text-center">
              <p className="font-semibold text-lg mb-2">Ready to move forward?</p>
              <p className="text-pilot-200 text-sm mb-4">
                Lock in your pre-approval and start shopping with confidence.
              </p>
              <Button className="w-full bg-white text-pilot-700 hover:bg-pilot-50 gap-2">
                Upload Documents
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Talk to LO */}
            <div className="bg-white rounded-2xl border border-border shadow-card p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-pilot-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                DC
              </div>
              <p className="font-semibold text-slate-900">Talk to David Chen</p>
              <p className="text-sm text-slate-400 mb-3">Your assigned loan officer</p>
              <Button variant="outline" size="sm" className="w-full">Schedule a call</Button>
            </div>
          </div>
        </div>
      </div>

      <AIAssistantWidget />
    </div>
  )
}

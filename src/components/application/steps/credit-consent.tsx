'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck, AlertCircle, CheckCircle2, Loader2,
  Info, Lock, ChevronRight, SkipForward,
} from 'lucide-react'
import { StepLayout } from '@/components/application/step-layout'
import { Button } from '@/components/ui/button'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { cn } from '@/lib/utils'
import type { ISoftPullBureauResult } from '@/lib/types'

// ─── Validation helper ────────────────────────────────────────────────────────

function getMissingFields(app: ReturnType<typeof useApplicationStore.getState>['currentApplication']): string[] {
  const b = app.borrower
  const addr = b?.address
  const missing: string[] = []
  if (!b?.firstName?.trim())   missing.push('First name')
  if (!b?.lastName?.trim())    missing.push('Last name')
  if (!addr?.street?.trim())   missing.push('Street address')
  if (!addr?.city?.trim())     missing.push('City')
  if (!addr?.state?.trim())    missing.push('State')
  if (!addr?.zip?.trim())      missing.push('ZIP code')
  return missing
}

// ─── Bureau result card ───────────────────────────────────────────────────────

function BureauCard({ bureau }: { bureau: ISoftPullBureauResult }) {
  const label = bureau.bureau.charAt(0).toUpperCase() + bureau.bureau.slice(1)

  const { icon, color, bg, text } = (() => {
    switch (bureau.status) {
      case 'success':
        return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', text: 'Report received' }
      case 'no-hit':
        return { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', text: 'No record found' }
      case 'freeze':
        return { icon: Lock, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', text: 'Credit frozen' }
      default:
        return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 border-red-200', text: bureau.message ?? 'Error' }
    }
  })()

  const Icon = icon

  return (
    <div className={cn('flex items-center justify-between px-4 py-3 rounded-xl border', bg)}>
      <div className="flex items-center gap-3">
        <Icon className={cn('w-4 h-4 flex-shrink-0', color)} />
        <span className="text-sm font-medium text-slate-800">{label}</span>
      </div>
      <span className={cn('text-xs font-medium', color)}>{text}</span>
    </div>
  )
}

// ─── Main step component ──────────────────────────────────────────────────────

export function CreditConsentStep() {
  const router = useRouter()
  const {
    currentApplication,
    acceptCreditConsent,
    setCreditPullStatus,
    setCreditPullResult,
    setCreditPullError,
  } = useApplicationStore()

  const missingFields = getMissingFields(currentApplication)
  const canPull = missingFields.length === 0

  // Local consent checkbox — separate from the persisted store consent
  // so the borrower must actively check it each session.
  const [localConsent, setLocalConsent] = useState(false)

  const status = currentApplication.creditPullStatus ?? 'idle'
  const result = currentApplication.creditPullResult ?? null
  const pullError = currentApplication.creditPullError ?? null

  const isPulling   = status === 'pulling'
  const isSuccess   = status === 'success'
  const isError     = status === 'error'
  // Prevent duplicate clicks while a request is active
  const isLocked    = isPulling

  const handleAuthorize = useCallback(async () => {
    if (isLocked || !localConsent || !canPull) return

    // 1. Persist consent timestamp
    acceptCreditConsent()

    // 2. Mark as pulling
    setCreditPullStatus('pulling')

    const b = currentApplication.borrower!
    const addr = b.address!

    try {
      const res = await fetch('/api/credit-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentAccepted: true,
          borrower: {
            firstName: b.firstName,
            lastName:  b.lastName,
            street:    addr.street,
            city:      addr.city,
            state:     addr.state,
            zip:       addr.zip,
            ssn:       b.ssn,
            dob:       b.dob,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setCreditPullError(data.error ?? 'An unexpected error occurred.')
        return
      }

      setCreditPullResult(data.result)
    } catch {
      setCreditPullError('Unable to reach the credit service. Please check your connection.')
    }
  }, [
    isLocked, localConsent, canPull,
    acceptCreditConsent, setCreditPullStatus, setCreditPullResult, setCreditPullError,
    currentApplication.borrower,
  ])

  const handleContinue = () => router.push('/apply/review')

  return (
    <StepLayout
      stepId="credit-consent"
      completedSteps={[
        'loan-goal', 'personal-info', 'co-borrower', 'employment',
        'other-income', 'assets', 'liabilities', 'real-estate',
        'property', 'down-payment', 'declarations', 'demographics',
      ]}
      // Hide the built-in Next button — we manage navigation ourselves
      onNext={handleContinue}
      isNextDisabled={isPulling}
      isSaving={false}
      nextLabel={isSuccess ? 'Continue to Review' : undefined}
      whyWeAsk="A soft credit pull lets us match you with the right loan programs and give you accurate rate estimates — without affecting your credit score."
    >
      <div className="space-y-5">

        {/* Explainer card */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-pilot-50 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-pilot-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Soft credit pull — no impact to your score</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                We use a <strong>soft inquiry</strong> to check your credit. This is different from a hard pull —
                it does <strong>not</strong> appear on your credit report to lenders and has <strong>zero effect</strong> on your credit score.
                We use this to verify your identity, match you to eligible programs, and provide accurate rate estimates.
              </p>
            </div>
          </div>
        </div>

        {/* What we access */}
        <div className="bg-slate-50 rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-slate-400" />
            <p className="text-sm font-medium text-slate-700">What we access</p>
          </div>
          <ul className="space-y-1.5 text-sm text-slate-500">
            {[
              'Credit score (tri-merge across Experian, TransUnion, Equifax)',
              'Open accounts, balances, and payment history',
              'Public records and derogatory marks if present',
              'Identity verification signals',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Missing fields warning */}
        {!canPull && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 mb-1">
                  Some required information is missing
                </p>
                <p className="text-sm text-amber-700">
                  Please complete the following fields before authorizing a credit pull:
                </p>
                <ul className="mt-1.5 space-y-0.5">
                  {missingFields.map((f) => (
                    <li key={f} className="text-xs text-amber-700">• {f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── Idle / Ready state ── */}
        {(status === 'idle' || status === 'ready') && (
          <div className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-5">
            {/* Consent checkbox */}
            <label className={cn(
              'flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all',
              localConsent ? 'border-pilot-600 bg-pilot-50' : 'border-border hover:border-slate-300'
            )}>
              <input
                type="checkbox"
                checked={localConsent}
                onChange={(e) => setLocalConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-pilot-600 focus:ring-pilot-600 cursor-pointer"
              />
              <span className="text-sm text-slate-700 leading-relaxed">
                I authorize LoanPilot to perform a <strong>soft credit inquiry</strong> on my credit file.
                I understand this will not affect my credit score and that my information will be used
                only to evaluate my mortgage options.
              </span>
            </label>

            {/* Authorize button */}
            <Button
              className="w-full gap-2 h-12 text-base"
              onClick={handleAuthorize}
              disabled={!localConsent || !canPull}
            >
              <ShieldCheck className="w-5 h-5" />
              Authorize &amp; Pull Credit
            </Button>
          </div>
        )}

        {/* ── Pulling state ── */}
        {isPulling && (
          <div className="bg-white rounded-2xl border border-border shadow-card p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-pilot-600 animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-slate-900">Pulling your credit report…</p>
              <p className="text-sm text-slate-500 mt-1">This usually takes a few seconds.</p>
            </div>
          </div>
        )}

        {/* ── Success state ── */}
        {isSuccess && result && (
          <div className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Credit report received</p>
                {result.creditScore && (
                  <p className="text-sm text-slate-500">
                    Score: <strong className="text-slate-800">{result.creditScore}</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Bureau results</p>
              {result.bureaus.length > 0
                ? result.bureaus.map((b) => <BureauCard key={b.bureau} bureau={b} />)
                : (
                  <p className="text-sm text-slate-400 italic">No bureau data returned.</p>
                )
              }
            </div>

            {result.intelligence?.result && (
              <div className="bg-pilot-50 rounded-xl border border-pilot-100 px-4 py-3">
                <p className="text-xs font-medium text-pilot-600 mb-0.5">Decision signal</p>
                <p className="text-sm text-pilot-800 font-medium">{result.intelligence.result}</p>
                {result.intelligence.name && (
                  <p className="text-xs text-pilot-500 mt-0.5">{result.intelligence.name}</p>
                )}
              </div>
            )}

            <Button className="w-full gap-2" onClick={handleContinue}>
              Continue to Review
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* ── Error state ── */}
        {isError && (
          <div className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800 mb-0.5">Credit pull failed</p>
                <p className="text-sm text-red-700">{pullError ?? 'An unexpected error occurred.'}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setCreditPullStatus('ready')
                }}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 text-slate-500"
                onClick={handleContinue}
              >
                <SkipForward className="w-4 h-4" />
                Skip for Now
              </Button>
            </div>
          </div>
        )}

        {/* Skip option when idle (credit pull is soft and optional) */}
        {(status === 'idle' || status === 'ready') && (
          <button
            onClick={handleContinue}
            className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors py-2"
          >
            Skip credit check for now →
          </button>
        )}
      </div>
    </StepLayout>
  )
}

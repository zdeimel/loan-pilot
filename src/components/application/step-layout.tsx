'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, HelpCircle, Plane, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressSidebar } from './progress-sidebar'
import { applicationSteps, orderedStepIds } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface StepLayoutProps {
  stepId: string
  completedSteps: string[]
  children: React.ReactNode
  onNext?: () => void
  onBack?: () => void
  nextLabel?: string
  isNextDisabled?: boolean
  isSaving?: boolean
  helpText?: string
  whyWeAsk?: string
}

export function StepLayout({
  stepId,
  completedSteps,
  children,
  onNext,
  onBack,
  nextLabel = 'Continue',
  isNextDisabled = false,
  isSaving = false,
  helpText,
  whyWeAsk,
}: StepLayoutProps) {
  const router = useRouter()
  const step = applicationSteps.find((s) => s.id === stepId)
  const stepIndex = orderedStepIds.indexOf(stepId)
  const totalSteps = orderedStepIds.length
  const progressPercent = Math.round(((stepIndex) / totalSteps) * 100)

  const handleNext = () => {
    if (onNext) { onNext(); return }
    const next = orderedStepIds[stepIndex + 1]
    if (next) router.push(`/apply/${next}`)
  }

  const handleBack = () => {
    if (onBack) { onBack(); return }
    const prev = orderedStepIds[stepIndex - 1]
    if (prev) router.push(`/apply/${prev}`)
    else router.push('/apply')
  }

  return (
    <>
      {/* ─── MOBILE LAYOUT (< lg) ─────────────────────────────────────────── */}
      <div className="lg:hidden flex flex-col min-h-screen bg-white application-flow">

        {/* Fixed mobile top bar */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white">
          <div className="flex items-center gap-3 px-4 h-14"
               style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>

            <div className="flex-1 min-w-0 text-center">
              <p className="text-sm font-semibold text-slate-900 truncate">{step?.label}</p>
            </div>

            <div className="flex-shrink-0 text-xs font-medium text-slate-400 tabular-nums">
              {stepIndex + 1}<span className="text-slate-300"> / </span>{totalSteps}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-[3px] bg-slate-100">
            <div
              className="h-full bg-pilot-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </header>

        {/* Scrollable content — padded for fixed header + fixed footer */}
        <main className="flex-1 overflow-y-auto pt-[60px] pb-[120px] px-5">

          {/* Step heading */}
          <div className="pt-6 pb-5">
            <h1 className="text-[28px] font-bold text-slate-900 leading-tight mb-2">
              {step?.label}
            </h1>
            {step?.description && (
              <p className="text-slate-500 text-base leading-relaxed">{step.description}</p>
            )}
            {helpText && (
              <div className="mt-4 flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-sm text-blue-700">
                <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {helpText}
              </div>
            )}
          </div>

          {/* Form content */}
          <div className="animate-slide-up">
            {children}
          </div>

          {/* Why we ask */}
          {whyWeAsk && (
            <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-4">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1.5">Why we ask</p>
              <p className="text-sm text-amber-700 leading-relaxed">{whyWeAsk}</p>
            </div>
          )}
        </main>

        {/* Fixed mobile bottom bar */}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border px-5 pt-3"
          style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
        >
          {/* Autosave */}
          {isSaving && (
            <p className="text-center text-[11px] text-slate-400 mb-2 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Saving progress…
            </p>
          )}

          {/* Continue button */}
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className={cn(
              'w-full h-14 rounded-2xl font-semibold text-base transition-all duration-150',
              'flex items-center justify-center gap-2',
              isNextDisabled
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-pilot-600 text-white active:bg-pilot-700 active:scale-[0.98] shadow-sm'
            )}
          >
            {nextLabel}
            {!isNextDisabled && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ─── DESKTOP LAYOUT (>= lg) ───────────────────────────────────────── */}
      <div className="hidden lg:block min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex gap-10">
            {/* Sidebar */}
            <ProgressSidebar currentStepId={stepId} completedSteps={completedSteps} />

            {/* Main */}
            <main className="flex-1 min-w-0">
              {/* Step header */}
              <div className="mb-8 animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-semibold text-pilot-600 uppercase tracking-wide mb-3">
                  <div className="w-5 h-5 rounded-full bg-pilot-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {stepIndex + 1}
                  </div>
                  Step {stepIndex + 1} of {totalSteps}
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{step?.label}</h1>
                {step?.description && <p className="text-slate-500">{step.description}</p>}
                {helpText && (
                  <div className="mt-4 flex items-start gap-2.5 bg-slate-50 border border-border rounded-xl px-4 py-3 text-sm text-slate-600">
                    <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    {helpText}
                  </div>
                )}
              </div>

              <div className="animate-slide-up">{children}</div>

              {whyWeAsk && (
                <div className="mt-6 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Why we ask</p>
                  <p className="text-sm text-amber-700">{whyWeAsk}</p>
                </div>
              )}

              {/* Desktop nav buttons */}
              <div className="mt-8 flex items-center justify-between gap-4">
                <Button variant="outline" onClick={handleBack} disabled={stepIndex === 0} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  {isSaving && (
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                      Saving…
                    </span>
                  )}
                  <Button onClick={handleNext} disabled={isNextDisabled} className="gap-2">
                    {nextLabel}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  )
}

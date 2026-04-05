'use client'

import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { computeRedFlags } from '@/lib/redFlags'
import { cn } from '@/lib/utils'

export default function ResultsPage() {
  const { currentApplication } = useApplicationStore()
  const flags = computeRedFlags(currentApplication)
  const criticalFlags = flags.filter((f) => f.severity === 'critical')
  const warningFlags = flags.filter((f) => f.severity === 'warning')

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 lg:py-24">

        {/* Confirmation */}
        <div className="bg-white rounded-3xl border border-border shadow-elevated p-8 sm:p-10 text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Application Submitted
          </h1>
          <p className="text-slate-500 text-base leading-relaxed">
            Your loan officer will be with you shortly.
          </p>
        </div>

        {/* Red flags — borrower-facing only */}
        {flags.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-1">
              Items your loan officer will review
            </p>

            {criticalFlags.map((flag) => (
              <div
                key={flag.id}
                className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-1">{flag.label}</p>
                  <p className="text-sm text-red-700 leading-relaxed">{flag.explanation}</p>
                </div>
              </div>
            ))}

            {warningFlags.map((flag) => (
              <div
                key={flag.id}
                className={cn('bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3')}
              >
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">{flag.label}</p>
                  <p className="text-sm text-amber-700 leading-relaxed">{flag.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

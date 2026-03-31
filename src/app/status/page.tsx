'use client'

import { Navbar } from '@/components/shared/navbar'
import { useApplicationStore } from '@/lib/store/applicationStore'
import { cn, formatCurrency } from '@/lib/utils'
import { CheckCircle2, Circle, Clock, AlertCircle, FileText, Send, Home, DollarSign, ChevronRight } from 'lucide-react'

const PIPELINE_STEPS = [
  { id: 'application', label: 'Application', description: 'Forms and documents submitted' },
  { id: 'processing', label: 'Processing', description: 'File reviewed by processor' },
  { id: 'underwriting', label: 'Underwriting', description: 'Credit, income & property review' },
  { id: 'conditional', label: 'Conditional Approval', description: 'Approved with conditions' },
  { id: 'ctc', label: 'Clear to Close', description: 'All conditions cleared' },
  { id: 'closing', label: 'Closing', description: 'Sign & fund' },
]

const STATUS_TO_STEP: Record<string, number> = {
  started: 0,
  'in-progress': 0,
  submitted: 1,
  processing: 2,
  conditional: 3,
  approved: 4,
  closed: 5,
}

const mockConditions = [
  { id: '1', title: '2 months bank statements', status: 'open', priorTo: 'approval' },
  { id: '2', title: 'Executed purchase agreement', status: 'received', priorTo: 'approval' },
  { id: '3', title: 'W-2s for 2 years', status: 'cleared', priorTo: 'approval' },
]

export default function StatusPage() {
  const { currentApplication } = useApplicationStore()
  const borrower = currentApplication.borrower ?? {}
  const ld = currentApplication.loanDetails ?? {}
  const status = currentApplication.status ?? 'in-progress'

  const currentStepIndex = STATUS_TO_STEP[status] ?? 0

  const openConditions = mockConditions.filter(c => c.status === 'open').length
  const receivedConditions = mockConditions.filter(c => c.status === 'received').length
  const clearedConditions = mockConditions.filter(c => c.status === 'cleared').length

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-border shadow-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Application Status</h1>
                <p className="text-slate-500 text-sm mt-0.5">{borrower.firstName} {borrower.lastName} — {ld.purpose?.charAt(0).toUpperCase()}{ld.purpose?.slice(1) ?? 'Purchase'}</p>
              </div>
              <span className={cn('px-3 py-1.5 rounded-full text-xs font-semibold',
                status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                status === 'denied' ? 'bg-red-100 text-red-700' :
                status === 'conditional' ? 'bg-amber-100 text-amber-700' :
                'bg-blue-100 text-blue-700'
              )}>
                {status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            </div>
            {ld.loanAmount && (
              <div className="flex gap-6 mt-4 pt-4 border-t border-border">
                <div><p className="text-xs text-slate-400">Loan Amount</p><p className="font-semibold text-slate-900">{formatCurrency(ld.loanAmount)}</p></div>
                {ld.loanProduct && <div><p className="text-xs text-slate-400">Program</p><p className="font-semibold text-slate-900">{ld.loanProduct.toUpperCase()}</p></div>}
                {ld.loanTerm && <div><p className="text-xs text-slate-400">Term</p><p className="font-semibold text-slate-900">{ld.loanTerm}-year</p></div>}
              </div>
            )}
          </div>

          {/* Pipeline tracker */}
          <div className="bg-white rounded-2xl border border-border shadow-card p-6">
            <h2 className="font-semibold text-slate-900 mb-6">Loan Pipeline</h2>
            <div className="space-y-0">
              {PIPELINE_STEPS.map((step, i) => {
                const isCompleted = i < currentStepIndex
                const isActive = i === currentStepIndex
                const isPending = i > currentStepIndex
                return (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all',
                        isCompleted ? 'bg-emerald-500 border-emerald-500' :
                        isActive ? 'bg-pilot-600 border-pilot-600' :
                        'bg-white border-slate-200'
                      )}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4 text-white" /> :
                         isActive ? <Clock className="w-4 h-4 text-white" /> :
                         <Circle className="w-4 h-4 text-slate-300" />}
                      </div>
                      {i < PIPELINE_STEPS.length - 1 && (
                        <div className={cn('w-0.5 h-10 mt-1', isCompleted ? 'bg-emerald-300' : 'bg-slate-100')} />
                      )}
                    </div>
                    <div className="pb-8 pt-1 flex-1">
                      <p className={cn('font-medium text-sm', isCompleted ? 'text-emerald-700' : isActive ? 'text-pilot-700' : 'text-slate-400')}>
                        {step.label}
                      </p>
                      <p className={cn('text-xs mt-0.5', isActive ? 'text-slate-600' : 'text-slate-400')}>{step.description}</p>
                      {isActive && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-pilot-50 rounded-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-pilot-500 animate-pulse" />
                          <span className="text-xs text-pilot-700 font-medium">In Progress</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Conditions */}
          <div className="bg-white rounded-2xl border border-border shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Conditions</h2>
              <div className="flex gap-3 text-xs">
                <span className="text-red-600 font-medium">{openConditions} open</span>
                <span className="text-amber-600 font-medium">{receivedConditions} received</span>
                <span className="text-emerald-600 font-medium">{clearedConditions} cleared</span>
              </div>
            </div>
            <div className="space-y-2">
              {mockConditions.map(cond => (
                <div key={cond.id} className={cn('flex items-center justify-between p-3 rounded-xl border',
                  cond.status === 'cleared' ? 'bg-emerald-50 border-emerald-100' :
                  cond.status === 'received' ? 'bg-amber-50 border-amber-100' :
                  'bg-red-50 border-red-100'
                )}>
                  <div className="flex items-center gap-2">
                    {cond.status === 'cleared' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> :
                     cond.status === 'received' ? <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" /> :
                     <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                    <span className="text-sm text-slate-800">{cond.title}</span>
                  </div>
                  <span className={cn('text-xs font-medium capitalize px-2 py-0.5 rounded-full',
                    cond.status === 'cleared' ? 'bg-emerald-100 text-emerald-700' :
                    cond.status === 'received' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  )}>{cond.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-border shadow-card p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: 'Upload documents', icon: FileText, href: '/apply/document-upload', desc: 'Add or update your documents' },
                { label: 'View Loan Estimate', icon: DollarSign, href: '/loan-estimate', desc: 'Review your costs and payment' },
                { label: 'Pre-Approval Letter', icon: Home, href: '/pre-approval', desc: 'Download for your real estate agent' },
                { label: 'Message your LO', icon: Send, href: '/dashboard/messages', desc: 'Ask a question or get updates' },
              ].map(action => (
                <a key={action.label} href={action.href} className="flex items-center gap-3 p-4 rounded-xl border-2 border-border hover:border-pilot-300 transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-pilot-50 flex items-center justify-center">
                    <action.icon className="w-4 h-4 text-pilot-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{action.label}</p>
                    <p className="text-xs text-slate-400">{action.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-pilot-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

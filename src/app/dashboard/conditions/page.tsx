'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, AlertCircle, Clock, Plus, X, FileText } from 'lucide-react'
import { mockApplications } from '@/lib/mock-data'

type ConditionStatus = 'open' | 'received' | 'cleared' | 'waived'
type ConditionCategory = 'income' | 'asset' | 'credit' | 'property' | 'compliance' | 'other'
type PriorTo = 'approval' | 'docs' | 'funding'

interface Condition {
  id: string
  applicationId: string
  borrowerName: string
  title: string
  description: string
  category: ConditionCategory
  priorTo: PriorTo
  status: ConditionStatus
  source: string
  createdAt: string
}

const MOCK_CONDITIONS: Condition[] = [
  { id: 'c1', applicationId: 'app-001', borrowerName: 'Sarah Mitchell', title: '2 months bank statements', description: 'All pages of most recent 2 months for all accounts', category: 'asset', priorTo: 'approval', status: 'open', source: 'underwriter', createdAt: '2024-06-14' },
  { id: 'c2', applicationId: 'app-001', borrowerName: 'Sarah Mitchell', title: 'Executed purchase agreement', description: 'Fully signed sales contract with all addenda', category: 'property', priorTo: 'approval', status: 'received', source: 'processor', createdAt: '2024-06-12' },
  { id: 'c3', applicationId: 'app-001', borrowerName: 'Sarah Mitchell', title: 'W-2s for 2 most recent years', description: 'W-2 from Fidelity Investments for 2022 and 2023', category: 'income', priorTo: 'approval', status: 'cleared', source: 'underwriter', createdAt: '2024-06-10' },
  { id: 'c4', applicationId: 'app-002', borrowerName: 'Marcus Thompson', title: 'Appraisal report', description: 'Full interior appraisal on subject property', category: 'property', priorTo: 'approval', status: 'cleared', source: 'underwriter', createdAt: '2024-06-08' },
  { id: 'c5', applicationId: 'app-002', borrowerName: 'Marcus Thompson', title: 'Letter of explanation — 30-day late', description: 'LOE for Chase Sapphire 30-day late in Nov 2022', category: 'credit', priorTo: 'approval', status: 'open', source: 'underwriter', createdAt: '2024-06-14' },
  { id: 'c6', applicationId: 'app-003', borrowerName: 'Priya Patel', title: 'YTD P&L statement', description: 'Profit & loss through prior month, signed by CPA', category: 'income', priorTo: 'approval', status: 'open', source: 'underwriter', createdAt: '2024-06-13' },
  { id: 'c7', applicationId: 'app-003', borrowerName: 'Priya Patel', title: '2 years personal tax returns', description: 'Signed 1040 with all schedules for 2022 and 2023', category: 'income', priorTo: 'approval', status: 'open', source: 'underwriter', createdAt: '2024-06-13' },
]

const CATEGORY_COLORS: Record<ConditionCategory, string> = {
  income: 'bg-blue-100 text-blue-700',
  asset: 'bg-emerald-100 text-emerald-700',
  credit: 'bg-amber-100 text-amber-700',
  property: 'bg-purple-100 text-purple-700',
  compliance: 'bg-red-100 text-red-700',
  other: 'bg-slate-100 text-slate-700',
}

const PRIOR_TO_LABELS: Record<PriorTo, string> = { approval: 'PTD', docs: 'PTD (Docs)', funding: 'PTC' }

function StatusBadge({ status }: { status: ConditionStatus }) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
      status === 'cleared' ? 'bg-emerald-100 text-emerald-700' :
      status === 'received' ? 'bg-amber-100 text-amber-700' :
      status === 'waived' ? 'bg-slate-100 text-slate-500' :
      'bg-red-100 text-red-700'
    )}>
      {status === 'cleared' ? <CheckCircle2 className="w-3 h-3" /> : status === 'open' ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function ConditionsPage() {
  const [conditions, setConditions] = useState(MOCK_CONDITIONS)
  const [filterApp, setFilterApp] = useState('all')
  const [filterStatus, setFilterStatus] = useState<ConditionStatus | 'all'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newApp, setNewApp] = useState('app-001')
  const [newCategory, setNewCategory] = useState<ConditionCategory>('income')

  const filtered = conditions.filter(c =>
    (filterApp === 'all' || c.applicationId === filterApp) &&
    (filterStatus === 'all' || c.status === filterStatus)
  )

  const updateStatus = (id: string, status: ConditionStatus) => {
    setConditions(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }

  const openCount = conditions.filter(c => c.status === 'open').length
  const receivedCount = conditions.filter(c => c.status === 'received').length
  const clearedCount = conditions.filter(c => c.status === 'cleared').length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Conditions</h1>
          <p className="text-slate-500 text-sm mt-0.5">Track and clear underwriting conditions across all files.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pilot-600 hover:bg-pilot-700 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Add Condition
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Open', count: openCount, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
          { label: 'Received', count: receivedCount, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'Cleared', count: clearedCount, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 text-center`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-sm text-slate-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={filterApp} onChange={e => setFilterApp(e.target.value)} className="input-base h-9 text-sm px-3 pr-8 rounded-xl">
          <option value="all">All borrowers</option>
          {mockApplications.map(a => (
            <option key={a.id} value={a.id}>{a.borrower.firstName} {a.borrower.lastName}</option>
          ))}
        </select>
        {(['all', 'open', 'received', 'cleared'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={cn('px-3 py-1.5 rounded-xl border-2 text-xs font-medium transition-all capitalize',
              filterStatus === s ? 'border-pilot-600 bg-pilot-50 text-pilot-700' : 'border-border text-slate-500 hover:border-slate-300')}>
            {s === 'all' ? 'All statuses' : s}
          </button>
        ))}
      </div>

      {/* Conditions list */}
      <div className="bg-white rounded-2xl border border-border shadow-card divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400">No conditions match your filters.</div>
        ) : filtered.map(cond => (
          <div key={cond.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-medium text-slate-900 text-sm">{cond.title}</span>
                  <StatusBadge status={cond.status} />
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', CATEGORY_COLORS[cond.category])}>{cond.category}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{PRIOR_TO_LABELS[cond.priorTo]}</span>
                </div>
                <p className="text-xs text-slate-400 mb-1.5">{cond.description}</p>
                <p className="text-xs text-slate-500">
                  <span className="font-medium">{cond.borrowerName}</span>
                  {' · '}Source: {cond.source}
                  {' · '}{cond.createdAt}
                </p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {cond.status !== 'received' && cond.status !== 'cleared' && (
                  <button onClick={() => updateStatus(cond.id, 'received')} className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium transition-colors">
                    Mark Received
                  </button>
                )}
                {cond.status !== 'cleared' && (
                  <button onClick={() => updateStatus(cond.id, 'cleared')} className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium transition-colors">
                    Clear
                  </button>
                )}
                {cond.status === 'cleared' && (
                  <button onClick={() => updateStatus(cond.id, 'open')} className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-medium transition-colors">
                    Re-open
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add condition modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl border border-border p-6 w-full max-w-md shadow-elevated" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-900">Add Condition</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Borrower</label>
                <select value={newApp} onChange={e => setNewApp(e.target.value)} className="input-base h-10 w-full">
                  {mockApplications.map(a => <option key={a.id} value={a.id}>{a.borrower.firstName} {a.borrower.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Condition</label>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="input-base h-10 w-full" placeholder="e.g. Letter of explanation for late payment" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <select value={newCategory} onChange={e => setNewCategory(e.target.value as ConditionCategory)} className="input-base h-10 w-full">
                  {(['income','asset','credit','property','compliance','other'] as ConditionCategory[]).map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
              <button
                onClick={() => {
                  if (!newTitle.trim()) return
                  const app = mockApplications.find(a => a.id === newApp)
                  setConditions(prev => [...prev, {
                    id: `c-${Date.now()}`, applicationId: newApp,
                    borrowerName: `${app?.borrower.firstName} ${app?.borrower.lastName}`,
                    title: newTitle, description: '', category: newCategory,
                    priorTo: 'approval', status: 'open', source: 'lo',
                    createdAt: new Date().toISOString().split('T')[0],
                  }])
                  setNewTitle(''); setShowAdd(false)
                }}
                className="w-full py-3 bg-pilot-600 hover:bg-pilot-700 text-white rounded-xl font-medium transition-colors"
              >
                Add Condition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

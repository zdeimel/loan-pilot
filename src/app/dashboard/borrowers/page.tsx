'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ArrowRight, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { mockApplications } from '@/lib/mock-data'
import { formatCurrency, getStatusColor, getStatusLabel, getLoanPurposeLabel, timeAgo } from '@/lib/utils'
import type { ApplicationStatus } from '@/lib/types'

const STATUS_FILTERS: { value: ApplicationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'started', label: 'Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'processing', label: 'Processing' },
  { value: 'approved', label: 'Approved' },
]

export default function BorrowersPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all')

  const filtered = mockApplications.filter((app) => {
    const name = `${app.borrower?.firstName} ${app.borrower?.lastName}`.toLowerCase()
    const matchesQuery = !query || name.includes(query.toLowerCase()) || app.id.includes(query)
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    return matchesQuery && matchesStatus
  })

  return (
    <div className="min-h-screen bg-slate-50">
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Borrowers</h1>
            <p className="text-slate-500 mt-1">{mockApplications.length} applications in pipeline</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Invite Borrower
          </Button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or application ID..."
              className="w-full pl-10 pr-4 h-10 rounded-xl border border-border bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pilot-600/20 focus:border-pilot-600 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  statusFilter === f.value
                    ? 'bg-pilot-600 text-white'
                    : 'bg-white border border-border text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile card list (< sm) */}
        <div className="sm:hidden space-y-3">
          {filtered.map((app) => (
            <Link key={app.id} href={`/dashboard/borrowers/${app.id}`}>
              <div className="bg-white rounded-2xl border border-border p-4 flex items-start gap-3 active:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-pilot-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {app.borrower?.firstName?.[0]}{app.borrower?.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {app.borrower?.firstName} {app.borrower?.lastName}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(app.status)}`}>
                      {getStatusLabel(app.status)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    {app.loanDetails?.purpose ? getLoanPurposeLabel(app.loanDetails.purpose) : '—'}
                    {app.loanDetails?.loanAmount && ` · ${formatCurrency(app.loanDetails.loanAmount, true)}`}
                  </p>
                  <div className="flex items-center gap-2">
                    <Progress value={app.completionPercent} className="flex-1 h-1.5" />
                    <span className="text-xs text-slate-400 flex-shrink-0">{app.completionPercent}%</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">No borrowers match your search.</div>
          )}
        </div>

        {/* Desktop table (>= sm) */}
        <Card className="hidden sm:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Borrower</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Loan Type</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Progress</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Updated</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-pilot-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {app.borrower?.firstName?.[0]}{app.borrower?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {app.borrower?.firstName} {app.borrower?.lastName}
                          </p>
                          <p className="text-xs text-slate-400">{app.borrower?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-700">
                        {app.loanDetails?.purpose ? getLoanPurposeLabel(app.loanDetails.purpose) : '—'}
                      </p>
                      {app.loanDetails?.loanProduct && (
                        <p className="text-xs text-slate-400 mt-0.5">{app.loanDetails.loanProduct.toUpperCase()}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {getStatusLabel(app.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 w-36">
                      <div className="flex items-center gap-2">
                        <Progress value={app.completionPercent} className="flex-1 h-1.5" />
                        <span className="text-xs text-slate-400 w-8">{app.completionPercent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {app.loanDetails?.loanAmount ? formatCurrency(app.loanDetails.loanAmount, true) : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs text-slate-400">{timeAgo(app.updatedAt)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/dashboard/borrowers/${app.id}`}
                        className="inline-flex items-center gap-1 text-xs text-pilot-600 hover:text-pilot-700 font-medium"
                      >
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No borrowers match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

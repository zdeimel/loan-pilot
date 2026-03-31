'use client'

import { useState } from 'react'
import { Upload, FileText, CheckCircle2, Clock, AlertCircle, Download, Search } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Toast } from '@/components/ui/toast'
import { mockApplications } from '@/lib/mock-data'
import { getDocStatusColor, timeAgo } from '@/lib/utils'
import type { DocumentStatus } from '@/lib/types'

type DocEntry = {
  id: string
  applicationId: string
  name: string
  type: string
  status: string
  uploadedAt?: string
  borrowerName: string
  borrowerId: string
}

const initialDocs: DocEntry[] = mockApplications.flatMap((app) =>
  app.documents.map((doc) => ({
    ...doc,
    borrowerName: `${app.borrower?.firstName} ${app.borrower?.lastName}`,
    borrowerId: app.id,
  }))
)

const statusIcon = {
  pending: Clock,
  uploaded: Upload,
  processing: Clock,
  verified: CheckCircle2,
  rejected: AlertCircle,
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocEntry[]>(initialDocs)
  const [filter, setFilter] = useState<DocumentStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const statusCounts = {
    all: docs.length,
    verified: docs.filter((d) => d.status === 'verified').length,
    processing: docs.filter((d) => d.status === 'processing').length,
    pending: docs.filter((d) => d.status === 'pending').length,
    rejected: docs.filter((d) => d.status === 'rejected').length,
  }

  const filtered = docs.filter((d) => {
    const matchStatus = filter === 'all' || d.status === filter
    const matchQuery = !query || d.name.toLowerCase().includes(query.toLowerCase()) || d.borrowerName.toLowerCase().includes(query.toLowerCase())
    return matchStatus && matchQuery
  })

  const handleVerify = (docId: string) => {
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, status: 'verified' } : d))
    setToast('Document marked as verified')
  }

  const handleDownload = (docName: string) => {
    setToast(`Downloading ${docName}…`)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Document Center</h1>
          <p className="text-slate-500 mt-1">Manage and verify borrower documents across all applications.</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { status: 'verified' as const, label: 'Verified', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { status: 'processing' as const, label: 'Processing', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { status: 'pending' as const, label: 'Pending', icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-50' },
            { status: 'rejected' as const, label: 'Rejected', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((s) => (
            <button
              key={s.status}
              onClick={() => setFilter(filter === s.status ? 'all' : s.status)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${filter === s.status ? 'border-pilot-600 bg-white shadow-card' : 'border-border bg-white'}`}
            >
              <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{statusCounts[s.status]}</p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents or borrowers..."
            className="w-full pl-10 pr-4 h-10 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pilot-600/20 focus:border-pilot-600"
          />
        </div>

        {/* Document Table */}
        <Card>
          <CardContent className="pt-0">
            <div className="divide-y divide-border">
              {filtered.map((doc) => {
                const StatusIcon = statusIcon[doc.status as keyof typeof statusIcon] ?? FileText
                return (
                  <div key={doc.id} className="flex items-center gap-4 py-4 hover:bg-slate-50/50 -mx-6 px-6 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{doc.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {doc.borrowerName} · {doc.type.replace(/-/g, ' ')}
                        {doc.uploadedAt && ` · ${timeAgo(doc.uploadedAt)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getDocStatusColor(doc.status as DocumentStatus)}`}>
                        {doc.status}
                      </span>
                      {(doc.status === 'processing' || doc.status === 'uploaded') && (
                        <Button size="sm" variant="outline" onClick={() => handleVerify(doc.id)}>Verify</Button>
                      )}
                      {doc.status === 'verified' && (
                        <button
                          onClick={() => handleDownload(doc.name)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-sm">No documents found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

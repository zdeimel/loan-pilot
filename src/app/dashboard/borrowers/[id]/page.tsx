'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, Phone, Mail, MapPin, Briefcase, PiggyBank,
  FileText, AlertCircle, CheckCircle2, Clock, Download, Upload, Sparkles, X, Send
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Toast } from '@/components/ui/toast'
import { mockApplications } from '@/lib/mock-data'
import {
  formatCurrency, getStatusColor, getStatusLabel, getDocStatusColor,
  getLoanPurposeLabel, timeAgo
} from '@/lib/utils'

const DOC_OPTIONS = [
  'Recent pay stub (last 30 days)',
  '2025 W-2',
  '2024 W-2',
  '2025 Tax Return (1040)',
  '2024 Tax Return (1040)',
  'Bank statement — 2 months',
  'Gift letter',
  'Purchase agreement',
  'Homeowner\'s insurance binder',
  'Proof of down payment funds',
]

export default function BorrowerDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const app = mockApplications.find((a) => a.id === id)
  if (!app) notFound()

  const b = app.borrower!
  const totalIncome = app.employment.reduce((s, e) => s + (e.monthlyIncome ?? 0), 0)
  const totalAssets = app.assets.reduce((s, a) => s + (a.currentValue ?? 0), 0)
  const totalDebt = app.liabilities.filter((l) => !l.willPayOff).reduce((s, l) => s + (l.monthlyPayment ?? 0), 0)
  const dti = totalIncome > 0 ? Math.round((totalDebt / totalIncome) * 1000) / 10 : null

  const [docStatuses, setDocStatuses] = useState<Record<string, string>>(
    Object.fromEntries(app.documents.map(d => [d.id, d.status]))
  )
  const docVerified = Object.values(docStatuses).filter(s => s === 'verified').length
  const docTotal = app.documents.length

  // Modals & state
  const [showEmail, setShowEmail] = useState(false)
  const [emailSubject, setEmailSubject] = useState(`Update on your ${app.loanDetails?.purpose ?? 'loan'} application`)
  const [emailBody, setEmailBody] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)

  const [showAI, setShowAI] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiContent, setAiContent] = useState('')

  const [showRequestDoc, setShowRequestDoc] = useState(false)
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [requestNote, setRequestNote] = useState('')
  const [sendingDocReq, setSendingDocReq] = useState(false)

  const [notes, setNotes] = useState([
    { type: 'note', author: 'David Chen', time: '2 hours ago', content: `Called ${b.firstName} to follow up on missing bank statements. Confirmed upload by end of day.` },
    { type: 'ai', author: 'AI Assistant', time: '1 day ago', content: 'Bank statement uploaded and processed. Detected: checking balance $42,300, savings $118,500. Matches borrower-reported figures. No large unexplained deposits flagged.' },
    { type: 'system', author: 'System', time: '3 days ago', content: 'W-2 document verified and matched to employment income.' },
    { type: 'note', author: 'David Chen', time: '5 days ago', content: 'Initial consultation completed. Borrower profile looks strong — stable employment, clean credit indicators.' },
  ])
  const [noteInput, setNoteInput] = useState('')

  const [toast, setToast] = useState<string | null>(null)

  const handleSendEmail = async () => {
    if (!emailBody) return
    setSendingEmail(true)
    await new Promise(r => setTimeout(r, 1100))
    setSendingEmail(false)
    setShowEmail(false)
    setEmailBody('')
    setToast(`Email sent to ${b.firstName} ${b.lastName}`)
  }

  const handleAISummary = async () => {
    setShowAI(true)
    setAiLoading(true)
    setAiContent('')
    await new Promise(r => setTimeout(r, 1600))
    setAiContent(
      `**${b.firstName} ${b.lastName} — AI File Summary**\n\n` +
      `**Loan:** ${(app.loanDetails?.loanProduct ?? 'Conventional').toUpperCase()} ${app.loanDetails?.loanTerm ?? 30}-yr | ${app.loanDetails?.loanAmount ? formatCurrency(app.loanDetails.loanAmount) : 'TBD'} | ${getLoanPurposeLabel(app.loanDetails?.purpose ?? 'purchase')}\n\n` +
      (app.subjectProperty.isAddressKnown && app.subjectProperty.address
        ? `**Property:** ${app.subjectProperty.address.street}, ${app.subjectProperty.address.city} ${app.subjectProperty.address.state}\n\n`
        : '**Property:** Not yet identified\n\n') +
      `**Income:** ${totalIncome > 0 ? formatCurrency(totalIncome) + '/mo gross' : 'Not yet documented'}\n` +
      `**Assets:** ${totalAssets > 0 ? formatCurrency(totalAssets) + ' documented' : 'Not yet documented'}\n` +
      `**DTI:** ${dti !== null ? dti + '%' : 'Insufficient data'} (limit: ${app.loanDetails?.loanProduct === 'fha' ? '57%' : '45%'} for this program)\n` +
      `**Documents:** ${docVerified}/${docTotal} verified\n\n` +
      `**AI Assessment:** ${dti !== null && dti < 43
        ? `File appears well-positioned for ${(app.loanDetails?.loanProduct ?? 'Conventional').toUpperCase()} approval. Income is stable and DTI is within guidelines.`
        : 'DTI data insufficient — complete employment/liability sections to run full qualification.'}\n\n` +
      `**Next steps:** ${app.documents.some(d => docStatuses[d.id] === 'pending') ? 'Outstanding documents must be uploaded and verified before file can advance.' : 'File is complete — ready for submission review.'}`
    )
    setAiLoading(false)
  }

  const handleRequestDocs = async () => {
    if (selectedDocs.length === 0) return
    setSendingDocReq(true)
    await new Promise(r => setTimeout(r, 900))
    setSendingDocReq(false)
    setShowRequestDoc(false)
    setSelectedDocs([])
    setRequestNote('')
    setToast(`Document request sent to ${b.firstName} (${selectedDocs.length} item${selectedDocs.length > 1 ? 's' : ''})`)
  }

  const handleAddNote = () => {
    if (!noteInput.trim()) return
    setNotes(prev => [{
      type: 'note',
      author: 'David Chen',
      time: 'Just now',
      content: noteInput.trim(),
    }, ...prev])
    setNoteInput('')
  }

  const handleVerifyDoc = (docId: string) => {
    setDocStatuses(prev => ({ ...prev, [docId]: 'verified' }))
    setToast('Document marked as verified')
  }

  const handleDownload = (docName: string) => {
    setToast(`Downloading ${docName}…`)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back + Header */}
        <div className="mb-6">
          <Link href="/dashboard/borrowers" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to borrowers
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-pilot-600 flex items-center justify-center text-white text-xl font-bold">
                {b.firstName?.[0]}{b.lastName?.[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{b.firstName} {b.lastName}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                    {getStatusLabel(app.status)}
                  </span>
                  <span className="text-sm text-slate-400">
                    {app.loanDetails?.purpose ? getLoanPurposeLabel(app.loanDetails.purpose) : '—'}
                  </span>
                  {app.loanDetails?.loanAmount && (
                    <span className="text-sm font-semibold text-slate-700">
                      {formatCurrency(app.loanDetails.loanAmount)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowEmail(true)}>
                <Mail className="w-4 h-4" />
                Email
              </Button>
              <Button size="sm" className="gap-2" onClick={handleAISummary}>
                <Sparkles className="w-4 h-4" />
                AI Summary
              </Button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="col-span-2 lg:col-span-1">
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Completion</p>
                <p className="text-2xl font-bold text-slate-900 mb-2">{app.completionPercent}%</p>
                <Progress value={app.completionPercent} />
              </CardContent>
            </Card>
          </div>
          {[
            { label: 'Monthly Income', value: totalIncome > 0 ? formatCurrency(totalIncome) : '—', sub: 'Gross' },
            { label: 'Total Assets', value: totalAssets > 0 ? formatCurrency(totalAssets, true) : '—', sub: 'Documented' },
            { label: 'DTI Ratio', value: dti !== null ? `${dti}%` : '—', sub: dti && dti < 36 ? 'Excellent' : dti && dti < 43 ? 'Good' : '—' },
            { label: 'Documents', value: `${docVerified}/${docTotal}`, sub: 'Verified' },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="pt-5">
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">{kpi.label}</p>
                <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                <p className="text-xs text-slate-400 mt-1">{kpi.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income">Income & Assets</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="notes">Notes & Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-5">
                <Card>
                  <CardHeader><CardTitle>Borrower Information</CardTitle></CardHeader>
                  <CardContent className="pt-0 grid sm:grid-cols-2 gap-4">
                    <InfoRow icon={Mail} label="Email" value={b.email ?? '—'} />
                    <InfoRow icon={Phone} label="Phone" value={b.phone ?? '—'} />
                    <InfoRow icon={MapPin} label="Address" value={b.address ? `${b.address.street}, ${b.address.city}, ${b.address.state}` : '—'} />
                    <InfoRow icon={Briefcase} label="Marital Status" value={b.maritalStatus ?? '—'} />
                    {app.hasCoBorrower && app.coBorrower && (
                      <InfoRow icon={Briefcase} label="Co-Borrower" value={`${app.coBorrower.firstName} ${app.coBorrower.lastName}`} />
                    )}
                  </CardContent>
                </Card>

                {app.employment.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle>Employment</CardTitle></CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      {app.employment.map((emp) => (
                        <div key={emp.id} className="flex items-start justify-between gap-4 p-4 bg-slate-50 rounded-xl">
                          <div>
                            <p className="font-semibold text-slate-900">{emp.employerName}</p>
                            <p className="text-sm text-slate-500">{emp.position}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              Since {new Date(emp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">{formatCurrency(emp.monthlyIncome)}</p>
                            <p className="text-xs text-slate-400">per month</p>
                            <p className="text-xs text-slate-400">{formatCurrency(emp.annualIncome)}/yr</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {app.liabilities.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle>Monthly Obligations</CardTitle></CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      {app.liabilities.map((lib) => (
                        <div key={lib.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{lib.creditor}</p>
                            <p className="text-xs text-slate-400">{lib.type.replace('-', ' ')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-900">{formatCurrency(lib.monthlyPayment)}/mo</p>
                            <p className="text-xs text-slate-400">Balance: {formatCurrency(lib.unpaidBalance)}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-5">
                <Card>
                  <CardHeader><CardTitle>Subject Property</CardTitle></CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {app.subjectProperty.isAddressKnown && app.subjectProperty.address ? (
                      <>
                        <p className="text-sm text-slate-700">{app.subjectProperty.address.street}</p>
                        <p className="text-sm text-slate-500">{app.subjectProperty.address.city}, {app.subjectProperty.address.state} {app.subjectProperty.address.zip}</p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-400 italic">Address not yet provided</p>
                    )}
                    {app.subjectProperty.purchasePrice && (
                      <p className="text-sm font-semibold text-slate-900 mt-2">
                        Purchase price: {formatCurrency(app.subjectProperty.purchasePrice)}
                      </p>
                    )}
                    {app.subjectProperty.propertyType && (
                      <p className="text-xs text-slate-400">{app.subjectProperty.propertyType.replace('-', ' ')} · {app.subjectProperty.propertyUse}</p>
                    )}
                  </CardContent>
                </Card>

                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <p className="text-sm font-semibold text-amber-900">AI Insights</p>
                  </div>
                  <ul className="space-y-2">
                    {app.documents.some(d => docStatuses[d.id] === 'pending') && (
                      <li className="flex items-start gap-2 text-xs text-amber-700">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        {app.documents.filter(d => docStatuses[d.id] === 'pending').length} document(s) still pending upload
                      </li>
                    )}
                    {app.hasCoBorrower && (
                      <li className="flex items-start gap-2 text-xs text-amber-700">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        Co-borrower income not yet documented
                      </li>
                    )}
                    {(app.loanDetails?.downPaymentPercent ?? 0) >= 20 && (
                      <li className="flex items-start gap-2 text-xs text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        {app.loanDetails?.downPaymentPercent}% down payment confirmed — no PMI required
                      </li>
                    )}
                    {dti !== null && dti < 43 && (
                      <li className="flex items-start gap-2 text-xs text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        DTI of {dti}% is within program guidelines
                      </li>
                    )}
                  </ul>
                </div>

                <Card>
                  <CardHeader><CardTitle>Document Status</CardTitle></CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {app.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 truncate">{doc.name}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${getDocStatusColor(docStatuses[doc.id] as any ?? doc.status)}`}>
                          {docStatuses[doc.id] ?? doc.status}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Income & Assets Tab */}
          <TabsContent value="income">
            <div className="grid lg:grid-cols-2 gap-5">
              <Card>
                <CardHeader><CardTitle>Assets</CardTitle></CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {app.assets.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No assets documented yet</p>
                  ) : app.assets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{asset.institution}</p>
                        <p className="text-xs text-slate-400">{asset.type.replace(/-/g, ' ')}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{formatCurrency(asset.currentValue ?? 0)}</p>
                    </div>
                  ))}
                  {app.assets.length > 0 && (
                    <div className="pt-2 flex justify-between text-sm font-semibold">
                      <span className="text-slate-700">Total</span>
                      <span className="text-slate-900">{formatCurrency(totalAssets)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Income Summary</CardTitle></CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {app.employment.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No employment documented yet</p>
                  ) : app.employment.map((emp) => (
                    <div key={emp.id} className="py-2 border-b border-border last:border-0">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-700">{emp.employerName}</span>
                        <span className="text-sm font-semibold text-slate-900">{formatCurrency(emp.monthlyIncome)}/mo</span>
                      </div>
                    </div>
                  ))}
                  {app.employment.length > 0 && (
                    <div className="pt-2 flex justify-between text-sm font-semibold bg-slate-50 -mx-6 px-6 py-3 rounded-b-xl">
                      <span className="text-slate-700">Total Monthly Gross</span>
                      <span className="text-slate-900">{formatCurrency(totalIncome)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Documents</CardTitle>
                <Button size="sm" className="gap-2" onClick={() => setShowRequestDoc(true)}>
                  <Upload className="w-4 h-4" />
                  Request Document
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {app.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {doc.type.replace(/-/g, ' ')}
                            {doc.uploadedAt && ` · Uploaded ${timeAgo(doc.uploadedAt)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getDocStatusColor(docStatuses[doc.id] as any ?? doc.status)}`}>
                          {docStatuses[doc.id] ?? doc.status}
                        </span>
                        {(docStatuses[doc.id] === 'processing' || docStatuses[doc.id] === 'uploaded') && (
                          <Button size="sm" variant="outline" onClick={() => handleVerifyDoc(doc.id)}>Verify</Button>
                        )}
                        {docStatuses[doc.id] === 'verified' && (
                          <button
                            onClick={() => handleDownload(doc.name)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {[
                    `${new Date().getFullYear() - 1} Federal Tax Return (1040)`,
                    `Bank Statement — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
                    'Co-Borrower Pay Stub',
                  ].map((item) => (
                    <div key={item} className="flex items-center justify-between p-4 border-2 border-dashed border-border rounded-xl">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-slate-300" />
                        <p className="text-sm text-slate-400">{item}</p>
                      </div>
                      <Badge variant="slate">Requested</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card>
              <CardHeader><CardTitle>Notes & Activity</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {notes.map((note, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        note.type === 'ai' ? 'bg-pilot-100 text-pilot-700' :
                        note.type === 'system' ? 'bg-slate-100 text-slate-500' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {note.type === 'ai' ? '✦' : note.author[0]}
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-700">{note.author}</span>
                          <span className="text-xs text-slate-400">{note.time}</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{note.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex gap-2">
                  <input
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                    placeholder="Add a note..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-pilot-600/20 focus:border-pilot-600"
                  />
                  <Button size="sm" onClick={handleAddNote} disabled={!noteInput.trim()}>Add Note</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Email modal */}
      {showEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-900">Email {b.firstName} {b.lastName}</h2>
              <button onClick={() => setShowEmail(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">To</label>
                <p className="text-sm font-medium text-slate-700 px-3.5 py-2.5 bg-slate-50 rounded-xl">{b.email}</p>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Subject</label>
                <Input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Message</label>
                <textarea
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  rows={5}
                  placeholder={`Hi ${b.firstName},\n\n`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-pilot-600/20 focus:border-pilot-600 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setShowEmail(false)} disabled={sendingEmail}>Cancel</Button>
                <Button className="flex-1 gap-2" onClick={handleSendEmail} disabled={!emailBody || sendingEmail}>
                  {sendingEmail ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sending...</> : <><Send className="w-4 h-4" />Send</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Summary modal */}
      {showAI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-pilot-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-pilot-600" />
                </div>
                <h2 className="font-semibold text-slate-900">AI File Summary</h2>
              </div>
              <button onClick={() => setShowAI(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1">
              {aiLoading ? (
                <div className="flex items-center gap-3 py-8 justify-center">
                  <span className="w-5 h-5 border-2 border-pilot-200 border-t-pilot-600 rounded-full animate-spin" />
                  <span className="text-sm text-slate-500">Analyzing file...</span>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {aiContent.split('**').map((part, i) =>
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                  )}
                </div>
              )}
            </div>
            {!aiLoading && (
              <div className="mt-4 flex justify-end gap-3 flex-shrink-0">
                <button onClick={() => navigator.clipboard?.writeText(aiContent)} className="text-sm text-pilot-600 hover:text-pilot-700 font-medium">Copy</button>
                <button onClick={() => setShowAI(false)} className="px-4 py-2 rounded-xl bg-pilot-600 hover:bg-pilot-700 text-white text-sm font-medium transition-colors">Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Request Document modal */}
      {showRequestDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-900">Request Documents</h2>
              <button onClick={() => setShowRequestDoc(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Select the documents to request from {b.firstName}:</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {DOC_OPTIONS.map(opt => (
                  <button key={opt} type="button"
                    onClick={() => setSelectedDocs(prev => prev.includes(opt) ? prev.filter(d => d !== opt) : [...prev, opt])}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border-2 text-sm transition-all ${selectedDocs.includes(opt) ? 'border-pilot-600 bg-pilot-50 text-pilot-700' : 'border-border text-slate-600 hover:border-slate-300'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Note to borrower (optional)</label>
                <textarea
                  value={requestNote}
                  onChange={e => setRequestNote(e.target.value)}
                  rows={2}
                  placeholder="Please upload these at your earliest convenience..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-pilot-600/20 focus:border-pilot-600 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setShowRequestDoc(false)} disabled={sendingDocReq}>Cancel</Button>
                <Button className="flex-1 gap-2" onClick={handleRequestDocs} disabled={selectedDocs.length === 0 || sendingDocReq}>
                  {sendingDocReq ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sending...</> : `Request ${selectedDocs.length > 0 ? `(${selectedDocs.length})` : ''}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  )
}

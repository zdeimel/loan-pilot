'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp, Users, FileText, AlertCircle, CheckCircle2, Clock,
  ArrowRight, Sparkles, BarChart3, DollarSign, X
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  mockApplications, mockNotifications, pipelineStats, mockLoanOfficer
} from '@/lib/mock-data'
import { formatCurrency, getStatusColor, getStatusLabel, timeAgo } from '@/lib/utils'

const PIE_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706']

const AI_RESPONSES: Record<string, { title: string; content: string }> = {
  "Summarize Sarah Mitchell's file": {
    title: "Sarah Mitchell — File Summary",
    content: `**Loan:** Conventional 30-yr | $480,000 | Purchase — 1402 Stonehaven Dr, Cary NC\n\n**Strengths:**\n• W-2 income of $110K/yr, 5+ years at Fidelity Investments — excellent stability\n• 20% down ($96K) confirmed — no PMI required\n• Co-borrower James Mitchell not yet fully documented\n\n**Action items (3 open):**\n• Bank statements: only 30 days uploaded — need 60 days\n• 2024 tax return still pending upload\n• Co-borrower income section incomplete\n\n**AI recommendation:** File will likely qualify at Approve/Eligible once co-borrower documentation is complete. Estimated DTI ~28% — within conventional guidelines.`,
  },
  "Draft follow-up for Marcus Thompson": {
    title: "Draft — Marcus Thompson Follow-Up",
    content: `Subject: Your refinance application is under review\n\nHi Marcus,\n\nI wanted to give you a quick update on your 15-year refinance for 8800 Providence Rd. Your complete file was submitted on June 13th and is now with our processing team.\n\nWhat happens next:\n1. Processor will order your updated appraisal (5–7 business days)\n2. Underwriting review typically takes 2–3 days after appraisal\n3. I'll reach out immediately with any conditions or questions\n\nExpected clear-to-close date: approximately July 5th.\n\nFeel free to reply here or call me at (919) 555-0100 if you have any questions.\n\nBest,\nDavid Chen | Senior Loan Officer | LoanPilot Mortgage`,
  },
  "Compare FHA vs Conventional for Priya": {
    title: "FHA vs. Conventional — Priya Patel",
    content: `Based on Priya's profile (pre-approval, $0 down, Raleigh NC):\n\n**FHA 30-yr (recommended):**\n• Min. down payment: 3.5% ($7,000 on $200K home)\n• Min. FICO: 580 with 3.5% down\n• MIP: 0.55%/yr upfront + annual — adds ~$85/mo\n• Loan limit in Wake County: $524,225\n• Best fit if credit score is 580–699\n\n**Conventional 30-yr:**\n• Min. down payment: 3% (HomeReady/HomePossible)\n• Min. FICO: 620\n• PMI drops off at 80% LTV — typically 5–7 years\n• No upfront MIP\n• Better long-term if FICO ≥ 680\n\n**Recommendation:** Start with FHA until we have credit score confirmed. If score comes in ≥ 680, re-run conventional — PMI cancellation makes it cheaper long-term.`,
  },
}

export default function DashboardPage() {
  const recent = mockApplications.slice(0, 3)
  const unread = mockNotifications.filter((n) => !n.isRead)
  const [aiModal, setAiModal] = useState<{ title: string; content: string } | null>(null)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Good morning, David 👋</h1>
          <p className="text-slate-500 mt-1">
            You have {unread.length} notifications and {pipelineStats.inProgress} application{pipelineStats.inProgress !== 1 ? 's' : ''} in progress.
          </p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Pipeline', value: pipelineStats.total, icon: Users, color: 'text-pilot-600', bg: 'bg-pilot-50', delta: '+2 this month' },
            { label: 'In Progress', value: pipelineStats.inProgress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', delta: 'Needs attention' },
            { label: 'Submitted', value: pipelineStats.submitted, icon: CheckCircle2, color: 'text-violet-600', bg: 'bg-violet-50', delta: 'Awaiting review' },
            { label: 'Loan Volume', value: formatCurrency(pipelineStats.totalLoanVolume, true), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', delta: 'Active pipeline' },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                    <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                <p className="text-sm text-slate-500 mt-0.5">{kpi.label}</p>
                <p className="text-xs text-slate-400 mt-1">{kpi.delta}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Borrower Pipeline */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Active Pipeline</CardTitle>
                <Link href="/dashboard/borrowers" className="text-sm text-pilot-600 hover:text-pilot-700 font-medium flex items-center gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {recent.map((app) => {
                    const name = `${app.borrower?.firstName} ${app.borrower?.lastName}`
                    return (
                      <Link key={app.id} href={`/dashboard/borrowers/${app.id}`}>
                        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                          <div className="w-10 h-10 rounded-full bg-pilot-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            {app.borrower?.firstName?.[0]}{app.borrower?.lastName?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
                              <Badge className={getStatusColor(app.status)}>{getStatusLabel(app.status)}</Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <Progress value={app.completionPercent} className="flex-1 h-1.5" />
                              <span className="text-xs text-slate-400 flex-shrink-0">{app.completionPercent}%</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-semibold text-slate-800">
                              {app.loanDetails?.loanAmount ? formatCurrency(app.loanDetails.loanAmount, true) : '—'}
                            </p>
                            <p className="text-xs text-slate-400">{timeAgo(app.updatedAt)}</p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Charts Row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-slate-400" />
                    Applications / Month
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={pipelineStats.monthlyApplications} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ border: 'none', borderRadius: 8, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 12 }} />
                      <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    Loan Product Mix
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4">
                    <PieChart width={120} height={120}>
                      <Pie data={pipelineStats.loanProductMix} cx={55} cy={55} innerRadius={36} outerRadius={52} dataKey="value" paddingAngle={3}>
                        {pipelineStats.loanProductMix.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                    <div className="space-y-2">
                      {pipelineStats.loanProductMix.map((item, i) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                          <span className="text-xs text-slate-600">{item.name}</span>
                          <span className="text-xs font-semibold text-slate-800 ml-auto">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* AI Assistant Card */}
            <div className="bg-gradient-to-br from-pilot-600 to-pilot-800 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5" />
                <p className="font-semibold">AI Assistant</p>
              </div>
              <p className="text-pilot-200 text-sm mb-4">
                Generate borrower summaries, draft follow-up emails, or run qualification scenarios instantly.
              </p>
              <div className="space-y-2">
                {Object.keys(AI_RESPONSES).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setAiModal(AI_RESPONSES[prompt])}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-pilot-100"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {mockNotifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-xl ${notif.isRead ? '' : 'bg-pilot-50/50'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notif.type === 'action-required' ? 'bg-amber-100' :
                      notif.type === 'success' ? 'bg-emerald-100' : 'bg-blue-100'
                    }`}>
                      {notif.type === 'action-required' ? <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> :
                       notif.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> :
                       <Clock className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                      <p className="text-[10px] text-slate-300 mt-1">{timeAgo(notif.createdAt)}</p>
                    </div>
                    {!notif.isRead && <div className="w-2 h-2 rounded-full bg-pilot-600 flex-shrink-0 mt-1.5" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {[
                  { label: 'View all borrowers', href: '/dashboard/borrowers', icon: Users },
                  { label: 'Document center', href: '/dashboard/documents', icon: FileText },
                  { label: 'Run scenarios', href: '/dashboard/scenarios', icon: BarChart3 },
                  { label: 'Messages', href: '/dashboard/messages', icon: AlertCircle },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <action.icon className="w-4 h-4 text-slate-400 group-hover:text-pilot-600 transition-colors" />
                      <span className="text-sm text-slate-700 group-hover:text-slate-900">{action.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-pilot-600 transition-colors" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Response modal */}
      {aiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-pilot-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-pilot-600" />
                </div>
                <h2 className="font-semibold text-slate-900">{aiModal.title}</h2>
              </div>
              <button onClick={() => setAiModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {aiModal.content.split('**').map((part, i) =>
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => { navigator.clipboard?.writeText(aiModal.content); }}
                className="text-sm text-pilot-600 hover:text-pilot-700 font-medium"
              >
                Copy
              </button>
              <button
                onClick={() => setAiModal(null)}
                className="px-4 py-2 rounded-xl bg-pilot-600 hover:bg-pilot-700 text-white text-sm font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

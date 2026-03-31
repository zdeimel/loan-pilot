'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Users, DollarSign, Clock, CheckCircle2 } from 'lucide-react'

const monthlyVolume = [
  { month: 'Jan', apps: 8, funded: 5, volume: 2400000 },
  { month: 'Feb', apps: 11, funded: 7, volume: 3300000 },
  { month: 'Mar', apps: 9, funded: 6, volume: 2850000 },
  { month: 'Apr', apps: 14, funded: 10, volume: 4750000 },
  { month: 'May', apps: 16, funded: 11, volume: 5200000 },
  { month: 'Jun', apps: 13, funded: 9, volume: 4300000 },
]

const pipelineFunnel = [
  { name: 'Started', value: 24, fill: '#e2e8f0' },
  { name: 'In Progress', value: 18, fill: '#bfdbfe' },
  { name: 'Submitted', value: 13, fill: '#93c5fd' },
  { name: 'Processing', value: 10, fill: '#60a5fa' },
  { name: 'Approved', value: 8, fill: '#3b82f6' },
  { name: 'Funded', value: 6, fill: '#1d4ed8' },
]

const programMix = [
  { name: 'Conventional', value: 58, color: '#2563eb' },
  { name: 'FHA', value: 22, color: '#16a34a' },
  { name: 'VA', value: 12, color: '#dc2626' },
  { name: 'Jumbo', value: 5, color: '#9333ea' },
  { name: 'USDA', value: 3, color: '#d97706' },
]

const completionByStep = [
  { step: 'Loan Goal', rate: 98 },
  { step: 'Personal Info', rate: 94 },
  { step: 'Employment', rate: 89 },
  { step: 'Assets', rate: 82 },
  { step: 'Liabilities', rate: 79 },
  { step: 'Real Estate', rate: 75 },
  { step: 'Property', rate: 70 },
  { step: 'Down Payment', rate: 65 },
  { step: 'Declarations', rate: 62 },
  { step: 'Review', rate: 48 },
]

const kpis = [
  { label: 'Total Applications (YTD)', value: '71', change: '+23%', up: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Loan Volume (YTD)', value: formatCurrency(22800000), change: '+31%', up: true, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Avg Time to Close', value: '28 days', change: '-4 days', up: true, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Pull-through Rate', value: '63%', change: '+8%', up: true, icon: CheckCircle2, color: 'text-pilot-600', bg: 'bg-pilot-50' },
]

function KPICard({ kpi }: { kpi: typeof kpis[0] }) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center`}>
          <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
        </div>
        <span className={`text-xs font-semibold flex items-center gap-1 ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>
          {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {kpi.change}
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{kpi.label}</p>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 text-sm mt-0.5">Pipeline performance, conversion, and volume metrics.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => <KPICard key={kpi.label} kpi={kpi} />)}
      </div>

      {/* Volume chart */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-6">
        <h2 className="font-semibold text-slate-900 mb-5">Monthly Applications & Funded Loans</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyVolume} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: number, name: string) => [v, name === 'apps' ? 'Applications' : 'Funded']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Bar dataKey="apps" fill="#bfdbfe" radius={[4, 4, 0, 0]} name="Applications" />
            <Bar dataKey="funded" fill="#2563eb" radius={[4, 4, 0, 0]} name="Funded" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pipeline funnel */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h2 className="font-semibold text-slate-900 mb-5">Pipeline Funnel</h2>
          <div className="space-y-2">
            {pipelineFunnel.map((stage, i) => (
              <div key={stage.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">{stage.name}</span>
                  <span className="font-semibold text-slate-900">{stage.value}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-6 overflow-hidden">
                  <div className="h-6 rounded-full flex items-center pl-3 text-xs font-medium text-white transition-all"
                    style={{ width: `${(stage.value / pipelineFunnel[0].value) * 100}%`, backgroundColor: stage.fill, color: i < 3 ? '#475569' : 'white' }}>
                    {Math.round((stage.value / pipelineFunnel[0].value) * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Program mix */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h2 className="font-semibold text-slate-900 mb-5">Loan Program Mix</h2>
          <div className="flex items-center gap-6">
            <PieChart width={160} height={160}>
              <Pie data={programMix} cx={75} cy={75} innerRadius={45} outerRadius={72} dataKey="value" stroke="none">
                {programMix.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
            <div className="space-y-2.5 flex-1">
              {programMix.map(p => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-sm text-slate-700">{p.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Application completion by step */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-6">
        <h2 className="font-semibold text-slate-900 mb-1">Step Completion Rate</h2>
        <p className="text-sm text-slate-400 mb-5">% of borrowers who complete each step — identifies drop-off points.</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={completionByStep}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="step" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={50} />
            <YAxis domain={[40, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip formatter={(v: number) => [`${v}%`, 'Completion']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
            <Line type="monotone" dataKey="rate" stroke="#2563eb" strokeWidth={2.5} dot={{ fill: '#2563eb', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 mt-2">Biggest drop-off: Down Payment → Declarations (-17%). Consider simplifying the down payment step.</p>
      </div>
    </div>
  )
}

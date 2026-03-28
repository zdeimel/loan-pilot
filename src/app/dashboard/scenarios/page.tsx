'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercent } from '@/lib/utils'

const PRODUCTS = [
  { id: 'conv-30', name: 'Conventional 30-yr', rate: 7.125, term: 30, pmi: 0, downMin: 0.05 },
  { id: 'conv-15', name: 'Conventional 15-yr', rate: 6.625, term: 15, pmi: 0, downMin: 0.05 },
  { id: 'fha-30', name: 'FHA 30-yr', rate: 6.875, term: 30, pmi: 0.85, downMin: 0.035 },
  { id: 'va-30', name: 'VA 30-yr', rate: 6.75, term: 30, pmi: 0, downMin: 0 },
]

function calcPayment(principal: number, rate: number, termYears: number, pmiRate: number, balance: number): number {
  const r = rate / 100 / 12
  const n = termYears * 12
  const p = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  const pmi = balance > 0 && pmiRate > 0 ? (balance * pmiRate / 100) / 12 : 0
  return Math.round(p + pmi)
}

export default function ScenariosPage() {
  const [purchasePrice, setPurchasePrice] = useState(575000)
  const [downPercent, setDownPercent] = useState(20)
  const [income, setIncome] = useState(110000)

  const downAmount = Math.round(purchasePrice * (downPercent / 100))
  const loanAmount = purchasePrice - downAmount
  const monthlyIncome = income / 12

  const scenarios = PRODUCTS.map((p) => {
    const effectiveDown = Math.max(downPercent / 100, p.downMin)
    const effectiveLoan = purchasePrice * (1 - effectiveDown)
    const payment = calcPayment(effectiveLoan, p.rate, p.term, p.pmi, effectiveLoan)
    const totalPaid = payment * p.term * 12
    const totalInterest = totalPaid - effectiveLoan
    const dti = Math.round((payment / monthlyIncome) * 1000) / 10
    return { ...p, payment, totalPaid, totalInterest, dti, loanAmount: Math.round(effectiveLoan), downRequired: Math.round(purchasePrice * p.downMin) }
  })

  const chartData = scenarios.map((s) => ({
    name: s.name.replace('Conventional ', 'Conv ').replace('FHA ', 'FHA ').replace('VA ', 'VA '),
    Payment: s.payment,
    Interest: Math.round(s.totalInterest / 1000),
  }))

  return (
    <div className="min-h-screen bg-slate-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Loan Scenario Comparison</h1>
          <p className="text-slate-500 mt-1">Compare loan products side-by-side with live calculations.</p>
        </div>

        {/* Inputs */}
        <Card className="mb-6">
          <CardContent className="pt-5">
            <div className="grid sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Purchase Price</label>
                <Input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  prefix="$"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Down Payment</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={downPercent}
                    onChange={(e) => setDownPercent(Number(e.target.value))}
                    suffix="%"
                    className="flex-1"
                  />
                  <div className="flex items-center px-3 py-2 rounded-xl bg-slate-50 border border-border text-sm text-slate-600 whitespace-nowrap">
                    {formatCurrency(downAmount, true)}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Annual Income</label>
                <Input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  prefix="$"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scenario Cards */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {scenarios.map((s, i) => (
            <Card key={s.id} className={i === 0 ? 'border-2 border-pilot-600' : ''}>
              {i === 0 && (
                <div className="bg-pilot-600 text-white text-xs font-bold px-4 py-1.5 rounded-t-[14px]">
                  ⭐ Recommended
                </div>
              )}
              <CardContent className="pt-5 space-y-4">
                <div>
                  <p className="font-semibold text-slate-900 mb-1">{s.name}</p>
                  <div className="flex gap-2">
                    <Badge variant="info">{formatPercent(s.rate)} APR</Badge>
                    {s.pmi > 0 && <Badge variant="warning">+MIP</Badge>}
                    {s.id === 'va-30' && <Badge variant="success">VA Only</Badge>}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly payment</span>
                    <span className="font-bold text-slate-900">{formatCurrency(s.payment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Loan amount</span>
                    <span className="text-slate-700">{formatCurrency(s.loanAmount, true)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total interest</span>
                    <span className="text-slate-700">{formatCurrency(s.totalInterest, true)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-slate-500">Housing DTI</span>
                    <span className={`font-semibold ${s.dti < 28 ? 'text-emerald-600' : s.dti < 36 ? 'text-blue-600' : 'text-amber-500'}`}>
                      {formatPercent(s.dti)}
                    </span>
                  </div>
                </div>

                <Button variant={i === 0 ? 'default' : 'outline'} size="sm" className="w-full">
                  Select This
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card>
          <CardHeader><CardTitle>Monthly Payment Comparison</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                <Tooltip formatter={(v: number, name: string) => [name === 'Payment' ? formatCurrency(v) : `$${v}K`, name]} contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="Payment" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

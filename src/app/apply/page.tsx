import Link from 'next/link'
import { ArrowRight, Sparkles, Shield, CheckCircle2, FileText, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/shared/navbar'

const docTypes = [
  { icon: '📄', label: 'W-2s', desc: 'Last 2 years' },
  { icon: '💵', label: 'Pay Stubs', desc: 'Last 30 days' },
  { icon: '🏛️', label: 'Tax Returns', desc: '1040, last 2 years' },
  { icon: '🏦', label: 'Bank Statements', desc: 'Last 60 days' },
  { icon: '🪪', label: 'ID', desc: "Driver's license" },
  { icon: '📋', label: '1099s / K-1s', desc: 'If applicable' },
]

const steps = [
  { n: '01', icon: FileText, title: 'Drop your documents', desc: 'Upload W-2s, pay stubs, tax returns, and bank statements in one place.' },
  { n: '02', icon: Sparkles, title: 'AI reads everything', desc: 'We extract your name, income, employer, and assets automatically — in about 10 seconds.' },
  { n: '03', icon: CheckCircle2, title: 'Confirm & continue', desc: 'Review what we found, fix anything off, and your entire application is pre-filled.' },
]

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 lg:py-20 pb-safe">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pilot-50 border border-pilot-100 text-pilot-700 text-sm font-semibold mb-6">
            <Zap className="w-3.5 h-3.5" />
            New — AI-powered document intake
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Drop your docs.<br />
            <span className="text-pilot-600">We&apos;ll fill the rest.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
            Upload your mortgage documents and our AI reads them instantly — extracting your income, assets, and employer to pre-fill your entire application.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6 mb-6">
          <div className="space-y-5">
            {steps.map((s, i) => (
              <div key={s.n} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-pilot-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {s.n}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 mb-0.5">{s.title}</p>
                  <p className="text-sm text-slate-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accepted doc types */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-5 mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">We accept these documents</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {docTypes.map((d) => (
              <div key={d.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 border border-border">
                <span className="text-xl">{d.icon}</span>
                <div>
                  <p className="text-sm font-medium text-slate-800">{d.label}</p>
                  <p className="text-[11px] text-slate-400">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link href="/apply/document-upload">
          <Button size="xl" className="w-full gap-2 h-14 text-base">
            <Sparkles className="w-5 h-5" />
            Start — Upload My Documents
          </Button>
        </Link>

        {/* Trust + skip */}
        <div className="mt-5 flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-5 text-xs text-slate-400">
            <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Bank-level encryption</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> No hard credit pull</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Free to apply</div>
          </div>
          <Link href="/apply/loan-goal" className="text-sm text-slate-400 hover:text-slate-600 underline underline-offset-2">
            Skip — I&apos;ll fill everything in manually
          </Link>
        </div>
      </div>
    </div>
  )
}

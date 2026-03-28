import Link from 'next/link'
import { ArrowRight, Shield, Zap, FileText, BarChart3, Sparkles, CheckCircle2 } from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { Button } from '@/components/ui/button'

const stages = [
  {
    icon: FileText,
    stage: '01',
    title: 'Guided Application',
    description:
      'Answer simple questions one section at a time. No walls of text, no intimidating forms. Each question comes with a plain-English explanation of why we\'re asking.',
    points: [
      'Loan goal and property type selection',
      'Personal and contact information',
      'Employment history and income documentation',
      'Assets, debts, and financial overview',
      'Property details and purchase intent',
      'Legal declarations (URLA-compliant)',
    ],
    color: 'bg-pilot-50 border-pilot-100',
    iconColor: 'text-pilot-600 bg-pilot-100',
  },
  {
    icon: Shield,
    stage: '02',
    title: 'Document Upload & AI Verification',
    description:
      'Upload your documents directly in the app. Our AI reads, extracts, and verifies your information automatically — then asks you to confirm what it found.',
    points: [
      'Secure encrypted upload',
      'AI-powered OCR extraction',
      'Automatic income and asset matching',
      'Missing document alerts',
      'One-click confirmation of extracted data',
      'W-2, pay stub, tax return, and bank statement support',
    ],
    color: 'bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-600 bg-emerald-100',
  },
  {
    icon: BarChart3,
    stage: '03',
    title: 'Pre-Qualification Results',
    description:
      'See your results immediately. We\'ll show you your qualification score, estimated affordability range, and matched loan products — with real comparisons.',
    points: [
      'Qualification score with explanation',
      'Maximum loan and monthly payment estimate',
      'FHA, Conventional, VA, and USDA comparisons',
      'DTI and LTV analysis',
      'Missing items and next steps',
      'Strength and risk factor breakdown',
    ],
    color: 'bg-violet-50 border-violet-100',
    iconColor: 'text-violet-600 bg-violet-100',
  },
  {
    icon: Sparkles,
    stage: '04',
    title: 'AI-Assisted Next Steps',
    description:
      'Your AI assistant guides you through what to do next — whether that\'s uploading more docs, connecting with your loan officer, or understanding your options.',
    points: [
      'Smart reminders for missing items',
      'Plain-English qualification explanations',
      'Loan officer connection and scheduling',
      'Email and message drafting',
      '"What should I do next?" guidance',
      'Scenario analysis and rate comparisons',
    ],
    color: 'bg-amber-50 border-amber-100',
    iconColor: 'text-amber-600 bg-amber-100',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-slate-50 border-b border-border py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-pilot-600 font-semibold text-sm uppercase tracking-wide mb-4">Transparent by design</p>
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Here&apos;s exactly how<br />LoanPilot works.
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            No black boxes, no surprises. We built LoanPilot to be the most transparent, borrower-friendly mortgage experience available.
          </p>
        </div>
      </section>

      {/* Stages */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {stages.map((stage, i) => (
              <div key={stage.stage} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 items-center`}>
                {/* Visual */}
                <div className={`flex-1 rounded-3xl border-2 ${stage.color} p-8 lg:p-10`}>
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${stage.iconColor} mb-6`}>
                    <stage.icon className="w-7 h-7" />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Stage {stage.stage}</div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">{stage.title}</h2>
                  <p className="text-slate-500 leading-relaxed mb-6">{stage.description}</p>
                  <ul className="space-y-2.5">
                    {stage.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Step Number */}
                <div className="flex-shrink-0 w-24 h-24 rounded-3xl bg-slate-900 flex items-center justify-center hidden lg:flex">
                  <span className="text-4xl font-black text-white">{stage.stage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="bg-slate-50 border-y border-border py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-pilot-600 font-semibold text-sm uppercase tracking-wide mb-4">Bank-level security</p>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Your data is protected at every step.</h2>
              <p className="text-slate-500 leading-relaxed">
                We take security seriously. From the moment you enter your first name to the day you get your keys, every piece of data is encrypted, monitored, and protected.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: '256-bit TLS encryption', desc: 'All data encrypted in transit' },
                { title: 'AES-256 at rest', desc: 'Your stored data is locked' },
                { title: 'SOC 2 Type II', desc: 'Audited security controls' },
                { title: 'No data selling', desc: 'Your info stays yours' },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl border border-border p-4">
                  <Shield className="w-5 h-5 text-pilot-600 mb-2" />
                  <p className="font-semibold text-slate-900 text-sm mb-1">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Ready to get started?</h2>
          <p className="text-xl text-slate-500 mb-8">No hard credit pull, no commitments, no jargon.</p>
          <Link href="/apply">
            <Button size="xl" className="gap-2">
              Start my application
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

import Link from 'next/link'
import { ArrowRight, CheckCircle2, Shield, Zap, BarChart3, FileText, MessageSquare, Clock, Home, TrendingUp, Users } from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { Button } from '@/components/ui/button'

const steps = [
  {
    number: '01',
    title: 'Tell us about yourself',
    description: 'Answer simple questions in plain English — no mortgage jargon. Takes about 15 minutes.',
    icon: FileText,
  },
  {
    number: '02',
    title: 'Upload your documents',
    description: 'We\'ll tell you exactly what we need. Our AI reads and verifies your docs automatically.',
    icon: Shield,
  },
  {
    number: '03',
    title: 'Get your results',
    description: 'See your pre-qualification instantly with loan options matched to your profile.',
    icon: Zap,
  },
]

const borrowerBenefits = [
  { text: 'Get pre-approved in as little as 15 minutes' },
  { text: 'Plain-English explanations — no jargon' },
  { text: 'Real-time progress tracking' },
  { text: 'Secure document upload and AI verification' },
  { text: 'Compare FHA, Conventional, VA, and USDA options' },
  { text: 'On-demand AI assistant for any question' },
]

const loBenefits = [
  { text: 'Cleaner borrower data from day one' },
  { text: 'Automated document collection and verification' },
  { text: 'Pre-qualification scenarios in seconds' },
  { text: 'Full pipeline dashboard and CRM' },
  { text: 'AI-generated borrower summaries and follow-ups' },
  { text: 'Reduce back-and-forth by up to 60%' },
]

const faqs = [
  {
    q: 'Does applying hurt my credit score?',
    a: 'Checking your pre-qualification through LoanPilot uses a soft credit pull, which does not affect your score. A full application with a hard pull only happens when you\'re ready to proceed.',
  },
  {
    q: 'How long does the process take?',
    a: 'Most borrowers complete their application in 20–30 minutes. Pre-qualification results are instant. Full loan approval typically takes 21–30 days depending on your situation.',
  },
  {
    q: 'What documents will I need?',
    a: 'For a typical purchase loan: last 30 days of pay stubs, W-2s for the past 2 years, tax returns for the past 2 years, and 60 days of bank statements. We\'ll guide you through exactly what\'s needed for your situation.',
  },
  {
    q: 'Is my personal information secure?',
    a: 'Absolutely. We use bank-level 256-bit encryption, SOC 2 Type II certified infrastructure, and never sell your data. Your information is only shared with lenders you explicitly authorize.',
  },
  {
    q: 'What if I\'m self-employed?',
    a: 'We have a specialized flow for self-employed borrowers. You\'ll provide 2 years of tax returns and we\'ll calculate your qualifying income correctly — including business deductions analysis.',
  },
]

const testimonials = [
  {
    quote: 'I thought applying for a mortgage would be a nightmare. LoanPilot walked me through every step and I got pre-approved in 20 minutes. My realtor was shocked.',
    name: 'Sarah M.',
    role: 'First-time homebuyer, Raleigh NC',
    initials: 'SM',
    color: 'bg-pilot-600',
  },
  {
    quote: 'As a loan officer, I\'ve tried every platform. LoanPilot is the first one where borrowers actually finish their application without me chasing them.',
    name: 'David Chen',
    role: 'Senior Loan Officer, 14 years experience',
    initials: 'DC',
    color: 'bg-emerald-600',
  },
  {
    quote: 'Self-employed borrowers always struggle with income documentation. LoanPilot\'s guided flow made it actually understandable. My wife and I closed in 28 days.',
    name: 'Marcus T.',
    role: 'Business owner, Charlotte NC',
    initials: 'MT',
    color: 'bg-violet-600',
  },
]

const stats = [
  { value: '94%', label: 'Application completion rate' },
  { value: '18 min', label: 'Average time to pre-qual' },
  { value: '$2.1B+', label: 'Loans processed' },
  { value: '4.9/5', label: 'Borrower satisfaction' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pilot-50 via-transparent to-transparent opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pilot-50 border border-pilot-100 text-pilot-700 text-sm font-medium mb-8">
              <Zap className="w-3.5 h-3.5" />
              Drop your docs — AI fills the rest in 10 seconds
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.08] tracking-tight mb-6">
              The smarter way
              <br />
              <span className="text-pilot-600">to get a mortgage.</span>
            </h1>

            <p className="text-xl text-slate-500 leading-relaxed mb-10 max-w-2xl">
              LoanPilot guides you through your mortgage application step-by-step — like TurboTax, but for home loans.
              No confusing forms. No endless back-and-forth. Just clear, simple guidance to your keys.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link href="/apply" className="sm:flex-shrink-0">
                <Button size="xl" className="group w-full sm:w-auto">
                  Start my application
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Link href="/how-it-works" className="sm:flex-shrink-0">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  See how it works
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-10 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                No hard credit pull to start
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Bank-level encryption
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Free to apply
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[480px] h-[520px]">
            <div className="absolute inset-0 bg-gradient-to-br from-pilot-600 to-pilot-800 rounded-[2rem] shadow-2xl opacity-5" />
            <div className="relative p-6 space-y-3 mt-8 mr-8">
              {/* Mock App Preview Card */}
              <div className="bg-white rounded-2xl border border-border shadow-elevated p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Pre-Qualification Result</p>
                    <p className="text-2xl font-bold text-slate-900 mt-0.5">$540,000</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                  <div className="bg-pilot-600 h-2 rounded-full" style={{ width: '82%' }} />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Qualification Score</span>
                  <span className="text-pilot-600 font-semibold">82 / 100</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border border-border shadow-card p-4">
                  <p className="text-xs text-slate-400 mb-1">Est. Monthly Payment</p>
                  <p className="text-xl font-bold text-slate-900">$2,847</p>
                  <p className="text-xs text-slate-400 mt-0.5">30-yr fixed @ 7.125%</p>
                </div>
                <div className="bg-white rounded-xl border border-border shadow-card p-4">
                  <p className="text-xs text-slate-400 mb-1">DTI Ratio</p>
                  <p className="text-xl font-bold text-emerald-600">28.4%</p>
                  <p className="text-xs text-emerald-500 mt-0.5">Excellent range</p>
                </div>
              </div>

              <div className="bg-pilot-50 rounded-xl border border-pilot-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-pilot-600 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs">✦</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-pilot-900">3 matched loan products</p>
                    <p className="text-xs text-pilot-600 mt-0.5">Conventional, FHA, and 15-yr fixed all eligible</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-pilot-600 font-semibold text-sm uppercase tracking-wide mb-3">Simple by design</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Three steps to pre-approved
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              We&apos;ve distilled the mortgage process down to what actually matters — and we explain every bit of it in plain English.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-gradient-to-r from-pilot-200 to-pilot-100 z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-pilot-50 border border-pilot-100 flex items-center justify-center mb-6">
                    <step.icon className="w-7 h-7 text-pilot-600" />
                  </div>
                  <div className="text-xs font-bold text-pilot-400 uppercase tracking-widest mb-2">{step.number}</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/apply">
              <Button size="lg" className="group">
                Get started — it&apos;s free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Split */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Borrowers */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pilot-50 border border-pilot-100 text-pilot-700 text-xs font-semibold uppercase tracking-wide mb-6">
                <Home className="w-3.5 h-3.5" />
                For Borrowers
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Finally, a mortgage experience that makes sense.
              </h2>
              <p className="text-slate-500 mb-8 text-lg leading-relaxed">
                We&apos;ve rebuilt the application experience from scratch — designed for real people, not underwriters.
              </p>
              <ul className="space-y-3">
                {borrowerBenefits.map((b) => (
                  <li key={b.text} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{b.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/apply">
                  <Button size="lg">Start my application</Button>
                </Link>
              </div>
            </div>

            {/* Loan Officers */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wide mb-6">
                <Users className="w-3.5 h-3.5" />
                For Loan Officers
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Less chasing. More closing.
              </h2>
              <p className="text-slate-500 mb-8 text-lg leading-relaxed">
                Give your borrowers the guided experience they deserve — and get cleaner files, faster.
              </p>
              <ul className="space-y-3">
                {loBenefits.map((b) => (
                  <li key={b.text} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{b.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/dashboard">
                  <Button size="lg" variant="outline">View LO Dashboard</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-pilot-600 font-semibold text-sm uppercase tracking-wide mb-3">Real stories</p>
            <h2 className="text-4xl font-bold text-slate-900">What people are saying</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-border p-6 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 text-sm">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-semibold`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-pilot-600 font-semibold text-sm uppercase tracking-wide mb-3">Common questions</p>
            <h2 className="text-4xl font-bold text-slate-900">FAQ</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white rounded-2xl border border-border p-6">
                <h3 className="font-semibold text-slate-900 mb-3">{faq.q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-pilot-600 to-pilot-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Your keys are closer than you think.
          </h2>
          <p className="text-xl text-pilot-200 mb-10 max-w-2xl mx-auto">
            Start your application today. No hard credit pull, no commitments, no jargon — just a clear path to home.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            <Link href="/apply" className="sm:flex-shrink-0">
              <Button size="xl" className="bg-white text-pilot-700 hover:bg-pilot-50 w-full sm:w-auto">
                Start my application
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/how-it-works" className="sm:flex-shrink-0">
              <Button size="xl" variant="ghost" className="text-white border border-white/30 hover:bg-white/10 w-full sm:w-auto">
                Learn how it works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 pb-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-pilot-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">LP</span>
              </div>
              <span className="text-white font-semibold">LoanPilot</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
              <Link href="/apply" className="hover:text-white transition-colors">Apply</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Loan Officers</Link>
              <span>Privacy</span>
              <span>Terms</span>
            </div>
            <p className="text-slate-500 text-xs">
              © 2024 LoanPilot. NMLS #0000000. Equal Housing Lender.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

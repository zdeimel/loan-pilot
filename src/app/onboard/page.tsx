'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/shared/navbar'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { CheckCircle2, Building2, MapPin, Palette, Bell, ChevronRight } from 'lucide-react'

const STEPS = [
  { id: 'profile', label: 'Your Profile', icon: Building2 },
  { id: 'license', label: 'Licensing', icon: MapPin },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

export default function OnboardPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)

  // Profile
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  // License
  const [nmls, setNmls] = useState('')
  const [states, setStates] = useState<string[]>([])

  // Branding
  const [brandColor, setBrandColor] = useState('#2563eb')
  const [welcome, setWelcome] = useState('Welcome! I\'m here to guide you through your mortgage application. Let\'s get you pre-approved.')

  // Notifications
  const [notifNew, setNotifNew] = useState(true)
  const [notifDoc, setNotifDoc] = useState(true)
  const [notifStatus, setNotifStatus] = useState(true)
  const [notifRate, setNotifRate] = useState(false)

  const toggleState = (s: string) => setStates(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const isStepValid = [
    firstName && lastName && company,
    nmls && states.length > 0,
    true,
    true,
  ][step]

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else router.push('/dashboard')
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          {/* Progress */}
          <div className="mb-8">
            <p className="text-sm text-slate-400 mb-4">Step {step + 1} of {STEPS.length}</p>
            <div className="flex gap-2">
              {STEPS.map((s, i) => (
                <div key={s.id} className={cn('flex-1 h-1.5 rounded-full transition-all', i <= step ? 'bg-pilot-600' : 'bg-slate-200')} />
              ))}
            </div>
          </div>

          {/* Step 0: Profile */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Tell us about yourself</h1>
                <p className="text-slate-500 mt-1">This information appears on your borrower-facing portal and pre-approval letters.</p>
              </div>
              <div className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1.5">First name</label><Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Alex" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Last name</label><Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Johnson" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Senior Loan Officer" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Company / Branch</label><Input value={company} onChange={e => setCompany(e.target.value)} placeholder="ABC Mortgage" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label><Input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="(555) 000-0000" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Work email</label><Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="alex@abcmortgage.com" /></div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Licensing */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Licensing information</h1>
                <p className="text-slate-500 mt-1">Your NMLS ID and licensed states determine which borrowers you can serve.</p>
              </div>
              <div className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1.5">NMLS ID</label><Input value={nmls} onChange={e => setNmls(e.target.value)} placeholder="1234567" /></div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Licensed states ({states.length} selected)</label>
                  <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
                    {US_STATES.map(s => (
                      <button key={s} type="button" onClick={() => toggleState(s)}
                        className={cn('py-1.5 rounded-lg text-xs font-medium border-2 transition-all',
                          states.includes(s) ? 'border-pilot-600 bg-pilot-50 text-pilot-700' : 'border-border text-slate-500 hover:border-slate-300')}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Branding */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Customize your portal</h1>
                <p className="text-slate-500 mt-1">Your borrowers will see your brand, not ours.</p>
              </div>
              <div className="bg-white rounded-2xl border border-border shadow-card p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Brand color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="w-12 h-10 rounded-xl border-2 border-border cursor-pointer" />
                    <Input value={brandColor} onChange={e => setBrandColor(e.target.value)} placeholder="#2563eb" className="w-32" />
                    <div className="flex gap-1.5">
                      {['#2563eb','#16a34a','#dc2626','#9333ea','#d97706','#0f172a'].map(c => (
                        <button key={c} type="button" onClick={() => setBrandColor(c)}
                          className={cn('w-7 h-7 rounded-full border-2 transition-all', brandColor === c ? 'border-slate-400 scale-110' : 'border-transparent')}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Welcome message</label>
                  <textarea value={welcome} onChange={e => setWelcome(e.target.value)} rows={3} className="input-base w-full pt-2.5 resize-none" />
                  <p className="text-xs text-slate-400 mt-1">Shown to borrowers when they start their application.</p>
                </div>
                {/* Preview */}
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Preview</p>
                  <div className="border-2 border-dashed border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: brandColor }}>LP</div>
                      <span className="font-semibold text-slate-900 text-sm">{firstName || 'Your Name'} · {company || 'Your Company'}</span>
                    </div>
                    <p className="text-sm text-slate-600">{welcome}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Notifications */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Notification preferences</h1>
                <p className="text-slate-500 mt-1">Choose what activity triggers an email or SMS alert.</p>
              </div>
              <div className="bg-white rounded-2xl border border-border shadow-card divide-y divide-border">
                {[
                  { label: 'New application started', desc: 'When a borrower begins an application', val: notifNew, set: setNotifNew },
                  { label: 'Document uploaded', desc: 'When a borrower uploads a file', val: notifDoc, set: setNotifDoc },
                  { label: 'Status change', desc: 'When an application status is updated', val: notifStatus, set: setNotifStatus },
                  { label: 'Rate lock expiring', desc: '72 hours before a rate lock expires', val: notifRate, set: setNotifRate },
                ].map(n => (
                  <div key={n.label} className="flex items-center justify-between p-5">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{n.label}</p>
                      <p className="text-xs text-slate-400">{n.desc}</p>
                    </div>
                    <button type="button" onClick={() => n.set(!n.val)} className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', n.val ? 'bg-pilot-600' : 'bg-slate-200')}>
                      <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition-transform', n.val ? 'translate-x-6' : 'translate-x-1')} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-800">You're all set!</span>
                </div>
                <p className="text-sm text-emerald-700">Your LoanPilot account is ready. Click below to access your dashboard and start inviting borrowers.</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="flex-1 py-4 rounded-2xl border-2 border-border text-slate-600 font-semibold hover:border-slate-300 transition-all">
                Back
              </button>
            )}
            <button onClick={handleNext} disabled={!isStepValid}
              className={cn('flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all',
                isStepValid ? 'bg-pilot-600 hover:bg-pilot-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed')}>
              {step === STEPS.length - 1 ? 'Go to Dashboard' : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toast } from '@/components/ui/toast'
import { mockLoanOfficer } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Shield, Lock, Key, Clock, Globe, X } from 'lucide-react'

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

type SecurityModal = '2fa' | 'pii-log' | 'session' | null

const PII_LOG_ENTRIES = [
  { field: 'SSN (last 4)', user: 'David Chen', time: '2026-03-31 09:14', reason: 'Credit pull initiated' },
  { field: 'SSN (last 4)', user: 'David Chen', time: '2026-03-30 14:22', reason: 'AUS submission' },
  { field: 'DOB', user: 'David Chen', time: '2026-03-29 11:05', reason: 'Identity verification' },
  { field: 'SSN (last 4)', user: 'System', time: '2026-03-28 08:30', reason: 'Tri-merge credit report' },
  { field: 'Bank Account #', user: 'David Chen', time: '2026-03-27 16:44', reason: 'Asset verification' },
]

export default function SettingsPage() {
  const lo = mockLoanOfficer

  const [name, setName] = useState(lo.name)
  const [nmls, setNmls] = useState(lo.nmls)
  const [email, setEmail] = useState(lo.email)
  const [phone, setPhone] = useState(lo.phone)
  const [company, setCompany] = useState(lo.company)
  const [branch, setBranch] = useState(lo.branch ?? '')

  const [brandColor, setBrandColor] = useState('#2563eb')
  const [welcome, setWelcome] = useState("Hi! I'm your dedicated loan officer. I'm here to make your mortgage experience as smooth as possible.")
  const [customDomain, setCustomDomain] = useState('')
  const [licensedStates, setLicensedStates] = useState<string[]>(['NC', 'SC', 'VA'])

  const [defaultLockDays, setDefaultLockDays] = useState('30')

  const [notifs, setNotifs] = useState({
    newApp: true,
    docUploaded: true,
    statusChange: true,
    rateLockExpiry: true,
    conditionCleared: false,
    aiDigest: true,
  })

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null)
  const [securityModal, setSecurityModal] = useState<SecurityModal>(null)
  const [sessionTimeout, setSessionTimeout] = useState('8')
  const [twoFAStep, setTwoFAStep] = useState<'choose' | 'code'>('choose')
  const [twoFACode, setTwoFACode] = useState('')

  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type })
  }, [])

  const toggleState = (s: string) => setLicensedStates(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  const toggleNotif = (key: keyof typeof notifs) => setNotifs(prev => ({ ...prev, [key]: !prev[key] }))

  const previewColors = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#d97706', '#0f172a', '#0891b2', '#db2777']

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      {/* Profile */}
      <Card>
        <CardHeader><CardTitle>Loan Officer Profile</CardTitle></CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">NMLS #</label><Input value={nmls} onChange={e => setNmls(e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label><Input value={email} onChange={e => setEmail(e.target.value)} type="email" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label><Input value={phone} onChange={e => setPhone(e.target.value)} type="tel" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Company</label><Input value={company} onChange={e => setCompany(e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Branch</label><Input value={branch} onChange={e => setBranch(e.target.value)} /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Licensed states ({licensedStates.length})</label>
            <div className="grid grid-cols-8 sm:grid-cols-13 gap-1">
              {US_STATES.map(s => (
                <button key={s} type="button" onClick={() => toggleState(s)}
                  className={cn('py-1 rounded text-xs font-medium border transition-all', licensedStates.includes(s) ? 'border-pilot-600 bg-pilot-50 text-pilot-700' : 'border-border text-slate-400 hover:border-slate-300')}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => showToast('Profile saved successfully')}>Save Profile</Button>
          </div>
        </CardContent>
      </Card>

      {/* White-label branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="w-4 h-4" /> Borrower Portal Branding</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Brand color</label>
            <div className="flex items-center gap-3 flex-wrap">
              <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="w-10 h-10 rounded-xl border-2 border-border cursor-pointer" />
              <div className="flex gap-1.5">
                {previewColors.map(c => (
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Custom domain <span className="text-slate-400 font-normal">(optional)</span></label>
            <Input value={customDomain} onChange={e => setCustomDomain(e.target.value)} placeholder="apply.yourmortgage.com" />
            <p className="text-xs text-slate-400 mt-1">Point a CNAME record to loanpilot.com. Contact support to activate.</p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Portal preview</p>
            <div className="border-2 border-dashed border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: brandColor }}>LP</div>
                <span className="font-semibold text-slate-900 text-sm">{name}</span>
                <span className="text-slate-300">·</span>
                <span className="text-sm text-slate-500">{company}</span>
              </div>
              <p className="text-sm text-slate-600">{welcome}</p>
              <div className="mt-3 px-4 py-2.5 rounded-xl text-white text-sm font-semibold inline-block" style={{ backgroundColor: brandColor }}>
                Start My Application
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => showToast('Branding settings saved')}>Save Branding</Button>
          </div>
        </CardContent>
      </Card>

      {/* Rate lock settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="w-4 h-4" /> Rate Lock Settings</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Default rate lock period</label>
            <div className="flex gap-2">
              {['15', '30', '45', '60', '90'].map(d => (
                <button key={d} type="button" onClick={() => setDefaultLockDays(d)}
                  className={cn('flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                    defaultLockDays === d ? 'border-pilot-600 bg-pilot-50 text-pilot-700' : 'border-border text-slate-500 hover:border-slate-300')}>
                  {d} days
                </button>
              ))}
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Expiry alerts</span>
            </div>
            <p className="text-xs text-amber-700">You'll receive email and dashboard notifications when a rate lock has 72 hours or less remaining. Rate lock expiry notifications are always on.</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => showToast(`Default rate lock set to ${defaultLockDays} days`)}>Save Rate Lock Settings</Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <div className="divide-y divide-border">
            {([
              { key: 'newApp', label: 'New application started', desc: 'When a borrower begins an application' },
              { key: 'docUploaded', label: 'Document uploaded', desc: 'When a borrower uploads a file' },
              { key: 'statusChange', label: 'Application status change', desc: 'When a file moves to a new milestone' },
              { key: 'rateLockExpiry', label: 'Rate lock expiring', desc: '72 hours before a rate lock expires' },
              { key: 'conditionCleared', label: 'Condition cleared', desc: 'When a condition is marked cleared by borrower' },
              { key: 'aiDigest', label: 'AI pipeline digest', desc: 'Daily AI summary of your pipeline activity' },
            ] as { key: keyof typeof notifs; label: string; desc: string }[]).map(n => (
              <div key={n.key} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium text-slate-800">{n.label}</p>
                  <p className="text-xs text-slate-400">{n.desc}</p>
                </div>
                <button type="button" onClick={() => toggleNotif(n.key)}
                  className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', notifs[n.key] ? 'bg-pilot-600' : 'bg-slate-200')}>
                  <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition-transform', notifs[n.key] ? 'translate-x-6' : 'translate-x-1')} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => showToast('Notification preferences saved')}>Save Notifications</Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="w-4 h-4" /> Security</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {[
            { id: '2fa' as const, icon: Key, label: 'Two-factor authentication', desc: 'Add an extra layer of security to your account', action: 'Enable 2FA' },
            { id: 'pii-log' as const, icon: Shield, label: 'PII access log', desc: 'View a log of all SSN and sensitive field access', action: 'View Log' },
            { id: 'session' as const, icon: Clock, label: 'Session timeout', desc: `Automatically sign out after ${sessionTimeout} hours of inactivity`, action: 'Configure' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setTwoFAStep('choose'); setTwoFACode(''); setSecurityModal(item.id) }}>{item.action}</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security modals */}
      {securityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">
                {securityModal === '2fa' && 'Enable Two-Factor Authentication'}
                {securityModal === 'pii-log' && 'PII Access Log'}
                {securityModal === 'session' && 'Configure Session Timeout'}
              </h2>
              <button onClick={() => setSecurityModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {securityModal === '2fa' && (
              <div className="space-y-4">
                {twoFAStep === 'choose' ? (
                  <>
                    <p className="text-sm text-slate-600">Choose your authentication method:</p>
                    <div className="space-y-2">
                      {['Authenticator app (Google/Authy)', 'SMS text message'].map(opt => (
                        <button key={opt} onClick={() => setTwoFAStep('code')}
                          className="w-full text-left px-4 py-3 rounded-xl border-2 border-border hover:border-pilot-400 hover:bg-pilot-50 transition-all text-sm font-medium text-slate-700">
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-600">Enter the 6-digit code from your authenticator app to verify setup:</p>
                    <div className="bg-slate-50 rounded-xl p-4 font-mono text-center text-2xl tracking-widest text-slate-700 border">
                      ████ ████ ████ ████
                    </div>
                    <p className="text-xs text-slate-400 text-center">Scan the QR code above with your authenticator app</p>
                    <input
                      value={twoFACode}
                      onChange={e => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-4 py-2.5 text-center text-xl font-mono tracking-widest rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-pilot-600/20 focus:border-pilot-600"
                      maxLength={6}
                    />
                    <Button className="w-full" disabled={twoFACode.length !== 6}
                      onClick={() => { setSecurityModal(null); showToast('Two-factor authentication enabled') }}>
                      Verify & Enable
                    </Button>
                  </>
                )}
              </div>
            )}

            {securityModal === 'pii-log' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">Last 5 PII field access events</p>
                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                  {PII_LOG_ENTRIES.map((entry, i) => (
                    <div key={i} className="px-4 py-3 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-800">{entry.field}</span>
                        <span className="text-xs text-slate-400">{entry.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{entry.user} · {entry.reason}</p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full" onClick={() => setSecurityModal(null)}>Close</Button>
              </div>
            )}

            {securityModal === 'session' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">Automatically sign out after a period of inactivity:</p>
                <div className="grid grid-cols-3 gap-2">
                  {['1', '2', '4', '8', '12', '24'].map(h => (
                    <button key={h} onClick={() => setSessionTimeout(h)}
                      className={cn('py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                        sessionTimeout === h ? 'border-pilot-600 bg-pilot-50 text-pilot-700' : 'border-border text-slate-500 hover:border-slate-300')}>
                      {h}h
                    </button>
                  ))}
                </div>
                <Button className="w-full" onClick={() => {
                  setSecurityModal(null)
                  showToast(`Session timeout set to ${sessionTimeout} hours`)
                }}>
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

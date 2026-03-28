'use client'

import { Navbar } from '@/components/shared/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mockLoanOfficer } from '@/lib/mock-data'

export default function SettingsPage() {
  const lo = mockLoanOfficer

  return (
    <div className="min-h-screen bg-slate-50">
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader><CardTitle>Loan Officer Profile</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <Input defaultValue={lo.name} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">NMLS #</label>
                  <Input defaultValue={lo.nmls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <Input defaultValue={lo.email} type="email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                  <Input defaultValue={lo.phone} type="tel" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Company</label>
                  <Input defaultValue={lo.company} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Branch</label>
                  <Input defaultValue={lo.branch} />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-3">
              {[
                { label: 'New application submitted', desc: 'When a borrower submits their application' },
                { label: 'Document uploaded', desc: 'When a borrower uploads a new document' },
                { label: 'Application reminder', desc: '48-hour reminder for stalled applications' },
                { label: 'AI summary digest', desc: 'Daily AI-generated pipeline summary' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pilot-600" />
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader><CardTitle>Borrower Portal Branding</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Custom welcome message</label>
                <textarea
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-pilot-600/20 focus:border-pilot-600 resize-none"
                  rows={3}
                  defaultValue="Hi! I'm David Chen, your dedicated loan officer. I'm here to make your mortgage experience as smooth as possible. Feel free to message me any time."
                />
              </div>
              <div className="flex justify-end">
                <Button variant="outline">Preview Portal</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

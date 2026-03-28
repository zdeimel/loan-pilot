'use client'

import { useState } from 'react'
import { Send, Sparkles, Search } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockApplications } from '@/lib/mock-data'
import { timeAgo } from '@/lib/utils'

const conversations = mockApplications.map((app, i) => ({
  id: app.id,
  name: `${app.borrower?.firstName} ${app.borrower?.lastName}`,
  initials: `${app.borrower?.firstName?.[0]}${app.borrower?.lastName?.[0]}`,
  lastMessage: i === 0
    ? "Thanks, I'll get those bank statements uploaded today!"
    : i === 1
    ? 'My rate lock expires next week — should I be worried?'
    : 'Just started the application, excited to get started!',
  time: app.updatedAt,
  unread: i < 2,
  status: app.status,
}))

const THREAD_MESSAGES = [
  { role: 'borrower', content: "Hi David! I uploaded the pay stubs you requested. Let me know if you need anything else.", time: '2024-06-14T09:00:00Z' },
  { role: 'lo', content: "Got them, Sarah — thank you! The pay stubs look great. I still need the last 60 days of bank statements. The most recent upload only covers 30 days. Can you pull statements from April and May?", time: '2024-06-14T09:45:00Z' },
  { role: 'borrower', content: "Oh of course! I'll pull April's statement from the bank portal today. Should I combine them into one PDF or upload separately?", time: '2024-06-14T10:02:00Z' },
  { role: 'lo', content: "Either works — separate is fine. Upload them to the Documents section when you have them. After that, the only thing holding us back will be co-borrower income docs.", time: '2024-06-14T10:15:00Z' },
  { role: 'borrower', content: "Thanks, I'll get those bank statements uploaded today!", time: '2024-06-14T10:32:00Z' },
]

const AI_SUGGESTIONS = [
  "Draft a follow-up asking for the remaining documents",
  "Summarize where Sarah's application stands",
  "Generate a rate lock recommendation",
]

export default function MessagesPage() {
  const [selected, setSelected] = useState(conversations[0])
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(THREAD_MESSAGES)

  const send = () => {
    if (!input.trim()) return
    setMessages([...messages, { role: 'lo', content: input, time: new Date().toISOString() }])
    setInput('')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 h-[calc(100vh-220px)]">
          {/* Conversation List */}
          <Card className="flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input placeholder="Search conversations..." className="w-full pl-9 pr-3 h-9 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-pilot-600/20" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${selected.id === conv.id ? 'bg-pilot-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-pilot-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {conv.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={`text-sm font-semibold truncate ${conv.unread ? 'text-slate-900' : 'text-slate-700'}`}>
                          {conv.name}
                        </p>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">{timeAgo(conv.time)}</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread && <div className="w-2 h-2 rounded-full bg-pilot-600 flex-shrink-0 mt-1" />}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Chat Thread */}
          <div className="lg:col-span-2 flex flex-col">
            <Card className="flex flex-col flex-1 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-pilot-600 flex items-center justify-center text-white text-sm font-semibold">
                    {selected.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{selected.name}</p>
                    <p className="text-xs text-slate-400">Purchase · In Progress</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Draft
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'lo' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'lo'
                          ? 'bg-pilot-600 text-white rounded-br-sm'
                          : 'bg-slate-100 text-slate-700 rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                      <p className={`text-[10px] mt-1.5 ${msg.role === 'lo' ? 'text-pilot-200' : 'text-slate-400'}`}>
                        {new Date(msg.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Suggestions */}
              <div className="px-5 pb-2 flex gap-2 flex-wrap border-t border-border pt-3">
                {AI_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-pilot-50 text-pilot-700 hover:bg-pilot-100 transition-colors border border-pilot-100"
                  >
                    ✦ {s}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-pilot-600/20 focus:border-pilot-600"
                />
                <Button onClick={send} disabled={!input.trim()} className="gap-2">
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

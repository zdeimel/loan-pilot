'use client'

import { useState } from 'react'
import { Sparkles, X, Send, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const quickPrompts = [
  'What documents do I need?',
  'How does my DTI affect my loan?',
  'What\'s the difference between FHA and conventional?',
  'Will my credit score hurt my rate?',
]

const mockResponses: Record<string, string> = {
  default: 'Great question! Based on your application so far, I can help you navigate that. Your financial profile looks solid — the main thing to focus on right now is completing the income and asset sections so we can give you a full pre-qualification picture.',
  documents: 'For a purchase loan like yours, you\'ll typically need: **Pay stubs** (last 30 days), **W-2s** (last 2 years), **Tax returns** (last 2 years), **Bank statements** (last 60 days for all accounts), and a **government-issued ID**. Since you have a co-borrower, they\'ll need the same set. You\'re already 50% of the way there!',
  dti: 'DTI stands for Debt-to-Income ratio — it\'s how lenders measure how much of your monthly income goes toward debts. Most conventional loans want your total DTI under 43%. Right now, with your auto loan and student loan, your estimated DTI is around 28.4% — that\'s in great shape! A lower DTI = more loan options and better rates.',
  fha: 'The big difference comes down to **down payment and insurance**: FHA loans allow as little as 3.5% down, making them great for first-time buyers. However, they require mortgage insurance for the life of the loan. Conventional loans (what you\'re on track for) typically need 5-20% down, but you can drop PMI once you hit 20% equity. Given your 20% down payment, conventional is likely your best bet — no ongoing PMI costs.',
  credit: 'Your credit score is one of the biggest factors in your rate. A score above 740 typically qualifies you for the best pricing. If yours is in the 700-740 range, you might see a slight rate bump, but you\'ll still qualify for great products. Want me to walk you through what\'s impacting your score and what you could do to improve it before closing?',
}

function getResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('document')) return mockResponses.documents
  if (lower.includes('dti') || lower.includes('debt')) return mockResponses.dti
  if (lower.includes('fha') || lower.includes('conventional')) return mockResponses.fha
  if (lower.includes('credit')) return mockResponses.credit
  return mockResponses.default
}

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Hi! I\'m your LoanPilot AI assistant. I can answer questions about your application, explain mortgage terms, or help you figure out what to do next. What\'s on your mind?',
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    await new Promise((r) => setTimeout(r, 1200))

    const response = getResponse(text)
    setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: response }])
    setIsTyping(false)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-elevated',
          'flex items-center justify-center transition-all duration-200',
          isOpen ? 'bg-slate-800 hover:bg-slate-700' : 'bg-pilot-600 hover:bg-pilot-700',
          'active:scale-95'
        )}
      >
        {isOpen ? <X className="w-5 h-5 text-white" /> : <Sparkles className="w-6 h-6 text-white" />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[520px] flex flex-col bg-white rounded-2xl shadow-elevated border border-border overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-pilot-600 to-pilot-700">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">LoanPilot AI</p>
              <p className="text-xs text-pilot-200">Always here to help</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="ml-auto text-white/70 hover:text-white">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-pilot-600 text-white rounded-br-sm'
                      : 'bg-slate-100 text-slate-700 rounded-bl-sm'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-xs px-2.5 py-1 rounded-full bg-pilot-50 text-pilot-700 hover:bg-pilot-100 transition-colors border border-pilot-100"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask me anything..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-pilot-600/20 focus:border-pilot-600 transition-all"
            />
            <Button size="icon" onClick={() => sendMessage(input)} disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload, FileText, CheckCircle2, AlertCircle, Sparkles,
  Edit2, ChevronRight, X, RotateCcw, Info, Camera,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useApplicationStore, type ExtractedDocumentData } from '@/lib/store/applicationStore'
import { cn, formatCurrency } from '@/lib/utils'

// ─── Document slot definitions ────────────────────────────────────────────────
const currentYear = new Date().getFullYear()
const taxYear = currentYear - 1   // most recent filed tax year
const priorTaxYear = taxYear - 1

const DOC_SLOTS = [
  {
    id: `w2-${taxYear}`,
    label: `W-2 (${taxYear})`,
    description: 'Most recent W-2 from your employer',
    category: 'income',
    required: true,
    icon: '📄',
    hint: 'Box 1 shows your total taxable wages',
  },
  {
    id: `w2-${priorTaxYear}`,
    label: `W-2 (${priorTaxYear})`,
    description: 'Prior year W-2',
    category: 'income',
    required: true,
    icon: '📄',
    hint: '2 years required for employment history',
  },
  {
    id: 'pay-stub',
    label: 'Pay Stub (last 30 days)',
    description: 'Your most recent pay stub',
    category: 'income',
    required: true,
    icon: '💵',
    hint: 'Shows current YTD earnings and deductions',
  },
  {
    id: `tax-return-${taxYear}`,
    label: `1040 Tax Return (${taxYear})`,
    description: 'Full federal tax return with all schedules',
    category: 'tax',
    required: true,
    icon: '🏛️',
    hint: 'We read AGI, filing status, and other income sources',
  },
  {
    id: `tax-return-${priorTaxYear}`,
    label: `1040 Tax Return (${priorTaxYear})`,
    description: 'Prior year full federal return',
    category: 'tax',
    required: false,
    icon: '🏛️',
    hint: 'Strengthens your income history',
  },
  {
    id: 'bank-stmt-1',
    label: 'Bank Statement (last 60 days)',
    description: 'Checking or primary account',
    category: 'assets',
    required: true,
    icon: '🏦',
    hint: 'All pages required — we verify your balance and deposits',
  },
  {
    id: 'bank-stmt-2',
    label: 'Bank Statement #2',
    description: 'Savings or secondary account',
    category: 'assets',
    required: false,
    icon: '🏦',
    hint: 'Include any account with down payment funds',
  },
  {
    id: 'id',
    label: 'Government-Issued ID',
    description: "Driver's license or passport",
    category: 'identity',
    required: true,
    icon: '🪪',
    hint: 'Front and back if using a driver\'s license',
  },
  {
    id: 'other',
    label: '1099 / K-1 / Other',
    description: 'Self-employment, freelance, or investment income',
    category: 'other',
    required: false,
    icon: '📋',
    hint: 'Add any additional income documentation',
  },
]

const CATEGORY_LABELS: Record<string, string> = {
  income: 'Income Documents',
  tax: 'Tax Returns',
  assets: 'Bank Statements',
  identity: 'Identity',
  other: 'Other Income',
}

type UploadStatus = 'idle' | 'uploading' | 'scanning' | 'done' | 'error'

interface SlotState {
  status: UploadStatus
  fileName?: string
  progress: number
}

// ─── Mock extraction results ───────────────────────────────────────────────────
// In production: call OCR backend → Claude API for extraction + structuring
function generateMockExtraction(uploadedSlots: string[]): ExtractedDocumentData {
  const hasW2 = uploadedSlots.some((s) => s.startsWith('w2'))
  const hasPayStub = uploadedSlots.includes('pay-stub')
  const hasTax = uploadedSlots.some((s) => s.startsWith('tax-return'))
  const hasBank1 = uploadedSlots.includes('bank-stmt-1')
  const hasBank2 = uploadedSlots.includes('bank-stmt-2')
  const hasId = uploadedSlots.includes('id')

  return {
    ...(hasId || hasW2
      ? { firstName: 'Sarah', lastName: 'Mitchell', dob: '1988-04-12' }
      : {}),
    ...(hasId
      ? { street: '4821 Creedmoor Rd', city: 'Raleigh', state: 'NC', zip: '27612' }
      : {}),
    ...(hasW2
      ? {
          employerName: 'Fidelity Investments',
          employerEIN: '04-0652140',
          annualIncome: 110000,
          monthlyIncome: 9167,
          taxYear: 2023,
        }
      : {}),
    ...(hasPayStub
      ? { ytdGross: 54583, payFrequency: 'Semi-monthly' }
      : {}),
    ...(hasTax
      ? {
          agi: 104200,
          filingStatus: 'Married Filing Jointly',
          dependents: 2,
          taxYear2: 2022,
        }
      : {}),
    ...(hasBank1
      ? { bankName: 'Bank of America', accountLastFour: '4521', accountType: 'checking', balance: 42300 }
      : {}),
    ...(hasBank2
      ? { bankName2: 'Bank of America', accountLastFour2: '8832', accountType2: 'savings', balance2: 118500 }
      : {}),
    uploadedDocTypes: uploadedSlots,
    confidence: {
      firstName: 0.99,
      lastName: 0.99,
      dob: 0.95,
      employerName: 0.98,
      annualIncome: 0.99,
      monthlyIncome: 0.99,
      agi: 0.97,
      filingStatus: 0.99,
      dependents: 0.92,
      balance: 0.98,
      balance2: 0.98,
      street: 0.91,
      city: 0.97,
      state: 0.99,
      zip: 0.99,
    },
  }
}

// ─── Processing animation messages ────────────────────────────────────────────
const SCAN_MESSAGES = [
  'Reading document structure…',
  'Extracting employer information…',
  'Pulling income figures from W-2 Box 1…',
  'Cross-referencing pay stub YTD…',
  'Reading AGI from tax return line 11…',
  'Verifying bank account balances…',
  'Detecting filing status…',
  'Matching address across documents…',
  'Calculating qualifying income…',
  'Running consistency checks…',
  'Finalizing extraction…',
]

// ─── Confidence pill ──────────────────────────────────────────────────────────
function ConfidencePill({ score }: { score: number }) {
  if (score >= 0.95) return <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">High confidence</span>
  if (score >= 0.80) return <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Review recommended</span>
  return <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Low confidence</span>
}

// ─── Editable extracted field ─────────────────────────────────────────────────
function ExtractedField({
  label,
  value,
  confidence,
  onEdit,
  format,
}: {
  label: string
  value: string | number | undefined
  confidence?: number
  onEdit: (val: string) => void
  format?: 'currency' | 'text'
}) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(String(value ?? ''))

  if (value === undefined || value === '') return null

  const display = format === 'currency' && typeof value === 'number'
    ? formatCurrency(value)
    : String(value)

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        {editing ? (
          <input
            autoFocus
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={() => { onEdit(local); setEditing(false) }}
            onKeyDown={(e) => { if (e.key === 'Enter') { onEdit(local); setEditing(false) } }}
            className="text-sm font-medium text-slate-900 border-b border-pilot-400 focus:outline-none bg-transparent w-full"
          />
        ) : (
          <p className="text-sm font-semibold text-slate-900 truncate">{display}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {confidence !== undefined && <ConfidencePill score={confidence} />}
        <button
          onClick={() => setEditing(!editing)}
          className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Document upload slot ─────────────────────────────────────────────────────
function DocSlot({
  slot,
  state,
  onFileSelect,
  onRemove,
}: {
  slot: typeof DOC_SLOTS[0]
  state: SlotState
  onFileSelect: (slotId: string, file: File) => void
  onRemove: (slotId: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) onFileSelect(slot.id, file)
    },
    [slot.id, onFileSelect]
  )

  const isDone = state.status === 'done'
  const isProcessing = state.status === 'uploading' || state.status === 'scanning'

  return (
    <div
      className={cn(
        'relative rounded-2xl border-2 transition-all duration-200 overflow-hidden',
        isDone
          ? 'border-emerald-200 bg-emerald-50/40'
          : dragging
          ? 'border-pilot-400 bg-pilot-50 scale-[1.01]'
          : isProcessing
          ? 'border-pilot-200 bg-pilot-50/30'
          : 'border-dashed border-border bg-white hover:border-pilot-300 hover:bg-slate-50'
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.heic"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFileSelect(slot.id, file)
        }}
      />
      {/* Camera input — triggers native camera on mobile */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFileSelect(slot.id, file)
        }}
      />

      <div className="p-4 flex items-start gap-3">
        {/* Icon / Status */}
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg transition-all',
          isDone ? 'bg-emerald-100' : isProcessing ? 'bg-pilot-50' : 'bg-slate-100'
        )}>
          {isDone
            ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            : isProcessing
            ? <div className="w-5 h-5 border-2 border-pilot-400 border-t-transparent rounded-full animate-spin" />
            : <span>{slot.icon}</span>
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <p className={cn('text-sm font-semibold', isDone ? 'text-emerald-800' : 'text-slate-800')}>
                  {slot.label}
                </p>
                {slot.required && !isDone && (
                  <span className="text-[10px] font-bold text-pilot-600 bg-pilot-50 px-1.5 py-0.5 rounded-full">Required</span>
                )}
              </div>
              {isDone ? (
                <p className="text-xs text-emerald-600 mt-0.5 font-medium truncate">{state.fileName}</p>
              ) : isProcessing ? (
                <p className="text-xs text-pilot-600 mt-0.5">
                  {state.status === 'uploading' ? `Uploading… ${state.progress}%` : 'Scanning document…'}
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-0.5">{slot.description}</p>
              )}
            </div>
            {isDone && (
              <button
                onClick={() => onRemove(slot.id)}
                className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Upload progress bar */}
          {state.status === 'uploading' && (
            <div className="mt-2 w-full bg-pilot-100 rounded-full h-1">
              <div
                className="bg-pilot-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${state.progress}%` }}
              />
            </div>
          )}

          {/* Hint text */}
          {!isDone && !isProcessing && (
            <div className="flex items-center gap-1 mt-2">
              <Info className="w-3 h-3 text-slate-300 flex-shrink-0" />
              <p className="text-[11px] text-slate-300">{slot.hint}</p>
            </div>
          )}
        </div>

        {/* Upload / Camera buttons */}
        {!isDone && !isProcessing && (
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
            >
              <Upload className="w-3 h-3" />
              Upload
            </button>
            <button
              onClick={() => cameraRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
            >
              <Camera className="w-3 h-3" />
              Camera
            </button>
          </div>
        )}
      </div>

      {/* Scanning shimmer overlay */}
      {state.status === 'scanning' && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pilot-100 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-transparent via-pilot-500 to-transparent animate-[shimmer_1.5s_ease-in-out_infinite] w-1/3" />
        </div>
      )}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export function DocumentUploadStep() {
  const router = useRouter()
  const { applyExtractedData } = useApplicationStore()

  const [slotStates, setSlotStates] = useState<Record<string, SlotState>>(() =>
    Object.fromEntries(DOC_SLOTS.map((s) => [s.id, { status: 'idle', progress: 0 }]))
  )

  // Store actual File objects for Azure DI extraction
  const filesRef = useRef<Record<string, File>>({})

  // Phase: upload → processing → review → done
  const [phase, setPhase] = useState<'upload' | 'processing' | 'review' | 'applied'>('upload')
  const [scanMsg, setScanMsg] = useState(SCAN_MESSAGES[0])
  const [scanProgress, setScanProgress] = useState(0)
  const [extracted, setExtracted] = useState<ExtractedDocumentData | null>(null)

  // Editable extracted values
  const [edited, setEdited] = useState<ExtractedDocumentData | null>(null)

  const doneSlots = Object.entries(slotStates).filter(([, s]) => s.status === 'done').map(([id]) => id)
  const requiredSlots = DOC_SLOTS.filter((s) => s.required).map((s) => s.id)
  const requiredDone = requiredSlots.filter((id) => slotStates[id]?.status === 'done')
  const canAnalyze = doneSlots.length >= 2

  // Store file and animate upload
  const handleFileSelect = useCallback(async (slotId: string, file: File) => {
    filesRef.current[slotId] = file

    // Upload animation
    setSlotStates((prev) => ({ ...prev, [slotId]: { status: 'uploading', progress: 0, fileName: file.name } }))
    for (let p = 10; p <= 100; p += 15) {
      await new Promise((r) => setTimeout(r, 80))
      setSlotStates((prev) => ({ ...prev, [slotId]: { ...prev[slotId], progress: p } }))
    }
    setSlotStates((prev) => ({ ...prev, [slotId]: { status: 'scanning', progress: 100, fileName: file.name } }))
    await new Promise((r) => setTimeout(r, 800))
    setSlotStates((prev) => ({ ...prev, [slotId]: { status: 'done', progress: 100, fileName: file.name } }))
  }, [])

  const handleRemove = useCallback((slotId: string) => {
    delete filesRef.current[slotId]
    setSlotStates((prev) => ({ ...prev, [slotId]: { status: 'idle', progress: 0 } }))
  }, [])

  // Send each uploaded file to Azure DI and merge results
  const runExtraction = async () => {
    setPhase('processing')
    setScanProgress(0)

    const uploadedSlotIds = Object.keys(filesRef.current)
    const msgInterval = Math.max(1, Math.floor(SCAN_MESSAGES.length / Math.max(uploadedSlotIds.length, 1)))
    let msgIdx = 0

    const advanceMsg = () => {
      setScanMsg(SCAN_MESSAGES[msgIdx % SCAN_MESSAGES.length])
      setScanProgress(Math.round(((msgIdx + 1) / SCAN_MESSAGES.length) * 100))
      msgIdx++
    }

    advanceMsg()

    // Call /api/extract for each uploaded file in parallel
    const results = await Promise.all(
      uploadedSlotIds.map(async (slotId) => {
        const file = filesRef.current[slotId]
        const fd = new FormData()
        fd.append('file', file)
        fd.append('slotId', slotId)

        advanceMsg()

        try {
          const res = await fetch('/api/extract', { method: 'POST', body: fd })
          const json = await res.json()
          return json.extracted as Partial<ExtractedDocumentData>
        } catch {
          return {}
        }
      })
    )

    // Merge all extracted fields — later docs win for duplicate keys
    const merged = results.reduce(
      (acc, r) => ({ ...acc, ...r }),
      { uploadedDocTypes: uploadedSlotIds, confidence: {} } as ExtractedDocumentData
    )

    // Finish progress animation
    for (let i = msgIdx; i < SCAN_MESSAGES.length; i++) {
      advanceMsg()
      await new Promise((r) => setTimeout(r, 200))
    }

    setScanProgress(100)
    setExtracted(merged)
    setEdited(merged)
    setPhase('review')
  }

  const handleApply = () => {
    if (!edited) return
    applyExtractedData(edited)
    setPhase('applied')
  }

  const handleContinue = () => {
    router.push('/apply/loan-goal')
  }

  const updateField = (key: keyof ExtractedDocumentData, val: string) => {
    setEdited((prev) => prev ? {
      ...prev,
      [key]: typeof (prev as unknown as Record<string, unknown>)[key] === 'number' ? Number(val.replace(/[^0-9.]/g, '')) : val,
    } : prev)
  }

  // ── Render: Processing ──
  if (phase === 'processing') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 animate-fade-in">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-pilot-100" />
          <div
            className="absolute inset-0 rounded-full border-4 border-pilot-600 border-t-transparent animate-spin"
            style={{ animationDuration: '1.2s' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-pilot-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Analyzing your documents</h2>
        <p className="text-slate-500 mb-8 text-center max-w-sm">
          Our AI is reading your documents and extracting your information. This usually takes about 10 seconds.
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-sm mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>{scanMsg}</span>
            <span>{scanProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-pilot-600 h-2 rounded-full transition-all duration-500 rounded-full"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>

        {/* Ticking doc list */}
        <div className="w-full max-w-sm space-y-2 mt-4">
          {doneSlots.map((id) => {
            const slot = DOC_SLOTS.find((s) => s.id === id)!
            return (
              <div key={id} className="flex items-center gap-3 text-sm text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {slot.label}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Render: Review extracted data ──
  if (phase === 'review' && extracted && edited) {
    const conf = edited.confidence

    return (
      <div className="max-w-2xl mx-auto animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">We found your information!</h2>
              <p className="text-emerald-100 text-sm leading-relaxed">
                We extracted data from {doneSlots.length} document{doneSlots.length !== 1 ? 's' : ''}.
                Review everything below, fix anything that looks off, then click <strong>Apply to Application</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Extracted sections */}
        <div className="space-y-4">

          {/* Personal */}
          {(edited.firstName || edited.dob) && (
            <ReviewCard title="Personal Information" icon="👤" docsSource="Driver's License + W-2">
              <ExtractedField label="First name" value={edited.firstName} confidence={conf.firstName} onEdit={(v) => updateField('firstName', v)} />
              <ExtractedField label="Last name" value={edited.lastName} confidence={conf.lastName} onEdit={(v) => updateField('lastName', v)} />
              <ExtractedField label="Date of birth" value={edited.dob} confidence={conf.dob} onEdit={(v) => updateField('dob', v)} />
              {edited.filingStatus && <ExtractedField label="Filing status" value={edited.filingStatus} confidence={conf.filingStatus} onEdit={(v) => updateField('filingStatus', v)} />}
              {edited.dependents !== undefined && <ExtractedField label="Dependents" value={edited.dependents} confidence={conf.dependents} onEdit={(v) => updateField('dependents', v)} />}
            </ReviewCard>
          )}

          {/* Address */}
          {edited.street && (
            <ReviewCard title="Current Address" icon="📍" docsSource="Driver's License">
              <ExtractedField label="Street" value={edited.street} confidence={conf.street} onEdit={(v) => updateField('street', v)} />
              <ExtractedField label="City" value={edited.city} confidence={conf.city} onEdit={(v) => updateField('city', v)} />
              <ExtractedField label="State" value={edited.state} confidence={conf.state} onEdit={(v) => updateField('state', v)} />
              <ExtractedField label="ZIP code" value={edited.zip} confidence={conf.zip} onEdit={(v) => updateField('zip', v)} />
            </ReviewCard>
          )}

          {/* Employment & Income */}
          {(edited.employerName || edited.annualIncome) && (
            <ReviewCard title="Employment & Income" icon="💼" docsSource="W-2 + Pay Stub">
              <ExtractedField label="Employer" value={edited.employerName} confidence={conf.employerName} onEdit={(v) => updateField('employerName', v)} />
              {edited.employerEIN && <ExtractedField label="Employer EIN" value={edited.employerEIN} confidence={0.97} onEdit={(v) => updateField('employerEIN', v)} />}
              <ExtractedField label="Annual wages (W-2 Box 1)" value={edited.annualIncome} confidence={conf.annualIncome} format="currency" onEdit={(v) => updateField('annualIncome', v)} />
              <ExtractedField label="Monthly gross income" value={edited.monthlyIncome} confidence={conf.monthlyIncome} format="currency" onEdit={(v) => updateField('monthlyIncome', v)} />
              {edited.ytdGross && <ExtractedField label="YTD gross (pay stub)" value={edited.ytdGross} confidence={0.98} format="currency" onEdit={(v) => updateField('ytdGross', v)} />}
              {edited.payFrequency && <ExtractedField label="Pay frequency" value={edited.payFrequency} confidence={0.96} onEdit={(v) => updateField('payFrequency', v)} />}
            </ReviewCard>
          )}

          {/* Tax Return */}
          {edited.agi && (
            <ReviewCard title="Tax Return (1040)" icon="🏛️" docsSource="Federal Tax Return">
              <ExtractedField label="Adjusted Gross Income (AGI)" value={edited.agi} confidence={conf.agi} format="currency" onEdit={(v) => updateField('agi', v)} />
              {edited.taxYear && <ExtractedField label="Tax year" value={edited.taxYear} confidence={0.99} onEdit={(v) => updateField('taxYear', v)} />}
              {edited.rentalIncome && <ExtractedField label="Rental income" value={edited.rentalIncome} confidence={0.93} format="currency" onEdit={(v) => updateField('rentalIncome', v)} />}
              {edited.dividendIncome && <ExtractedField label="Dividend income" value={edited.dividendIncome} confidence={0.95} format="currency" onEdit={(v) => updateField('dividendIncome', v)} />}
            </ReviewCard>
          )}

          {/* Bank accounts */}
          {(edited.bankName || edited.bankName2) && (
            <ReviewCard title="Bank Accounts" icon="🏦" docsSource="Bank Statements">
              {edited.bankName && (
                <div className="py-2 border-b border-border last:border-0">
                  <p className="text-xs text-slate-400 mb-1.5">{edited.accountType?.toUpperCase()} account</p>
                  <ExtractedField label={`${edited.bankName} (…${edited.accountLastFour})`} value={edited.balance} confidence={conf.balance} format="currency" onEdit={(v) => updateField('balance', v)} />
                </div>
              )}
              {edited.bankName2 && (
                <div className="pt-2">
                  <p className="text-xs text-slate-400 mb-1.5">{edited.accountType2?.toUpperCase()} account</p>
                  <ExtractedField label={`${edited.bankName2} (…${edited.accountLastFour2})`} value={edited.balance2} confidence={conf.balance2} format="currency" onEdit={(v) => updateField('balance2', v)} />
                </div>
              )}
            </ReviewCard>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-3 bg-slate-50 rounded-xl border border-border p-4">
            <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Always review extracted values — OCR can occasionally misread fonts or formatting.
              Click the <Edit2 className="w-3 h-3 inline" /> icon next to any field to correct it.
              Your original documents are preserved and will be verified by your loan officer.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            onClick={() => { setPhase('upload'); setExtracted(null); setEdited(null) }}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Upload more docs
          </Button>
          <Button onClick={handleApply} className="flex-1 gap-2 h-12 text-base">
            <CheckCircle2 className="w-5 h-5" />
            Apply to Application
          </Button>
        </div>
      </div>
    )
  }

  // ── Render: Applied / success ──
  if (phase === 'applied') {
    const fields = [
      edited?.firstName && `Name: ${edited.firstName} ${edited.lastName}`,
      edited?.annualIncome && `Income: ${formatCurrency(edited.annualIncome)}/yr from ${edited.employerName}`,
      edited?.agi && `AGI: ${formatCurrency(edited.agi)} (tax return)`,
      edited?.balance && `Checking: ${formatCurrency(edited.balance)} at ${edited.bankName}`,
      edited?.balance2 && `Savings: ${formatCurrency(edited.balance2)} at ${edited.bankName2}`,
      edited?.street && `Address: ${edited.street}, ${edited.city}, ${edited.state}`,
    ].filter(Boolean)

    return (
      <div className="max-w-xl mx-auto animate-slide-up text-center py-8">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Application pre-filled!</h2>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
          We applied your extracted data across all relevant sections. You can review and edit anything as you go through the steps.
        </p>

        <div className="bg-white rounded-2xl border border-border shadow-card p-5 text-left mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Pre-filled from your documents</p>
          <div className="space-y-2">
            {fields.map((f) => (
              <div key={f as string} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-sm text-slate-700">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <Button size="lg" className="gap-2 w-full h-13 text-base" onClick={handleContinue}>
          Continue to application
          <ChevronRight className="w-5 h-5" />
        </Button>
        <p className="text-xs text-slate-400 mt-3">
          Each section is pre-filled — just review, confirm, and move on.
        </p>
      </div>
    )
  }

  // ── Render: Upload phase ──
  const categories = ['income', 'tax', 'assets', 'identity', 'other']

  return (
    <div className="max-w-2xl mx-auto">
      {/* Intro */}
      <div className="bg-gradient-to-br from-pilot-600 to-pilot-800 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Let AI fill your application for you</h2>
            <p className="text-pilot-200 text-sm leading-relaxed">
              Drop your documents and we&apos;ll read them automatically — extracting your name, income, employer, assets, and more.
              You just confirm what we found and keep moving. Takes about 30 seconds.
            </p>
          </div>
        </div>

        {/* Progress summary */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Uploaded', value: doneSlots.length, icon: '📤' },
            { label: 'Required', value: `${requiredDone.length}/${requiredSlots.length}`, icon: '✅' },
            { label: 'Time to analyze', value: '~10s', icon: '⚡' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-lg mb-0.5">{s.icon}</div>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-pilot-300">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Skip option */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500">Upload what you have — you can add more later</p>
        <button
          onClick={handleContinue}
          className="text-sm text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
        >
          Skip — fill manually
        </button>
      </div>

      {/* Doc slots by category */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const slots = DOC_SLOTS.filter((s) => s.category === cat)
          return (
            <div key={cat}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                {CATEGORY_LABELS[cat]}
              </p>
              <div className="space-y-2">
                {slots.map((slot) => (
                  <DocSlot
                    key={slot.id}
                    slot={slot}
                    state={slotStates[slot.id]}
                    onFileSelect={handleFileSelect}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Analyze CTA */}
      <div className="sticky bottom-6 mt-8">
        <div className={cn(
          'bg-white rounded-2xl border border-border shadow-elevated p-4 flex flex-col sm:flex-row items-center gap-4 transition-all',
          !canAnalyze && 'opacity-60'
        )}>
          <div className="flex-1 text-center sm:text-left">
            {canAnalyze ? (
              <>
                <p className="text-sm font-semibold text-slate-900">
                  {doneSlots.length} document{doneSlots.length !== 1 ? 's' : ''} ready to analyze
                </p>
                <p className="text-xs text-slate-400">
                  AI will extract and pre-fill your entire application
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-500">Upload at least 2 documents to continue</p>
                <p className="text-xs text-slate-400">Required: W-2, pay stub, or tax return</p>
              </>
            )}
          </div>
          <Button
            size="lg"
            onClick={runExtraction}
            disabled={!canAnalyze}
            className="gap-2 w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4" />
            Analyze &amp; Pre-fill
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Review card wrapper ──────────────────────────────────────────────────────
function ReviewCard({
  title,
  icon,
  docsSource,
  children,
}: {
  title: string
  icon: string
  docsSource: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-slate-50/60">
        <div className="flex items-center gap-2.5">
          <span className="text-base">{icon}</span>
          <span className="text-sm font-semibold text-slate-800">{title}</span>
        </div>
        <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          from {docsSource}
        </span>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  )
}

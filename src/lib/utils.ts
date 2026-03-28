import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ApplicationStatus, DocumentStatus, LoanPurpose, QualificationResult } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, compact = false): string {
  if (compact && value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (compact && value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

export function maskSSN(ssn: string): string {
  return `***-**-${ssn.slice(-4)}`
}

export function getStatusLabel(status: ApplicationStatus): string {
  const labels: Record<ApplicationStatus, string> = {
    started: 'Started',
    'in-progress': 'In Progress',
    submitted: 'Submitted',
    processing: 'Processing',
    approved: 'Approved',
    conditional: 'Conditional Approval',
    denied: 'Denied',
    closed: 'Closed',
  }
  return labels[status] ?? status
}

export function getStatusColor(status: ApplicationStatus): string {
  const colors: Record<ApplicationStatus, string> = {
    started: 'bg-slate-100 text-slate-600',
    'in-progress': 'bg-blue-50 text-blue-700',
    submitted: 'bg-violet-50 text-violet-700',
    processing: 'bg-amber-50 text-amber-700',
    approved: 'bg-emerald-50 text-emerald-700',
    conditional: 'bg-orange-50 text-orange-700',
    denied: 'bg-red-50 text-red-700',
    closed: 'bg-slate-100 text-slate-500',
  }
  return colors[status] ?? 'bg-slate-100 text-slate-600'
}

export function getDocStatusColor(status: DocumentStatus): string {
  const colors: Record<DocumentStatus, string> = {
    pending: 'bg-slate-100 text-slate-500',
    uploaded: 'bg-blue-50 text-blue-600',
    processing: 'bg-amber-50 text-amber-600',
    verified: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-600',
  }
  return colors[status] ?? 'bg-slate-100 text-slate-500'
}

export function getLoanPurposeLabel(purpose: LoanPurpose): string {
  const labels: Record<LoanPurpose, string> = {
    purchase: 'Home Purchase',
    refinance: 'Rate & Term Refinance',
    'cash-out': 'Cash-Out Refinance',
    'pre-approval': 'Pre-Approval',
  }
  return labels[purpose] ?? purpose
}

export function getPreQualLabel(status: QualificationResult['preQualStatus']): { label: string; color: string } {
  const map = {
    strong: { label: 'Strong Pre-Qual', color: 'text-emerald-600' },
    likely: { label: 'Likely to Qualify', color: 'text-blue-600' },
    marginal: { label: 'Marginal — Needs Work', color: 'text-amber-600' },
    unlikely: { label: 'Unlikely to Qualify', color: 'text-red-600' },
    'insufficient-data': { label: 'More Info Needed', color: 'text-slate-500' },
  }
  return map[status] ?? { label: status, color: 'text-slate-500' }
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffDays > 30) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMins > 0) return `${diffMins}m ago`
  return 'Just now'
}

// Simple rule-based mock qualification engine
export function computeQuickQual(annualIncome: number, monthlyDebts: number, downPayment: number, creditScore = 720): {
  maxLoan: number
  dti: number
  monthlyPayment: number
  status: 'strong' | 'likely' | 'marginal' | 'insufficient-data'
} {
  const monthlyIncome = annualIncome / 12
  // Max DTI: 43% for conventional, frontend ratio 28%
  const maxHousingPayment = monthlyIncome * 0.28
  const maxTotalDebt = monthlyIncome * 0.43
  const availableForHousing = Math.max(0, maxTotalDebt - monthlyDebts)
  const effectiveMaxPayment = Math.min(maxHousingPayment, availableForHousing)

  // Rough loan amount from payment (30yr @ 7.25%)
  const rate = 0.0725 / 12
  const n = 360
  const maxLoan = effectiveMaxPayment * ((1 - Math.pow(1 + rate, -n)) / rate)
  const purchasePrice = maxLoan + downPayment

  const dti = ((monthlyDebts + effectiveMaxPayment) / monthlyIncome) * 100
  const monthlyPayment = effectiveMaxPayment

  let status: 'strong' | 'likely' | 'marginal' | 'insufficient-data' = 'insufficient-data'
  if (annualIncome > 0 && creditScore >= 740 && dti < 36) status = 'strong'
  else if (annualIncome > 0 && creditScore >= 680 && dti < 43) status = 'likely'
  else if (annualIncome > 0) status = 'marginal'

  return { maxLoan: Math.round(purchasePrice), dti: Math.round(dti * 10) / 10, monthlyPayment: Math.round(monthlyPayment), status }
}

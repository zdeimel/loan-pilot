// ─── Rate Pricing Engine ──────────────────────────────────────────────────────
// Deterministic rate calculation based on FICO, LTV, program, and loan term.
// In production this would call Optimal Blue or Polly. These are realistic
// spread adjustments based on published LLPA (Loan Level Price Adjustment) tables.

export type RateProgram = 'conventional' | 'fha' | 'va' | 'usda' | 'jumbo'

export interface RateInput {
  program: RateProgram
  fico: number
  ltv: number           // 0–100
  loanAmount: number
  loanTerm: 30 | 20 | 15 | 10
  propertyType?: 'single-family' | 'condo' | 'multi-unit' | 'manufactured'
  propertyUse?: 'primary' | 'secondary' | 'investment'
  state?: string
}

export interface RateOutput {
  rate: number          // APR %
  baseRate: number
  adjustments: { label: string; bps: number }[]
  monthlyPayment: number
  totalInterest: number
  apr: number
  pmi?: number          // monthly PMI amount if LTV > 80%
  mip?: number          // FHA MIP
  eligible: boolean
  ineligibleReason?: string
}

// Base rates by program (approximate 2025 market rates)
const BASE_RATES: Record<RateProgram, Record<30 | 20 | 15 | 10, number>> = {
  conventional: { 30: 6.75, 20: 6.45, 15: 6.10, 10: 5.95 },
  fha:          { 30: 6.50, 20: 6.30, 15: 6.00, 10: 5.85 },
  va:           { 30: 6.25, 20: 6.05, 15: 5.80, 10: 5.65 },
  usda:         { 30: 6.35, 20: 6.15, 15: 5.90, 10: 5.75 },
  jumbo:        { 30: 7.00, 20: 6.70, 15: 6.35, 10: 6.20 },
}

// FICO score adjustments (basis points)
function ficoAdj(fico: number, program: RateProgram): number {
  if (program === 'va' || program === 'usda') return 0 // gov programs have no FICO LLPA
  if (fico >= 780) return -25
  if (fico >= 760) return -15
  if (fico >= 740) return 0
  if (fico >= 720) return 12
  if (fico >= 700) return 25
  if (fico >= 680) return 50
  if (fico >= 660) return 75
  if (fico >= 640) return 100
  if (fico >= 620) return 150
  return 200
}

// LTV adjustments (basis points)
function ltvAdj(ltv: number, program: RateProgram): number {
  if (program === 'fha' || program === 'va' || program === 'usda') return 0
  if (ltv <= 60) return -25
  if (ltv <= 70) return 0
  if (ltv <= 75) return 12
  if (ltv <= 80) return 25
  if (ltv <= 85) return 50
  if (ltv <= 90) return 75
  if (ltv <= 95) return 100
  return 150
}

// Property type adjustments
function propTypeAdj(type: string | undefined, program: RateProgram): number {
  if (program === 'fha' || program === 'va') return 0
  if (type === 'condo') return 25
  if (type === 'multi-unit') return 50
  if (type === 'manufactured') return 75
  return 0
}

// Property use adjustments
function propUseAdj(use: string | undefined, program: RateProgram): number {
  if (program === 'fha' || program === 'va' || program === 'usda') return 0
  if (use === 'secondary') return 50
  if (use === 'investment') return 125
  return 0
}

// Loan amount adjustments (high balance / jumbo)
function loanAmtAdj(amount: number, program: RateProgram): number {
  if (program === 'jumbo') return 0
  if (amount > 766_550) return 25  // high balance conforming
  return 0
}

function calcMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  const r = annualRate / 100 / 12
  const n = termYears * 12
  if (r === 0) return principal / n
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

function calcPMI(loanAmount: number, ltv: number): number | undefined {
  if (ltv <= 80) return undefined
  // PMI typically 0.5–1.5% annually; use 0.8% for conforming
  return Math.round(loanAmount * 0.008 / 12)
}

function calcFHAMIP(loanAmount: number, ltv: number, term: number): number | undefined {
  // FHA annual MIP: 0.55% for LTV > 90% on 30-yr loans
  const annualMipRate = ltv > 90 ? 0.0055 : 0.005
  return Math.round(loanAmount * annualMipRate / 12)
}

export function calculateRate(input: RateInput): RateOutput {
  const { program, fico, ltv, loanAmount, loanTerm, propertyType, propertyUse } = input

  // Eligibility checks
  if (program === 'conventional' && fico < 620) {
    return { rate: 0, baseRate: 0, adjustments: [], monthlyPayment: 0, totalInterest: 0, apr: 0, eligible: false, ineligibleReason: 'FICO below 620 minimum for conventional loans' }
  }
  if (program === 'fha' && fico < 580) {
    return { rate: 0, baseRate: 0, adjustments: [], monthlyPayment: 0, totalInterest: 0, apr: 0, eligible: false, ineligibleReason: 'FICO below 580 minimum for FHA loans' }
  }
  if (program === 'va' && fico < 580) {
    return { rate: 0, baseRate: 0, adjustments: [], monthlyPayment: 0, totalInterest: 0, apr: 0, eligible: false, ineligibleReason: 'FICO below 580 minimum for VA loans' }
  }
  if (program === 'jumbo' && fico < 700) {
    return { rate: 0, baseRate: 0, adjustments: [], monthlyPayment: 0, totalInterest: 0, apr: 0, eligible: false, ineligibleReason: 'FICO below 700 minimum for jumbo loans' }
  }
  if (program === 'fha' && ltv > 96.5) {
    return { rate: 0, baseRate: 0, adjustments: [], monthlyPayment: 0, totalInterest: 0, apr: 0, eligible: false, ineligibleReason: 'FHA requires minimum 3.5% down payment (LTV max 96.5%)' }
  }
  if (program === 'conventional' && ltv > 97) {
    return { rate: 0, baseRate: 0, adjustments: [], monthlyPayment: 0, totalInterest: 0, apr: 0, eligible: false, ineligibleReason: 'Conventional requires minimum 3% down payment (LTV max 97%)' }
  }
  if (program === 'usda' && propertyUse !== 'primary') {
    return { rate: 0, baseRate: 0, adjustments: [], monthlyPayment: 0, totalInterest: 0, apr: 0, eligible: false, ineligibleReason: 'USDA loans are for primary residences in rural areas only' }
  }

  const baseRate = BASE_RATES[program][loanTerm]

  const adjustments: { label: string; bps: number }[] = []

  const fa = ficoAdj(fico, program)
  if (fa !== 0) adjustments.push({ label: `FICO ${fico} adjustment`, bps: fa })

  const la = ltvAdj(ltv, program)
  if (la !== 0) adjustments.push({ label: `LTV ${ltv}% adjustment`, bps: la })

  const pta = propTypeAdj(propertyType, program)
  if (pta !== 0) adjustments.push({ label: `${propertyType} property type`, bps: pta })

  const pua = propUseAdj(propertyUse, program)
  if (pua !== 0) adjustments.push({ label: `${propertyUse} use`, bps: pua })

  const laa = loanAmtAdj(loanAmount, program)
  if (laa !== 0) adjustments.push({ label: 'High balance loan', bps: laa })

  const totalBps = adjustments.reduce((sum, a) => sum + a.bps, 0)
  const rate = Math.round((baseRate + totalBps / 100) * 1000) / 1000

  const monthly = calcMonthlyPayment(loanAmount, rate, loanTerm)
  const totalInterest = monthly * loanTerm * 12 - loanAmount

  // APR includes origination fees (estimate 0.5% of loan)
  const originationFee = loanAmount * 0.005
  const aprAdjustedPrincipal = loanAmount - originationFee
  const apr = rate + 0.15 // simplified APR approximation

  const pmi = program === 'conventional' ? calcPMI(loanAmount, ltv) : undefined
  const mip = program === 'fha' ? calcFHAMIP(loanAmount, ltv, loanTerm) : undefined

  return {
    rate: Math.round(rate * 1000) / 1000,
    baseRate,
    adjustments,
    monthlyPayment: Math.round(monthly),
    totalInterest: Math.round(totalInterest),
    apr: Math.round(apr * 1000) / 1000,
    pmi,
    mip,
    eligible: true,
  }
}

// Compare multiple programs side by side
export function comparePrograms(base: Omit<RateInput, 'program'>): Record<RateProgram, RateOutput> {
  const programs: RateProgram[] = ['conventional', 'fha', 'va', 'usda', 'jumbo']
  return Object.fromEntries(
    programs.map(p => [p, calculateRate({ ...base, program: p })])
  ) as Record<RateProgram, RateOutput>
}

// ─── Credit Pull Mock ─────────────────────────────────────────────────────────
// Simulates a tri-merge credit report response. In production, this calls
// Experian Connect, TransUnion TrueVision, or Equifax Connect APIs.

export interface CreditTradeline {
  creditor: string
  accountType: 'revolving' | 'installment' | 'mortgage' | 'collection'
  balance: number
  limit?: number
  monthlyPayment: number
  utilization?: number   // % for revolving
  openDate: string
  status: 'current' | 'late-30' | 'late-60' | 'late-90' | 'charged-off' | 'collection'
  paymentHistory: string // 24-char string: C=current, 1=30d late, 2=60d, 3=90d, X=no data
}

export interface CreditInquiry {
  creditor: string
  date: string
  type: 'hard' | 'soft'
}

export interface CreditBureau {
  bureau: 'experian' | 'transunion' | 'equifax'
  fico: number
  tradelines: CreditTradeline[]
  inquiries: CreditInquiry[]
  publicRecords: { type: string; date: string; amount?: number }[]
  collections: { creditor: string; balance: number; date: string }[]
}

export interface CreditReport {
  requestId: string
  pulledAt: string
  borrowerName: string
  ssn: string // last 4 only
  bureaus: CreditBureau[]
  midScore: number            // middle of 3 scores (used for qualifying)
  representativeScore: number // same as midScore for single borrower
  totalMonthlyObligations: number
  totalRevolvingBalance: number
  totalInstallmentBalance: number
  derogatory: boolean
  bankruptcy: boolean
  foreclosure: boolean
  latePayments: number        // count in last 24 months
  revolving: { balance: number; limit: number; utilization: number }
  factors: string[]           // positive/negative score factors
}

// Deterministic mock based on seed (borrower last name hash)
function seedRandom(seed: string): () => number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  return () => {
    h ^= h << 13; h ^= h >> 17; h ^= h << 5
    return (h >>> 0) / 4294967296
  }
}

export function generateCreditReport(
  borrowerName: string,
  ssnLast4: string,
  scenario: 'excellent' | 'good' | 'fair' | 'poor' = 'good'
): CreditReport {
  const rand = seedRandom(borrowerName + ssnLast4)

  const scoreRanges = {
    excellent: [760, 820],
    good:      [700, 759],
    fair:      [640, 699],
    poor:      [580, 639],
  }

  const [scoreMin, scoreMax] = scoreRanges[scenario]
  const baseScore = Math.floor(rand() * (scoreMax - scoreMin)) + scoreMin

  const bureaus: CreditBureau[] = (
    [
      { bureau: 'experian' as const,   fico: baseScore + Math.floor(rand() * 10) - 5 },
      { bureau: 'transunion' as const, fico: baseScore + Math.floor(rand() * 10) - 5 },
      { bureau: 'equifax' as const,    fico: baseScore + Math.floor(rand() * 10) - 5 },
    ] as { bureau: CreditBureau['bureau']; fico: number }[]
  ).map(b => ({
    ...b,
    fico: Math.max(300, Math.min(850, b.fico)),
    tradelines: generateTradelines(rand, scenario),
    inquiries: generateInquiries(rand),
    publicRecords: scenario === 'poor' && rand() > 0.7 ? [{ type: 'Judgment', date: '2022-03-15', amount: 4500 }] : [],
    collections: scenario === 'poor' && rand() > 0.5 ? [{ creditor: 'Medical Collection', balance: 1200, date: '2023-01-10' }] : [],
  }))

  const scores = bureaus.map(b => b.fico).sort((a, b) => a - b)
  const midScore = scores[1]

  const allTradelines = bureaus[0].tradelines
  const revolving = allTradelines.filter(t => t.accountType === 'revolving')
  const totalRevBalance = revolving.reduce((s, t) => s + t.balance, 0)
  const totalRevLimit = revolving.reduce((s, t) => s + (t.limit ?? 0), 0)

  const factors: string[] = []
  if (midScore >= 760) factors.push('Excellent payment history', 'Low credit utilization', 'Long credit history')
  else if (midScore >= 700) factors.push('Good payment history', 'Moderate utilization', 'Established credit mix')
  else if (midScore >= 640) factors.push('Some late payments in history', 'Moderate to high utilization')
  else factors.push('Recent derogatory marks', 'High utilization', 'Limited credit history')

  return {
    requestId: `cr-${Date.now()}`,
    pulledAt: new Date().toISOString(),
    borrowerName,
    ssn: `***-**-${ssnLast4}`,
    bureaus,
    midScore,
    representativeScore: midScore,
    totalMonthlyObligations: allTradelines.reduce((s, t) => s + t.monthlyPayment, 0),
    totalRevolvingBalance: totalRevBalance,
    totalInstallmentBalance: allTradelines.filter(t => t.accountType === 'installment').reduce((s, t) => s + t.balance, 0),
    derogatory: scenario === 'poor',
    bankruptcy: false,
    foreclosure: false,
    latePayments: scenario === 'excellent' ? 0 : scenario === 'good' ? 1 : scenario === 'fair' ? 3 : 6,
    revolving: {
      balance: totalRevBalance,
      limit: totalRevLimit,
      utilization: totalRevLimit > 0 ? Math.round(totalRevBalance / totalRevLimit * 100) : 0,
    },
    factors,
  }
}

function generateTradelines(rand: () => number, scenario: string): CreditTradeline[] {
  const tradelines: CreditTradeline[] = [
    {
      creditor: 'Chase Sapphire',
      accountType: 'revolving',
      balance: Math.floor(rand() * (scenario === 'poor' ? 8000 : 3000)),
      limit: 10000,
      monthlyPayment: 150,
      openDate: '2018-04-01',
      status: 'current',
      paymentHistory: 'CCCCCCCCCCCCCCCCCCCCCCCC',
    },
    {
      creditor: 'Toyota Financial',
      accountType: 'installment',
      balance: Math.floor(rand() * 20000) + 5000,
      monthlyPayment: 450,
      openDate: '2021-08-15',
      status: 'current',
      paymentHistory: 'CCCCCCCCCCCCCCCCCCCCCCCC',
    },
    {
      creditor: 'Sallie Mae',
      accountType: 'installment',
      balance: Math.floor(rand() * 30000) + 10000,
      monthlyPayment: 285,
      openDate: '2016-09-01',
      status: scenario === 'poor' ? 'late-30' : 'current',
      paymentHistory: scenario === 'poor' ? 'CCCCCCC1CCCCCCCCCCCCCCCC' : 'CCCCCCCCCCCCCCCCCCCCCCCC',
    },
  ]
  return tradelines
}

function generateInquiries(rand: () => number): CreditInquiry[] {
  return [
    { creditor: 'LoanPilot Mortgage', date: new Date().toISOString().split('T')[0], type: 'soft' },
    { creditor: 'Capital One Auto', date: '2024-11-12', type: 'hard' },
  ]
}

// ─── AUS (Automated Underwriting System) Mock ─────────────────────────────────
// Simulates Fannie Mae Desktop Underwriter (DU) findings.
// In production this submits a MISMO 3.4 XML to Fannie Mae's API.

export type AUSRecommendation =
  | 'Approve/Eligible'
  | 'Approve/Ineligible'
  | 'Refer/Eligible'
  | 'Refer/Ineligible'
  | 'Out of Scope'

export interface AUSCondition {
  id: string
  category: 'income' | 'asset' | 'credit' | 'property' | 'compliance'
  description: string
  priorTo: 'approval' | 'docs' | 'funding'
  documentationRequired: string[]
}

export interface AUSFindings {
  requestId: string
  casefileId: string
  runAt: string
  system: 'DU' | 'LPA'
  recommendation: AUSRecommendation
  version: string
  eligible: boolean
  program: string
  riskClass: 'low' | 'moderate' | 'high'
  conditions: AUSCondition[]
  findings: {
    dtiWarning: boolean
    highLtv: boolean
    creditRisk: boolean
    incomeVerificationRequired: boolean
    appraisalRequired: boolean
    titleInsuranceRequired: boolean
  }
  messages: string[]
  reps: string[] // representations and warranties
}

export interface AUSInput {
  fico: number
  ltv: number
  dtiBack: number
  dtifront: number
  loanAmount: number
  program: 'conventional' | 'fha' | 'va' | 'usda'
  propertyUse: 'primary' | 'secondary' | 'investment'
  loanTerm: number
  selfEmployed: boolean
  bankruptcy: boolean
  foreclosure: boolean
  latePayments: number
  reserves: number // months of PITI
}

export function runAUS(input: AUSInput): AUSFindings {
  const { fico, ltv, dtiBack, dtifront, loanAmount, program, selfEmployed, bankruptcy, foreclosure, latePayments, reserves } = input

  let recommendation: AUSRecommendation
  const conditions: AUSCondition[] = []
  const messages: string[] = []
  let riskClass: 'low' | 'moderate' | 'high' = 'low'

  // Determine recommendation
  const isStrongCredit = fico >= 740 && dtiBack <= 36 && ltv <= 80 && !bankruptcy && !foreclosure && latePayments === 0
  const isGoodCredit = fico >= 680 && dtiBack <= 43 && ltv <= 95 && !bankruptcy && !foreclosure
  const isMarginal = fico >= 620 && dtiBack <= 50 && !bankruptcy

  if (bankruptcy || foreclosure) {
    recommendation = 'Refer/Ineligible'
    riskClass = 'high'
    messages.push('Bankruptcy or foreclosure in recent history requires manual underwriting.')
  } else if (isStrongCredit) {
    recommendation = 'Approve/Eligible'
    riskClass = 'low'
    messages.push('DU findings indicate this loan meets standard eligibility requirements.')
  } else if (isGoodCredit) {
    recommendation = 'Approve/Eligible'
    riskClass = 'moderate'
    messages.push('Loan approved with standard documentation requirements.')
    if (dtiBack > 36) messages.push(`Back-end DTI of ${dtiBack}% is above 36% — strong compensating factors required.`)
  } else if (isMarginal) {
    recommendation = 'Refer/Eligible'
    riskClass = 'high'
    messages.push('This loan requires manual underwriter review due to risk layering.')
    if (dtiBack > 43) messages.push(`DTI of ${dtiBack}% exceeds standard 43% threshold.`)
    if (fico < 660) messages.push('Credit score below 660 requires additional documentation.')
  } else {
    recommendation = 'Refer/Ineligible'
    riskClass = 'high'
    messages.push('Loan does not meet automated eligibility criteria.')
  }

  // Build conditions based on scenario
  if (selfEmployed) {
    conditions.push({
      id: 'cond-se-01',
      category: 'income',
      description: 'Self-employment income must be documented with 2 years of signed federal personal AND business tax returns plus YTD P&L statement.',
      priorTo: 'approval',
      documentationRequired: ['1040 (2 years)', 'Business tax returns (2 years)', 'YTD P&L', 'Business license'],
    })
    conditions.push({
      id: 'cond-se-02',
      category: 'income',
      description: 'Self-employed borrower requires 24-month average income calculation. Income trending downward 25%+ may result in use of lower year.',
      priorTo: 'approval',
      documentationRequired: ['1040 (2 years)'],
    })
  }

  if (ltv > 80 && program === 'conventional') {
    conditions.push({
      id: 'cond-pmi-01',
      category: 'compliance',
      description: 'Private Mortgage Insurance (PMI) is required for LTV above 80%. PMI certificate must be obtained prior to closing.',
      priorTo: 'docs',
      documentationRequired: ['PMI certificate'],
    })
  }

  if (program === 'fha') {
    conditions.push({
      id: 'cond-fha-01',
      category: 'compliance',
      description: 'FHA case number must be obtained and property must meet FHA Minimum Property Standards (MPS).',
      priorTo: 'approval',
      documentationRequired: ['FHA case number', 'FHA appraisal'],
    })
  }

  if (reserves < 2) {
    conditions.push({
      id: 'cond-res-01',
      category: 'asset',
      description: `Loan requires minimum 2 months PITI in verified reserves post-closing. Current reserves show ${reserves} months.`,
      priorTo: 'approval',
      documentationRequired: ['2 months bank statements'],
    })
  }

  if (latePayments > 0) {
    conditions.push({
      id: 'cond-late-01',
      category: 'credit',
      description: `${latePayments} late payment(s) in the past 24 months. Letter of explanation required.`,
      priorTo: 'approval',
      documentationRequired: ['Letter of explanation (LOE)'],
    })
  }

  // Standard conditions for all loans
  conditions.push({
    id: 'cond-std-01',
    category: 'property',
    description: 'Full appraisal required with comparable sales from past 6 months within 1-mile radius.',
    priorTo: 'approval',
    documentationRequired: ['Appraisal report'],
  })

  conditions.push({
    id: 'cond-std-02',
    category: 'compliance',
    description: 'Title insurance (lender\'s policy) required in the amount of the loan.',
    priorTo: 'docs',
    documentationRequired: ['Title commitment', 'Title insurance policy'],
  })

  conditions.push({
    id: 'cond-std-03',
    category: 'compliance',
    description: 'Homeowners insurance policy with coverage ≥ replacement cost of improvements required prior to closing.',
    priorTo: 'docs',
    documentationRequired: ['Homeowners insurance declarations page'],
  })

  return {
    requestId: `aus-${Date.now()}`,
    casefileId: `du-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    runAt: new Date().toISOString(),
    system: 'DU',
    recommendation,
    version: 'DU 11.3',
    eligible: recommendation.includes('Eligible'),
    program: program.toUpperCase(),
    riskClass,
    conditions,
    findings: {
      dtiWarning: dtiBack > 36,
      highLtv: ltv > 80,
      creditRisk: fico < 680 || latePayments > 1,
      incomeVerificationRequired: selfEmployed || dtiBack > 43,
      appraisalRequired: true,
      titleInsuranceRequired: true,
    },
    messages,
    reps: [
      'Lender warrants loan was originated in compliance with DU guidelines.',
      'Lender confirms all data entered is accurate and complete.',
      'Day-1 Certainty waivers do not apply to self-employed income.',
    ],
  }
}

// ─── Dynamic Document Checklist ───────────────────────────────────────────────
// Required documents change based on loan type, employment, and application data.
// These rules mirror actual lender checklists and Fannie Mae requirements.

export interface RequiredDoc {
  id: string
  type: string
  label: string
  description: string
  required: boolean
  expirationDays?: number // days until document expires from documentDate
  category: 'income' | 'asset' | 'identity' | 'property' | 'credit' | 'compliance'
  satisfiedBy?: string[]  // alternative doc types that satisfy this requirement
}

export interface ApplicationContext {
  employmentType?: 'employed' | 'self-employed' | 'retired' | 'unemployed'
  loanProgram?: 'conventional' | 'fha' | 'va' | 'usda' | 'jumbo'
  isRefinance?: boolean
  hasCoBorrower?: boolean
  hasGiftFunds?: boolean
  hasRentalIncome?: boolean
  hasOtherIncome?: boolean
  hasRealEstateOwned?: boolean
  selfEmployedYears?: number
  commissionPct?: number // % of income from commission
}

export function buildChecklist(ctx: ApplicationContext): RequiredDoc[] {
  const docs: RequiredDoc[] = []

  // ── Identity ──────────────────────────────────────────────────────────────
  docs.push({
    id: 'id-gov',
    type: 'id',
    label: 'Government-Issued ID',
    description: 'Driver\'s license or passport — must be current and unexpired.',
    required: true,
    expirationDays: 0, // must be valid, not expired
    category: 'identity',
  })

  // ── Income — W-2 Employment ───────────────────────────────────────────────
  if (ctx.employmentType === 'employed' || !ctx.employmentType) {
    docs.push({
      id: 'inc-paystub',
      type: 'pay-stub',
      label: 'Most Recent Pay Stubs (30 days)',
      description: 'Most recent 30 days of consecutive pay stubs showing YTD gross income.',
      required: true,
      expirationDays: 30,
      category: 'income',
    })
    docs.push({
      id: 'inc-w2',
      type: 'w2',
      label: 'W-2s (2 years)',
      description: 'W-2 forms from all employers for the past 2 years.',
      required: true,
      category: 'income',
    })
    if ((ctx.commissionPct ?? 0) >= 25) {
      docs.push({
        id: 'inc-1040-commission',
        type: 'tax-return',
        label: 'Federal Tax Returns (2 years)',
        description: 'Commission income ≥ 25% of base — full 1040 with all schedules required for 2-year average.',
        required: true,
        category: 'income',
      })
    }
  }

  // ── Income — Self-Employed ────────────────────────────────────────────────
  if (ctx.employmentType === 'self-employed') {
    docs.push({
      id: 'inc-1040-se',
      type: 'tax-return',
      label: 'Personal Tax Returns 1040 (2 years)',
      description: 'Signed federal personal tax returns with all schedules for 2 most recent years.',
      required: true,
      category: 'income',
    })
    docs.push({
      id: 'inc-biz-tax',
      type: 'tax-return',
      label: 'Business Tax Returns (2 years)',
      description: '1120S / 1065 / Schedule C for 2 most recent tax years.',
      required: true,
      category: 'income',
    })
    docs.push({
      id: 'inc-pl',
      type: 'other',
      label: 'YTD Profit & Loss Statement',
      description: 'Year-to-date P&L signed by a CPA or prepared by borrower, within 60 days of application.',
      required: true,
      expirationDays: 60,
      category: 'income',
    })
  }

  // ── Income — Rental ───────────────────────────────────────────────────────
  if (ctx.hasRentalIncome) {
    docs.push({
      id: 'inc-rental',
      type: 'tax-return',
      label: 'Schedule E (2 years)',
      description: 'Rental income must be documented via Schedule E from the past 2 tax years.',
      required: true,
      category: 'income',
    })
    docs.push({
      id: 'inc-lease',
      type: 'other',
      label: 'Current Lease Agreements',
      description: 'Executed lease agreements for all rental properties.',
      required: true,
      expirationDays: 365,
      category: 'income',
    })
  }

  // ── Income — Retired ─────────────────────────────────────────────────────
  if (ctx.employmentType === 'retired') {
    docs.push({
      id: 'inc-ssa',
      type: 'other',
      label: 'Social Security Award Letter',
      description: 'Current SSA benefit verification letter showing monthly benefit amount.',
      required: true,
      expirationDays: 60,
      category: 'income',
    })
    docs.push({
      id: 'inc-pension',
      type: 'other',
      label: 'Pension / Retirement Award Letter',
      description: 'Letter from pension plan administrator documenting monthly benefit.',
      required: false,
      category: 'income',
    })
  }

  // ── Assets ────────────────────────────────────────────────────────────────
  docs.push({
    id: 'ast-bank',
    type: 'bank-statement',
    label: 'Bank Statements (2 months)',
    description: 'Most recent 2 months of all bank, investment, and retirement account statements. All pages required.',
    required: true,
    expirationDays: 60,
    category: 'asset',
  })

  if (ctx.hasGiftFunds) {
    docs.push({
      id: 'ast-gift',
      type: 'gift-letter',
      label: 'Gift Letter',
      description: 'Signed letter from donor stating funds are a gift, not a loan. Must include donor name, relationship, amount, and property address.',
      required: true,
      category: 'asset',
    })
  }

  // ── Property ─────────────────────────────────────────────────────────────
  if (!ctx.isRefinance) {
    docs.push({
      id: 'prop-purchase',
      type: 'purchase-agreement',
      label: 'Executed Purchase Agreement',
      description: 'Fully executed sales contract with all addenda, signed by both buyer and seller.',
      required: false, // may not have an address yet
      category: 'property',
    })
  }

  if (ctx.isRefinance) {
    docs.push({
      id: 'prop-mortgage-stmt',
      type: 'mortgage-statement',
      label: 'Current Mortgage Statement',
      description: 'Most recent mortgage statement(s) for any existing liens on the subject property.',
      required: true,
      expirationDays: 30,
      category: 'property',
    })
    docs.push({
      id: 'prop-insurance',
      type: 'homeowners-insurance',
      label: 'Homeowners Insurance Declarations Page',
      description: 'Current homeowners insurance dec page showing coverage amount, policy number, and agent contact.',
      required: true,
      expirationDays: 365,
      category: 'property',
    })
  }

  if (ctx.hasRealEstateOwned) {
    docs.push({
      id: 'prop-reo-stmt',
      type: 'mortgage-statement',
      label: 'Mortgage Statements for Other Properties',
      description: 'Most recent mortgage statements for all other real estate owned.',
      required: true,
      expirationDays: 30,
      category: 'property',
    })
  }

  // ── Program-Specific ─────────────────────────────────────────────────────
  if (ctx.loanProgram === 'va') {
    docs.push({
      id: 'va-coe',
      type: 'other',
      label: 'VA Certificate of Eligibility (COE)',
      description: 'Verifies VA loan entitlement. Can be obtained through VA eBenefits or requested through lender.',
      required: true,
      category: 'compliance',
    })
    docs.push({
      id: 'va-dd214',
      type: 'other',
      label: 'DD-214 (Certificate of Release)',
      description: 'Required for veterans to verify service and discharge status.',
      required: true,
      category: 'compliance',
    })
  }

  if (ctx.loanProgram === 'usda') {
    docs.push({
      id: 'usda-rural',
      type: 'other',
      label: 'USDA Rural Eligibility Documentation',
      description: 'Property must be in an eligible rural area per USDA property eligibility map.',
      required: true,
      category: 'compliance',
    })
  }

  // ── Co-Borrower Duplication ───────────────────────────────────────────────
  if (ctx.hasCoBorrower) {
    const incomeAssetDocs = docs.filter(d => d.category === 'income' || d.id === 'id-gov')
    incomeAssetDocs.forEach(d => {
      docs.push({
        ...d,
        id: `co-${d.id}`,
        label: `Co-Borrower: ${d.label}`,
        description: `Same requirement as borrower — for co-borrower. ${d.description}`,
      })
    })
  }

  return docs
}

// Check if a document is expired based on its documentDate
export function isDocExpired(documentDate: string | undefined, expirationDays: number | undefined): boolean {
  if (!documentDate || expirationDays === undefined) return false
  if (expirationDays === 0) return false // "must be valid" — handled separately
  const docDate = new Date(documentDate)
  const expiry = new Date(docDate.getTime() + expirationDays * 24 * 60 * 60 * 1000)
  return new Date() > expiry
}

// Days until document expires
export function daysUntilExpiry(documentDate: string, expirationDays: number): number {
  const docDate = new Date(documentDate)
  const expiry = new Date(docDate.getTime() + expirationDays * 24 * 60 * 60 * 1000)
  const diff = expiry.getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

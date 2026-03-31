// ─── URLA-aligned data model for LoanPilot ───────────────────────────────────

export type LoanPurpose = 'purchase' | 'refinance' | 'cash-out' | 'pre-approval'
export type PropertyType = 'single-family' | 'condo' | 'townhouse' | 'multi-unit' | 'manufactured' | 'co-op'
export type PropertyUse = 'primary' | 'secondary' | 'investment'
export type EmploymentType = 'employed' | 'self-employed' | 'retired' | 'unemployed' | 'other'
export type MaritalStatus = 'married' | 'separated' | 'unmarried'
export type ApplicationStatus = 'started' | 'in-progress' | 'submitted' | 'processing' | 'approved' | 'conditional' | 'denied' | 'closed'
export type DocumentStatus = 'pending' | 'uploaded' | 'processing' | 'verified' | 'rejected'
export type LoanProduct = 'conventional' | 'fha' | 'va' | 'usda' | 'jumbo' | 'non-qm'
export type NonQMProgram = 'bank-statement' | 'dscr' | 'asset-depletion' | 'foreign-national'

// ─── Prior Address ────────────────────────────────────────────────────────────
export interface PriorAddress {
  address: Address
  fromDate: string
  toDate: string
}

// ─── Borrower Personal Info ───────────────────────────────────────────────────
export interface BorrowerPersonalInfo {
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  alternateName?: string
  languagePreference?: string
  email: string
  phone: string
  ssn?: string // masked XXX-XX-XXXX
  dob?: string
  maritalStatus?: MaritalStatus
  dependents?: number
  address: Address
  priorAddresses?: PriorAddress[]
  mailingAddressSame?: boolean
  mailingAddress?: Address
  citizenshipStatus?: 'us-citizen' | 'permanent-resident' | 'non-permanent-resident'
}

export interface Address {
  street: string
  unit?: string
  city: string
  state: string
  zip: string
  county?: string
  country?: string
  yearsAtAddress?: number
  monthsAtAddress?: number
  housingStatus?: 'own' | 'rent' | 'rent-free' | 'other'
  monthlyRent?: number
}

// ─── Employment & Income ──────────────────────────────────────────────────────
export interface Employment {
  id: string
  employerName: string
  employerEIN?: string
  employerPhone?: string
  employerAddress?: Address
  position: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  employmentType: EmploymentType
  monthlyIncome: number
  annualIncome: number
  selfEmployedYears?: number
  businessType?: 'sole-proprietor' | 'llc' | 's-corp' | 'c-corp' | 'partnership'
  ownershipShare?: number
}

export interface OtherIncome {
  id: string
  type: 'rental' | 'alimony' | 'child-support' | 'pension' | 'social-security' | 'disability' | 'investment' | 'trust' | 'military' | 'other'
  monthlyAmount: number
  description?: string
}

// ─── Assets ──────────────────────────────────────────────────────────────────
export interface Asset {
  id: string
  type: 'checking' | 'savings' | 'money-market' | 'cd' | 'retirement-401k' | 'retirement-ira' | 'stocks' | 'bonds' | 'mutual-funds' | 'business' | 'gift' | 'proceeds' | 'other'
  institution: string
  accountLastFour?: string
  currentValue: number
  isGift?: boolean
  giftSource?: string
}

// ─── Liabilities ─────────────────────────────────────────────────────────────
export interface Liability {
  id: string
  type: 'mortgage' | 'heloc' | 'auto-loan' | 'student-loan' | 'credit-card' | 'personal-loan' | 'medical' | 'child-support' | 'alimony' | 'other'
  creditor: string
  accountLastFour?: string
  monthlyPayment: number
  unpaidBalance: number
  monthsRemaining?: number
  willPayOff?: boolean
}

// ─── Real Estate Owned ────────────────────────────────────────────────────────
export interface RealEstateOwned {
  id: string
  address: Address
  propertyValue: number
  mortgageBalance: number
  monthlyMortgage: number
  monthlyRentalIncome?: number
  propertyType: PropertyType
  propertyUse: PropertyUse
  willSell?: boolean
  willRetain?: boolean
}

// ─── Subject Property ─────────────────────────────────────────────────────────
export interface SubjectProperty {
  address?: Address
  isAddressKnown: boolean
  estimatedValue?: number
  purchasePrice?: number
  propertyType?: PropertyType
  propertyUse?: PropertyUse
  yearBuilt?: number
  numberOfUnits?: number
}

// ─── Loan Details ─────────────────────────────────────────────────────────────
export interface LoanDetails {
  purpose: LoanPurpose
  loanAmount?: number
  downPaymentAmount?: number
  downPaymentPercent?: number
  downPaymentSource?: 'own-funds' | 'gift' | 'borrowed' | 'sale-of-asset' | 'mixed'
  giftAmount?: number
  earnestMoneyDeposit?: number
  sellerConcessions?: number
  loanProduct?: LoanProduct
  nonQMProgram?: NonQMProgram
  interestRateType?: 'fixed' | 'arm'
  loanTerm?: 30 | 20 | 15 | 10
  estimatedClosingDate?: string
}

// ─── Declarations ─────────────────────────────────────────────────────────────
export interface Declarations {
  hasOutstandingJudgments?: boolean
  isBankrupt?: boolean
  hasForeclosed?: boolean
  isPartyToLawsuit?: boolean
  hasObligatedOnFederalLoan?: boolean
  hasDelinquentFederalDebt?: boolean
  isDownPaymentBorrowed?: boolean
  isCoSignerOnDebt?: boolean
  isUSCitizen?: boolean
  isPrimaryResidence?: boolean
  hasOwnershipInterest?: boolean
  ownershipType?: 'primary-residence' | 'second-home' | 'investment-property'
  titledHow?: string
}

// ─── Demographics (HMDA) ─────────────────────────────────────────────────────
export interface Demographics {
  ethnicity?: string[]
  ethnicitySubcategories?: string[]
  race?: string[]
  raceSubcategories?: string[]
  sex?: string
  collectionMethod?: 'face-to-face' | 'telephone' | 'mail' | 'internet'
  ageAtApplication?: number
}

// ─── Full Application ─────────────────────────────────────────────────────────
export interface LoanApplication {
  id: string
  createdAt: string
  updatedAt: string
  status: ApplicationStatus
  completionPercent: number
  currentStep: string

  loanDetails: Partial<LoanDetails>
  borrower: Partial<BorrowerPersonalInfo>
  coBorrower?: Partial<BorrowerPersonalInfo>
  hasCoBorrower?: boolean

  employment: Employment[]
  previousEmployment: Employment[]
  otherIncome: OtherIncome[]

  assets: Asset[]
  liabilities: Liability[]
  realEstate: RealEstateOwned[]

  subjectProperty: Partial<SubjectProperty>
  declarations?: Partial<Declarations>
  demographics?: Partial<Demographics>

  documents: ApplicationDocument[]
  notes?: string

  // Loan Officer metadata
  loanOfficerId?: string
  assignedAt?: string
}

// ─── Documents ───────────────────────────────────────────────────────────────
export interface ApplicationDocument {
  id: string
  applicationId: string
  type: 'pay-stub' | 'w2' | 'tax-return' | 'bank-statement' | 'id' | 'insurance' |
        'purchase-agreement' | 'gift-letter' | 'mortgage-statement' | '401k-statement' |
        'homeowners-insurance' | 'other'
  name: string
  status: DocumentStatus
  uploadedAt?: string
  verifiedAt?: string
  extractedData?: Record<string, unknown>
  confidence?: number
  url?: string
  year?: string
  monthsCovered?: number
}

// ─── Loan Officer / CRM ──────────────────────────────────────────────────────
export interface LoanOfficer {
  id: string
  name: string
  email: string
  phone: string
  nmls: string
  title: string
  avatar?: string
  company: string
  branch?: string
  pipeline: LoanApplication[]
}

// ─── Qualification Result ─────────────────────────────────────────────────────
export interface QualificationResult {
  applicationId: string
  generatedAt: string
  overallScore: number // 0–100
  estimatedMaxLoan: number
  estimatedMonthlyPayment: number
  estimatedAffordabilityRange: { min: number; max: number }
  dtiRatio: number
  ltvRatio?: number
  matchedProducts: LoanProductMatch[]
  missingItems: string[]
  strengthFactors: string[]
  riskFactors: string[]
  nextActions: string[]
  preQualStatus: 'strong' | 'likely' | 'marginal' | 'unlikely' | 'insufficient-data'
}

export interface LoanProductMatch {
  product: LoanProduct
  name: string
  rate: number // estimated APR
  monthlyPayment: number
  downPaymentRequired: number
  pros: string[]
  cons: string[]
  eligibility: 'eligible' | 'likely-eligible' | 'needs-review' | 'ineligible'
}

// ─── UI Types ─────────────────────────────────────────────────────────────────
export interface ApplicationStep {
  id: string
  label: string
  description: string
  isComplete: boolean
  isActive: boolean
  isLocked?: boolean
  fields?: string[]
}

export interface Notification {
  id: string
  type: 'info' | 'warning' | 'success' | 'action-required'
  title: string
  message: string
  createdAt: string
  isRead: boolean
  applicationId?: string
  borrowerId?: string
}

// ─── Underwriting / Rules Engine Types ───────────────────────────────────────

export type ConfidenceTier = 'auto' | 'confirm' | 'review'

export interface ExtractedField {
  fieldName: string
  value: unknown
  confidence: number   // 0–1
  tier: ConfidenceTier // > 0.92 auto, 0.75–0.92 confirm, < 0.75 review
  source: string       // document id that produced this value
}

export interface DocumentExtraction {
  documentId: string
  documentType: ApplicationDocument['type']
  overallConfidence: number
  fields: ExtractedField[]
  rawText?: string
}

export interface IncomeLineItem {
  label: string
  type: 'base-salary' | 'base-hourly' | 'overtime' | 'bonus' | 'commission' |
        'piece-rate' | 'shift-differential' | 'pto' | 'holiday' | 'reimbursement' | 'other'
  amount: number
  frequency: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly' | 'annual'
  monthlyEquivalent: number
  isQualifying: boolean // false for reimbursements, mileage, etc.
  requiresHistory?: boolean // true for OT, bonus, commission
}

export interface QualifyingIncome {
  applicationId: string
  borrowerId: string
  baseMonthly: number
  variableMonthly: number // averaged over 24mo if history available
  totalQualifying: number
  lineItems: IncomeLineItem[]
  needsTaxReturns: boolean // true if commission >= 25% of total
  notes: string[]
  confidence: number
}

export interface AssetSummary {
  liquid: number           // checking + savings + money market at 100%
  retirement: number       // 401k + IRA at 60%
  totalUsable: number      // liquid + retirement for qual purposes
  reserveEligible: number  // funds that count as reserves (excl gift)
  giftFunds: number        // gift funds — cannot be reserves
  largeDeposits: { date: string; amount: number; flagged: boolean }[]
}

export interface DTIResult {
  frontEndRatio: number  // PITI / gross income
  backEndRatio: number   // all debts / gross income
  monthlyIncome: number
  monthlyHousing: number
  monthlyAllDebts: number
  byProgram: Record<string, { front: number; back: number; withinLimit: boolean }>
}

export interface ProgramEligibility {
  program: LoanProduct
  eligible: boolean
  likelyEligible: boolean
  reasons: string[]     // why eligible or not
  redFlags: string[]    // issues that may block approval
  requiredDocs: string[]
  estimatedRate?: number
  estimatedMonthlyPayment?: number
  requiredDownPayment?: number
  maxLoanAmount?: number
  dtiFrontLimit: number
  dtiBackLimit: number
  minFICO: number
}

export interface Escalation {
  id: string
  applicationId: string
  reason: string
  fieldName?: string
  confidence?: number
  createdAt: string
  resolvedAt?: string
  resolvedBy?: string
  resolution?: string
  status: 'open' | 'resolved' | 'overridden'
}

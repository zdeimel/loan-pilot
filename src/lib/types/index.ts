// ─── URLA-aligned data model for LoanPilot ───────────────────────────────────

export type LoanPurpose = 'purchase' | 'refinance' | 'cash-out' | 'pre-approval'
export type PropertyType = 'single-family' | 'condo' | 'townhouse' | 'multi-unit' | 'manufactured' | 'co-op'
export type PropertyUse = 'primary' | 'secondary' | 'investment'
export type EmploymentType = 'employed' | 'self-employed' | 'retired' | 'unemployed' | 'other'
export type MaritalStatus = 'married' | 'separated' | 'unmarried'
export type ApplicationStatus = 'started' | 'in-progress' | 'submitted' | 'processing' | 'approved' | 'conditional' | 'denied' | 'closed'
export type DocumentStatus = 'pending' | 'uploaded' | 'processing' | 'verified' | 'rejected'
export type LoanProduct = 'conventional' | 'fha' | 'va' | 'usda' | 'jumbo'

// ─── Borrower Personal Info ───────────────────────────────────────────────────
export interface BorrowerPersonalInfo {
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  email: string
  phone: string
  ssn?: string // masked
  dob?: string
  maritalStatus?: MaritalStatus
  dependents?: number
  address: Address
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
  employerAddress?: Address
  employerPhone?: string
  position: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  employmentType: EmploymentType
  monthlyIncome: number
  annualIncome: number
  selfEmployedYears?: number
  businessType?: string
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
  loanProduct?: LoanProduct
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
  ownershipType?: string
  titledHow?: string
}

// ─── Demographics (HMDA) ─────────────────────────────────────────────────────
export interface Demographics {
  ethnicity?: string[]
  race?: string[]
  sex?: string
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
  type: 'pay-stub' | 'w2' | 'tax-return' | 'bank-statement' | 'id' | 'insurance' | 'purchase-agreement' | 'gift-letter' | 'other'
  name: string
  status: DocumentStatus
  uploadedAt?: string
  verifiedAt?: string
  extractedData?: Record<string, unknown>
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

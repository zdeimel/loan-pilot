import type {
  LoanApplication,
  LoanOfficer,
  QualificationResult,
  Notification,
  ApplicationStep,
} from '@/lib/types'

// ─── Sample Borrower Applications ────────────────────────────────────────────

export const mockApplications: LoanApplication[] = [
  {
    id: 'app-001',
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-06-14T15:32:00Z',
    status: 'in-progress',
    completionPercent: 72,
    currentStep: 'assets',
    loanOfficerId: 'lo-001',

    loanDetails: {
      purpose: 'purchase',
      loanAmount: 480000,
      downPaymentAmount: 96000,
      downPaymentPercent: 20,
      loanProduct: 'conventional',
      interestRateType: 'fixed',
      loanTerm: 30,
    },

    borrower: {
      firstName: 'Sarah',
      lastName: 'Mitchell',
      email: 'sarah.mitchell@email.com',
      phone: '(919) 555-0142',
      maritalStatus: 'married',
      dependents: 2,
      address: {
        street: '4821 Creedmoor Rd',
        city: 'Raleigh',
        state: 'NC',
        zip: '27612',
        housingStatus: 'rent',
        monthlyRent: 2400,
        yearsAtAddress: 3,
      },
      citizenshipStatus: 'us-citizen',
    },

    hasCoBorrower: true,
    coBorrower: {
      firstName: 'James',
      lastName: 'Mitchell',
      email: 'james.mitchell@email.com',
      phone: '(919) 555-0198',
    },

    employment: [
      {
        id: 'emp-001',
        employerName: 'Fidelity Investments',
        position: 'Senior Financial Analyst',
        startDate: '2019-03-01',
        isCurrent: true,
        employmentType: 'employed',
        monthlyIncome: 9167,
        annualIncome: 110000,
      },
    ],
    previousEmployment: [],

    otherIncome: [],

    assets: [
      {
        id: 'ast-001',
        type: 'checking',
        institution: 'Bank of America',
        accountLastFour: '4521',
        currentValue: 42300,
      },
      {
        id: 'ast-002',
        type: 'savings',
        institution: 'Bank of America',
        accountLastFour: '8832',
        currentValue: 118500,
      },
      {
        id: 'ast-003',
        type: 'retirement-401k',
        institution: 'Fidelity',
        currentValue: 214000,
      },
    ],

    liabilities: [
      {
        id: 'lib-001',
        type: 'auto-loan',
        creditor: 'Toyota Financial',
        accountLastFour: '3391',
        monthlyPayment: 487,
        unpaidBalance: 18200,
        monthsRemaining: 38,
      },
      {
        id: 'lib-002',
        type: 'student-loan',
        creditor: 'Navient',
        monthlyPayment: 312,
        unpaidBalance: 24800,
        monthsRemaining: 84,
      },
    ],

    realEstate: [],

    subjectProperty: {
      isAddressKnown: true,
      address: {
        street: '1402 Stonehaven Dr',
        city: 'Cary',
        state: 'NC',
        zip: '27519',
      },
      purchasePrice: 576000,
      propertyType: 'single-family',
      propertyUse: 'primary',
      yearBuilt: 2016,
    },

    declarations: {
      hasOutstandingJudgments: false,
      isBankrupt: false,
      isUSCitizen: true,
      isPrimaryResidence: true,
    },

    documents: [
      {
        id: 'doc-001',
        applicationId: 'app-001',
        type: 'pay-stub',
        name: 'Pay Stub - May 2024',
        status: 'verified',
        uploadedAt: '2024-06-03T09:12:00Z',
        verifiedAt: '2024-06-03T11:40:00Z',
      },
      {
        id: 'doc-002',
        applicationId: 'app-001',
        type: 'w2',
        name: 'W-2 2023',
        status: 'verified',
        uploadedAt: '2024-06-03T09:18:00Z',
        verifiedAt: '2024-06-04T14:22:00Z',
      },
      {
        id: 'doc-003',
        applicationId: 'app-001',
        type: 'bank-statement',
        name: 'BofA Checking - April 2024',
        status: 'processing',
        uploadedAt: '2024-06-10T16:44:00Z',
      },
      {
        id: 'doc-004',
        applicationId: 'app-001',
        type: 'tax-return',
        name: '1040 - 2023',
        status: 'pending',
      },
    ],
  },
  {
    id: 'app-002',
    createdAt: '2024-05-28T08:00:00Z',
    updatedAt: '2024-06-15T09:11:00Z',
    status: 'submitted',
    completionPercent: 100,
    currentStep: 'review',
    loanOfficerId: 'lo-001',

    loanDetails: {
      purpose: 'refinance',
      loanAmount: 320000,
      loanProduct: 'conventional',
      interestRateType: 'fixed',
      loanTerm: 15,
    },

    borrower: {
      firstName: 'Marcus',
      lastName: 'Thompson',
      email: 'marcus.t@gmail.com',
      phone: '(704) 555-0277',
      maritalStatus: 'married',
      dependents: 1,
      address: {
        street: '8800 Providence Rd',
        city: 'Charlotte',
        state: 'NC',
        zip: '28277',
        housingStatus: 'own',
      },
      citizenshipStatus: 'us-citizen',
    },

    hasCoBorrower: false,

    employment: [
      {
        id: 'emp-002',
        employerName: 'Atrium Health',
        position: 'Registered Nurse',
        startDate: '2017-07-15',
        isCurrent: true,
        employmentType: 'employed',
        monthlyIncome: 7500,
        annualIncome: 90000,
      },
    ],
    previousEmployment: [],
    otherIncome: [],

    assets: [
      {
        id: 'ast-010',
        type: 'checking',
        institution: 'Wells Fargo',
        currentValue: 28900,
      },
    ],

    liabilities: [
      {
        id: 'lib-010',
        type: 'credit-card',
        creditor: 'Chase',
        monthlyPayment: 220,
        unpaidBalance: 6800,
      },
    ],

    realEstate: [
      {
        id: 're-001',
        address: {
          street: '8800 Providence Rd',
          city: 'Charlotte',
          state: 'NC',
          zip: '28277',
        },
        propertyValue: 420000,
        mortgageBalance: 320000,
        monthlyMortgage: 2180,
        propertyType: 'single-family',
        propertyUse: 'primary',
      },
    ],

    subjectProperty: {
      isAddressKnown: true,
      address: {
        street: '8800 Providence Rd',
        city: 'Charlotte',
        state: 'NC',
        zip: '28277',
      },
      estimatedValue: 420000,
      propertyType: 'single-family',
      propertyUse: 'primary',
    },

    declarations: {
      hasOutstandingJudgments: false,
      isBankrupt: false,
      isUSCitizen: true,
      isPrimaryResidence: true,
    },

    documents: [
      { id: 'doc-010', applicationId: 'app-002', type: 'pay-stub', name: 'Pay Stub - May 2024', status: 'verified', uploadedAt: '2024-06-01T10:00:00Z', verifiedAt: '2024-06-02T08:30:00Z' },
      { id: 'doc-011', applicationId: 'app-002', type: 'w2', name: 'W-2 2023', status: 'verified', uploadedAt: '2024-06-01T10:05:00Z', verifiedAt: '2024-06-02T08:45:00Z' },
      { id: 'doc-012', applicationId: 'app-002', type: 'tax-return', name: '1040 - 2023', status: 'verified', uploadedAt: '2024-06-01T10:10:00Z', verifiedAt: '2024-06-03T14:00:00Z' },
      { id: 'doc-013', applicationId: 'app-002', type: 'bank-statement', name: 'Wells Fargo - May 2024', status: 'verified', uploadedAt: '2024-06-05T11:30:00Z', verifiedAt: '2024-06-06T09:00:00Z' },
    ],
  },
  {
    id: 'app-003',
    createdAt: '2024-06-10T14:00:00Z',
    updatedAt: '2024-06-12T10:20:00Z',
    status: 'started',
    completionPercent: 28,
    currentStep: 'employment',
    loanOfficerId: 'lo-001',

    loanDetails: {
      purpose: 'pre-approval',
      loanProduct: 'fha',
    },

    borrower: {
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'priya.patel@outlook.com',
      phone: '(919) 555-0388',
      maritalStatus: 'unmarried',
      dependents: 0,
      address: {
        street: '3312 Wake Forest Rd',
        city: 'Raleigh',
        state: 'NC',
        zip: '27609',
        housingStatus: 'rent',
        monthlyRent: 1750,
      },
      citizenshipStatus: 'us-citizen',
    },

    hasCoBorrower: false,
    employment: [],
    previousEmployment: [],
    otherIncome: [],
    assets: [],
    liabilities: [],
    realEstate: [],

    subjectProperty: { isAddressKnown: false },

    documents: [
      { id: 'doc-020', applicationId: 'app-003', type: 'id', name: 'Driver\'s License', status: 'uploaded', uploadedAt: '2024-06-11T09:00:00Z' },
    ],
  },
]

// ─── Loan Officer ─────────────────────────────────────────────────────────────

export const mockLoanOfficer: LoanOfficer = {
  id: 'lo-001',
  name: 'David Chen',
  email: 'david.chen@loanpilot.com',
  phone: '(919) 555-0100',
  nmls: '1234567',
  title: 'Senior Loan Officer',
  company: 'LoanPilot Mortgage',
  branch: 'Raleigh, NC',
  pipeline: mockApplications,
}

// ─── Qualification Results ────────────────────────────────────────────────────

export const mockQualificationResult: QualificationResult = {
  applicationId: 'app-001',
  generatedAt: '2024-06-14T15:00:00Z',
  overallScore: 82,
  estimatedMaxLoan: 540000,
  estimatedMonthlyPayment: 2847,
  estimatedAffordabilityRange: { min: 380000, max: 580000 },
  dtiRatio: 28.4,
  ltvRatio: 83.3,
  preQualStatus: 'strong',

  matchedProducts: [
    {
      product: 'conventional',
      name: 'Conventional 30-Year Fixed',
      rate: 7.125,
      monthlyPayment: 2847,
      downPaymentRequired: 96000,
      pros: ['No mortgage insurance with 20% down', 'Competitive rates with strong credit', 'Most flexible property types'],
      cons: ['Higher credit score requirements', 'Stricter DTI limits'],
      eligibility: 'eligible',
    },
    {
      product: 'conventional',
      name: 'Conventional 15-Year Fixed',
      rate: 6.625,
      monthlyPayment: 3890,
      downPaymentRequired: 96000,
      pros: ['Lower total interest paid', 'Build equity faster', 'Lower rate'],
      cons: ['Higher monthly payment', 'Less flexibility in budget'],
      eligibility: 'eligible',
    },
    {
      product: 'fha',
      name: 'FHA 30-Year Fixed',
      rate: 6.875,
      monthlyPayment: 2944,
      downPaymentRequired: 28800,
      pros: ['Lower down payment option (3.5%)', 'More flexible credit requirements'],
      cons: ['Mortgage insurance required for life of loan', 'Loan limits apply'],
      eligibility: 'likely-eligible',
    },
  ],

  missingItems: [
    '2022 tax return (2 years required for self-employment verification)',
    'Bank statements for last 60 days (only 30 days on file)',
    'Gift letter for down payment funds if any portion is a gift',
  ],

  strengthFactors: [
    'Strong W-2 employment history (5+ years with same employer)',
    'Excellent credit indicators — no derogatory marks',
    'Significant retirement assets ($214K) provide reserve buffer',
    '20% down payment eliminates PMI requirement',
  ],

  riskFactors: [
    'Co-borrower income not yet documented',
    'DTI slightly elevated — student loan payments are a factor',
    'Bank statement upload still pending verification',
  ],

  nextActions: [
    'Upload 2022 and 2023 tax returns',
    'Upload 60-day bank statements for all accounts',
    'Complete co-borrower income and employment section',
    'Review and sign disclosure documents',
  ],
}

// ─── Application Steps ────────────────────────────────────────────────────────

export const applicationSteps: ApplicationStep[] = [
  { id: 'document-upload', label: 'Upload Documents', description: 'Drop your docs — we\'ll fill the rest', isComplete: false, isActive: true },
  { id: 'loan-goal', label: 'Loan Goal', description: 'What are you looking to do?', isComplete: false, isActive: false },
  { id: 'personal-info', label: 'Personal Info', description: 'Tell us about yourself', isComplete: false, isActive: false },
  { id: 'co-borrower', label: 'Co-Borrower', description: 'Will anyone else be on the loan?', isComplete: false, isActive: false },
  { id: 'employment', label: 'Employment', description: 'Your job and income', isComplete: false, isActive: false },
  { id: 'other-income', label: 'Other Income', description: 'Additional income sources', isComplete: false, isActive: false },
  { id: 'assets', label: 'Assets', description: 'Bank accounts & savings', isComplete: false, isActive: false },
  { id: 'liabilities', label: 'Debts', description: 'Monthly obligations', isComplete: false, isActive: false },
  { id: 'real-estate', label: 'Real Estate', description: 'Properties you own', isComplete: false, isActive: false },
  { id: 'property', label: 'Property', description: 'The home you want to buy', isComplete: false, isActive: false },
  { id: 'down-payment', label: 'Down Payment', description: 'Funds to close', isComplete: false, isActive: false },
  { id: 'declarations', label: 'Declarations', description: 'A few yes/no questions', isComplete: false, isActive: false },
  { id: 'review', label: 'Review', description: 'Confirm and submit', isComplete: false, isActive: false, isLocked: true },
]

export const orderedStepIds = applicationSteps.map((s) => s.id)

// ─── Notifications ────────────────────────────────────────────────────────────

export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'action-required',
    title: 'Documents needed',
    message: 'Sarah Mitchell needs to upload 2 more documents to complete her file.',
    createdAt: '2024-06-14T12:00:00Z',
    isRead: false,
    applicationId: 'app-001',
  },
  {
    id: 'notif-002',
    type: 'success',
    title: 'Application submitted',
    message: 'Marcus Thompson\'s refinance application has been submitted for review.',
    createdAt: '2024-06-13T09:11:00Z',
    isRead: false,
    applicationId: 'app-002',
  },
  {
    id: 'notif-003',
    type: 'info',
    title: 'New application started',
    message: 'Priya Patel started a new pre-approval application.',
    createdAt: '2024-06-10T14:05:00Z',
    isRead: true,
    applicationId: 'app-003',
  },
]

// ─── Pipeline Stats ───────────────────────────────────────────────────────────

export const pipelineStats = {
  total: 3,
  inProgress: 1,
  submitted: 1,
  approved: 0,
  totalLoanVolume: 1220000,
  avgCompletionRate: 67,
  monthlyApplications: [
    { month: 'Jan', count: 4 },
    { month: 'Feb', count: 6 },
    { month: 'Mar', count: 5 },
    { month: 'Apr', count: 8 },
    { month: 'May', count: 7 },
    { month: 'Jun', count: 3 },
  ],
  loanProductMix: [
    { name: 'Conventional', value: 62 },
    { name: 'FHA', value: 24 },
    { name: 'VA', value: 10 },
    { name: 'USDA', value: 4 },
  ],
}

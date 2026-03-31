import type {
  LoanApplication,
  LoanOfficer,
  QualificationResult,
  Notification,
  ApplicationStep,
} from '@/lib/types'

// ─── Sample Borrower Applications ────────────────────────────────────────────

export const mockApplications: LoanApplication[] = [
  // app-001: In-Progress purchase, Conventional 30yr, Raleigh NC
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
      { id: 'ast-001', type: 'checking', institution: 'Bank of America', accountLastFour: '4521', currentValue: 42300 },
      { id: 'ast-002', type: 'savings', institution: 'Bank of America', accountLastFour: '8832', currentValue: 118500 },
      { id: 'ast-003', type: 'retirement-401k', institution: 'Fidelity', currentValue: 214000 },
    ],

    liabilities: [
      { id: 'lib-001', type: 'auto-loan', creditor: 'Toyota Financial', accountLastFour: '3391', monthlyPayment: 487, unpaidBalance: 18200, monthsRemaining: 38 },
      { id: 'lib-002', type: 'student-loan', creditor: 'Navient', monthlyPayment: 312, unpaidBalance: 24800, monthsRemaining: 84 },
    ],

    realEstate: [],

    subjectProperty: {
      isAddressKnown: true,
      address: { street: '1402 Stonehaven Dr', city: 'Cary', state: 'NC', zip: '27519' },
      purchasePrice: 576000,
      propertyType: 'single-family',
      propertyUse: 'primary',
      yearBuilt: 2016,
    },

    declarations: { hasOutstandingJudgments: false, isBankrupt: false, isUSCitizen: true, isPrimaryResidence: true },

    documents: [
      { id: 'doc-001', applicationId: 'app-001', type: 'pay-stub', name: 'Pay Stub - May 2024', status: 'verified', uploadedAt: '2024-06-03T09:12:00Z', verifiedAt: '2024-06-03T11:40:00Z' },
      { id: 'doc-002', applicationId: 'app-001', type: 'w2', name: 'W-2 2023', status: 'verified', uploadedAt: '2024-06-03T09:18:00Z', verifiedAt: '2024-06-04T14:22:00Z' },
      { id: 'doc-003', applicationId: 'app-001', type: 'bank-statement', name: 'BofA Checking - April 2024', status: 'processing', uploadedAt: '2024-06-10T16:44:00Z' },
      { id: 'doc-004', applicationId: 'app-001', type: 'tax-return', name: '1040 - 2023', status: 'pending' },
    ],
  },

  // app-002: Submitted refi, Conventional 15yr, Charlotte NC
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

    assets: [{ id: 'ast-010', type: 'checking', institution: 'Wells Fargo', currentValue: 28900 }],

    liabilities: [
      { id: 'lib-010', type: 'credit-card', creditor: 'Chase', monthlyPayment: 220, unpaidBalance: 6800 },
    ],

    realEstate: [
      {
        id: 're-001',
        address: { street: '8800 Providence Rd', city: 'Charlotte', state: 'NC', zip: '28277' },
        propertyValue: 420000,
        mortgageBalance: 320000,
        monthlyMortgage: 2180,
        propertyType: 'single-family',
        propertyUse: 'primary',
      },
    ],

    subjectProperty: {
      isAddressKnown: true,
      address: { street: '8800 Providence Rd', city: 'Charlotte', state: 'NC', zip: '28277' },
      estimatedValue: 420000,
      propertyType: 'single-family',
      propertyUse: 'primary',
    },

    declarations: { hasOutstandingJudgments: false, isBankrupt: false, isUSCitizen: true, isPrimaryResidence: true },

    documents: [
      { id: 'doc-010', applicationId: 'app-002', type: 'pay-stub', name: 'Pay Stub - May 2024', status: 'verified', uploadedAt: '2024-06-01T10:00:00Z', verifiedAt: '2024-06-02T08:30:00Z' },
      { id: 'doc-011', applicationId: 'app-002', type: 'w2', name: 'W-2 2023', status: 'verified', uploadedAt: '2024-06-01T10:05:00Z', verifiedAt: '2024-06-02T08:45:00Z' },
      { id: 'doc-012', applicationId: 'app-002', type: 'tax-return', name: '1040 - 2023', status: 'verified', uploadedAt: '2024-06-01T10:10:00Z', verifiedAt: '2024-06-03T14:00:00Z' },
      { id: 'doc-013', applicationId: 'app-002', type: 'bank-statement', name: 'Wells Fargo - May 2024', status: 'verified', uploadedAt: '2024-06-05T11:30:00Z', verifiedAt: '2024-06-06T09:00:00Z' },
    ],
  },

  // app-003: Started pre-approval, FHA, Raleigh NC
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
      { id: 'doc-020', applicationId: 'app-003', type: 'id', name: "Driver's License", status: 'uploaded', uploadedAt: '2024-06-11T09:00:00Z' },
    ],
  },

  // app-004: Processing, VA purchase, Durham NC — veteran borrower
  {
    id: 'app-004',
    createdAt: '2024-05-15T09:30:00Z',
    updatedAt: '2024-06-16T11:45:00Z',
    status: 'processing',
    completionPercent: 100,
    currentStep: 'review',
    loanOfficerId: 'lo-001',

    loanDetails: {
      purpose: 'purchase',
      loanAmount: 415000,
      downPaymentAmount: 0,
      downPaymentPercent: 0,
      loanProduct: 'va',
      interestRateType: 'fixed',
      loanTerm: 30,
    },

    borrower: {
      firstName: 'Derek',
      lastName: 'Okonkwo',
      email: 'derek.okonkwo@gmail.com',
      phone: '(919) 555-0461',
      maritalStatus: 'married',
      dependents: 3,
      address: {
        street: '711 Hillsborough Rd',
        city: 'Durham',
        state: 'NC',
        zip: '27705',
        housingStatus: 'rent',
        monthlyRent: 1900,
        yearsAtAddress: 2,
      },
      citizenshipStatus: 'us-citizen',
    },

    hasCoBorrower: true,
    coBorrower: {
      firstName: 'Angela',
      lastName: 'Okonkwo',
      email: 'angela.okonkwo@gmail.com',
      phone: '(919) 555-0462',
    },

    employment: [
      {
        id: 'emp-004',
        employerName: 'US Army (Active Duty)',
        position: 'Staff Sergeant E-6',
        startDate: '2012-03-01',
        isCurrent: true,
        employmentType: 'military',
        monthlyIncome: 5800,
        annualIncome: 69600,
      },
    ],
    previousEmployment: [],
    otherIncome: [
      { id: 'oi-004', type: 'bah', description: 'Basic Allowance for Housing', monthlyAmount: 1820 },
    ],

    assets: [
      { id: 'ast-040', type: 'checking', institution: 'USAA', accountLastFour: '7713', currentValue: 22400 },
      { id: 'ast-041', type: 'savings', institution: 'USAA', accountLastFour: '7714', currentValue: 18600 },
      { id: 'ast-042', type: 'retirement-tsp', institution: 'Thrift Savings Plan', currentValue: 88000 },
    ],

    liabilities: [
      { id: 'lib-040', type: 'auto-loan', creditor: 'USAA Auto', monthlyPayment: 392, unpaidBalance: 14200, monthsRemaining: 36 },
      { id: 'lib-041', type: 'credit-card', creditor: 'USAA Visa', monthlyPayment: 95, unpaidBalance: 2100 },
    ],

    realEstate: [],

    subjectProperty: {
      isAddressKnown: true,
      address: { street: '2204 Hope Valley Rd', city: 'Durham', state: 'NC', zip: '27707' },
      purchasePrice: 415000,
      propertyType: 'single-family',
      propertyUse: 'primary',
      yearBuilt: 2003,
    },

    declarations: { hasOutstandingJudgments: false, isBankrupt: false, isUSCitizen: true, isPrimaryResidence: true },

    documents: [
      { id: 'doc-040', applicationId: 'app-004', type: 'pay-stub', name: 'LES - May 2024', status: 'verified', uploadedAt: '2024-05-20T08:00:00Z', verifiedAt: '2024-05-21T10:00:00Z' },
      { id: 'doc-041', applicationId: 'app-004', type: 'coe', name: 'Certificate of Eligibility', status: 'verified', uploadedAt: '2024-05-20T08:05:00Z', verifiedAt: '2024-05-21T10:15:00Z' },
      { id: 'doc-042', applicationId: 'app-004', type: 'dd214', name: 'DD-214', status: 'verified', uploadedAt: '2024-05-20T08:10:00Z', verifiedAt: '2024-05-22T09:00:00Z' },
      { id: 'doc-043', applicationId: 'app-004', type: 'bank-statement', name: 'USAA - April 2024', status: 'verified', uploadedAt: '2024-05-25T14:30:00Z', verifiedAt: '2024-05-26T11:00:00Z' },
      { id: 'doc-044', applicationId: 'app-004', type: 'bank-statement', name: 'USAA - May 2024', status: 'verified', uploadedAt: '2024-06-05T09:00:00Z', verifiedAt: '2024-06-06T10:00:00Z' },
    ],
  },

  // app-005: Conditional approval, Conventional, Jumbo purchase, Chapel Hill NC
  {
    id: 'app-005',
    createdAt: '2024-04-20T11:00:00Z',
    updatedAt: '2024-06-17T14:20:00Z',
    status: 'conditional',
    completionPercent: 100,
    currentStep: 'review',
    loanOfficerId: 'lo-001',

    loanDetails: {
      purpose: 'purchase',
      loanAmount: 1250000,
      downPaymentAmount: 312500,
      downPaymentPercent: 20,
      loanProduct: 'jumbo',
      interestRateType: 'fixed',
      loanTerm: 30,
    },

    borrower: {
      firstName: 'Katherine',
      lastName: 'Harrington',
      email: 'kharrington@legacylaw.com',
      phone: '(919) 555-0582',
      maritalStatus: 'married',
      dependents: 1,
      address: {
        street: '14 Old Mason Farm Rd',
        city: 'Chapel Hill',
        state: 'NC',
        zip: '27514',
        housingStatus: 'own',
      },
      citizenshipStatus: 'us-citizen',
    },

    hasCoBorrower: true,
    coBorrower: {
      firstName: 'William',
      lastName: 'Harrington',
      email: 'w.harrington@unc.edu',
      phone: '(919) 555-0583',
    },

    employment: [
      {
        id: 'emp-005',
        employerName: 'Legacy Law Group',
        position: 'Managing Partner',
        startDate: '2011-01-15',
        isCurrent: true,
        employmentType: 'self-employed',
        monthlyIncome: 33333,
        annualIncome: 400000,
      },
    ],
    previousEmployment: [],
    otherIncome: [
      { id: 'oi-005', type: 'rental', description: 'Rental income - investment property', monthlyAmount: 3200 },
    ],

    assets: [
      { id: 'ast-050', type: 'checking', institution: 'First Citizens Bank', accountLastFour: '2210', currentValue: 185000 },
      { id: 'ast-051', type: 'savings', institution: 'First Citizens Bank', accountLastFour: '2211', currentValue: 420000 },
      { id: 'ast-052', type: 'retirement-401k', institution: 'Fidelity', currentValue: 1100000 },
      { id: 'ast-053', type: 'brokerage', institution: 'Schwab', currentValue: 680000 },
    ],

    liabilities: [
      { id: 'lib-050', type: 'mortgage', creditor: 'First Citizens', monthlyPayment: 1840, unpaidBalance: 310000, monthsRemaining: 180 },
      { id: 'lib-051', type: 'auto-loan', creditor: 'BMW Financial', monthlyPayment: 1120, unpaidBalance: 62000, monthsRemaining: 55 },
    ],

    realEstate: [
      {
        id: 're-005a',
        address: { street: '14 Old Mason Farm Rd', city: 'Chapel Hill', state: 'NC', zip: '27514' },
        propertyValue: 780000,
        mortgageBalance: 310000,
        monthlyMortgage: 1840,
        propertyType: 'single-family',
        propertyUse: 'primary',
      },
      {
        id: 're-005b',
        address: { street: '3100 Kildaire Farm Rd', city: 'Cary', state: 'NC', zip: '27518' },
        propertyValue: 520000,
        mortgageBalance: 0,
        monthlyMortgage: 0,
        monthlyRentalIncome: 3200,
        propertyType: 'single-family',
        propertyUse: 'investment',
      },
    ],

    subjectProperty: {
      isAddressKnown: true,
      address: { street: '501 Governors Dr', city: 'Chapel Hill', state: 'NC', zip: '27517' },
      purchasePrice: 1562500,
      propertyType: 'single-family',
      propertyUse: 'primary',
      yearBuilt: 2019,
    },

    declarations: { hasOutstandingJudgments: false, isBankrupt: false, isUSCitizen: true, isPrimaryResidence: true },

    documents: [
      { id: 'doc-050', applicationId: 'app-005', type: 'pay-stub', name: 'K-1 2023', status: 'verified', uploadedAt: '2024-04-25T09:00:00Z', verifiedAt: '2024-04-26T14:00:00Z' },
      { id: 'doc-051', applicationId: 'app-005', type: 'tax-return', name: '1040 - 2023', status: 'verified', uploadedAt: '2024-04-25T09:05:00Z', verifiedAt: '2024-04-27T11:00:00Z' },
      { id: 'doc-052', applicationId: 'app-005', type: 'tax-return', name: '1040 - 2022', status: 'verified', uploadedAt: '2024-04-25T09:10:00Z', verifiedAt: '2024-04-27T11:30:00Z' },
      { id: 'doc-053', applicationId: 'app-005', type: 'business-return', name: '1120-S - 2023', status: 'verified', uploadedAt: '2024-04-25T09:15:00Z', verifiedAt: '2024-04-28T10:00:00Z' },
      { id: 'doc-054', applicationId: 'app-005', type: 'bank-statement', name: 'First Citizens - Apr 2024', status: 'verified', uploadedAt: '2024-05-02T08:00:00Z', verifiedAt: '2024-05-03T09:00:00Z' },
      { id: 'doc-055', applicationId: 'app-005', type: 'purchase-agreement', name: 'Executed Purchase Agreement', status: 'received', uploadedAt: '2024-06-10T16:00:00Z' },
      { id: 'doc-056', applicationId: 'app-005', type: 'gift-letter', name: 'Gift Letter - Down Payment Portion', status: 'pending' },
    ],
  },

  // app-006: Approved (clear to close), FHA purchase, Greensboro NC — first-time buyer
  {
    id: 'app-006',
    createdAt: '2024-04-10T10:00:00Z',
    updatedAt: '2024-06-18T16:00:00Z',
    status: 'approved',
    completionPercent: 100,
    currentStep: 'review',
    loanOfficerId: 'lo-001',

    loanDetails: {
      purpose: 'purchase',
      loanAmount: 218000,
      downPaymentAmount: 7630,
      downPaymentPercent: 3.5,
      loanProduct: 'fha',
      interestRateType: 'fixed',
      loanTerm: 30,
    },

    borrower: {
      firstName: 'Jasmine',
      lastName: 'Rivera',
      email: 'jasmine.rivera@gmail.com',
      phone: '(336) 555-0612',
      maritalStatus: 'unmarried',
      dependents: 1,
      address: {
        street: '1800 Summit Ave',
        city: 'Greensboro',
        state: 'NC',
        zip: '27405',
        housingStatus: 'rent',
        monthlyRent: 1200,
        yearsAtAddress: 4,
      },
      citizenshipStatus: 'us-citizen',
    },

    hasCoBorrower: false,
    employment: [
      {
        id: 'emp-006',
        employerName: 'Cone Health',
        position: 'Medical Assistant',
        startDate: '2020-09-01',
        isCurrent: true,
        employmentType: 'employed',
        monthlyIncome: 3917,
        annualIncome: 47000,
      },
    ],
    previousEmployment: [
      {
        id: 'prev-006',
        employerName: 'CVS Pharmacy',
        position: 'Pharmacy Tech',
        startDate: '2018-06-01',
        endDate: '2020-08-31',
        isCurrent: false,
        employmentType: 'employed',
        monthlyIncome: 2833,
        annualIncome: 34000,
      },
    ],
    otherIncome: [],

    assets: [
      { id: 'ast-060', type: 'checking', institution: 'Truist', accountLastFour: '9901', currentValue: 11200 },
      { id: 'ast-061', type: 'savings', institution: 'Truist', accountLastFour: '9902', currentValue: 8400 },
    ],

    liabilities: [
      { id: 'lib-060', type: 'auto-loan', creditor: 'Santander Auto', monthlyPayment: 312, unpaidBalance: 9800, monthsRemaining: 31 },
      { id: 'lib-061', type: 'student-loan', creditor: 'Federal Student Aid', monthlyPayment: 185, unpaidBalance: 18400, monthsRemaining: 108 },
    ],

    realEstate: [],

    subjectProperty: {
      isAddressKnown: true,
      address: { street: '4411 W Wendover Ave', city: 'Greensboro', state: 'NC', zip: '27407' },
      purchasePrice: 225630,
      propertyType: 'single-family',
      propertyUse: 'primary',
      yearBuilt: 1998,
    },

    declarations: { hasOutstandingJudgments: false, isBankrupt: false, isUSCitizen: true, isPrimaryResidence: true },

    documents: [
      { id: 'doc-060', applicationId: 'app-006', type: 'pay-stub', name: 'Pay Stub - May 2024', status: 'verified', uploadedAt: '2024-04-15T08:00:00Z', verifiedAt: '2024-04-16T09:00:00Z' },
      { id: 'doc-061', applicationId: 'app-006', type: 'w2', name: 'W-2 2023', status: 'verified', uploadedAt: '2024-04-15T08:05:00Z', verifiedAt: '2024-04-16T09:15:00Z' },
      { id: 'doc-062', applicationId: 'app-006', type: 'w2', name: 'W-2 2022', status: 'verified', uploadedAt: '2024-04-15T08:10:00Z', verifiedAt: '2024-04-16T09:30:00Z' },
      { id: 'doc-063', applicationId: 'app-006', type: 'bank-statement', name: 'Truist - Apr 2024', status: 'verified', uploadedAt: '2024-04-20T10:00:00Z', verifiedAt: '2024-04-21T11:00:00Z' },
      { id: 'doc-064', applicationId: 'app-006', type: 'bank-statement', name: 'Truist - May 2024', status: 'verified', uploadedAt: '2024-06-05T08:00:00Z', verifiedAt: '2024-06-06T09:00:00Z' },
      { id: 'doc-065', applicationId: 'app-006', type: 'purchase-agreement', name: 'Purchase Agreement', status: 'verified', uploadedAt: '2024-05-18T14:00:00Z', verifiedAt: '2024-05-19T10:00:00Z' },
      { id: 'doc-066', applicationId: 'app-006', type: 'tax-return', name: '1040 - 2023', status: 'verified', uploadedAt: '2024-04-22T09:00:00Z', verifiedAt: '2024-04-23T10:00:00Z' },
    ],
  },

  // app-007: Closed, Conventional cash-out refi, Apex NC
  {
    id: 'app-007',
    createdAt: '2024-03-01T09:00:00Z',
    updatedAt: '2024-05-30T15:00:00Z',
    status: 'closed',
    completionPercent: 100,
    currentStep: 'review',
    loanOfficerId: 'lo-001',

    loanDetails: {
      purpose: 'cash-out',
      loanAmount: 540000,
      loanProduct: 'conventional',
      interestRateType: 'fixed',
      loanTerm: 30,
    },

    borrower: {
      firstName: 'Robert',
      lastName: 'Faulkner',
      email: 'rfaulkner@techcorp.io',
      phone: '(919) 555-0714',
      maritalStatus: 'married',
      dependents: 2,
      address: {
        street: '220 Old Raleigh Rd',
        city: 'Apex',
        state: 'NC',
        zip: '27502',
        housingStatus: 'own',
      },
      citizenshipStatus: 'us-citizen',
    },

    hasCoBorrower: true,
    coBorrower: {
      firstName: 'Linda',
      lastName: 'Faulkner',
      email: 'l.faulkner@gmail.com',
      phone: '(919) 555-0715',
    },

    employment: [
      {
        id: 'emp-007',
        employerName: 'TechCorp Solutions',
        position: 'VP of Engineering',
        startDate: '2016-04-01',
        isCurrent: true,
        employmentType: 'employed',
        monthlyIncome: 18750,
        annualIncome: 225000,
      },
    ],
    previousEmployment: [],
    otherIncome: [
      { id: 'oi-007', type: 'investment', description: 'Dividend income', monthlyAmount: 1200 },
    ],

    assets: [
      { id: 'ast-070', type: 'checking', institution: 'PNC Bank', accountLastFour: '3344', currentValue: 68000 },
      { id: 'ast-071', type: 'savings', institution: 'PNC Bank', accountLastFour: '3345', currentValue: 142000 },
      { id: 'ast-072', type: 'retirement-401k', institution: 'Vanguard', currentValue: 490000 },
      { id: 'ast-073', type: 'brokerage', institution: 'Schwab', currentValue: 275000 },
    ],

    liabilities: [
      { id: 'lib-070', type: 'credit-card', creditor: 'Amex', monthlyPayment: 450, unpaidBalance: 12400 },
    ],

    realEstate: [
      {
        id: 're-007',
        address: { street: '220 Old Raleigh Rd', city: 'Apex', state: 'NC', zip: '27502' },
        propertyValue: 780000,
        mortgageBalance: 390000,
        monthlyMortgage: 2640,
        propertyType: 'single-family',
        propertyUse: 'primary',
      },
    ],

    subjectProperty: {
      isAddressKnown: true,
      address: { street: '220 Old Raleigh Rd', city: 'Apex', state: 'NC', zip: '27502' },
      estimatedValue: 780000,
      propertyType: 'single-family',
      propertyUse: 'primary',
    },

    declarations: { hasOutstandingJudgments: false, isBankrupt: false, isUSCitizen: true, isPrimaryResidence: true },

    documents: [
      { id: 'doc-070', applicationId: 'app-007', type: 'pay-stub', name: 'Pay Stub - Apr 2024', status: 'verified', uploadedAt: '2024-03-05T08:00:00Z', verifiedAt: '2024-03-06T09:00:00Z' },
      { id: 'doc-071', applicationId: 'app-007', type: 'w2', name: 'W-2 2023', status: 'verified', uploadedAt: '2024-03-05T08:05:00Z', verifiedAt: '2024-03-06T09:30:00Z' },
      { id: 'doc-072', applicationId: 'app-007', type: 'tax-return', name: '1040 - 2023', status: 'verified', uploadedAt: '2024-03-05T08:10:00Z', verifiedAt: '2024-03-07T10:00:00Z' },
      { id: 'doc-073', applicationId: 'app-007', type: 'appraisal', name: 'Appraisal Report', status: 'verified', uploadedAt: '2024-04-15T09:00:00Z', verifiedAt: '2024-04-20T14:00:00Z' },
    ],
  },

  // app-008: Denied, Conventional, Wilmington NC — high DTI
  {
    id: 'app-008',
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-06-05T13:30:00Z',
    status: 'denied',
    completionPercent: 100,
    currentStep: 'review',
    loanOfficerId: 'lo-001',

    loanDetails: {
      purpose: 'purchase',
      loanAmount: 395000,
      downPaymentAmount: 19750,
      downPaymentPercent: 5,
      loanProduct: 'conventional',
      interestRateType: 'fixed',
      loanTerm: 30,
    },

    borrower: {
      firstName: 'Brian',
      lastName: 'Kowalski',
      email: 'brian.k@outlook.com',
      phone: '(910) 555-0821',
      maritalStatus: 'unmarried',
      dependents: 0,
      address: {
        street: '5610 Market St',
        city: 'Wilmington',
        state: 'NC',
        zip: '28405',
        housingStatus: 'rent',
        monthlyRent: 1650,
        yearsAtAddress: 1,
      },
      citizenshipStatus: 'us-citizen',
    },

    hasCoBorrower: false,
    employment: [
      {
        id: 'emp-008',
        employerName: 'Cape Fear Contractors',
        position: 'Project Manager',
        startDate: '2022-11-01',
        isCurrent: true,
        employmentType: 'employed',
        monthlyIncome: 5833,
        annualIncome: 70000,
      },
    ],
    previousEmployment: [],
    otherIncome: [],

    assets: [
      { id: 'ast-080', type: 'checking', institution: 'BB&T', accountLastFour: '5512', currentValue: 9200 },
    ],

    liabilities: [
      { id: 'lib-080', type: 'auto-loan', creditor: 'Ford Motor Credit', monthlyPayment: 618, unpaidBalance: 31400, monthsRemaining: 50 },
      { id: 'lib-081', type: 'student-loan', creditor: 'Nelnet', monthlyPayment: 490, unpaidBalance: 58000, monthsRemaining: 120 },
      { id: 'lib-082', type: 'credit-card', creditor: 'Capital One', monthlyPayment: 280, unpaidBalance: 9400 },
      { id: 'lib-083', type: 'credit-card', creditor: 'Discover', monthlyPayment: 195, unpaidBalance: 6200 },
      { id: 'lib-084', type: 'personal-loan', creditor: 'LightStream', monthlyPayment: 310, unpaidBalance: 14200, monthsRemaining: 46 },
    ],

    realEstate: [],

    subjectProperty: {
      isAddressKnown: true,
      address: { street: '3800 Oleander Dr', city: 'Wilmington', state: 'NC', zip: '28403' },
      purchasePrice: 414750,
      propertyType: 'single-family',
      propertyUse: 'primary',
      yearBuilt: 2005,
    },

    declarations: { hasOutstandingJudgments: false, isBankrupt: false, isUSCitizen: true, isPrimaryResidence: true },

    documents: [
      { id: 'doc-080', applicationId: 'app-008', type: 'pay-stub', name: 'Pay Stub - Apr 2024', status: 'verified', uploadedAt: '2024-05-05T09:00:00Z', verifiedAt: '2024-05-06T10:00:00Z' },
      { id: 'doc-081', applicationId: 'app-008', type: 'w2', name: 'W-2 2023', status: 'verified', uploadedAt: '2024-05-05T09:05:00Z', verifiedAt: '2024-05-06T10:30:00Z' },
    ],
  },

  // app-009: In-Progress, USDA purchase, rural Johnston County NC
  {
    id: 'app-009',
    createdAt: '2024-06-12T08:00:00Z',
    updatedAt: '2024-06-16T09:45:00Z',
    status: 'in-progress',
    completionPercent: 58,
    currentStep: 'liabilities',
    loanOfficerId: 'lo-001',

    loanDetails: {
      purpose: 'purchase',
      loanAmount: 198000,
      downPaymentAmount: 0,
      downPaymentPercent: 0,
      loanProduct: 'usda',
      interestRateType: 'fixed',
      loanTerm: 30,
    },

    borrower: {
      firstName: 'Tiffany',
      lastName: 'Monroe',
      email: 'tmonroe@johnstonschools.org',
      phone: '(919) 555-0934',
      maritalStatus: 'married',
      dependents: 2,
      address: {
        street: '104 Pine Needle Ln',
        city: 'Smithfield',
        state: 'NC',
        zip: '27577',
        housingStatus: 'rent',
        monthlyRent: 1050,
        yearsAtAddress: 5,
      },
      citizenshipStatus: 'us-citizen',
    },

    hasCoBorrower: true,
    coBorrower: {
      firstName: 'Chris',
      lastName: 'Monroe',
      email: 'cmonroe@gmail.com',
      phone: '(919) 555-0935',
    },

    employment: [
      {
        id: 'emp-009',
        employerName: 'Johnston County Schools',
        position: '4th Grade Teacher',
        startDate: '2015-08-01',
        isCurrent: true,
        employmentType: 'employed',
        monthlyIncome: 4292,
        annualIncome: 51500,
      },
    ],
    previousEmployment: [],
    otherIncome: [],

    assets: [
      { id: 'ast-090', type: 'checking', institution: 'First Bank', accountLastFour: '6677', currentValue: 12800 },
      { id: 'ast-091', type: 'savings', institution: 'First Bank', accountLastFour: '6678', currentValue: 7200 },
    ],

    liabilities: [],
    realEstate: [],

    subjectProperty: {
      isAddressKnown: true,
      address: { street: '218 Country Club Dr', city: 'Benson', state: 'NC', zip: '27504' },
      purchasePrice: 198000,
      propertyType: 'single-family',
      propertyUse: 'primary',
      yearBuilt: 1988,
    },

    declarations: { hasOutstandingJudgments: false, isBankrupt: false, isUSCitizen: true, isPrimaryResidence: true },

    documents: [
      { id: 'doc-090', applicationId: 'app-009', type: 'pay-stub', name: 'Pay Stub - May 2024', status: 'verified', uploadedAt: '2024-06-13T09:00:00Z', verifiedAt: '2024-06-14T08:30:00Z' },
      { id: 'doc-091', applicationId: 'app-009', type: 'w2', name: 'W-2 2023', status: 'uploaded', uploadedAt: '2024-06-13T09:10:00Z' },
      { id: 'doc-092', applicationId: 'app-009', type: 'bank-statement', name: 'First Bank - May 2024', status: 'pending' },
    ],
  },

  // app-010: Processing, FHA purchase, Asheville NC — self-employed borrower
  {
    id: 'app-010',
    createdAt: '2024-05-10T12:00:00Z',
    updatedAt: '2024-06-15T17:00:00Z',
    status: 'processing',
    completionPercent: 100,
    currentStep: 'review',
    loanOfficerId: 'lo-001',

    loanDetails: {
      purpose: 'purchase',
      loanAmount: 287000,
      downPaymentAmount: 10045,
      downPaymentPercent: 3.5,
      loanProduct: 'fha',
      interestRateType: 'fixed',
      loanTerm: 30,
    },

    borrower: {
      firstName: 'Luis',
      lastName: 'Esperanza',
      email: 'luis@avldesignco.com',
      phone: '(828) 555-1082',
      maritalStatus: 'unmarried',
      dependents: 0,
      address: {
        street: '62 Merrimon Ave',
        city: 'Asheville',
        state: 'NC',
        zip: '28804',
        housingStatus: 'rent',
        monthlyRent: 1400,
        yearsAtAddress: 3,
      },
      citizenshipStatus: 'us-citizen',
    },

    hasCoBorrower: false,
    employment: [
      {
        id: 'emp-010',
        employerName: 'AVL Design Co (Self)',
        position: 'Owner / Graphic Designer',
        startDate: '2018-02-01',
        isCurrent: true,
        employmentType: 'self-employed',
        monthlyIncome: 6250,
        annualIncome: 75000,
      },
    ],
    previousEmployment: [],
    otherIncome: [],

    assets: [
      { id: 'ast-100', type: 'checking', institution: 'Mountain BizBank', accountLastFour: '1199', currentValue: 18500 },
      { id: 'ast-101', type: 'savings', institution: 'Mountain BizBank', accountLastFour: '1200', currentValue: 22000 },
    ],

    liabilities: [
      { id: 'lib-100', type: 'auto-loan', creditor: 'Honda Financial', monthlyPayment: 348, unpaidBalance: 11200, monthsRemaining: 32 },
      { id: 'lib-101', type: 'credit-card', creditor: 'Discover', monthlyPayment: 110, unpaidBalance: 3200 },
    ],

    realEstate: [],

    subjectProperty: {
      isAddressKnown: true,
      address: { street: '14 Sunset Mountain Rd', city: 'Asheville', state: 'NC', zip: '28803' },
      purchasePrice: 297045,
      propertyType: 'single-family',
      propertyUse: 'primary',
      yearBuilt: 1972,
    },

    declarations: { hasOutstandingJudgments: false, isBankrupt: false, isUSCitizen: true, isPrimaryResidence: true },

    documents: [
      { id: 'doc-100', applicationId: 'app-010', type: 'tax-return', name: '1040 - 2023', status: 'verified', uploadedAt: '2024-05-12T09:00:00Z', verifiedAt: '2024-05-14T10:00:00Z' },
      { id: 'doc-101', applicationId: 'app-010', type: 'tax-return', name: '1040 - 2022', status: 'verified', uploadedAt: '2024-05-12T09:05:00Z', verifiedAt: '2024-05-14T10:30:00Z' },
      { id: 'doc-102', applicationId: 'app-010', type: 'business-return', name: 'Sched C 2023', status: 'verified', uploadedAt: '2024-05-12T09:10:00Z', verifiedAt: '2024-05-15T11:00:00Z' },
      { id: 'doc-103', applicationId: 'app-010', type: 'business-return', name: 'Sched C 2022', status: 'verified', uploadedAt: '2024-05-12T09:15:00Z', verifiedAt: '2024-05-15T11:30:00Z' },
      { id: 'doc-104', applicationId: 'app-010', type: 'bank-statement', name: 'Mountain BizBank - Apr 2024', status: 'verified', uploadedAt: '2024-05-20T10:00:00Z', verifiedAt: '2024-05-21T09:00:00Z' },
      { id: 'doc-105', applicationId: 'app-010', type: 'bank-statement', name: 'Mountain BizBank - May 2024', status: 'processing', uploadedAt: '2024-06-05T09:00:00Z' },
      { id: 'doc-106', applicationId: 'app-010', type: 'profit-loss', name: 'P&L Statement YTD 2024', status: 'received', uploadedAt: '2024-06-10T14:00:00Z' },
    ],
  },

  // app-011: Conditional, VA refi (IRRRL), Fayetteville NC
  {
    id: 'app-011',
    createdAt: '2024-04-05T10:00:00Z',
    updatedAt: '2024-06-14T12:00:00Z',
    status: 'conditional',
    completionPercent: 100,
    currentStep: 'review',
    loanOfficerId: 'lo-001',

    loanDetails: {
      purpose: 'refinance',
      loanAmount: 295000,
      loanProduct: 'va',
      interestRateType: 'fixed',
      loanTerm: 30,
    },

    borrower: {
      firstName: 'Marquise',
      lastName: 'Booker',
      email: 'marquise.booker@bragg.army.mil',
      phone: '(910) 555-1121',
      maritalStatus: 'married',
      dependents: 2,
      address: {
        street: '114 Reilly Rd',
        city: 'Fayetteville',
        state: 'NC',
        zip: '28314',
        housingStatus: 'own',
      },
      citizenshipStatus: 'us-citizen',
    },

    hasCoBorrower: false,
    employment: [
      {
        id: 'emp-011',
        employerName: 'US Army',
        position: 'Sergeant First Class E-7',
        startDate: '2008-05-01',
        isCurrent: true,
        employmentType: 'military',
        monthlyIncome: 4614,
        annualIncome: 55368,
      },
    ],
    previousEmployment: [],
    otherIncome: [
      { id: 'oi-011', type: 'bah', description: 'BAH - Fayetteville, NC', monthlyAmount: 1512 },
    ],

    assets: [
      { id: 'ast-110', type: 'checking', institution: 'Fort Bragg Federal CU', accountLastFour: '4490', currentValue: 14200 },
      { id: 'ast-111', type: 'retirement-tsp', institution: 'Thrift Savings Plan', currentValue: 62000 },
    ],

    liabilities: [
      { id: 'lib-110', type: 'auto-loan', creditor: 'Fort Bragg FCU Auto', monthlyPayment: 415, unpaidBalance: 19800, monthsRemaining: 47 },
    ],

    realEstate: [
      {
        id: 're-011',
        address: { street: '114 Reilly Rd', city: 'Fayetteville', state: 'NC', zip: '28314' },
        propertyValue: 335000,
        mortgageBalance: 295000,
        monthlyMortgage: 1940,
        propertyType: 'single-family',
        propertyUse: 'primary',
      },
    ],

    subjectProperty: {
      isAddressKnown: true,
      address: { street: '114 Reilly Rd', city: 'Fayetteville', state: 'NC', zip: '28314' },
      estimatedValue: 335000,
      propertyType: 'single-family',
      propertyUse: 'primary',
    },

    declarations: { hasOutstandingJudgments: false, isBankrupt: false, isUSCitizen: true, isPrimaryResidence: true },

    documents: [
      { id: 'doc-110', applicationId: 'app-011', type: 'pay-stub', name: 'LES - May 2024', status: 'verified', uploadedAt: '2024-04-10T09:00:00Z', verifiedAt: '2024-04-11T10:00:00Z' },
      { id: 'doc-111', applicationId: 'app-011', type: 'coe', name: 'Certificate of Eligibility', status: 'verified', uploadedAt: '2024-04-10T09:05:00Z', verifiedAt: '2024-04-11T10:30:00Z' },
      { id: 'doc-112', applicationId: 'app-011', type: 'bank-statement', name: 'FBFCU - Apr 2024', status: 'verified', uploadedAt: '2024-04-18T08:00:00Z', verifiedAt: '2024-04-19T09:00:00Z' },
      { id: 'doc-113', applicationId: 'app-011', type: 'payoff-statement', name: 'Payoff Statement - Current VA Loan', status: 'received', uploadedAt: '2024-06-01T10:00:00Z' },
    ],
  },

  // app-012: Started, Conventional purchase, Cary NC — relocating buyer
  {
    id: 'app-012',
    createdAt: '2024-06-16T15:00:00Z',
    updatedAt: '2024-06-17T08:30:00Z',
    status: 'started',
    completionPercent: 18,
    currentStep: 'personal-info',
    loanOfficerId: 'lo-001',

    loanDetails: {
      purpose: 'purchase',
      loanProduct: 'conventional',
    },

    borrower: {
      firstName: 'Stephanie',
      lastName: 'Walsh',
      email: 's.walsh@amazon.com',
      phone: '(206) 555-1240',
      maritalStatus: 'married',
      dependents: 0,
      address: {
        street: '845 NE 85th St',
        city: 'Seattle',
        state: 'WA',
        zip: '98115',
        housingStatus: 'rent',
        monthlyRent: 3200,
        yearsAtAddress: 2,
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

    documents: [],
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
  { id: 'document-upload', label: 'Upload Documents', description: "Drop your docs — we'll fill the rest", isComplete: false, isActive: true },
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
  { id: 'demographics', label: 'Demographics', description: 'HMDA required information', isComplete: false, isActive: false },
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
    message: "Marcus Thompson's refinance application has been submitted for review.",
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
  {
    id: 'notif-004',
    type: 'success',
    title: 'VA COE confirmed',
    message: "Derek Okonkwo's Certificate of Eligibility has been verified. File moved to processing.",
    createdAt: '2024-06-16T11:50:00Z',
    isRead: false,
    applicationId: 'app-004',
  },
  {
    id: 'notif-005',
    type: 'action-required',
    title: 'Condition outstanding — gift letter',
    message: "Katherine Harrington's file is missing a gift letter. Approval is on hold.",
    createdAt: '2024-06-17T14:30:00Z',
    isRead: false,
    applicationId: 'app-005',
  },
  {
    id: 'notif-006',
    type: 'success',
    title: 'Clear to close!',
    message: 'Jasmine Rivera is approved and all conditions are cleared. Schedule closing.',
    createdAt: '2024-06-18T16:05:00Z',
    isRead: false,
    applicationId: 'app-006',
  },
  {
    id: 'notif-007',
    type: 'success',
    title: 'Loan funded',
    message: "Robert Faulkner's cash-out refinance closed and funded. $150K disbursed.",
    createdAt: '2024-05-30T15:10:00Z',
    isRead: true,
    applicationId: 'app-007',
  },
  {
    id: 'notif-008',
    type: 'info',
    title: 'Application denied',
    message: 'Brian Kowalski — DTI of 53% exceeded program limits. Adverse action notice sent.',
    createdAt: '2024-06-05T13:35:00Z',
    isRead: true,
    applicationId: 'app-008',
  },
  {
    id: 'notif-009',
    type: 'action-required',
    title: 'Bank statements needed',
    message: 'Tiffany Monroe still needs to upload 60-day bank statements to move forward.',
    createdAt: '2024-06-16T09:50:00Z',
    isRead: false,
    applicationId: 'app-009',
  },
  {
    id: 'notif-010',
    type: 'info',
    title: 'P&L statement received',
    message: "Luis Esperanza's year-to-date P&L is in. Processor is reviewing for self-employment income.",
    createdAt: '2024-06-15T17:05:00Z',
    isRead: true,
    applicationId: 'app-010',
  },
  {
    id: 'notif-011',
    type: 'action-required',
    title: 'Payoff statement — condition open',
    message: "Marquise Booker's payoff statement has been received but not yet reviewed. IRRRL pending.",
    createdAt: '2024-06-14T12:10:00Z',
    isRead: false,
    applicationId: 'app-011',
  },
  {
    id: 'notif-012',
    type: 'info',
    title: 'New lead — relocation buyer',
    message: 'Stephanie Walsh started an application. Amazon relo from Seattle to RTP.',
    createdAt: '2024-06-16T15:05:00Z',
    isRead: false,
    applicationId: 'app-012',
  },
]

// ─── Pipeline Stats ───────────────────────────────────────────────────────────

export const pipelineStats = {
  total: 12,
  inProgress: 3,
  submitted: 1,
  processing: 2,
  conditional: 2,
  approved: 1,
  closed: 1,
  denied: 1,
  started: 2,
  totalLoanVolume: 4218000,
  avgCompletionRate: 74,
  pullThroughRate: 68,
  avgDaysToClose: 32,
  monthlyApplications: [
    { month: 'Jan', count: 6, funded: 4 },
    { month: 'Feb', count: 9, funded: 6 },
    { month: 'Mar', count: 8, funded: 5 },
    { month: 'Apr', count: 11, funded: 8 },
    { month: 'May', count: 10, funded: 7 },
    { month: 'Jun', count: 12, funded: 3 },
  ],
  loanProductMix: [
    { name: 'Conventional', value: 42 },
    { name: 'FHA', value: 25 },
    { name: 'VA', value: 22 },
    { name: 'USDA', value: 7 },
    { name: 'Jumbo', value: 4 },
  ],
  pipelineFunnel: [
    { stage: 'Started', count: 12, pct: 100 },
    { stage: 'Submitted', count: 10, pct: 83 },
    { stage: 'Processing', count: 8, pct: 67 },
    { stage: 'Conditional', count: 6, pct: 50 },
    { stage: 'Approved / CTC', count: 5, pct: 42 },
    { stage: 'Closed', count: 4, pct: 33 },
  ],
  volumeByProgram: [
    { program: 'Conventional', volume: 1990000 },
    { program: 'FHA', volume: 703000 },
    { program: 'VA', volume: 710000 },
    { program: 'USDA', volume: 198000 },
    { program: 'Jumbo', volume: 1250000 },
  ],
}

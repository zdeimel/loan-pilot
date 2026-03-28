'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoanApplication } from '@/lib/types'
import { mockApplications, orderedStepIds } from '@/lib/mock-data'

// ─── Extracted Document Data ──────────────────────────────────────────────────
// Populated by the Smart Upload step; used to prefill downstream form steps.
export interface ExtractedDocumentData {
  // Personal / identity (from W-2, 1040, ID)
  firstName?: string
  lastName?: string
  ssn?: string          // masked
  dob?: string
  filingStatus?: string // from 1040
  dependents?: number

  // Current address (from ID or 1040)
  street?: string
  city?: string
  state?: string
  zip?: string

  // Employment & income (from W-2 / pay stub)
  employerName?: string
  employerEIN?: string
  annualIncome?: number   // W-2 box 1 wages
  monthlyIncome?: number
  ytdGross?: number       // pay stub YTD
  payFrequency?: string   // bi-weekly, semi-monthly, etc.

  // Tax return data (from 1040)
  agi?: number            // adjusted gross income
  taxYear?: number
  taxYear2?: number       // second year
  selfEmployedIncome?: number
  rentalIncome?: number
  dividendIncome?: number

  // Assets (from bank statements)
  bankName?: string
  accountLastFour?: string
  accountType?: string    // checking / savings
  balance?: number
  bankName2?: string
  accountLastFour2?: string
  accountType2?: string
  balance2?: number

  // Confidence score per field (0–1)
  confidence: Record<string, number>

  // Which doc types were uploaded
  uploadedDocTypes: string[]
}

interface ApplicationState {
  currentApplication: Partial<LoanApplication>
  currentStepId: string
  isSaving: boolean
  lastSaved: string | null

  // Extracted data from Smart Upload step
  extractedData: ExtractedDocumentData | null

  // Actions
  setStep: (stepId: string) => void
  nextStep: () => void
  prevStep: () => void
  updateApplication: (data: Partial<LoanApplication>) => void
  saveApplication: () => Promise<void>
  loadApplication: (id: string) => void
  resetApplication: () => void
  setExtractedData: (data: ExtractedDocumentData) => void
  applyExtractedData: (data: ExtractedDocumentData) => void

  // LO pipeline
  applications: LoanApplication[]
  updateApplicationStatus: (id: string, status: LoanApplication['status']) => void
}

const emptyApplication: Partial<LoanApplication> = {
  id: `app-new-${Date.now()}`,
  status: 'started',
  completionPercent: 0,
  currentStep: 'document-upload',
  loanDetails: {},
  borrower: {},
  hasCoBorrower: false,
  employment: [],
  previousEmployment: [],
  otherIncome: [],
  assets: [],
  liabilities: [],
  realEstate: [],
  subjectProperty: { isAddressKnown: false },
  documents: [],
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      currentApplication: emptyApplication,
      currentStepId: 'document-upload',
      isSaving: false,
      lastSaved: null,
      extractedData: null,
      applications: mockApplications,

      setStep: (stepId) => {
        set({ currentStepId: stepId })
        get().updateApplication({ currentStep: stepId })
      },

      nextStep: () => {
        const { currentStepId } = get()
        const idx = orderedStepIds.indexOf(currentStepId)
        const next = orderedStepIds[idx + 1]
        if (next) {
          set({ currentStepId: next })
          get().updateApplication({ currentStep: next })
        }
      },

      prevStep: () => {
        const { currentStepId } = get()
        const idx = orderedStepIds.indexOf(currentStepId)
        const prev = orderedStepIds[idx - 1]
        if (prev) {
          set({ currentStepId: prev })
          get().updateApplication({ currentStep: prev })
        }
      },

      updateApplication: (data) => {
        set((state) => ({
          currentApplication: { ...state.currentApplication, ...data },
        }))
        get().saveApplication()
      },

      saveApplication: async () => {
        set({ isSaving: true })
        await new Promise((r) => setTimeout(r, 600))
        set({ isSaving: false, lastSaved: new Date().toISOString() })
      },

      loadApplication: (id) => {
        const app = get().applications.find((a) => a.id === id)
        if (app) {
          set({ currentApplication: app, currentStepId: app.currentStep })
        }
      },

      resetApplication: () => {
        set({
          currentApplication: { ...emptyApplication, id: `app-new-${Date.now()}` },
          currentStepId: 'document-upload',
          lastSaved: null,
          extractedData: null,
        })
      },

      setExtractedData: (data) => {
        set({ extractedData: data })
      },

      // Merge confirmed extracted fields into the live application object
      applyExtractedData: (data) => {
        const prev = get().currentApplication

        const merged: Partial<LoanApplication> = {
          borrower: {
            ...prev.borrower,
            ...(data.firstName && { firstName: data.firstName }),
            ...(data.lastName && { lastName: data.lastName }),
            ...(data.dob && { dob: data.dob }),
            ...(data.dependents !== undefined && { dependents: data.dependents }),
            address: {
              street: data.street ?? prev.borrower?.address?.street ?? '',
              city: data.city ?? prev.borrower?.address?.city ?? '',
              state: data.state ?? prev.borrower?.address?.state ?? '',
              zip: data.zip ?? prev.borrower?.address?.zip ?? '',
              housingStatus: prev.borrower?.address?.housingStatus ?? 'rent',
            },
          },

          employment:
            data.employerName && data.annualIncome
              ? [
                  {
                    id: `emp-extracted-${Date.now()}`,
                    employerName: data.employerName,
                    position: prev.employment?.[0]?.position ?? '',
                    startDate: prev.employment?.[0]?.startDate ?? '',
                    isCurrent: true,
                    employmentType: 'employed' as const,
                    monthlyIncome: data.monthlyIncome ?? Math.round(data.annualIncome / 12),
                    annualIncome: data.annualIncome,
                  },
                ]
              : prev.employment ?? [],

          assets:
            data.bankName && data.balance
              ? [
                  {
                    id: `ast-extracted-1-${Date.now()}`,
                    type: (data.accountType as 'checking' | 'savings') ?? 'checking',
                    institution: data.bankName,
                    accountLastFour: data.accountLastFour,
                    currentValue: data.balance,
                  },
                  ...(data.bankName2 && data.balance2
                    ? [
                        {
                          id: `ast-extracted-2-${Date.now()}`,
                          type: (data.accountType2 as 'checking' | 'savings') ?? 'savings',
                          institution: data.bankName2,
                          accountLastFour: data.accountLastFour2,
                          currentValue: data.balance2,
                        },
                      ]
                    : []),
                ]
              : prev.assets ?? [],
        }

        set((state) => ({
          currentApplication: { ...state.currentApplication, ...merged },
          extractedData: data,
        }))
      },

      updateApplicationStatus: (id, status) => {
        set((state) => ({
          applications: state.applications.map((a) => (a.id === id ? { ...a, status } : a)),
        }))
      },
    }),
    {
      name: 'loanpilot-application',
      partialize: (state) => ({
        currentApplication: state.currentApplication,
        currentStepId: state.currentStepId,
        lastSaved: state.lastSaved,
        extractedData: state.extractedData,
      }),
    }
  )
)

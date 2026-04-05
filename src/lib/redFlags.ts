import type { LoanApplication, RedFlag } from '@/lib/types'

export function computeRedFlags(application: Partial<LoanApplication>): RedFlag[] {
  const flags: RedFlag[] = []

  const creditResult = application.creditPullResult
  const loanAmount = application.loanDetails?.loanAmount ?? 0
  const liquidCash = application.liquidCash ?? 0
  const employment = application.employment ?? []
  const liabilities = application.liabilities ?? []

  // ── Credit bureau issues ──────────────────────────────────────────────────
  if (creditResult) {
    const freezeBureau = creditResult.bureaus.find((b) => b.status === 'freeze')
    const noHitBureau = creditResult.bureaus.find((b) => b.status === 'no-hit')

    if (freezeBureau) {
      flags.push({
        id: 'credit-freeze',
        severity: 'critical',
        label: 'Credit file frozen',
        explanation: `Your credit file at ${freezeBureau.bureau} is frozen. You'll need to temporarily lift the freeze before your loan can be processed.`,
        internalNote: `Bureau ${freezeBureau.bureau} returned freeze status. Borrower must contact bureau to lift.`,
      })
    }

    if (noHitBureau && !freezeBureau) {
      flags.push({
        id: 'credit-no-hit',
        severity: 'critical',
        label: 'No credit file found',
        explanation: `${noHitBureau.bureau} couldn't locate a credit file for you. This may mean you have a thin credit history or a file discrepancy.`,
        internalNote: `Bureau ${noHitBureau.bureau} returned no-hit. Check for name/SSN mismatch or thin file.`,
      })
    }

    const score = creditResult.creditScore
    if (score !== undefined) {
      if (score < 580) {
        flags.push({
          id: 'credit-score-critical',
          severity: 'critical',
          label: 'Credit score below minimum',
          explanation: `Your credit score of ${score} is below the minimum required for most loan programs. Your loan officer will discuss available options.`,
          internalNote: `Credit score ${score} — below FHA minimum (580). Conventional requires 620+.`,
        })
      } else if (score < 620) {
        flags.push({
          id: 'credit-score-fha-only',
          severity: 'warning',
          label: 'Limited loan program eligibility',
          explanation: `Your credit score of ${score} qualifies you for FHA financing but may limit conventional loan options.`,
          internalNote: `Score ${score} — FHA eligible, conventional ineligible (min 620).`,
        })
      } else if (score < 680) {
        flags.push({
          id: 'credit-score-borderline',
          severity: 'warning',
          label: 'Borderline credit score',
          explanation: `Your credit score of ${score} meets the minimum, but a higher score would unlock better rates and programs.`,
          internalNote: `Score ${score} — borderline. May face pricing adjustments (LLPAs).`,
        })
      }
    }
  }

  // ── Liquid cash ───────────────────────────────────────────────────────────
  if (loanAmount > 0 && liquidCash > 0) {
    const cashPercent = liquidCash / loanAmount
    if (cashPercent < 0.03) {
      flags.push({
        id: 'cash-critical',
        severity: 'critical',
        label: 'Insufficient funds to close',
        explanation: `Your available cash may not cover the down payment and closing costs for this loan amount. Your loan officer will review your options.`,
        internalNote: `Liquid cash ${cashPercent.toFixed(1)}% of loan amount — below 3% threshold.`,
      })
    } else if (cashPercent < 0.05) {
      flags.push({
        id: 'cash-warning',
        severity: 'warning',
        label: 'Limited cash reserves',
        explanation: `Your cash reserves are tight relative to the loan amount. Make sure you have funds for closing costs on top of your down payment.`,
        internalNote: `Liquid cash ${cashPercent.toFixed(1)}% of loan amount — low reserves, may affect program eligibility.`,
      })
    }
  }

  // ── Employment gaps ───────────────────────────────────────────────────────
  const currentJobs = employment.filter((e) => e.isCurrent)
  const pastJobs = employment.filter((e) => !e.isCurrent)

  if (currentJobs.length === 0 && employment.length > 0) {
    flags.push({
      id: 'no-current-employment',
      severity: 'critical',
      label: 'No current employment listed',
      explanation: `No current employment was found in your application. Lenders require documentation of active income.`,
      internalNote: `No current employer on record. All listed jobs are marked as ended.`,
    })
  }

  // Check for employment gaps in the last 2 years
  const twoYearsAgo = new Date()
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

  for (const job of pastJobs) {
    if (!job.endDate || !job.startDate) continue
    const end = new Date(job.endDate)
    if (end < twoYearsAgo) continue // gap is outside 2-year window

    // Find the next job that started after this one ended
    const nextJob = [...currentJobs, ...pastJobs]
      .filter((j) => j.startDate && new Date(j.startDate) > end)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0]

    if (nextJob) {
      const gapDays = Math.round(
        (new Date(nextJob.startDate).getTime() - end.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (gapDays > 30) {
        flags.push({
          id: `employment-gap-${job.id}`,
          severity: 'warning',
          label: 'Employment gap detected',
          explanation: `There appears to be a gap of about ${Math.round(gapDays / 30)} month(s) in your employment history. Your loan officer may ask for a letter of explanation.`,
          internalNote: `${gapDays}-day gap between ${job.employerName} (ended ${job.endDate}) and ${nextJob.employerName} (started ${nextJob.startDate}).`,
        })
        break // one gap flag is enough
      }
    }
  }

  // ── Self-employment < 2 years ─────────────────────────────────────────────
  const selfEmployed = currentJobs.find((e) => e.employmentType === 'self-employed')
  if (selfEmployed && (selfEmployed.selfEmployedYears ?? 0) < 2) {
    flags.push({
      id: 'self-employed-short',
      severity: 'warning',
      label: 'Short self-employment history',
      explanation: `Lenders typically require 2 years of self-employment history to use that income for qualifying. Your loan officer will advise on your options.`,
      internalNote: `Self-employed at ${selfEmployed.employerName} for less than 2 years — income may not be countable.`,
    })
  }

  // ── DTI estimate ──────────────────────────────────────────────────────────
  const totalMonthlyIncome = employment
    .filter((e) => e.isCurrent)
    .reduce((sum, e) => sum + (e.monthlyIncome ?? 0), 0)

  const totalMonthlyDebt = liabilities.reduce((sum, l) => sum + (l.monthlyPayment ?? 0), 0)

  // Rough PITI estimate: principal + interest only
  const estimatedPI = loanAmount > 0 ? (loanAmount * 0.006) : 0
  const totalObligations = totalMonthlyDebt + estimatedPI

  if (totalMonthlyIncome > 0) {
    const dti = totalObligations / totalMonthlyIncome
    if (dti > 0.43) {
      flags.push({
        id: 'dti-critical',
        severity: 'critical',
        label: 'High debt-to-income ratio',
        explanation: `Your estimated debt-to-income ratio exceeds 43%, which is the typical maximum for conventional loans. Your loan officer will review your full picture.`,
        internalNote: `Estimated DTI ${(dti * 100).toFixed(1)}% — above 43% threshold. Monthly obligations $${totalObligations.toFixed(0)} vs income $${totalMonthlyIncome.toFixed(0)}.`,
      })
    } else if (dti > 0.36) {
      flags.push({
        id: 'dti-warning',
        severity: 'warning',
        label: 'Elevated debt-to-income ratio',
        explanation: `Your estimated debt-to-income ratio is on the higher side. You're within guidelines, but it may limit your loan options.`,
        internalNote: `Estimated DTI ${(dti * 100).toFixed(1)}% — elevated (36–43% range).`,
      })
    }
  }

  // ── Undisclosed obligations ───────────────────────────────────────────────
  const hasChildSupport = liabilities.some((l) => l.type === 'child-support')
  const hasAlimony = liabilities.some((l) => l.type === 'alimony')

  if (hasChildSupport || hasAlimony) {
    // Check if these appear on credit (can't verify in demo, but flag for LO)
    flags.push({
      id: 'disclosed-obligations',
      severity: 'warning',
      label: 'Disclosed court-ordered obligations',
      explanation: `You disclosed child support or alimony payments. These are counted in your debt-to-income ratio.`,
      internalNote: `Borrower disclosed ${[hasChildSupport && 'child support', hasAlimony && 'alimony'].filter(Boolean).join(' and ')}. Verify against credit report — must match.`,
    })
  }

  return flags
}

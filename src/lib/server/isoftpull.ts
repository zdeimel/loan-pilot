/**
 * Server-only iSoftPull integration.
 *
 * This module MUST NOT be imported by any client component.
 * All secrets remain server-side; nothing in this file is exposed to the browser.
 *
 * API docs: https://app.isoftpull.com/api/v2/reports
 *   - Authentication: headers  api-key / api-secret
 *   - State must be full name  ("North Carolina", not "NC")
 *   - SSN must be digits only  (no dashes)
 *   - DOB must be mm/dd/yyyy
 */

import type { ISoftPullBureauResult, ISoftPullIntelligence, ISoftPullResult } from '@/lib/types'
import { toFullStateName, stripSsnDashes, normalizeDob } from '@/lib/stateNames'

// ─── iSoftPull payload shape ──────────────────────────────────────────────────

interface ISoftPullPayload {
  first_name: string
  last_name: string
  address: string
  city: string
  state: string       // full name, e.g. "North Carolina"
  zip: string
  // Optional soft-pull fields; required for hard pull
  ssn?: string        // digits only, no dashes
  date_of_birth?: string  // mm/dd/yyyy
}

// ─── Raw API response shapes (internal — not exported) ───────────────────────

interface RawBureauEntry {
  status?: string
  message?: string
  link?: string
  failure_type?: string
}

interface RawISoftPullResponse {
  reports?: Record<string, RawBureauEntry>
  intelligence?: {
    result?: string
    name?: string
  }
  // Full-feed fields — may or may not be present depending on account tier
  credit_score?: number
  personal_information?: unknown
  address_history?: unknown
  employment_history?: unknown
  identity_risk?: unknown
  income_analysis?: unknown
  trade_accounts?: unknown
  inquiries?: unknown
  statements?: unknown
  collections?: unknown
  public_record?: unknown
  full_feed_link?: string
}

// ─── Config guard ─────────────────────────────────────────────────────────────

function getCredentials(): { apiKey: string; apiSecret: string } {
  const apiKey = process.env.ISOFTPULL_API_KEY
  const apiSecret = process.env.ISOFTPULL_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error(
      'iSoftPull credentials are not configured. ' +
      'Set ISOFTPULL_API_KEY and ISOFTPULL_API_SECRET in your environment.'
    )
  }

  return { apiKey, apiSecret }
}

// ─── Payload builder ─────────────────────────────────────────────────────────

export interface BorrowerForPull {
  firstName: string
  lastName: string
  street: string
  city: string
  /** Two-letter state abbreviation as stored in the app (e.g. "NC") */
  state: string
  zip: string
  /** Raw SSN string — may contain dashes; will be stripped */
  ssn?: string
  /** Raw DOB string in any supported format */
  dob?: string
}

function buildPayload(borrower: BorrowerForPull): ISoftPullPayload {
  const payload: ISoftPullPayload = {
    first_name: borrower.firstName.trim(),
    last_name:  borrower.lastName.trim(),
    address:    borrower.street.trim(),
    city:       borrower.city.trim(),
    state:      toFullStateName(borrower.state),   // "NC" → "North Carolina"
    zip:        borrower.zip.trim(),
  }

  if (borrower.ssn) {
    const digits = stripSsnDashes(borrower.ssn)
    if (digits.length === 9) payload.ssn = digits
  }

  if (borrower.dob) {
    const formatted = normalizeDob(borrower.dob)
    if (formatted) payload.date_of_birth = formatted
  }

  return payload
}

// ─── Response normalizer ──────────────────────────────────────────────────────

function normalizeResponse(raw: RawISoftPullResponse, requestedAt: string): ISoftPullResult {
  const bureaus: ISoftPullBureauResult[] = []

  if (raw.reports && typeof raw.reports === 'object') {
    for (const [bureauName, entry] of Object.entries(raw.reports)) {
      const rawStatus = (entry.status ?? '').toLowerCase()

      // Map raw status to our normalized union
      let status: ISoftPullBureauResult['status'] = 'error'
      if (rawStatus === 'success' || rawStatus === 'complete' || rawStatus === 'completed') {
        status = 'success'
      } else if (entry.failure_type === 'no-hit' || rawStatus === 'no-hit') {
        status = 'no-hit'
      } else if (entry.failure_type === 'freeze' || rawStatus === 'freeze') {
        status = 'freeze'
      }

      bureaus.push({
        bureau: bureauName,
        status,
        link:        entry.link,
        message:     entry.message,
        failureType: entry.failure_type as ISoftPullBureauResult['failureType'],
      })
    }
  }

  const intelligence: ISoftPullIntelligence | undefined =
    raw.intelligence
      ? { result: raw.intelligence.result, name: raw.intelligence.name }
      : undefined

  // Capture full-feed data if present — stored opaquely for future extension
  const fullFeedKeys = [
    'credit_score', 'personal_information', 'address_history', 'employment_history',
    'identity_risk', 'income_analysis', 'trade_accounts', 'inquiries',
    'statements', 'collections', 'public_record', 'full_feed_link',
  ] as const

  const fullFeedSummary: Record<string, unknown> = {}
  let hasFull = false
  for (const key of fullFeedKeys) {
    if (raw[key] !== undefined && raw[key] !== null) {
      fullFeedSummary[key] = raw[key]
      hasFull = true
    }
  }

  return {
    requestedAt,
    completedAt:    new Date().toISOString(),
    bureaus,
    intelligence,
    creditScore:    raw.credit_score,
    fullFeedSummary: hasFull ? fullFeedSummary : undefined,
  }
}

// ─── Public function ──────────────────────────────────────────────────────────

/**
 * Request a soft credit pull from iSoftPull.
 *
 * Throws on:
 *   - missing credentials (config error)
 *   - network failure
 *   - non-2xx HTTP from iSoftPull (includes the sanitized status code)
 *
 * Returns a normalized ISoftPullResult on success.
 * Individual bureau failures are surfaced inside `result.bureaus[n].status`
 * rather than as thrown errors, so partial results are preserved.
 */
export async function pullSoftCredit(borrower: BorrowerForPull): Promise<ISoftPullResult> {
  const { apiKey, apiSecret } = getCredentials()
  const requestedAt = new Date().toISOString()
  const payload = buildPayload(borrower)

  const response = await fetch('https://app.isoftpull.com/api/v2/reports', {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key':    apiKey,
      'api-secret': apiSecret,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    // Do not include response body in the error — it may contain account info.
    throw new Error(`iSoftPull returned HTTP ${response.status}`)
  }

  const raw: RawISoftPullResponse = await response.json()
  return normalizeResponse(raw, requestedAt)
}

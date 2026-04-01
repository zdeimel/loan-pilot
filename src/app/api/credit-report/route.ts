/**
 * POST /api/credit-report
 *
 * Accepts borrower data + explicit consent from the client,
 * calls the server-only iSoftPull service, and returns a
 * normalized bureau result.
 *
 * Credentials never leave the server — only the normalized
 * result is returned to the client.
 */

import { NextRequest, NextResponse } from 'next/server'
import { pullSoftCredit } from '@/lib/server/isoftpull'

interface CreditReportRequest {
  /** Must be true — the borrower must have explicitly authorized */
  consentAccepted: boolean
  borrower: {
    firstName: string
    lastName: string
    street: string
    city: string
    state: string
    zip: string
    ssn?: string
    dob?: string
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── 1. Parse body ────────────────────────────────────────────────────────────
  let body: CreditReportRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // ── 2. Validate consent ──────────────────────────────────────────────────────
  if (!body.consentAccepted) {
    return NextResponse.json(
      { error: 'Borrower consent is required before pulling credit.' },
      { status: 422 }
    )
  }

  // ── 3. Validate required soft-pull fields ────────────────────────────────────
  const b = body.borrower ?? {}
  const missing: string[] = []
  if (!b.firstName?.trim())  missing.push('first name')
  if (!b.lastName?.trim())   missing.push('last name')
  if (!b.street?.trim())     missing.push('street address')
  if (!b.city?.trim())       missing.push('city')
  if (!b.state?.trim())      missing.push('state')
  if (!b.zip?.trim())        missing.push('zip code')

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(', ')}.` },
      { status: 422 }
    )
  }

  // ── 4. Call iSoftPull ────────────────────────────────────────────────────────
  try {
    const result = await pullSoftCredit({
      firstName: b.firstName!,
      lastName:  b.lastName!,
      street:    b.street!,
      city:      b.city!,
      state:     b.state!,
      zip:       b.zip!,
      ssn:       b.ssn,
      dob:       b.dob,
    })

    return NextResponse.json({ success: true, result })

  } catch (err: unknown) {
    // ── 4a. Config error (missing env vars) ─────────────────────────────────
    const message = err instanceof Error ? err.message : String(err)

    if (message.includes('credentials are not configured')) {
      console.error('[credit-report] iSoftPull not configured:', message)
      return NextResponse.json(
        { error: 'Credit pull service is not configured. Contact your loan officer.' },
        { status: 503 }
      )
    }

    // ── 4b. Upstream HTTP error ──────────────────────────────────────────────
    if (message.startsWith('iSoftPull returned HTTP')) {
      console.error('[credit-report] Upstream error:', message)
      return NextResponse.json(
        { error: 'Credit bureau service is temporarily unavailable. Please try again shortly.' },
        { status: 502 }
      )
    }

    // ── 4c. Network / unexpected error ───────────────────────────────────────
    console.error('[credit-report] Unexpected error:', message)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

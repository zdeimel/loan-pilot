import { NextRequest, NextResponse } from 'next/server'
import { generateCreditReport } from '@/lib/engines/creditMock'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { borrowerName, ssnLast4, scenario = 'good' } = body

  if (!borrowerName || !ssnLast4) {
    return NextResponse.json({ error: 'borrowerName and ssnLast4 are required' }, { status: 400 })
  }

  // In production: call Experian Connect / TransUnion TrueVision / Equifax API
  // Simulate network delay
  await new Promise(r => setTimeout(r, 1500))

  const report = generateCreditReport(borrowerName, ssnLast4, scenario)
  return NextResponse.json({ success: true, report })
}

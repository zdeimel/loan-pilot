import { NextRequest, NextResponse } from 'next/server'
import { runAUS } from '@/lib/engines/ausMock'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    fico, ltv, dtiBack, dtiFront, loanAmount, program,
    propertyUse, loanTerm, selfEmployed, bankruptcy,
    foreclosure, latePayments, reserves,
  } = body

  if (!fico || !loanAmount || !program) {
    return NextResponse.json({ error: 'fico, loanAmount, and program are required' }, { status: 400 })
  }

  // In production: submit MISMO 3.4 XML to Fannie Mae DU or Freddie LPA
  await new Promise(r => setTimeout(r, 2000))

  const findings = runAUS({
    fico: Number(fico), ltv: Number(ltv || 80), dtiBack: Number(dtiBack || 35),
    dtifront: Number(dtiFront || 28), loanAmount: Number(loanAmount), program,
    propertyUse: propertyUse || 'primary', loanTerm: Number(loanTerm || 30),
    selfEmployed: Boolean(selfEmployed), bankruptcy: Boolean(bankruptcy),
    foreclosure: Boolean(foreclosure), latePayments: Number(latePayments || 0),
    reserves: Number(reserves || 3),
  })

  return NextResponse.json({ success: true, findings })
}

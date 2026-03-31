import { NextRequest, NextResponse } from 'next/server'
import { calculateRate, comparePrograms } from '@/lib/engines/rateEngine'
import type { RateProgram } from '@/lib/engines/rateEngine'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { program, fico, ltv, loanAmount, loanTerm, propertyType, propertyUse, compareAll } = body

  if (!fico || !loanAmount) {
    return NextResponse.json({ error: 'fico and loanAmount are required' }, { status: 400 })
  }

  const base = {
    fico: Number(fico),
    ltv: Number(ltv || 80),
    loanAmount: Number(loanAmount),
    loanTerm: Number(loanTerm || 30) as 30 | 20 | 15 | 10,
    propertyType,
    propertyUse: propertyUse || 'primary',
  }

  if (compareAll) {
    const comparison = comparePrograms(base)
    return NextResponse.json({ success: true, comparison })
  }

  const rate = calculateRate({ ...base, program: program as RateProgram })
  return NextResponse.json({ success: true, rate })
}

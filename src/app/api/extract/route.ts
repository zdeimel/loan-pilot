import { NextRequest, NextResponse } from 'next/server'
import { extractFromDocument } from '@/lib/server/azureDocIntelligence'

export const maxDuration = 60 // seconds — allow time for Azure DI polling

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const slotId = (formData.get('slotId') as string) ?? 'unknown'

    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    const extracted = await extractFromDocument(base64, slotId)

    return NextResponse.json({ success: true, extracted })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Extraction failed'

    // Config error — credentials not set
    if (message.includes('must be set')) {
      return NextResponse.json({ error: 'Azure DI not configured', detail: message }, { status: 503 })
    }

    return NextResponse.json({ error: 'Extraction failed', detail: message }, { status: 500 })
  }
}

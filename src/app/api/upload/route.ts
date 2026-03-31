import { NextRequest, NextResponse } from 'next/server'
// import { put } from '@vercel/blob'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const applicationId = formData.get('applicationId') as string
  const documentType = formData.get('documentType') as string

  if (!file || !applicationId) {
    return NextResponse.json({ error: 'file and applicationId are required' }, { status: 400 })
  }

  // In production with Vercel Blob:
  // const blob = await put(`applications/${applicationId}/${documentType}-${Date.now()}-${file.name}`, file, {
  //   access: 'private',
  //   addRandomSuffix: false,
  // })
  // return NextResponse.json({ success: true, url: blob.url, pathname: blob.pathname })

  // Mock upload — simulate 1s processing delay
  await new Promise(r => setTimeout(r, 1000))

  const mockUrl = `https://blob.vercel-storage.com/applications/${applicationId}/${documentType}-${Date.now()}`
  return NextResponse.json({
    success: true,
    url: mockUrl,
    name: file.name,
    size: file.size,
    type: file.type,
  })
}

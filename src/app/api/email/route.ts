import { NextRequest, NextResponse } from 'next/server'

// In production: use Resend (import { Resend } from 'resend')
// const resend = new Resend(process.env.RESEND_API_KEY)

export type EmailType = 'magic-link' | 'co-borrower-invite' | 'status-update' | 'document-request' | 'pre-approval' | 'rate-lock-expiry'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, to, data } = body as { type: EmailType; to: string; data: Record<string, string> }

  if (!type || !to) {
    return NextResponse.json({ error: 'type and to are required' }, { status: 400 })
  }

  const templates: Record<EmailType, { subject: string; body: string }> = {
    'magic-link': {
      subject: 'Resume your LoanPilot application',
      body: `Hi ${data.firstName ?? 'there'},\n\nClick the link below to resume your mortgage application:\n\n${data.link}\n\nThis link expires in 72 hours.\n\n— LoanPilot`,
    },
    'co-borrower-invite': {
      subject: `${data.borrowerName} has invited you to join their mortgage application`,
      body: `Hi ${data.coFirstName ?? 'there'},\n\n${data.borrowerName} is applying for a mortgage and has added you as a co-borrower.\n\nClick here to complete your section:\n\n${data.link}\n\n— LoanPilot`,
    },
    'status-update': {
      subject: `Your loan application has been updated`,
      body: `Hi ${data.firstName ?? 'there'},\n\nYour application status has been updated to: ${data.status}\n\n${data.message ?? ''}\n\nView your application: ${data.link}\n\n— LoanPilot`,
    },
    'document-request': {
      subject: `Action required: Documents needed for your mortgage application`,
      body: `Hi ${data.firstName ?? 'there'},\n\nYour loan officer has requested the following documents:\n\n${data.documents}\n\nUpload here: ${data.link}\n\n— LoanPilot`,
    },
    'pre-approval': {
      subject: `Your pre-approval letter is ready`,
      body: `Hi ${data.firstName ?? 'there'},\n\nGreat news — your pre-approval letter is ready!\n\nYou are pre-approved for a mortgage up to ${data.amount}.\n\nDownload your letter: ${data.link}\n\n— LoanPilot`,
    },
    'rate-lock-expiry': {
      subject: `⚠️ Your rate lock expires in 72 hours`,
      body: `Hi ${data.firstName ?? 'there'},\n\nYour rate lock of ${data.rate}% expires on ${data.expiryDate}.\n\nContact your loan officer immediately to discuss extension options.\n\n— LoanPilot`,
    },
  }

  const template = templates[type]

  // In production:
  // const result = await resend.emails.send({
  //   from: 'LoanPilot <noreply@loanpilot.com>',
  //   to, subject: template.subject, text: template.body,
  // })

  // Mock response for development
  console.log(`[EMAIL] Sending ${type} to ${to}: ${template.subject}`)
  return NextResponse.json({
    success: true,
    messageId: `mock-${Date.now()}`,
    preview: { subject: template.subject, body: template.body },
  })
}

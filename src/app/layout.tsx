import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'LoanPilot — The Smarter Way to Get a Mortgage',
    template: '%s | LoanPilot',
  },
  description:
    'Get pre-approved for a mortgage in minutes with guided, step-by-step help. LoanPilot makes home financing simple, fast, and stress-free.',
  keywords: ['mortgage', 'home loan', 'pre-approval', 'refinance', 'FHA', 'conventional loan'],
  openGraph: {
    title: 'LoanPilot — The Smarter Way to Get a Mortgage',
    description: 'Get pre-approved in minutes. Guided, intelligent mortgage application.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  )
}

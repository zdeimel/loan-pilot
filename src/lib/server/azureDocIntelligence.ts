import 'server-only'
import type { ExtractedDocumentData } from '@/lib/store/applicationStore'

const API_VERSION = '2024-11-30'

function getCredentials() {
  const endpoint = process.env.AZURE_DI_ENDPOINT
  const key = process.env.AZURE_DI_KEY
  if (!endpoint || !key) {
    throw new Error('AZURE_DI_ENDPOINT and AZURE_DI_KEY must be set')
  }
  return { endpoint: endpoint.replace(/\/$/, ''), key }
}

// Submit a document for analysis and poll until complete
async function analyzeDocument(base64Source: string, modelId = 'prebuilt-document'): Promise<AzureAnalyzeResult> {
  const { endpoint, key } = getCredentials()

  const submitRes = await fetch(
    `${endpoint}/documentintelligence/documentModels/${modelId}:analyze?api-version=${API_VERSION}`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Source }),
    }
  )

  if (!submitRes.ok) {
    const body = await submitRes.text()
    throw new Error(`Azure DI submit failed (${submitRes.status}): ${body}`)
  }

  const operationUrl = submitRes.headers.get('Operation-Location')
  if (!operationUrl) throw new Error('Azure DI did not return Operation-Location header')

  // Poll up to 45 seconds
  for (let i = 0; i < 45; i++) {
    await new Promise((r) => setTimeout(r, 1000))
    const pollRes = await fetch(operationUrl, {
      headers: { 'Ocp-Apim-Subscription-Key': key },
    })
    const json = await pollRes.json()
    if (json.status === 'succeeded') return json.analyzeResult as AzureAnalyzeResult
    if (json.status === 'failed') throw new Error('Azure DI analysis failed: ' + JSON.stringify(json.error))
  }

  throw new Error('Azure DI timed out after 45 seconds')
}

// Raw Azure DI result types (minimal — only fields we use)
interface AzureKeyValuePair {
  key: { content: string }
  value?: { content: string }
  confidence?: number
}

interface AzureAnalyzeResult {
  content: string
  keyValuePairs?: AzureKeyValuePair[]
}

// ─── Field extraction helpers ──────────────────────────────────────────────────

function kvMap(pairs: AzureKeyValuePair[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const pair of pairs) {
    if (pair.value?.content) {
      map[pair.key.content.toLowerCase().trim()] = pair.value.content.trim()
    }
  }
  return map
}

function findInText(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return match[1].trim()
  }
  return undefined
}

function parseMoney(raw: string | undefined): number | undefined {
  if (!raw) return undefined
  const n = parseFloat(raw.replace(/[$,\s]/g, ''))
  return isNaN(n) ? undefined : n
}

// ─── Main extraction function ──────────────────────────────────────────────────

export async function extractFromDocument(
  base64Source: string,
  slotId: string
): Promise<Partial<ExtractedDocumentData>> {
  // Choose model — W-2 slots get the specialized W-2 model
  const modelId = slotId.startsWith('w2') ? 'prebuilt-tax.us.w2' : 'prebuilt-document'

  const result = await analyzeDocument(base64Source, modelId)
  const text = result.content ?? ''
  const kv = kvMap(result.keyValuePairs ?? [])

  const extracted: Partial<ExtractedDocumentData> = {}

  // ── Name ────────────────────────────────────────────────────────────────────
  const fullName =
    kv["employee's name"] ??
    kv['name'] ??
    kv['employee name'] ??
    kv['full name'] ??
    kv['borrower name'] ??
    findInText(text, [
      /employee['']s name[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i,
      /name[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i,
    ])

  if (fullName) {
    const parts = fullName.split(/\s+/)
    if (parts.length >= 2) {
      extracted.firstName = parts[0]
      extracted.lastName = parts[parts.length - 1]
    }
  }

  // ── Date of birth ────────────────────────────────────────────────────────────
  const dob =
    kv['date of birth'] ??
    kv['dob'] ??
    kv['birth date'] ??
    findInText(text, [/(?:date of birth|dob)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i])

  if (dob) extracted.dob = dob

  // ── Address ──────────────────────────────────────────────────────────────────
  const street =
    kv['address'] ??
    kv['street address'] ??
    kv["employee's address"] ??
    kv["employee's address and zip code"] ??
    findInText(text, [/(\d+ [A-Za-z0-9 ]+(?:St|Ave|Blvd|Dr|Rd|Ln|Ct|Way|Pl|Circle|Cir)[.,]?)/i])

  if (street) {
    // Try to parse city/state/zip from the street value if it contains them
    const cityStateZip = street.match(/^(.+),\s*([A-Z]{2})\s+(\d{5})$/)
    if (cityStateZip) {
      extracted.street = cityStateZip[1]
      extracted.city = kv['city'] ?? ''
      extracted.state = cityStateZip[2]
      extracted.zip = cityStateZip[3]
    } else {
      extracted.street = street
    }
  }

  const city = kv['city'] ?? findInText(text, [/city[:\s]+([A-Za-z\s]+?)(?:,|\n)/i])
  if (city) extracted.city = city

  const state = kv['state'] ?? findInText(text, [/\b([A-Z]{2})\s+\d{5}/])
  if (state) extracted.state = state

  const zip = kv['zip'] ?? kv['zip code'] ?? kv['postal code'] ?? findInText(text, [/\b(\d{5})(?:-\d{4})?\b/])
  if (zip) extracted.zip = zip

  // ── Employer ─────────────────────────────────────────────────────────────────
  const employerName =
    kv["employer's name"] ??
    kv['employer name'] ??
    kv['company name'] ??
    kv['employer'] ??
    findInText(text, [/employer['']?s?\s+name[:\s]+(.+)/i])

  if (employerName) extracted.employerName = employerName

  const ein =
    kv["employer's ein"] ??
    kv['ein'] ??
    kv["employer's federal ein"] ??
    findInText(text, [/\b(\d{2}-\d{7})\b/])

  if (ein) extracted.employerEIN = ein

  // ── Income ───────────────────────────────────────────────────────────────────
  const wages =
    kv['wages, tips, other comp.'] ??
    kv['wages, tips, other compensation'] ??
    kv['box 1'] ??
    kv['1 wages, tips, other comp'] ??
    kv['gross pay'] ??
    kv['gross wages'] ??
    findInText(text, [
      /wages,?\s*tips[^$\n]*?(\$[\d,]+\.?\d*)/i,
      /box\s*1[:\s]+(\$[\d,]+\.?\d*)/i,
      /gross(?:\s+annual)?\s+(?:wages|pay|income)[:\s]+(\$[\d,]+\.?\d*)/i,
    ])

  if (wages) {
    const amount = parseMoney(wages)
    if (amount) {
      extracted.annualIncome = amount
      extracted.monthlyIncome = Math.round(amount / 12)
    }
  }

  // YTD gross from pay stubs
  const ytd =
    kv['ytd gross'] ??
    kv['year to date gross'] ??
    kv['ytd earnings'] ??
    findInText(text, [/ytd\s+gross[:\s]+(\$[\d,]+\.?\d*)/i, /year.to.date[:\s]+(\$[\d,]+\.?\d*)/i])

  if (ytd) extracted.ytdGross = parseMoney(ytd)

  // AGI from tax returns
  const agi =
    kv['adjusted gross income'] ??
    kv['agi'] ??
    kv['line 11'] ??
    findInText(text, [/adjusted gross income[:\s]+(\$[\d,]+\.?\d*)/i, /line\s+11[:\s]+(\$[\d,]+\.?\d*)/i])

  if (agi) extracted.agi = parseMoney(agi)

  // Filing status
  const filingStatus =
    kv['filing status'] ??
    findInText(text, [/filing status[:\s]+(.+?)(?:\n|$)/i])

  if (filingStatus) extracted.filingStatus = filingStatus

  // ── Bank statement ────────────────────────────────────────────────────────────
  const bankName =
    kv['bank name'] ??
    kv['financial institution'] ??
    findInText(text, [/(?:account\s+holder|bank)[:\s]+([A-Za-z ]+)/i])

  if (bankName && slotId === 'bank-stmt-1') extracted.bankName = bankName
  if (bankName && slotId === 'bank-stmt-2') extracted.bankName2 = bankName

  const balance =
    kv['ending balance'] ??
    kv['closing balance'] ??
    kv['available balance'] ??
    kv['current balance'] ??
    findInText(text, [/(?:ending|closing|available|current)\s+balance[:\s]+(\$[\d,]+\.?\d*)/i])

  if (balance && slotId === 'bank-stmt-1') extracted.balance = parseMoney(balance)
  if (balance && slotId === 'bank-stmt-2') extracted.balance2 = parseMoney(balance)

  // Account last four
  const acctMatch = text.match(/(?:account|acct)[^0-9]*(\d{4})(?!\d)/i)
  if (acctMatch) {
    if (slotId === 'bank-stmt-1') extracted.accountLastFour = acctMatch[1]
    if (slotId === 'bank-stmt-2') extracted.accountLastFour2 = acctMatch[1]
  }

  return extracted
}

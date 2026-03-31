// ─── PII Encryption Utilities ─────────────────────────────────────────────────
// SSNs, DOBs, and other sensitive fields must be encrypted at rest.
// Uses AES-256-GCM via the Web Crypto API (works in Edge Runtime).
// Key is stored in PII_ENCRYPTION_KEY env var (32-byte hex string).

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes.buffer as ArrayBuffer
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function getKey(): Promise<CryptoKey> {
  const keyHex = process.env.PII_ENCRYPTION_KEY
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('PII_ENCRYPTION_KEY must be set to a 64-char hex string (32 bytes)')
  }
  return crypto.subtle.importKey(
    'raw',
    hexToBuffer(keyHex),
    { name: ALGORITHM },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptPII(plaintext: string): Promise<string> {
  const key = await getKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const ciphertext = await crypto.subtle.encrypt({ name: ALGORITHM, iv: iv as unknown as BufferSource }, key, encoded)
  return `${bufferToHex(iv.buffer as ArrayBuffer)}:${bufferToHex(ciphertext)}`
}

export async function decryptPII(encrypted: string): Promise<string> {
  const [ivHex, ciphertextHex] = encrypted.split(':')
  if (!ivHex || !ciphertextHex) throw new Error('Invalid encrypted PII format')
  const key = await getKey()
  const iv = hexToBuffer(ivHex)
  const ciphertext = hexToBuffer(ciphertextHex)
  const plaintext = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, ciphertext)
  return new TextDecoder().decode(new Uint8Array(plaintext as ArrayBuffer))
}

// Mask SSN for display: 123-45-6789 → ***-**-6789
export function maskSSN(ssn: string): string {
  const digits = ssn.replace(/\D/g, '')
  if (digits.length !== 9) return '***-**-****'
  return `***-**-${digits.slice(5)}`
}

// Mask DOB for display: 1990-03-15 → **/**/1990
export function maskDOB(dob: string): string {
  const parts = dob.split('-')
  if (parts.length !== 3) return '**/**/****'
  return `**/**/${parts[0]}`
}

// Generate PII encryption key (run once, store as env var)
export function generateEncryptionKey(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return bufferToHex(bytes.buffer as ArrayBuffer)
}

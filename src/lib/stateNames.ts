/**
 * iSoftPull requires full state names, e.g. "North Carolina" not "NC".
 * This map converts the two-letter USPS abbreviations stored in our
 * Address model to the full names the API expects.
 */
export const STATE_ABBREVIATION_TO_FULL: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas',
  CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho',
  IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',
  KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',
  VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',
  WI: 'Wisconsin', WY: 'Wyoming', DC: 'District of Columbia',
}

/**
 * Returns the full state name for a given two-letter abbreviation.
 * If the input is already a full name (length > 2), it is returned as-is.
 * If the abbreviation is not recognized, the original value is returned
 * so the API call still proceeds rather than silently dropping the field.
 */
export function toFullStateName(state: string): string {
  if (!state) return ''
  const trimmed = state.trim()
  if (trimmed.length > 2) return trimmed          // already full name
  return STATE_ABBREVIATION_TO_FULL[trimmed.toUpperCase()] ?? trimmed
}

/**
 * Strip all non-digit characters from an SSN string.
 * iSoftPull requires digits only — no dashes, no spaces.
 * e.g. "123-45-6789" → "123456789"
 */
export function stripSsnDashes(ssn: string): string {
  return ssn.replace(/\D/g, '')
}

/**
 * Normalize a date of birth to mm/dd/yyyy as required by iSoftPull.
 * Accepts common formats: yyyy-mm-dd, mm/dd/yyyy, mm-dd-yyyy.
 * Returns empty string if the input cannot be parsed.
 */
export function normalizeDob(dob: string): string {
  if (!dob) return ''

  // Already in mm/dd/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) return dob

  // yyyy-mm-dd  (ISO 8601)
  const iso = dob.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) return `${iso[2]}/${iso[3]}/${iso[1]}`

  // mm-dd-yyyy
  const mdy = dob.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (mdy) return `${mdy[1]}/${mdy[2]}/${mdy[3]}`

  return ''
}

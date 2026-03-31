// ─── Audit Logging ────────────────────────────────────────────────────────────
// Every access to sensitive data (SSN, credit reports, documents) must be logged.
// This is both a regulatory requirement and a security best practice.

export type AuditAction =
  | 'VIEW_APPLICATION'
  | 'UPDATE_APPLICATION'
  | 'VIEW_SSN'
  | 'VIEW_DOB'
  | 'PULL_CREDIT'
  | 'RUN_AUS'
  | 'UPLOAD_DOCUMENT'
  | 'VIEW_DOCUMENT'
  | 'DELETE_DOCUMENT'
  | 'SUBMIT_APPLICATION'
  | 'VIEW_PRE_APPROVAL'
  | 'SEND_EMAIL'
  | 'LO_ACCESS_APPLICATION'
  | 'EXPORT_HMDA'
  | 'LOCK_RATE'
  | 'CLEAR_CONDITION'
  | 'CREATE_CONDITION'

export interface AuditEntry {
  userId: string
  applicationId?: string
  action: AuditAction
  entityType: string
  entityId: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

// In-memory store for development (replace with DB write in production)
const auditLog: (AuditEntry & { createdAt: string })[] = []

export function logAudit(entry: AuditEntry): void {
  const record = { ...entry, createdAt: new Date().toISOString() }
  auditLog.push(record)

  // In production: await prisma.auditLog.create({ data: record })
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AUDIT] ${record.action} by ${record.userId} on ${record.entityType}:${record.entityId}`)
  }
}

export function getAuditLog(applicationId: string) {
  return auditLog.filter(e => e.applicationId === applicationId)
}

export function getAuditLogByUser(userId: string) {
  return auditLog.filter(e => e.userId === userId)
}

// Document access sensitivity levels
export const SENSITIVE_ACTIONS: AuditAction[] = [
  'VIEW_SSN',
  'VIEW_DOB',
  'PULL_CREDIT',
  'RUN_AUS',
  'VIEW_DOCUMENT',
  'EXPORT_HMDA',
]

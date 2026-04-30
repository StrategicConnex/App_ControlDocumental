import type { SupabaseClient } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────
export type AuditAction =
  | 'create' | 'update' | 'delete' | 'view'
  | 'approve' | 'reject' | 'upload' | 'download'
  | 'version_create' | 'status_change' | 'login' | 'logout';

export type AuditEntityType =
  | 'document' | 'legajo' | 'personnel' | 'vehicle'
  | 'budget' | 'user' | 'alert';

export interface AuditEntry {
  id?: string;
  actor_id: string;
  actor_email: string;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string;
  entity_title?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  ip_address?: string;
  created_at?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Registers an immutable audit log entry.
 * Fails silently — auditing must never break the main flow.
 */
export async function logAuditEvent(
  supabase: SupabaseClient,
  entry: Omit<AuditEntry, 'id' | 'created_at'>
): Promise<void> {
  try {
    const { error } = await supabase.from('audit_log').insert(entry);
    if (error) {
      // Log to console but never throw — audit must be non-blocking
      console.warn('[AuditLog] Failed to write entry:', error.message);
    }
  } catch {
    // Silently ignore — audit trail failure should never crash the app
  }
}

/**
 * Retrieves audit log entries for a specific entity.
 */
export async function getAuditLog(
  supabase: SupabaseClient,
  entityType: AuditEntityType,
  entityId: string,
  limit = 50
): Promise<AuditEntry[]> {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/**
 * Retrieves the full audit log (admin only).
 */
export async function getFullAuditLog(
  supabase: SupabaseClient,
  filters: {
    entityType?: AuditEntityType;
    actorId?: string;
    action?: AuditAction;
    fromDate?: string;
    toDate?: string;
    limit?: number;
  } = {}
): Promise<AuditEntry[]> {
  let query = supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(filters.limit ?? 200);

  if (filters.entityType) query = query.eq('entity_type', filters.entityType);
  if (filters.actorId)   query = query.eq('actor_id', filters.actorId);
  if (filters.action)    query = query.eq('action', filters.action);
  if (filters.fromDate)  query = query.gte('created_at', filters.fromDate);
  if (filters.toDate)    query = query.lte('created_at', filters.toDate);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

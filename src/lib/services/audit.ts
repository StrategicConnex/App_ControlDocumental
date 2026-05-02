import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export type AuditEventType = 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'DOC_CREATED' 
  | 'DOC_UPDATED' 
  | 'DOC_DELETED' 
  | 'DOC_SIGNED' 
  | 'DOC_APPROVED' 
  | 'DOC_REJECTED' 
  | 'VERSION_CREATED'
  | 'USER_ROLE_CHANGED'
  | 'ORG_SETTINGS_UPDATED';

export type ResourceType = 'DOCUMENT' | 'USER' | 'ORGANIZATION' | 'SIGNATURE' | 'AUTH';

export interface AuditLogPayload {
  org_id: string;
  user_id: string;
  event_type: AuditEventType;
  resource_type: ResourceType;
  resource_id?: string;
  old_value?: any;
  new_value?: any;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Service to record audit logs in the system.
 */
export async function recordAuditLog(
  supabase: SupabaseClient<Database>,
  payload: AuditLogPayload
): Promise<void> {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        org_id: payload.org_id,
        user_id: payload.user_id,
        event_type: payload.event_type,
        resource_type: payload.resource_type,
        resource_id: payload.resource_id ?? null,
        old_value: payload.old_value ?? null,
        new_value: payload.new_value ?? null,
        metadata: payload.metadata ?? {},
        ip_address: payload.ip_address ?? null,
        user_agent: payload.user_agent ?? null,
      });

    if (error) {
      console.error('Failed to record audit log:', error);
    }
  } catch (err) {
    console.error('Critical error in audit service:', err);
  }
}

/**
 * Hook to record document-specific audit events.
 */
export async function recordDocumentAudit(
  supabase: SupabaseClient<Database>,
  params: {
    org_id: string;
    user_id: string;
    document_id: string;
    event: 'DOC_CREATED' | 'DOC_UPDATED' | 'DOC_SIGNED' | 'DOC_APPROVED' | 'DOC_REJECTED';
    oldData?: any;
    newData?: any;
    ip?: string;
  }
) {
  return recordAuditLog(supabase, {
    org_id: params.org_id,
    user_id: params.user_id,
    event_type: params.event,
    resource_type: 'DOCUMENT',
    resource_id: params.document_id,
    old_value: params.oldData,
    new_value: params.newData,
    ip_address: params.ip,
  });
}

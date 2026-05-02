import type { SupabaseClient } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ApprovalAction = 'approve' | 'reject' | 'request_changes';

export interface DocumentApproval {
  id: string;
  document_id: string;
  approver_id: string;
  action: ApprovalAction;
  notes: string | null;
  signed_at: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Submits a document for review.
 * Transitions: borrador → revision
 */
export async function submitForReview(
  supabase: SupabaseClient,
  documentId: string
): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .update({ status: 'revision' })
    .eq('id', documentId);

  if (error) throw error;
}

/**
 * Records an approval decision and updates document status.
 * Requires a quorum of 2 approvals to mark as 'aprobado'.
 */
export async function recordApprovalDecision(
  supabase: SupabaseClient,
  payload: {
    document_id: string;
    approver_id: string;
    action: ApprovalAction;
    notes?: string;
  }
): Promise<void> {
  // Offline check
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const { addToQueue } = await import('../offline/queue');
    await addToQueue({
      type: 'add_approval',
      payload
    });
    console.log('Aprobación guardada localmente (Offline)');
    return;
  }

  // 1. Record the approval action
  const { error: insertError } = await supabase
    .from('approvals')
    .insert({
      document_id: payload.document_id,
      approved_by: payload.approver_id,
      status: payload.action === 'approve' ? 'aprobado' : payload.action === 'reject' ? 'rechazado' : 'en_revision',
      comment: payload.notes ?? null,
      approved_at: new Date().toISOString(),
    });

  if (insertError) throw insertError;

  // 2. Check if we reached the quorum (2 approvals)
  if (payload.action === 'approve') {
    const { data: currentApprovals, error: countError } = await supabase
      .from('approvals')
      .select('id')
      .eq('document_id', payload.document_id)
      .eq('status', 'aprobado');

    if (countError) throw countError;

    const quorumMet = (currentApprovals?.length ?? 0) >= 2;

    if (quorumMet) {
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          status: 'aprobado',
          updated_at: new Date().toISOString()
        })
        .eq('id', payload.document_id);

      if (updateError) throw updateError;
    } else {
      // Stays in revision until second approval
      await supabase
        .from('documents')
        .update({ status: 'revision' })
        .eq('id', payload.document_id);
    }
  } else if (payload.action === 'reject') {
    const { error: updateError } = await supabase
      .from('documents')
      .update({ status: 'borrador' })
      .eq('id', payload.document_id);

    if (updateError) throw updateError;
  } else if (payload.action === 'request_changes') {
    const { error: updateError } = await supabase
      .from('documents')
      .update({ status: 'borrador' })
      .eq('id', payload.document_id);

    if (updateError) throw updateError;
  }
}

/**
 * Gets all approval records for a document (audit trail).
 */
export async function getDocumentApprovals(
  supabase: SupabaseClient,
  documentId: string
): Promise<DocumentApproval[]> {
  const { data, error } = await supabase
    .from('approvals')
    .select('*')
    .eq('document_id', documentId)
    .order('approved_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Gets count of documents pending review (for notifications badge).
 * Filters by org_id to prevent cross-org data leakage.
 */
export async function getPendingReviewCount(
  supabase: SupabaseClient,
  orgId?: string
): Promise<number> {
  let query = supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'revision');

  if (orgId) {
    query = query.eq('org_id', orgId);
  }

  const { count, error } = await query;

  if (error) return 0;
  return count ?? 0;
}

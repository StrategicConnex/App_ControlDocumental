import type { SupabaseClient } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  version_label: string;   // e.g. "v1.0", "v2.1"
  file_url: string | null;
  change_description: string;
  change_type: 'major' | 'minor' | 'patch';
  created_by: string | null;
  created_at: string;
  is_current: boolean;
}

// ─── Version label helpers ─────────────────────────────────────────────────────

/**
 * Parses a version label like "v2.1" → { major: 2, minor: 1 }
 */
export function parseVersionLabel(label: string): { major: number; minor: number } {
  const clean = label.replace(/^v/, '');
  const [major = 1, minor = 0] = clean.split('.').map(Number);
  return { major, minor };
}

/**
 * Generates the next version label based on change type.
 * "v1.2" + major → "v2.0"
 * "v1.2" + minor → "v1.3"
 */
export function nextVersionLabel(
  currentLabel: string,
  changeType: 'major' | 'minor'
): string {
  const { major, minor } = parseVersionLabel(currentLabel);
  if (changeType === 'major') return `v${major + 1}.0`;
  return `v${major}.${minor + 1}`;
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Gets all versions for a document, newest first.
 */
export async function getDocumentVersions(
  supabase: SupabaseClient,
  documentId: string
): Promise<DocumentVersion[]> {
  const { data, error } = await supabase
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('version_number', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Creates a new version and marks it as current.
 * Automatically marks the previous version as non-current.
 */
export async function createDocumentVersion(
  supabase: SupabaseClient,
  payload: {
    document_id: string;
    current_version_label: string;
    change_type: 'major' | 'minor';
    change_description: string;
    file_url?: string;
    created_by: string;
    fileBlob?: Blob; // Added for offline support
    fileName?: string;
  }
): Promise<DocumentVersion | null> {
  // Offline check
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const { addToQueue } = await import('../offline/queue');
    await addToQueue({
      type: 'upload_document',
      payload: {
        ...payload,
        fileType: payload.fileBlob?.type
      }
    });
    console.log('Versión guardada localmente para subida diferida (Offline)');
    return null;
  }

  const newLabel = nextVersionLabel(payload.current_version_label, payload.change_type);
  const { major, minor } = parseVersionLabel(newLabel);
  const versionNumber = major * 100 + minor; // 2.1 → 201

  // 1. Mark all existing versions as non-current
  await supabase
    .from('document_versions')
    .update({ is_current: false })
    .eq('document_id', payload.document_id);

  // 2. Insert new version
  const { data, error } = await supabase
    .from('document_versions')
    .insert({
      document_id:      payload.document_id,
      version_number:   versionNumber,
      version_label:    newLabel,
      file_url:         payload.file_url ?? null,
      change_description: payload.change_description,
      change_type:      payload.change_type,
      created_by:       payload.created_by,
      is_current:       true,
    })
    .select()
    .single();

  if (error) throw error;

  // 3. Update document's current_version field
  await supabase
    .from('documents')
    .update({ current_version: major })
    .eq('id', payload.document_id);

  // 4. Trigger AI Pipeline (Asynchronous)
  // We don't await this to avoid blocking the main UI flow
  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', payload.created_by).single();
  
  if (profile?.org_id) {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/ai/pipeline/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ versionId: data.id, orgId: profile.org_id })
    }).catch(err => console.error('Error triggering AI Pipeline:', err));
  }

  return data;
}
/**
 * Restores a document to a previous version.
 * Uses the database RPC function to avoid data duplication.
 */
export async function rollbackDocumentVersion(
  supabase: SupabaseClient,
  documentId: string,
  targetVersion: number
): Promise<string> {
  const { data, error } = await supabase.rpc('restore_document_version', {
    p_document_id: documentId,
    p_target_version: targetVersion
  });

  if (error) throw error;
  return data; // returns the new version ID
}

import type { SupabaseClient } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  version_label: string;
  file_url: string | null;
  change_description: string | null;
  change_type: 'major' | 'minor' | 'patch';
  created_by: string | null;
  created_at: string;
  is_current: boolean;
}

// ─── Version helpers ──────────────────────────────────────────────────────────

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
 */
export function nextVersionLabel(
  currentLabel: string,
  changeType: 'major' | 'minor'
): string {
  const { major, minor } = parseVersionLabel(currentLabel);
  if (changeType === 'major') return `v${major + 1}.0`;
  return `v${major}.${minor + 1}`;
}

// ─── Document Service ─────────────────────────────────────────────────────────

export async function getDocuments(supabase: SupabaseClient, orgId?: string, category?: string) {
  let query = supabase
    .from('documents')
    .select(`
      *,
      profiles:created_by (id, full_name, first_name, last_name),
      approvals(count)
    `)
    .order('created_at', { ascending: false });

  if (orgId) {
    query = query.eq('org_id', orgId);
  }
  if (category && category !== 'Todos') {
    query = query.filter('metadata->>category', 'eq', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getDocumentById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      profiles:created_by (id, full_name, first_name, last_name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getDocumentVersions(supabase: SupabaseClient, documentId: string): Promise<DocumentVersion[]> {
  const { data, error } = await supabase
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('version_number', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Uploads a file and creates a new version record.
 * Simpler version for basic uploads.
 */
export async function uploadNewVersion(
  supabase: SupabaseClient,
  documentId: string,
  file: File,
  userId: string,
  currentVersion: number
) {
  const fileExt = file.name.split('.').pop();
  const filePath = `${documentId}/${Date.now()}.${fileExt}`;

  // 1. Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);

  // 2. Mark all existing versions as non-current
  const { error: deactivateError } = await supabase
    .from('document_versions')
    .update({ is_current: false })
    .eq('document_id', documentId)
    .eq('is_current', true);

  if (deactivateError) throw deactivateError;

  // 3. Create new version record
  const nextVersion = currentVersion + 1;
  const { error: versionError } = await supabase
    .from('document_versions')
    .insert({
      document_id: documentId,
      version_number: nextVersion,
      version_label: `v${nextVersion}.0`,
      file_url: publicUrl,
      created_by: userId,
      change_description: `Actualización a v${nextVersion}.0`,
      is_current: true
    });

  if (versionError) throw versionError;

  // 4. Update main document
  const { error: updateError } = await supabase
    .from('documents')
    .update({
      file_url: publicUrl,
      current_version: nextVersion,
      status: 'revision',
      updated_at: new Date().toISOString()
    })
    .eq('id', documentId);

  if (updateError) throw updateError;

  return publicUrl;
}

/**
 * Creates a new version and marks it as current.
 * Used by UI and offline sync.
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
    fileBlob?: Blob;
    fileName?: string;
  }
): Promise<DocumentVersion | null> {
  // Offline check (only if browser environment)
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
  const versionNumber = major * 100 + minor;

  // 1. Mark all existing versions as non-current
  const { error: deactivateError } = await supabase
    .from('document_versions')
    .update({ is_current: false })
    .eq('document_id', payload.document_id)
    .eq('is_current', true);

  if (deactivateError) throw deactivateError;

  // 2. Insert new version (mark old versions as non-current first)
  const { data, error } = await supabase
    .from('document_versions')
    .insert({
      document_id: payload.document_id,
      version_number: versionNumber,
      version_label: newLabel,
      file_url: payload.file_url ?? null,
      change_description: payload.change_description,
      change_type: payload.change_type,
      created_by: payload.created_by,
      is_current: true,
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
 * Restores a document to a previous version using RPC.
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
  return data;
}

import type { SupabaseClient } from '@supabase/supabase-js';

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
    // Si no hay columna category, podemos filtrar por metadata si se guarda ahí
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

export async function getDocumentVersions(supabase: SupabaseClient, documentId: string) {
  const { data, error } = await supabase
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('version_number', { ascending: false });

  if (error) throw error;
  return data;
}

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

  // 2. Create new version record
  const nextVersion = currentVersion + 1;
  const { error: versionError } = await supabase
    .from('document_versions')
    .insert({
      document_id: documentId,
      version_number: nextVersion,
      file_path: publicUrl,
      uploaded_by: userId,
      change_note: `Actualización a v${nextVersion}.0`
    });

  if (versionError) throw versionError;

  // 3. Update main document
  const { error: updateError } = await supabase
    .from('documents')
    .update({
      file_url: publicUrl,
      current_version: nextVersion,
      status: 'pendiente',
      updated_at: new Date().toISOString()
    })
    .eq('id', documentId);

  if (updateError) throw updateError;

  return publicUrl;
}

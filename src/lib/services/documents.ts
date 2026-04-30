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

import { SupabaseClient } from '@supabase/supabase-js';

export async function getDocuments(supabase: SupabaseClient, orgId?: string, category?: string) {
  let query = supabase
    .from('documents')
    .select(`
      *,
      profiles:uploaded_by (first_name, last_name)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (orgId) {
    query = query.eq('org_id', orgId);
  }
  if (category && category !== 'Todos') {
    query = query.eq('category', category);
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
      profiles:uploaded_by (first_name, last_name)
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

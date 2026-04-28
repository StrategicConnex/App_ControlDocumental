import { SupabaseClient } from '@supabase/supabase-js';

export async function getLegajos(supabase: SupabaseClient, orgId?: string) {
  let query = supabase
    .from('legajos')
    .select('*')
    .order('created_at', { ascending: false });

  if (orgId) {
    query = query.eq('org_id', orgId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getLegajoById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('legajos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createLegajo(
  supabase: SupabaseClient,
  payload: {
    title: string;
    description?: string;
    org_id?: string;
    status?: string;
  }
) {
  const { data, error } = await supabase
    .from('legajos')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateLegajoStatus(
  supabase: SupabaseClient,
  id: string,
  status: string
) {
  const { data, error } = await supabase
    .from('legajos')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
/**
 * Validates if a legajo meets the requirements for a specific operadora.
 * RF-10: Fichas Estructuradas por Operadora
 */
export function validateLegajoForOperadora(
  operadora: 'YPF' | 'PAE' | 'VISTA' | 'CHEVRON',
  data: any
): { valid: boolean; missingFields: string[] } {
  const requirements: Record<string, string[]> = {
    YPF: ['cert_art', 'seguro_vida', 'induccion_hseq'],
    PAE: ['cert_art', 'induccion_golfo', 'licencia_conducir_especial'],
    VISTA: ['cert_art', 'vtv_yacimiento', 'curso_manejo_defensivo'],
    CHEVRON: ['cert_art', 'antecedentes_penales', 'test_psicotecnico']
  };

  const missingFields = requirements[operadora].filter(field => !data[field]);
  
  return {
    valid: missingFields.length === 0,
    missingFields
  };
}

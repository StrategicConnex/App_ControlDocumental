import { SupabaseClient } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SearchResult {
  id: string;
  title: string;
  module: 'document' | 'legajo' | 'personnel' | 'vehicle' | 'budget';
  status: string;
  href: string;
  subtitle?: string;
}

export interface SearchFilters {
  query?: string;
  status?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  module?: SearchResult['module'];
}

// ─── Global Search ────────────────────────────────────────────────────────────

/**
 * Performs a global search across all modules.
 * Returns grouped results ordered by relevance.
 */
export async function globalSearch(
  supabase: SupabaseClient,
  query: string
): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim().toLowerCase();
  const results: SearchResult[] = [];

  // Run all searches in parallel
  const [docs, personnel, vehicles, budgets, legajos] = await Promise.allSettled([
    supabase
      .from('documents')
      .select('id, title, code, status, category')
      .or(`title.ilike.%${q}%,code.ilike.%${q}%,description.ilike.%${q}%`)
      .is('deleted_at', null)
      .limit(5),

    supabase
      .from('personnel')
      .select('id, first_name, last_name, cuil, status, job_title')
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,cuil.ilike.%${q}%`)
      .limit(5),

    supabase
      .from('vehicles')
      .select('id, license_plate, brand, model, status')
      .or(`license_plate.ilike.%${q}%,brand.ilike.%${q}%,model.ilike.%${q}%`)
      .limit(5),

    supabase
      .from('budgets')
      .select('id, title, status, total_amount')
      .ilike('title', `%${q}%`)
      .limit(5),

    supabase
      .from('legajos')
      .select('id, title, status, description')
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(5),
  ]);

  // Documents
  if (docs.status === 'fulfilled' && docs.value.data) {
    docs.value.data.forEach(d => results.push({
      id: d.id, module: 'document',
      title: d.title,
      subtitle: `${d.code} · ${d.category}`,
      status: d.status,
      href: `/documents/${d.id}`,
    }));
  }

  // Personnel
  if (personnel.status === 'fulfilled' && personnel.value.data) {
    personnel.value.data.forEach(p => results.push({
      id: p.id, module: 'personnel',
      title: `${p.first_name} ${p.last_name}`,
      subtitle: `${p.job_title} · CUIL: ${p.cuil}`,
      status: p.status,
      href: `/personnel/${p.id}`,
    }));
  }

  // Vehicles
  if (vehicles.status === 'fulfilled' && vehicles.value.data) {
    vehicles.value.data.forEach(v => results.push({
      id: v.id, module: 'vehicle',
      title: `${v.license_plate} — ${v.brand} ${v.model}`,
      status: v.status,
      href: `/vehicles/${v.id}`,
    }));
  }

  // Budgets
  if (budgets.status === 'fulfilled' && budgets.value.data) {
    budgets.value.data.forEach(b => results.push({
      id: b.id, module: 'budget',
      title: b.title,
      subtitle: `$${Number(b.total_amount).toLocaleString('es-AR')}`,
      status: b.status,
      href: `/budgets/${b.id}`,
    }));
  }

  // Legajos
  if (legajos.status === 'fulfilled' && legajos.value.data) {
    legajos.value.data.forEach(l => results.push({
      id: l.id, module: 'legajo',
      title: l.title,
      status: l.status,
      href: `/legajos/${l.id}`,
    }));
  }

  return results;
}

// ─── Compliance Metrics ────────────────────────────────────────────────────────

/**
 * Calculates compliance rate per module.
 * Used for the compliance dashboard (FASE 3).
 */
export async function getComplianceMetrics(supabase: SupabaseClient) {
  const [personnel, vehicles, docs] = await Promise.all([
    supabase.from('personnel').select('status'),
    supabase.from('vehicles').select('status'),
    supabase.from('documents').select('status').is('deleted_at', null),
  ]);

  const calcRate = (
    items: { status: string }[],
    validStatuses: string[]
  ) => {
    if (!items.length) return 0;
    const valid = items.filter(i => validStatuses.includes(i.status)).length;
    return Math.round((valid / items.length) * 100);
  };

  const personnelData = personnel.data ?? [];
  const vehiclesData  = vehicles.data ?? [];
  const docsData      = docs.data ?? [];

  return {
    personnel: {
      total:       personnelData.length,
      compliant:   personnelData.filter(p => p.status === 'vigente').length,
      atRisk:      personnelData.filter(p => p.status === 'por_vencer').length,
      blocked:     personnelData.filter(p => ['vencido', 'bloqueado'].includes(p.status)).length,
      rate:        calcRate(personnelData, ['vigente']),
    },
    vehicles: {
      total:       vehiclesData.length,
      compliant:   vehiclesData.filter(v => v.status === 'habilitado').length,
      atRisk:      vehiclesData.filter(v => v.status === 'por_vencer').length,
      blocked:     vehiclesData.filter(v => ['vencido', 'inhabilitado', 'bloqueado'].includes(v.status)).length,
      rate:        calcRate(vehiclesData, ['habilitado']),
    },
    documents: {
      total:       docsData.length,
      compliant:   docsData.filter(d => ['aprobado', 'publicado'].includes(d.status)).length,
      atRisk:      docsData.filter(d => d.status === 'por_vencer').length,
      blocked:     docsData.filter(d => ['vencido', 'obsoleto'].includes(d.status)).length,
      rate:        calcRate(docsData, ['aprobado', 'publicado']),
    },
    overall: {
      rate: calcRate(
        [...personnelData, ...vehiclesData, ...docsData],
        ['vigente', 'habilitado', 'aprobado', 'publicado']
      ),
    },
  };
}

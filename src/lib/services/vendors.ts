import { SupabaseClient } from '@supabase/supabase-js';

export interface VendorDocumentRequest {
  id: string;
  client_org_id: string;
  vendor_org_id: string;
  doc_type_id: string;
  frequency: 'ONCE' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  is_required: boolean;
  created_at: string;
  document_type?: {
    name: string;
    description: string;
  };
  client?: {
    name: string;
  };
}

/**
 * Fetches document requests assigned to the vendor.
 */
export async function getVendorRequests(supabase: SupabaseClient, vendorOrgId: string): Promise<VendorDocumentRequest[]> {
  const { data, error } = await supabase
    .from('vendor_document_requests')
    .select(`
      *,
      document_type:doc_type_id (name, description),
      client:client_org_id (name)
    `)
    .eq('vendor_org_id', vendorOrgId);

  if (error) {
    console.error('Error fetching vendor requests:', error);
    return [];
  }

  return data as VendorDocumentRequest[];
}

/**
 * Fetches the status of documents provided by the vendor.
 */
export async function getVendorComplianceSummary(supabase: SupabaseClient, vendorOrgId: string) {
  const { data: docs, error } = await supabase
    .from('documents')
    .select('status, expiry_date')
    .eq('org_id', vendorOrgId);

  if (error) return { approved: 0, pending: 0, expired: 0, total: 0 };

  return {
    approved: docs.filter(d => d.status === 'APPROVED' || d.status === 'aprobado').length,
    pending: docs.filter(d => d.status === 'PENDING' || d.status === 'pendiente').length,
    expired: docs.filter(d => d.status === 'EXPIRED' || d.status === 'vencido').length,
    total: docs.length
  };
}

/**
 * Creates a new vendor organization linked to the current client.
 */
export async function createVendor(
  supabase: SupabaseClient, 
  clientOrgId: string, 
  vendorData: { name: string; tax_id?: string; contact_email?: string }
) {
  const { data, error } = await supabase
    .from('organizations')
    .insert([{
      ...vendorData,
      is_vendor: true,
      parent_org_id: clientOrgId,
      status: 'ACTIVE'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Assigns a document requirement to a vendor.
 */
export async function assignDocumentToVendor(
  supabase: SupabaseClient,
  clientOrgId: string,
  vendorOrgId: string,
  docTypeId: string,
  frequency: 'ONCE' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' = 'ONCE'
) {
  const { data, error } = await supabase
    .from('vendor_document_requests')
    .insert([{
      client_org_id: clientOrgId,
      vendor_org_id: vendorOrgId,
      doc_type_id: docTypeId,
      frequency,
      is_required: true
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Approves a document and updates its status.
 */
export async function approveDocument(supabase: SupabaseClient, documentId: string) {
  const { data, error } = await supabase
    .from('documents')
    .update({ 
      status: 'APPROVED', 
      rejection_reason: null,
      updated_at: new Date().toISOString() 
    })
    .eq('id', documentId)
    .select()
    .single();

  if (error) throw error;

  // Create notification for the provider
  if (data.created_by) {
    await createNotification(supabase, {
      user_id: data.created_by,
      title: 'Documento Aprobado',
      message: `Tu documento "${data.title}" ha sido aprobado satisfactoriamente.`,
      type: 'SUCCESS',
      link: '/documents'
    });
  }

  return data;
}

/**
 * Rejects a document with a reason.
 */
export async function rejectDocument(supabase: SupabaseClient, documentId: string, reason: string) {
  const { data, error } = await supabase
    .from('documents')
    .update({ 
      status: 'REJECTED', 
      rejection_reason: reason,
      updated_at: new Date().toISOString() 
    })
    .eq('id', documentId)
    .select()
    .single();

  if (error) throw error;

  // Create notification for the provider
  if (data.created_by) {
    await createNotification(supabase, {
      user_id: data.created_by,
      title: 'Documento Rechazado',
      message: `Tu documento "${data.title}" ha sido rechazado. Motivo: ${reason}`,
      type: 'DANGER',
      link: '/documents'
    });
  }

  return data;
}

/**
 * Creates a system notification.
 */
export async function createNotification(supabase: SupabaseClient, notification: {
  user_id: string;
  title: string;
  message: string;
  type?: 'INFO' | 'WARNING' | 'SUCCESS' | 'DANGER';
  link?: string;
}) {
  const { error } = await supabase
    .from('notifications')
    .insert([notification]);

  if (error) {
    console.error('Error creating notification:', error);
  }
}

/**
 * Fetches all documents pending review for the current organization.
 */
export async function getPendingReviews(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      document_type:doc_type_id (name),
      profiles (full_name)
    `)
    .eq('status', 'PENDING');

  if (error) throw error;
  return data;
}

export async function getComplianceMatrix(supabase: SupabaseClient) {
  // 1. Get all vendors
  const { data: vendors } = await supabase
    .from('organizations')
    .select('id, name')
    .not('parent_org_id', 'is', null);

  if (!vendors) return { vendors: [], docTypes: [], matrix: {} };

  // 2. Get all active requests to know the columns
  const { data: requests } = await supabase
    .from('vendor_document_requests')
    .select('org_id, document_type')
    .eq('is_active', true);

  if (!requests) return { vendors: [], docTypes: [], matrix: {} };

  // Get unique document types for columns
  const docTypes = Array.from(new Set(requests.map(r => r.document_type))).sort();

  // 3. Get latest documents for these vendors
  const { data: documents } = await supabase
    .from('documents')
    .select('org_id, title, status, expiry_date')
    .order('created_at', { ascending: false });

  // 4. Build the matrix
  const matrix: Record<string, Record<string, any>> = {};
  const vendorsList = vendors || [];
  const requestsList = requests || [];
  const documentsList = documents || [];

  vendorsList.forEach(v => {
    matrix[v.id] = {};
    docTypes.forEach(dt => {
      const isRequired = requestsList.find(r => r.org_id === v.id && r.document_type === dt);
      
      if (!isRequired) {
        matrix[v.id][dt] = { status: 'NOT_REQUIRED' };
        return;
      }

      const doc = documentsList.find(d => d.org_id === v.id && d.title.includes(dt));

      if (!doc) {
        matrix[v.id][dt] = { status: 'MISSING' };
      } else {
        matrix[v.id][dt] = { 
          status: doc.status?.toUpperCase() || 'PENDIENTE',
          expiryDate: doc.expiry_date
        };
      }
    });
  });

  return { vendors, docTypes, matrix };
}

// --- RISK ALGORITHM CONFIGURATION ---
const RISK_WEIGHTS = {
  MISSING: 25,    // Grave: No hay rastro del documento
  EXPIRED: 20,    // Serio: Estuvo al día pero ya no
  REJECTED: 10,   // Atención: Se intentó cargar pero no cumple
  PENDING: 5      // Burocracia: Cargado pero no revisado
};

export async function getVendorRiskRanking(supabase: SupabaseClient) {
  // 1. Get all active vendors (organizations with parent)
  const { data: vendors } = await supabase
    .from('organizations')
    .select('id, name')
    .not('parent_org_id', 'is', null);

  if (!vendors) return [];

  // 2. Get all document requests and their statuses
  const { data: requests } = await supabase
    .from('vendor_document_requests')
    .select('org_id, document_type, is_active')
    .eq('is_active', true);

  const { data: documents } = await supabase
    .from('documents')
    .select('org_id, title, status, expiry_date');

  const ranking = vendors.map(vendor => {
    let score = 100;
    const vendorRequests = requests?.filter(r => r.org_id === vendor.id) || [];
    const vendorDocs = documents?.filter(d => d.org_id === vendor.id) || [];

    const stats = {
      approved: 0,
      expired: 0,
      missing: 0,
      pending: 0,
      rejected: 0
    };

    vendorRequests.forEach(req => {
      const doc = vendorDocs.find(d => d.title.includes(req.document_type));

      if (!doc) {
        score -= RISK_WEIGHTS.MISSING;
        stats.missing++;
      } else if (doc.status === 'rechazado') {
        score -= RISK_WEIGHTS.REJECTED;
        stats.rejected++;
      } else if (doc.status === 'pendiente') {
        score -= RISK_WEIGHTS.PENDING;
        stats.pending++;
      } else if (new Date(doc.expiry_date) < new Date()) {
        score -= RISK_WEIGHTS.EXPIRED;
        stats.expired++;
      } else {
        stats.approved++;
      }
    });

    // Clamp score
    score = Math.max(0, score);

    let riskLevel = 'BAJO';
    let color = 'emerald';
    if (score < 40) { riskLevel = 'CRÍTICO'; color = 'rose'; }
    else if (score < 75) { riskLevel = 'MEDIO'; color = 'amber'; }

    return {
      id: vendor.id,
      name: vendor.name,
      score,
      riskLevel,
      color,
      stats
    };
  });

  return ranking.sort((a, b) => a.score - b.score); // Worst first
}

export async function getVendorRiskHistory(supabase: SupabaseClient, orgId?: string) {
  let query = supabase
    .from('vendor_risk_snapshots')
    .select('score, captured_at, org_id')
    .order('captured_at', { ascending: true });

  if (orgId) {
    query = query.eq('org_id', orgId);
  }

  const { data } = await query;
  return data || [];
}

export async function getAISuggestions(supabase: SupabaseClient, orgId: string) {
  // 1. Fetch vendor metadata and current requests
  const { data: org } = await supabase
    .from('organizations')
    .select('name, metadata')
    .eq('id', orgId)
    .single();

  const { data: requests } = await supabase
    .from('vendor_document_requests')
    .select('document_type')
    .eq('org_id', orgId);

  const currentDocs = requests?.map(r => r.document_type) || [];
  const metadata = (org?.metadata as any) || {};
  const category = metadata.category || 'General';

  const suggestions = [];

  // --- AI LOGIC (Simulated rules-based) ---
  
  // A. Category Based Suggestions
  if (category === 'Transporte' || category === 'Logística') {
    if (!currentDocs.includes('Seguro de Carga')) {
      suggestions.push({
        title: 'Seguro de Carga (CMR)',
        reason: 'Dado que opera en el sector de Transporte, este seguro es crítico para mitigar riesgos de siniestralidad.',
        priority: 'ALTA'
      });
    }
  }

  if (category === 'Construcción') {
    if (!currentDocs.includes('Seguro de Vida Obligatorio')) {
      suggestions.push({
        title: 'Seguro de Vida Obligatorio',
        reason: 'Para empresas de Construcción, este documento es una exigencia legal para proteger al personal operativo.',
        priority: 'CRÍTICA'
      });
    }
  }

  // B. Size Based Suggestions
  if (metadata.employees > 50 && !currentDocs.includes('Plan de Seguridad e Higiene')) {
    suggestions.push({
      title: 'Plan de Seguridad e Higiene Anual',
      reason: 'Por su volumen de empleados, la normativa exige un plan de seguridad actualizado y auditado.',
      priority: 'MEDIA'
    });
  }

  // C. Cross-Reference Suggestions
  const hasVehicleDocs = currentDocs.some(d => d.toLowerCase().includes('vehículo') || d.toLowerCase().includes('patente'));
  if (hasVehicleDocs && !currentDocs.includes('VTV / Revisión Técnica')) {
    suggestions.push({
      title: 'Certificado de VTV / Revisión Técnica',
      reason: 'Se detectaron documentos de vehículos pero falta la revisión técnica obligatoria para circular.',
      priority: 'ALTA'
    });
  }

  return suggestions;
}








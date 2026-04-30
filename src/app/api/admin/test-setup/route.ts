import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

/**
 * Setup data for Audit Engine test.
 * Creates a mock contract with known issues to trigger warnings.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const serverSupabase = await createClient(); // For getting current user
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    // 0. Asegurar que exista una organización
    const uniqueSlug = `test-audit-${Date.now()}`;
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .upsert({ id: crypto.randomUUID(), name: 'Test Audit Org', slug: uniqueSlug })
      .select()
      .single();

    let orgId = org?.id;

    if (!orgId) {
      console.warn('Upsert org failed, trying to pick any existing org');
      const { data: existing } = await supabase.from('organizations').select('id').limit(1);
      orgId = existing?.[0]?.id;
    }

    if (!orgId) throw new Error('No organizations found in database to link the test document.');

    // 1. Asegurar Perfil vinculado
    await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        org_id: orgId, 
        full_name: user.email?.split('@')[0] || 'Tester' 
      });

    // 2. Crear Documento
    const documentId = crypto.randomUUID();
    const { data: doc, error: dError } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        title: 'TEST-CONTRATO-RIESGO-ALTO',
        org_id: orgId,
        status: 'borrador',
        file_url: 'mock/test.pdf',
        category: 'Contratos'
      })
      .select()
      .single();

    if (dError) {
      console.error('Document Insert Error:', dError);
      return NextResponse.json({ error: dError.message, details: dError }, { status: 500 });
    }

    if (dError) throw dError;

    // 2. Crear Versión con Contenido de Prueba (Contrato con cláusulas peligrosas)
    const mockContent = `
      CONTRATO DE SERVICIOS - BORRADOR DE PRUEBA
      
      Este contrato establece que el PRESTADOR no se responsabiliza por NINGÚN daño causado, 
      incluso por negligencia grave. No existen seguros de responsabilidad civil contratados.
      La vigencia es indefinida y no puede ser rescindido por el CLIENTE bajo ninguna circunstancia.
      Monto: $500.000 ARS mensuales.
    `;

    const { data: version, error: vError } = await supabase
      .from('document_versions')
      .insert({
        document_id: doc.id,
        version_number: 1,
        file_url: 'mock/test.pdf',
        content_extracted: mockContent
      })
      .select()
      .single();

    if (vError) throw vError;

    // 3. Crear registro en tabla contracts para auditoría
    await supabase.from('contracts').insert({
      id: doc.id,
      document_id: doc.id,
      org_id: orgId,
      contract_value: 500000,
      status: 'pendiente_revision',
      contract_number: 'TEST-001',
      counterparty: 'TEST',
      start_date: new Date().toISOString(),
      end_date: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      versionId: version.id,
      orgId: orgId,
      docTitle: doc.title
    });

  } catch (error: any) {
    console.error('Test Setup Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

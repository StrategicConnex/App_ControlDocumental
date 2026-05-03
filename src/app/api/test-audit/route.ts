import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { aiClient } from '@/lib/ai/ai-client';

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const orgName = "TechOps Solutions";
    const testOrgId = '00000000-0000-0000-0000-000000000001'; 
    
    // 1. Crear Organización
    const { data: org, error: orgErr } = await (supabase
      .from('organizations') as any)
      .upsert({ 
        id: testOrgId,
        name: orgName, 
        slug: 'techops' 
      }, { onConflict: 'name' })
      .select()
      .single();

    if (orgErr) throw orgErr;
    const orgId = org.id;

    // 2. Crear un Documento Base (Contrato)
    const { data: doc, error: docErr } = await (supabase
      .from('documents') as any)
      .insert({
        id: '00000000-0000-0000-0000-000000000002',
        title: "Master Service Agreement MSA-2026-001",
        org_id: orgId,
        status: 'active',
        metadata: { provider: "HeavyMachinery Inc", terms: "Net 30" }
      })
      .select()
      .single();

    if (docErr) throw docErr;

    // 3. Crear Orden de Compra (PO) - Usando 'as any' para tablas nuevas
    const { data: po, error: poErr } = await (supabase
      .from('purchase_orders' as any) as any)
      .insert({
        id: '00000000-0000-0000-0000-000000000003',
        po_number: "PO-001",
        org_id: orgId,
        contract_id: doc.id,
        amount: 50000,
        currency: "USD",
        status: 'approved',
        description: "Alquiler de Excavadora 320 GC - 1 Mes"
      })
      .select()
      .single();

    if (poErr) throw poErr;

    // 4. Crear Factura con DISCREPANCIA - Usando 'as any' para tablas nuevas
    const { data: invoice, error: invErr } = await (supabase
      .from('invoices' as any) as any)
      .insert({
        id: '00000000-0000-0000-0000-000000000004',
        invoice_number: "INV-999",
        org_id: orgId,
        document_id: doc.id,
        po_id: po.id,
        amount: 55000,
        currency: "USD",
        status: 'pending',
        metadata: { 
          vendor: "HeavyMachinery Inc", 
          items: [{ desc: "Alquiler Maquinaria", price: 55000 }] 
        }
      })
      .select()
      .single();

    if (invErr) throw invErr;

    // 5. EJECUTAR AUDITORÍA IA
    console.log("🚀 Iniciando Auditoría IA...");
    const auditResult = await aiClient.auditInvoiceAgainstPO(invoice.id, po.id, orgId);

    return NextResponse.json({
      message: "Auditoría completada",
      scenario: {
        po_amount: 50000,
        invoice_amount: 55000,
        expected: "Discrepancia detectada"
      },
      audit_result: auditResult
    });

  } catch (error: any) {
    console.error("Error en test-audit:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { invoiceValidator } from '@/lib/ai/invoice-validator';

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, contractId, orgId } = await req.json();

    if (!invoiceId || !contractId || !orgId) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const result = await invoiceValidator.validate(invoiceId, contractId, orgId);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error validando factura:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

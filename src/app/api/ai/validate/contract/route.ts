import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { contractValidator } from '@/lib/ai/contract-validator';

export async function POST(req: NextRequest) {
  try {
    const { contractId, orgId } = await req.json();

    if (!contractId || !orgId) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const result = await contractValidator.validate(contractId, orgId);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error validando contrato:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

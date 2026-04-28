import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { askQuestion } from '@/lib/ai/qa-engine';

export async function POST(req: NextRequest) {
  try {
    const { question, orgId, documentIds } = await req.json();

    if (!question || !orgId) {
      return NextResponse.json({ error: 'Pregunta y ID de organización requeridos' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (profile?.org_id !== orgId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const result = await askQuestion({ question, orgId, documentIds });

    return NextResponse.json({
      success: true,
      answer: result.answer,
      sources: result.sources,
      provider: result.provider,
      tokensUsed: result.tokensUsed
    });

  } catch (error: any) {
    console.error('Error en /api/ai/ask:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar la consulta de IA' }, 
      { status: 500 }
    );
  }
}

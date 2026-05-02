
import { NextResponse } from 'next/server';
import { aiClient } from '@/lib/ai/ai-client';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Solo permitir a usuarios autenticados (opcional: solo admins)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const health = await aiClient.checkHealth();
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      providers: health,
      embedding: {
        provider: 'openrouter',
        model: 'openai/text-embedding-3-small'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message || 'Error desconocido en el health check' 
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { aiPipeline } from '@/lib/ai/pipeline';
import { createClient } from '@/utils/supabase/server';

/**
 * Trigger API for the AI Pipeline.
 * Call this after creating a new document version.
 */
export async function POST(req: NextRequest) {
  try {
    const { versionId, orgId } = await req.json();

    if (!versionId || !orgId) {
      return NextResponse.json({ error: 'versionId y orgId requeridos' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    // Ejecutar en segundo plano (sin esperar el resultado completo para no bloquear)
    // Pero en este caso, devolvemos el resultado para confirmación inmediata.
    const result = await aiPipeline.processNewVersion(versionId, orgId);

    return NextResponse.json({
      success: true,
      pipeline: result
    });

  } catch (error: any) {
    console.error('Pipeline Trigger Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

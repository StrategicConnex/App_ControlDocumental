import { NextResponse } from 'next/server';
import { notificationService } from '@/lib/services/notifications';

export const dynamic = 'force-dynamic';

/**
 * Endpoint para ser llamado por un CRON job externo.
 * Procesa vencimientos de documentos y genera notificaciones.
 */
export async function GET(request: Request) {
  return handleRequest(request);
}

export async function POST(request: Request) {
  return handleRequest(request);
}

async function handleRequest(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    // Authorization check
    if (process.env.NODE_ENV === 'production' && key !== process.env.CRON_SECRET) {
      // If it's a POST, we might be calling it from the UI with an auth session
      // For now, we'll stick to the key or add a check for the session if needed
      if (request.method !== 'POST') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Parse body for POST requests
    let body: any = {};
    if (request.method === 'POST') {
      try {
        body = await request.json();
      } catch (e) {
        // Body might be empty
      }
    }

    const orgId = searchParams.get('orgId') || body.orgId;
    const force = searchParams.get('force') === 'true' || body.force === true;

    // Trigger processing
    const result = await notificationService.processExpirations(orgId);
    
    return NextResponse.json({ 
      success: true, 
      processed: result,
      timestamp: new Date().toISOString(),
      mode: force ? 'forced' : 'scheduled',
      orgId: orgId || 'all'
    });
  } catch (error: any) {
    console.error('Error in check-expirations:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}


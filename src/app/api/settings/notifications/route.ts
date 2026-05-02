import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');

  if (!orgId) {
    return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('org_id', orgId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || {
    org_id: orgId,
    schedule_days: [1, 3, 5],
    alert_vencimientos_proximos: true,
    alert_vencimientos_criticos: true,
    alert_documentos_vencidos: true
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orgId, settings } = body;

    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, org_id')
      .eq('id', user?.id)
      .single();

    if (profile?.role !== 'admin' && profile?.role !== 'superuser' || profile?.org_id !== orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('notification_settings')
      .upsert({
        org_id: orgId,
        ...settings,
        updated_at: new Date().toISOString()
      }, { onConflict: 'org_id' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

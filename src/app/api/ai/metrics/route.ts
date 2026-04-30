import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { ProviderOrchestrator } from '@/lib/ai/pol-engine';
import { getPolConfigs } from '@/lib/ai/pol-configs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Global Stats
    const { data: globalData, error: globalError } = await supabase
      .from('ai_call_logs')
      .select('provider, success, total_tokens, response_time_ms');

    if (globalError) throw globalError;

    const dataArr = globalData || [];
    const totalCalls = dataArr.length;
    const successfulCalls = dataArr.filter(d => d.success).length;
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;
    const totalTokens = dataArr.reduce((sum, d) => sum + (d.total_tokens || 0), 0);
    const avgLatency = totalCalls > 0 
      ? dataArr.reduce((sum, d) => sum + (d.response_time_ms || 0), 0) / totalCalls 
      : 0;

    // 2. Stats by Provider
    const providers = Array.from(new Set(dataArr.map(d => d.provider).filter(Boolean)));
    const byProvider = providers.map(p => {
      const pData = dataArr.filter(d => d.provider === p);
      return {
        provider: p,
        calls: pData.length,
        avgLatency: pData.length > 0 
          ? pData.reduce((sum, d) => sum + (d.response_time_ms || 0), 0) / pData.length 
          : 0,
        successRate: pData.length > 0 
          ? (pData.filter(d => d.success).length / pData.length) * 100 
          : 0
      };
    });

    // 3. Recent Logs
    const { data: recentLogs, error: recentError } = await supabase
      .from('ai_call_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) throw recentError;

    // 4. Time Series (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: seriesData, error: seriesError } = await supabase
      .from('ai_call_logs')
      .select('created_at, total_tokens')
      .gte('created_at', sevenDaysAgo.toISOString());

    if (seriesError) throw seriesError;

    const seriesArr = seriesData || [];
    const timeSeries = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0] ?? '';
      
      const dayTokens = seriesArr
        .filter(d => d.created_at && d.created_at.startsWith(dateStr))
        .reduce((sum, d) => sum + (d.total_tokens || 0), 0);

      return {
        date: dateStr,
        tokens: dayTokens
      };
    });

    // 5. POL Ranking (Live Score Calculation)
    const polConfigs = getPolConfigs({
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL,
      DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
      DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyD4FU9vyGm9hcVP9ZdbpBlYA9_ShO7eno0'
    });

    const orchestrator = new ProviderOrchestrator(polConfigs);
    
    if (byProvider && byProvider.length > 0) {
      byProvider.forEach(p => {
        if (p.provider) {
          orchestrator.updateStats(p.provider, p.successRate > 0, p.avgLatency);
        }
      });
    }

    const ranking = orchestrator.getRankedProviders('balanced').map(p => {
      const scoreData = orchestrator.calculateScore(p.id, 'balanced');
      return {
        id: p.id,
        name: p.name,
        model: p.model,
        score: scoreData.total,
        reason: scoreData.reason,
        breakdown: scoreData.breakdown,
        status: orchestrator.stats?.get(p.id)?.status || 'healthy'
      };
    });

    return NextResponse.json({
      summary: {
        totalCalls,
        successRate,
        totalTokens,
        avgLatency,
        estimatedCost: (totalTokens / 1000) * 0.005
      },
      byProvider,
      recentLogs: recentLogs || [],
      timeSeries,
      ranking
    });
  } catch (error: any) {
    console.error('Metrics Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { aiClient } from '@/lib/ai/ai-client';

/**
 * AI Health Check API.
 * Verifies connectivity to OpenRouter and DeepSeek.
 */
export async function GET() {
  try {
    const health = await aiClient.checkHealth();
    
    let status = 'healthy';
    if (!health.openrouter && !health.deepseek) {
      status = 'critical';
    } else if (!health.openrouter) {
      status = 'degraded';
    }

    return NextResponse.json({
      status,
      providers: health,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 });
  }
}

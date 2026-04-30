// Build trigger: 2026-04-30 02:56
import OpenAI from 'openai';
import { z } from 'zod';
import { ProviderOrchestrator } from './pol-engine';
import { AI_MODELS, getPolConfigs } from './pol-configs';

const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY es requerido"),
  OPENROUTER_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
  DEEPSEEK_API_KEY: z.string().min(1, "DEEPSEEK_API_KEY es requerido"),
  DEEPSEEK_BASE_URL: z.string().url().default('https://api.deepseek.com/v1'),
  GEMINI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default('https://sc-platform.com')
});

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse({
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
    OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyD4FU9vyGm9hcVP9ZdbpBlYA9_ShO7eno0',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
} catch (error) {
  console.warn("⚠️ Advertencia: Faltan variables de entorno para IA.");
  env = {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || 'missing-key',
    OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || 'missing-key',
    DEEPSEEK_BASE_URL: 'https://api.deepseek.com/v1',
    GEMINI_API_KEY: 'AIzaSyD4FU9vyGm9hcVP9ZdbpBlYA9_ShO7eno0',
    NEXT_PUBLIC_APP_URL: 'https://sc-platform.com'
  };
}

export { AI_MODELS };
export const polConfigs = getPolConfigs(env);

export type AIProvider = 'openrouter' | 'deepseek-direct' | 'google-gemini';

export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  responseTimeMs: number;
}

export class AIClient {
  private orchestrator: ProviderOrchestrator;
  private embeddingClient: OpenAI;

  constructor() {
    this.orchestrator = new ProviderOrchestrator(polConfigs);
    this.embeddingClient = new OpenAI({
      apiKey: env.OPENROUTER_API_KEY,
      baseURL: env.OPENROUTER_BASE_URL
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.embeddingClient.embeddings.create({
        model: 'openai/text-embedding-3-small',
        input: text.replace(/\n/g, ' '),
      });
      const embedding = response.data[0]?.embedding;
      if (!embedding) throw new Error('No se recibió el embedding del proveedor.');
      return embedding;
    } catch (error) {
      console.error('Error generando embedding:', error);
      throw error;
    }
  }

  async generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    try {
      const response = await this.embeddingClient.embeddings.create({
        model: 'openai/text-embedding-3-small',
        input: texts.map(t => t.replace(/\n/g, ' ')),
      });
      return response.data.map(item => {
        if (!item.embedding) throw new Error('No se recibió un embedding en el lote.');
        return item.embedding;
      });
    } catch (error) {
      console.error('Error generando embeddings por lote:', error);
      throw error;
    }
  }

  async chat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    orgId: string,
    options?: { strategy?: 'cost' | 'latency' | 'balanced'; useCache?: boolean }
  ): Promise<AIResponse> {
    const startTime = Date.now();
    try {
      const result = await this.orchestrator.chat(messages, {
        strategy: options?.strategy || 'balanced',
        useCache: options?.useCache ?? true
      });

      await this.logAICall(
        orgId, 
        result.providerId, 
        result.model, 
        true, 
        result.latency, 
        undefined,
        result.usage
      );

      return {
        content: result.content,
        provider: result.providerId as AIProvider,
        model: result.model,
        usage: {
          prompt_tokens: result.usage?.prompt_tokens || 0,
          completion_tokens: result.usage?.completion_tokens || 0,
          total_tokens: result.usage?.total_tokens || 0,
        },
        responseTimeMs: result.latency
      };
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      await this.logAICall(orgId, 'pol-orchestrator', 'n/a', false, Date.now() - startTime, errorMessage);
      throw error;
    }
  }

  private async logAICall(
    orgId: string, 
    provider: string, 
    model: string, 
    success: boolean, 
    time: number, 
    error?: string,
    usage?: any
  ) {
    try {
      const { createAdminClient } = await import('@/utils/supabase/admin');
      const supabase = createAdminClient();
      
      await supabase.from('ai_call_logs').insert({
        org_id: orgId,
        endpoint: 'chat-completion',
        provider,
        model,
        success,
        response_time_ms: time,
        error_message: error ?? null,
        prompt_tokens: usage?.prompt_tokens || 0,
        completion_tokens: usage?.completion_tokens || 0,
        total_tokens: usage?.total_tokens || 0
      });
    } catch (e) {
      console.error('Error logging AI call:', e);
    }
  }

  async checkHealth() {
    return this.orchestrator.performHealthCheck();
  }
}

export const aiClient = new AIClient();

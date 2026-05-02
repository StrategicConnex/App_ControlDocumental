// Build trigger: 2026-04-30 02:56
import OpenAI from 'openai';
import { z } from 'zod';
import { ProviderOrchestrator, POLResponse, AIMessage } from './pol-engine';
import { AI_MODELS, getPolConfigs } from './pol-configs';

const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY es requerido"),
  OPENROUTER_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
  DEEPSEEK_API_KEY: z.string().min(1, "DEEPSEEK_API_KEY es requerido"),
  DEEPSEEK_BASE_URL: z.string().url().default('https://api.deepseek.com/v1'),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY es requerido"),
  XIAOMI_API_KEY: z.string().optional(),
  XIAOMI_BASE_URL: z.string().url().optional(),
  XIAOMI_MODEL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default('https://sc-platform.com')
});

let env: z.infer<typeof envSchema>;

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

try {
  env = envSchema.parse({
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
    OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    XIAOMI_API_KEY: process.env.XIAOMI_API_KEY,
    XIAOMI_BASE_URL: process.env.XIAOMI_BASE_URL,
    XIAOMI_MODEL: process.env.XIAOMI_MODEL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
} catch (error: any) {
  if (process.env.NODE_ENV === 'production' && !isBuildTime) {
    console.error("❌ ERROR FATAL: Faltan variables de entorno críticas para la IA en producción.");
    throw new Error("Missing AI Environment Variables");
  } else {
    const statusLabel = isBuildTime ? "BUILD-TIME" : "DEVELOPMENT";
    console.warn(`⚠️ Advertencia [${statusLabel}]: Faltan variables de entorno para IA. Usando placeholders.`);
    env = {
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || 'placeholder',
      OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
      DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || 'placeholder',
      DEEPSEEK_BASE_URL: 'https://api.deepseek.com/v1',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'placeholder',
      XIAOMI_API_KEY: process.env.XIAOMI_API_KEY,
      XIAOMI_BASE_URL: process.env.XIAOMI_BASE_URL,
      XIAOMI_MODEL: process.env.XIAOMI_MODEL,
      NEXT_PUBLIC_APP_URL: 'https://sc-platform.com'
    };
  }
}

export { AI_MODELS };
export const polConfigs = getPolConfigs(env);

export type AIProvider = 'openrouter' | 'deepseek-direct' | 'google-gemini' | 'xiaomi-mimo';

export interface AIResponse extends POLResponse {
  provider: AIProvider;
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
    messages: AIMessage[],
    orgId: string,
    options?: { 
      strategy?: 'cost' | 'latency' | 'balanced'; 
      useCache?: boolean;
      response_format?: 'json_object' | 'text';
    }
  ): Promise<AIResponse> {
    const startTime = Date.now();
    try {
      const result = await this.orchestrator.chat(messages, {
        strategy: options?.strategy || 'balanced',
        useCache: options?.useCache ?? true,
        ...(options?.response_format ? { response_format: { type: options.response_format } } : {})
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
        ...result,
        provider: result.providerId as AIProvider
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

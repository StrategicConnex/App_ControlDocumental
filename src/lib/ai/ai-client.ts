import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY es requerido"),
  OPENROUTER_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
  DEEPSEEK_API_KEY: z.string().min(1, "DEEPSEEK_API_KEY es requerido"),
  DEEPSEEK_BASE_URL: z.string().url().default('https://api.deepseek.com/v1'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('https://sc-platform.com')
});

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse({
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
} catch (error) {
  console.warn("⚠️ Advertencia: Faltan variables de entorno para IA. La app podría fallar en runtime si se intenta llamar a la API.");
  // Fallback silencioso solo para que el compilador no explote durante build. En prod esto debería fallar.
  env = {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || 'missing-key',
    OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || 'missing-key',
    DEEPSEEK_BASE_URL: 'https://api.deepseek.com/v1',
    NEXT_PUBLIC_APP_URL: 'https://sc-platform.com'
  };
}

// Configuración de OpenRouter (Gateway principal)
const OPENROUTER_API_KEY = env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = env.OPENROUTER_BASE_URL;

// Configuración de DeepSeek Directo (Fallback)
const DEEPSEEK_API_KEY = env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = env.DEEPSEEK_BASE_URL;

export const AI_MODELS = {
  DEEPSEEK_CHAT: 'deepseek/deepseek-chat',
  DEEPSEEK_CODER: 'deepseek/deepseek-coder',
  OPENAI_GPT4: 'openai/gpt-4-turbo',
  ANTHROPIC_SONNET: 'anthropic/claude-3-sonnet',
  FALLBACK: 'deepseek/deepseek-chat'
};

export type AIProvider = 'openrouter' | 'deepseek-direct';

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

const openrouterClient = new OpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: OPENROUTER_BASE_URL,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://sc-platform.com',
    'X-Title': 'SC Platform - Compliance Documental'
  }
});

const deepseekDirectClient = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: DEEPSEEK_BASE_URL
});

const embeddingClient = new OpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: OPENROUTER_BASE_URL
});

export class AIClient {
  private preferredModel: string;
  private fallbackModel: string;

  constructor(preferredModel: string = AI_MODELS.DEEPSEEK_CHAT) {
    this.preferredModel = preferredModel;
    this.fallbackModel = AI_MODELS.FALLBACK;
  }

  /**
   * Genera un embedding vectorial para un texto dado.
   * Utiliza el modelo text-embedding-3-small por defecto.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await embeddingClient.embeddings.create({
        model: 'openai/text-embedding-3-small',
        input: text.replace(/\n/g, ' '),
      });
      const embedding = response.data[0]?.embedding;
      if (!embedding) throw new Error('No se pudo generar el embedding');
      return embedding;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error generando embedding:', errorMessage);
      throw error;
    }
  }

  async chat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    orgId: string,
    options?: { temperature?: number; max_tokens?: number; response_format?: 'text' | 'json_object' }
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // 1. Intentar con OpenRouter
      const response = await this.callOpenRouter(messages, options);
      await this.logAICall(orgId, 'openrouter', this.preferredModel, true, Date.now() - startTime);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('OpenRouter falló, usando DeepSeek directo:', errorMessage);
      
      // 2. Log de error de OpenRouter
      await this.logAICall(orgId, 'openrouter', this.preferredModel, false, Date.now() - startTime, errorMessage);
      
      // 3. Fallback a DeepSeek directo
      const fallbackStart = Date.now();
      try {
        const fallbackResponse = await this.callDeepSeekDirect(messages, options);
        await this.logAICall(orgId, 'deepseek-direct', this.fallbackModel, true, Date.now() - fallbackStart);
        return fallbackResponse;
      } catch (fallbackError: unknown) {
        const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        await this.logAICall(orgId, 'deepseek-direct', this.fallbackModel, false, Date.now() - fallbackStart, fallbackErrorMessage);
        throw new Error('Ambos proveedores de IA fallaron: ' + fallbackErrorMessage);
      }
    }
  }

  private async callOpenRouter(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], 
    options?: { temperature?: number; max_tokens?: number; response_format?: 'text' | 'json_object' }
  ): Promise<AIResponse> {
    const start = Date.now();
    const completion = await openrouterClient.chat.completions.create({
      model: this.preferredModel,
      messages,
      temperature: options?.temperature ?? 0.1,
      max_tokens: options?.max_tokens ?? 2000,
      ...(options?.response_format === 'json_object' && { response_format: { type: 'json_object' } })
    });

    return {
      content: completion.choices[0]?.message?.content || '',
      provider: 'openrouter',
      model: this.preferredModel,
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens || 0,
        completion_tokens: completion.usage?.completion_tokens || 0,
        total_tokens: completion.usage?.total_tokens || 0,
      },
      responseTimeMs: Date.now() - start
    };
  }

  private async callDeepSeekDirect(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], 
    options?: { temperature?: number; max_tokens?: number; response_format?: 'text' | 'json_object' }
  ): Promise<AIResponse> {
    const start = Date.now();
    const completion = await deepseekDirectClient.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      temperature: options?.temperature ?? 0.1,
      max_tokens: options?.max_tokens ?? 2000,
    });

    return {
      content: completion.choices[0]?.message?.content || '',
      provider: 'deepseek-direct',
      model: 'deepseek-chat',
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens || 0,
        completion_tokens: completion.usage?.completion_tokens || 0,
        total_tokens: completion.usage?.total_tokens || 0,
      },
      responseTimeMs: Date.now() - start
    };
  }

  private async logAICall(orgId: string, provider: string, model: string, success: boolean, time: number, error?: string) {
    try {
      const supabase = await createClient();
      await supabase.from('ai_call_logs').insert({
        org_id: orgId,
        endpoint: 'chat-completion',
        provider,
        model,
        success,
        response_time_ms: time,
        error_message: error ?? null
      });
    } catch (e) {
      console.error('Error logging AI call:', e);
    }
  }

  async checkHealth(): Promise<{ openrouter: boolean; deepseek: boolean }> {
    const results = { openrouter: false, deepseek: false };
    try {
      await openrouterClient.chat.completions.create({
        model: this.preferredModel,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1
      });
      results.openrouter = true;
    } catch { results.openrouter = false; }

    try {
      await deepseekDirectClient.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1
      });
      results.deepseek = true;
    } catch { results.deepseek = false; }
    return results;
  }
}

export const aiClient = new AIClient();

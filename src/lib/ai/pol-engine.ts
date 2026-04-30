import OpenAI from 'openai';

export type ProviderHealth = 'healthy' | 'degraded' | 'down';

export interface ProviderConfig {
  id: string;
  name: string;
  priority: number; // Menor es mayor prioridad
  costPer1kTokens: number; // USD
  baseUrl: string;
  apiKey: string;
  model: string;
  weightLatency: number;
  weightCost: number;
  weightHealth: number;
}

export interface ProviderStats {
  status: ProviderHealth;
  avgLatencyMs: number;
  errorRate: number; // 0 to 1
  totalCalls: number;
  failCount: number;
  consecutiveFailures: number;
  lastChecked: Date;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface POLResponse {
  content: string;
  providerId: string;
  model: string;
  usage: AIUsage;
  latency: number;
}

export interface POLOptions {
  strategy?: 'cost' | 'latency' | 'balanced';
  maxRetries?: number;
  useCache?: boolean;
  response_format?: { type: 'json_object' | 'text' };
}

/**
 * Provider Orchestration Layer (POL)
 * Manages multi-provider routing, failover, and health monitoring.
 */
export class ProviderOrchestrator {
  private registry: Map<string, ProviderConfig> = new Map();
  public stats: Map<string, ProviderStats> = new Map();
  private cache: Map<string, { content: string; expiry: number }> = new Map();
  private clients: Map<string, OpenAI> = new Map();

  constructor(configs: ProviderConfig[]) {
    configs.forEach(config => {
      this.registry.set(config.id, config);
      this.stats.set(config.id, {
        status: 'healthy',
        avgLatencyMs: 500, // Valor base
        errorRate: 0,
        totalCalls: 0,
        failCount: 0,
        consecutiveFailures: 0,
        lastChecked: new Date()
      });
      this.clients.set(config.id, new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl,
        // Configuración específica para OpenRouter si es necesario
        ...(config.id === 'openrouter' && {
          defaultHeaders: {
            'HTTP-Referer': 'https://sc-platform.com',
            'X-Title': 'SC Platform POL'
          }
        })
      }));
    });
  }

  /**
   * Obtiene la lista de providers ordenados por Score (Menor score es mejor)
   */
  public getRankedProviders(strategy: 'cost' | 'latency' | 'balanced' = 'balanced'): ProviderConfig[] {
    return Array.from(this.registry.values())
      .map(config => ({
        config,
        score: this.calculateScore(config.id, strategy).total
      }))
      .sort((a, b) => a.score - b.score)
      .map(item => item.config);
  }

  /**
   * Calcula el score de un proveedor (Menor es mejor)
   */
  public calculateScore(id: string, strategy: 'cost' | 'latency' | 'balanced' = 'balanced'): { 
    total: number; 
    reason: string;
    breakdown: { latency: number; cost: number; error: number; penalty: number }
  } {
    const config = this.registry.get(id)!;
    const stat = this.stats.get(id)!;

    if (stat.status === 'down') {
      return { 
        total: 1000000, 
        reason: 'Provider is DOWN', 
        breakdown: { latency: 1, cost: 1, error: 1, penalty: 1000000 } 
      };
    }

    // Normalización: Latencia (3s base), Costo (0.02 USD base)
    const normLatency = Math.min(stat.avgLatencyMs / 3000, 2);
    const normCost = Math.min(config.costPer1kTokens / 0.02, 2);
    
    // Penalización exponencial por errores (Punitivo ante inestabilidad)
    const errorPenalty = Math.pow(1 + stat.errorRate, 5);

    let baseScore = 0;
    let reason = 'Balanced Selection';

    if (strategy === 'cost') {
      baseScore = (normCost * 0.8) + (normLatency * 0.15) + (stat.errorRate * 0.05);
      reason = 'Cost Optimized';
    } else if (strategy === 'latency') {
      baseScore = (normLatency * 0.8) + (normCost * 0.15) + (stat.errorRate * 0.05);
      reason = 'Performance Optimized';
    } else {
      baseScore = (normLatency * config.weightLatency) + 
                  (normCost * config.weightCost) + 
                  (stat.errorRate * config.weightHealth);
      
      // Lógica de "Preferred" si los scores son muy cercanos
      if (id === 'google-gemini' && stat.status === 'healthy') {
        reason = 'Preferred Cost Leader';
      }
    }

    const healthFactor = stat.status === 'degraded' ? 0.3 : 0;
    const total = (baseScore * errorPenalty) + healthFactor;

    return {
      total,
      reason: stat.status === 'degraded' ? 'Performance Degraded' : reason,
      breakdown: {
        latency: normLatency,
        cost: normCost,
        error: stat.errorRate,
        penalty: errorPenalty
      }
    };
  }

  /**
   * Ejecuta una llamada de Chat con Failover automático
   */
  async chat(
    messages: AIMessage[],
    options: POLOptions = {}
  ): Promise<POLResponse> {
    const strategy = options.strategy || 'balanced';
    const rankedProviders = this.getRankedProviders(strategy);
    
    // 1. Cache check
    if (options.useCache) {
      const cacheKey = JSON.stringify(messages);
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        return JSON.parse(cached.content);
      }
    }

    let lastError: any;

    for (const provider of rankedProviders) {
      const stat = this.stats.get(provider.id)!;
      if (stat.status === 'down') {
        console.log(`POL: Saltando ${provider.id} porque su estado es 'down'.`);
        continue;
      }

      console.log(`POL: Intentando llamada con provider: ${provider.id} (${provider.model})...`);
      const startTime = Date.now();
      try {
        const client = this.clients.get(provider.id)!;
        const response = await client.chat.completions.create({
          model: provider.model,
          messages,
          temperature: 0.1,
          max_tokens: 1000,
          ...(options.response_format ? { response_format: options.response_format } : {})
        });

        const latency = Date.now() - startTime;
        this.updateStats(provider.id, true, latency);

        const result = {
        content: response.choices[0]?.message?.content || '',
        providerId: provider.id,
        model: provider.model,
        usage: {
          prompt_tokens: response.usage?.prompt_tokens || 0,
          completion_tokens: response.usage?.completion_tokens || 0,
          total_tokens: response.usage?.total_tokens || 0
        },
        latency
      };

        // Update cache
        if (options.useCache) {
          const cacheKey = JSON.stringify(messages);
          this.cache.set(cacheKey, { content: JSON.stringify(result), expiry: Date.now() + 3600000 }); // 1h
        }

        return result;

      } catch (err: any) {
        lastError = err;
        const latency = Date.now() - startTime;
        console.error(`POL: Error en provider ${provider.id}:`, err.message || err);
        this.updateStats(provider.id, false, latency, err);

        // Si es un error crítico (401, 402, 429), probamos el siguiente
        if (this.isCriticalError(err)) {
          console.warn(`POL: Provider ${provider.id} falló con error crítico. Reintentando con el siguiente...`);
          continue;
        }

        // Si no es crítico, lanzamos el error
        throw err;
      }
    }

    const errorMsg = lastError ? (lastError.message || JSON.stringify(lastError)) : 'No hay proveedores saludables disponibles';
    throw new Error(`POL: Todos los proveedores fallaron. Detalle: ${errorMsg}`);
  }

  /**
   * Actualiza las estadísticas de un proveedor basado en telemetría externa o resultados de llamadas
   */
  public updateStats(id: string, success: boolean, latency: number, error?: Error | any) {
    const stat = this.stats.get(id)!;
    stat.totalCalls++;
    stat.lastChecked = new Date();

    if (success) {
      // Moving average para latencia
      stat.avgLatencyMs = (stat.avgLatencyMs * 0.8) + (latency * 0.2);
      // Suavizar error rate
      stat.errorRate = stat.errorRate * 0.9;
      stat.consecutiveFailures = 0; // Reset circuit breaker
      if (stat.status === 'degraded' && stat.errorRate < 0.1) stat.status = 'healthy';
    } else {
      stat.failCount++;
      stat.consecutiveFailures++;
      stat.errorRate = (stat.errorRate * 0.7) + 0.3;
      
      // Circuit Breaker: Si hay más de 5 fallos consecutivos, marcar como down inmediatamente
      if (stat.consecutiveFailures >= 5 || stat.errorRate > 0.5) {
        stat.status = 'down';
      } else if (stat.errorRate > 0.2) {
        stat.status = 'degraded';
      }
      
      // Si es un error de saldo o auth, marcar como down inmediatamente
      if (error?.status === 401 || error?.status === 402) {
        stat.status = 'down';
        stat.consecutiveFailures = 10; // Forzar permanencia en DOWN
      }
    }
  }

  private isCriticalError(err: any): boolean {
    const status = err.status || err.code;
    // Disparar failover para errores de servidor, red, cuotas y auth
    return [401, 402, 429, 500, 502, 503, 504].includes(status) || 
           err.message?.toLowerCase().includes('insufficient_quota') ||
           err.message?.toLowerCase().includes('rate_limit') ||
           err.message?.toLowerCase().includes('connection') ||
           err.message?.toLowerCase().includes('timeout') ||
           !status; // Si no hay status, asumimos error de red/conexión
  }

  /**
   * Health check proactivo
   */
  async performHealthCheck(): Promise<Record<string, ProviderHealth>> {
    const results: Record<string, ProviderHealth> = {};
    console.log('POL: Iniciando Health Check proactivo...');
    for (const [id, provider] of this.registry) {
      try {
        const client = this.clients.get(id)!;
        await client.chat.completions.create({
          model: provider.model,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1
        });
        const stat = this.stats.get(id)!;
        stat.status = 'healthy';
        stat.errorRate = 0;
        results[id] = 'healthy';
        console.log(`POL: Provider ${id} está saludable.`);
      } catch (e: any) {
        console.error(`POL: Health Check falló para ${id}:`, e.message || e);
        const stat = this.stats.get(id)!;
        stat.status = 'down';
        results[id] = 'down';
      }
    }
    return results;
  }
}

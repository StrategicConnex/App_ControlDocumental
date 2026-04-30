import { ProviderOrchestrator, ProviderConfig } from './pol-engine';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Replicamos la configuración de ai-client.ts para ver el impacto de los nuevos pesos
const polConfigs: ProviderConfig[] = [
  {
    id: 'google-gemini',
    name: 'Google Gemini (POL)',
    priority: 1,
    costPer1kTokens: 0.0005,
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    apiKey: process.env.GEMINI_API_KEY || 'AIzaSyD4FU9vyGm9hcVP9ZdbpBlYA9_ShO7eno0',
    model: 'gemini-3-flash-preview',
    weightLatency: 0.3,
    weightCost: 0.6,
    weightHealth: 0.1
  },
  {
    id: 'openrouter',
    name: 'OpenRouter (Gateway)',
    priority: 2,
    costPer1kTokens: 0.01,
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || 'missing',
    model: 'openai/gpt-4-turbo',
    weightLatency: 0.2,
    weightCost: 0.7,
    weightHealth: 0.1
  },
  {
    id: 'deepseek-direct',
    name: 'DeepSeek Direct',
    priority: 3,
    costPer1kTokens: 0.002,
    baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY || 'missing',
    model: 'deepseek-chat',
    weightLatency: 0.5,
    weightCost: 0.4,
    weightHealth: 0.1
  }
];

async function testRanking() {
  console.log('--- TEST DE RANKING POL (Nuevos Pesos) ---');
  const orchestrator = new ProviderOrchestrator(polConfigs);

  // Simulamos algunos estados para ver cómo afecta el score
  // @ts-ignore - Accedemos a la propiedad privada para el test
  const stats = orchestrator['stats'];
  
  // Caso 1: Todo saludable (Estado inicial)
  console.log('\nEscenario 1: Todos los proveedores saludables (Latencia base 500ms)');
  const ranked1 = orchestrator.getRankedProviders('balanced');
  ranked1.forEach((p, i) => {
    // @ts-ignore
    const score = orchestrator.calculateScore(p.id, 'balanced');
    console.log(`${i + 1}. ${p.name} | Score: ${score.toFixed(4)}`);
  });

  // Caso 2: Gemini se vuelve lento (ej. 5000ms)
  console.log('\nEscenario 2: Gemini se vuelve lento (5000ms de latencia)');
  const geminiStats = stats.get('google-gemini')!;
  geminiStats.avgLatencyMs = 5000;
  
  const ranked2 = orchestrator.getRankedProviders('balanced');
  ranked2.forEach((p, i) => {
    // @ts-ignore
    const score = orchestrator.calculateScore(p.id, 'balanced');
    console.log(`${i + 1}. ${p.name} | Score: ${score.toFixed(4)}`);
  });

  // Caso 3: DeepSeek con errores
  console.log('\nEscenario 3: DeepSeek con tasa de error alta (30%)');
  const deepseekStats = stats.get('deepseek-direct')!;
  deepseekStats.errorRate = 0.3;
  deepseekStats.status = 'degraded';
  
  const ranked3 = orchestrator.getRankedProviders('balanced');
  ranked3.forEach((p, i) => {
    // @ts-ignore
    const score = orchestrator.calculateScore(p.id, 'balanced');
    console.log(`${i + 1}. ${p.name} | Score: ${score.toFixed(4)}`);
  });
}

testRanking().catch(console.error);

import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno AL PRINCIPIO
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { aiClient } from './ai-client';
import { ProviderOrchestrator, ProviderConfig } from './pol-engine';

async function testPOL() {
  console.log('🚀 Iniciando Test de POL (Provider Orchestration Layer)');

  const orgId = '7b9e6f1a-2c3d-4e5f-8a9b-0c1d2e3f4g5h'; // Org ID de prueba

  // 1. Verificar Ranking inicial
  console.log('\n--- 1. Ranking de Providers Inicial ---');
  const health = await aiClient.checkHealth();
  console.log('Health Check:', health);

  // 2. Prueba de Chat Normal (Debería usar el de mayor prioridad/mejor score)
  console.log('\n--- 2. Prueba de Chat (Balanced Strategy) ---');
  try {
    const res1 = await aiClient.chat(
      [{ role: 'user', content: '¿Cuál es la capital de Francia?' }],
      orgId,
      { strategy: 'balanced' }
    );
    console.log(`Respuesta recibida de: ${res1.provider} (${res1.model})`);
    console.log(`Latencia: ${res1.responseTimeMs}ms | Tokens: ${res1.usage.total_tokens}`);
  } catch (e: any) {
    console.error('Error en Chat 1:', e.message);
  }

  // 3. Prueba de Cambio de Estrategia (Cost-Sensitive)
  console.log('\n--- 3. Prueba de Chat (Cost Strategy) ---');
  try {
    const res2 = await aiClient.chat(
      [{ role: 'user', content: 'Resume en una frase qué es el cumplimiento normativo.' }],
      orgId,
      { strategy: 'cost' }
    );
    console.log(`Respuesta recibida de: ${res2.provider} (${res2.model})`);
    console.log(`Latencia: ${res2.responseTimeMs}ms | Tokens: ${res2.usage.total_tokens}`);
  } catch (e: any) {
    console.error('Error en Chat 2:', e.message);
  }

  // 4. Simulación de Failover (Forzado)
  console.log('\n--- 4. Simulación de Failover ---');
  // Creamos un orquestador temporal con un provider roto al inicio
  const brokenConfigs: ProviderConfig[] = [
    {
      id: 'broken-provider',
      name: 'Broken Provider',
      priority: 0, // Máxima prioridad pero roto
      costPer1kTokens: 0.001,
      baseUrl: 'https://api.broken.com/v1',
      apiKey: 'invalid',
      model: 'gpt-3.5-turbo',
      weightLatency: 0.3,
      weightCost: 0.5,
      weightHealth: 0.2
    },
    {
      id: 'openrouter-backup',
      name: 'OpenRouter Backup',
      priority: 1,
      costPer1kTokens: 0.01,
      baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY || '',
      model: 'openai/gpt-4-turbo',
      weightLatency: 0.4,
      weightCost: 0.4,
      weightHealth: 0.2
    }
  ];

  const pol = new ProviderOrchestrator(brokenConfigs);
  console.log('Intentando llamada con provider inicial roto...');
  try {
    const resFailover = await pol.chat([{ role: 'user', content: 'Test failover' }]);
    console.log(`✅ Failover Exitoso! Respondió: ${resFailover.providerId} despues de que fallara el primero.`);
  } catch (e: any) {
    console.error('❌ Failover Falló:', e.message);
  }

  console.log('\n--- Test Finalizado ---');
}

testPOL().catch(console.error);

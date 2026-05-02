import { ProviderConfig } from './pol-engine';

export const AI_MODELS = {
  DEEPSEEK_CHAT: 'deepseek/deepseek-chat',
  OPENAI_GPT4: 'openai/gpt-4-turbo',
  GEMINI_FLASH: 'gemini-3-flash-preview',
  XIAOMI_MIMO: 'mimo-v2.5-pro',
  FALLBACK: 'deepseek/deepseek-chat'
};

export const getPolConfigs = (env: any): ProviderConfig[] => [
  {
    id: 'google-gemini',
    name: 'Google Gemini (POL)',
    priority: 1,
    costPer1kTokens: 0.0005,
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    apiKey: env.GEMINI_API_KEY || 'missing-key',
    model: AI_MODELS.GEMINI_FLASH,
    weightLatency: 0.25,
    weightCost: 0.7,
    weightHealth: 0.05
  },
  {
    id: 'openrouter',
    name: 'OpenRouter (Gateway)',
    priority: 2,
    costPer1kTokens: 0.01,
    baseUrl: env.OPENROUTER_BASE_URL,
    apiKey: env.OPENROUTER_API_KEY,
    model: AI_MODELS.OPENAI_GPT4,
    weightLatency: 0.2,
    weightCost: 0.75,
    weightHealth: 0.05
  },
  {
    id: 'deepseek-direct',
    name: 'DeepSeek Direct',
    priority: 3,
    costPer1kTokens: 0.002,
    baseUrl: env.DEEPSEEK_BASE_URL,
    apiKey: env.DEEPSEEK_API_KEY,
    model: 'deepseek-chat',
    weightLatency: 0.4,
    weightCost: 0.5,
    weightHealth: 0.1
  },
  {
    id: 'xiaomi-mimo',
    name: 'Xiaomi MiMo (Anthropic POL)',
    priority: 0, // Alta prioridad por ser el nuevo "mejor" modelo
    costPer1kTokens: 0.0001, // Muy económico
    baseUrl: env.XIAOMI_BASE_URL,
    apiKey: env.XIAOMI_API_KEY,
    model: env.XIAOMI_MODEL || AI_MODELS.XIAOMI_MIMO,
    providerType: 'anthropic',
    weightLatency: 0.3,
    weightCost: 0.6,
    weightHealth: 0.1
  }
];

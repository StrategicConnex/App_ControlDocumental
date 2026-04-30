import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askQuestion } from '@/lib/ai/qa-engine';
import { vectorizerService } from '@/lib/ai/vectorizer';
import { aiClient } from '@/lib/ai/ai-client';
import { createClient } from '@/utils/supabase/server';

// Mocks
vi.mock('@/lib/ai/vectorizer', () => ({
  vectorizerService: {
    searchSimilarChunks: vi.fn(),
  },
}));

vi.mock('@/lib/ai/ai-client', () => ({
  aiClient: {
    chat: vi.fn(),
  },
}));

describe('QAEngine', () => {
  const mockOrgId = 'org-123';
  const mockQuestion = '¿Cuál es el plazo de entrega?';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should answer a question using relevant chunks', async () => {
    // Arrange
    (vectorizerService.searchSimilarChunks as any).mockResolvedValue([
      { version_id: 'v1', content: 'El plazo de entrega es de 30 días.' }
    ]);

    (createClient as any).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
      data: [{ id: 'v1', documents: { id: 'd1', title: 'Contrato A' } }]
    });

    // Mocking the specific supabase call for versions
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({
        data: [{ id: 'v1', documents: { id: 'd1', title: 'Contrato A' } }],
        error: null
      }),
      insert: vi.fn().mockResolvedValue({ error: null })
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    (aiClient.chat as any).mockResolvedValue({
      content: 'El plazo de entrega es de 30 días según el Contrato A.',
      usage: { total_tokens: 150 },
      provider: 'openai',
      model: 'gpt-4'
    });

    // Act
    const result = await askQuestion({ question: mockQuestion, orgId: mockOrgId });

    expect(result.answer).toContain('30 días');
    expect(result.sources).toHaveLength(1);
    expect(result.sources[0]?.title).toBe('Contrato A');
    expect(aiClient.chat).toHaveBeenCalled();
  });

  it('should return a friendly message when no chunks are found', async () => {
    // Arrange
    (vectorizerService.searchSimilarChunks as any).mockResolvedValue([]);

    // Act
    const result = await askQuestion({ question: mockQuestion, orgId: mockOrgId });

    // Assert
    expect(result.answer).toContain('No encontré fragmentos');
    expect(result.sources).toHaveLength(0);
    expect(aiClient.chat).not.toHaveBeenCalled();
  });
});

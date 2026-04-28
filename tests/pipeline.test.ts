import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiPipeline } from '@/lib/ai/pipeline';
import { vectorizerService } from '@/lib/ai/vectorizer';
import { contractValidator } from '@/lib/ai/contract-validator';
import { invoiceValidator } from '@/lib/ai/invoice-validator';
import { notificationService } from '@/lib/services/notifications';
import { createClient } from '@/utils/supabase/server';

// Mocks
vi.mock('@/lib/ai/vectorizer', () => ({
  vectorizerService: {
    vectorizeDocumentVersion: vi.fn(),
  },
}));

vi.mock('@/lib/ai/contract-validator', () => ({
  contractValidator: {
    validate: vi.fn(),
  },
}));

vi.mock('@/lib/ai/invoice-validator', () => ({
  invoiceValidator: {
    validate: vi.fn(),
  },
}));

vi.mock('@/lib/services/notifications', () => ({
  notificationService: {
    send: vi.fn(),
  },
}));

describe('AIPipeline', () => {
  const mockOrgId = 'org-123';
  const mockVersionId = 'ver-456';
  const mockDocId = 'doc-789';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock for supabase
    (createClient as any).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: mockVersionId,
          content_extracted: 'Contenido de prueba de un CONTRATO',
          document_id: mockDocId,
          documents: {
            id: mockDocId,
            title: 'CONTRATO DE SERVICIOS',
            metadata: { category: 'Contratos' }
          }
        },
        error: null
      }),
    });
  });

  it('should process a contract successfully', async () => {
    // Arrange
    (vectorizerService.vectorizeDocumentVersion as any).mockResolvedValue({ success: true });
    (contractValidator.validate as any).mockResolvedValue({ score: 85, risks: [] });

    // Act
    const result = await aiPipeline.processNewVersion(mockVersionId, mockOrgId);

    // Assert
    expect(result.vectorized).toBe(true);
    expect(result.audited).toBe(true);
    expect(contractValidator.validate).toHaveBeenCalledWith(mockDocId, mockOrgId);
    expect(notificationService.send).not.toHaveBeenCalled(); // Score > 60
  });

  it('should send notification for low score contracts', async () => {
    // Arrange
    (vectorizerService.vectorizeDocumentVersion as any).mockResolvedValue({ success: true });
    (contractValidator.validate as any).mockResolvedValue({ score: 45, risks: ['Cláusula abusiva'] });

    // Act
    await aiPipeline.processNewVersion(mockVersionId, mockOrgId);

    // Assert
    expect(notificationService.send).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'critical',
      type: 'audit_alert'
    }));
  });

  it('should handle missing content', async () => {
    // Arrange
    (createClient as any).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { content_extracted: null },
        error: null
      }),
    });

    // Act
    const result = await aiPipeline.processNewVersion(mockVersionId, mockOrgId);

    // Assert
    expect(result.vectorized).toBe(false);
    expect(result.error).toBe('No content to process');
  });
});

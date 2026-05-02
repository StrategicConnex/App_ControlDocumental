import { vectorizerService } from './vectorizer';
import { contractValidator } from './contract-validator';
import { invoiceValidator } from './invoice-validator';
import { createClient } from '@/utils/supabase/server';
import { notificationService } from '@/lib/services/notifications.server';

export interface AuditResult {
  score?: number;
  status?: string;
  compliant?: boolean;
  valid?: boolean;
  matches_contract?: boolean;
  total_invoice?: number;
  currency?: string;
  summary?: string;
  discrepancies?: Array<{
    type: string;
    description: string;
    expected?: string | undefined;
    found?: string | undefined;
    severity: 'low' | 'medium' | 'high';
  }>;
  findings?: Array<{
    clause: string;
    status: string;
    description: string;
    recommendation?: string | undefined;
  }>;
}

export interface PipelineResult {
  vectorized: boolean;
  audited: boolean;
  auditResult?: AuditResult;
  error?: string;
}

/**
 * Intelligent Document Pipeline Orchestrator.
 * Handles automatic vectorization and auditing.
 */
export class AIPipeline {
  /**
   * Procesa un nuevo documento cargado.
   */
  async processNewVersion(versionId: string, orgId: string): Promise<PipelineResult> {
    const supabase = await createClient();

    try {
      // 1. Obtener datos de la versión y el documento
      const { data: version, error: vError } = await supabase
        .from('document_versions')
        .select(`
          id,
          content_extracted,
          document_id,
          documents (
            id,
            title,
            metadata
          )
        `)
        .eq('id', versionId)
        .single();

      if (vError || !version) throw new Error('Versión no encontrada');
      if (!version.content_extracted) {
        console.warn('Pipeline: No hay contenido extraído para procesar.');
        return { vectorized: false, audited: false, error: 'No content to process' };
      }

      const docData = version.documents;
      const doc = (Array.isArray(docData) ? docData[0] : docData) as unknown as { id: string; title: string; metadata: any };
      const results: PipelineResult = { vectorized: false, audited: false };

      // 2. Ejecutar Vectorización (Siempre ocurre)
      const vectorResult = await vectorizerService.vectorizeDocumentVersion(
        versionId,
        doc.id,
        version.content_extracted,
        orgId
      );
      results.vectorized = vectorResult.success;

      const docMetadata = doc.metadata || {};
      const category = docMetadata.category || '';

      // 3. Ejecutar Auditoría (Si aplica según categoría)
      if (category === 'Contratos' || doc.title?.includes('CONTRATO')) {
        const audit = await contractValidator.validate(doc.id, orgId);
        results.audited = true;
        results.auditResult = audit;

        // Notificar si el score es bajo (Riesgo Crítico)
        if (audit.score !== undefined && audit.score < 60) {
          await notificationService.send({
            orgId,
            type: 'audit_alert',
            severity: 'critical',
            title: 'Riesgo Crítico en Contrato',
            message: `El documento "${doc.title}" tiene un cumplimiento del ${audit.score}%. Se recomienda revisión inmediata.`,
            link: `/audit/contracts`,
            metadata: {
              actionable: true,
              actionType: 'contract_risk',
              resourceId: doc.id
            }
          });
        }
      }
      else if (category === 'Facturas' || doc.title?.includes('FACTURA')) {
        const { data: invoice } = await supabase
          .from('invoices')
          .select('id, contract_id')
          .eq('id', doc.id)
          .single();

        if (invoice?.contract_id) {
          const audit = await invoiceValidator.validate(doc.id, invoice.contract_id, orgId);
          results.audited = true;
          results.auditResult = audit;

          // Notificar si hay discrepancias de alta severidad
          const highRisk = audit.discrepancies?.some((d: { severity: string }) => d.severity === 'high') ?? false;
          if (highRisk) {
            await notificationService.send({
              orgId,
              type: 'audit_alert',
              severity: 'critical',
              title: 'Discrepancia en Factura',
              message: `Se detectaron discrepancias graves en la factura "${doc.title}" vs su contrato asociado.`,
              link: `/audit/invoices`,
              metadata: {
                actionable: true,
                actionType: 'invoice_discrepancy',
                resourceId: invoice.id
              }
            });
          }
        }
      }

      return results;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('AIPipeline Error:', errorMessage);
      return { vectorized: false, audited: false, error: errorMessage };
    }
  }
}

export const aiPipeline = new AIPipeline();

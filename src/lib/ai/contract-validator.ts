import { aiClient } from './ai-client';
import { createClient } from '@/utils/supabase/server';

export interface ContractValidationResult {
  compliant: boolean;
  score: number;
  findings: Array<{
    clause: string;
    status: 'compliant' | 'non-compliant' | 'warning';
    description: string;
    recommendation?: string;
  }>;
  summary: string;
}

/**
 * Service for intelligent contract auditing.
 */
export class ContractValidator {
  /**
   * Valida un contrato contra un conjunto de reglas de cumplimiento industrial.
   */
  async validate(contractId: string, orgId: string): Promise<ContractValidationResult> {
    const supabase = await createClient();

    // 1. Obtener contenido del contrato
    const { data: version } = await supabase
      .from('document_versions')
      .select('content_extracted')
      .eq('document_id', contractId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!version?.content_extracted) {
      throw new Error('No se encontró contenido extraído para este contrato');
    }

    // 2. Definir criterios de auditoría (Oil & Gas Standard)
    const prompt = `
      Analiza el siguiente contrato y valida el cumplimiento de estos puntos críticos:
      1. Vigencia y Renovación: ¿Están claras las fechas?
      2. Seguros y Responsabilidad: ¿Cumple con coberturas estándar?
      3. Penalidades: ¿Existen cláusulas de incumplimiento claras?
      4. Terminación: ¿Condiciones de rescisión justas?
      5. Confidencialidad: ¿Protección de datos industriales?

      Contrato:
      ${version.content_extracted.substring(0, 8000)}

      Responde en formato JSON puro con esta estructura:
      {
        "compliant": boolean,
        "score": number (0-100),
        "findings": [
          { "clause": string, "status": "compliant"|"non-compliant"|"warning", "description": string, "recommendation": string }
        ],
        "summary": string
      }
    `;

    const response = await aiClient.chat([
      { role: 'system', content: 'Eres un auditor legal senior especializado en el sector energético.' },
      { role: 'user', content: prompt }
    ], orgId, { response_format: 'json_object' });

    const result = JSON.parse(response.content) as ContractValidationResult;

    // 3. Guardar resultado en la base de datos
    await supabase.from('contracts').upsert({
      id: contractId,
      org_id: orgId,
      status: result.compliant ? 'active' : 'pending_review',
      compliance_score: result.score,
      metadata: { 
        last_audit: new Date().toISOString(),
        findings_count: result.findings.length,
        summary: result.summary
      }
    });

    return result;
  }
}

export const contractValidator = new ContractValidator();

import { aiClient } from './ai-client';
import { createClient } from '@/utils/supabase/server';

import { z } from 'zod';

export const InvoiceValidationResultSchema = z.object({
  matches_contract: z.boolean(),
  discrepancies: z.array(z.object({
    type: z.enum(['amount', 'date', 'tax', 'item', 'other']),
    description: z.string(),
    expected: z.string(),
    found: z.string(),
    severity: z.enum(['high', 'medium', 'low'])
  })),
  total_invoice: z.number(),
  currency: z.string(),
  summary: z.string()
});

export type InvoiceValidationResult = z.infer<typeof InvoiceValidationResultSchema>;

/**
 * Service for cross-checking invoices against contracts.
 */
export class InvoiceValidator {
  /**
   * Valida una factura contra su contrato asociado.
   */
  async validate(invoiceId: string, contractId: string, orgId: string): Promise<InvoiceValidationResult> {
    const supabase = await createClient();

    // 1. Obtener contenido de Factura y Contrato
    const { data: invoiceVersion } = await supabase
      .from('document_versions')
      .select('content_extracted')
      .eq('document_id', invoiceId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { data: contractVersion } = await supabase
      .from('document_versions')
      .select('content_extracted')
      .eq('document_id', contractId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!invoiceVersion?.content_extracted || !contractVersion?.content_extracted) {
      throw new Error('No se encontró contenido para la factura o el contrato');
    }

    // 2. Comparar usando IA
    const prompt = `
      Compara esta FACTURA contra su CONTRATO. 
      Busca discrepancias en montos, fechas de pago, impuestos o conceptos no autorizados.

      CONTENIDO DEL CONTRATO:
      ${contractVersion.content_extracted.substring(0, 5000)}

      ---
      CONTENIDO DE LA FACTURA:
      ${invoiceVersion.content_extracted.substring(0, 3000)}

      Responde en JSON con esta estructura:
      {
        "matches_contract": boolean,
        "discrepancies": [
          { "type": "amount"|"date"|"tax"|"item", "description": string, "expected": string, "found": string, "severity": "high"|"medium"|"low" }
        ],
        "total_invoice": number,
        "currency": string,
        "summary": string
      }
    `;

    const response = await aiClient.chat([
      { role: 'system', content: 'Eres un auditor financiero experto en conciliación de cuentas.' },
      { role: 'user', content: prompt }
    ], orgId, { json: true });

    const result = InvoiceValidationResultSchema.parse(JSON.parse(response.content));

    // 3. Registrar auditoría en la tabla invoices
    await (supabase.from('invoices') as any).update({
      amount: result.total_invoice,
      currency: result.currency,
      validation_status: result.matches_contract ? 'valid' : 'invalid',
      discrepancies: result.discrepancies as any,
      metadata: {
        last_check: new Date().toISOString(),
        summary: result.summary
      }
    }).eq('id', invoiceId);

    return result;
  }
}

export const invoiceValidator = new InvoiceValidator();

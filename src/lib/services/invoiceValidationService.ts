import { SupabaseClient } from '@supabase/supabase-js';
import { deepseekClient } from '../ai/deepseek-client';

export interface InvoiceValidationResult {
  isValid: boolean;
  score: number;
  observations: string[];
  mismatches: {
    field: string;
    invoiceValue: any;
    contractValue: any;
    severity: 'low' | 'medium' | 'high';
  }[];
}

/**
 * Validates an invoice against its associated contract and metadata.
 */
export async function validateInvoice(
  supabase: SupabaseClient,
  invoiceId: string
): Promise<InvoiceValidationResult> {
  // 1. Fetch invoice and related contract
  const { data: invoice, error: iError } = await supabase
    .from('invoices')
    .select(`
      *,
      contracts (*)
    `)
    .eq('id', invoiceId)
    .single();

  if (iError || !invoice) throw new Error('No se pudo encontrar la factura para validación');

  const contract = invoice.contracts;
  const observations: string[] = [];
  const mismatches: any[] = [];
  let score = 100;

  // 2. Perform automated checks
  
  // Rule: Invoice amount vs Contract value (if available)
  if (contract?.contract_value && invoice.amount > contract.contract_value) {
    score -= 40;
    mismatches.push({
      field: 'monto',
      invoiceValue: invoice.amount,
      contractValue: contract.contract_value,
      severity: 'high'
    });
    observations.push('El monto de la factura supera el valor total del contrato.');
  }

  // Rule: PO Number validation
  if (!invoice.po_number) {
    score -= 20;
    observations.push('La factura no tiene un número de Orden de Compra (PO) asociado.');
  }

  // Rule: Contract date range
  const invoiceDate = new Date(invoice.created_at);
  if (contract && (invoiceDate < new Date(contract.start_date) || invoiceDate > new Date(contract.end_date))) {
    score -= 30;
    observations.push('La fecha de la factura está fuera del periodo de vigencia del contrato.');
    mismatches.push({
      field: 'fecha',
      invoiceValue: invoiceDate.toLocaleDateString(),
      contractValue: `${contract.start_date} a ${contract.end_date}`,
      severity: 'medium'
    });
  }

  // 3. AI Insight Check (Semantic cross-referencing)
  try {
    const aiCheck = await deepseekClient.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: 'Eres un Auditor de Finanzas en Oil & Gas. Compara los datos de la factura con los términos del contrato y detecta discrepancias en servicios, impuestos o cláusulas especiales.' 
        },
        { 
          role: 'user', 
          content: `Factura: ${JSON.stringify(invoice)}\n\nContrato: ${JSON.stringify(contract)}` 
        }
      ],
      temperature: 0.1,
      max_tokens: 400
    });

    const aiAnalysis = aiCheck.choices[0]?.message?.content || '';
    if (aiAnalysis.toLowerCase().includes('discrepancia') || aiAnalysis.toLowerCase().includes('error')) {
      observations.push(`Análisis IA: ${aiAnalysis.substring(0, 150)}...`);
    }
  } catch (err) {
    console.error('AI Validation Error:', err);
  }

  const result: InvoiceValidationResult = {
    isValid: score > 70,
    score: Math.max(0, score),
    observations,
    mismatches
  };

  // 4. Update invoice with results
  await supabase
    .from('invoices')
    .update({
      validation_result: result,
      status: result.isValid ? 'aprobada' : 'observada',
      validated_at: new Date().toISOString()
    })
    .eq('id', invoiceId);

  return result;
}

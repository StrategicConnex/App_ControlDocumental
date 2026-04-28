import { SupabaseClient } from '@supabase/supabase-js';

export interface DigitalSignature {
  document_id: string;
  version_id: string;
  signer_id: string;
  signature_hash: string;
  ip_address: string;
}

/**
 * Computes a SHA-256 hash of a string or buffer.
 */
export async function computeHash(content: string | ArrayBuffer): Promise<string> {
  const msgUint8 = typeof content === 'string' 
    ? new TextEncoder().encode(content) 
    : new Uint8Array(content);
    
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Signs a document digitally.
 * Records the hash, IP, and timestamp in the database.
 */
export async function signDocument(
  supabase: SupabaseClient,
  payload: {
    document_id: string;
    version_id: string;
    signer_id: string;
    content: string; // The content or file reference to hash
  }
): Promise<void> {
  const signatureHash = await computeHash(`${payload.content}-${payload.signer_id}-${Date.now()}`);

  const { error } = await supabase
    .from('digital_signatures')
    .insert({
      document_id: payload.document_id,
      version_id: payload.version_id,
      signer_id: payload.signer_id,
      signature_hash: signatureHash,
      signer_certificate_hash: 'SELF-SIGNED-V1', // Simplified for now
      ip_address: '127.0.0.1', // Should be fetched from server context in real app
      validation_provider: 'Propio',
      validation_timestamp: new Date().toISOString()
    });

  if (error) throw error;

  // Update document to 'firmado' status (custom logic)
  await supabase
    .from('documents')
    .update({ 
      metadata: { 
        is_signed: true,
        signed_at: new Date().toISOString()
      } 
    })
    .eq('id', payload.document_id);
}

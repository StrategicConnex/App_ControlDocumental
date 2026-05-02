import type { SupabaseClient } from '@supabase/supabase-js';

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
 * Records the deterministic hash, IP, and timestamp in the database.
 */
export async function signDocument(
  supabase: SupabaseClient,
  payload: {
    document_id: string;
    version_id: string;
    signer_id: string;
    content: string; // The content or file reference to hash
    ip_address: string;
  }
): Promise<string> {
  // Deterministic Hash: content + metadata (verifiable)
  const signatureHash = await computeHash(
    `${payload.content}|${payload.document_id}|${payload.version_id}|${payload.signer_id}`
  );

  const { error } = await supabase
    .from('digital_signatures')
    .insert({
      document_id: payload.document_id,
      version_id: payload.version_id,
      signer_id: payload.signer_id,
      signature_hash: signatureHash,
      signer_certificate_hash: 'SELF-SIGNED-V2', 
      ip_address: payload.ip_address,
      validation_provider: 'StrategicConnex-Internal',
      validation_timestamp: new Date().toISOString()
    });

  if (error) {
    console.error('Error recording digital signature:', error);
    throw new Error(`Failed to record digital signature: ${error.message}`);
  }

  // Update document metadata
  const { error: updateError } = await supabase
    .from('documents')
    .update({ 
      metadata: { 
        is_signed: true,
        signed_at: new Date().toISOString(),
        last_signature_hash: signatureHash
      } 
    })
    .eq('id', payload.document_id);

  if (updateError) {
    console.warn('Signature recorded but document metadata update failed:', updateError);
  }

  return signatureHash;
}

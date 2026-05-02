import type { SupabaseClient } from '@supabase/supabase-js';
import { recordAuditLog } from './audit';
import type { Database } from '@/types/supabase';

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
  supabase: SupabaseClient<Database>,
  payload: {
    org_id: string;
    document_id: string;
    version_id: string;
    signer_id: string;
    content: string; // The content or file reference to hash
    ip_address: string;
  }
): Promise<{ signatureId: string; signatureHash: string }> {
  // Deterministic Hash: content + metadata (verifiable)
  const signatureHash = await computeHash(
    `${payload.content}|${payload.document_id}|${payload.version_id}|${payload.signer_id}`
  );

  const { data: signatureData, error } = await supabase
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
    })
    .select()
    .single();

  if (error) {
    console.error('Error recording digital signature:', error);
    throw new Error(`Failed to record digital signature: ${error.message}`);
  }

  const signatureId = signatureData.id;


  // Audit Log Entry
  await recordAuditLog(supabase, {
    org_id: payload.org_id,
    user_id: payload.signer_id,
    event_type: 'DOC_SIGNED',
    resource_type: 'DOCUMENT',
    resource_id: payload.document_id,
    new_value: {
      version_id: payload.version_id,
      signature_hash: signatureHash
    },
    ip_address: payload.ip_address,
    metadata: {
      action: 'digital_signature'
    }
  });

  // Update document metadata (merge with existing to avoid data loss)
  const { data: existingDoc } = await supabase
    .from('documents')
    .select('metadata')
    .eq('id', payload.document_id)
    .single();

  const existingMetadata = (existingDoc?.metadata as Record<string, unknown>) || {};
  const mergedMetadata = {
    ...existingMetadata,
    is_signed: true,
    signed_at: new Date().toISOString(),
    last_signature_hash: signatureHash,
  };

  const { error: updateError } = await supabase
    .from('documents')
    .update({ metadata: mergedMetadata })
    .eq('id', payload.document_id);

  if (updateError) {
    console.warn('Signature recorded but document metadata update failed:', updateError);
  }

  // Workflow Trigger
  // NOTE: This should be handled by a Server Action or a dedicated API route
  // to avoid leaking server-only utilities to the client bundle.
  try {
    // await fetch('/api/workflows/trigger', { ... })
    console.log('Workflow trigger placeholder for DOC_SIGNED');
  } catch (wfError) {
    console.warn('Workflow trigger failed:', wfError);
  }

  return { signatureId, signatureHash };
}


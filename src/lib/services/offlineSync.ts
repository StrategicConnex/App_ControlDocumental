import type { SupabaseClient } from '@supabase/supabase-js';
import { getQueue, removeFromQueue, OfflineAction } from '../offline/queue';
import { createDocumentVersion } from './versions';
import { recordApprovalDecision } from './approvals';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';

let currentStatus: SyncStatus = 'idle';
let pendingCount = 0;
let totalToSync = 0;
const listeners: Set<(status: SyncStatus, pending: number, total: number) => void> = new Set();

function notify() {
  listeners.forEach(l => l(currentStatus, pendingCount, totalToSync));
}

export function subscribeToSync(callback: (status: SyncStatus, pending: number, total: number) => void) {
  listeners.add(callback);
  callback(currentStatus, pendingCount, totalToSync);
  return () => listeners.delete(callback);
}

/**
 * Processes the offline action queue and synchronizes with Supabase.
 */
export async function syncOfflineQueue(supabase: SupabaseClient) {
  const queue = await getQueue();
  
  if (queue.length === 0) {
    currentStatus = 'idle';
    pendingCount = 0;
    totalToSync = 0;
    notify();
    return;
  }
  
  currentStatus = 'syncing';
  totalToSync = queue.length;
  pendingCount = queue.length;
  notify();
  
  console.log(`Sincronizando ${queue.length} acciones offline...`);
  
  for (const action of queue) {
    try {
      await processAction(supabase, action);
      await removeFromQueue(action.id);
      pendingCount--;
      notify();
      console.log(`Acción ${action.type} sincronizada con éxito.`);
    } catch (error) {
      currentStatus = 'error';
      notify();
      console.error(`Error sincronizando acción ${action.id}:`, error);
      break; // Stop sync on error
    }
  }

  if (pendingCount === 0) {
    currentStatus = 'success';
    notify();
    setTimeout(() => {
      currentStatus = 'idle';
      notify();
    }, 3000);
  }
}

async function processAction(supabase: SupabaseClient, action: OfflineAction) {
  switch (action.type) {
    case 'upload_document':
      // Handle file upload if payload contains a blob
      if (action.payload.fileBlob) {
        const file = new File([action.payload.fileBlob], action.payload.fileName, { type: action.payload.fileType });
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(`${action.payload.document_id}/${Date.now()}_${file.name}`, file);
          
        if (uploadError) throw uploadError;
        
        action.payload.file_url = uploadData.path;
      }
      return await createDocumentVersion(supabase, action.payload);
      
    case 'add_approval':
      return await recordApprovalDecision(supabase, action.payload);
      
    // Add more cases as needed
    default:
      console.warn(`Tipo de acción no soportado: ${action.type}`);
  }
}

/**
 * Hook or helper to monitor online status and trigger sync.
 */
export function setupAutoSync(supabase: SupabaseClient) {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => syncOfflineQueue(supabase));
    
    // Initial check
    if (navigator.onLine) {
      syncOfflineQueue(supabase);
    }
  }
}

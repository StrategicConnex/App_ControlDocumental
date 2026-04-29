'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { subscribeToSync, SyncStatus } from '@/lib/services/offlineSync';

export default function SyncProgress() {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [pending, setPending] = useState(0);
  const [total, setTotal] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);

    // Sync subscription
    const unsubscribe = subscribeToSync((s, p, t) => {
      setStatus(s);
      setPending(p);
      setTotal(t);
    });

    // Online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!mounted || (status === 'idle' && isOnline)) return null;

  const progress = total > 0 ? ((total - pending) / total) * 100 : 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className={cn(
        "bg-white rounded-2xl shadow-2xl border p-4 w-72 transition-all",
        !isOnline ? "border-amber-200" : "border-gray-100"
      )}>
        <div className="flex items-center gap-3 mb-3">
          <div className={cn(
            "p-2 rounded-xl",
            !isOnline ? "bg-amber-50 text-amber-600" : 
            status === 'syncing' ? "bg-blue-50 text-blue-600 animate-pulse" :
            status === 'success' ? "bg-emerald-50 text-emerald-600" :
            status === 'error' ? "bg-rose-50 text-rose-600" : "bg-gray-50 text-gray-400"
          )}>
            {!isOnline ? <CloudOff size={18} /> :
             status === 'syncing' ? <RefreshCw size={18} className="animate-spin" /> :
             status === 'success' ? <CheckCircle2 size={18} /> :
             status === 'error' ? <AlertCircle size={18} /> : <Cloud size={18} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">
              {!isOnline ? "Modo Offline Activo" :
               status === 'syncing' ? "Sincronizando..." :
               status === 'success' ? "¡Sincronizado!" :
               status === 'error' ? "Error de sincronización" : "Conectado"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {!isOnline ? "Los cambios se guardarán localmente" :
               status === 'syncing' ? `Procesando ${total - pending + 1} de ${total}` :
               status === 'success' ? "Todos los cambios están al día" :
               "Esperando conexión..."}
            </p>
          </div>
        </div>

        {!isOnline && pending > 0 && (
          <div className="mt-2 py-1 px-2 bg-amber-50 rounded-lg">
             <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">
               {pending} pendientes de subida
             </p>
          </div>
        )}

        {status === 'syncing' && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-medium text-gray-500">
              <span>Progreso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

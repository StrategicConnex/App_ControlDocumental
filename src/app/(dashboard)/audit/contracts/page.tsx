'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ContractsAuditPage() {
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data, isLoading, refetch: fetchContracts } = useQuery({
    queryKey: ['contracts-audit'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { items: [], orgId: '' };

      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .maybeSingle();

      const org_id = profile?.org_id;
      if (!org_id) return { items: [], orgId: '' };

      const { data } = await supabase
        .from('documents')
        .select(`
          id,
          title,
          category,
          contracts (
            status,
            compliance_score,
            metadata
          )
        `)
        .eq('org_id', org_id)
        .eq('category', 'Contratos')
        .is('deleted_at', null);

      return { items: data || [], orgId: org_id };
    }
  });

  const contracts = data?.items || [];
  const orgId = data?.orgId || '';

  const validateMutation = useMutation({
    mutationFn: async ({ contractId, orgId }: { contractId: string; orgId: string }) => {
      const response = await fetch('/api/ai/validate/contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId, orgId })
      });
      if (!response.ok) throw new Error('Error validating contract');
      return response.json();
    },
    onMutate: (vars) => {
      setValidatingId(vars.contractId);
    },
    onSettled: () => {
      setValidatingId(null);
      queryClient.invalidateQueries({ queryKey: ['contracts-audit'] });
    }
  });

  const validateContract = (contractId: string, orgId: string) => {
    validateMutation.mutate({ contractId, orgId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">IA Auditoría de Contratos</h1>
          <p className="text-gray-500 mt-2">Validación automática de cláusulas críticas y cumplimiento industrial.</p>
        </div>
        <button 
          onClick={() => fetchContracts()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contracts.map((doc: any) => {
          const audit = doc.contracts?.[0];
          const score = audit?.compliance_score || 0;
          const status = audit?.status || 'pending';

          return (
            <div 
              key={doc.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "p-3 rounded-2xl",
                    status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    <FileCheck size={24} />
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                      status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {status === 'active' ? 'Auditado' : 'Pendiente'}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                  {doc.title}
                </h3>
                
                {audit ? (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">Cumplimiento</span>
                      <span className={cn(
                        "text-sm font-bold",
                        score > 80 ? "text-emerald-600" : score > 50 ? "text-amber-600" : "text-rose-600"
                      )}>
                        {score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-500",
                          score > 80 ? "bg-emerald-500" : score > 50 ? "bg-amber-500" : "bg-rose-500"
                        )}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 italic line-clamp-2">
                      {(audit.metadata as any)?.summary || 'No hay resumen disponible.'}
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 py-4 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-gray-200 mb-2" />
                    <p className="text-xs text-gray-400">Sin auditoría activa</p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex gap-2">
                <button 
                  onClick={() => validateContract(doc.id, orgId)}
                  disabled={validatingId === doc.id}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                  {validatingId === doc.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  {audit ? 'Re-auditar' : 'Iniciar Auditoría'}
                </button>
                <button className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all">
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { 
  Receipt, 
  AlertCircle, 
  CheckCircle2, 
  Search,
  ArrowRightLeft,
  Loader2,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InvoicesAuditPage() {
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch: fetchData } = useQuery({
    queryKey: ['invoices-audit'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { invoices: [], contracts: [] };

      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

      const org_id = profile?.org_id;
      if (!org_id) return { invoices: [], contracts: [] };

      const { data: invData } = await supabase
        .from('documents')
        .select(`
          id,
          title,
          invoices (
            id,
            contract_id,
            validation_status,
            amount,
            currency,
            discrepancies,
            metadata
          )
        `)
        .eq('org_id', org_id)
        .eq('category', 'Facturas')
        .is('deleted_at', null);

      const { data: conData } = await supabase
        .from('documents')
        .select('id, title')
        .eq('org_id', org_id)
        .eq('category', 'Contratos')
        .is('deleted_at', null);

      return {
        invoices: invData || [],
        contracts: conData || []
      };
    }
  });

  const invoices = data?.invoices || [];
  const contracts = data?.contracts || [];

  const validateMutation = useMutation({
    mutationFn: async ({ invoiceId, contractId, orgId }: { invoiceId: string; contractId: string; orgId: string }) => {
      const response = await fetch('/api/ai/validate/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, contractId, orgId })
      });
      if (!response.ok) throw new Error('Error validating invoice');
      return response.json();
    },
    onMutate: (vars) => {
      setValidatingId(vars.invoiceId);
    },
    onSettled: () => {
      setValidatingId(null);
      queryClient.invalidateQueries({ queryKey: ['invoices-audit'] });
    }
  });

  const validateInvoice = (invoiceId: string, contractId: string, orgId: string) => {
    if (!contractId) {
      alert('Debes asociar esta factura a un contrato primero.');
      return;
    }
    validateMutation.mutate({ invoiceId, contractId, orgId });
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Conciliación de Facturas</h1>
          <p className="text-gray-500 mt-2">Detección inteligente de discrepancias financieras vs. contratos.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <TrendingUp className="text-emerald-600" size={20} />
            <div>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Ahorro Detectado</p>
              <p className="text-lg font-black text-emerald-700">$12,450.00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Factura</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Contrato Asociado</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Monto</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Estado IA</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoices.map((doc: any) => {
              const audit = doc.invoices?.[0];
              const status = audit?.validation_status || 'pending';
              const discrepancies = audit?.discrepancies || [];

              return (
                <tr key={doc.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        <Receipt size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{doc.title}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase">ID: {doc.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className="text-xs bg-white border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-[200px]"
                      defaultValue={audit?.contract_id || ""}
                    >
                      <option value="">Seleccionar Contrato...</option>
                      {contracts.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Wallet size={14} className="text-gray-400" />
                      <span className="text-sm font-bold text-gray-700">
                        {audit ? `${audit.total_amount} ${audit.currency}` : '---'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {status === 'valid' ? (
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Válida</span>
                      </div>
                    ) : status === 'invalid' ? (
                      <div className="flex items-center gap-2 text-rose-600">
                        <AlertCircle size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Discrepancias ({discrepancies.length})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Sin Analizar</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => validateInvoice(doc.id, audit?.contract_id, 'org_id')}
                      disabled={validatingId === doc.id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      {validatingId === doc.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <ArrowRightLeft size={14} />
                      )}
                      {audit ? 'Re-validar' : 'Validar con IA'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

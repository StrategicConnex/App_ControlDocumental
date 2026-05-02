"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getBudgetById, updateBudgetStatus } from "@/lib/services/budgets";
import { cn } from "@/lib/utils";

export default function BudgetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: budget, isLoading } = useQuery({
    queryKey: ["budget", resolvedParams.id],
    queryFn: () => getBudgetById(supabase, resolvedParams.id),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: string) => updateBudgetStatus(supabase, resolvedParams.id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget", resolvedParams.id] });
      router.refresh();
    },
    onError: (error) => {
      console.error(error);
      alert("Error actualizando estado");
    }
  });

  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate(newStatus);
  };

  const handleExportPDF = () => {
    alert("Simulación: Generando PDF con diseño corporativo...");
  };

  if (isLoading) return <div className="p-8 text-center">Cargando...</div>;
  if (!budget) return <div className="p-8 text-center">Presupuesto no encontrado.</div>;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/budgets" className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{budget.title}</h1>
              <div className={cn(
                "px-2.5 py-1 rounded-full text-xs font-semibold capitalize",
                budget.status === 'rechazado' || budget.status === 'vencido' ? "bg-rose-50 text-rose-600" :
                budget.status === 'enviado' ? "bg-amber-50 text-amber-600" :
                budget.status === 'aceptado' ? "bg-emerald-50 text-emerald-600" :
                "bg-gray-100 text-gray-600"
              )}>
                {budget.status}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">ID: {budget.id?.split('-')[0]?.toUpperCase() ?? 'N/A'} • {budget.created_at ? new Date(budget.created_at).toLocaleDateString() : 'Fecha no disponible'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download size={16} /> Exportar PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-[2rem] card-shadow border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 text-lg border-b border-gray-100 pb-4">Detalle de Ítems</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Descripción</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase text-center">Cant.</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase text-right">P. Unitario</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {budget.budget_items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-4 text-sm text-gray-900">{item.description}</td>
                      <td className="py-4 text-sm text-gray-600 text-center">{item.quantity}</td>
                      <td className="py-4 text-sm text-gray-600 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="py-4 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-end pt-6 border-t border-gray-100">
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium mb-1">Monto Total</p>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">
                  {formatCurrency(budget.total_amount || 0)}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" /> Gestión de Estado
            </h3>
            <p className="text-sm text-gray-500 mb-6">Actualice el estado de la propuesta para reflejar su evolución con el cliente.</p>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleStatusChange('aceptado')}
                disabled={budget.status === 'aceptado'}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 text-left transition-colors group disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-500" size={18} />
                  <span className="text-sm font-medium text-gray-900">Aceptado</span>
                </div>
                {budget.status === 'aceptado' && <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">Actual</span>}
              </button>
              
              <button 
                onClick={() => handleStatusChange('enviado')}
                disabled={budget.status === 'enviado'}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50 text-left transition-colors group disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="flex items-center gap-3">
                  <Clock className="text-amber-500" size={18} />
                  <span className="text-sm font-medium text-gray-900">Enviado</span>
                </div>
                {budget.status === 'enviado' && <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md">Actual</span>}
              </button>

              <button 
                onClick={() => handleStatusChange('rechazado')}
                disabled={budget.status === 'rechazado'}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-rose-200 hover:bg-rose-50 text-left transition-colors group disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="flex items-center gap-3">
                  <XCircle className="text-rose-500" size={18} />
                  <span className="text-sm font-medium text-gray-900">Rechazado</span>
                </div>
                {budget.status === 'rechazado' && <span className="text-xs font-semibold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">Actual</span>}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { DollarSign, FileCheck, AlertCircle, TrendingUp, Briefcase } from 'lucide-react';
import { ReportContainer } from './ReportContainer';
import { ReportFilters } from './ReportFilters';
import { useFilters } from '@/hooks/useFilters';
import { useExport } from '@/hooks/useExport';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const GET_FINANCIAL_DATA = gql`
  query GetFinancialData($startDate: String, $endDate: String, $status: String, $search: String) {
    invoices(startDate: $startDate, endDate: $endDate, status: $status, search: $search) {
      id
      invoice_number
      amount_total
      ai_validation_score
      ai_discrepancy_notes
      status
      created_at
    }
  }
`;

export function FinancialReport() {
  const { filters, updateFilters, resetFilters } = useFilters();
  const { exportToExcel, exportToCSV } = useExport();
  
  const { data, loading, error } = useQuery<{ invoices: any[] }>(GET_FINANCIAL_DATA, {
    variables: {
      startDate: filters.startDate,
      endDate: filters.endDate,
      status: filters.status,
      search: filters.search
    }
  });

  const invoices = data?.invoices || [];
  
  const totalAmount = invoices.reduce((acc: number, inv: any) => acc + (inv.amount_total || 0), 0);
  const avgScore = invoices.length > 0 
    ? Math.round(invoices.reduce((acc: number, inv: any) => acc + (inv.ai_validation_score || 0), 0) / invoices.length)
    : 0;
  const discrepancies = invoices.filter((inv: any) => inv.ai_validation_score < 80).length;

  const stats = [
    { label: 'Total Facturado', value: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(totalAmount), icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Score Promedio IA', value: `${avgScore}%`, icon: FileCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Discrepancias', value: discrepancies, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-lg">Error: {error.message}</div>;

  return (
    <ReportContainer 
      title="Auditoría Financiera" 
      description="Validación inteligente de facturación vs órdenes de compra"
      data={invoices}
      filters={filters}
      onExportExcel={(mode) => exportToExcel({
        data: invoices,
        reportType: 'FINANCIAL',
        filename: 'Reporte_Financiero',
        filters,
        mode
      })}
      onExportCSV={() => exportToCSV({
        data: invoices,
        reportType: 'FINANCIAL',
        filename: 'Reporte_Financiero',
        filters,
        mode: 'vista'
      })}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="p-4 bg-white border border-slate-100 shadow-sm rounded-2xl flex items-center gap-4">
            <div className={cn("p-3 rounded-xl", stat.bg)}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <ReportFilters 
        filters={filters}
        onUpdate={updateFilters}
        onReset={resetFilters}
        statuses={['validated', 'pending', 'rejected', 'discrepancy']}
      />

      <div className="bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Factura #</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Monto (USD)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Validación IA</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                    No se encontraron registros financieros bajo estos criterios.
                  </td>
                </tr>
              ) : (
                invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-black text-slate-900 font-mono tracking-tighter">
                      {inv.invoice_number || 'S/N'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(inv.amount_total)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              inv.ai_validation_score >= 90 ? "bg-emerald-500" :
                              inv.ai_validation_score >= 70 ? "bg-amber-500" : "bg-rose-500"
                            )} 
                            style={{ width: `${inv.ai_validation_score}%` }} 
                          />
                        </div>
                        <span className={cn(
                          "text-[10px] font-black",
                          inv.ai_validation_score >= 90 ? "text-emerald-600" :
                          inv.ai_validation_score >= 70 ? "text-amber-600" : "text-rose-600"
                        )}>
                          {inv.ai_validation_score}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm ring-1",
                        inv.status === 'validated' ? "bg-emerald-50 text-emerald-700 ring-emerald-200" :
                        inv.status === 'rejected' ? "bg-rose-50 text-rose-700 ring-rose-200" : "bg-slate-50 text-slate-700 ring-slate-200"
                      )}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ReportContainer>
  );
}

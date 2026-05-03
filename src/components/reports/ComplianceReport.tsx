'use client';

import React from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, Activity } from 'lucide-react';
import { ReportContainer } from './ReportContainer';
import { ReportFilters } from './ReportFilters';
import { useFilters } from '@/hooks/useFilters';
import { useExport } from '@/hooks/useExport';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const GET_COMPLIANCE_DATA = gql`
  query GetComplianceData($startDate: String, $endDate: String, $status: String, $category: String, $search: String) {
    documents(startDate: $startDate, endDate: $endDate, status: $status, category: $category, search: $search) {
      id
      title
      code
      category
      status
      expiry_date
      created_at
    }
    complianceMetrics {
      total_documents
      expired_documents
      pending_approvals
      risk_score
    }
  }
`;

export function ComplianceReport() {
  const { filters, updateFilters, resetFilters } = useFilters();
  const { exportToExcel, exportToCSV } = useExport();
  
  const { data, loading, error } = useQuery<{ documents: any[], complianceMetrics: any }>(GET_COMPLIANCE_DATA, {
    variables: {
      startDate: filters.startDate,
      endDate: filters.endDate,
      status: filters.status,
      category: filters.category,
      search: filters.search
    }
  });

  const documents = data?.documents || [];
  const metrics = data?.complianceMetrics || { total_documents: 0, expired_documents: 0, pending_approvals: 0, risk_score: 0 };

  const stats = [
    { label: 'Documentos', value: metrics.total_documents, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Vencidos', value: metrics.expired_documents, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Pendientes', value: metrics.pending_approvals, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Risk Score', value: `${metrics.risk_score}%`, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-lg">Error: {error.message}</div>;

  return (
    <ReportContainer 
      title="Cumplimiento Documental" 
      description="Estado de vigencia y cumplimiento normativo ISO/AENOR"
      data={documents}
      filters={filters}
      onExportExcel={(mode) => exportToExcel({
        data: documents,
        reportType: 'COMPLIANCE',
        filename: 'Reporte_Cumplimiento',
        filters,
        mode
      })}
      onExportCSV={() => exportToCSV({
        data: documents,
        reportType: 'COMPLIANCE',
        filename: 'Reporte_Cumplimiento',
        filters,
        mode: 'vista'
      })}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
        statuses={['vigente', 'vencido', 'pendiente', 'rechazado']}
        showCategory
        categories={['Legal', 'Técnico', 'RRHH', 'Seguridad', 'Financiero']}
      />

      <div className="bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Documento</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Código</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoría</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Vencimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20 font-mono" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                    No se encontraron documentos bajo los filtros actuales.
                  </td>
                </tr>
              ) : (
                documents.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{doc.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono italic">{doc.id.substring(0, 8)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {doc.code || 'S/N'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-600 font-medium">{doc.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm",
                        doc.status === 'vigente' ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" :
                        doc.status === 'vencido' ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200" : 
                        "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                      )}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={cn(
                        "text-xs font-bold font-mono",
                        doc.status === 'vencido' ? "text-rose-600" : "text-slate-600"
                      )}>
                        {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : 'Sin Vto.'}
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

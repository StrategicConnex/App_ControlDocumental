'use client';

import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { History, Activity, Shield, AlertCircle } from 'lucide-react';
import { ReportContainer } from './ReportContainer';
import { ReportFilters } from './ReportFilters';
import { useFilters } from '@/hooks/useFilters';
import { useExport } from '@/hooks/useExport';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const GET_AUDIT_LOGS = gql`
  query GetAuditLogs($startDate: String, $endDate: String, $action: String, $search: String) {
    auditLogs(startDate: $startDate, endDate: $endDate, action: $action, search: $search) {
      id
      action
      entity_type
      entity_id
      old_data
      new_data
      created_at
    }
  }
`;

export function AuditReport() {
  const { filters, updateFilters, resetFilters } = useFilters();
  const { exportToExcel, exportToCSV } = useExport();
  
  const { data, loading, error } = useQuery(GET_AUDIT_LOGS, {
    variables: {
      startDate: filters.startDate,
      endDate: filters.endDate,
      action: filters.status, // Using status selector for action in audit
      search: filters.search
    }
  });

  const logs = data?.auditLogs || [];

  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-lg">Error: {error.message}</div>;

  return (
    <ReportContainer 
      title="Auditoría de Sistema" 
      description="Trazabilidad completa de operaciones y accesos"
      data={logs}
      filters={filters}
      onExportExcel={(mode) => exportToExcel({
        data: logs,
        reportType: 'AUDIT',
        filename: 'Reporte_Auditoria',
        filters,
        mode
      })}
      onExportCSV={() => exportToCSV({
        data: logs,
        reportType: 'AUDIT',
        filename: 'Reporte_Auditoria',
        filters,
        mode: 'vista'
      })}
    >
      <ReportFilters 
        filters={filters}
        onUpdate={updateFilters}
        onReset={resetFilters}
        statuses={['INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT_PERSONNEL', 'EXPORT_VEHICLES', 'EXPORT_DOCUMENTS']}
      />

      <div className="bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha / Hora</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Acción</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Entidad / ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                    No se encontraron registros de auditoría para este periodo.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                      {new Date(log.created_at).toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter shadow-sm ring-1",
                        log.action.includes('create') || log.action === 'INSERT' ? "bg-emerald-50 text-emerald-700 ring-emerald-200" :
                        log.action.includes('delete') || log.action === 'DELETE' ? "bg-rose-50 text-rose-700 ring-rose-200" : 
                        log.action.includes('EXPORT') ? "bg-indigo-50 text-indigo-700 ring-indigo-200" : "bg-blue-50 text-blue-700 ring-blue-200"
                      )}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-900 capitalize">{log.entity_type}</p>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {log.entity_id?.substring(0, 8)}...</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-md truncate italic">
                      {log.new_data ? log.new_data.substring(0, 100) : 'Sin datos adicionales'}
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

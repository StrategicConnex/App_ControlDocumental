'use client';

import React from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Users, FileCheck, AlertCircle } from 'lucide-react';
import { ReportContainer } from './ReportContainer';
import { ReportFilters } from './ReportFilters';
import { useFilters } from '@/hooks/useFilters';
import { useExport } from '@/hooks/useExport';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const GET_PERSONNEL = gql`
  query GetPersonnel($status: String, $search: String) {
    personnel(status: $status, search: $search) {
      id
      first_name
      last_name
      cuil
      job_title
      status
      created_at
    }
  }
`;

export function PersonnelReport() {
  const { filters, updateFilters, resetFilters } = useFilters();
  const { exportToExcel, exportToCSV } = useExport();
  
  const { data, loading, error } = useQuery<{ personnel: any[] }>(GET_PERSONNEL, {
    variables: {
      status: filters.status,
      search: filters.search
    }
  });

  const personnel = data?.personnel || [];
  const activeCount = personnel.filter((p: any) => p.status === 'activo' || p.status === 'active').length;
  const pendingCount = personnel.filter((p: any) => p.status !== 'activo' && p.status !== 'active').length;

  const stats = [
    { label: 'Total Personal', value: personnel.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Activos', value: activeCount, icon: FileCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pendientes/Bloqueados', value: pendingCount, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-lg">Error: {error.message}</div>;

  return (
    <ReportContainer 
      title="Legajos de Personal" 
      description="Estado documental y administrativo del personal operativo"
      data={personnel}
      filters={filters}
      onExportExcel={(mode) => exportToExcel({
        data: personnel,
        reportType: 'PERSONNEL',
        filename: 'Reporte_Personal',
        filters,
        mode
      })}
      onExportCSV={() => exportToCSV({
        data: personnel,
        reportType: 'PERSONNEL',
        filename: 'Reporte_Personal',
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
        statuses={['activo', 'pendiente', 'bloqueado']}
      />

      <div className="bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre Completo</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">CUIL</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Puesto</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Trazabilidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : personnel.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                    No se encontraron registros que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                personnel.map((person: any) => (
                  <tr key={person.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{person.first_name} {person.last_name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">UUID: {person.id.substring(0, 8)}...</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{person.cuil}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{person.job_title}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm",
                        (person.status === 'activo' || person.status === 'active') 
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" 
                          : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                      )}>
                        {person.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-[10px] text-slate-400">Alta: {new Date(person.created_at).toLocaleDateString()}</p>
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

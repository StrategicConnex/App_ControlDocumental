'use client';

import React from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Truck, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ReportContainer } from './ReportContainer';
import { ReportFilters } from './ReportFilters';
import { useFilters } from '@/hooks/useFilters';
import { useExport } from '@/hooks/useExport';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const GET_VEHICLES = gql`
  query GetVehicles($status: String, $search: String) {
    vehicles(status: $status, search: $search) {
      id
      license_plate
      brand
      model
      type
      status
      created_at
    }
  }
`;

export function VehicleReport() {
  const { filters, updateFilters, resetFilters } = useFilters();
  const { exportToExcel, exportToCSV } = useExport();
  
  const { data, loading, error } = useQuery<{ vehicles: any[] }>(GET_VEHICLES, {
    variables: {
      status: filters.status,
      search: filters.search
    }
  });

  const vehicles = data?.vehicles || [];
  const activeCount = vehicles.filter((v: any) => v.status === 'activo' || v.status === 'active').length;
  const maintenanceCount = vehicles.filter((v: any) => v.status !== 'activo' && v.status !== 'active').length;

  const stats = [
    { label: 'Total Flota', value: vehicles.length, icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Operativos', value: activeCount, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Fuera de Servicio', value: maintenanceCount, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  if (error) return <div className="p-4 text-red-500 bg-red-50 rounded-lg">Error: {error.message}</div>;

  return (
    <ReportContainer 
      title="Flota de Vehículos" 
      description="Monitoreo de estado técnico y cumplimiento de flota"
      data={vehicles}
      filters={filters}
      onExportExcel={(mode) => exportToExcel({
        data: vehicles,
        reportType: 'VEHICLES',
        filename: 'Reporte_Vehiculos',
        filters,
        mode
      })}
      onExportCSV={() => exportToCSV({
        data: vehicles,
        reportType: 'VEHICLES',
        filename: 'Reporte_Vehiculos',
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
        statuses={['activo', 'mantenimiento', 'bloqueado']}
        showCategory
        categories={['Camioneta', 'Camión', 'Utilitario', 'Maquinaria']}
      />

      <div className="bg-white border border-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Dominio</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Marca / Modelo</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Trazabilidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                    No se encontraron vehículos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                vehicles.map((v: any) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors font-mono tracking-tighter text-lg">{v.license_plate}</p>
                      <p className="text-[10px] text-slate-400 font-mono">UUID: {v.id.substring(0, 8)}...</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700">{v.brand}</p>
                      <p className="text-xs text-slate-500">{v.model}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 capitalize">{v.type}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm",
                        (v.status === 'activo' || v.status === 'active') 
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" 
                          : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                      )}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-[10px] text-slate-400">Registrado: {new Date(v.created_at).toLocaleDateString()}</p>
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

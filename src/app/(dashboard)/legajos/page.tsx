import { createClient } from "@/utils/supabase/server";
import { getLegajos } from "@/lib/services/legajos";
import { FolderOpen, Plus, Search, Filter, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import KPICard from "@/components/ui/KPICard";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Legajos | Strategic Connex",
  description: "Gestión de legajos de organización.",
};

export default async function LegajosPage() {
  const supabase = await createClient();

  let legajos: {
    id: string;
    title: string;
    description?: string;
    status: string;
    created_at: string;
    org_id?: string;
  }[] = [];

  try {
    legajos = await getLegajos(supabase);
  } catch (e) {
    console.error("Error fetching legajos", e);
  }

  // KPIs
  const total = legajos.length;
  const activos = legajos.filter(l => l.status === 'activo' || l.status === 'vigente' || l.status === 'aprobado').length;
  const pendientes = legajos.filter(l => l.status === 'pendiente' || l.status === 'revision' || l.status === 'borrador').length;
  const vencidos = legajos.filter(l => l.status === 'vencido' || l.status === 'bloqueado').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Legajos</h1>
          <p className="text-sm text-gray-500">
            Repositorio de legajos y expedientes de la organización.
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg">
          <Plus size={18} /> Nuevo Legajo
        </button>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="Total de Legajos" value={total} icon={FolderOpen} color="indigo" />
        <KPICard title="Activos / Vigentes" value={activos} icon={CheckCircle2} color="emerald" />
        <KPICard title="Con Alertas" value={vencidos} icon={AlertTriangle} color="rose" />
      </div>

      {/* List */}
      <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 text-lg">Directorio de Legajos</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar legajo..."
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700">
              <Filter size={16} /> Filtros
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                  Título / Expediente
                </th>
                <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                  Fecha de Creación
                </th>
                <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {legajos.map((legajo) => (
                <tr key={legajo.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                        <FileText size={16} className="text-indigo-600" />
                      </div>
                      <span className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors text-sm">
                        {legajo.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-500 line-clamp-1">
                      {legajo.description || '—'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-500">
                      {new Date(legajo.created_at).toLocaleDateString('es-AR')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={legajo.status} />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link
                      href={`/legajos/${legajo.id}`}
                      className="inline-flex items-center justify-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Ver Detalle
                    </Link>
                  </td>
                </tr>
              ))}
              {legajos.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <FolderOpen size={40} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-sm font-medium text-gray-500">No hay legajos registrados.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Comience creando el primer legajo de la organización.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary footer */}
        {legajos.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
            <span>
              Mostrando {legajos.length} legajo{legajos.length !== 1 ? 's' : ''}
            </span>
            <span className={cn(pendientes > 0 ? "text-amber-500 font-medium" : "")}>
              {pendientes > 0 ? `${pendientes} pendiente${pendientes !== 1 ? 's' : ''} de revisión` : 'Todos al día'}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}

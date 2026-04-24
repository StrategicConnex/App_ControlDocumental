import { createClient } from "@/utils/supabase/server";
import { getVehicles } from "@/lib/services/vehicles";
import { Search, Filter, AlertTriangle, CheckCircle2, Truck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Vehículos | BordUp",
};

export default async function VehiclesPage() {
  const supabase = await createClient();
  
  let vehicles = [];
  try {
    vehicles = await getVehicles(supabase);
  } catch (e) {
    console.error("Error fetching vehicles", e);
  }

  // Calculate KPIs
  const total = vehicles.length;
  const vigentes = vehicles.filter(v => v.status === 'aprobado' || v.status === 'vigente').length;
  const bloqueados = vehicles.filter(v => v.status === 'vencido' || v.status === 'bloqueado').length;
  const porVencer = total - vigentes - bloqueados;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Acreditación de Flota</h1>
        <p className="text-sm text-gray-500">Control de habilitación de vehículos para operar en proyectos.</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Flota Habilitada</p>
            <p className="text-3xl font-bold text-gray-900">{vigentes}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Por Vencer (30 días)</p>
            <p className="text-3xl font-bold text-gray-900">{porVencer}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
            <Truck size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Inhabilitados</p>
            <p className="text-3xl font-bold text-gray-900">{bloqueados}</p>
          </div>
        </div>
      </div>

      {/* List */}
      <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 text-lg">Directorio de Flota</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar patente o tipo..." 
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 w-64"
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
                <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Patente</th>
                <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Tipo & Marca</th>
                <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                  <td className="py-3 px-4">
                    <Link href={`/vehicles/${vehicle.id}`} className="flex items-center gap-3">
                      <div className="bg-gray-100 text-gray-900 font-mono font-bold px-3 py-1 rounded-md border border-gray-200 shadow-sm">
                        {vehicle.license_plate}
                      </div>
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-900">{vehicle.type}</span>
                    <p className="text-xs text-gray-500">{vehicle.brand} {vehicle.model}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize",
                      vehicle.status === 'vencido' || vehicle.status === 'bloqueado' ? "bg-rose-50 text-rose-600" :
                      vehicle.status === 'por_vencer' ? "bg-amber-50 text-amber-600" :
                      "bg-emerald-50 text-emerald-600"
                    )}>
                      {vehicle.status === 'aprobado' || vehicle.status === 'vigente' ? 'Habilitado' : vehicle.status}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/vehicles/${vehicle.id}`} className="inline-flex items-center justify-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Ver Detalles
                    </Link>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
                    No hay vehículos registrados en esta organización.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

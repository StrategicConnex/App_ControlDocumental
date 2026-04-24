import { createClient } from "@/utils/supabase/server";
import { getPersonnel } from "@/lib/services/personnel";
import { Search, Filter, ShieldAlert, ShieldCheck, UserCog } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Personal | BordUp",
};

export default async function PersonnelPage() {
  const supabase = await createClient();
  
  let personnel = [];
  try {
    personnel = await getPersonnel(supabase);
  } catch (e) {
    console.error("Error fetching personnel", e);
  }

  // Calculate KPIs
  const total = personnel.length;
  // This is a simplified calculation for the mock UI
  const vigentes = personnel.filter(p => p.status === 'aprobado' || p.status === 'vigente').length;
  const bloqueados = personnel.filter(p => p.status === 'vencido' || p.status === 'bloqueado').length;
  const porVencer = total - vigentes - bloqueados;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Acreditación de Personal</h1>
        <p className="text-sm text-gray-500">Control de habilitación de personas para operar en yacimientos.</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <ShieldCheck size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Personal Vigente</p>
            <p className="text-3xl font-bold text-gray-900">{vigentes}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <UserCog size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Por Vencer (30 días)</p>
            <p className="text-3xl font-bold text-gray-900">{porVencer}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
            <ShieldAlert size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Bloqueados</p>
            <p className="text-3xl font-bold text-gray-900">{bloqueados}</p>
          </div>
        </div>
      </div>

      {/* List */}
      <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 text-lg">Directorio de Empleados</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar empleado..." 
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700">
              <Filter size={16} /> Filtros
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {personnel.map(person => (
            <Link href={`/personnel/${person.id}`} key={person.id} className="block group">
              <div className="p-4 rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-inner",
                    person.status === 'vencido' || person.status === 'bloqueado' ? "bg-rose-100 text-rose-700" :
                    person.status === 'por_vencer' ? "bg-amber-100 text-amber-700" :
                    "bg-emerald-100 text-emerald-700"
                  )}>
                    {person.first_name[0]}{person.last_name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {person.first_name} {person.last_name}
                    </h4>
                    <p className="text-xs text-gray-500">{person.job_title} • {person.cuil}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {personnel.length === 0 && (
            <div className="col-span-full py-8 text-center text-sm text-gray-500">
              No hay personal registrado en esta organización.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

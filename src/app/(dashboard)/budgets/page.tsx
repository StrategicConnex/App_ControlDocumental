import { createClient } from "@/utils/supabase/server";
import { getBudgets } from "@/lib/services/budgets";
import { Plus, Search, Filter, TrendingUp, DollarSign, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Presupuestos | BordUp",
};

export default async function BudgetsPage() {
  const supabase = await createClient();
  
  let budgets = [];
  try {
    budgets = await getBudgets(supabase);
  } catch (e) {
    console.error("Error fetching budgets", e);
  }

  // Calculate KPIs
  const totalBudgets = budgets.length;
  const accepted = budgets.filter(b => b.status === 'aceptado');
  const pending = budgets.filter(b => b.status === 'enviado' || b.status === 'borrador').length;
  
  const conversionRate = totalBudgets > 0 ? Math.round((accepted.length / totalBudgets) * 100) : 0;
  
  const totalAmountAccepted = accepted.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Presupuestos Inteligentes</h1>
          <p className="text-sm text-gray-500">Gestión de propuestas económicas y métricas de cierre.</p>
        </div>
        <Link href="/budgets/new" className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg">
          <Plus size={18} /> Nuevo Presupuesto
        </Link>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Facturación Aceptada</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalAmountAccepted)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tasa de Conversión</p>
            <p className="text-3xl font-bold text-gray-900">{conversionRate}%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pendientes/Borradores</p>
            <p className="text-3xl font-bold text-gray-900">{pending}</p>
          </div>
        </div>
      </div>

      {/* List */}
      <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 text-lg">Historial de Propuestas</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar presupuesto..." 
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
                <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Título / Propuesta</th>
                <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">Monto Total</th>
                <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {budgets.map((budget) => (
                <tr key={budget.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-4">
                    <Link href={`/budgets/${budget.id}`} className="font-semibold text-gray-900 hover:text-purple-600 transition-colors">
                      {budget.title}
                    </Link>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-500">
                      {new Date(budget.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize",
                      budget.status === 'rechazado' || budget.status === 'vencido' ? "bg-rose-50 text-rose-600" :
                      budget.status === 'enviado' ? "bg-amber-50 text-amber-600" :
                      budget.status === 'aceptado' ? "bg-emerald-50 text-emerald-600" :
                      "bg-gray-100 text-gray-600" // borrador
                    )}>
                      {budget.status}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-gray-900">
                    {formatCurrency(Number(budget.total_amount))}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link href={`/budgets/${budget.id}`} className="inline-flex items-center justify-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Ver Detalles
                    </Link>
                  </td>
                </tr>
              ))}
              {budgets.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                    No hay presupuestos registrados.
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

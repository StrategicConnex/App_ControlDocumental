import { createClient } from "@/utils/supabase/server";
import { getDocuments } from "@/lib/services/documents";
import { getPersonnel } from "@/lib/services/personnel";
import { getVehicles } from "@/lib/services/vehicles";
import { getBudgets } from "@/lib/services/budgets";
import { 
  Users, 
  DollarSign, 
  Bell, 
  AlertTriangle,
  FileText,
  Truck,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import ComplianceDashboard from "@/components/ui/ComplianceDashboard";

export const metadata = {
  title: "Dashboard | Strategic Connex",
};

export default async function Dashboard() {
  const supabase = await createClient();
  
  // Get User Profile for org_id
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('org_id').eq('id', user.id).single() : { data: null };
  const orgId = profile?.org_id;

  // Fetch all data in parallel
  const [docsData, personnelData, vehiclesData, budgetsData] = await Promise.all([
    getDocuments(supabase).catch(() => []),
    getPersonnel(supabase).catch(() => []),
    getVehicles(supabase).catch(() => []),
    getBudgets(supabase).catch(() => [])
  ]);


  // Aggregate Metrics
  const approvedDocs = docsData.filter(d => d.status === 'aprobado' || d.status === 'vigente').length;
  const totalPersonnel = personnelData.length;
  const blockedPersonnel = personnelData.filter(p => p.status === 'vencido' || p.status === 'bloqueado').length;
  const approvedPersonnel = totalPersonnel - blockedPersonnel;
  const blockedVehicles = vehiclesData.filter(v => v.status === 'vencido' || v.status === 'bloqueado').length;
  const approvedVehicles = vehiclesData.length - blockedVehicles;

  const acceptedBudgets = budgetsData.filter(b => b.status === 'aceptado');
  const totalRevenue = acceptedBudgets.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
  const conversionRate = budgetsData.length > 0 ? Math.round((acceptedBudgets.length / budgetsData.length) * 100) : 0;

  // Unified Alerts Feed
  const alerts: { id: string; type: 'document' | 'personnel' | 'vehicle'; title: string; status: string; link: string }[] = [];
  docsData.forEach(d => { if (d.status === 'por_vencer' || d.status === 'vencido') alerts.push({ id: `doc-${d.id}`, type: 'document', title: d.title, status: d.status, link: `/documents/${d.id}` }); });
  personnelData.forEach(p => { if (p.status === 'por_vencer' || p.status === 'vencido' || p.status === 'bloqueado') alerts.push({ id: `per-${p.id}`, type: 'personnel', title: `${p.first_name} ${p.last_name}`, status: p.status, link: `/personnel/${p.id}` }); });
  vehiclesData.forEach(v => { if (v.status === 'por_vencer' || v.status === 'vencido' || v.status === 'bloqueado') alerts.push({ id: `veh-${v.id}`, type: 'vehicle', title: `${v.license_plate} - ${v.brand}`, status: v.status, link: `/vehicles/${v.id}` }); });

  alerts.sort((a, b) => (b.status === 'vencido' || b.status === 'bloqueado' ? 1 : 0) - (a.status === 'vencido' || a.status === 'bloqueado' ? 1 : 0));
  const topAlerts = alerts.slice(0, 5);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Inteligencia</h1>
          <p className="text-sm text-gray-500">Métricas consolidadas de Strategic Connex.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] text-white relative overflow-hidden card-shadow">
          <div className="relative z-10 space-y-4">
            <p className="text-sm opacity-80">Documentos Activos</p>
            <h2 className="text-4xl font-bold">{approvedDocs} <span className="text-lg font-medium opacity-60">/ {docsData.length}</span></h2>
          </div>
          <div className="absolute bottom-0 right-6 opacity-20"><FileText size={80} /></div>
        </div>

        <div className="p-6 bg-gradient-to-br from-purple-600 to-purple-800 rounded-[2rem] text-white relative overflow-hidden card-shadow">
          <div className="relative z-10 space-y-4">
            <p className="text-sm opacity-80">Personal y Flota Acreditada</p>
            <div className="flex items-baseline gap-4">
              <h2 className="text-4xl font-bold">{approvedPersonnel}</h2><span className="text-sm opacity-80">Pers.</span>
              <h2 className="text-4xl font-bold">{approvedVehicles}</h2><span className="text-sm opacity-80">Vehic.</span>
            </div>
          </div>
          <div className="absolute bottom-0 right-6 opacity-20"><Users size={80} /></div>
        </div>

        <div className="p-6 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[2rem] text-white relative overflow-hidden card-shadow">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm opacity-80">Facturación Confirmada</p>
              <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider">Conv: {conversionRate}%</div>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold">{formatCurrency(totalRevenue)}</h2>
          </div>
          <div className="absolute bottom-0 right-6 opacity-20"><DollarSign size={80} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-6 md:p-8 rounded-[2rem] card-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <AlertTriangle size={20} className="text-rose-500" /> Alertas Operativas
              </h3>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{alerts.length} pendientes</span>
            </div>
            <div className="space-y-4">
              {topAlerts.length > 0 ? topAlerts.map(alert => (
                <Link key={alert.id} href={alert.link} className="block group">
                  <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", alert.status === 'vencido' || alert.status === 'bloqueado' ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600")}>
                      {alert.type === 'document' ? <FileText size={18} /> : alert.type === 'personnel' ? <Users size={18} /> : <Truck size={18} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{alert.title}</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">Estado: <span className={cn("font-medium", alert.status === 'vencido' || alert.status === 'bloqueado' ? "text-rose-600" : "text-amber-600")}>{alert.status}</span></p>
                    </div>
                    <div className="shrink-0 text-xs text-gray-400">Acción Requerida</div>
                  </div>
                </Link>
              )) : (
                <div className="text-center py-8">
                  <CheckCircle2 size={48} className="mx-auto text-emerald-200 mb-3" />
                  <p className="text-sm font-medium text-gray-900">Todo en orden</p>
                </div>
              )}
            </div>
          </section>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <ComplianceDashboard orgId={orgId} />
          <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6">Accesos Rápidos</h3>
            <div className="space-y-3">
              {[
                { href: "/documents", colorBg: "bg-indigo-50", colorText: "text-indigo-600", icon: FileText, title: "Documentos", sub: "Gestionar repositorio" },
                { href: "/personnel", colorBg: "bg-purple-50", colorText: "text-purple-600", icon: Users, title: "Acreditación", sub: "Personal y Flota" },
                { href: "/budgets", colorBg: "bg-emerald-50", colorText: "text-emerald-600", icon: TrendingUp, title: "Presupuestos", sub: "Métricas comerciales" }
              ].map(link => (
                <Link key={link.href} href={link.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                  <div className={`w-10 h-10 ${link.colorBg} rounded-lg flex items-center justify-center ${link.colorText}`}>
                    <link.icon size={18} />
                  </div>
                  <div><p className="text-sm font-semibold text-gray-900">{link.title}</p><p className="text-xs text-gray-500">{link.sub}</p></div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

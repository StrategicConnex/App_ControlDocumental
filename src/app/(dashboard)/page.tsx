import { createClient } from "@/utils/supabase/server";
import { getDocuments } from "@/lib/services/documents";
import { getPersonnel } from "@/lib/services/personnel";
import { getVehicles } from "@/lib/services/vehicles";
import { getBudgets } from "@/lib/services/budgets";
import { 
  Users, 
  DollarSign, 
  FileText,
  TrendingUp,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import ComplianceDashboard from "@/components/ui/ComplianceDashboard";
import { MetricCard } from "./_components/MetricCard";
import ActionInbox, { AlertItem } from "./_components/ActionInbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Command Console | Strategic Connex",
};

export default async function Dashboard() {
  const supabase = await createClient();
  
  // Get User Profile for org_id
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('org_id').eq('id', user.id).single() : { data: null };
  const orgId = profile?.org_id;

  // Fetch all data in parallel
  const [docsData, personnelData, vehiclesData, budgetsData, notificationsData] = await Promise.all([
    getDocuments(supabase).catch(() => []),
    getPersonnel(supabase).catch(() => []),
    getVehicles(supabase).catch(() => []),
    getBudgets(supabase).catch(() => []),
    supabase.from('notifications').select('*').eq('org_id', orgId).eq('is_read', false).limit(20).then(res => res.data || [])
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

  // Unified Alerts Feed -> Action Inbox format
  const alerts: AlertItem[] = [];
  
  // 1. Add real notifications from Supabase (Priority)
  notificationsData.forEach(n => {
    alerts.push({
      id: `notif-${n.id}`,
      type: 'notification',
      title: n.title,
      status: n.severity,
      link: '#',
      priority: n.severity === 'critical' ? 'high' : 'medium',
      notificationId: n.id,
      resourceId: n.metadata?.resourceId,
      actionType: n.metadata?.actionType
    });
  });

  // 2. Add derived alerts
  docsData.forEach(d => { 
    if (d.status === 'por_vencer' || d.status === 'vencido') 
      alerts.push({ id: `doc-${d.id}`, type: 'document', title: d.title, status: d.status, link: `/documents/${d.id}`, priority: d.status === 'vencido' ? 'high' : 'medium' }); 
  });
  personnelData.forEach(p => { 
    if (p.status === 'por_vencer' || p.status === 'vencido' || p.status === 'bloqueado') 
      alerts.push({ id: `per-${p.id}`, type: 'personnel', title: `${p.first_name} ${p.last_name}`, status: p.status, link: `/personnel/${p.id}`, priority: (p.status === 'vencido' || p.status === 'bloqueado') ? 'high' : 'medium' }); 
  });
  vehiclesData.forEach(v => { 
    if (v.status === 'por_vencer' || v.status === 'vencido' || v.status === 'bloqueado') 
      alerts.push({ id: `veh-${v.id}`, type: 'vehicle', title: `${v.license_plate} - ${v.brand}`, status: v.status, link: `/vehicles/${v.id}`, priority: (v.status === 'vencido' || v.status === 'bloqueado') ? 'high' : 'medium' }); 
  });

  alerts.sort((a, b) => (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0));
  const topAlerts = alerts.slice(0, 8);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Panel de Inteligencia</h1>
          <p className="text-sm text-muted-foreground mt-1">Visión general y estado de control documental.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Documentos Activos"
          value={approvedDocs}
          subtitle={`de ${docsData.length} en el repositorio`}
          trend={{ value: 4, label: "vs mes anterior", isPositive: true }}
          sparklineData={[10, 15, 12, 18, 24, 22, 28, 30, Math.max(10, approvedDocs)]}
          icon={<FileText size={20} />}
        />
        <MetricCard
          title="Acreditaciones (Pers/Veh)"
          value={`${approvedPersonnel} / ${approvedVehicles}`}
          subtitle={`${blockedPersonnel + blockedVehicles} elementos bloqueados`}
          trend={{ value: 2, label: "vs mes anterior", isPositive: false }}
          sparklineData={[50, 48, 55, 52, 60, 58, 62, 60, Math.max(10, approvedPersonnel)]}
          icon={<Users size={20} />}
        />
        <MetricCard
          title="Ingresos Confirmados"
          value={formatCurrency(totalRevenue)}
          subtitle={`Tasa de conversión: ${conversionRate}%`}
          trend={{ value: 12, label: "vs mes anterior", isPositive: true }}
          sparklineData={[100, 120, 110, 140, 130, 160, 150, 180, 200]}
          icon={<DollarSign size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Action Inbox Section */}
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity size={18} className="text-primary" />
                  Bandeja de Acciones (Inbox)
                </CardTitle>
                <p className="text-sm text-muted-foreground">Alertas priorizadas por IA que requieren tu atención inmediata.</p>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ActionInbox initialAlerts={topAlerts} />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <ComplianceDashboard orgId={orgId} />
          
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Accesos Rápidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { href: "/documents", colorBg: "bg-primary/10", colorText: "text-primary", icon: FileText, title: "Documentos", sub: "Gestionar repositorio" },
                  { href: "/personnel", colorBg: "bg-emerald-500/10", colorText: "text-emerald-600", icon: Users, title: "Acreditación", sub: "Personal y Flota" },
                  { href: "/budgets", colorBg: "bg-blue-500/10", colorText: "text-blue-600", icon: TrendingUp, title: "Presupuestos", sub: "Métricas comerciales" }
                ].map(link => (
                  <Link key={link.href} href={link.href} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border">
                    <div className={`w-10 h-10 ${link.colorBg} rounded-lg flex items-center justify-center ${link.colorText} group-hover:scale-105 transition-transform`}>
                      <link.icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{link.title}</p>
                      <p className="text-xs text-muted-foreground">{link.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

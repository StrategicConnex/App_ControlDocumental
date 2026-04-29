import { createClient } from "@/utils/supabase/server";
import { getDocuments } from "@/lib/services/documents";
import { getPersonnel } from "@/lib/services/personnel";
import { getVehicles } from "@/lib/services/vehicles";
import { Bell, AlertTriangle, CheckCircle2, FileText, Users, Truck } from "lucide-react";
import AlertFeed, { AlertItem } from "@/components/ui/AlertFeed";
import KPICard from "@/components/ui/KPICard";

export const metadata = {
  title: "Centro de Alertas | Strategic Connex",
};

export default async function AlertsPage() {
  const supabase = await createClient();

  const [docsData, personnelData, vehiclesData] = await Promise.all([
    getDocuments(supabase).catch(() => [] as never[]),
    getPersonnel(supabase).catch(() => [] as never[]),
    getVehicles(supabase).catch(() => [] as never[]),
  ]);

  const allAlerts: AlertItem[] = [];

  (docsData as { id: string; title: string; status: string }[]).forEach(d => {
    if (d.status === 'por_vencer' || d.status === 'vencido') {
      allAlerts.push({ id: `doc-${d.id}`, type: 'document', title: d.title, status: d.status, link: `/documents/${d.id}` });
    }
  });

  (personnelData as { id: string; first_name: string; last_name: string; status: string }[]).forEach(p => {
    if (p.status === 'por_vencer' || p.status === 'vencido' || p.status === 'bloqueado') {
      allAlerts.push({ id: `per-${p.id}`, type: 'personnel', title: `${p.first_name} ${p.last_name}`, status: p.status, link: `/personnel/${p.id}` });
    }
  });

  (vehiclesData as { id: string; license_plate: string; brand: string; status: string }[]).forEach(v => {
    if (v.status === 'por_vencer' || v.status === 'vencido' || v.status === 'bloqueado') {
      allAlerts.push({ id: `veh-${v.id}`, type: 'vehicle', title: `${v.license_plate} — ${v.brand}`, status: v.status, link: `/vehicles/${v.id}` });
    }
  });

  allAlerts.sort((a, b) => {
    const aH = a.status === 'vencido' || a.status === 'bloqueado' ? 1 : 0;
    const bH = b.status === 'vencido' || b.status === 'bloqueado' ? 1 : 0;
    return bH - aH;
  });

  const critical = allAlerts.filter(a => a.status === 'vencido' || a.status === 'bloqueado');
  const warning = allAlerts.filter(a => a.status === 'por_vencer');
  const docAlerts = allAlerts.filter(a => a.type === 'document');
  const personnelAlerts = allAlerts.filter(a => a.type === 'personnel');
  const vehicleAlerts = allAlerts.filter(a => a.type === 'vehicle');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Centro de Alertas</h1>
          {allAlerts.length > 0 && (
            <span className="px-2.5 py-0.5 bg-rose-100 text-rose-600 text-xs font-bold rounded-full">
              {allAlerts.length}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">Monitoreo de alertas operativas del sistema.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard title="Total Alertas" value={allAlerts.length} icon={Bell} color="indigo" />
        <KPICard title="Críticas" value={critical.length} icon={AlertTriangle} color="rose" />
        <KPICard title="Por Vencer" value={warning.length} icon={AlertTriangle} color="amber" />
        <KPICard title="Todo al Día" value={allAlerts.length === 0 ? 1 : 0} icon={CheckCircle2} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-500" />
                Alertas Activas
              </h3>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {allAlerts.length} pendientes
              </span>
            </div>
            <AlertFeed alerts={allAlerts} maxItems={20} emptyMessage="No hay alertas activas en el sistema" />
          </section>
        </div>

        <div className="space-y-6">
          {[
            { label: 'Documentos', icon: FileText, alerts: docAlerts, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Personal', icon: Users, alerts: personnelAlerts, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Flota', icon: Truck, alerts: vehicleAlerts, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(({ label, icon: Icon, alerts, color, bg }) => (
            <section key={label} className="bg-white p-5 rounded-[2rem] card-shadow border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{label}</h4>
                  <p className="text-xs text-gray-400">{alerts.length} alerta{alerts.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <AlertFeed alerts={alerts} maxItems={3} emptyMessage={`Sin alertas de ${label.toLowerCase()}`} />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

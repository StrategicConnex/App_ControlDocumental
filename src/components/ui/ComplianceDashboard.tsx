import { getComplianceMetrics } from '@/lib/services/search';
import { getRiskHistory } from '@/lib/services/riskScore';
import { createClient } from '@/utils/supabase/server';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import RiskTrendChart from './RiskTrendChart';

// ─── Sub-component: single compliance bar ─────────────────────────────────────
function ComplianceBar({
  label,
  rate,
  compliant,
  total,
  color,
}: {
  label: string;
  rate: number;
  compliant: number;
  total: number;
  color: string;
}) {
  const Icon = rate >= 80 ? TrendingUp : rate >= 50 ? Minus : TrendingDown;
  const textColor = rate >= 80 ? 'text-emerald-600' : rate >= 50 ? 'text-amber-600' : 'text-rose-600';
  const barColor  = rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 font-medium">{label}</span>
        <div className={cn('flex items-center gap-1 font-bold', textColor)}>
          <Icon size={12} />
          <span>{rate}%</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', barColor, color)}
          style={{ width: `${rate}%` }}
        />
      </div>
      <p className="text-[11px] text-gray-400">{compliant} de {total} en regla</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default async function ComplianceDashboard({ orgId }: { orgId?: string }) {
  const supabase = await createClient();
  const [metrics, history] = await Promise.all([
    getComplianceMetrics(supabase),
    orgId ? getRiskHistory(supabase, orgId).catch(() => []) : Promise.resolve([])
  ]);

  const overallColor =
    metrics.overall.rate >= 80 ? 'text-emerald-600' :
    metrics.overall.rate >= 50 ? 'text-amber-600'   : 'text-rose-600';

  const overallBg =
    metrics.overall.rate >= 80 ? 'from-emerald-600 to-emerald-800' :
    metrics.overall.rate >= 50 ? 'from-amber-500 to-amber-700'     : 'from-rose-600 to-rose-800';

  return (
    <section
      id="compliance-dashboard"
      className="bg-white p-6 rounded-[2rem] border border-gray-100 card-shadow space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Compliance Rate</h3>
          <p className="text-xs text-gray-500 mt-0.5">Estado regulatorio global — ISO 9001</p>
        </div>
        <div className={cn(
          'px-4 py-1.5 rounded-full text-white text-sm font-bold bg-gradient-to-r',
          overallBg
        )}>
          {metrics.overall.rate}% Global
        </div>
      </div>

      <div className="space-y-4">
        <ComplianceBar
          label="Personal Acreditado"
          rate={metrics.personnel.rate}
          compliant={metrics.personnel.compliant}
          total={metrics.personnel.total}
          color=""
        />
        <ComplianceBar
          label="Flota Habilitada"
          rate={metrics.vehicles.rate}
          compliant={metrics.vehicles.compliant}
          total={metrics.vehicles.total}
          color=""
        />
        <ComplianceBar
          label="Documentos Vigentes"
          rate={metrics.documents.rate}
          compliant={metrics.documents.compliant}
          total={metrics.documents.total}
          color=""
        />
      </div>

      {/* Historial de Riesgo Section */}
      <div className="pt-4 border-t border-gray-50 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <Activity size={14} className="text-purple-600" /> Historial de Riesgo
          </h4>
          {history.length > 1 && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Mejorando
            </span>
          )}
        </div>
        
        <RiskTrendChart data={history} />
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
        {metrics.personnel.atRisk + metrics.vehicles.atRisk + metrics.documents.atRisk > 0 && (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">
            ⚠ {metrics.personnel.atRisk + metrics.vehicles.atRisk + metrics.documents.atRisk} por vencer
          </span>
        )}
        {metrics.personnel.blocked + metrics.vehicles.blocked + metrics.documents.blocked > 0 && (
          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-semibold rounded-full">
            🚫 {metrics.personnel.blocked + metrics.vehicles.blocked + metrics.documents.blocked} bloqueados
          </span>
        )}
        {metrics.overall.rate === 100 && (
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
            ✅ Todo en regla
          </span>
        )}
      </div>
    </section>
  );
}


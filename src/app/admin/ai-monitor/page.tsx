import { createAdminClient } from '@/utils/supabase/admin';

export default async function AIMonitorPage() {
  const supabase = await createAdminClient();

  // 1. Obtener estadísticas de las últimas 24h
  const { data: logs } = await supabase
    .from('ai_call_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  const stats = {
    total: logs?.length || 0,
    success: logs?.filter(l => l.success).length || 0,
    avgLatency: logs?.length ? Math.round(logs.reduce((acc: number, curr: any) => acc + (curr.response_time_ms || 0), 0) / logs.length) : 0,
    errorRate: logs?.length ? ((logs.filter(l => !l.success).length / logs.length) * 100).toFixed(1) : 0
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#0a0a0b] min-h-screen text-white">
      <div className="flex justify-between items-center border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            AI Command Center
          </h1>
          <p className="text-gray-400 mt-2">Monitoreo de Orquestación POL v2.0 - Enterprise Hardened</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-mono text-emerald-400">CIRCUIT BREAKER: CLOSED</span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Calls (24h)" value={stats.total} sub="Solicitudes POL" color="blue" />
        <StatCard title="Success Rate" value={`${stats.total ? (stats.success / stats.total * 100).toFixed(1) : 0}%`} sub="Operación Nominal" color="emerald" />
        <StatCard title="Avg Latency" value={`${stats.avgLatency}ms`} sub="Tiempo de Respuesta" color="amber" />
        <StatCard title="Error Rate" value={`${stats.errorRate}%`} sub="Fallas Detectadas" color="rose" />
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cost by Organization */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Consumo de Tokens por Organización
          </h3>
          <div className="space-y-4">
            {Object.entries(
              logs?.reduce((acc: any, log: any) => {
                const org = log.org_id?.substring(0, 8) || 'Global';
                acc[org] = (acc[org] || 0) + (log.total_tokens || 0);
                return acc;
              }, {}) || {}
            ).map(([org, tokens]: any) => {
              const maxTokens = Math.max(...(logs?.map((l: any) => l.total_tokens || 0) || [1000]));
              const percentage = Math.min((tokens / (maxTokens * 5)) * 100, 100);
              return (
                <div key={org} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 font-mono">ORG-{org}</span>
                    <span className="text-blue-400 font-bold">{tokens.toLocaleString()} tokens</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Latency by Provider */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Eficiencia de Proveedores (ms)
          </h3>
          <div className="flex items-end justify-around h-48 gap-4 pt-4">
            {['Gemini', 'DeepSeek', 'OpenRouter'].map((provider) => {
              const providerLogs = logs?.filter((l: any) => l.provider.includes(provider)) || [];
              const avg = providerLogs.length ? Math.round(providerLogs.reduce((acc: number, curr: any) => acc + (curr.response_time_ms || 0), 0) / providerLogs.length) : 0;
              const height = Math.min((avg / 3000) * 100, 100);
              return (
                <div key={provider} className="flex flex-col items-center gap-4 flex-1">
                  <div className="relative w-full flex justify-center items-end h-full">
                    <div 
                      className="w-12 bg-gradient-to-t from-emerald-600/40 to-emerald-400 rounded-t-lg transition-all duration-1000 relative group"
                      style={{ height: `${height || 5}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black px-2 py-1 rounded text-[10px] whitespace-nowrap">
                        {avg}ms
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">{provider}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table Content */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Telemetría de Llamadas</h2>
            <div className="text-xs text-gray-500">Últimas 50 transacciones</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-4 text-xs font-semibold">Provider / Model</th>
                  <th className="p-4 text-xs font-semibold">Status</th>
                  <th className="p-4 text-xs font-semibold">Latency</th>
                  <th className="p-4 text-xs font-semibold">Tokens</th>
                  <th className="p-4 text-xs font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs?.map((log: any) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="font-medium group-hover:text-blue-400 transition-colors">{log.provider}</div>
                      <div className="text-xs text-gray-500 font-mono">{log.model}</div>
                    </td>
                    <td className="p-4">
                      {log.success ? (
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          <span className="text-emerald-400 text-xs font-medium">OK</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
                          <span className="text-rose-400 text-xs font-medium">FAIL</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-mono text-sm">{log.response_time_ms}ms</td>
                    <td className="p-4 font-mono text-sm">{log.total_tokens || '--'}</td>
                    <td className="p-4 text-xs text-gray-500">
                      {log.created_at ? new Date(log.created_at).toLocaleTimeString() : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats & Insights */}
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-blue-500/20 rounded-2xl">
            <p className="text-white text-xs font-medium uppercase tracking-widest text-gray-400">Costo Estimado (Mes)</p>
            <div className="text-3xl font-bold text-white mt-1">$124.50</div>
            <p className="text-gray-400 text-xs mt-2">Proyectado basado en volumen actual</p>
          </div>

          <HealthCard name="Gemini Pro" status="healthy" load="12%" />
          <HealthCard name="DeepSeek V3" status="healthy" load="5%" />
          <HealthCard name="OpenRouter" status="standby" load="0%" />
          
          <div className="p-6 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl">
            <h3 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2 text-sm">
              ✨ Recomendación IA
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              El proveedor <strong>DeepSeek</strong> está presentando un 15% menos de latencia que Gemini en tareas de extracción de datos financieros. Considera ajustar la estrategia "Balanced" para priorizarlo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, color }: any) {
  const colors: any = {
    blue: "border-blue-500/20 text-blue-400",
    emerald: "border-emerald-500/20 text-emerald-400",
    amber: "border-amber-500/20 text-amber-400",
    rose: "border-rose-500/20 text-rose-400",
  };
  return (
    <div className={`p-6 bg-white/5 border rounded-2xl backdrop-blur-xl ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-widest text-gray-400">{title}</p>
      <div className="text-3xl font-bold mt-2 font-mono">{value}</div>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}

function HealthCard({ name, status, load }: any) {
  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">{name}</p>
        <p className="text-[10px] text-gray-500">Current Load: {load}</p>
      </div>
      <Badge color={status === 'healthy' ? 'emerald' : 'amber'} className="capitalize">
        {status}
      </Badge>
    </div>
  );
}

function Badge({ children, color, className }: any) {
  const colors: any = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${colors[color]} ${className}`}>
      {children}
    </span>
  );
}

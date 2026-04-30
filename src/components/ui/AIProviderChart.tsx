'use client';

interface ProviderStat {
  provider: string;
  calls: number;
  avgLatency: number;
  successRate: number;
}

export default function AIProviderChart({ data }: { data: ProviderStat[] }) {
  const maxCalls = Math.max(...data.map(d => d.calls), 1);
  const chartHeight = 120;
  
  return (
    <div className="space-y-6">
      {data.map((p, i) => {
        const percentage = (p.calls / maxCalls) * 100;
        
        return (
          <div key={p.provider} className="space-y-2">
            <div className="flex justify-between items-end">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">{p.provider}</h4>
                <p className="text-[10px] text-gray-500">{p.calls} llamadas realizadas</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-indigo-400 font-bold">{p.avgLatency.toFixed(0)}ms avg</span>
              </div>
            </div>
            
            <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            <div className="flex justify-between text-[9px] uppercase font-bold tracking-tighter">
              <span className={p.successRate > 95 ? 'text-emerald-500' : 'text-amber-500'}>
                Fiabilidad: {p.successRate.toFixed(1)}%
              </span>
              <span className="text-gray-600">Performance Index: {((10000 / p.avgLatency) * (p.successRate / 100)).toFixed(1)}</span>
            </div>
          </div>
        );
      })}
      
      {data.length === 0 && (
        <div className="h-40 flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-xl">
          <p className="text-xs">No hay datos de proveedores suficientes</p>
        </div>
      )}
    </div>
  );
}

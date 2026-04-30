'use client';

import React from 'react';

interface RankingItem {
  id: string;
  name: string;
  model: string;
  score: number;
  reason?: string;
  breakdown?: { latency: number; cost: number; error: number; penalty: number };
  status: 'healthy' | 'degraded' | 'down';
}

interface AILiveRankingProps {
  ranking: RankingItem[];
}

export const AILiveRanking: React.FC<AILiveRankingProps> = ({ ranking }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          Live Engine Status (POL Ranking)
        </h3>
        <span className="text-xs text-slate-400 px-2 py-1 bg-slate-800 rounded border border-slate-700">
          Next Selection Priority
        </span>
      </div>

      <div className="space-y-4">
        {ranking.map((item, index) => (
          <div 
            key={item.id}
            className={`relative flex items-center justify-between p-4 rounded-lg border transition-all hover:translate-x-1 duration-300 ${
              index === 0 
                ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20' 
                : 'bg-slate-800/30 border-slate-700/50'
            }`}
          >
            {index === 0 && (
              <div className="absolute -top-2 -left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg animate-pulse z-10">
                ACTIVE
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index === 0 ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-700 text-slate-300'
              }`}>
                #{index + 1}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{item.name}</span>
                  {item.reason && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
                      index === 0 
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                        : 'bg-slate-700/50 border-slate-600/50 text-slate-400'
                    }`}>
                      {item.reason}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400">{item.model}</div>
                
                {/* Breakdown Indicators */}
                {item.breakdown && (
                  <div className="flex gap-2 mt-2">
                    <div className="h-1 w-12 bg-slate-700 rounded-full overflow-hidden" title={`Latency: ${item.breakdown.latency.toFixed(2)}`}>
                      <div className="h-full bg-blue-500" style={{ width: `${Math.min(item.breakdown.latency * 50, 100)}%` }} />
                    </div>
                    <div className="h-1 w-12 bg-slate-700 rounded-full overflow-hidden" title={`Cost: ${item.breakdown.cost.toFixed(2)}`}>
                      <div className="h-full bg-amber-500" style={{ width: `${Math.min(item.breakdown.cost * 50, 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-mono text-emerald-400 font-bold">
                {item.score.toFixed(4)}
              </div>
              <div className={`text-[10px] uppercase font-black tracking-wider ${
                item.status === 'healthy' ? 'text-emerald-500' : 
                item.status === 'degraded' ? 'text-amber-500' : 'text-red-500'
              }`}>
                {item.status}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-slate-950/40 rounded-lg border border-slate-800/50">
        <p className="text-[10px] text-slate-500 leading-relaxed italic">
          * El score es calculado dinámicamente por la <strong>Provider Orchestration Layer (POL)</strong> 
          usando telemetría en tiempo real. Se penaliza exponencialmente la inestabilidad y se prioriza 
          la eficiencia de costo de Google Gemini mientras mantenga salud operativa.
        </p>
      </div>
    </div>
  );
};

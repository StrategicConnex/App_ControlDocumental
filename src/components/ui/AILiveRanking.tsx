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
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          Live Engine Status (POL)
        </h3>
        <span className="text-[10px] font-bold text-muted-foreground px-2 py-1 bg-muted rounded border border-border uppercase tracking-wider">
          Prioridad de Selección
        </span>
      </div>

      <div className="space-y-3">
        {ranking.map((item, index) => (
          <div 
            key={item.id}
            className={`relative flex items-center justify-between p-4 rounded-xl border transition-all hover:bg-muted/30 duration-300 ${
              index === 0 
                ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10' 
                : 'bg-muted/20 border-border/50'
            }`}
          >
            {index === 0 && (
              <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded shadow-lg z-10 uppercase tracking-tighter">
                ACTIVE
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                index === 0 ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground'
              }`}>
                {index + 1}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{item.name}</span>
                  {item.reason && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-tighter ${
                      index === 0 
                        ? 'bg-primary/10 border-primary/20 text-primary' 
                        : 'bg-muted border-border text-muted-foreground'
                    }`}>
                      {item.reason}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground font-medium">{item.model}</div>
                
                {/* Breakdown Indicators */}
                {item.breakdown && (
                  <div className="flex gap-2 mt-2">
                    <div className="h-1 w-12 bg-muted rounded-full overflow-hidden" title={`Latencia: ${item.breakdown.latency.toFixed(2)}`}>
                      <div className="h-full bg-blue-500" style={{ width: `${Math.min(item.breakdown.latency * 50, 100)}%` }} />
                    </div>
                    <div className="h-1 w-12 bg-muted rounded-full overflow-hidden" title={`Costo: ${item.breakdown.cost.toFixed(2)}`}>
                      <div className="h-full bg-amber-500" style={{ width: `${Math.min(item.breakdown.cost * 50, 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-mono text-primary font-black">
                {item.score.toFixed(4)}
              </div>
              <div className={`text-[10px] uppercase font-black tracking-wider ${
                item.status === 'healthy' ? 'text-emerald-600' : 
                item.status === 'degraded' ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {item.status}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-border/50">
        <p className="text-[10px] text-muted-foreground leading-relaxed italic font-medium">
          * El score es calculado dinámicamente por la <strong>Provider Orchestration Layer (POL)</strong> 
          usando telemetría en tiempo real. Se penaliza la inestabilidad y se prioriza 
          la eficiencia operativa de Google Gemini.
        </p>
      </div>
    </div>
  );
};

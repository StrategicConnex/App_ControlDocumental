'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AIKPICard from "@/components/ui/AIKPICard";
import AICallLogTable from "@/components/ui/AICallLogTable";
import AIProviderChart from "@/components/ui/AIProviderChart";
import RiskTrendChart from "@/components/ui/RiskTrendChart";
import { AILiveRanking } from "@/components/ui/AILiveRanking";
import { 
  Activity, 
  Cpu, 
  Zap, 
  DollarSign, 
  RefreshCcw,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

export default function AIDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/metrics');
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-12 w-64 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-96 bg-white/5 rounded-2xl md:col-span-1" />
          <div className="h-96 bg-white/5 rounded-2xl md:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-bold uppercase tracking-widest text-[9px]">
              Infraestructura v4.0
            </Badge>
            <span className="text-gray-600">/</span>
            <span className="text-xs text-gray-400 font-mono">Provider Orchestration Layer</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
            AI Operations Center
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitoreo en tiempo real de la capa de inteligencia distribuida.
          </p>
        </div>
        
        <button 
          onClick={fetchMetrics}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-95"
        >
          <RefreshCcw className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-tighter">Actualizar</span>
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AIKPICard 
          title="Consumo de Tokens"
          value={data.summary.totalTokens.toLocaleString()}
          icon={<Cpu className="w-5 h-5 text-indigo-400" />}
          trend={{ value: 12, isPositive: true }}
          description="Total tokens procesados (7d)"
        />
        <AIKPICard 
          title="Tasa de Éxito"
          value={`${data.summary.successRate.toFixed(1)}%`}
          icon={<ShieldCheck className={`w-5 h-5 ${data.summary.successRate > 95 ? 'text-emerald-400' : 'text-amber-400'}`} />}
          description="Disponibilidad global del POL"
        />
        <AIKPICard 
          title="Latencia Promedio"
          value={`${data.summary.avgLatency.toFixed(0)}ms`}
          icon={<Zap className="w-5 h-5 text-amber-400" />}
          description="Tiempo de respuesta end-to-end"
        />
        <AIKPICard 
          title="Costo Estimado"
          value={`$${data.summary.estimatedCost.toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          description="Gasto operativo proyectado"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Live Status & Health */}
        <div className="md:col-span-1 space-y-6">
          <AILiveRanking ranking={data.ranking} />
          
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden group">
            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Health by Provider
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AIProviderChart data={data.byProvider} />
            </CardContent>
          </Card>
        </div>

        {/* Middle/Right Column: Usage Trend & Recent Activity */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-400">
                Token Usage Trend
              </CardTitle>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px]">Normal Flow</Badge>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-48 w-full">
                <RiskTrendChart data={data.timeSeries.map((d: any) => ({ recorded_at: d.date, score: (d.tokens / 20000) * 100 }))} />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Recent Telemetry</h3>
              <button className="text-[10px] font-bold text-indigo-400 flex items-center gap-1 hover:underline">
                View all logs <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <AICallLogTable logs={data.recentLogs} />
          </div>
        </div>
      </div>
      
      {/* Infrastructure Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Primary Node</p>
            <p className="text-xs font-bold text-white">Google Cloud - us-east4</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Failover Engine</p>
            <p className="text-xs font-bold text-white">OpenRouter Global Edge</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Compliance DB</p>
            <p className="text-xs font-bold text-white">Supabase Transactional Audit</p>
          </div>
        </div>
      </div>
    </div>
  );
}

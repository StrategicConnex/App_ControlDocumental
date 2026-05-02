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
  const [isReindexing, setIsReindexing] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/metrics');
      if (!res.ok) throw new Error('API returned ' + res.status);
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

  const handleMassReindex = async () => {
    if (!confirm('¿Seguro que deseas re-indexar todos los documentos? Este proceso puede consumir muchos tokens.')) return;
    
    setIsReindexing(true);
    try {
      const orgId = data?.recentLogs?.[0]?.org_id || 'org-techops-001';
      const res = await fetch('/api/ai/vectorize/mass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, force: true })
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error al re-indexar');
      
      alert(`Proceso completado: ${result.stats?.success || 0} éxitos, ${result.stats?.failed || 0} fallos.`);
      fetchMetrics();
    } catch (e: any) {
      console.error(e);
      alert('Error: ' + e.message);
    } finally {
      setIsReindexing(false);
    }
  };

  return (
    <div className="p-8 space-y-8 min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="font-bold uppercase tracking-widest text-[9px] border-primary/30 text-primary">
              Infraestructura v4.0
            </Badge>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-xs text-muted-foreground font-mono">Provider Orchestration Layer</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">
            AI Operations Center
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitoreo en tiempo real de la capa de inteligencia distribuida.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchMetrics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 border border-border rounded-xl transition-all active:scale-95 shadow-sm disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
            <span className="text-xs font-bold uppercase tracking-tighter">{loading ? 'Actualizando...' : 'Actualizar'}</span>
          </button>

          <button 
            onClick={handleMassReindex}
            disabled={isReindexing}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl transition-all active:scale-95 shadow-sm text-primary disabled:opacity-50"
          >
            <Activity className={`w-4 h-4 ${isReindexing ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-bold uppercase tracking-tighter">
              {isReindexing ? 'Procesando...' : 'Re-indexar Masivamente'}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AIKPICard 
          title="Consumo de Tokens"
          value={data.summary?.totalTokens?.toLocaleString() || '0'}
          icon={<Cpu className="w-5 h-5 text-primary" />}
          trend={{ value: 12, isPositive: true }}
          description="Total tokens procesados (7d)"
        />
        <AIKPICard 
          title="Tasa de Éxito"
          value={`${data.summary?.successRate?.toFixed(1) || '0'}%`}
          icon={<ShieldCheck className={`w-5 h-5 ${data.summary?.successRate > 95 ? 'text-emerald-500' : 'text-amber-500'}`} />}
          description="Disponibilidad global del POL"
        />
        <AIKPICard 
          title="Latencia Promedio"
          value={`${data.summary?.avgLatency?.toFixed(0) || '0'}ms`}
          icon={<Zap className="w-5 h-5 text-amber-500" />}
          description="Tiempo de respuesta end-to-end"
        />
        <AIKPICard 
          title="Costo Estimado"
          value={`$${data.summary?.estimatedCost?.toFixed(2) || '0.00'}`}
          icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
          description="Gasto operativo proyectado"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Status & Health */}
        <div className="lg:col-span-1 space-y-6">
          <AILiveRanking ranking={data.ranking || []} />
          
          <Card className="border-border bg-card rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="border-b border-border bg-muted/50">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Health by Provider
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AIProviderChart data={data.byProvider || []} />
            </CardContent>
          </Card>
        </div>

        {/* Middle/Right Column: Usage Trend & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/50">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                Token Usage Trend
              </CardTitle>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px]">Normal Flow</Badge>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-48 w-full">
                <RiskTrendChart data={(data.timeSeries || []).map((d: any) => ({ recorded_at: d.date, score: (d.tokens / 20000) * 100 }))} />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Recent Telemetry</h3>
              <button className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                Ver todos los logs <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <AICallLogTable logs={data.recentLogs || []} />
          </div>
        </div>
      </div>
      
      {/* Infrastructure Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border shadow-sm hover:border-primary/20 transition-colors">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Primary Node</p>
            <p className="text-xs font-bold text-foreground">Google Cloud - us-east4</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border shadow-sm hover:border-primary/20 transition-colors">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Failover Engine</p>
            <p className="text-xs font-bold text-foreground">OpenRouter Global Edge</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border shadow-sm hover:border-primary/20 transition-colors">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Compliance DB</p>
            <p className="text-xs font-bold text-foreground">Supabase Transactional Audit</p>
          </div>
        </div>
      </div>
    </div>
  );
}

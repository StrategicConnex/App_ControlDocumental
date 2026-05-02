'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  TrendingDown, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  Info
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getVendorRiskRanking, getVendorRiskHistory, getAISuggestions } from '@/lib/services/vendors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import RiskEvolutionChart from './RiskEvolutionChart';
import { Sparkles, BrainCircuit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";


export default function RiskRankingPage() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [selectedVendorHistory, setSelectedVendorHistory] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        const [rankingData, historyData] = await Promise.all([
          getVendorRiskRanking(supabase),
          getVendorRiskHistory(supabase)
        ]);
        setRanking(rankingData);
        setHistory(historyData);
      } catch (error) {
        console.error(error);
        toast.error('Error al calcular el ranking de riesgo');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleViewHistory = async (vendor: any) => {
    setSelectedVendor(vendor);
    setIsHistoryLoading(true);
    setAiSuggestions([]);
    try {
      const [historyData, suggestionsData] = await Promise.all([
        getVendorRiskHistory(supabase, vendor.id),
        getAISuggestions(supabase, vendor.id)
      ]);
      setSelectedVendorHistory(historyData);
      setAiSuggestions(suggestionsData);
    } catch (error) {
      toast.error('Error al cargar historial y sugerencias');
    } finally {
      setIsHistoryLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <ShieldAlert className="animate-pulse text-rose-500" size={48} />
        <p className="text-gray-500 font-medium">Calculando algoritmos de riesgo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldAlert className="text-rose-600" /> Ranking de Riesgo de Proveedores
          </h1>
          <p className="text-gray-500 mt-1">Análisis cuantitativo de cumplimiento y salud documental.</p>
        </div>
        <Button variant="outline" className="rounded-xl border-gray-200 text-gray-600">
          <Download size={18} className="mr-2" /> Exportar Reporte
        </Button>
      </header>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2rem] border-rose-100 bg-rose-50/30 overflow-hidden card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-rose-600 uppercase tracking-wider">Críticos</p>
                <h3 className="text-3xl font-black text-rose-700 mt-1">
                  {ranking.filter(r => r.riskLevel === 'CRÍTICO').length}
                </h3>
              </div>
              <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600">
                <AlertCircle size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-[2rem] border-amber-100 bg-amber-50/30 overflow-hidden card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-amber-600 uppercase tracking-wider">Riesgo Medio</p>
                <h3 className="text-3xl font-black text-amber-700 mt-1">
                  {ranking.filter(r => r.riskLevel === 'MEDIO').length}
                </h3>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                <TrendingDown size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-emerald-100 bg-emerald-50/30 overflow-hidden card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Confiables</p>
                <h3 className="text-3xl font-black text-emerald-700 mt-1">
                  {ranking.filter(r => r.riskLevel === 'BAJO').length}
                </h3>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <RiskEvolutionChart history={history} />

      {/* Ranking List */}
      <div className="space-y-4">
        {ranking.map((vendor, index) => (
          <Card 
            key={vendor.id} 
            className={cn(
              "rounded-[2rem] border-gray-100 card-shadow transition-all hover:scale-[1.01] overflow-hidden",
              vendor.riskLevel === 'CRÍTICO' && "border-l-8 border-l-rose-500"
            )}
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-gray-400 shrink-0">
                  #{index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-lg font-bold text-gray-900 truncate">{vendor.name}</h4>
                    <Badge className={cn(
                      "rounded-lg px-2 py-0 text-[10px] font-black uppercase tracking-widest",
                      vendor.riskLevel === 'CRÍTICO' ? "bg-rose-100 text-rose-700" :
                      vendor.riskLevel === 'MEDIO' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    )}>
                      RIESGO {vendor.riskLevel}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-emerald-500" /> {vendor.stats.approved} Al día
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-amber-500" /> {vendor.stats.pending} Pendientes
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertCircle size={14} className="text-rose-500" /> {vendor.stats.expired + vendor.stats.missing} Críticos
                    </span>
                  </div>
                </div>

                <div className="w-full md:w-48 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-gray-400">Score de Salud</span>
                    <span className={cn(
                      vendor.score < 40 ? "text-rose-600" : vendor.score < 70 ? "text-amber-600" : "text-emerald-600"
                    )}>
                      {vendor.score}/100
                    </span>
                  </div>
                  <Progress value={vendor.score} className="h-2 rounded-full" color={vendor.color} />
                </div>

                <div className="shrink-0">
                  <Button 
                    variant="ghost" 
                    className="rounded-xl group"
                    onClick={() => handleViewHistory(vendor)}
                  >
                    Ver Historia <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* History Modal */}
      <Dialog open={!!selectedVendor} onOpenChange={(open) => !open && setSelectedVendor(null)}>
        <DialogContent className="max-w-4xl rounded-[2.5rem] p-0 border-none overflow-hidden bg-white">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <TrendingUp className="text-indigo-600" /> Historial de {selectedVendor?.name}
            </DialogTitle>
            <DialogDescription>
              Evolución del cumplimiento documental en los últimos días.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-8">
            {isHistoryLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Clock className="animate-spin text-indigo-500" />
              </div>
            ) : (
              <>
                <RiskEvolutionChart history={selectedVendorHistory} />
                
                {/* AI Suggestions Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold">
                    <Sparkles size={18} className="text-indigo-600" /> 
                    Sugerencias de Cumplimiento IA
                  </div>
                  
                  {aiSuggestions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiSuggestions.map((s, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                            <BrainCircuit size={16} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm text-indigo-900">{s.title}</span>
                              <Badge className={cn(
                                "text-[9px] px-1.5 py-0",
                                s.priority === 'CRÍTICA' ? "bg-rose-500" : 
                                s.priority === 'ALTA' ? "bg-amber-500" : "bg-indigo-500"
                              )}>
                                {s.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-indigo-700 leading-relaxed">{s.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center text-center">
                      <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                      <p className="text-sm font-medium text-gray-900">Perfil Optimizado</p>
                      <p className="text-xs text-gray-400 mt-1">La IA no detecta requisitos adicionales críticos para esta categoría.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

        </DialogContent>
      </Dialog>

      {/* Info Box */}
      <Card className="rounded-2xl bg-indigo-50 border-indigo-100">
        <CardContent className="p-6 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
            <Info size={20} />
          </div>
          <div>
            <h5 className="font-bold text-indigo-900">¿Cómo se calcula el Score?</h5>
            <p className="text-sm text-indigo-700 mt-1 leading-relaxed">
              El puntaje comienza en 100 y se reduce dinámicamente: 
              <strong> -20 pts </strong> por documento faltante, 
              <strong> -15 pts </strong> por vencido, 
              <strong> -10 pts </strong> por rechazado y 
              <strong> -5 pts </strong> por revisiones pendientes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


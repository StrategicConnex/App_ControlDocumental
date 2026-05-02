'use client';

import React, { useState, useEffect } from 'react';
import { 
  FilePieChart, 
  Download, 
  Calendar, 
  ShieldCheck, 
  Filter, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getComplianceMetrics } from '@/lib/services/search';
import { generateComplianceReportPDF } from '@/lib/utils/pdf-generator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await getComplianceMetrics(supabase);
        setMetrics(data);
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const handleDownloadFullReport = async () => {
    if (!metrics) return;
    setIsGenerating(true);
    try {
      const doc = await generateComplianceReportPDF('Strategic Connex', {
        total_documents: metrics.documents.total,
        expired_count: metrics.documents.blocked,
        expiring_soon: metrics.documents.atRisk,
        compliance_percentage: metrics.overall.rate,
        criticalFindings: metrics.documents.criticalFindings
      });
      doc.save(`Reporte_Cumplimiento_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Reporte generado correctamente');
    } catch (error) {
      toast.error('Error al generar el reporte');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Centro de Reportes</h1>
          <p className="text-gray-500 mt-1">Generación de informes de cumplimiento y auditoría.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="rounded-xl border-gray-200 hover:bg-gray-50"
          >
            <Calendar size={16} className="mr-2" /> Programar Reporte
          </Button>
          <Button 
            onClick={handleDownloadFullReport}
            disabled={isGenerating}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
          >
            {isGenerating ? (
              <Clock className="mr-2 animate-spin" size={16} />
            ) : (
              <Download size={16} className="mr-2" />
            )}
            Descargar Reporte PDF
          </Button>
        </div>
      </header>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Cumplimiento General" 
          value={`${metrics?.overall?.rate || 0}%`}
          trend="+2.4%"
          icon={<TrendingUp size={20} className="text-emerald-600" />}
          color="emerald"
        />
        <MetricCard 
          title="Documentos Vigentes" 
          value={metrics?.documents?.compliant || 0}
          subtitle={`de ${metrics?.documents?.total || 0} totales`}
          icon={<CheckCircle2 size={20} className="text-indigo-600" />}
          color="indigo"
        />
        <MetricCard 
          title="Riesgo de Vencimiento" 
          value={metrics?.documents?.atRisk || 0}
          subtitle="Próximos 30 días"
          icon={<Clock size={20} className="text-amber-600" />}
          color="amber"
        />
        <MetricCard 
          title="Críticos / Vencidos" 
          value={metrics?.documents?.blocked || 0}
          subtitle="Acción requerida"
          icon={<AlertTriangle size={20} className="text-rose-600" />}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compliance details */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-[2.5rem] card-shadow border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FilePieChart size={20} className="text-indigo-600" /> Desglose por Módulo
            </h3>
            
            <div className="space-y-8">
              <ModuleProgress 
                name="Personal y RRHH" 
                rate={metrics?.personnel?.rate || 0}
                total={metrics?.personnel?.total || 0}
                color="indigo"
              />
              <ModuleProgress 
                name="Flota y Vehículos" 
                rate={metrics?.vehicles?.rate || 0}
                total={metrics?.vehicles?.total || 0}
                color="emerald"
              />
              <ModuleProgress 
                name="Documentación Técnica" 
                rate={metrics?.documents?.rate || 0}
                total={metrics?.documents?.total || 0}
                color="blue"
              />
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] card-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-600" /> Auditorías Recientes
              </h3>
              <Button variant="ghost" className="text-indigo-600 font-bold text-sm">
                Ver todas <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
            
            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Auditor</th>
                    <th className="px-6 py-4">Resultado</th>
                    <th className="px-6 py-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">May {10-i}, 2026</td>
                      <td className="px-6 py-4">Sistema Automatizado</td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">98.5%</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase">
                          Exitosa
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar / Options */}
        <div className="space-y-6">
          <section className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-indigo-900/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-xl mb-2">Reporte Ejecutivo</h3>
              <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
                Obtén un resumen detallado de la integridad documental de tu organización listo para presentar a operadoras.
              </p>
              <Button 
                onClick={handleDownloadFullReport}
                className="w-full rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold"
              >
                Generar Ahora
              </Button>
            </div>
            {/* Abstract background shape */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] card-shadow border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Filter size={18} className="text-gray-400" /> Filtros Rápidos
            </h3>
            <div className="space-y-2">
              {['Mensual', 'Trimestral', 'Anual', 'Por Operadora'].map((f) => (
                <button 
                  key={f}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
                >
                  {f}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, subtitle, icon, color }: any) {
  const colorMap: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 rounded-2xl border", colorMap[color])}>
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
        {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
      </div>
    </div>
  );
}

function ModuleProgress({ name, rate, total, color }: any) {
  const colorMap: any = {
    indigo: 'bg-indigo-600 shadow-indigo-600/20',
    emerald: 'bg-emerald-600 shadow-emerald-600/20',
    blue: 'bg-blue-600 shadow-blue-600/20',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-gray-700">{name}</span>
        <div className="flex items-center gap-3">
          <span className="text-gray-400">{total} items</span>
          <span className="font-bold text-gray-900">{rate}%</span>
        </div>
      </div>
      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000 shadow-lg", colorMap[color])} 
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  );
}

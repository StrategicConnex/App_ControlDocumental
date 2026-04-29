'use client';

import { useState } from 'react';
import { Play, CheckCircle2, AlertCircle, Loader2, Database, Zap, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AuditTestPage() {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);

  const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  const runTest = async () => {
    setStatus('running');
    setLogs([]);
    setResults(null);
    addLog('Iniciando Prueba Integral de Motor de Auditoría v4...');

    try {
      // 1. Crear Documento de Prueba (Simulado vía API)
      addLog('Paso 1: Creando documento de prueba (Contrato de Mantenimiento)...');
      
      const res = await fetch('/api/admin/test-setup', { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Error en el setup del servidor');
      }

      const { versionId, orgId, docTitle } = data;
      addLog(`Documento creado: "${docTitle}" (ID: ${versionId})`);

      // 2. Disparar Pipeline
      addLog('Paso 2: Disparando Pipeline de IA (Vectorización + Auditoría)...');
      const pipelineRes = await fetch('/api/ai/pipeline/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId, orgId })
      });
      
      const pipelineData = await pipelineRes.json();
      
      if (!pipelineRes.ok) {
        throw new Error(pipelineData.error || 'Error en el pipeline de IA');
      }

      addLog('Pipeline finalizado.');
      
      // 3. Verificar Resultados
      addLog('Paso 3: Verificando persistencia de datos...');
      const pipeline = pipelineData.pipeline || {};
      setResults(pipeline);
      
      if (pipeline.vectorized) addLog('✅ Vectorización completada (Chunks creados)');
      if (pipeline.audited) addLog('✅ Auditoría IA completada');
      if (pipeline.auditResult?.score < 60) addLog('⚠️ Alerta de Riesgo generada (Score < 60)');

      setStatus('success');
      addLog('Prueba finalizada con éxito.');

    } catch (error: any) {
      console.error(error);
      setStatus('error');
      addLog(`❌ Error en la prueba: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Laboratorio de Pruebas: Audit Engine</h1>
        <p className="text-sm text-gray-500">Valida la integración de Vectorización, Auditoría y Notificaciones.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <button
            onClick={runTest}
            disabled={status === 'running'}
            className={cn(
              "w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-3",
              status === 'running' ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
            )}
          >
            {status === 'running' ? <Loader2 className="animate-spin" /> : <Play size={20} />}
            {status === 'running' ? 'Procesando...' : 'Ejecutar Prueba'}
          </button>

          <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Cobertura de Test</h3>
            <div className="space-y-3">
              {[
                { icon: Database, label: 'Persistencia DB', status: results?.vectorized },
                { icon: Zap, label: 'IA Auditoría', status: results?.audited },
                { icon: Bell, label: 'Notificaciones', status: results?.auditResult?.score < 60 }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2 text-gray-500">
                    <item.icon size={14} /> {item.label}
                  </div>
                  {item.status ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border-2 border-gray-100" />
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="md:col-span-2 bg-gray-900 rounded-[2rem] p-6 shadow-2xl font-mono text-[11px] min-h-[400px] border border-gray-800">
          <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-4">
            <span className="text-gray-400 uppercase tracking-tighter">System Output (v4.4.1)</span>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>
          <div className="space-y-1.5 overflow-y-auto max-h-[350px]">
            {logs.map((log, i) => (
              <p key={i} className={cn(
                "leading-relaxed",
                log.includes('✅') ? "text-emerald-400" : 
                log.includes('⚠️') ? "text-amber-400" : 
                log.includes('❌') ? "text-rose-400" : "text-gray-300"
              )}>
                <span className="text-gray-600 mr-2">[{i}]</span> {log}
              </p>
            ))}
            {status === 'idle' && (
              <p className="text-gray-600 italic">Listo para iniciar secuencia de prueba...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

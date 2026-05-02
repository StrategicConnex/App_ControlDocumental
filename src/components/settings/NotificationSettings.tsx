'use client';

import React, { useState } from 'react';
import { Bell, Calendar, Send, Clock, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const DAYS = [
  { id: 1, label: 'L', full: 'Lunes' },
  { id: 2, label: 'M', full: 'Martes' },
  { id: 3, label: 'M', full: 'Miércoles' },
  { id: 4, label: 'J', full: 'Jueves' },
  { id: 5, label: 'V', full: 'Viernes' },
  { id: 6, label: 'S', full: 'Sábado' },
  { id: 0, label: 'D', full: 'Domingo' },
];

export function NotificationSettings({ orgId }: { orgId: string }) {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alerts, setAlerts] = useState({
    prox: true,
    crit: true,
    venc: true
  });

  React.useEffect(() => {
    if (orgId) {
      fetch(`/api/settings/notifications?orgId=${orgId}`)
        .then(res => res.json())
        .then(data => {
          setSelectedDays(data.schedule_days || []);
          setAlerts({
            prox: data.alert_vencimientos_proximos,
            crit: data.alert_vencimientos_criticos,
            venc: data.alert_documentos_vencidos
          });
        })
        .catch(err => console.error('Error fetching settings:', err));
    }
  }, [orgId]);

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleForceSend = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/cron/check-expirations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true, orgId })
      });

      if (response.ok) {
        toast.success('Auditoría forzada iniciada', {
          description: 'Se están procesando los vencimientos y enviando notificaciones.',
        });
      } else {
        throw new Error('Error al forzar el envío');
      }
    } catch (error) {
      toast.error('Error', {
        description: 'No se pudo completar la acción. Intente nuevamente.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          settings: {
            schedule_days: selectedDays,
            alert_vencimientos_proximos: alerts.prox,
            alert_vencimientos_criticos: alerts.crit,
            alert_documentos_vencidos: alerts.venc
          }
        })
      });

      if (response.ok) {
        toast.success('Configuración guardada', {
          description: 'La programación de notificaciones se ha actualizado correctamente.',
        });
      } else {
        throw new Error('Error saving settings');
      }
    } catch (error) {
      toast.error('Error al guardar', {
        description: 'No se pudo actualizar la configuración.',
      });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <section className="bg-white p-8 rounded-[2.5rem] card-shadow border border-gray-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Bell size={120} />
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shadow-inner">
          <Bell size={24} className="text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-xl text-gray-900 tracking-tight">Programación de Cumplimiento</h3>
          <p className="text-sm text-gray-500">Controla cuándo y cómo se envían las alertas de vencimiento.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Días de Envío Automático</label>
            <div className="flex flex-wrap gap-3">
              {DAYS.map((day) => (
                <button
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  title={day.full}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all border-2",
                    selectedDays.includes(day.id)
                      ? "bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-600/20 scale-110"
                      : "bg-gray-50 border-gray-100 text-gray-400 hover:border-amber-200"
                  )}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Configuración de Alertas</label>
            <div className="space-y-3">
              {[
                { id: 'prox', label: 'Vencimientos próximos (<30 días)' },
                { id: 'crit', label: 'Vencimientos críticos (<7 días)' },
                { id: 'venc', label: 'Documentos ya vencidos' },
              ].map(item => (
                <label key={item.id} className="flex items-center gap-3 p-4 bg-gray-50/50 border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={alerts[item.id as keyof typeof alerts]} 
                      onChange={(e) => setAlerts(prev => ({ ...prev, [item.id]: e.target.checked }))}
                      className="peer sr-only" 
                    />
                    <div className="w-5 h-5 border-2 border-gray-200 rounded-md peer-checked:bg-amber-600 peer-checked:border-amber-600 flex items-center justify-center transition-all">
                      <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-[2rem] space-y-4">
            <div className="flex items-center gap-3 text-indigo-700">
              <Send size={18} />
              <h4 className="font-bold text-sm uppercase tracking-wider">Acción Inmediata</h4>
            </div>
            <p className="text-xs text-indigo-600/80 leading-relaxed">
              ¿Necesitas un reporte de cumplimiento ahora mismo? Esta acción forzará la auditoría de todos los documentos y enviará las notificaciones correspondientes a los responsables.
            </p>
            <Button 
              onClick={handleForceSend}
              disabled={isProcessing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 font-bold shadow-xl shadow-indigo-600/20 group transition-all active:scale-95"
            >
              {isProcessing ? (
                <Clock className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              )}
              {isProcessing ? 'Procesando...' : 'Ejecutar Auditoría Ahora'}
            </Button>
          </div>

          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-rose-600 font-medium leading-normal">
              Nota: El sistema evita duplicar notificaciones para un mismo documento si ya fue reportado en las últimas 24 horas, incluso en envíos forzados.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-end border-t border-gray-100 pt-8">
        <Button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-12 bg-gray-900 hover:bg-black text-white rounded-2xl py-6 font-bold transition-all shadow-2xl active:scale-95 disabled:opacity-50"
        >
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>

    </section>
  );
}

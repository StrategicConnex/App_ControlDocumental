"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, Truck, Check, Clock, MoreHorizontal, FileCheck2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export type AlertItem = {
  id: string;
  type: 'document' | 'personnel' | 'vehicle' | 'notification';
  title: string;
  status: string;
  link: string;
  priority?: 'high' | 'medium' | 'low';
  notificationId?: string;
  resourceId?: string;
  actionType?: string;
};

export default function ActionInbox({ initialAlerts }: { initialAlerts: AlertItem[] }) {
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isResolving, setIsResolving] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelected(newSelected);
  };

  const selectAll = () => {
    if (selected.size === alerts.length) setSelected(new Set());
    else setSelected(new Set(alerts.map(a => a.id)));
  };

  // REAL API Implementation for persistence verification
  const handleQuickResolve = async (item: AlertItem, e: React.MouseEvent) => {
    e.preventDefault();
    setIsResolving(item.id);
    
    try {
      // Si es una notificación real accionable
      if (item.notificationId && item.resourceId) {
        const response = await fetch('/api/audit/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notificationId: item.notificationId,
            resourceId: item.resourceId,
            type: item.actionType
          })
        });

        if (!response.ok) throw new Error('Error al procesar la acción');
        
        console.log(`✅ Acción persistida en Supabase para ${item.title}`);
      } else {
        // Para alertas derivadas (Documentos vencidos, etc), simulamos o implementamos lógica específica
        console.log(`ℹ️ Alerta derivada resuelta (localmente): ${item.title}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setAlerts(prev => prev.filter(a => a.id !== item.id));
    } catch (error) {
      console.error('Error al resolver alerta:', error);
      alert('Error al conectar con el servidor. Intente nuevamente.');
    } finally {
      setIsResolving(null);
    }
  };

  return (
    <div className="w-full">
      {alerts.length > 0 && (
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={selected.size === alerts.length}
                onCheckedChange={selectAll}
                id="select-all" 
              />
              <label htmlFor="select-all" className="text-sm font-medium text-muted-foreground cursor-pointer">
                Seleccionar todo
              </label>
            </div>
            {selected.size > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                {selected.size} seleccionados
              </Badge>
            )}
          </div>
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8">Snooze</Button>
              <Button size="sm" className="h-8">Resolver Seleccionados</Button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {alerts.length > 0 ? alerts.map((alert) => {
            const isHighPriority = alert.status === 'vencido' || alert.status === 'bloqueado' || alert.priority === 'high';
            return (
              <motion.div 
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                className={cn(
                  "group relative flex items-start gap-4 p-4 rounded-xl border bg-card transition-all hover:shadow-md",
                  selected.has(alert.id) ? "border-primary/50 bg-primary/5" : "border-border hover:border-border/80",
                  isResolving === alert.id && "opacity-50 pointer-events-none"
                )}
              >
                <div className="mt-1">
                  <Checkbox 
                    checked={selected.has(alert.id)}
                    onCheckedChange={() => handleSelect(alert.id)}
                  />
                </div>
                
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  isHighPriority ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600"
                )}>
                  {alert.type === 'document' ? <FileText size={18} /> : alert.type === 'personnel' ? <Users size={18} /> : <Truck size={18} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">{alert.title}</p>
                    {isHighPriority && <Badge variant="destructive" className="h-5 text-[10px]">Crítico</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      Estado: <span className={cn("font-medium", isHighPriority ? "text-destructive" : "text-amber-600")}>{alert.status.replace('_', ' ')}</span>
                    </span>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="truncate">Requiere atención inmediata</span>
                  </div>
                </div>

                {/* Quick Actions (Show on hover) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="h-8">Ver Detalles</Button>
                  <Button size="sm" className="h-8" onClick={(e) => handleQuickResolve(alert, e)}>
                    {isResolving === alert.id ? "Resolviendo..." : <><Check size={16} className="mr-1" /> Resolver rápido</>}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal size={16} />
                  </Button>
                </div>
              </motion.div>
            )
          }) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 px-4 rounded-xl border border-dashed border-border bg-card/50"
            >
              <FileCheck2 size={48} className="mx-auto text-primary/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Bandeja al día</h3>
              <p className="text-sm text-muted-foreground">No tienes acciones pendientes. ¡Buen trabajo!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

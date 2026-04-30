'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NotificationMetadata {
  actionable?: boolean;
  resourceId?: string;
  actionType?: string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

      const org_id = profile?.org_id;
      if (!org_id) return [];

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('org_id', org_id)
        .order('created_at', { ascending: false })
        .limit(10);

      return data || [];
    }
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    // Suscripción en tiempo real a nuevas notificaciones
    const channel = supabase
      .channel('realtime_notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const quickApproveMutation = useMutation({
    mutationFn: async (notification: any) => {
      const response = await fetch('/api/audit/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: notification.id,
          resourceId: (notification.metadata as unknown as NotificationMetadata)?.resourceId,
          type: (notification.metadata as unknown as NotificationMetadata)?.actionType
        })
      });
      if (!response.ok) throw new Error('Error in quick approval');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const bulkApproveMutation = useMutation({
    mutationFn: async () => {
      const actionable = notifications.filter(n => (n.metadata as unknown as NotificationMetadata)?.actionable && !n.is_read);
      if (actionable.length === 0) return;

      const response = await fetch('/api/audit/approve/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: actionable })
      });
      if (!response.ok) throw new Error('Error in bulk approval');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAsRead = (id: string) => markAsReadMutation.mutate(id);
  const handleQuickApprove = (notification: any) => quickApproveMutation.mutate(notification);
  const handleBulkApprove = () => bulkApproveMutation.mutate();

  const actionableCount = notifications.filter(n => (n.metadata as unknown as NotificationMetadata)?.actionable && !n.is_read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Notificaciones</h4>
                <p className="text-[10px] text-gray-500 font-medium">{unreadCount} pendientes</p>
              </div>
              {actionableCount > 0 && (
                <button 
                  onClick={handleBulkApprove}
                  className="text-[10px] bg-emerald-600 text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  Aprobar {actionableCount}
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                    <Bell size={20} />
                  </div>
                  <p className="text-xs text-gray-400">No tienes notificaciones pendientes.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((n) => (
                    <div 
                      key={n.id}
                      className={cn(
                        "p-4 hover:bg-gray-50/50 transition-colors cursor-pointer group relative",
                        !n.is_read && "bg-indigo-50/30"
                      )}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className="flex gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                          n.severity === 'critical' ? "bg-rose-50 text-rose-600" :
                          n.severity === 'warning' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                        )}>
                          {n.severity === 'critical' ? <AlertTriangle size={16} /> :
                           n.severity === 'warning' ? <AlertTriangle size={16} /> : <Info size={16} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-900 leading-tight">{n.title}</p>
                          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                          
                          {/* Acciones Rápidas */}
                          {(n.metadata as unknown as NotificationMetadata)?.actionable && !n.is_read && (
                            <div className="mt-3 flex gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickApprove(n);
                                }}
                                className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                              >
                                Aprobación Rápida
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(n.id);
                                }}
                                className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Ignorar
                              </button>
                            </div>
                          )}

                          <p className="text-[9px] text-gray-400 mt-2 font-medium uppercase tracking-wider">
                            {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </div>
                      </div>
                      {n.link && (
                        <Link 
                          href={n.link}
                          className="absolute inset-0 opacity-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(n.id);
                            setIsOpen(false);
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

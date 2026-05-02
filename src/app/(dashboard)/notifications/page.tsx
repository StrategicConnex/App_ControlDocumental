'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  Info, 
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  async function loadNotifications() {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single();
    const orgId = profile?.org_id;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.id},org_id.eq.${orgId}`)
      .order('created_at', { ascending: false });

    if (data) setNotifications(data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (!error) {
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success('Todas las notificaciones marcadas como leídas');
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (!error) {
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notificación eliminada');
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'DANGER': return 'bg-rose-50 text-rose-600 border-rose-100 icon-rose-500';
      case 'WARNING': return 'bg-amber-50 text-amber-600 border-amber-100 icon-amber-500';
      case 'SUCCESS': return 'bg-emerald-50 text-emerald-600 border-emerald-100 icon-emerald-500';
      default: return 'bg-blue-50 text-blue-600 border-blue-100 icon-blue-500';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'DANGER': return <AlertTriangle size={20} />;
      case 'WARNING': return <AlertTriangle size={20} />;
      case 'SUCCESS': return <CheckCircle2 size={20} />;
      default: return <Info size={20} />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Historial de Notificaciones</h1>
          <p className="text-gray-500 mt-1">Mantente al tanto de los cambios, revisiones y vencimientos.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            disabled={notifications.filter(n => !n.is_read).length === 0}
            className="rounded-xl border-gray-200 text-gray-600 hover:text-indigo-600"
          >
            <CheckCheck size={18} className="mr-2" /> Marcar todo como leído
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <Clock className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-20 rounded-[2.5rem] text-center border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Bell size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Sin notificaciones</h3>
          <p className="text-gray-500 mt-2">No tienes alertas registradas en tu historial.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card 
              key={n.id} 
              className={cn(
                "rounded-2xl card-shadow border-gray-100 transition-all group overflow-hidden",
                !n.is_read && "border-l-4 border-l-indigo-600 bg-indigo-50/10"
              )}
            >
              <CardContent className="p-0">
                <div className="flex items-center p-5 gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                    getTypeStyles(n.type)
                  )}>
                    {getIcon(n.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={cn("text-sm font-bold truncate", !n.is_read ? "text-gray-900" : "text-gray-600")}>
                        {n.title}
                      </h4>
                      {!n.is_read && <span className="w-2 h-2 bg-indigo-600 rounded-full shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock size={10} /> {new Date(n.created_at).toLocaleDateString()} a las {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {n.link && (
                      <Link href={n.link}>
                        <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9 text-indigo-600 hover:bg-indigo-50">
                          <ExternalLink size={18} />
                        </Button>
                      </Link>
                    )}
                    {!n.is_read && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => markAsRead(n.id)}
                        className="rounded-lg h-9 w-9 text-gray-400 hover:text-indigo-600"
                        title="Marcar como leído"
                      >
                        <CheckCheck size={18} />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteNotification(n.id)}
                      className="rounded-lg h-9 w-9 text-gray-400 hover:text-rose-600"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

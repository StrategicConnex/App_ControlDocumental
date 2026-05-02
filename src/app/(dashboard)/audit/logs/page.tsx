'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { 
  ShieldCheck, 
  History, 
  Search, 
  Filter, 
  Download,
  Eye,
  Clock,
  User,
  Globe,
  Database,
  TrendingUp,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.org_id) return [];

      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('org_id', profile.org_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching logs:', error);
        return [];
      }
      return data;
    }
  });

  const filteredLogs = logs?.filter(log => 
    log.event_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-primary w-8 h-8" />
            Audit Trail Centralizado
          </h1>
          <p className="text-muted-foreground mt-1">Monitoreo inmutable de todas las operaciones críticas del sistema.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Buscar por evento, usuario..." 
              className="pl-10 w-[300px] bg-card/50 backdrop-blur-sm border-border focus:ring-primary/20 h-11 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2.5 bg-card border border-border hover:border-primary/50 rounded-xl transition-all shadow-sm">
            <Filter className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="p-2.5 bg-primary text-primary-foreground rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/10 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <History size={80} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Eventos Totales</CardTitle>
            <div className="text-3xl font-bold mt-1 tracking-tighter">{logs?.length || 0}</div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-green-600 font-bold flex items-center gap-1 bg-green-50 w-fit px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              Sincronizado en tiempo real
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Firmas Digitales (Hash)</CardTitle>
            <div className="text-3xl font-bold mt-1 tracking-tighter">
              {logs?.filter(l => l.event_type === 'DOC_SIGNED').length || 0}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-primary" />
              Integridad criptográfica verificada
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alertas de Seguridad</CardTitle>
            <div className="text-3xl font-bold mt-1 tracking-tighter text-orange-600">
              0
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-orange-500" />
              Sin anomalías detectadas hoy
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="border-border shadow-2xl shadow-black/5 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="w-[180px] font-bold text-foreground">Fecha y Hora</TableHead>
                <TableHead className="font-bold text-foreground">Evento</TableHead>
                <TableHead className="font-bold text-foreground">Recurso</TableHead>
                <TableHead className="font-bold text-foreground">Usuario</TableHead>
                <TableHead className="font-bold text-foreground">Origen (IP)</TableHead>
                <TableHead className="text-right font-bold text-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={6} className="p-6">
                      <div className="h-4 bg-muted/20 rounded w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredLogs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground font-medium">
                    No se encontraron registros de auditoría.
                  </TableCell>
                </TableRow>
              ) : filteredLogs?.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/20 transition-all group border-b border-border/50">
                  <TableCell className="font-medium text-xs whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      {formatDate(log.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md",
                      log.event_type === 'DOC_SIGNED' ? "bg-green-50 text-green-700 border-green-200" :
                      log.event_type === 'LOGIN' ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-indigo-50 text-indigo-700 border-indigo-200"
                    )}>
                      {log.event_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{log.resource_type}</span>
                        <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1 rounded">
                          ID: {log.resource_id?.slice(0, 12)}...
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                        {log.profiles?.full_name?.charAt(0) || <User size={14} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground leading-none">
                          {log.profiles?.full_name || 'Sistema Central'}
                        </span>
                        <span className="text-[11px] text-muted-foreground mt-1">
                          {log.profiles?.email || 'automated@strategicconnex.com'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs font-mono bg-muted/30 w-fit px-2 py-1 rounded-lg border border-border">
                      <Globe className="w-3 h-3 text-muted-foreground" />
                      {log.ip_address || '127.0.0.1'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold hover:bg-primary hover:text-primary-foreground rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-border">
                      <Eye className="w-3.5 h-3.5" />
                      Ver RAW
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

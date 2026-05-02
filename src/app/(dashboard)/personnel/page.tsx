import { createClient } from "@/utils/supabase/server";
import { getPersonnel } from "@/lib/services/personnel";
import { 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  UserCog, 
  Search, 
  Filter, 
  Plus,
  ChevronRight,
  MoreVertical,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { MetricCard } from "../_components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { hasPermissionServer } from "@/lib/middleware/rbac";

export const metadata = {
  title: "Acreditación de Personal | Strategic Connex",
};

export default async function PersonnelPage() {
  const supabase = await createClient();
  const canEdit = await hasPermissionServer('edit_personnel');
  
  let personnel = [];
  try {
    personnel = await getPersonnel(supabase);
  } catch (e) {
    console.error("Error fetching personnel", e);
  }

  // Calculate Metrics
  const total = personnel.length;
  const vigentes = personnel.filter(p => p.status === 'aprobado' || p.status === 'vigente').length;
  const bloqueados = personnel.filter(p => p.status === 'vencido' || p.status === 'bloqueado').length;
  const porVencer = total - vigentes - bloqueados;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Acreditación de Personal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Control de habilitación y cumplimiento para operaciones en campo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Activity size={16} /> Reporte de cumplimiento
          </Button>
          {canEdit && (
            <Button size="sm" className="gap-2">
              <Plus size={16} /> Alta de Personal
            </Button>
          )}
        </div>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Personal Vigente"
          value={vigentes}
          subtitle={`de ${total} empleados totales`}
          trend={{ value: 5, label: "vs mes anterior", isPositive: true }}
          sparklineData={[70, 72, 75, 73, 78, 80, 82, 85, vigentes]}
          icon={<ShieldCheck size={20} />}
        />
        <MetricCard
          title="Próximos Vencimientos"
          value={porVencer}
          subtitle="Acción requerida en 30 días"
          trend={{ value: 2, label: "vs mes anterior", isPositive: false }}
          sparklineData={[12, 15, 10, 14, 11, 13, 9, 12, porVencer]}
          icon={<UserCog size={20} />}
        />
        <MetricCard
          title="Personal Bloqueado"
          value={bloqueados}
          subtitle="Acceso denegado a yacimiento"
          trend={{ value: 0, label: "sin cambios", isPositive: true }}
          sparklineData={[5, 4, 6, 3, 5, 4, 3, 2, bloqueados]}
          icon={<ShieldAlert size={20} />}
        />
      </div>

      {/* Personnel Content */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg">Directorio de Personal</CardTitle>
            <p className="text-sm text-muted-foreground">Gestión de acreditaciones y perfiles de operarios.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre, DNI o cargo..." 
                className="pl-9 h-9"
              />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Filter size={14} /> Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {personnel.length > 0 ? personnel.map(person => {
              const isBlocked = person.status === 'vencido' || person.status === 'bloqueado';
              const isWarning = person.status === 'por_vencer';
              
              return (
                <Link 
                  href={`/personnel/${person.id}`} 
                  key={person.id} 
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className={cn(
                        "font-bold",
                        isBlocked ? "bg-destructive/10 text-destructive" :
                        isWarning ? "bg-amber-100 text-amber-700" :
                        "bg-primary/10 text-primary"
                      )}>
                        {person.first_name[0]}{person.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {person.first_name} {person.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {person.job_title} • <span className="font-mono">{person.cuil}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="hidden md:flex flex-col items-end gap-1">
                      <Badge 
                        variant={isBlocked ? "destructive" : isWarning ? "outline" : "outline"}
                        className={cn(
                          "h-5 text-[10px] font-bold uppercase tracking-wider",
                          !isBlocked && !isWarning && "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400",
                          isWarning && "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400"
                        )}
                      >
                        {person.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground">
                        Última validación: Hace 2 días
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {canEdit && (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical size={14} className="text-muted-foreground" />
                        </Button>
                      )}
                      <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            }) : (
              <div className="p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold text-foreground">Sin personal</h3>
                <p className="text-sm text-muted-foreground">No se ha encontrado personal registrado.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { createClient } from "@/utils/supabase/server";
import { getVehicles } from "@/lib/services/vehicles";
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Truck,
  Plus,
  Activity,
  MoreVertical,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MetricCard } from "../_components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { hasPermissionServer } from "@/lib/middleware/rbac";

export const metadata = {
  title: "Vehículos | Strategic Connex",
};

export default async function VehiclesPage() {
  const supabase = await createClient();
  const canEdit = await hasPermissionServer('edit_vehicles');
  
  let vehicles = [];
  try {
    vehicles = await getVehicles(supabase);
  } catch (e) {
    console.error("Error fetching vehicles", e);
  }

  // Calculate Metrics
  const total = vehicles.length;
  const vigentes = vehicles.filter(v => v.status === 'aprobado' || v.status === 'vigente').length;
  const bloqueados = vehicles.filter(v => v.status === 'vencido' || v.status === 'bloqueado').length;
  const porVencer = total - vigentes - bloqueados;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Acreditación de Flota</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Control de habilitación de vehículos y maquinaria pesada para operar en proyectos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Activity size={16} /> Auditoría RTO/VTV
          </Button>
          {canEdit && (
            <Button size="sm" className="gap-2">
              <Plus size={16} /> Alta de Vehículo
            </Button>
          )}
        </div>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Flota Habilitada"
          value={vigentes}
          subtitle={`de ${total} vehículos activos`}
          trend={{ value: 2, label: "vs mes anterior", isPositive: true }}
          sparklineData={[30, 32, 35, 34, 38, 40, 42, 45, vigentes]}
          icon={<CheckCircle2 size={20} />}
        />
        <MetricCard
          title="Próximos Vencimientos"
          value={porVencer}
          subtitle="Acción requerida en 30 días"
          trend={{ value: 5, label: "vs mes anterior", isPositive: false }}
          sparklineData={[8, 10, 5, 12, 9, 11, 7, 10, porVencer]}
          icon={<AlertTriangle size={20} />}
        />
        <MetricCard
          title="Unidades Inhabilitadas"
          value={bloqueados}
          subtitle="Bloqueo automático preventivo"
          trend={{ value: 0, label: "sin cambios", isPositive: true }}
          sparklineData={[2, 3, 2, 1, 3, 2, 1, 1, bloqueados]}
          icon={<Truck size={20} />}
        />
      </div>

      {/* List */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/50 gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg">Directorio de Flota</CardTitle>
            <p className="text-sm text-muted-foreground">Listado de vehículos y maquinaria.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar patente o tipo..." 
                className="pl-9 h-9"
              />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Filter size={14} /> Filtros
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Patente</TableHead>
                <TableHead>Tipo & Marca</TableHead>
                <TableHead>Estado de Acreditación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No hay vehículos registrados en esta organización.
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle) => {
                  const isBlocked = vehicle.status === 'vencido' || vehicle.status === 'bloqueado';
                  const isWarning = vehicle.status === 'por_vencer';
                  
                  return (
                    <TableRow key={vehicle.id} className="group hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Truck size={18} />
                          </div>
                          <div className="bg-secondary text-secondary-foreground font-mono font-bold px-3 py-1 rounded-md border border-border/50 tracking-wider">
                            {vehicle.license_plate}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold text-foreground">{vehicle.type}</span>
                        <p className="text-xs text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={isBlocked ? "destructive" : isWarning ? "outline" : "outline"}
                          className={cn(
                            "uppercase tracking-wider text-[10px] font-bold",
                            !isBlocked && !isWarning && "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400",
                            isWarning && "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400"
                          )}
                        >
                          {vehicle.status === 'aprobado' || vehicle.status === 'vigente' ? 'Habilitado' : vehicle.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/vehicles/${vehicle.id}`}>
                            <Button variant="ghost" size="sm" className="h-8">
                              Ver Detalles
                            </Button>
                          </Link>
                          {canEdit && (
                            <DropdownMenu>
                              <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors">
                                <MoreVertical size={14} className="text-muted-foreground" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Auditar Documentos</DropdownMenuItem>
                                <DropdownMenuItem>Asignar Chofer</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

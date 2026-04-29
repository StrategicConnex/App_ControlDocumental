import { createClient } from "@/utils/supabase/server";
import { getPersonnelById } from "@/lib/services/personnel";
import { 
  ArrowLeft, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Briefcase,
  Fingerprint,
  CalendarClock,
  ShieldCheck,
  UploadCloud,
  MoreVertical,
  Activity
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const metadata = {
  title: "Ficha de Empleado | Strategic Connex",
};

export default async function PersonnelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  let person: {
    first_name: string;
    last_name: string;
    status: string;
    job_title: string;
    cuil: string;
    personnel_docs: {
      id: string;
      status: string;
      document_id: string;
      expiry_date: string;
      documents?: {
        title: string;
        status: string;
      };
    }[];
  } | null = null;
  try {
    person = await getPersonnelById(supabase, id);
  } catch (e) {
    console.error("Error fetching person details", e);
  }

  if (!person) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <User className="h-12 w-12 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold">Empleado no encontrado</h2>
        <Link href="/personnel">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al directorio</Button>
        </Link>
      </div>
    );
  }

  const isBlocked = person.status === 'vencido' || person.status === 'bloqueado';
  const isWarning = person.status === 'por_vencer';

  const getStatusIcon = (status: string, className?: string) => {
    switch (status) {
      case 'aprobado':
      case 'vigente': return <CheckCircle2 className={cn("text-emerald-500", className)} />;
      case 'por_vencer': return <AlertTriangle className={cn("text-amber-500", className)} />;
      case 'vencido':
      case 'bloqueado': return <XCircle className={cn("text-destructive", className)} />;
      default: return <FileText className={cn("text-muted-foreground", className)} />;
    }
  };

  const calculateCompliance = () => {
    if (!person?.personnel_docs || person.personnel_docs.length === 0) return 0;
    const valid = person.personnel_docs.filter(d => d.status === 'vigente' || d.status === 'aprobado').length;
    return Math.round((valid / person.personnel_docs.length) * 100);
  };

  const complianceScore = calculateCompliance();

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/personnel">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
              <AvatarFallback className={cn(
                "text-xl font-bold",
                isBlocked ? "bg-destructive/10 text-destructive" :
                isWarning ? "bg-amber-100 text-amber-700" :
                "bg-primary/10 text-primary"
              )}>
                {person.first_name[0]}{person.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {person.first_name} {person.last_name}
                </h1>
                <Badge 
                  variant={isBlocked ? "destructive" : isWarning ? "outline" : "outline"}
                  className={cn(
                    "uppercase tracking-wider text-[10px] font-bold",
                    !isBlocked && !isWarning && "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400",
                    isWarning && "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400"
                  )}
                >
                  {person.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{person.job_title} • {person.cuil}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <ShieldCheck size={16} /> Emitir Credencial
          </Button>
          <Button size="sm" className="gap-2">
            <UploadCloud size={16} /> Subir Documento
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info & Widgets */}
        <div className="lg:col-span-1 space-y-6">
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                <User size={16} /> Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5"><Briefcase size={12}/> Cargo/Rol</span>
                <span className="text-sm font-semibold text-foreground">{person.job_title}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5"><Fingerprint size={12}/> Identificación (CUIL)</span>
                <span className="text-sm font-mono font-semibold text-foreground">{person.cuil}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5"><CalendarClock size={12}/> Ingreso al sistema</span>
                <span className="text-sm font-semibold text-foreground">15 Oct 2024</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                <Activity size={16} /> Compliance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative flex items-center justify-center w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-muted stroke-current"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={cn(
                        "stroke-current transition-all duration-1000",
                        complianceScore === 100 ? "text-emerald-500" : complianceScore >= 75 ? "text-amber-500" : "text-destructive"
                      )}
                      strokeWidth="3"
                      strokeDasharray={`${complianceScore}, 100`}
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">{complianceScore}%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Porcentaje de documentación obligatoria en regla.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Documents List */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Activity size={14} className="text-slate-600" /> Documentación Exigible
                </CardTitle>
                <CardDescription>
                  Requisitos legales y operativos asociados a este perfil.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {person.personnel_docs?.length > 0 ? (
                  person.personnel_docs.map((pdoc) => {
                    const status = pdoc.status || pdoc.documents?.status || 'borrador';
                    
                    return (
                      <div key={pdoc.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                            {getStatusIcon(status, "h-5 w-5")}
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {pdoc.documents?.title || 'Documento Referenciado'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="h-4 text-[10px] rounded-sm bg-muted/50">
                                RRHH
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                Vencimiento: {pdoc.expiry_date ? new Date(pdoc.expiry_date).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/documents/${pdoc.document_id}`}>
                            <Button variant="outline" size="sm" className="h-8">
                              Revisar
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors">
                              <MoreVertical size={14} className="text-muted-foreground" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Descargar Copia</DropdownMenuItem>
                              <DropdownMenuItem>Solicitar Actualización</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Marcar como Vencido</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">Sin documentos</h3>
                    <p className="text-sm text-muted-foreground">Este perfil no tiene requisitos documentales asignados.</p>
                    <Button variant="outline" className="mt-4">Asignar matriz documental</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

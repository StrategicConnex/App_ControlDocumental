import { createClient } from "@/utils/supabase/server";
import { getPersonnelById } from "@/lib/services/personnel";
import { ArrowLeft, User, FileText, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Ficha de Empleado | BordUp",
};

export default async function PersonnelDetailPage({ params }: { params: { id: string } }) {
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
    person = await getPersonnelById(supabase, params.id);
  } catch (e) {
    console.error("Error fetching person details", e);
  }

  if (!person) {
    return <div className="p-8 text-center">Empleado no encontrado.</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprobado':
      case 'vigente': return <CheckCircle className="text-emerald-500" size={20} />;
      case 'por_vencer': return <AlertTriangle className="text-amber-500" size={20} />;
      case 'vencido':
      case 'bloqueado': return <XCircle className="text-rose-500" size={20} />;
      default: return <FileText className="text-gray-400" size={20} />;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="flex items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/personnel" className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm",
              person.status === 'vencido' || person.status === 'bloqueado' ? "bg-rose-100 text-rose-700" :
              person.status === 'por_vencer' ? "bg-amber-100 text-amber-700" :
              "bg-emerald-100 text-emerald-700"
            )}>
              {person.first_name[0]}{person.last_name[0]}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{person.first_name} {person.last_name}</h1>
              </div>
              <p className="text-sm text-gray-500">{person.job_title} • CUIL: {person.cuil}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={18} className="text-purple-600" /> Información Personal
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Estado de Acreditación</p>
                <div className="mt-1 flex items-center gap-2">
                  {getStatusIcon(person.status)}
                  <span className="font-medium capitalize">{person.status}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Cargo</p>
                <p className="text-sm font-medium">{person.job_title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">CUIL / ID</p>
                <p className="text-sm font-medium">{person.cuil}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-2">
          <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText size={18} className="text-purple-600" /> Documentación Requerida
            </h3>
            
            <div className="space-y-4">
              {person.personnel_docs?.length > 0 ? (
                person.personnel_docs.map((pdoc) => (
                  <div key={pdoc.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(pdoc.status || pdoc.documents?.status)}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {pdoc.documents?.title || 'Documento Referenciado'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Vencimiento: {pdoc.expiry_date ? new Date(pdoc.expiry_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <Link href={`/documents/${pdoc.document_id}`} className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
                      Ver Documento
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay documentos asociados a esta persona.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

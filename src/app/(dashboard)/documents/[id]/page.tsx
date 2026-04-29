import { createClient } from "@/utils/supabase/server";
import { getDocumentById, getDocumentVersions } from "@/lib/services/documents";
import { FileText, History, CheckCircle, ArrowLeft, Download, AlertTriangle } from "lucide-react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Detalle de Documento | Strategic Connex",
};

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const resolvedParams = await params;

  let doc: {
    id: string;
    title: string;
    code: string;
    category: string;
    status: string;
    current_version: number;
    expiry_date: string | null;
    created_at: string;
    file_url?: string;
    profiles?: { first_name: string; last_name: string } | null;
  } | null = null;

  let versions: {
    id: string;
    version_number: number;
    created_at: string;
    file_url?: string;
    uploaded_by?: string;
  }[] = [];

  try {
    doc = await getDocumentById(supabase, resolvedParams.id);
    versions = await getDocumentVersions(supabase, resolvedParams.id);
  } catch (e) {
    console.error("Error fetching document details", e);
  }

  if (!doc) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center">
        <FileText size={48} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Documento no encontrado</h2>
        <p className="text-sm text-gray-500 mb-6">El documento solicitado no existe o fue eliminado.</p>
        <Link href="/documents" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
          <ArrowLeft size={16} /> Volver al listado
        </Link>
      </div>
    );
  }

  const uploaderName = doc.profiles
    ? `${doc.profiles.first_name} ${doc.profiles.last_name}`
    : 'Sistema';

  const now = new Date();
  const isExpiringSoon = doc.expiry_date
    && new Date(doc.expiry_date) < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const isExpired = doc.status === 'vencido';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/documents"
            className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{doc.title}</h1>
              <StatusBadge status={doc.status} />
            </div>
            <p className="text-sm text-gray-500 font-mono">{doc.code} • {doc.category}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {doc.file_url && (
            <a
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-gray-100 bg-white rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors"
            >
              <Download size={16} /> Descargar Actual
            </a>
          )}
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
            Subir Nueva Versión
          </button>
        </div>
      </header>

      {/* Expiry warning banner */}
      {(isExpiringSoon || isExpired) && (
        <div className={cn(
          "flex items-center gap-3 p-4 rounded-2xl border text-sm font-medium",
          isExpired
            ? "bg-rose-50 border-rose-100 text-rose-700"
            : "bg-amber-50 border-amber-100 text-amber-700"
        )}>
          <AlertTriangle size={18} className="shrink-0" />
          {isExpired
            ? "Este documento está vencido. Se requiere actualización inmediata."
            : `Este documento vence el ${new Date(doc.expiry_date!).toLocaleDateString('es-AR')}. Actualícelo a tiempo.`}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" /> Detalles del Archivo
            </h3>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Versión Actual</p>
                <p className="text-sm font-medium text-gray-900">v{doc.current_version}.0</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Responsable</p>
                <p className="text-sm font-medium text-gray-900">{uploaderName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Fecha de Creación</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(doc.created_at).toLocaleDateString('es-AR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Fecha de Vencimiento</p>
                <p className={cn("text-sm font-medium", isExpired ? "text-rose-600" : isExpiringSoon ? "text-amber-600" : "text-gray-900")}>
                  {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString('es-AR') : 'Sin vencimiento'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Categoría</p>
                <p className="text-sm font-medium text-gray-900">{doc.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Código</p>
                <p className="text-sm font-mono font-medium text-gray-900">{doc.code}</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-600" /> Flujo de Aprobación
            </h3>
            <div className="relative pl-6 border-l-2 border-emerald-200 space-y-8 py-2">
              <div className="relative">
                <div className="absolute -left-[31px] w-4 h-4 bg-emerald-500 rounded-full border-4 border-white" />
                <p className="text-sm font-bold text-gray-900">Documento Cargado</p>
                <p className="text-xs text-gray-500 mt-1">
                  Por {uploaderName} el {new Date(doc.created_at).toLocaleDateString('es-AR')}
                </p>
              </div>
              <div className="relative">
                <div className={cn("absolute -left-[31px] w-4 h-4 rounded-full border-4 border-white", doc.status === 'aprobado' || doc.status === 'vigente' ? "bg-emerald-500" : "bg-gray-200")} />
                <p className={cn("text-sm font-bold", doc.status === 'aprobado' || doc.status === 'vigente' ? "text-gray-900" : "text-gray-400")}>
                  Aprobación Técnica
                </p>
                <p className={cn("text-xs mt-1", doc.status === 'aprobado' || doc.status === 'vigente' ? "text-gray-500" : "text-gray-300")}>
                  {doc.status === 'aprobado' || doc.status === 'vigente' ? 'Aprobado' : 'Pendiente'}
                </p>
              </div>
              <div className="relative">
                <div className={cn("absolute -left-[31px] w-4 h-4 rounded-full border-4 border-white", doc.status === 'vigente' ? "bg-emerald-500" : "bg-gray-200")} />
                <p className={cn("text-sm font-bold", doc.status === 'vigente' ? "text-gray-900" : "text-gray-400")}>
                  Publicación Final
                </p>
                <p className={cn("text-xs mt-1", doc.status === 'vigente' ? "text-gray-500" : "text-gray-300")}>
                  {doc.status === 'vigente' ? 'Vigente' : 'Pendiente'}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Version history */}
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <History size={18} className="text-indigo-600" /> Historial de Versiones
            </h3>
            {versions.length > 0 ? (
              <div className="space-y-4">
                {versions.map((v, idx) => {
                  const isCurrent = v.version_number === doc.current_version;
                  return (
                    <div
                      key={v.id}
                      className={cn(
                        "p-4 rounded-xl border transition-colors",
                        isCurrent ? "bg-indigo-50/50 border-indigo-100" : "bg-gray-50 border-transparent"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn("text-sm font-bold", isCurrent ? "text-indigo-700" : "text-gray-700")}>
                          Versión {v.version_number}.0
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
                            Actual
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        {new Date(v.created_at).toLocaleDateString('es-AR')}
                      </p>
                      {!isCurrent && (
                        <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                          Restaurar esta versión
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Sin historial de versiones.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

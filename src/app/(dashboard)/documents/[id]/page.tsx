import { FileText, History, CheckCircle, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Detalle de Documento | BordUp",
};

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  // Mock data for UI demonstration
  const doc = {
    id: params.id,
    title: "Manual de Procedimientos HSE",
    code: "HSE-MAN-001",
    category: "ISO/Ingeniería",
    status: "aprobado",
    version: 3,
    uploadedBy: "Admin Local",
    createdAt: "2026-04-10T10:00:00Z",
    expiryDate: "2027-04-10T10:00:00Z"
  };

  const versions = [
    { v: 3, date: "2026-04-10", author: "Admin Local", current: true },
    { v: 2, date: "2025-04-10", author: "Juan Perez", current: false },
    { v: 1, date: "2024-04-10", author: "Juan Perez", current: false },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/documents" className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{doc.title}</h1>
              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                Aprobado
              </div>
            </div>
            <p className="text-sm text-gray-500 font-mono">{doc.code} • {doc.category}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 bg-white rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors">
            <Download size={16} /> Descargar Actual
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20">
            Subir Nueva Versión
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText size={18} className="text-purple-600" /> Detalles del Archivo
            </h3>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Versión Actual</p>
                <p className="text-sm font-medium text-gray-900">v{doc.version}.0</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Responsable</p>
                <p className="text-sm font-medium text-gray-900">{doc.uploadedBy}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Fecha de Creación</p>
                <p className="text-sm font-medium text-gray-900">{new Date(doc.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Fecha de Vencimiento</p>
                <p className="text-sm font-medium text-gray-900">{new Date(doc.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-600" /> Flujo de Aprobación
            </h3>
            
            <div className="relative pl-6 border-l-2 border-emerald-500 space-y-8 py-2">
              <div className="relative">
                <div className="absolute -left-[31px] w-4 h-4 bg-emerald-500 rounded-full border-4 border-white" />
                <p className="text-sm font-bold text-gray-900">Documento Cargado</p>
                <p className="text-xs text-gray-500 mt-1">Por {doc.uploadedBy} el 10 Abr 2026</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[31px] w-4 h-4 bg-emerald-500 rounded-full border-4 border-white" />
                <p className="text-sm font-bold text-gray-900">Aprobación Técnica</p>
                <p className="text-xs text-gray-500 mt-1">Aprobado por Auditoria el 12 Abr 2026</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[31px] w-4 h-4 bg-gray-200 rounded-full border-4 border-white" />
                <p className="text-sm font-bold text-gray-400">Publicación Final</p>
                <p className="text-xs text-gray-400 mt-1">Pendiente</p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar: History */}
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <History size={18} className="text-purple-600" /> Historial de Versiones
            </h3>
            
            <div className="space-y-4">
              {versions.map((v) => (
                <div key={v.v} className={cn("p-4 rounded-xl border transition-colors", v.current ? "bg-purple-50/50 border-purple-100" : "bg-gray-50 border-transparent")}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn("text-sm font-bold", v.current ? "text-purple-700" : "text-gray-700")}>Versión {v.v}.0</span>
                    {v.current && <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-100 px-2 py-0.5 rounded">Actual</span>}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{v.date} • Por {v.author}</p>
                  
                  {!v.current && (
                    <button className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors">
                      Restaurar esta versión
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { Search, Filter, MoreVertical, FileText } from "lucide-react";
import Link from "next/link";

type DocumentStatus = 'borrador' | 'revision' | 'aprobado' | 'vencido' | 'por_vencer';

interface DocumentProps {
  id: string;
  title: string;
  code: string;
  category: string;
  status: DocumentStatus;
  version: number;
  expiryDate: string | null;
  uploadedBy: { first_name: string; last_name: string } | null;
  createdAt: string;
}

const statusConfig: Record<DocumentStatus, { color: string; bg: string; label: string }> = {
  borrador: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Borrador' },
  revision: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'En Revisión' },
  aprobado: { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Aprobado' },
  por_vencer: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Por Vencer' },
  vencido: { color: 'text-rose-600', bg: 'bg-rose-50', label: 'Vencido' },
};

export default function DocumentTable({ documents }: { documents: DocumentProps[] }) {
  return (
    <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Documentos</h3>
          <p className="text-sm text-gray-500">Gestión de archivos y versiones</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar documento..." 
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 w-64 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors">
            <Filter size={16} /> Filtros
          </button>
          <Link href="/documents/new" className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20">
            Nuevo Documento
          </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Código & Título</th>
              <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Versión</th>
              <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Responsable</th>
              <th className="pb-3 pt-2 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                  No se encontraron documentos.
                </td>
              </tr>
            ) : (
              documents.map((doc) => {
                const config = statusConfig[doc.status];
                return (
                  <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                            {doc.title}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">{doc.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">{doc.category}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", config.bg, config.color)}>
                        {config.label}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-900">v{doc.version}.0</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {doc.uploadedBy ? `${doc.uploadedBy.first_name} ${doc.uploadedBy.last_name}` : 'Sistema'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/documents/${doc.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                        <MoreVertical size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

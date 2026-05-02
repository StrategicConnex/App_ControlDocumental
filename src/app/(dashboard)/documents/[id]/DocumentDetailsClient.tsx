"use client";

import React, { useState } from "react";
import {
  FileText,
  History,
  CheckCircle,
  AlertTriangle,
  Download,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import { NewVersionModal } from "@/components/documents/NewVersionModal";
import { DigitalSignatureSection } from "@/components/documents/DigitalSignatureSection";

interface DocumentDetailsClientProps {
  doc: {
    id: string;
    title: string;
    code: string;
    category: string;
    status: string;
    current_version: number;
    file_url: string | null;
    expiry_date: string | null;
    created_at: string;
  };
  versions: {
    id: string;
    version_number: number;
    version_label: string;
    file_url: string | null;
    created_at: string;
    is_current: boolean;
  }[];
  uploaderName: string;
  currentUserId: string;
  orgId: string;
}

export default function DocumentDetailsClient({
  doc,
  versions,
  uploaderName,
  currentUserId,
  orgId
}: DocumentDetailsClientProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [restoringVersion, setRestoringVersion] = useState<number | null>(null);

  const handleRestoreVersion = async (targetVersion: number) => {
    if (!confirm(`¿Restaurar a la versión ${targetVersion}.0? Esto creará una nueva versión con el contenido anterior.`)) return;
    setRestoringVersion(targetVersion);
    try {
      const res = await fetch(`/api/documents/${doc.id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetVersion }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      window.location.reload();
    } catch (err) {
      console.error('Error restoring version:', err);
      alert('Error al restaurar la versión. Intente nuevamente.');
    } finally {
      setRestoringVersion(null);
    }
  };

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
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
          >
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
              <FileText size={18} className="text-indigo-600" /> Vista Previa del Documento
            </h3>
            {doc.file_url ? (
              <div className="aspect-[3/4] md:aspect-video w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                {doc.file_url.toLowerCase().endsWith('.pdf') || doc.file_url.includes('pdf') ? (
                  <iframe
                    src={`${doc.file_url}#toolbar=0`}
                    className="w-full h-full border-none"
                    title={doc.title}
                  />
                ) : (
                  <div className="text-center p-8">
                    <FileText size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-sm text-gray-500 mb-4">Vista previa no disponible para este tipo de archivo.</p>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-indigo-600 hover:underline"
                    >
                      Abrir en nueva pestaña
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video w-full rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400">
                <FileText size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">No hay archivo cargado en esta versión.</p>
              </div>
            )}
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
                <p className={cn("text-sm font-bold", doc.status === 'aprobado' ? "text-gray-900" : "text-gray-400")}>
                  Aprobación Técnica
                </p>
                <p className={cn("text-xs mt-1", doc.status === 'aprobado' ? "text-gray-500" : "text-gray-300")}>
                  {doc.status === 'aprobado' ? 'Aprobado' : 'Pendiente'}
                </p>
              </div>
              <div className="relative">
                <div className={cn("absolute -left-[31px] w-4 h-4 rounded-full border-4 border-white", doc.status === 'aprobado' ? "bg-emerald-500" : "bg-gray-200")} />
                <p className={cn("text-sm font-bold", doc.status === 'aprobado' ? "text-gray-900" : "text-gray-400")}>
                  Publicación Final
                </p>
                <p className={cn("text-xs mt-1", doc.status === 'aprobado' ? "text-gray-500" : "text-gray-300")}>
                  {doc.status === 'aprobado' ? 'Vigente' : 'Pendiente'}
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
                        <button
                          onClick={() => handleRestoreVersion(v.version_number)}
                          disabled={restoringVersion === v.version_number}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {restoringVersion === v.version_number ? 'Restaurando...' : 'Restaurar esta versión'}
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

          <DigitalSignatureSection
            documentId={doc.id}
            versionId={versions.find(v => v.version_number === doc.current_version)?.id ?? ''}
            currentUserId={currentUserId}
            orgId={orgId}
            documentTitle={doc.title}
            documentCode={doc.code}
            versionNumber={doc.current_version?.toString() || "1"}
          />

        </div>
      </div>

      <NewVersionModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        documentId={doc.id}
        currentVersion={doc.current_version || 1}
        documentTitle={doc.title}
      />
    </div>
  );
}

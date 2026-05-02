"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface NewVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  currentVersion: number;
  documentTitle: string;
}

export function NewVersionModal({ isOpen, onClose, documentId, currentVersion, documentTitle }: NewVersionModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/documents/${documentId}/versions`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error HTTP ${res.status}`);
      }

      router.refresh();
      onClose();
      setFile(null);
    } catch (error) {
      console.error("Error uploading version:", error);
      alert("Error al subir la nueva versión. Por favor reintente.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[2rem]">
        <DialogHeader>
          <DialogTitle>Subir Nueva Versión</DialogTitle>
          <DialogDescription>
            Carga una nueva versión para <strong>{documentTitle}</strong>.
            La versión actual es v{currentVersion}.0.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div
            className={`
              border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-colors
              ${file ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-200 bg-gray-50 hover:bg-indigo-50/50 hover:border-indigo-300 cursor-pointer'}
            `}
            onClick={() => !isUploading && document.getElementById('version-file-upload')?.click()}
          >
            <input
              id="version-file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
              title="Seleccionar archivo para nueva versión"
              aria-label="Seleccionar archivo para nueva versión"
            />

            {file ? (
              <>
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <FileCheck size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                  <p className="text-xs text-emerald-600">Archivo seleccionado</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  Cambiar archivo
                </Button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-white text-gray-400 rounded-full flex items-center justify-center shadow-sm">
                  <Upload size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">Selecciona el nuevo archivo</p>
                  <p className="text-xs text-gray-500 mt-1">Soporta PDF, DOCX, DWG</p>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isUploading}
            className="rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20"
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              'Confirmar Nueva Versión'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

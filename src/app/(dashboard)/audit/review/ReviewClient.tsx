'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileSearch, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock,
  Filter,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  getPendingReviews, 
  approveDocument, 
  rejectDocument 
} from '@/lib/services/vendors';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function ReviewClient() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const supabase = createClient();

  async function loadPending() {
    setIsLoading(true);
    try {
      const data = await getPendingReviews(supabase);
      setDocuments(data || []);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar documentos pendientes');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (doc: any) => {
    setIsProcessing(true);
    try {
      await approveDocument(supabase, doc.id);
      toast.success(`Documento "${doc.title}" aprobado`);
      loadPending();
    } catch (error) {
      toast.error('Error al aprobar documento');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Debes proporcionar un motivo de rechazo');
      return;
    }
    setIsProcessing(true);
    try {
      await rejectDocument(supabase, selectedDoc.id, rejectionReason);
      toast.success(`Documento "${selectedDoc.title}" rechazado`);
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      loadPending();
    } catch (error) {
      toast.error('Error al rechazar documento');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Centro de Revisión</h1>
          <p className="text-gray-500 mt-1">Audita y valida la documentación subida por proveedores y personal.</p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1 rounded-lg font-bold">
            {documents.length} Pendientes
          </Badge>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <Clock className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white p-20 rounded-[2.5rem] text-center border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-gray-300" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Todo al día</h3>
          <p className="text-gray-500 max-w-xs mx-auto mt-2">No hay documentos pendientes de revisión en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="rounded-[2rem] card-shadow border-gray-100 overflow-hidden hover:border-indigo-200 transition-all">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-stretch">
                  {/* Info Section */}
                  <div className="p-8 flex-1 border-r border-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none rounded-full px-3">
                        Pendiente
                      </Badge>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} /> {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{doc.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Filter size={14} /> {doc.document_type?.name || 'Sin Categoría'}
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare size={14} /> Subido por: <span className="font-medium text-gray-900">{doc.profiles?.full_name || 'Sistema'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="bg-gray-50/50 p-6 flex flex-col sm:flex-row md:flex-col lg:flex-row items-center justify-center gap-3 min-w-[320px]">
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(doc.file_url, '_blank')}
                      className="rounded-xl border-gray-200 bg-white w-full lg:w-auto"
                    >
                      <Eye size={16} className="mr-2" /> Previsualizar
                    </Button>
                    <div className="flex gap-2 w-full lg:w-auto">
                      <Button 
                        onClick={() => handleApprove(doc)}
                        disabled={isProcessing}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex-1 lg:flex-none shadow-lg shadow-emerald-600/20"
                      >
                        <CheckCircle size={16} className="mr-2" /> Aprobar
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          setSelectedDoc(doc);
                          setIsRejectDialogOpen(true);
                        }}
                        disabled={isProcessing}
                        className="rounded-xl flex-1 lg:flex-none shadow-lg shadow-red-600/20"
                      >
                        <XCircle size={16} className="mr-2" /> Rechazar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="rounded-[2.5rem] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Rechazar Documento</DialogTitle>
            <DialogDescription className="text-gray-500">
              Explica al proveedor por qué el documento no es válido. Este mensaje se le enviará automáticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Motivo del Rechazo</label>
              <Textarea 
                placeholder="Ej: El archivo está borroso o la fecha de vencimiento no coincide con el formulario..." 
                className="rounded-2xl min-h-[120px] border-gray-200 focus:ring-red-500 focus:border-red-500"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <div className="bg-red-50 p-4 rounded-2xl flex gap-3 border border-red-100">
              <XCircle size={20} className="text-red-600 shrink-0" />
              <p className="text-xs text-red-800">
                Al rechazar, el estado del documento cambiará a "RECHAZADO" y se le solicitará al proveedor una nueva carga.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button 
              onClick={handleReject}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 shadow-lg shadow-red-600/20"
            >
              {isProcessing ? 'Procesando...' : 'Confirmar Rechazo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

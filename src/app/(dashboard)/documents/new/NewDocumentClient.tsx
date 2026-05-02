'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FilePlus, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function NewDocumentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get('request');
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [vendorRequest, setVendorRequest] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    category: 'General',
    file: null as File | null,
  });

  useEffect(() => {
    if (requestId) {
      async function loadRequest() {
        const { data, error } = await supabase
          .from('vendor_document_requests')
          .select('*, document_type:doc_type_id(name)')
          .eq('id', requestId)
          .single();
        
        if (data) {
          setVendorRequest(data);
          setFormData(prev => ({
            ...prev,
            title: (data.document_type as any)?.name || '',
            category: 'Proveedor'
          }));
        }
      }
      loadRequest();
    }
  }, [requestId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No auth');

      const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single();
      const orgId = profile?.org_id;

      if (!orgId) {
        toast.error('No se encontró la organización asociada a tu perfil');
        return;
      }

      // 1. Upload to Storage
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${orgId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, formData.file);

      if (uploadError) throw uploadError;

      // 2. Insert Document Record
      const { error: insertError } = await supabase.from('documents').insert({
        title: formData.title,
        code: formData.code || `REQ-${requestId?.substring(0, 4)}`,
        org_id: orgId,
        file_url: filePath,
        status: 'PENDING',
        vendor_request_id: requestId,
        created_by: user.id
      });

      if (insertError) throw insertError;

      setIsSuccess(true);
      toast.success('Documento cargado correctamente');
      setTimeout(() => router.push('/'), 2000);
    } catch (error: any) {
      console.error(error);
      toast.error('Error al cargar el documento: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle2 size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">¡Carga Exitosa!</h2>
          <p className="text-gray-500 mt-2">El documento ha sido enviado para verificación.</p>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/">Volver al Panel</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-10">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Panel
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Nuevo Documento</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          {vendorRequest ? 'Cargar Documento Solicitado' : 'Nuevo Documento'}
        </h1>
        <p className="text-gray-500">
          {vendorRequest 
            ? `Cargando ${vendorRequest.document_type?.name} para cumplir con la solicitud.` 
            : 'Agrega un nuevo archivo al repositorio central.'}
        </p>
      </header>

      <section className="bg-white p-10 rounded-[2.5rem] card-shadow border border-gray-100">
        <form onSubmit={handleUpload} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Título del Documento</label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Ej: Manual de Procedimientos" 
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Código o Referencia</label>
              <input 
                type="text" 
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="Ej: ISO-9001-2026" 
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Archivo</label>
            <div className="relative group">
              <input 
                type="file" 
                onChange={(e) => setFormData({...formData, file: e.target.files?.[0] || null})}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
                formData.file 
                ? 'bg-emerald-50 border-emerald-300' 
                : 'bg-gray-50 border-gray-200 group-hover:bg-indigo-50/50 group-hover:border-indigo-300'
              }`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                  formData.file ? 'bg-white text-emerald-600' : 'bg-white text-gray-400 group-hover:text-indigo-600'
                }`}>
                  <Upload size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">
                    {formData.file ? formData.file.name : 'Haz clic o arrastra un archivo aquí'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Soporta PDF, DOCX, DWG hasta 200MB.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => router.back()}
              className="px-8 py-6 rounded-2xl font-bold text-gray-500"
            >
              Cancelar
            </Button>
            <Button 
              disabled={isLoading}
              className="px-10 py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={20} /> Subiendo...
                </>
              ) : (
                <>
                  <FilePlus size={20} className="mr-2" /> 
                  {vendorRequest ? 'Enviar para Verificación' : 'Crear Documento'}
                </>
              )}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

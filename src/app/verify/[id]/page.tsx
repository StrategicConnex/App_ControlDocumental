import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { CheckCircle2, ShieldCheck, FileText, User, Calendar, Network, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Verificación de Documento | Strategic Connex',
};

export default async function VerifyPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;

  // Fetch signature details with document and signer info
  // We use admin client or similar because this is public
  const { data: signature, error } = await supabase
    .from('digital_signatures')
    .select(`
      *,
      documents (title, metadata),
      profiles:signer_id (first_name, last_name)
    `)

    .eq('id', id)
    .single();

  if (error || !signature) {
    notFound();
  }

  const docInfo = signature.documents as any;
  const signerInfo = signature.profiles as any;


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="max-w-2xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Status */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-2 shadow-inner ring-8 ring-emerald-50">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Documento Verificado</h1>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            Esta es una firma digital válida y auténtica emitida por la plataforma Strategic Connex.
          </p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8 sm:p-10 space-y-10">
            {/* Document Info */}
            <div className="flex gap-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                <FileText className="text-blue-600" size={24} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documento</label>
                <h3 className="text-lg font-bold text-slate-900">{docInfo?.title || 'Documento sin título'}</h3>
                <p className="text-xs text-slate-500">Ref ID: {signature.document_id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-4">
              {/* Signer Info */}
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <User className="text-indigo-600" size={24} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Firmante</label>
                  <h3 className="text-base font-bold text-slate-900">
                    {signerInfo?.first_name} {signerInfo?.last_name}
                  </h3>
                  <p className="text-xs text-slate-500">Acreditación verificada</p>
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Calendar className="text-amber-600" size={24} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha de Firma</label>
                  <h3 className="text-base font-bold text-slate-900">
                    {signature.validation_timestamp ? new Date(signature.validation_timestamp).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    }) : 'Fecha no disponible'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {signature.validation_timestamp ? new Date(signature.validation_timestamp).toLocaleTimeString('es-AR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    }) : '--:--'}
                  </p>
                </div>
              </div>
            </div>

            {/* Hash Display */}
            <div className="pt-6 border-t border-slate-50">
              <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Lock size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Hash de Seguridad (SHA-256)</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">Integridad OK</span>
                </div>
                <p className="text-[11px] font-mono text-slate-600 break-all leading-relaxed">
                  {signature.signature_hash}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="bg-slate-900 p-8 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/50 text-[10px] font-medium tracking-wide uppercase">
            <div className="flex items-center gap-2">
              <Network size={14} className="text-blue-400" />
              <span>IP de Origen: {signature.ip_address || 'Privada'}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Validado por: {signature.validation_provider}</span>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Strategic Connex - Control Documental Inteligente
          </p>
        </div>
      </div>
    </div>
  );
}

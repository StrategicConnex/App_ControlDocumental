"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  PenTool, 
  QrCode, 
  ExternalLink, 
  CheckCircle2, 
  Loader2,
  Info,
  Download
} from "lucide-react";

import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { signDocument } from "@/lib/services/signatures";
import { qrService } from "@/lib/services/qr";
import { generateCertificatePDF } from "@/lib/utils/pdf-generator";
import { toast } from "sonner";


interface Signature {
  id: string;
  signature_hash: string;
  validation_timestamp: string | null;
  signer_id: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface DigitalSignatureSectionProps {
  documentId: string;
  versionId: string;
  currentUserId: string;
  orgId: string;
  documentTitle: string;
  documentCode: string;
  versionNumber: string;
}


export function DigitalSignatureSection({ 
  documentId, 
  versionId, 
  currentUserId, 
  orgId,
  documentTitle,
  documentCode,
  versionNumber
}: DigitalSignatureSectionProps) {

  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const supabase = createClient();

  useEffect(() => {
    fetchSignatures();
  }, [versionId]);

  async function fetchSignatures() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('digital_signatures')
        .select(`
          *,
          profiles:signer_id (first_name, last_name)
        `)
        .eq('version_id', versionId)
        .order('validation_timestamp', { ascending: false });

      if (error) throw error;
      setSignatures((data as unknown as Signature[]) || []);

      // Generate QRs for existing signatures
      const qrs: Record<string, string> = {};
      for (const sig of data || []) {
        qrs[sig.id] = await qrService.generateVerificationQR(sig.id);
      }
      setQrCodes(qrs);
    } catch (error) {
      console.error('Error fetching signatures:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSign() {
    setIsSigning(true);
    try {
      // In a real app, we'd fetch the document content to hash it properly.
      // For this demo, we'll use a combined string of metadata as "content".
      const contentToHash = `${documentTitle}|${versionId}|${new Date().toISOString()}`;
      
      const { signatureId } = await signDocument(supabase, {
        document_id: documentId,
        version_id: versionId,
        signer_id: currentUserId,
        org_id: orgId,
        content: contentToHash,
        ip_address: '127.0.0.1' // In production, get from server/headers
      });

      toast.success("Documento firmado digitalmente con éxito");
      await fetchSignatures();
    } catch (error: any) {
      toast.error("Error al firmar: " + error.message);
    } finally {
      setIsSigning(false);
    }
  }

  async function handleDownloadCertificate(sig: Signature) {
    try {
      const qrDataUrl = qrCodes[sig.id];
      if (!qrDataUrl) throw new Error("QR not ready");

      const doc = await generateCertificatePDF({
        documentName: documentTitle,
        documentCode: documentCode,
        version: `${versionNumber}.0`,
        hash: sig.signature_hash,
        signerName: `${sig.profiles?.first_name ?? ''} ${sig.profiles?.last_name ?? ''}`,
        signerRole: 'Responsable de Control', // Default or fetch
        signDate: sig.validation_timestamp ? new Date(sig.validation_timestamp).toLocaleDateString('es-AR') : 'N/A',
        qrCodeDataUrl: qrDataUrl,
        orgName: 'Strategic Connex' // Default or fetch
      });

      doc.save(`Certificado_${documentCode}_v${versionNumber}.pdf`);
      toast.success("Certificado generado y descargado");
    } catch (error) {
      toast.error("Error al generar el certificado");
    }
  }


  const hasSigned = signatures.some(s => s.signer_id === currentUserId);

  return (
    <section className="bg-white p-6 rounded-[2rem] card-shadow border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-600" /> Firmas Digitales (Fase 2)
        </h3>
        {!hasSigned && (
          <button
            onClick={handleSign}
            disabled={isSigning}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20"
          >
            {isSigning ? <Loader2 className="animate-spin" size={16} /> : <PenTool size={16} />}
            Firmar Versión Actual
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Loader2 className="animate-spin mb-2" size={24} />
          <p className="text-sm">Cargando firmas...</p>
        </div>
      ) : signatures.length > 0 ? (
        <div className="space-y-4">
          {signatures.map((sig) => (
            <div 
              key={sig.id} 
              className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors group"
            >
              {/* QR Code Container */}
              <div className="relative shrink-0 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                {qrCodes[sig.id] ? (
                  <img 
                    src={qrCodes[sig.id]} 
                    alt="QR Verification" 
                    className="w-20 h-20"
                  />
                ) : (
                  <div className="w-20 h-20 bg-slate-50 animate-pulse rounded-lg" />
                )}
                <div className="absolute -top-1 -right-1">
                  <CheckCircle2 className="text-emerald-500 bg-white rounded-full" size={16} />
                </div>
              </div>

              {/* Signature Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {sig.profiles?.first_name ?? ''} {sig.profiles?.last_name ?? ''}
                  </p>
                  <a 
                    href={`/verify/${sig.id}`}
                    target="_blank"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button 
                    onClick={() => handleDownloadCertificate(sig)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    title="Descargar Certificado PDF"
                  >
                    <Download size={14} />
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  Firmado el {sig.validation_timestamp ? new Date(sig.validation_timestamp).toLocaleDateString('es-AR') : 'Fecha no disponible'} 
                  {sig.validation_timestamp ? ` a las ${new Date(sig.validation_timestamp).toLocaleTimeString('es-AR')}` : ''}
                </p>
                <div className="pt-2">
                  <p className="text-[10px] font-mono text-slate-400 truncate bg-white/50 px-2 py-1 rounded border border-slate-100">
                    Hash: {sig.signature_hash.substring(0, 32)}...
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-xl text-[11px] text-blue-600 border border-blue-100">
            <Info size={14} className="shrink-0 mt-0.5" />
            <p>
              El código QR permite la validación externa del documento. Al escanearlo, cualquier persona puede verificar la autenticidad y que el documento no ha sido alterado.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 px-4 bg-slate-50 rounded-[1.5rem] border border-dashed border-slate-200">
          <QrCode size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-500">No hay firmas digitales registradas para esta versión.</p>
          <p className="text-xs text-slate-400 mt-1">Firma este documento para garantizar su integridad legal.</p>
        </div>
      )}
    </section>
  );
}

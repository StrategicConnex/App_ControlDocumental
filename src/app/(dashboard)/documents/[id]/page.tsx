import { createClient } from "@/utils/supabase/server";
import { getDocumentById, getDocumentVersions } from "@/lib/services/documents";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import DocumentDetailsClient from "./DocumentDetailsClient";

export const metadata = {
  title: "Detalle de Documento | Strategic Connex",
};

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const resolvedParams = await params;

  let doc: any = null;
  let versions: any[] = [];
  let currentUser: any = null;

  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;

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
    ? (doc.profiles.first_name && doc.profiles.last_name 
        ? `${doc.profiles.first_name} ${doc.profiles.last_name}` 
        : (doc.profiles as any).full_name || 'Usuario desconocido')
    : 'Sistema';

  return (
    <DocumentDetailsClient 
      doc={doc} 
      versions={versions} 
      uploaderName={uploaderName} 
      currentUserId={currentUser?.id}
      orgId={doc.org_id}
    />

  );
}

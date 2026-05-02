import { createClient } from "@/utils/supabase/server";
import { getDocumentById, getDocumentVersions, type DocumentVersion } from "@/lib/services/documents";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import DocumentDetailsClient from "./DocumentDetailsClient";

export const metadata = {
  title: "Detalle de Documento | Strategic Connex",
};

interface DocumentRecord {
  id: string;
  title: string;
  code: string;
  category: string;
  status: string;
  current_version: number;
  file_url: string | null;
  expiry_date: string | null;
  created_at: string;
  org_id: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    full_name?: string | null;
  } | null;
}

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const resolvedParams = await params;

  let doc: DocumentRecord | null = null;
  let versions: DocumentVersion[] = [];

  const { data: { user } } = await supabase.auth.getUser();

  try {
    doc = await getDocumentById(supabase, resolvedParams.id) as DocumentRecord | null;
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
      : doc.profiles.full_name || 'Usuario desconocido')
    : 'Sistema';

  return (
    <DocumentDetailsClient
      doc={doc}
      versions={versions}
      uploaderName={uploaderName}
      currentUserId={user?.id ?? ''}
      orgId={doc.org_id}
    />
  );
}

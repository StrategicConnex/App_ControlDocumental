import { createClient } from "@/utils/supabase/server";
import { getDocuments } from "@/lib/services/documents";
import DocumentTable from "@/components/documents/DocumentTable";

export const metadata = {
  title: "Documentos | BordUp",
};

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // En un caso real, obtendríamos el orgId desde el perfil del usuario
  // const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user?.id).single();
  // const documents = await getDocuments(supabase, profile?.org_id);
  
  // Por ahora traemos todos los documentos accesibles según RLS
  let documents = [];
  try {
    documents = await getDocuments(supabase);
  } catch (e) {
    console.error("Error fetching documents", e);
  }

  // Transformar los datos de Supabase a la estructura que espera el componente
  const formattedDocs = documents.map((doc: any) => ({
    id: doc.id,
    title: doc.title,
    code: doc.code,
    category: doc.category,
    status: doc.status,
    version: doc.current_version,
    expiryDate: doc.expiry_date,
    uploadedBy: doc.profiles,
    createdAt: doc.created_at,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Gestión Documental</h1>
        <p className="text-sm text-gray-500">Administra todos los documentos de la organización.</p>
      </header>

      <DocumentTable documents={formattedDocs} />
    </div>
  );
}

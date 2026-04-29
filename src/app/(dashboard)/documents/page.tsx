import { createClient } from "@/utils/supabase/server";
import { getDocuments } from "@/lib/services/documents";
import DocumentTable from "@/components/documents/DocumentTable";

export const metadata = {
  title: "Documentos | Strategic Connex",
};

export default async function DocumentsPage() {
  const supabase = await createClient();
  await supabase.auth.getUser();
  
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
    approvalCount: doc.approvals?.[0]?.count || 0,
  }));

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Repositorio Documental</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administración centralizada de archivos, versiones y aprobaciones.
          </p>
        </div>
      </header>

      <DocumentTable documents={formattedDocs} />
    </div>
  );
}

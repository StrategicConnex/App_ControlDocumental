import { createClient } from "@/utils/supabase/server";
import { getDocuments } from "@/lib/services/documents";
import DocumentTable, { type DocumentProps } from "@/components/documents/DocumentTable";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedDocs: DocumentProps[] = documents.map((doc: any) => ({
    id: doc.id as string,
    title: doc.title as string,
    code: doc.code as string,
    category: doc.category as string,
    status: doc.status as DocumentProps['status'],
    version: doc.current_version as number,
    expiryDate: doc.expiry_date as string | null,
    uploadedBy: doc.profiles as DocumentProps['uploadedBy'],
    createdAt: doc.created_at as string,
    fileUrl: doc.file_url ?? undefined,
    approvalCount: (doc.approvals?.[0]?.count as number) || 0,
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

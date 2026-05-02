import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { uploadNewVersion } from "@/lib/services/documents";

export const dynamic = "force-dynamic";

/**
 * POST /api/documents/[id]/versions
 * Uploads a new version of a document with RBAC checks.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "Archivo requerido" },
                { status: 400 }
            );
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        // RBAC: Only admin, gestor, or owner can upload new versions
        const { data: profile } = await supabase
            .from("profiles")
            .select("role, org_id")
            .eq("id", user.id)
            .single();

        if (!profile || !["admin", "gestor", "owner"].includes(profile.role)) {
            return NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 });
        }

        // Verify document belongs to user's org
        const { data: doc } = await supabase
            .from("documents")
            .select("org_id, current_version")
            .eq("id", id)
            .single();

        if (!doc || doc.org_id !== profile.org_id) {
            return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
        }

        const publicUrl = await uploadNewVersion(
            supabase,
            id,
            file,
            user.id,
            doc.current_version || 1
        );

        return NextResponse.json({ success: true, fileUrl: publicUrl });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        console.error("Version upload error:", error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
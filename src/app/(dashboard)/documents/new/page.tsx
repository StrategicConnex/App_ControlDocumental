import NewDocumentClient from "./NewDocumentClient";
import { Suspense } from "react";

export const metadata = {
  title: "Nuevo Documento | Strategic Connex",
};

export default function NewDocumentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <NewDocumentClient />
    </Suspense>
  );
}

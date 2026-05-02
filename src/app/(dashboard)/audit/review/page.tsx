import ReviewClient from "./ReviewClient";
import { Suspense } from "react";

export const metadata = {
  title: "Revisión de Documentos | Strategic Connex",
};

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <ReviewClient />
    </Suspense>
  );
}

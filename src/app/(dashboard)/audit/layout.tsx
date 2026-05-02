import { checkRole } from "@/lib/middleware/rbac";

export default async function AuditRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect all /audit sub-routes
  await checkRole(['ADMIN', 'AUDITOR'], '/');

  return <>{children}</>;
}

import { checkRole } from "@/lib/middleware/rbac";

export default async function LegajosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // admin, operator manage legajos; auditor can view
  await checkRole(['admin', 'operator', 'auditor'], '/');

  return <>{children}</>;
}

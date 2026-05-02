import { checkRole } from "@/lib/middleware/rbac";

export default async function BudgetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // admin, operator can manage; auditor can view
  await checkRole(['ADMIN', 'MANAGER', 'AUDITOR'], '/');

  return <>{children}</>;
}

import { checkRole } from "@/lib/middleware/rbac";

export default async function VehiclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // admin, operator manage vehicles; auditor can view
  await checkRole(['admin', 'operator', 'auditor'], '/');

  return <>{children}</>;
}

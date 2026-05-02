import { checkRole } from "@/lib/middleware/rbac";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // STRICT: Only admin can access admin tools
  await checkRole(['admin'], '/');

  return <>{children}</>;
}

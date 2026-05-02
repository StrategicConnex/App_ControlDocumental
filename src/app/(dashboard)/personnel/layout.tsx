import { checkRole } from "@/lib/middleware/rbac";

export default async function PersonnelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only admin and operator should manage personnel
  await checkRole(['admin', 'operator'], '/');

  return <>{children}</>;
}

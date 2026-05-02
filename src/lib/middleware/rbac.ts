import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER' | 'AUDITOR' | 'PROVEEDOR';

export interface RBACConfig {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

/**
 * Middleware-like function to check user roles in Server Components.
 */
export async function checkRole(allowedRoles: UserRole[], redirectTo: string = '/dashboard') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = (profile?.role as string).toUpperCase() as UserRole || 'USER';

  if (!allowedRoles.includes(userRole)) {
    redirect(redirectTo);
  }

  return { user, userRole, profile };
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: ['*'],
  MANAGER: ['view_audit', 'view_compliance', 'view_documents', 'edit_documents', 'sign_documents', 'view_personnel', 'edit_personnel', 'view_vehicles', 'edit_vehicles', 'view_budgets', 'edit_budgets', 'use_ai'],
  AUDITOR: ['view_audit', 'view_compliance', 'view_documents', 'sign_documents', 'view_personnel', 'view_vehicles', 'use_ai'],
  USER: ['view_documents', 'view_personnel', 'view_vehicles'],
  PROVEEDOR: ['view_own_documents', 'upload_documents', 'view_assignments', 'view_documents']
};

/**
 * Checks if a user has a specific permission.
 */
export function hasPermission(role: UserRole, action: string): boolean {
  const allowedActions = ROLE_PERMISSIONS[role] || [];
  return allowedActions.includes('*') || allowedActions.includes(action);
}

/**
 * Checks if the current user has a specific permission (Server Side).
 */
export async function hasPermissionServer(action: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = (profile?.role as UserRole) || 'viewer';
  return hasPermission(userRole, action);
}
